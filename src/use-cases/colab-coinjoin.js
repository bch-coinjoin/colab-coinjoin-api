/*
  This library contains the business logic for participating in a collaborative
  coinjoin transaction.
*/

// Global npm libraries
const HdWallet = require('hd-cli-wallet')
const { v4: uuidv4 } = require('uuid')

// Local libraries
const config = require('../../config')
const CJPeers = require('../entities/cj-peer')

// Constants
const COINJOIN_PUBSUB_CHANNEL = config.coinjoinPubSubChan
const MIN_PLAYERS = config.minCoinJoinParticipants

class ColabCoinJoin {
  constructor (localConfig = {}) {
    // console.log('User localConfig: ', localConfig)
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of adapters must be passed in when instantiating CoinJoin Use Cases library.'
      )
    }

    // Encapsulate dependencies
    this.cjPeers = new CJPeers()
    this.hdWallet = new HdWallet()

    // Bind the 'this' object to subfunctions in this library.
    this.handleCoinJoinPubsub = this.handleCoinJoinPubsub.bind(this)

    // State
    this.maxSatsToCoinJoin = 0
    this.utxos = []
    this.peers = []

    // Node state - used to track the state of this node with regard to CoinJoins
    // The node has the following states:
    // inactive - Passively watching the pubsub channel, but not interacting.
    // soliciting - Broadcasting announcements on the CoinJoin pubsub channel,
    //              looking for other peers to CoinJoin with.
    // initiating - Organizing participants in a CoinJoin TX.
    // joining - Joining a CoinJoin initiated by another node.
    // tx-building - In the process of building a CoinJoin TX
    // broadcasting - Finalizing and broadcasting CoinJoin TX
    // canceling - canceling the CoinJoin TX and cleaning up state
    this.nodeState = 'inactive'
  }

  // Subscribes to the IPFS coinjoin pubsub channel. This overrides the default
  // handler used by ipfs-coord, and sets the handler to this library.
  async joinCoinJoinPubsub () {
    try {
      const ipfsCoord = this.adapters.ipfs.ipfsCoordAdapter.ipfsCoord
      const thisNode = ipfsCoord.thisNode

      // Unsubscribe the original pubsub subscription and handler
      await ipfsCoord.adapters.pubsub.ipfs.ipfs.pubsub.unsubscribe(
        COINJOIN_PUBSUB_CHANNEL,
        ipfsCoord.useCases.pubsub.coinjoinPubsubHandler
      )

      // Create a new subscription using the event handler for this library.
      await ipfsCoord.adapters.pubsub.subscribeToPubsubChannel(
        COINJOIN_PUBSUB_CHANNEL,
        this.handleCoinJoinPubsub,
        thisNode
      )
    } catch (err) {
      console.error('Error in joinCoinJoinPubsub()')
      throw err
    }
  }

  // Announces the node on the bch-coinjoin-001 pubsub channel so that other
  // peers can discover this node.
  async cjAnnounce () {
    try {
      // console.log('cjAnnounce(): this.adapters.ipfs.ipfsCoordAdapter.ipfsCoord', this.adapters.ipfs.ipfsCoordAdapter.ipfsCoord)
      const ipfsCoord = this.adapters.ipfs.ipfsCoordAdapter.ipfsCoord

      const thisNode = ipfsCoord.thisNode

      // Generate the announcement object.
      const announceObj = {
        ipfsId: thisNode.ipfsId,
        ipfsMultiaddrs: thisNode.ipfsMultiaddrs,
        bchAddr: thisNode.bchAddr,
        slpAddr: thisNode.slpAddr,
        publicKey: thisNode.publicKey,
        type: thisNode.type,
        minPlayers: MIN_PLAYERS,
        maxSats: this.maxSatsToCoinJoin
      }
      const msgStr = JSON.stringify(announceObj)
      console.log(`Broadcasted CoinJoin Announcement Object: ${JSON.stringify(announceObj, null, 2)}`)

      // Publish the announcement object to the coinjoin pubsub channel
      await ipfsCoord.adapters.pubsub.messaging.publishToPubsubChannel(
        COINJOIN_PUBSUB_CHANNEL,
        msgStr
      )
      console.log('Announced self on CoinJoin pubsub channel')

      return true
    } catch (err) {
      console.error('Error in cjAnnounce()')
      throw err
    }
  }

  // This handler is passed to the ipfs-coord library. It handles incoming messages
  // on the CoinJoin pubsub announcement channel.
  // As peer announcements come in on the CoinJoin pubsub channel, this handler
  // will read the message and update the state of the peers array.
  handleCoinJoinPubsub (announceObj) {
    try {
      console.log('handleCoinJoinPubsub() announceObj: ', announceObj)

      const peer = this.cjPeers.validate(announceObj.data)
      console.log(`peer: ${JSON.stringify(peer, null, 2)}`)

      // Try to find existing peer in the array
      const existingPeerIndex = this.peers.findIndex(x => x.ipfsId === peer.ipfsId)
      console.log('existingPeerIndex: ', existingPeerIndex)

      if (existingPeerIndex < 0) {
        // Add new peer to the array.
        this.peers.push(peer)
      } else {
        // Update existing peer.
        this.peers[existingPeerIndex] = peer
      }

      console.log('this.peers: ', this.peers)
      console.log('this.nodeState: ', this.nodeState)

      // If this node is actively soliciting other nodes, check
      // to see if enough of the right peers exist to initiate a CoinJoin TX.
      if (this.nodeState === 'soliciting') {
        // If the number of available peers is greater than the minimum.
        if (this.peers.length >= MIN_PLAYERS - 1) {
          console.log('...looking for acceptable peers...')
          const acceptablePeers = []

          // Loop through all the known peers and generate an array peers that
          // are acceptible for a CoinJoin TX.
          for (let i = 0; i < this.peers.length; i++) {
            const thisPeer = this.peers[i]

            // If this peer has a max BCH equal or less than this nodes max,
            // then it is acceptible to participate in a CoinJoin.
            if (thisPeer.maxSats <= this.maxSatsToCoinJoin) {
              acceptablePeers.push(thisPeer)
            }
          }
          console.log(`This acceptable peers found: ${JSON.stringify(acceptablePeers, null, 2)}`)

          // If enough acceptable peers have been discovered, then initiate
          // a CoinJoin transaction.
          if (acceptablePeers.length >= MIN_PLAYERS - 1) {
            this.initiateColabCoinJoin(acceptablePeers)
          }
        }
      }
    } catch (err) {
      console.error('Error in handleCoinJoinPubsub(): ', err)

      // Do not throw error. This is a top-level event handler.
      return false
    }
  }

  // This use case is called by the POST /wallet controller where the front end
  // passes in the UTXOs for a wallet. This changes the state of the node to
  // 'soliciting', where it begins to actively solicit other nodes to join it
  // in a CoinJoin transaction to consolidate UTXOs.
  async startCoinJoin (inObj) {
    try {
      console.log(`startCoinJoin() input object: ${JSON.stringify(inObj, null, 2)}`)

      const { bchUtxos } = inObj

      // Count the total number of sats in all UTXOs
      let totalSats = 0
      for (let i = 0; i < bchUtxos.length; i++) {
        const thisAddr = bchUtxos[i]

        for (let j = 0; j < thisAddr.bchUtxos.length; j++) {
          const thisUtxo = thisAddr.bchUtxos[j]

          totalSats += thisUtxo.value
        }
      }
      console.log(`totalSats: ${totalSats}`)

      // Update state
      this.maxSatsToCoinJoin = totalSats
      this.utxos = bchUtxos

      // Update the state of this node, to indicate that it is actively soliciting
      // for participants in a CoinJoin TX.
      this.nodeState = 'soliciting'

      return true
    } catch (err) {
      console.error('Error in use-cases/colab-coinjoin.js startCoinJoin()')
      throw err
    }
  }

  // This function is called by handleCoinJoinPubsub() when this node is actively
  // looking to join a CoinJoin tx and enough acceptable participates have been
  // found for this node to initiate a CoinJoin transaction.
  async initiateColabCoinJoin (peers) {
    try {
      console.log('initiateColabCoinJoin() with these peers: ', peers)

      // Generate a UUID for organizing the the CoinJoin.
      const newUuid = uuidv4()
      console.log('newUuid: ', newUuid)

      // Figure out the amount of BCH each participant should contribute. This
      // is the smallest maxSats found in the group.
      let satsRequired = 10000000
      for (let i = 0; i < peers.length; i++) {
        const thisPeer = peers[i]

        if (thisPeer.maxSats < satsRequired) {
          satsRequired = thisPeer.maxSats
        }
      }
      console.log('satsRequired: ', satsRequired)

      // Compile an object to send to each peer.
      const groupObj = {
        msgType: 'colab-coinjoin-init',
        uuid: newUuid,
        requiredSats: satsRequired
      }
      console.log('groupObj: ', groupObj)

      // Get handles on parts of ipfs-coord library.
      const ipfsCoord = this.adapters.ipfs.ipfsCoordAdapter.ipfsCoord
      const pubsubAdapter = ipfsCoord.adapters.pubsub
      const thisNode = ipfsCoord.thisNode

      // Send the init message to each peer.
      for (let i = 0; i < peers.length; i++) {
        const thisPeer = peers[i]

        // await pubsubAdapter.messaging.publishToPubsubChannel(thisPeer.ipfsId, groupObj)
        await pubsubAdapter.messaging.sendMsg(thisPeer.ipfsId, groupObj, thisNode)
      }
    } catch (err) {
      console.error('Error in use-cases/colab-coinjoin.js initiateColabCoinJoin()')
      throw err
    }
  }
}

module.exports = ColabCoinJoin

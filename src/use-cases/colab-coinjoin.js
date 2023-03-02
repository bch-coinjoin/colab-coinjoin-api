/*
  This library contains the business logic for participating in a collaborative
  coinjoin transaction.
*/

// Global npm libraries
const HdWallet = require('hd-cli-wallet')
// console.log('HdWallet: ', HdWallet)

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
    this.maxBchToCoinJoin = 0
    this.utxos = []
    this.peers = []
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
        maxBch: this.maxBchToCoinJoin
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
    } catch (err) {
      console.error('Error in handleCoinJoinPubsub(): ', err)

      // Do not throw error. This is a top-level event handler.
      return false
    }
  }

  // This use case is called by the POST /wallet controller where the front end
  // passes in the UTXOs for a wallet. This then kicks off a Collaborative
  // CoinJoin session to consolidate the UTXOs in that wallet.
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
      this.maxBchToCoinJoin = totalSats
      this.utxos = bchUtxos

      return true
    } catch (err) {
      console.error('Error in use-cases/colab-coinjoin.js startCoinJoin()')
      throw err
    }
  }
}

module.exports = ColabCoinJoin

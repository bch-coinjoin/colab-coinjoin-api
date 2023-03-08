/*
  This library contains the business logic for participating in a collaborative
  coinjoin transaction.
*/

// Global npm libraries
const HdWallet = require('hd-cli-wallet')
const { v4: uuidv4 } = require('uuid')
const jsonrpc = require('jsonrpc-lite')

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
    this.hdWallet = new HdWallet({ restURL: 'https://bch-consumer-anacortes-wa-usa.fullstackcash.nl' })
    this.jsonrpc = jsonrpc

    // Bind the 'this' object to subfunctions in this library.
    this.handleCoinJoinPubsub = this.handleCoinJoinPubsub.bind(this)
    this.rpcHandler = this.rpcHandler.bind(this)

    // State
    this.maxSatsToCoinJoin = 0
    this.utxos = []
    this.peers = []
    this.rpcDataQueue = [] // A queue for holding RPC data that has arrived.
    this.mnemoinc = ''
    this.walletObj = {} // Wallet object for this node. Populated when a peer

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

      const { bchUtxos, mnemonic } = inObj

      // Save the mnemonic to the state of this library, so that it can be used
      // in downstream functions of the CoinJoin workflow
      this.mnemonic = mnemonic

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
      const rpcData = {
        msgType: 'colab-coinjoin-init',
        uuid: newUuid,
        requiredSats: satsRequired,
        endpoint: 'initiate'
      }
      console.log('rpcData: ', rpcData)

      const rpcId = uuidv4()

      // Generate a JSON RPC command.
      const cmd = this.jsonrpc.request(rpcId, 'ccoinjoin', rpcData)
      const cmdStr = JSON.stringify(cmd)
      console.log('cmdStr: ', cmdStr)

      // Get handles on parts of ipfs-coord library.
      const ipfsCoord = this.adapters.ipfs.ipfsCoordAdapter.ipfsCoord
      // const pubsubAdapter = ipfsCoord.adapters.pubsub
      const thisNode = ipfsCoord.thisNode
      // const encryptionAdapter = ipfsCoord.adapters.encryption

      const peerCoinJoinData = []

      // Send the init message to each peer.
      for (let i = 0; i < peers.length; i++) {
        const thisPeer = peers[i]

        try {
          // Send the RPC command to selected wallet service.
          await ipfsCoord.useCases.peer.sendPrivateMessage(
            thisPeer.ipfsId,
            cmdStr,
            thisNode
          )
        } catch (err) {
          console.log(`Could not find data for peer ${thisPeer.ipfsId}, skipping.`)
          break

          // Dev Note: The idea here is that if there is no connection data to send
          // private messages to a peer in the group, then abort the CoinJoin
          // init attempt. I think that's the best strategy for now.
        }

        console.log('Waiting for rpc data....')

        // Wait for data to come back from the wallet service.
        const data = await this.waitForRPCResponse(rpcId)
        console.log('...returned rpc data: ', data)

        const message = data.message

        // Exit if a peer is already occupied in another coinjoin session.
        if (typeof (message) === 'string' && message.includes('already underway')) {
          console.log('Peer is already in a CoinJoin. Skipping.')
          return false
        }

        // Get the data from the peer needed to include them in the CoinJoin.
        const { coinjoinUtxos, outputAddr, changeAddr } = message

        // Add up the total sats in the peers UTXOs, make sure they meet or
        // exceed the minimum sats required.
        let totalSats = 0
        coinjoinUtxos.map(x => { totalSats += x.value; return false })
        if (totalSats < satsRequired) {
          throw new Error(`Peer ${thisPeer.ipfsId} returned UTXOs that total to ${totalSats} sats, which is less than the required ${satsRequired} sats`)
        }

        // Add it to the peer data we already have.
        thisPeer.coinjoinUtxos = coinjoinUtxos
        thisPeer.outputAddr = outputAddr
        thisPeer.changeAddr = changeAddr

        peerCoinJoinData.push(thisPeer)
      }

      // console.log('peerCoinJoinData: ', JSON.stringify(peerCoinJoinData, null, 2))

      await this.buildCoinJoinTx({ peerCoinJoinData, satsRequired })
    } catch (err) {
      console.error('Error in use-cases/colab-coinjoin.js initiateColabCoinJoin()')
      throw err
    }
  }

  // This function compiles all peer data into an unsigned CoinJoin transaction.
  async buildCoinJoinTx (inObj = {}) {
    try {
      console.log(`buildCoinJoinTx() inObj: ${JSON.stringify(inObj, null, 2)}`)

      const { peerCoinJoinData, satsRequired } = inObj

      // Get the state for this wallet. This wallet state is set in the
      // startCoinJoin() function.
      const totalSats = this.maxSatsToCoinJoin
      const myUtxos = this.utxos
      console.log('totalSats: ', totalSats)
      console.log(`myUtxos: ${JSON.stringify(myUtxos, null, 2)}`)

      // Generate the wallet object for this node.
      const walletObj = await this.hdWallet.createWallet.generateWalletObj({ mnemonic: this.mnemonic })

      // Generate an output and change address for this node.
      // TODO: the nextAddress is not reliably tracked. Some way of accurately tracking it is required.
      let outputAddr = await this.hdWallet.util.generateAddress(walletObj, walletObj.nextAddress, 1)
      outputAddr = outputAddr[0]
      console.log('this nodes outputAddr: ', outputAddr)

      // Generate a change address
      let changeAddr = await this.hdWallet.util.generateAddress(walletObj, walletObj.nextAddress + 1, 1)
      changeAddr = changeAddr[0]
      console.log('this nodes changeAddr: ', changeAddr)

      // Combine all the peer UTXOs, output addresses, and change addresses
      // into a single array
      let utxos = []
      const outputAddrs = []
      const changeAddrs = []
      for (let i = 0; i < peerCoinJoinData.length; i++) {
        const thisPeer = peerCoinJoinData[i]

        utxos = utxos.concat(thisPeer.coinjoinUtxos)

        outputAddrs.push(thisPeer.outputAddr)

        // Calculate the change for this peer
        let peerTotalSats = 0
        thisPeer.coinjoinUtxos.map(x => { peerTotalSats += x.satoshis; return false })
        // Add a little bit of randomness by charging a random amount between
        // 546 to 2000 sats for a tx fee
        let change = peerTotalSats - satsRequired - Math.floor(2000 * Math.random())
        if (change < 546) {
          change = 0 // Signal that there is no change
        }

        changeAddrs.push({
          changeAddr: thisPeer.changeAddr,
          changeSats: change
        })
      }

      // Add this nodes own UTXOs to the list
      for (let i = 0; i < myUtxos.length; i++) {
        utxos = utxos.concat(myUtxos[i].bchUtxos)
      }

      // Calculate the change going to this wallet.
      let myChange = totalSats - satsRequired - Math.floor(2000 * Math.random())
      if (myChange < 546) {
        myChange = 0
      }

      // Add this nodes output and change addr
      outputAddrs.push(outputAddr)
      changeAddrs.push({
        changeAddr,
        changeSats: myChange
      })

      const hex = this.adapters.coinjoin.createTransaction({ utxos, outputAddrs, changeAddrs, satsRequired })
      console.log('hex: ', hex)
    } catch (err) {
      console.error('Error in buildCoinJoinTx()')
      throw err
    }
  }

  // Returns a promise that resolves to data when the RPC response is recieved.
  async waitForRPCResponse (rpcId) {
    try {
      // Initialize variables for tracking the return data.
      let dataFound = false
      let cnt = 0

      // Default return value, if the remote computer does not respond in time.
      let data = {
        success: false,
        message: 'request timed out',
        data: ''
      }

      // Loop that waits for a response from the service provider.
      do {
        // console.log(`this.rpcDataQueue.length: ${this.rpcDataQueue.length}`)
        for (let i = 0; i < this.rpcDataQueue.length; i++) {
          const rawData = this.rpcDataQueue[i]
          // console.log(`rawData: ${JSON.stringify(rawData, null, 2)}`)

          if (rawData.payload.id === rpcId) {
            dataFound = true
            // console.log('data was found in the queue')

            // console.log(
            //   `rawData.payload: ${JSON.stringify(rawData.payload, null, 2)}`
            // )
            data = rawData.payload.result.value

            // Remove the data from the queue
            this.rpcDataQueue.splice(i, 1)

            break
          }
        }

        // Wait between loops.
        // await this.sleep(1000)
        await this.sleep(2000)

        cnt++

        // Exit if data was returned, or the window for a response expires.
      } while (!dataFound && cnt < 60) // 60 * 2 seconds = 2 minutes
      // console.log(`dataFound: ${dataFound}, cnt: ${cnt}`)

      return data
    } catch (err) {
      console.error('Error in waitForRPCResponse()')
      throw err
    }
  }

  // This handler is triggered when RPC data comes in over IPFS.
  // Handle RPC input, and add the response to the RPC queue.
  // Once in the queue, it will get processed by waitForRPCResponse()
  rpcHandler (data) {
    try {
      // Convert string input into an object.
      // const jsonData = JSON.parse(data)

      console.log(`JSON RPC response for ID ${data.payload.id} received.`)

      this.rpcDataQueue.push(data)
    } catch (err) {
      console.error('Error in rest-api.js/rpcHandler(): ', err)
      // Do not throw error. This is a top-level function.
    }
  }

  sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // This is a JSON RPC handler that is called when another peer tries to initiate
  // a CoinJoin transaction with this node.
  async handleInitRequest (rpcData) {
    try {
      console.log(`handleInitRequest() started with this rpcData: ${JSON.stringify(rpcData, null, 2)}`)

      const { msgType, uuid, requiredSats, endpoint } = rpcData.payload.params
      console.log(`msgType: ${msgType}`)
      console.log(`uuid: ${uuid}`)
      console.log(`requiredSats: ${requiredSats}`)
      console.log(`endpoint: ${endpoint}`)
      // UUID is the CoinJoin UUID that is used in the response to the initator.

      console.log('mnemonic: ', this.mnemonic)

      // Generate the wallet object
      let walletObj = await this.hdWallet.createWallet.generateWalletObj({ mnemonic: this.mnemonic })

      walletObj = await this.hdWallet.updateBalance.updateWallet(walletObj)
      console.log('walletUtxoData: ', JSON.stringify(walletObj, null, 2))

      const coinjoinUtxos = this.hdWallet.utxos.selectCoinJoinUtxos(requiredSats, walletObj.bchUtxos)
      console.log('coinjoinUtxos: ', JSON.stringify(coinjoinUtxos, null, 2))

      // Sum the total sats from all selected UTXOs
      let totalSats = 0
      coinjoinUtxos.map(x => { totalSats += x.satoshis; return false })

      // If the UTXOs do not total up to required amount, reject the petition
      // because this node is not able to participate.
      if (totalSats < requiredSats) {
        return { success: false }
      }

      // Generate new output address
      let outputAddr = await this.hdWallet.util.generateAddress(walletObj, walletObj.nextAddress, 1)
      outputAddr = outputAddr[0]
      console.log('outputAddr: ', outputAddr)

      // Generate a change address
      let changeAddr = await this.hdWallet.util.generateAddress(walletObj, walletObj.nextAddress + 1, 1)
      changeAddr = changeAddr[0]
      console.log('changeAddr: ', changeAddr)

      // Compile an output object to return to the peer initiating the CoinJoin
      const outObj = {
        coinjoinUtxos,
        outputAddr,
        changeAddr,
        success: true
      }

      return outObj
    } catch (err) {
      console.error('Error in use-cases/colab-coinjoin.js/handleInitRequest(): ', err)
      return { success: false }
    }
  }
}

module.exports = ColabCoinJoin

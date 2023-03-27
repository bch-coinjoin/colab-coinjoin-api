/*
  This library contains the business logic for participating in a collaborative
  coinjoin transaction.
*/

// Global npm libraries
const HdWallet = require('hd-cli-wallet')
const { v4: uuidv4 } = require('uuid')
const jsonrpc = require('jsonrpc-lite')
const Bitcoin = require('@psf/bitcoincashjs-lib')
const BchWallet = require('minimal-slp-wallet')

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
    // this.wallet = new BchWallet(undefined, { interface: 'consumer-api' })

    // Bind the 'this' object to subfunctions in this library.
    this.handleCoinJoinPubsub = this.handleCoinJoinPubsub.bind(this)
    this.rpcHandler = this.rpcHandler.bind(this)
    this.combineSigs = this.combineSigs.bind(this)

    // State
    this.maxSatsToCoinJoin = 0
    this.utxos = [] // The UTXOs controlled by this peer.
    this.peers = []
    this.coordinator = null // Will hold IPFS ID of coordinating peer
    this.rpcDataQueue = [] // A queue for holding RPC data that has arrived.
    this.mnemoinc = ''
    this.walletObj = {} // Wallet object for this node. Populated when a peer...
    this.unsignedTxData = null // Holds unsigned TX to pass back to wallet
    this.psTxs = [] // Will hold partially-signed TXs
    this.txObj = {} // Will hold transaction information about the coinjoin TX
    this.outputAddr = '' // The CoinJoin output address for this peer
    this.changeAddr = '' // The CoinJoin change address for this peer

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
  // This function is called during startup.
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

      return true
    } catch (err) {
      console.error('Error in joinCoinJoinPubsub()')
      throw err
    }
  }

  // Announces the node on the bch-coinjoin-001 pubsub channel so that other
  // peers can discover this node.
  // This function is called periodically by the timer controller.
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

  // This use case is called by the POST /wallet controller where the front end
  // passes in the UTXOs for a wallet. This changes the state of the node to
  // 'soliciting', where it begins to actively solicit other nodes to join it
  // in a CoinJoin transaction to consolidate UTXOs.
  async startCoinJoin (inObj) {
    try {
      console.log(`startCoinJoin() input object: ${JSON.stringify(inObj, null, 2)}`)

      // const { bchUtxos, mnemonic } = inObj
      const { bchUtxos, outputAddr, changeAddr } = inObj

      // Save the mnemonic to the state of this library, so that it can be used
      // in downstream functions of the CoinJoin workflow
      // this.mnemonic = mnemonic

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
      this.outputAddr = outputAddr
      this.changeAddr = changeAddr

      // Update the state of this node, to indicate that it is actively soliciting
      // for participants in a CoinJoin TX.
      this.nodeState = 'soliciting'

      return true
    } catch (err) {
      console.error('Error in use-cases/colab-coinjoin.js startCoinJoin()')
      throw err
    }
  }

  // This handler is passed to the ipfs-coord library. It handles incoming messages
  // on the CoinJoin pubsub announcement channel.
  // As peer announcements come in on the CoinJoin pubsub channel, this handler
  // will read the message and update the state of the peers array.
  async handleCoinJoinPubsub (announceObj) {
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
            // This peer (self) is the coordinator. Set the state.
            const ipfsCoord = this.adapters.ipfs.ipfsCoordAdapter.ipfsCoord
            const thisNode = ipfsCoord.thisNode
            this.coordinator = thisNode.ipfsId

            // Coordinate with peers to generate an unsigned CoinJoin TX
            const { hex, cjUuid } = await this.initiateColabCoinJoin(acceptablePeers)
            console.log('Ready to pass unsigned CoinJoin TX to each participant to collect signatures.')
            console.log('hex: ', hex)

            const unsignedHex = hex
            const cjPeers = acceptablePeers
            const signedHex = await this.collectSignatures({ cjPeers, unsignedHex, cjUuid })
            console.log('signedHex: ', signedHex)
          }
        }
      }
    } catch (err) {
      console.error('Error in handleCoinJoinPubsub(): ', err)

      // Do not throw error. This is a top-level event handler.
      return false
    }
  }

  // This function is called after peers have coordinated to share UTXOs and
  // generate an unsigned CoinJoin TX. This function calls the JSON RPC endpoint
  // for each peer to pass the unsigned TX and collect a partially signed TX.
  // It then compiles all the partially signed TXs in to a single, fully-signed
  // TX and broadcasts it to the network.
  async collectSignatures (inObj = {}) {
    try {
      console.log('Starting collectSignatures()...')

      const { cjPeers, unsignedHex, cjUuid } = inObj

      // TODO input validation

      // Prepare the UTXOs for this coordinating peer. Reformat them in a way
      // that the wallet client expects them.
      const coinjoinUtxos = []
      for (let i = 0; i < this.utxos.length; i++) {
        const thisAddr = this.utxos[i]

        // Loop through each UTXO in the array
        for (let j = 0; j < thisAddr.bchUtxos.length; j++) {
          const thisUtxo = thisAddr.bchUtxos[j]

          thisUtxo.hdIndex = thisAddr.hdIndex
          thisUtxo.satoshis = thisUtxo.value

          coinjoinUtxos.push(thisUtxo)
        }
      }

      // Save the data for this coordinating peer
      const ipfsCoord = this.adapters.ipfs.ipfsCoordAdapter.ipfsCoord
      const thisNode = ipfsCoord.thisNode
      let rpcData = {
        peerData: {
          ipfsId: thisNode.ipfsId,
          coinjoinUtxos
        },
        cjUuid,
        unsignedHex,
        msgType: 'colab-coinjoin-sign',
        endpoint: 'sign'
      }
      this.unsignedTxData = rpcData
      console.log('Coordinating peers unsignedTxData: ', JSON.stringify(rpcData, null, 2))

      console.log('cjPeers: ', JSON.stringify(cjPeers, null, 2))

      // Loop through each peer and make a JSON RPC call to each /sign endpoint.
      for (let i = 0; i < cjPeers.length; i++) {
        const thisPeer = cjPeers[i]
        console.log('thisPeer: ', JSON.stringify(thisPeer, null, 2))

        rpcData = {
          peerData: thisPeer,
          cjUuid,
          unsignedHex,
          msgType: 'colab-coinjoin-sign',
          endpoint: 'sign'
        }
        console.log('peer rpcData: ', JSON.stringify(rpcData, null, 2))

        const rpcId = uuidv4()

        // Generate a JSON RPC command.
        const cmd = this.jsonrpc.request(rpcId, 'ccoinjoin', rpcData)
        const cmdStr = JSON.stringify(cmd)
        console.log('cmdStr: ', cmdStr)

        // Get handles on parts of ipfs-coord library.
        const ipfsCoord = this.adapters.ipfs.ipfsCoordAdapter.ipfsCoord
        const thisNode = ipfsCoord.thisNode

        try {
          // Send the RPC command to selected peer.
          await ipfsCoord.useCases.peer.sendPrivateMessage(
            thisPeer.ipfsId,
            cmdStr,
            thisNode
          )
        } catch (err) {
          console.log(`collectSignatures(): Could not find data for peer ${thisPeer.ipfsId}, skipping.`)
          break

          // Dev Note: The idea here is that if there is no connection data to send
          // private messages to a peer in the group, then abort the CoinJoin
          // attempt. I think that's the best strategy for now.
          // At some point, there will need to be a cache (array) of pending
          // CJ transactions, and a garbage collector to clean up aborted sessions.
        }

        console.log('Waiting for rpc data....')

        // Wait for data to come back from the wallet service.
        const data = await this.waitForRPCResponse(rpcId)
        console.log('...returned rpc data: ', data)

        // const message = data.message
      }
    } catch (err) {
      console.error('Error in collectSignatures()')
      throw err
    }
  }

  // This is a JSON RPC handler. It's called by the /sign JSON RPC endpoint.
  // The RPC data
  // should contain an unsigned TX. This peer signs its inputs and outputs and
  // passes the partially-signed TX back to the organizer.
  async signTx (rpcData) {
    try {
      console.log(`signTx() started with this rpcData: ${JSON.stringify(rpcData, null, 2)}`)

      // Save the unsigned transaction data to the state of this library.
      // The client wallet will poll a REST API endpoint that retrieves this
      // data.
      this.unsignedTxData = rpcData.payload.params
    } catch (err) {
      console.error('Error in use-cases/colab-coinjoin.js/signTx(): ', err)
      return { success: false }
    }
  }

  // This function is called by handleCoinJoinPubsub() when this node is actively
  // looking to join a CoinJoin tx and enough acceptable participates have been
  // found for this node to initiate a CoinJoin transaction.
  // The node executing this code becomes the 'coordinating peer'
  async initiateColabCoinJoin (peers) {
    try {
      console.log('----> This peer is now the coordinating peer <----')
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
        console.log('...returned rpc data: ', JSON.stringify(data, null, 2))

        const message = data.message
        console.log(`message: ${JSON.stringify(message, null, 2)}`)

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

      const hex = await this.buildCoinJoinTx({ peerCoinJoinData, satsRequired })

      const cjUuid = newUuid

      return { hex, cjUuid }
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

      const outputAddr = this.outputAddr
      const changeAddr = this.changeAddr

      // Combine all the peer UTXOs, output addresses, and change addresses
      // into a single array
      let utxos = []
      const outputAddrs = []
      const changeAddrs = []
      for (let i = 0; i < peerCoinJoinData.length; i++) {
        const thisPeer = peerCoinJoinData[i]
        console.log(`thisPeer: ${JSON.stringify(thisPeer, null, 2)}`)

        utxos = utxos.concat(thisPeer.coinjoinUtxos)

        outputAddrs.push(thisPeer.outputAddr)

        // Calculate the change for this peer
        let peerTotalSats = 0
        thisPeer.coinjoinUtxos.map(x => { peerTotalSats += x.satoshis; return false })
        // Add a little bit of randomness by charging a random amount between
        // 546 to 2000 sats for a tx fee
        let change = peerTotalSats - satsRequired - 5000 - Math.floor(2000 * Math.random())
        if (change < 546) {
          change = 0 // Signal that there is no change
        }
        const fee = peerTotalSats - change
        console.log(`Peer ${i} has total sats of ${peerTotalSats}, paying a tx fee of ${fee}, and getting ${change} sats in change.`)

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

      const { hex, txObj } = this.adapters.coinjoin.createTransaction({
        utxos,
        outputAddrs,
        changeAddrs,
        satsRequired
      })
      console.log('hex: ', hex)

      this.txObj = txObj

      return hex
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

      const potentialCoordinator = rpcData.from

      // console.log('mnemonic: ', this.mnemonic)

      // Generate the wallet object
      // let walletObj = await this.hdWallet.createWallet.generateWalletObj({ mnemonic: this.mnemonic })

      // walletObj = await this.hdWallet.updateBalance.updateWallet(walletObj)
      // console.log('walletUtxoData: ', JSON.stringify(walletObj, null, 2))

      const coinjoinUtxos = this.hdWallet.utxos.selectCoinJoinUtxos(requiredSats, this.utxos)
      console.log('coinjoinUtxos: ', JSON.stringify(coinjoinUtxos, null, 2))

      // const coinjoinUtxos = this.utxos

      // Sum the total sats from all selected UTXOs
      let totalSats = 0
      coinjoinUtxos.map(x => { totalSats += x.satoshis; return false })

      // If the UTXOs do not total up to required amount, reject the petition
      // because this node is not able to participate.
      if (totalSats < requiredSats) {
        return { success: false }
      }

      // Generate new output address
      // let outputAddr = await this.hdWallet.util.generateAddress(walletObj, walletObj.nextAddress, 1)
      // outputAddr = outputAddr[0]
      // console.log('outputAddr: ', outputAddr)

      const outputAddr = this.outputAddr

      // Generate a change address
      // let changeAddr = await this.hdWallet.util.generateAddress(walletObj, walletObj.nextAddress + 1, 1)
      // changeAddr = changeAddr[0]
      // console.log('changeAddr: ', changeAddr)
      const changeAddr = this.changeAddr

      // Compile an output object to return to the peer initiating the CoinJoin
      const outObj = {
        coinjoinUtxos,
        outputAddr,
        changeAddr,
        success: true
      }

      // Update the state to reflect the coordinating peer
      this.coordinator = potentialCoordinator

      return outObj
    } catch (err) {
      console.error('Error in use-cases/colab-coinjoin.js/handleInitRequest(): ', err)
      return { success: false }
    }
  }

  // This function is called by a REST API, initiated by the wallet client. It
  // passes a partially signed CoinJoin transaction to this app. This app then
  // passes the TX to the coordinator via the JSON RPC.
  async sendPartiallySignedTx (inObj = {}) {
    try {
      console.log('sendPartiallySignedTx() executed with this input object: ', JSON.stringify(inObj, null, 2))
      console.log(`Coordinating peer: ${this.coordinator}`)

      const { psHex, signedUtxos } = inObj

      // TODO input validation

      // Get handles on parts of ipfs-coord library.
      const ipfsCoord = this.adapters.ipfs.ipfsCoordAdapter.ipfsCoord
      const thisNode = ipfsCoord.thisNode
      const thisPeerId = thisNode.ipfsId

      // If this function is called by the coordinating peer, then don't send
      // an RPC command. Instead just add the data to the psTxs state array.
      if (thisPeerId === this.coordinator) {
        this.psTxs.push({
          peerId: thisPeerId,
          psHex: inObj.psHex,
          signedUtxos
        })
        console.log('Added coordinating peers partially signed transaction to psTxs array.')

        // Call the combineSigs function to see if it is ready to combine the
        // the partially signed transactions.
        await this.combineSigs({
          peerId: thisPeerId,
          psHex: inObj.psHex
        })

        return
      }

      // console.log('cjPeers: ', JSON.stringify(cjPeers, null, 2))

      // Loop through each peer and make a JSON RPC call to each /sign endpoint.
      // for (let i = 0; i < cjPeers.length; i++) {
      // const thisPeer = cjPeers[i]

      const rpcData = {
        psHex,
        signedUtxos,
        msgType: 'colab-coinjoin-pstx',
        endpoint: 'pstx'
      }

      const rpcId = uuidv4()

      // Generate a JSON RPC command.
      const cmd = this.jsonrpc.request(rpcId, 'ccoinjoin', rpcData)
      const cmdStr = JSON.stringify(cmd)
      console.log('cmdStr: ', cmdStr)

      try {
        // Send the RPC command to selected peer.
        await ipfsCoord.useCases.peer.sendPrivateMessage(
          this.coordinator,
          cmdStr,
          thisNode
        )
      } catch (err) {
        throw new Error(`sendPartiallySignedTx(): Could not find data for coordinator peer ${this.coordinator}, skipping.`)
        // b

        // Dev Note: This code block should not be necessary?
      }

      console.log('Waiting for rpc data....')

      // Wait for data to come back from the wallet service.
      const data = await this.waitForRPCResponse(rpcId)
      console.log('...sendPartiallySignedTx() returned rpc data: ', data)

      // const message = data.message
      // }

      return { success: true }
    } catch (err) {
      console.error('Error in sendPartiallySignedTx(): ', err)
      throw err
    }
  }

  // Add any partially-signed transactions (PSTX) to an array. Once all peers
  // have returned their PSTX, combine them into a fully signed tx, and
  // broadcast it.
  async combineSigs (inObj = {}) {
    try {
      console.log('Starting combineSigs() ...')

      // const { peerId, psHex } = inObj

      const thisPeer = inObj.peerId

      // Add the partially signed TX to the array.
      const peerExists = this.psTxs.find(x => x.peerId === thisPeer)
      if (!peerExists) {
        this.psTxs.push(inObj)
      }

      console.log('this.unsignedTxData: ', this.unsignedTxData)
      console.log('this.peers: ', this.peers)
      console.log('this.psTxs: ', this.psTxs)

      // If all peers have returned their partially-signed TXs, (including the
      // coordinating peer), then combine
      // them into a single transaction and broadcast it.
      if ((this.peers.length + 1) === this.psTxs.length) {
        const txHex = this.createFullySignedTx({
          unsignedTxData: this.unsignedTxData,
          peers: this.peers,
          psTxs: this.psTxs,
          txObj: this.txObj
        })
        console.log('Fully-signed txHex: ', txHex)

        // Broadcast the CoinJoin transaction to the BCH network.
        const wallet = new BchWallet(undefined, { interface: 'consumer-api' })
        const txid = await wallet.broadcast(txHex)
        console.log(`CoinJoin TX broadcast with this txid: ${txid}`)
      } else {
        console.log('Not all partially signed transaction have been collected. Can not generate final transaction.')
      }
    } catch (err) {
      console.error('Error in combineSigs(): ', err)
      throw err
    }
  }

  // This function is called once all the partially signed transactions from all
  // peers have been collected. In combines the partially signed transactions
  // into a fully-signed transaction and returns it in hex format.
  createFullySignedTx (inObj = {}) {
    try {
      const { unsignedTxData, psTxs, txObj } = inObj
      // console.log(`unsignedTxData: ${JSON.stringify(unsignedTxData, null, 2)}`)
      // console.log(`peers: ${JSON.stringify(peers, null, 2)}`)
      // console.log(`psTxs: ${JSON.stringify(psTxs, null, 2)}`)
      // console.log('txObj: ', JSON.stringify(txObj, null, 2))

      // Convert the unsigned transaction from hex to a buffer, and then to an object.
      const unsignedTxBuffer = Buffer.from(unsignedTxData.unsignedHex, 'hex')
      const unsignedTxObj = Bitcoin.Transaction.fromBuffer(unsignedTxBuffer)
      // console.log(`unsignedTxObj: ${JSON.stringify(unsignedTxObj, null, 2)}`)

      // Loop through each input of the unsigned transaction and replace them
      // with signed inputs from the peers
      // for (let i = 0; i < unsignedTxObj.ins.length; i++) {
      for (let i = 0; i < txObj.inputUtxos.length; i++) {
        // console.log(`i: ${i}`)
        let inputFound = false

        // const thisIn = unsignedTxObj.ins[i]
        const thisIn = txObj.inputUtxos[i]

        // Loop through the signed UTXOs from each peer, and find a match for
        // the current input.
        for (let j = 0; j < psTxs.length; j++) {
          // console.log(`j: ${j}`)
          const thisPeer = psTxs[j]

          if (inputFound) break

          // Loop through each signed UTXO returned by this peer
          for (let k = 0; k < thisPeer.signedUtxos.length; k++) {
            // console.log(`k: ${k}`)
            const thisUtxo = thisPeer.signedUtxos[k]

            // console.log(`thisUtxo.tx_hash: ${thisUtxo.tx_hash}, thisUtxo.tx_pos: ${thisUtxo.tx_pos}`)
            // console.log(`thisIn.tx_hash: ${thisIn.tx_hash}, thisIn.tx_pos: ${thisIn.tx_pos}`)

            // If a matching signed input is found, then replace the unsigned
            // tx input with the signed tx input.
            if (thisUtxo.tx_hash === thisIn.tx_hash && thisUtxo.tx_pos === thisIn.tx_pos) {
              // console.log('matching UTXO found')

              // Convert this peers partially-signed transaction into a tx object.
              const psTxBuffer = Buffer.from(thisPeer.psHex, 'hex')
              const psTxObj = Bitcoin.Transaction.fromBuffer(psTxBuffer)

              // Replace the unsigned input with the signed input.
              unsignedTxObj.ins[i].script = psTxObj.ins[i].script

              // console.log(`input ${i} replaced by peer ${j} and utxo ${k}`)
              inputFound = true
              break
            }
          }
        }
      }

      // At this point, the unsigned transaction object should have fully-signed
      // inputs.
      const transactionBuilder = Bitcoin.TransactionBuilder.fromTransaction(
        unsignedTxObj,
        'mainnet'
      )

      // build tx
      const tx = transactionBuilder.build()
      // output rawhex
      const txHex = tx.toHex()

      return txHex
    } catch (err) {
      console.error('Error in createFullySignedTx(): ', err)
      throw err
    }
  }
}

module.exports = ColabCoinJoin

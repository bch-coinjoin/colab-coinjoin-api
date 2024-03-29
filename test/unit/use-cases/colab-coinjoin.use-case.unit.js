/*
  Use case unit tests for the colab-coinjoin.js use case library
*/

// Public npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const cloneDeep = require('lodash.clonedeep')

// Unit under test (uut)
const ColabCoinJoinLib = require('../../../src/use-cases/colab-coinjoin')
const adapters = require('../mocks/adapters')
const coinjoinMocksLib = require('../mocks/use-cases/colab-coinjoin-mocks')

describe('#colab-coinjoin-use-case', () => {
  let uut
  let sandbox
  let coinjoinMocks

  beforeEach(() => {
    sandbox = sinon.createSandbox()

    uut = new ColabCoinJoinLib({ adapters })

    coinjoinMocks = cloneDeep(coinjoinMocksLib)
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if adapters are not passed in', () => {
      try {
        uut = new ColabCoinJoinLib()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of adapters must be passed in when instantiating CoinJoin Use Cases library.'
        )
      }
    })
  })

  describe('#joinCoinJoinPubsub', () => {
    it('should join the coinjoin pubsub channel', async () => {
      const result = await uut.joinCoinJoinPubsub()

      assert.equal(result, true)
    })

    it('should catch, report, and throw errors', async () => {
      try {
        // Force an error
        sandbox.stub(uut.adapters.ipfs.ipfsCoordAdapter.ipfsCoord.adapters.pubsub.ipfs.ipfs.pubsub, 'unsubscribe').rejects(new Error('test error'))

        await uut.joinCoinJoinPubsub()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#cjAnnounce', () => {
    it('should announce itself on the CoinJoin pubsub channel', async () => {
      // Mock dependencies and force desired code path
      // sandbox.stub(uut.adapters.ipfs.ipfsCoordAdapter.ipfsCoord.adapters.pubsub.messaging, 'unsubscribe').rejects(new Error('test error'))

      const result = await uut.cjAnnounce()

      assert.equal(result, true)
    })

    it('should catch, report, and throw errors', async () => {
      try {
        // Force an error
        sandbox.stub(uut.adapters.ipfs.ipfsCoordAdapter.ipfsCoord.adapters.pubsub.messaging, 'publishToPubsubChannel').rejects(new Error('test error'))

        await uut.cjAnnounce()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#startCoinJoin', () => {
    it('should update the nodes state', () => {
      const result = uut.startCoinJoin(coinjoinMocks.startCoinJoinInput01)

      assert.equal(result, true)

      assert.equal(uut.nodeState, 'soliciting')
    })

    it('should catch, report, and throw errors', async () => {
      try {
        uut.startCoinJoin()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Cannot destructure')
      }
    })
  })

  describe('#handleCoinJoinPubsub', () => {
    it('should add new peer to peers array', async () => {
      const result = await uut.handleCoinJoinPubsub(coinjoinMocks.announceObj01)
      console.log('result: ', result)

      assert.equal(result, 1)

      // There should be a new peer in the array.
      assert.equal(uut.peers.length, 1)
    })

    it('should update existing peer in the peers array', async () => {
      // Mock dependencies and force desired code path
      uut.peers.push(coinjoinMocks.announceObj01.data)

      const result = await uut.handleCoinJoinPubsub(coinjoinMocks.announceObj01)
      // console.log('result: ', result)

      assert.equal(result, 1)

      // console.log('uut.peers: ', JSON.stringify(uut.peers, null, 2))

      // There should be a new peer in the array.
      assert.equal(uut.peers.length, 1)
    })

    it('should exit if there are not enough peers', async () => {
      // Mock dependencies and force desired code path
      uut.nodeState = 'soliciting'

      const result = await uut.handleCoinJoinPubsub(coinjoinMocks.announceObj01)
      // console.log('result: ', result)

      assert.equal(result, 2)
    })

    it('should initiate a CoinJoin if there are enough players', async () => {
      // Mock dependencies and force desired code path
      uut.nodeState = 'soliciting'
      uut.peers.push(coinjoinMocks.announceObj01.data)
      uut.maxSatsToCoinJoin = 200000
      sandbox.stub(uut, 'initiateColabCoinJoin').resolves({ hex: 'fake-hex', cjUuid: 'fake-uuid' })
      sandbox.stub(uut, 'collectSignatures').resolves()

      const result = await uut.handleCoinJoinPubsub(coinjoinMocks.announceObj02)
      // console.log('result: ', result)

      assert.equal(result, 3)
    })

    it('should return false on error', async () => {
      const result = await uut.handleCoinJoinPubsub()

      assert.equal(result, false)
    })
  })

  describe('#initiateColabCoinJoin', () => {
    beforeEach(() => {
      coinjoinMocks = cloneDeep(coinjoinMocksLib)
    })

    it('should throw an error if peer does not have enough sats', async () => {
      try {
        // Mock dependencies and force desired code path
        sandbox.stub(uut, 'waitForRPCResponse').resolves(coinjoinMocks.peerUtxos01)
        sandbox.stub(uut, 'buildCoinJoinTx').resolves('fake-hex')

        await uut.initiateColabCoinJoin(coinjoinMocks.peers01)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'which is less than the required')
      }
    })

    it('should throw an error if peer communication fails', async () => {
      try {
        // Mock dependencies and force desired code path
        sandbox.stub(uut.adapters.ipfs.ipfsCoordAdapter.ipfsCoord.useCases.peer, 'sendPrivateMessage').rejects(new Error('RPC error'))
        // sandbox.stub(uut, 'waitForRPCResponse').resolves(coinjoinMocks.peerUtxos01)
        // sandbox.stub(uut, 'buildCoinJoinTx').resolves('fake-hex')

        await uut.initiateColabCoinJoin(coinjoinMocks.peers01)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Could not send message to')
      }
    })

    it('should return false if peer is already in a CoinJoin', async () => {
      // Mock dependencies and force desired code path
      coinjoinMocks.peerUtxos01.message = 'coinjoin already underway'
      sandbox.stub(uut, 'waitForRPCResponse').resolves(coinjoinMocks.peerUtxos01)
      sandbox.stub(uut, 'buildCoinJoinTx').resolves('fake-hex')

      const result = await uut.initiateColabCoinJoin(coinjoinMocks.peers01)

      assert.equal(result, false)
    })

    it('should initiate a CoinJoin with peer', async () => {
      // Mock dependencies and force desired code path
      // sandbox.stub(uut.adapters.ipfs.ipfsCoordAdapter.ipfsCoord.useCases.peer,'sendPrivateMessage').resolves()
      coinjoinMocks.peerUtxos01.message.coinjoinUtxos[0].value = 200000
      sandbox.stub(uut, 'waitForRPCResponse').resolves(coinjoinMocks.peerUtxos01)
      sandbox.stub(uut, 'buildCoinJoinTx').resolves('fake-hex')

      const result = await uut.initiateColabCoinJoin(coinjoinMocks.peers01)
      console.log('result: ', result)

      assert.equal(result.hex, 'fake-hex')
      assert.property(result, 'cjUuid')
    })
  })

  describe('#handleInitRequest', () => {
    it('should return UTXOs on init request', async () => {
      // Mock dependencies and force desired code path
      uut.utxos = coinjoinMocks.startCoinJoinInput01.bchUtxos

      const result = await uut.handleInitRequest(coinjoinMocks.initRpcPayload01)
      console.log('result: ', result)

      // Assert that the returned object has the expected properties
      assert.property(result, 'coinjoinUtxos')
      assert.property(result, 'outputAddr')
      assert.property(result, 'changeAddr')
      assert.equal(result.success, true)
    })

    it('should return false if the peer does not have minimum number of sats', async () => {
      // Mock dependencies and force desired code path
      uut.utxos = []

      const result = await uut.handleInitRequest(coinjoinMocks.initRpcPayload01)
      // console.log('result: ', result)

      assert.equal(result.success, false)
    })

    it('should return false on error', async () => {
      const result = await uut.handleInitRequest()
      // console.log('result: ', result)

      assert.equal(result.success, false)
    })
  })

  describe('#buildCoinJoinTx', () => {
    it('should build a transaction from peer UTXO data', async () => {
      // Mock dependencies and force desired code path
      uut.utxos = coinjoinMocks.startCoinJoinInput01.bchUtxos
      sandbox.stub(uut.adapters.coinjoin, 'createTransaction').returns({ hex: 'fake-hex', txObj: {} })

      const result = await uut.buildCoinJoinTx(coinjoinMocks.preTxPeerData01)
      // console.log('result: ', result)

      // Assert the expected hex string is returned.
      assert.equal(result, 'fake-hex')

      // Assert that the uut.txObj state has been populated with an object
      assert.isObject(uut.txObj)
    })

    it('should catch, report, and throw errors', async () => {
      try {
        await uut.buildCoinJoinTx()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Cannot read')
      }
    })
  })

  describe('#collectSignatures', () => {
    it('should submit the unsigned TX to each peer', async () => {
      // Mock dependencies and force desired code path
      sandbox.stub(uut, 'waitForRPCResponse').resolves()
      uut.utxos = coinjoinMocks.startCoinJoinInput01.bchUtxos

      const inObj = {
        cjPeers: coinjoinMocks.preTxPeerData01.peerCoinJoinData
      }

      const result = await uut.collectSignatures(inObj)
      // console.log('result: ', result)

      assert.equal(result, true)
    })

    it('should throw an error if coordinator can not communicate with peer', async () => {
      try {
        // Mock dependencies and force desired code path
        sandbox.stub(uut, 'waitForRPCResponse').resolves()
        uut.utxos = coinjoinMocks.startCoinJoinInput01.bchUtxos
        sandbox.stub(uut.adapters.ipfs.ipfsCoordAdapter.ipfsCoord.useCases.peer, 'sendPrivateMessage').rejects(new Error('can not communicate with peer'))

        const inObj = {
          cjPeers: coinjoinMocks.preTxPeerData01.peerCoinJoinData
        }

        await uut.collectSignatures(inObj)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Could not communicate with peer')
      }
    })
  })

  describe('#signTx', () => {
    it('should update the state with the unsigned transaction', () => {
      const rpcData = {
        payload: {
          params: 'fake-unsigned-tx'
        }
      }

      uut.signTx(rpcData)

      assert.equal(uut.unsignedTxData, 'fake-unsigned-tx')
    })
  })

  describe('#sendPartiallySignedTx', () => {
    it('should handle locally if this node is the coordinator peer', async () => {
      // Mock dependencies and force desired code path
      uut.adapters.ipfs.ipfsCoordAdapter.ipfsCoord.thisNode.ipfsId = 'coordinator-ipfs-id'
      uut.coordinator = 'coordinator-ipfs-id'
      sandbox.stub(uut, 'combineSigs').resolves()

      const result = await uut.sendPartiallySignedTx()
      // console.log('result: ', result)

      assert.equal(result, 1)
    })

    it('should send the TX to each peer', async () => {
      // Mock dependencies and force desired code path
      uut.adapters.ipfs.ipfsCoordAdapter.ipfsCoord.thisNode.ipfsId = 'not-a-coordinator-ipfs-id'
      uut.coordinator = 'coordinator-ipfs-id'
      sandbox.stub(uut.adapters.ipfs.ipfsCoordAdapter.ipfsCoord.useCases.peer, 'sendPrivateMessage').resolves()
      sandbox.stub(uut, 'waitForRPCResponse').resolves()

      const result = await uut.sendPartiallySignedTx()
      // console.log('result: ', result)

      assert.equal(result.success, true)
    })

    it('should throw error if it can not communicate with the peer', async () => {
      try {
        // Mock dependencies and force desired code path
        uut.adapters.ipfs.ipfsCoordAdapter.ipfsCoord.thisNode.ipfsId = 'not-a-coordinator-ipfs-id'
        uut.coordinator = 'coordinator-ipfs-id'
        sandbox.stub(uut.adapters.ipfs.ipfsCoordAdapter.ipfsCoord.useCases.peer, 'sendPrivateMessage').rejects(new Error('test error'))
        // sandbox.stub(uut, 'waitForRPCResponse').resolves()

        await uut.sendPartiallySignedTx()

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Could not find data for coordinator peer')
      }
    })
  })

  describe('#combineSigs', () => {
    it('should add new tx to the array, then return 1', async () => {
      // Mock dependencies and force desired code path
      sandbox.stub(uut, 'createFullySignedTx').returns('fake-hex')
      sandbox.stub(uut, 'broadcastTx').resolves()
      uut.psTxs.push({})
      uut.psTxs.push({})

      const result = await uut.combineSigs()
      console.log('result: ', result)

      assert.equal(result, 1)
    })

    it('should add new tx to the array, then return 1', async () => {
      // Mock dependencies and force desired code path
      sandbox.stub(uut, 'createFullySignedTx').returns('fake-hex')
      sandbox.stub(uut, 'broadcastTx').resolves()

      const result = await uut.combineSigs()
      console.log('result: ', result)

      assert.equal(result, 2)
    })

    it('should catch, report, and throw errors', async () => {
      try {
        await uut.combineSigs()

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Cannot read')
      }
    })
  })

  describe('#createFullySignedTx', () => {
    it('should combine partially signed TXs into a fully-signed TX', () => {
      const inObj = {
        unsignedTxData: coinjoinMocks.unsignedTxData01,
        peers: coinjoinMocks.peers01,
        psTxs: coinjoinMocks.psTxs01,
        txObj: coinjoinMocks.txObj01
      }

      const txHex = uut.createFullySignedTx(inObj)
      // console.log('txHex: ', txHex)

      assert.include(txHex, '020000000')
    })
  })

  describe('#broadcastTx', () => {
    it('should broadcast a tx and return a txid', async () => {
      class FakeWallet {
        async broadcast () {
          return 'fake-txid'
        }
      }
      uut.BchWallet = FakeWallet

      const result = await uut.broadcastTx('fake-hex')
      // console.log('result: ', result)

      assert.equal(result, 'fake-txid')
    })
  })

  describe('#waitForRPCResponse', () => {
    it('should catch and throw an error', async () => {
      try {
        // Mock data.
        const rpcId = '123'
        uut.rpcDataQueue.push({})

        const result = await uut.waitForRPCResponse(rpcId)
        console.log('result: ', result)

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log('error: ', err)
        assert.include(err.message, 'Cannot read')
      }
    })

    it('should resolve when data is received', async () => {
      // Mock dependencies
      coinjoinMocks.initRpcPayload01.payload.result = {
        value: {
          success: true
        }
      }
      sandbox.stub(uut, 'sleep').resolves()

      // Mock data.
      const rpcId = '0c1e903d-70e1-4b86-8844-840297897748'
      uut.rpcDataQueue.push(coinjoinMocks.initRpcPayload01)

      const result = await uut.waitForRPCResponse(rpcId)
      // console.log('result: ', result)

      assert.property(result, 'success')
      assert.equal(result.success, true)
    })
  })

  describe('#rpcHandler', () => {
    it('should add RPC data to queue', () => {
      const data = {
        payload: {
          id: '123'
        }
      }

      uut.rpcHandler(data)
    })

    it('should return false on error', () => {
      const result = uut.rpcHandler()

      assert.equal(result, false)
    })
  })

  describe('#sleep', () => {
    it('should wait the given amount of milliseconds', async () => {
      await uut.sleep(1)

      assert.equal(1, 1)
    })
  })
})

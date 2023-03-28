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
})

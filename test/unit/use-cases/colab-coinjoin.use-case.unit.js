/*
  Use case unit tests for the colab-coinjoin.js use case library
*/

// Public npm libraries
const assert = require('chai').assert
const sinon = require('sinon')

// Unit under test (uut)
const ColabCoinJoinLib = require('../../../src/use-cases/colab-coinjoin')
const adapters = require('../mocks/adapters')
const coinjoinMocks = require('../mocks/use-cases/colab-coinjoin-mocks')

describe('#colab-coinjoin-use-case', () => {
  let uut
  let sandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()

    uut = new ColabCoinJoinLib({ adapters })
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

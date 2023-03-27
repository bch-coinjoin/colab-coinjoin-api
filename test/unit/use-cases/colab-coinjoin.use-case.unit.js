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

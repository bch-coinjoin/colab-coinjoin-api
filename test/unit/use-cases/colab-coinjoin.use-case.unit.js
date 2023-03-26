/*
  Use case unit tests for the colab-coinjoin.js use case library
*/

// Public npm libraries
// const assert = require('chai').assert
// const sinon = require('sinon')

// Unit under test (uut)
const ColabCoinJoinLib = require('../../../src/use-cases/colab-coinjoin')
const adapters = require('../mocks/adapters')
const coinjoinMocks = require('../mocks/use-cases/colab-coinjoin-mocks')

describe('#colab-coinjoin-use-case', () => {
  let uut

  before(() => {
    uut = new ColabCoinJoinLib({ adapters })
  })

  describe('#createFullySignedTx', () => {
    it('should combine partially signed TXs into a fully-signed TX', () => {
      const inObj = {
        unsignedTxData: coinjoinMocks.unsignedTxData01,
        peers: coinjoinMocks.peers01,
        psTxs: coinjoinMocks.psTxs01
      }

      const txHex = uut.createFullySignedTx(inObj)
      console.log('txHex: ', txHex)
    })
  })
})

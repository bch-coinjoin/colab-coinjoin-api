/*
  Unit tests for the IPFS Adapter.
*/

const assert = require('chai').assert
const sinon = require('sinon')
const IPFSLib = require('../../../src/adapters/ipfs/ipfs')
// const IPFSMock = require('../mocks/ipfs-mock')
const config = require('../../../config')

// config.isProduction =  true;
describe('#IPFS-adapter', () => {
  let uut
  let sandbox

  beforeEach(() => {
    uut = new IPFSLib()

    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#constructor', () => {
    it('should instantiate IPFS Lib in dev mode.', async () => {
      const _uut = new IPFSLib()
      assert.exists(_uut)
      assert.isFunction(_uut.start)
      assert.isFunction(_uut.stop)
    })

    it('should instantiate dev IPFS Lib in production mode.', async () => {
      config.isProduction = true
      const _uut = new IPFSLib()
      assert.exists(_uut)
      assert.isFunction(_uut.start)
      assert.isFunction(_uut.stop)
      config.isProduction = false
    })
  })

  describe('#launchIpfs', () => {
    it('should create an instance of IPFS', async () => {
      const ipfsd = await uut.launchIpfs(false)

      assert.property(ipfsd, 'api')
    })
  })

  describe('#start', () => {
    it('should return a promise that resolves into an instance of IPFS', async () => {
      // Mock dependencies and force desired code path
      sandbox.stub(uut, 'launchIpfs').resolves()
      uut.ipfsd = {
        api: {
          id: async () => { return { id: 'test' } }
        }
      }

      const result = await uut.start()
      // console.log('result: ', result)

      assert.equal(uut.isReady, true)

      assert.property(result, 'id')
    })

    it('should catch and throw an error', async () => {
      try {
        // Force an error
        sandbox.stub(uut, 'launchIpfs').rejects(new Error('test error'))

        await uut.start()

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#stop', () => {
    it('should stop the IPFS node', async () => {
      // Mock dependencies
      uut.ipfsd = {
        stop: () => {
        }
      }

      const result = await uut.stop()

      assert.equal(result, true)
    })
  })

// describe('#rmBlocksDir', () => {
//   it('should delete the /blocks directory', () => {
//     const result = uut.rmBlocksDir()
//
//     assert.equal(result, true)
//   })
//
//   it('should catch and throw an error', () => {
//     try {
//       // Force an error
//       sandbox.stub(uut.fs, 'rmdirSync').throws(new Error('test error'))
//
//       uut.rmBlocksDir()
//
//       assert.fail('Unexpected code path')
//     } catch (err) {
//       assert.equal(err.message, 'test error')
//     }
//   })
// })
})

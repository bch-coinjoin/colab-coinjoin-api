/*
  top-level IPFS library that combines the individual IPFS-based libraries.
*/

// Local libraries
const IpfsAdapter = require('./ipfs')
const IpfsCoordAdapter = require('./ipfs-coord')
const config = require('../../../config')

class IPFS {
  constructor (localConfig = {}) {
    // Encapsulate dependencies
    this.ipfsAdapter = new IpfsAdapter()
    this.IpfsCoordAdapter = IpfsCoordAdapter
    this.process = process
    this.config = config

    this.ipfsCoordAdapter = {} // placeholder

    // Properties of this class instance.
    this.isReady = false
  }

  // Provides a global start() function that triggers the start() function in
  // the underlying libraries.
  async start () {
    try {
      // Start IPFS
      await this.ipfsAdapter.start()
      console.log('IPFS is ready.')

      // this.ipfs is a Promise that will resolve into an instance of an IPFS node.
      this.ipfs = this.ipfsAdapter.ipfs

      // Start ipfs-coord
      this.ipfsCoordAdapter = new this.IpfsCoordAdapter({
        ipfs: this.ipfs,
        tcpPort: this.config.ipfsTcpPort,
        wsPort: this.config.ipfsWsPort
        // nodeType: 'external',
        // type: 'external'
      })
      await this.ipfsCoordAdapter.start()
      console.log('ipfs-coord is ready.')

      // Subscribe to the chat pubsub channel
      await this.ipfsCoordAdapter.subscribeToChat()

      // Subscribe to the CoinJoin pubsub channel
      await this.ipfsCoordAdapter.subscribeToCoinJoin()

      return true
    } catch (err) {
      console.error('Error in adapters/ipfs/index.js/start()')

      // If error is due to a lock file issue. Kill the process, so that
      // Docker or pm2 has a chance to restart the service.
      if (err.message.includes('Lock already being held')) {
        this.process.exit(1)
      }

      throw err
    }
  }
}

module.exports = IPFS

/*
  Clean Architecture Adapter for IPFS.
  This library deals with IPFS so that the apps business logic doesn't need
  to have any specific knowledge of the js-ipfs library.

  TODO: Add the external IP address to the list of multiaddrs advertised by
  this node. See this GitHub Issue for details:
  https://github.com/Permissionless-Software-Foundation/ipfs-service-provider/issues/38
*/

// Global npm libraries
// const IPFS = require('ipfs')
// const IPFS = require('@chris.troutner/ipfs')
// const IPFSembedded = require('ipfs')
const Ctl = require('ipfsd-ctl')
const IPFSexternal = require('ipfs-http-client')
const fs = require('fs')
// const http = require('http')
const { path } = require('go-ipfs')

// Local libraries
const config = require('../../../config')

// const IPFS_DIR = './.ipfsdata/ipfs'

class IpfsAdapter {
  constructor (localConfig) {
    // Encapsulate dependencies
    this.config = config
    this.ipfsd = null // placeholder
    this.ipfs = null // placeholder

    // Choose the IPFS constructor based on the config settings.
    // this.IPFS = IPFSembedded // default
    // if (this.config.isProduction) {
    this.IPFS = IPFSexternal
    // }

    // Properties of this class instance.
    this.isReady = false

    this.fs = fs
  }

  // Instantiate the go-ipfs IPFS Daemon
  async launchIpfs (autoStart = true) {
    const ipfsd = await Ctl.createController({
      ipfsHttpModule: IPFSexternal,
      ipfsBin: path(),
      ipfsOptions: {
        // repo: '/home/trout/.ipfs'
        start: autoStart,
        init: true
      },
      // remote: false,
      disposable: true,
      // test: false,
      args: ['--migrate', '--enable-gc', '--enable-pubsub-experiment']
    })
    // console.log('ipfsd: ', ipfsd)

    this.ipfsd = ipfsd

    return this.ipfsd
  }

  // Start go-ipfs daemon, initialize IPFS, and get the ID for the node.
  async start () {
    try {
      // Start the go-ipfs node.
      await this.launchIpfs()

      // Get the ID.
      const idRes = await this.ipfsd.api.id()
      console.log('IPFS ID: ', idRes.id)

      // Signal that this adapter is ready.
      this.isReady = true

      this.ipfs = this.ipfsd.api

      return this.ipfs
    } catch (err) {
      console.error('Error in ipfs.js/start(): ', err)
      throw err
    }
  }

  async stop () {
    await this.ipfsd.stop()
    // await this.ipfs.stop()

    return true
  }

  // Remove the '/blocks' directory that is used to store IPFS data.
  // Dev Note: It's assumed this node is not pinning any data and that
  // everything in this directory is transient. This folder will regularly
  // fill up and prevent IPFS from starting.
  // rmBlocksDir () {
  //  try {
  //    const dir = `${IPFS_DIR}/blocks`
  //    console.log(`Deleting ${dir} directory...`)
  //
  //    this.fs.rmdirSync(dir, { recursive: true })
  //
  //    console.log(`${dir} directory is deleted!`)
  //
  //    return true // Signal successful execution.
  //  } catch (err) {
  //    console.log('Error in rmBlocksDir()')
  //    throw err
  //  }
  // }
}

module.exports = IpfsAdapter

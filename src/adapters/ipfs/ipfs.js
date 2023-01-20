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
const http = require('http')
const { path } = require('go-ipfs')

// Local libraries
const config = require('../../../config')

// const IPFS_DIR = './.ipfsdata/ipfs'

class IpfsAdapter {
  constructor (localConfig) {
    // Encapsulate dependencies
    this.config = config

    // Choose the IPFS constructor based on the config settings.
    // this.IPFS = IPFSembedded // default
    // if (this.config.isProduction) {
    this.IPFS = IPFSexternal
    // }

    // Properties of this class instance.
    this.isReady = false

    this.fs = fs
  }

  async start () {
    try {
      // let Ctl
      // try {
      //   Ctl = await import('ipfsd-ctl')
      //   console.log('Ctl: ', Ctl)
      // } catch(err) {
      //   console.error('Error importing ipfsd-ctl')
      // }

      console.log('go-ipfs binary path: ', path())

      const ipfsd = await Ctl.createController({
        ipfsHttpModule: IPFSexternal,
        ipfsBin: path(),
        ipfsOptions: {
          repo: '/home/trout/.ipfs'
          // start: true
        },
        remote: false,
        disposable: false,
        test: false,
        args: ['--agent-version-suffix=desktop', '--migrate', '--enable-gc', '--enable-pubsub-experiment']
        // args: ['--migrate', '--enable-gc', '--enable-pubsub-experiment' ]
      })
      console.log('ipfsd: ', ipfsd)

      await ipfsd.init()

      await ipfsd.start()

      const idRes = await ipfsd.api.id()
      console.log('idRes: ', idRes)
      // const id = idRes.id
      // console.log(`IPFS ID: `, id)

      await ipfsd.stop()
      console.log('Success!!!!!!!')
    } catch (err) {
      console.error('Error in ipfs.js/start(): ', err)
      throw err
    }
  }

  // Start an IPFS node.
  async start2 () {
    try {
      // Ipfs Options
      // const ipfsOptionsEmbedded = {
      //   repo: IPFS_DIR,
      //   start: true,
      //   config: {
      //     relay: {
      //       enabled: true, // enable circuit relay dialer and listener
      //       hop: {
      //         enabled: config.isCircuitRelay // enable circuit relay HOP (make this node a relay)
      //       }
      //     },
      //     pubsub: true, // enable pubsub
      //     Swarm: {
      //       ConnMgr: {
      //         HighWater: 30,
      //         LowWater: 10
      //       }
      //     },
      //     Addresses: {
      //       Swarm: [
      //         `/ip4/0.0.0.0/tcp/${this.config.ipfsTcpPort}`,
      //         `/ip4/0.0.0.0/tcp/${this.config.ipfsWsPort}/ws`
      //       ]
      //     },
      //     Datastore: {
      //       StorageMax: '2GB',
      //       StorageGCWatermark: 50,
      //       GCPeriod: '15m'
      //     }
      //   }
      // }

      const ipfsOptionsExternal = {
        host: this.config.ipfsHost,
        port: this.config.ipfsApiPort,
        agent: http.Agent({ keepAlive: true, maxSockets: 2000 })
      }

      // let ipfsOptions = ipfsOptionsEmbedded
      // if (this.config.isProduction) {
      //   ipfsOptions = ipfsOptionsExternal
      // }
      const ipfsOptions = ipfsOptionsExternal

      // Create a new IPFS node.
      this.ipfs = await this.IPFS.create(ipfsOptions)

      // Set the 'server' profile so the node does not scan private networks.
      await this.ipfs.config.profiles.apply('server')

      // Debugging: Display IPFS config settings.
      // const configSettings = await this.ipfs.config.getAll()
      // console.log(`configSettings: ${JSON.stringify(configSettings, null, 2)}`)

      // Signal that this adapter is ready.
      this.isReady = true

      return this.ipfs
    } catch (err) {
      console.error('Error in ipfs.js/start()')

      // If IPFS crashes because the /blocks directory is full, wipe the directory.
      // if (err.message.includes('No space left on device')) {
      //   this.rmBlocksDir()
      // }

      throw err
    }
  }

  async stop () {
    await this.ipfs.stop()

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

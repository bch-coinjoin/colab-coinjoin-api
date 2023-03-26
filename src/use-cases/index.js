/*
  This is a top-level library that encapsulates all the additional Use Cases.
  The concept of Use Cases comes from Clean Architecture:
  https://troutsblog.com/blog/clean-architecture
*/

// const UserUseCases = require('./user')
const ColabCoinJoin = require('./colab-coinjoin')

class UseCases {
  constructor (localConfig = {}) {
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of adapters must be passed in when instantiating Use Cases library.'
      )
    }

    // console.log('use-cases/index.js localConfig: ', localConfig)
    // this.user = new UserUseCases(localConfig)
    this.coinjoin = new ColabCoinJoin(localConfig)
  }

  // Run any startup Use Cases at the start of the app.
  async start () {
    try {
      // Since adapters are initialized first, the ipfs-coord adapter should
      // exist and be initialized by this point in the code path. Overwrite the
      // CoinJoin pubsub handler with the handler in this library.
      // console.log('this.adapters.ipfs.ipfsCoordAdapter.ipfsCoord: ', this.adapters.ipfs.ipfsCoordAdapter.ipfsCoord)
      // this.adapters.ipfs.ipfsCoordAdapter.ipfsCoord.useCases.pubsub.coinjoinPubsubHandler = this.coinjoin.handleCoinJoinPubsub

      // Subscribe to the CoinJoin pubsub channel
      await this.coinjoin.joinCoinJoinPubsub()

      console.log('Async Use Cases have been started.')

      return true
    } catch (err) {
      console.error('Error in use-cases/index.js/start()')
      console.log(err)
      throw err
    }
  }
}

module.exports = UseCases

/*
  This Controller library is concerned with timer-based functions that are
  kicked off periodicially.
*/

const config = require('../../config/index.js')

class TimerControllers {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating Timer Controller libraries.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating Timer Controller libraries.'
      )
    }

    this.debugLevel = localConfig.debugLevel

    // Encapsulate dependencies
    this.config = config

    // Bind 'this' object to all subfunctions.
    this.exampleTimerFunc = this.exampleTimerFunc.bind(this)
    this.announceColabCoinJoin = this.announceColabCoinJoin.bind(this)

    this.startTimers()
  }

  // Start all the time-based controllers.
  startTimers () {
    // Any new timer control functions can be added here. They will be started
    // when the server starts.
    // this.optimizeWalletHandle = setInterval(this.exampleTimerFunc, 30000)

    this.announceTimerHandle = setInterval(this.announceColabCoinJoin, 2 * 60000)
    setTimeout(this.announceColabCoinJoin, 15000)

    return true
  }

  stopTimers () {
    clearInterval(this.optimizeWalletHandle)
  }

  async announceColabCoinJoin () {
    try {
      await this.useCases.coinjoin.cjAnnounce()

      // console.log('this.adapters.ipfs.ipfsCoordAdapter.ipfsCoord.useCases.pubsub.coinjoinPubsubHandler: ', this.adapters.ipfs.ipfsCoordAdapter.ipfsCoord.useCases.pubsub.coinjoinPubsubHandler)
      // this.adapters.ipfs.ipfsCoordAdapter.ipfsCoord.useCases.pubsub.coinjoinPubsubHandler({ipfsId: 'ping'})
    } catch (err) {
      console.error('Error in timer controller announceColabCoinJoin(): ', err)

      // Note: Do not throw an error. This is a top-level function.
      return false
    }
  }

  // Replace this example function with your own timer handler.
  exampleTimerFunc (negativeTest) {
    try {
      console.log('Example timer controller executed.')

      if (negativeTest) throw new Error('test error')

      return true
    } catch (err) {
      console.error('Error in exampleTimerFunc(): ', err)

      // Note: Do not throw an error. This is a top-level function.
      return false
    }
  }
}

module.exports = TimerControllers

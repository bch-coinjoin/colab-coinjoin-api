/*
  This is the JSON RPC router for the ccoinjoin (Colaborative CoinJoin) API
*/

// Public npm libraries
const jsonrpc = require('jsonrpc-lite')

// Local libraries
// const config = require('../../../../config')
const RateLimit = require('../rate-limit')

class CCoinJoinRPC {
  constructor (localConfig) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating CCoinJoin JSON RPC Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating CCoinJoin JSON RPC Controller.'
      )
    }

    // Encapsulate dependencies
    this.jsonrpc = jsonrpc
    this.rateLimit = new RateLimit()
  }

  // Rout 'ccoinjoin' methods to the appropriate handler.
  async ccoinjoinRouter (rpcData) {
    let endpoint = 'unknown'

    console.log('debugging: ccoinjoinRouter from ipfs-service-provider triggered')

    try {
      // console.log('userRouter rpcData: ', rpcData)

      endpoint = rpcData.payload.params.endpoint

      // Route the call based on the value of the method property.
      switch (endpoint) {
        case 'initiate':
          await this.rateLimit.limiter(rpcData.from)
          return await this.initController(rpcData)
      }
    } catch (err) {
      console.error('Error in CCoinJoinRPC/ccoinjoinRouter(): ', err)
      // Do not throw an error. This is a top-level handler.

      return {
        success: false,
        status: err.status || 500,
        message: err.message,
        endpoint
      }
    }
  }

  /**
   * @api {JSON} /initiate Try to initiate a CoinJoin TX
   * @apiPermission public
   * @apiName Initiate
   * @apiGroup JSON CCoinJoin
   *
   * @apiExample Example usage:
   * {"jsonrpc":"2.0","id":"555","method":"ccoinjoin","params":{ "endpoint": "initiate"}}
   *
   * @apiDescription
   * This endpoint is called by another node to initiate a CoinJoin TX with
   * this peer.
   */
  async initController (rpcData) {
    console.log('debugging: ccoinjoinRouter from ipfs-service-provider triggered')

    const message = await this.useCases.coinjoin.handleInitRequest(rpcData)
    console.log('message from handleInitRequest(): ', message)

    return {
      success: true,
      status: 200,
      // message: aboutStr,
      // message: JSON.stringify(config.announceJsonLd),
      // message: JSON.stringify({ message: 'ccoinjoin initiate command received!' }),
      message,
      endpoint: 'initiate'
    }
  }
}

module.exports = CCoinJoinRPC

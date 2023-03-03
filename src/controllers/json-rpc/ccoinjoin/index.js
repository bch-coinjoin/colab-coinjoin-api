/*
  This is the JSON RPC router for the ccoinjoin (Colaborative CoinJoin) API
*/

// Public npm libraries
const jsonrpc = require('jsonrpc-lite')

// Local libraries
// const config = require('../../../../config')

class CCoinJoinRPC {
  constructor (localConfig) {
    // Encapsulate dependencies
    this.jsonrpc = jsonrpc
  }

  // Rout 'ccoinjoin' methods to the appropriate handler.
  async ccoinjoinRouter (rpcData) {
    console.log('debugging: ccoinjoinRouter from ipfs-service-provider triggered')

    return {
      success: true,
      status: 200,
      // message: aboutStr,
      // message: JSON.stringify(config.announceJsonLd),
      message: JSON.stringify({ message: 'ccoinjoin initiate command received!' }),
      endpoint: 'initiate'
    }
  }

  /**
   * @api {JSON} /about About IPFS Node
   * @apiPermission public
   * @apiName About
   * @apiGroup JSON About
   *
   * @apiExample Example usage:
   * {"jsonrpc":"2.0","id":"555","method":"about"}
   *
   * @apiDescription
   * This endpoint can be customized so that users can retrieve information about
   * your IPFS node and Service Provider application. This is a great place to
   * put a website URL, an IPFS hash, an other basic information.
   */

  // This is the top-level router for this library.
  // This is a bit different than other router libraries, because there is
  // only one response, which is a string about this node.
  async initController (rpcData) {
    console.log('debugging: ccoinjoinRouter from ipfs-service-provider triggered')

    return {
      success: true,
      status: 200,
      // message: aboutStr,
      // message: JSON.stringify(config.announceJsonLd),
      message: JSON.stringify({ message: 'ccoinjoin initiate command received!' }),
      endpoint: 'initiate'
    }
  }
}

module.exports = CCoinJoinRPC

/*
  REST API Controller library for the /user route
*/

const { wlogger } = require('../../../adapters/wlogger')

// let _this

class WalletRESTControllerLib {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating /users REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating /users REST Controller.'
      )
    }

    // Encapsulate dependencies
    // this.UserModel = this.adapters.localdb.Users
    // this.userUseCases = this.useCases.user

    // _this = this
  }

  /**
   * @api {get} /wallet Get mnemonic for wallet controlled by this API
   * @apiPermission public
   * @apiName GetWallet
   * @apiGroup REST Wallet
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5540/wallet
   */
  async getMnemonic (ctx) {
    try {
      const mnemonic = 'sibling scout snack clump seven plunge canyon away damp penalty nominee shoot'
      // KxcqrEHcjHJUJCS19TiX418Zp8LXzXqTsZaATrLDo2SskqzLq9GX
      // bitcoincash:qr42rcereqcr4yf5yfmk4v0ypfk6s5musgkdn0nv2g

      // const users = await _this.useCases.user.getAllUsers()

      ctx.body = { mnemonic }
    } catch (err) {
      wlogger.error('Error in wallet/controller.js/getMnemonic(): ', err)
      ctx.throw(422, err.message)
    }
  }

  // DRY error handler
  handleError (ctx, err) {
    // If an HTTP status is specified by the buisiness logic, use that.
    if (err.status) {
      if (err.message) {
        ctx.throw(err.status, err.message)
      } else {
        ctx.throw(err.status)
      }
    } else {
      // By default use a 422 error if the HTTP status is not specified.
      ctx.throw(422, err.message)
    }
  }
}

module.exports = WalletRESTControllerLib

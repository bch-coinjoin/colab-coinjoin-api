/*
  REST API library for /user route.
*/

// Public npm libraries.
const Router = require('koa-router')

// Local libraries.
const WalletRESTControllerLib = require('./controller')
const Validators = require('../middleware/validators')

let _this

class WalletRouter {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating PostEntry REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating PostEntry REST Controller.'
      )
    }

    const dependencies = {
      adapters: this.adapters,
      useCases: this.useCases
    }

    // Encapsulate dependencies.
    this.walletRESTController = new WalletRESTControllerLib(dependencies)
    this.validators = new Validators()

    // Instantiate the router and set the base route.
    const baseUrl = '/wallet'
    this.router = new Router({ prefix: baseUrl })

    _this = this
  }

  attach (app) {
    if (!app) {
      throw new Error(
        'Must pass app object when attaching REST API controllers.'
      )
    }

    // Define the routes and attach the controller.
    this.router.get('/', this.getMnemonic)
    this.router.post('/', this.startCoinJoin)
    this.router.get('/unsignedTx', this.getUnsignedTx)

    // Attach the Controller routes to the Koa app.
    app.use(this.router.routes())
    app.use(this.router.allowedMethods())
  }

  async getMnemonic (ctx, next) {
    // await _this.validators.ensureUser(ctx, next)
    await _this.walletRESTController.getMnemonic(ctx, next)
  }

  async startCoinJoin (ctx, next) {
    // await _this.validators.ensureUser(ctx, next)
    await _this.walletRESTController.startCoinJoin(ctx, next)
  }

  async getUnsignedTx (ctx, next) {
    await _this.walletRESTController.getUnsignedTx(ctx, next)
  }
}

module.exports = WalletRouter

/*
  Mocks for the Adapter library.
*/

class IpfsAdapter {
  constructor () {
    this.ipfs = {
      files: {
        stat: () => {}
      }
    }
  }
}

class IpfsCoordAdapter {
  constructor () {
    this.ipfsCoord = {
      useCases: {
        peer: {
          sendPrivateMessage: () => {}
        },
        pubsub: {
          coinjoinPubsubHandler: () => {}
        }
      },
      adapters: {
        pubsub: {
          ipfs: {
            ipfs: {
              pubsub: {
                unsubscribe: async () => {}
              }
            }
          },
          subscribeToPubsubChannel: async () => {},
          messaging: {
            publishToPubsubChannel: async () => {}
          }
        }
      },
      thisNode: {
        ipfsId: 'fake-ipfs-id',
        ipfsMultiaddrs: ['fake-multiaddr'],
        bchAddr: 'fake-bch-addr',
        slpAddr: 'fake-slp-addr',
        publicKey: 'fake-public-key',
        type: 'external'
      }
    }
  }
}

const ipfs = {
  ipfsAdapter: new IpfsAdapter(),
  ipfsCoordAdapter: new IpfsCoordAdapter()
}
ipfs.ipfs = ipfs.ipfsAdapter.ipfs

const localdb = {
  Users: class Users {
    static findById () {}
    static find () {}
    static findOne () {
      return {
        validatePassword: localdb.validatePassword
      }
    }

    async save () {
      return {}
    }

    generateToken () {
      return '123'
    }

    toJSON () {
      return {}
    }

    async remove () {
      return true
    }

    async validatePassword () {
      return true
    }
  },

  validatePassword: () => {
    return true
  }
}

const coinjoin = {
  createTransaction: () => {}
}

module.exports = { ipfs, localdb, coinjoin }

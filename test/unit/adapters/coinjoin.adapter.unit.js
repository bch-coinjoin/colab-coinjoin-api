/*
  Unit tests for the CoinJoin Adapter library
*/

// Global npm libraries
const assert = require('chai').assert

// Local libraries
const CoinJoinLib = require('../../../src/adapters/coinjoin.adapter')

describe('#CoinJoin-adapter', () => {
  let uut
  // let sandbox

  beforeEach(() => {
    uut = new CoinJoinLib()
  })

  describe('#createTransaction', () => {
    it('should generate a hex transaction', () => {
      const utxos = [
        {
          height: 780767,
          tx_hash: 'cd66a7db32663cb4c1ff83fa7d94e19e8e74336098f989b8b9c873741fa7f724',
          tx_pos: 0,
          value: 10000,
          txid: 'cd66a7db32663cb4c1ff83fa7d94e19e8e74336098f989b8b9c873741fa7f724',
          vout: 0,
          address: 'bitcoincash:qzeg47yj7a7klnu2rf868xtsw563zl767q7ye8mhcg',
          isSlp: false,
          satoshis: 10000,
          hdIndex: 2
        },
        {
          height: 780767,
          tx_hash: 'cd66a7db32663cb4c1ff83fa7d94e19e8e74336098f989b8b9c873741fa7f724',
          tx_pos: 1,
          value: 138445,
          txid: 'cd66a7db32663cb4c1ff83fa7d94e19e8e74336098f989b8b9c873741fa7f724',
          vout: 1,
          address: 'bitcoincash:qz44a0ynhcx508rykytv22qre6gn5xamjg202wza6r',
          isSlp: false,
          satoshis: 138445,
          hdIndex: 4
        },
        {
          height: 782207,
          tx_hash: '59eee13e1a5915f164b374b21416ab0154a890b11c3bc62bf62f7ad2dfd44f55',
          tx_pos: 1,
          value: 1095,
          txid: '59eee13e1a5915f164b374b21416ab0154a890b11c3bc62bf62f7ad2dfd44f55',
          vout: 1,
          address: 'bitcoincash:qz7u085xuccwpc9vg59fyxfmtxjxvhp67y23alxdfn',
          isSlp: false,
          satoshis: 1095,
          hdIndex: 6
        },
        {
          height: 782199,
          tx_hash: 'cba0c1ce544ac085625752ef05ba779fb444dcfb4b1e92ffaa122ce5e86317b9',
          tx_pos: 0,
          value: 100000,
          txid: 'cba0c1ce544ac085625752ef05ba779fb444dcfb4b1e92ffaa122ce5e86317b9',
          vout: 0,
          address: 'bitcoincash:qzfzjhzvv2dhlyk5k9fdmk00yatz5uv0jyxen0dj6s',
          isSlp: false
        },
        {
          height: 782199,
          tx_hash: 'cba0c1ce544ac085625752ef05ba779fb444dcfb4b1e92ffaa122ce5e86317b9',
          tx_pos: 1,
          value: 278095,
          txid: 'cba0c1ce544ac085625752ef05ba779fb444dcfb4b1e92ffaa122ce5e86317b9',
          vout: 1,
          address: 'bitcoincash:qzhgju2a64jevwpmlavdp6r52sqrv60lws4ru6xck7',
          isSlp: false
        }
      ]

      const outputAddrs = [
        'bitcoincash:qrmgfhrgzlelkha9y943xz99627ydrvt0cjsrl7aew',
        'bitcoincash:qz22k4qfnjah24ffjxvjsjj7640mshm6xqxese2ldp'
      ]

      const changeAddrs = [
        {
          changeAddr: 'bitcoincash:qzeg47yj7a7klnu2rf868xtsw563zl767q7ye8mhcg',
          changeSats: 0
        },
        {
          changeAddr: 'bitcoincash:qzfzjhzvv2dhlyk5k9fdmk00yatz5uv0jyxen0dj6s',
          changeSats: 227980
        }
      ]

      const satsRequired = 149540

      const result = uut.createTransaction({ utxos, outputAddrs, changeAddrs, satsRequired })
      console.log('result: ', result)

      assert.include(result, '020000000524f')
    })
  })
})

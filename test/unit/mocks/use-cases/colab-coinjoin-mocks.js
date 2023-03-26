/*
  Contains mocking data for testing subfunctions of Colab-Coinjoin use case library.
*/

const unsignedTxData01 =  {
  "peerData": {
    "ipfsId": "12D3KooWEPLnaUjgKV7To8Heskpo5DqGpCz8x4WPRezwtRoU7SUY",
    "coinjoinUtxos": [
      {
        "height": 782199,
        "tx_hash": "cba0c1ce544ac085625752ef05ba779fb444dcfb4b1e92ffaa122ce5e86317b9",
        "tx_pos": 0,
        "value": 100000,
        "txid": "cba0c1ce544ac085625752ef05ba779fb444dcfb4b1e92ffaa122ce5e86317b9",
        "vout": 0,
        "address": "bitcoincash:qzfzjhzvv2dhlyk5k9fdmk00yatz5uv0jyxen0dj6s",
        "isSlp": false,
        "hdIndex": 2,
        "satoshis": 100000
      },
      {
        "height": 782199,
        "tx_hash": "cba0c1ce544ac085625752ef05ba779fb444dcfb4b1e92ffaa122ce5e86317b9",
        "tx_pos": 1,
        "value": 278095,
        "txid": "cba0c1ce544ac085625752ef05ba779fb444dcfb4b1e92ffaa122ce5e86317b9",
        "vout": 1,
        "address": "bitcoincash:qzhgju2a64jevwpmlavdp6r52sqrv60lws4ru6xck7",
        "isSlp": false,
        "hdIndex": 3,
        "satoshis": 278095
      }
    ]
  },
  "cjUuid": "a5b498cf-b97a-4c94-b03b-e94278fb26cb",
  "unsignedHex": "020000000524f7a71f7473c8b9b889f9986033748e9ee1947dfa83ffc1b43c6632dba766cd0000000000ffffffff24f7a71f7473c8b9b889f9986033748e9ee1947dfa83ffc1b43c6632dba766cd0100000000ffffffff554fd4dfd27a2ff62bc63b1cb190a85401ab1614b274b364f115591a3ee1ee590100000000ffffffffb91763e8e52c12aaff921e4bfbdc44b49f77ba05ef52576285c04a54cec1a0cb0000000000ffffffffb91763e8e52c12aaff921e4bfbdc44b49f77ba05ef52576285c04a54cec1a0cb0100000000ffffffff0324480200000000001976a914f684dc6817f3fb5fa5216b1308a5d2bc468d8b7e88ac24480200000000001976a91494ab54099cbb7555299199284a5ed55fb85f7a3088ac87760300000000001976a91492295c4c629b7f92d4b152ddd9ef27562a718f9188ac00000000",
  "msgType": "colab-coinjoin-sign",
  "endpoint": "sign"
}

const peers01 = [
  {
    "ipfsId": "12D3KooWBtAvxYYX7JNYpkV9TzAj6Xcc7SLvQqCjUbZRNdZctCdn",
    "bchAddr": "bitcoincash:qzal986g54cyz0dtm7gmqykvzzqrfcnn3sntr9lpjx",
    "slpAddr": "simpleledger:qzal986g54cyz0dtm7gmqykvzzqrfcnn3slsg72pvc",
    "publicKey": "033c9c1ce5fbc88d12efcec8f77de9854b576f71134a7949b7d19cd7024b4de136",
    "minPlayers": 2,
    "maxSats": 149540
  }
]

const psTxs01 = [
  {
    "peerId": "12D3KooWEPLnaUjgKV7To8Heskpo5DqGpCz8x4WPRezwtRoU7SUY",
    "psHex": "020000000524f7a71f7473c8b9b889f9986033748e9ee1947dfa83ffc1b43c6632dba766cd0000000000ffffffff24f7a71f7473c8b9b889f9986033748e9ee1947dfa83ffc1b43c6632dba766cd0100000000ffffffff554fd4dfd27a2ff62bc63b1cb190a85401ab1614b274b364f115591a3ee1ee590100000000ffffffffb91763e8e52c12aaff921e4bfbdc44b49f77ba05ef52576285c04a54cec1a0cb000000006b483045022100946c19ac03f3c1fb64e8ad41aacd23a14b15a66e2e3fa6ddaebc501f9c270dc2022050b1a4b1f49ba3d99daebd29069caeb975d4d6d9ccb46fdc8d40fbb28b544215412102e9f022695974fd6797b2bf1220ef92213129e844b1cd9687212b360021bc0e0cffffffffb91763e8e52c12aaff921e4bfbdc44b49f77ba05ef52576285c04a54cec1a0cb010000006b4830450221008bad8d65d455df3f3c14904cb83b80b09f825e2d03bd3cc60f6240f1b149213e022018a3e938177ec828311ac44b5518bf5da76e5ceb7721a7ffda99de8244261e46412102dce52da10e2ab3f68ac6e6654d52a2337edec4021e1247ee1533e214eed2981bffffffff0324480200000000001976a914f684dc6817f3fb5fa5216b1308a5d2bc468d8b7e88ac24480200000000001976a91494ab54099cbb7555299199284a5ed55fb85f7a3088ac87760300000000001976a91492295c4c629b7f92d4b152ddd9ef27562a718f9188ac00000000",
    "signedUtxos": [
      {
        "height": 782199,
        "tx_hash": "cba0c1ce544ac085625752ef05ba779fb444dcfb4b1e92ffaa122ce5e86317b9",
        "tx_pos": 0,
        "value": 100000,
        "txid": "cba0c1ce544ac085625752ef05ba779fb444dcfb4b1e92ffaa122ce5e86317b9",
        "vout": 0,
        "address": "bitcoincash:qzfzjhzvv2dhlyk5k9fdmk00yatz5uv0jyxen0dj6s",
        "isSlp": false,
        "hdIndex": 2,
        "satoshis": 100000,
        "wif": "L1bqraQb5t45J7EdVnH5rvWRZwnaTrjehC6kPkvAKBoWZoPKBxAG"
      },
      {
        "height": 782199,
        "tx_hash": "cba0c1ce544ac085625752ef05ba779fb444dcfb4b1e92ffaa122ce5e86317b9",
        "tx_pos": 1,
        "value": 278095,
        "txid": "cba0c1ce544ac085625752ef05ba779fb444dcfb4b1e92ffaa122ce5e86317b9",
        "vout": 1,
        "address": "bitcoincash:qzhgju2a64jevwpmlavdp6r52sqrv60lws4ru6xck7",
        "isSlp": false,
        "hdIndex": 3,
        "satoshis": 278095,
        "wif": "L18QzsoYZnx3xBDmuP2URYJDMkHmzgXqBiDqG3djAP65eYcGc1C5"
      }
    ]
  },
  {
    "peerId": "12D3KooWBtAvxYYX7JNYpkV9TzAj6Xcc7SLvQqCjUbZRNdZctCdn",
    "psHex": "020000000524f7a71f7473c8b9b889f9986033748e9ee1947dfa83ffc1b43c6632dba766cd000000006b48304502210085852a3e5e2e1ec4e3c8f46bf5a5845993adcbaf7447e7e79155bfb3ee60ffdc0220659e87f02d2748cb9a6f1d3d1430d50a3c64f3f77facb9872aa7e14e67090e0b412102e41ba051ff5aa489042f69af83b8066f9597ff1f2596912dae021082d14c9adeffffffff24f7a71f7473c8b9b889f9986033748e9ee1947dfa83ffc1b43c6632dba766cd010000006b483045022100ab3792f510b2bbe36c11afdb86d1f62c5e09c12e7592d31506bf95434cdfa8cf022026b87b219c027d503beb2a5b55b3fc5a206ed4879510402fd472d71c6aaa744f412103d7180714f463fd34d295a7021cf4c3ccaa1f723cdbafddb199285550ed517975ffffffff554fd4dfd27a2ff62bc63b1cb190a85401ab1614b274b364f115591a3ee1ee59010000006b483045022100f599d62b01198f8df3109cc524666aa5404fbd49f166b9a5f3e9ea4eae59b73502200614d1e81c84344bc6dcdd84e38de9fe9aa4b6179ecfe20e6c750bbc50548dab412103d1fff6008d36f0bac314fa2bd78ee4bda8ffe1b02d4eac5d518b5d079a7c9f46ffffffffb91763e8e52c12aaff921e4bfbdc44b49f77ba05ef52576285c04a54cec1a0cb0000000000ffffffffb91763e8e52c12aaff921e4bfbdc44b49f77ba05ef52576285c04a54cec1a0cb0100000000ffffffff0324480200000000001976a914f684dc6817f3fb5fa5216b1308a5d2bc468d8b7e88ac24480200000000001976a91494ab54099cbb7555299199284a5ed55fb85f7a3088ac87760300000000001976a91492295c4c629b7f92d4b152ddd9ef27562a718f9188ac00000000",
    "signedUtxos": [
      {
        "height": 780767,
        "tx_hash": "cd66a7db32663cb4c1ff83fa7d94e19e8e74336098f989b8b9c873741fa7f724",
        "tx_pos": 0,
        "value": 10000,
        "txid": "cd66a7db32663cb4c1ff83fa7d94e19e8e74336098f989b8b9c873741fa7f724",
        "vout": 0,
        "address": "bitcoincash:qzeg47yj7a7klnu2rf868xtsw563zl767q7ye8mhcg",
        "isSlp": false,
        "satoshis": 10000,
        "hdIndex": 2,
        "wif": "L49ZevqYoZ5guVsK1sZaZJ4J3rQdk31bHozcw9JMT9WekxvZoz1S"
      },
      {
        "height": 780767,
        "tx_hash": "cd66a7db32663cb4c1ff83fa7d94e19e8e74336098f989b8b9c873741fa7f724",
        "tx_pos": 1,
        "value": 138445,
        "txid": "cd66a7db32663cb4c1ff83fa7d94e19e8e74336098f989b8b9c873741fa7f724",
        "vout": 1,
        "address": "bitcoincash:qz44a0ynhcx508rykytv22qre6gn5xamjg202wza6r",
        "isSlp": false,
        "satoshis": 138445,
        "hdIndex": 4,
        "wif": "KzPut7ncEf34Lfcjog2BQW71iEB7cKFc9d17yoCrV3nqC19sHujN"
      },
      {
        "height": 782207,
        "tx_hash": "59eee13e1a5915f164b374b21416ab0154a890b11c3bc62bf62f7ad2dfd44f55",
        "tx_pos": 1,
        "value": 1095,
        "txid": "59eee13e1a5915f164b374b21416ab0154a890b11c3bc62bf62f7ad2dfd44f55",
        "vout": 1,
        "address": "bitcoincash:qz7u085xuccwpc9vg59fyxfmtxjxvhp67y23alxdfn",
        "isSlp": false,
        "satoshis": 1095,
        "hdIndex": 6,
        "wif": "L4UXEUY7FaVuPvsBPqJAoRo6xdxMUshQiw9TTmVcDG7WnBxkqk8r"
      }
    ]
  }
]

module.exports = {
  unsignedTxData01,
  peers01,
  psTxs01
}

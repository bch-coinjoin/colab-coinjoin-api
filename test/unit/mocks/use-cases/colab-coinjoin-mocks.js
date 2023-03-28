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

txObj01 = {
  "inputUtxos": [
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
      "hdIndex": 2
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
      "hdIndex": 4
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
      "hdIndex": 6
    },
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
  ],
  "cjOutputs": [
    "bitcoincash:qrmgfhrgzlelkha9y943xz99627ydrvt0cjsrl7aew",
    "bitcoincash:qz22k4qfnjah24ffjxvjsjj7640mshm6xqxese2ldp"
  ],
  "changeOutputs": [
    {
      "changeAddr": "bitcoincash:qzfzjhzvv2dhlyk5k9fdmk00yatz5uv0jyxen0dj6s",
      "changeSats": 226568
    }
  ],
  "satsRequired": 149540
}

const startCoinJoinInput01 = {
  "bchUtxos": [
    {
      "bchUtxos": [
        {
          "height": 785736,
          "tx_hash": "737df85d1c49f8684d331e41af8f1445095c4155a4b63ae5ab2a749666ea8064",
          "tx_pos": 2,
          "value": 224387,
          "txid": "737df85d1c49f8684d331e41af8f1445095c4155a4b63ae5ab2a749666ea8064",
          "vout": 2,
          "address": "bitcoincash:qzfzjhzvv2dhlyk5k9fdmk00yatz5uv0jyxen0dj6s",
          "isSlp": false
        }
      ],
      "address": "bitcoincash:qzfzjhzvv2dhlyk5k9fdmk00yatz5uv0jyxen0dj6s",
      "hdIndex": 2
    },
    {
      "bchUtxos": [
        {
          "height": 785736,
          "tx_hash": "03c576c2453e460ffb09958e60bca7cbb73cf786756158943e9c21d0166919e8",
          "tx_pos": 0,
          "value": 20000,
          "txid": "03c576c2453e460ffb09958e60bca7cbb73cf786756158943e9c21d0166919e8",
          "vout": 0,
          "address": "bitcoincash:qpjgv9g4cd8jcmrsxqtlctlqnex5k9pcqu0asral5d",
          "isSlp": false
        },
        {
          "height": 785736,
          "tx_hash": "849130c386aeb9669c27d09ed9361854c76131f9516b1050c80e258da05b5681",
          "tx_pos": 0,
          "value": 10000,
          "txid": "849130c386aeb9669c27d09ed9361854c76131f9516b1050c80e258da05b5681",
          "vout": 0,
          "address": "bitcoincash:qpjgv9g4cd8jcmrsxqtlctlqnex5k9pcqu0asral5d",
          "isSlp": false
        }
      ],
      "address": "bitcoincash:qpjgv9g4cd8jcmrsxqtlctlqnex5k9pcqu0asral5d",
      "hdIndex": 8
    },
    {
      "bchUtxos": [
        {
          "height": 785736,
          "tx_hash": "03c576c2453e460ffb09958e60bca7cbb73cf786756158943e9c21d0166919e8",
          "tx_pos": 1,
          "value": 118548,
          "txid": "03c576c2453e460ffb09958e60bca7cbb73cf786756158943e9c21d0166919e8",
          "vout": 1,
          "address": "bitcoincash:qqksldgl3lmkn7edwxjphftq42ghwn84qyruv28ugh",
          "isSlp": false
        }
      ],
      "address": "bitcoincash:qqksldgl3lmkn7edwxjphftq42ghwn84qyruv28ugh",
      "hdIndex": 10
    }
  ],
  "outputAddr": "bitcoincash:qqpgft0p0kvl76fjdjph32nzgs98r0ma6qhjmrue6q",
  "changeAddr": "bitcoincash:qr0fe9sg5gxr42x5ehhjl976u8gnjx5ypvxzgd2rns"
}

const announceObj01 = {
  from: '12D3KooWP66kG23r7udETp34xbHpZf6bZWTj93vt9dsrS6X11r8D',
  channel: 'bch-coinjoin-001',
  data: {
    ipfsId: '12D3KooWP66kG23r7udETp34xbHpZf6bZWTj93vt9dsrS6X11r8D',
    ipfsMultiaddrs: [Array],
    bchAddr: 'bitcoincash:qpuarugpyvve7m2tpz0xpssnszt29ymlnuc8rfy5qx',
    slpAddr: 'simpleledger:qpuarugpyvve7m2tpz0xpssnszt29ymlnu5ugj357c',
    publicKey: '03ae5aa8b808cccb18c64dff31e730a87f511f7ec5935269f0ffeb61b304517b43',
    type: 'node.js',
    minPlayers: 2,
    maxSats: 148300
  }
}

const announceObj02 = {
  from: '12D3KooWJeDNX2sqoLaeAk9mwZNBoDdeddtcK23U77aBVbiecXVT',
  channel: 'bch-coinjoin-001',
  data: {
    ipfsId: '12D3KooWJeDNX2sqoLaeAk9mwZNBoDdeddtcK23U77aBVbiecXVT',
    ipfsMultiaddrs: [],
    bchAddr: 'bitcoincash:qrkql08gssv9dnhe5dqcgert6nac0xtsws5lpnunaq',
    slpAddr: 'simpleledger:qrkql08gssv9dnhe5dqcgert6nac0xtswscy2gfnr7',
    publicKey: '02145bc1e4c473b5703e2882f66f3b1ce26b6be97c71bd2d950cdf4063fc77c0ae',
    type: 'node.js',
    minPlayers: 2,
    maxSats: 10000
  }
}

const peerUtxos01 = {
  "success": true,
  "status": 200,
  "message": {
    "coinjoinUtxos": [
      {
        "height": 785736,
        "tx_hash": "9866faa00ce60a82a058a579d70a155287c058bbe396d399e6956687da3b0da2",
        "tx_pos": 0,
        "value": 29999,
        "txid": "9866faa00ce60a82a058a579d70a155287c058bbe396d399e6956687da3b0da2",
        "vout": 0,
        "address": "bitcoincash:qqjfpjgnzaqwhxsvtp0x0vxa8gzplmwgrqjg23lusc",
        "isSlp": false,
        "satoshis": 29999,
        "hdIndex": 11
      },
      {
        "height": 785736,
        "tx_hash": "b6be4ea9c429d2b501914179c3288cea4d90c0b73465603c1abe1b8e857e52d2",
        "tx_pos": 0,
        "value": 40000,
        "txid": "b6be4ea9c429d2b501914179c3288cea4d90c0b73465603c1abe1b8e857e52d2",
        "vout": 0,
        "address": "bitcoincash:qqjfpjgnzaqwhxsvtp0x0vxa8gzplmwgrqjg23lusc",
        "isSlp": false,
        "satoshis": 40000,
        "hdIndex": 11
      },
      {
        "height": 785736,
        "tx_hash": "f29fc141851db1eb4a6571827e8a3b3421c167c35ac071a21a62d20c24c98ae7",
        "tx_pos": 0,
        "value": 40000,
        "txid": "f29fc141851db1eb4a6571827e8a3b3421c167c35ac071a21a62d20c24c98ae7",
        "vout": 0,
        "address": "bitcoincash:qpdhzmzqazze6n857q2zsqrjmuzdzkz3z5hmpf2lh2",
        "isSlp": false,
        "satoshis": 40000,
        "hdIndex": 15
      },
      {
        "height": 785736,
        "tx_hash": "f29fc141851db1eb4a6571827e8a3b3421c167c35ac071a21a62d20c24c98ae7",
        "tx_pos": 1,
        "value": 38301,
        "txid": "f29fc141851db1eb4a6571827e8a3b3421c167c35ac071a21a62d20c24c98ae7",
        "vout": 1,
        "address": "bitcoincash:qz0nr3383stpddxwpz5vxxpd2ysnl3dzsgte07rtan",
        "isSlp": false,
        "satoshis": 38301,
        "hdIndex": 16
      }
    ],
    "outputAddr": "bitcoincash:qz0kwhkusfq2mrwddux5q9uxd6g8fer80ve22huh3k",
    "changeAddr": "bitcoincash:qp2wzc2vp687ksf4z0d0th8vutcn98w5j5an5r2ca2",
    "success": true
  },
  "endpoint": "initiate"
}

const initRpcPayload01 = {
  "payload": {
    "jsonrpc": "2.0",
    "id": "0c1e903d-70e1-4b86-8844-840297897748",
    "method": "ccoinjoin",
    "params": {
      "msgType": "colab-coinjoin-init",
      "uuid": "792d833d-7c9c-47eb-8de3-bd5bb9efa2a0",
      "requiredSats": 148300,
      "endpoint": "initiate"
    }
  },
  "type": "request",
  "from": "12D3KooWJeDNX2sqoLaeAk9mwZNBoDdeddtcK23U77aBVbiecXVT"
}

const preTxPeerData01 = {
  "peerCoinJoinData": [
    {
      "ipfsId": "12D3KooWP66kG23r7udETp34xbHpZf6bZWTj93vt9dsrS6X11r8D",
      "bchAddr": "bitcoincash:qpuarugpyvve7m2tpz0xpssnszt29ymlnuc8rfy5qx",
      "slpAddr": "simpleledger:qpuarugpyvve7m2tpz0xpssnszt29ymlnu5ugj357c",
      "publicKey": "03ae5aa8b808cccb18c64dff31e730a87f511f7ec5935269f0ffeb61b304517b43",
      "minPlayers": 2,
      "maxSats": 148300,
      "coinjoinUtxos": [
        {
          "height": 785736,
          "tx_hash": "9866faa00ce60a82a058a579d70a155287c058bbe396d399e6956687da3b0da2",
          "tx_pos": 0,
          "value": 29999,
          "txid": "9866faa00ce60a82a058a579d70a155287c058bbe396d399e6956687da3b0da2",
          "vout": 0,
          "address": "bitcoincash:qqjfpjgnzaqwhxsvtp0x0vxa8gzplmwgrqjg23lusc",
          "isSlp": false,
          "satoshis": 29999,
          "hdIndex": 11
        },
        {
          "height": 785736,
          "tx_hash": "b6be4ea9c429d2b501914179c3288cea4d90c0b73465603c1abe1b8e857e52d2",
          "tx_pos": 0,
          "value": 40000,
          "txid": "b6be4ea9c429d2b501914179c3288cea4d90c0b73465603c1abe1b8e857e52d2",
          "vout": 0,
          "address": "bitcoincash:qqjfpjgnzaqwhxsvtp0x0vxa8gzplmwgrqjg23lusc",
          "isSlp": false,
          "satoshis": 40000,
          "hdIndex": 11
        },
        {
          "height": 785736,
          "tx_hash": "f29fc141851db1eb4a6571827e8a3b3421c167c35ac071a21a62d20c24c98ae7",
          "tx_pos": 0,
          "value": 40000,
          "txid": "f29fc141851db1eb4a6571827e8a3b3421c167c35ac071a21a62d20c24c98ae7",
          "vout": 0,
          "address": "bitcoincash:qpdhzmzqazze6n857q2zsqrjmuzdzkz3z5hmpf2lh2",
          "isSlp": false,
          "satoshis": 40000,
          "hdIndex": 15
        },
        {
          "height": 785736,
          "tx_hash": "f29fc141851db1eb4a6571827e8a3b3421c167c35ac071a21a62d20c24c98ae7",
          "tx_pos": 1,
          "value": 38301,
          "txid": "f29fc141851db1eb4a6571827e8a3b3421c167c35ac071a21a62d20c24c98ae7",
          "vout": 1,
          "address": "bitcoincash:qz0nr3383stpddxwpz5vxxpd2ysnl3dzsgte07rtan",
          "isSlp": false,
          "satoshis": 38301,
          "hdIndex": 16
        }
      ],
      "outputAddr": "bitcoincash:qz0kwhkusfq2mrwddux5q9uxd6g8fer80ve22huh3k",
      "changeAddr": "bitcoincash:qp2wzc2vp687ksf4z0d0th8vutcn98w5j5an5r2ca2"
    }
  ],
  "satsRequired": 148300
}


module.exports = {
  unsignedTxData01,
  peers01,
  psTxs01,
  txObj01,
  startCoinJoinInput01,
  announceObj01,
  announceObj02,
  peerUtxos01,
  initRpcPayload01,
  preTxPeerData01
}

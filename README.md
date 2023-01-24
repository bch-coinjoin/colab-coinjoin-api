# colab-coinjoin-api

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Overview

This is a Koa REST API and JSON RPC server. It is used by [electron-bch-coinjoin-wallet](https://github.com/bch-coinjoin/electron-bch-coinjoin-wallet) to generate p2p CoinJoin transactions for improving privacy on BCH coins and SLP tokens. When started, it launches a local copy of [go-ipfs](https://ipfs.io) and [ipfs-coord](https://www.npmjs.com/package/ipfs-coord). These services automatically find other peers on the IPFS network that want to engage in CoinJoin transactions.

## Requirements

- node **^16.19.0**
- npm **^8.19.3**

## Installation

- `git clone https://github.com/bch-coinjoin/colab-coinjoin-api`
- `cd colab-coinjoin-api`
- `npm install`
- `npm test`

## License

[MIT](./LICENSE.md)

# colab-coinjoin-api

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## CJS Branch
This `cjs` branch is not intended to be merged with the `master` branch. This `cjs` branch contains a CommonJS version of the code, so that this boilerplate can be used in projects that can not take advantage of the ESM version of the code base.

As improvements and changes are made to the `master` branch, it is expected that those changes will be merged into this `cjs` branch.

## Overview

This is a Koa web server that provides both a REST API over HTTP and a JSON RPC over IPFS. This software creates a peer-to-peer network of wallets, allowing them to coordinate CoinJoin transactions.

## Requirements

- node **^14.18.2**
- npm **^8.3.0**
- Docker **^20.10.8**
- Docker Compose **^1.27.4**

## Installation

- `git clone https://github.com/bch-coinjoin/colab-coinjoin-api`

## License

[MIT](./LICENSE.md)

/*
  Adapter library for CoinJoin transactions.

  This library can generate an unsigned CoinJoin TX to distribute to a group
  of peers.
*/

// Global npm libraries
const BCHJS = require('@psf/bch-js')

class CoinJoinAdapter {
  constructor (localConfig = {}) {
    // Encapsulate dependencies
    this.bchjs = new BCHJS()
  }

  // This function creates an unsigned transaction. It expects a single input
  // object with the following properties:
  // - utxos - An array of UTXO Objects, to be spent in the transaction.
  // - outputAddrs - An array of output addresses.
  // - chagneAddrs - An array of change addresses
  createTransaction (inObj = {}) {
    const { utxos, outputAddrs, changeAddrs, satsRequired } = inObj
    console.log(`createTransaction() utxos: ${JSON.stringify(utxos, null, 2)}`)
    console.log(`createTransaction() outputAddrs: ${JSON.stringify(outputAddrs, null, 2)}`)
    console.log(`createTransaction() changeAddrs: ${JSON.stringify(changeAddrs, null, 2)}`)
    console.log(`createTransaction() satsRequired: ${JSON.stringify(satsRequired, null, 2)}`)

    // Input validation
    if (!Array.isArray(utxos)) {
      throw new Error('utxos must be an array of UTXO objects')
    }
    if (!Array.isArray(outputAddrs)) {
      throw new Error('outputs must be an array of output objects')
    }
    if (!Array.isArray(changeAddrs)) {
      throw new Error('changeAddrs must be an array of UTXO objects')
    }
    if (!satsRequired) {
      throw new Error('satsRequired must specify the required amount of sats')
    }

    const transactionBuilder = new this.bchjs.TransactionBuilder()

    // Add Input UTXOs
    utxos.map(x => {
      transactionBuilder.addInput(x.tx_hash, x.tx_pos)
      return false
    })

    // Add CoinJoin Outputs
    outputAddrs.map(x => {
      transactionBuilder.addOutput(x, satsRequired)
      return false
    })

    // Add Change Outputs
    for (let i = 0; i < changeAddrs.length; i++) {
      const thisChangeAddr = changeAddrs[i]

      // Skip this change address if the sats value is less than dust.
      if (thisChangeAddr.changeSats < 546) continue

      transactionBuilder.addOutput(thisChangeAddr.changeAddr, thisChangeAddr.changeSats)
    }

    const tx = transactionBuilder.transaction.buildIncomplete()
    const hex = tx.toHex()

    return hex
  }
}

module.exports = CoinJoinAdapter

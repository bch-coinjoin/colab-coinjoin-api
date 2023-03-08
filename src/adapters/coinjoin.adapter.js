/*
  Adapter library for CoinJoin transactions.

  This library can generate an unsigned CoinJoin TX to distribute to a group
  of peers.
*/

class CoinJoinAdapter {
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

    return 'fake-hex'
  }
}

module.exports = CoinJoinAdapter

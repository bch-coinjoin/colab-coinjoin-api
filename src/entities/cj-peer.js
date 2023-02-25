/*
  CoinJoin Peer Entity
*/

class CJPeer {
  validate (inObj = {}) {
    const { ipfsId, bchAddr, slpAddr, publicKey, minPlayers, maxBch } = inObj

    // Input Validation
    if (!ipfsId || typeof ipfsId !== 'string') {
      throw new Error("Property 'ipfsId' must be a string!")
    }
    if (!bchAddr || typeof bchAddr !== 'string') {
      throw new Error("Property 'bchAddr' must be a string!")
    }
    if (!slpAddr || typeof slpAddr !== 'string') {
      throw new Error("Property 'slpAddr' must be a string!")
    }
    if (!publicKey || typeof publicKey !== 'string') {
      throw new Error("Property 'publicKey' must be a string!")
    }
    if (!minPlayers || typeof minPlayers !== 'number') {
      throw new Error("Property 'minPlayers' must be a string!")
    }
    if (!maxBch || typeof maxBch !== 'number') {
      throw new Error("Property 'maxBch' must be a string!")
    }

    const peerData = { ipfsId, bchAddr, slpAddr, publicKey, minPlayers, maxBch }

    return peerData
  }
}

module.exports = CJPeer

/*
  Mocks for the ipfs-coord library
*/

class IPFSCoord {
  async isReady () {
    return true
  }

  async start () {}

  async subscribeToChat() {}

  async subscribeToCoinJoin() {}
}

module.exports = IPFSCoord

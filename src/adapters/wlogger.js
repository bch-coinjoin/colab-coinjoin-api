/*
  Winston causes errors in Electronjs. This library creates a mock for all
  the calls to winston logger, and passes the inputs to console.log() instead.
*/

class Wlogger {
  info (in1, in2) {
    console.log(in1, in2)
  }

  debug (in1, in2) {
    console.log(in1, in2)
  }

  silly (in1, in2) {
    console.log(in1, in2)
  }

  verbose (in1, in2) {
    console.log(in1, in2)
  }

  error (in1, in2) {
    console.error(in1, in2)
  }
}

const wlogger = new Wlogger()

module.exports = { wlogger, Wlogger }

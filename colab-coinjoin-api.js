/*
  This file is called by 'npm start' to start the server.
*/

const Server = require('./bin/server.js')
const server = new Server()

server.startServer()

/*
  This file is called by 'npm start' to start the server.
*/

import Server from './bin/server.js'
const server = new Server()

server.startServer()

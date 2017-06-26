const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const battlekards = require('./battlekards/battlekards');

const app = express();
app.use(express.static('public'));

const httpServer = http.Server(app);
const io = socketIo(httpServer);

battlekards.initialiseBattlekardsSocketIo(io);

const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  console.log('Express server listening on port:', port);
});

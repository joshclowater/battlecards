// For socket io
var http = require('http');
var socketIo = require('socket.io');
var battlekards = require('../src/server/battlekards');

var express = require('express');
var serveStatic = require('serve-static');
app = express();
app.use(serveStatic('./dist'));
var port = process.env.PORT || 5000;

// Init battlekards
var httpServer = http.Server(app);
var io = socketIo(httpServer);
battlekards.initialiseBattlekardsSocketIo(io);
httpServer.listen(port, () => {
  console.log('>> Express server listening on port:', port);
});

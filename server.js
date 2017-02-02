var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var uuid = require('uuid/v4');

var app = express();
app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

var server = require('http').createServer(app);
var io = require('socket.io')(server);

var games = {
  // Games will be stored here with uuids as keys
  gameWithPlayerWaiting: undefined
};
var sockets = {};

io.sockets.on('connection', function(socket) {
  var game;
  var playerId = uuid();
  sockets[playerId] = socket;

  if (games.gameWithPlayerWaiting === undefined) {
    var gameId = uuid();
    games.gameWithPlayerWaiting = gameId;
    games[gameId] = {
      id: gameId,
      gameStarted: false,
      playerOne: {
        playerId
      }
    };
    game = games[gameId];

    console.log('Player one (' + playerId + ') joined game ' + game.id);

    socket.emit('waitingForAnotherPlayer');
  } else {
    game = games[games.gameWithPlayerWaiting];
    games.gameWithPlayerWaiting = undefined;
    game.playerTwo = { playerId };
    if (Math.random() > 0.5) {
      game.playersTurn = game.playerOne.playerId;
      game.inactivePlayer = game.playerTwo.playerId;
    } else {
      game.playersTurn = game.playerTwo.playerId;
      game.inactivePlayer = game.playerOne.playerId;
    }
    game.gameStarted = true;

    console.log('Player two (' + playerId + ') joined game ' + game.id);

    sockets[game.playerOne.playerId].emit('gameStarted', { game, playerId: game.playerOne.playerId });
    socket.emit('gameStarted', { game, playerId });
  }

  socket.on('endTurn', function() {
    console.log('Turn ended by', playerId);
    if (game.gameStarted && game.playersTurn === playerId) {
      const playersTurn = game.inactivePlayer;
      game.inactivePlayer = game.playersTurn;
      game.playersTurn = playersTurn;

      sockets[game.playersTurn].emit('turnEnded', { playersTurn: game.playersTurn });
      sockets[game.inactivePlayer].emit('turnEnded', { playersTurn: game.playersTurn });
    } else {
      socket.emit('invalidMove', 'Not your turn');
    }
  });

  socket.on('disconnect', function() {
    console.error('Player ' + playerId + ' disconnected');
  });
});

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

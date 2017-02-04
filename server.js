var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var _ = require('lodash');
var uuid = require('uuid/v4');

var deckFile = require('./src/deck');

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
      players: {},
    };
    game = games[gameId];
    game.players[playerId] = {
      playerId,
      deck: _.cloneDeep(deckFile.deck)
    }

    console.log('First player (' + playerId + ') joined game ' + game.id);

    socket.emit('waitingForAnotherPlayer');
  } else {
    game = games[games.gameWithPlayerWaiting];
    games.gameWithPlayerWaiting = undefined;
    game.players[playerId] = {
      playerId,
      deck: _.cloneDeep(deckFile.deck)
    };

    if (Math.random() > 0.5) {
      game.playersTurn = Object.keys(game.players)[0];
      game.inactivePlayer =  Object.keys(game.players)[1];
    } else {
      game.playersTurn =  Object.keys(game.players)[1];
      game.inactivePlayer =  Object.keys(game.players)[0];
    }
    game.gameStarted = true;

    console.log('Second player (' + playerId + ') joined game ' + game.id);

    sockets[game.playersTurn].emit('gameStarted', {
      playerId: game.playersTurn,
      playersTurn: game.playersTurn,
      myDeckSize: game.players[game.playersTurn].deck.length,
      opponentsDeckSize: game.players[game.inactivePlayer].deck.length
    });
    sockets[game.inactivePlayer].emit('gameStarted', {
      playerId: game.inactivePlayer,
      playersTurn: game.playersTurn,
      myDeckSize: game.players[game.inactivePlayer].deck.length,
      opponentsDeckSize: game.players[game.playersTurn].deck.length
    });
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
    // TODO kill game when one or more players disconnect, send appropriate responses
    console.error('Player ' + playerId + ' disconnected');
  });
});

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

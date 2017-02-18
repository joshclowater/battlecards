var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var _ = require('lodash');
var uuid = require('uuid/v4');

var deckUtils = require('./src/deck');

var app = express();
app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

var server = require('http').createServer(app);
var io = require('socket.io')(server);

// Constants
var numCardsOnGameStart = 5;
var numShieldsOnGameStart = 3;

// Game/session data
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
      deck: _.cloneDeep(deckUtils.deck),
      hand: [],
      shields: []
    };
    for (var i = 0; i < numCardsOnGameStart; i++) {
      game.players[playerId].hand.push(deckUtils.drawFrom(game.players[playerId].deck));
    }
    for (var i = 0; i < numShieldsOnGameStart; i++) {
      game.players[playerId].shields.push(deckUtils.drawFrom(game.players[playerId].deck));
    }

    console.log('First player (' + playerId + ') joined game ' + game.id);

    socket.emit('waitingForAnotherPlayer');
  } else {
    game = games[games.gameWithPlayerWaiting];
    games.gameWithPlayerWaiting = undefined;
    game.players[playerId] = {
      playerId,
      deck: _.cloneDeep(deckUtils.deck),
      hand: [],
      shields: []
    };
    for (var i = 0; i < numCardsOnGameStart; i++) {
      game.players[playerId].hand.push(deckUtils.drawFrom(game.players[playerId].deck));
    }
    for (var i = 0; i < numShieldsOnGameStart; i++) {
      game.players[playerId].shields.push(deckUtils.drawFrom(game.players[playerId].deck));
    }

    // Randomly set who goes first
    if (Math.random() > 0.5) {
      game.playersTurn = Object.keys(game.players)[0];
      game.inactivePlayer =  Object.keys(game.players)[1];
    } else {
      game.playersTurn =  Object.keys(game.players)[1];
      game.inactivePlayer =  Object.keys(game.players)[0];
    }
    game.gameStarted = true;

    console.log('Second player (' + playerId + ') joined game ' + game.id);

    sockets[game.playersTurn].emit('gameStarted', createGameToSend(game, game.playersTurn, game.inactivePlayer));
    sockets[game.inactivePlayer].emit('gameStarted', createGameToSend(game, game.inactivePlayer, game.playersTurn));
  }

  socket.on('endTurn', function() {
    console.log('Turn ended by', playerId);
    if (game.gameStarted && game.playersTurn === playerId) {
      // Switch whose turn it is
      const playersTurn = game.inactivePlayer;
      game.inactivePlayer = game.playersTurn;
      game.playersTurn = playersTurn;

      // Active player draw card
      const cardDrawn = deckUtils.drawFrom(game.players[game.playersTurn].deck);
      game.players[game.playersTurn].hand.push(cardDrawn);

      sockets[game.playersTurn].emit('turnEnded', {
        playersTurn: game.playersTurn,
        cardDrawn,
        myDeckSize: game.players[game.playersTurn].deck.length
      });
      sockets[game.inactivePlayer].emit('turnEnded', {
        playersTurn: game.playersTurn,
        opponentsDeckSize: game.players[game.playersTurn].deck.length
      });
    } else {
      socket.emit('invalidMove', 'Not your turn');
    }
  });

  socket.on('disconnect', function() {
    // If only one player waiting
    if (games.gameWithPlayerWaiting === game.id) {
      delete sockets[playerId];
      delete games[game.id];
      games.gameWithPlayerWaiting = undefined;
      console.log('killed 1P game. sockets:', Object.keys(sockets).length, 'games:', Object.keys(games).length - 1);
    } else {
      const otherPlayerId = Object.keys(game.players).find(function(gamePlayerId) {
        return gamePlayerId !== playerId;
      });
      sockets[otherPlayerId].emit('win', 'Other player left');
      sockets[otherPlayerId].disconnect(true);
      delete sockets[otherPlayerId];
      delete sockets[playerId];
      delete games[game.id];
      console.log('killed 2P game. sockets:', Object.keys(sockets).length, 'games:', Object.keys(games).length - 1);
    }
  });
});

function createGameToSend(game, me, otherPlayer) {
  return {
    playerId: me,
    playersTurn: game.playersTurn,
    myDeckSize: game.players[me].deck.length,
    myShieldsSize: game.players[me].shields.length,
    myHand: game.players[me].hand,
    opponentsDeckSize: game.players[otherPlayer].deck.length,
    opponentsShieldsSize: game.players[otherPlayer].shields.length,
    opponentsHandSize: game.players[otherPlayer].hand.length
  };
}

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

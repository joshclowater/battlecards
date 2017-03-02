const _ = require('lodash');
const bodyParser = require('body-parser');
const ejs = require('ejs')
const express = require('express');
const logger = require('morgan');
const path = require('path');
const uuid = require('uuid/v4');

const deckUtils = require('./src/deck');

const app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('port', process.env.PORT || 3000);
app.set('views', './views');
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

// Create home route
app.get('/', (req, res) => {
  return res.render('index');
});

const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Game constants
const numCardsOnGameStart = 5;
const numShieldsOnGameStart = 3;

// Games will be stored here with uuids as keys
const games = {
  gameWithPlayerWaiting: undefined
};
// Player's sockets stored here with uuids as keys
const sockets = {};

io.sockets.on('connection', function(socket) {
  let game;
  const playerId = uuid();
  sockets[playerId] = socket;

  if (games.gameWithPlayerWaiting === undefined) {
    const gameId = uuid();
    games.gameWithPlayerWaiting = gameId;
    games[gameId] = {
      id: gameId,
      gameStarted: false,
      players: {}

    };
    game = games[gameId];
    game.players[playerId] = {
      playerId,
      deck: _.cloneDeep(deckUtils.deck),
      hand: [],
      shields: [],
      monsters:[],
      hasSummoned: false //To prevent summoner from summoning more than once

    };
    for (let i = 0; i < numCardsOnGameStart; i++) {
      game.players[playerId].hand.push(deckUtils.drawFrom(game.players[playerId].deck));
    }
    for (let i = 0; i < numShieldsOnGameStart; i++) {
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
      shields: [],
      monsters:[],
      hasSummoned: false,
    };
    for (let i = 0; i < numCardsOnGameStart; i++) {
      game.players[playerId].hand.push(deckUtils.drawFrom(game.players[playerId].deck));
    }
    for (let i = 0; i < numShieldsOnGameStart; i++) {
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
      game.players[game.playersTurn].hasSummoned=false;
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
        opponentsDeckSize: game.players[game.playersTurn].deck.length,
        myhandSize: game.players[game.playersTurn].hand.length
      });
    } else {
      socket.emit('invalidMove', 'Not your turn');
    }
  });

    //Function for Summon button, for player summoning
  socket.on('summon', function(cardId) {

    if (game.gameStarted && game.playersTurn === playerId && !game.players[playerId].hasSummoned){ // prevents multiple summoning

      game.players[playerId].hasSummoned = true; //player cannot summon again

      var monsterIndex = game.players[game.playersTurn].hand.findIndex(function(cardInHand) { // find card index
        return cardInHand.id === cardId;
      });

      var monster = _.cloneDeep(game.players[game.playersTurn].hand[monsterIndex]);

      game.players[game.playersTurn].hand.splice(monsterIndex, 1); // remove monster from hand

      game.players[game.playersTurn].monsters.push(monster);// add monster

      // pass cloned info?? of monster
      socket.emit('summoned', monster);
      sockets[game.inactivePlayer].emit('opponentSummoned', {
        monster,
        opponentsHandSize: game.players[game.playersTurn].hand.length
      }); //Show monster on opponents UI

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
      // TODO don't re-do this when other player disconnects
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

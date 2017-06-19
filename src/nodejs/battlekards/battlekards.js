const _ = require('lodash');
const uuid = require('uuid/v4');

const deckUtils = require('./deck');

// Game constants
const numCardsOnGameStart = 5;
const numShieldsOnGameStart = 3;

// Games will be stored here with uuids as keys
const games = {
  gameWithPlayerWaiting: undefined
};
// Player's sockets stored here with uuids as keys
const sockets = {};

exports.initialiseBattlekardsSocketIo = function initialiseBattlekardsSocketIo(io) {
  io.sockets.on('connection', (socket) => {
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
        monsters: [],
        hasSummoned: false
      };
      for (let i = 0; i < numCardsOnGameStart; i += 1) {
        game.players[playerId].hand.push(deckUtils.drawFrom(game.players[playerId].deck));
      }
      for (let i = 0; i < numShieldsOnGameStart; i += 1) {
        game.players[playerId].shields.push(deckUtils.drawFrom(game.players[playerId].deck));
      }

      console.log('First player (', playerId, ') joined game ', game.id);

      socket.emit('waitingForAnotherPlayer');
    } else {
      game = games[games.gameWithPlayerWaiting];
      games.gameWithPlayerWaiting = undefined;
      game.players[playerId] = {
        playerId,
        deck: _.cloneDeep(deckUtils.deck),
        hand: [],
        shields: [],
        monsters: [],
        hasSummoned: false
      };
      for (let i = 0; i < numCardsOnGameStart; i += 1) {
        game.players[playerId].hand.push(deckUtils.drawFrom(game.players[playerId].deck));
      }
      for (let i = 0; i < numShieldsOnGameStart; i += 1) {
        game.players[playerId].shields.push(deckUtils.drawFrom(game.players[playerId].deck));
      }

      // Randomly set who goes first
      if (Math.random() > 0.5) {
        game.playersTurn = Object.keys(game.players)[0];
        game.inactivePlayer = Object.keys(game.players)[1];
      } else {
        game.playersTurn = Object.keys(game.players)[1];
        game.inactivePlayer = Object.keys(game.players)[0];
      }
      game.gameStarted = true;

      console.log('Second player (', playerId, ') joined game ', game.id);

      sockets[game.playersTurn].emit('gameStarted', createGameToSend(game, game.playersTurn, game.inactivePlayer));
      sockets[game.inactivePlayer].emit('gameStarted', createGameToSend(game, game.inactivePlayer, game.playersTurn));
    }

    socket.on('endTurn', () => {
      console.log('Turn ended by', playerId);
      if (game.gameStarted && game.playersTurn === playerId) {
        // Switch whose turn it is
        const playersTurn = game.inactivePlayer;
        game.inactivePlayer = game.playersTurn;
        game.playersTurn = playersTurn;
        // Set status of attack monsters
        game.players[game.playersTurn].monsters = game.players[game.playersTurn].monsters.map(monster =>
          Object.assign(monster, { canAttack: true })
        );
        // Allow for summon
        game.players[game.playersTurn].hasSummoned = false;
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
          opponentsHandSize: game.players[game.playersTurn].hand.length,
          opponentsDeckSize: game.players[game.playersTurn].deck.length
        });
      } else {
        socket.emit('invalidMove', 'Not your turn');
      }
    });

    socket.on('summon', (cardId) => {
      if (game.gameStarted && game.playersTurn === playerId && !game.players[playerId].hasSummoned) {
        const monsterIndex = game.players[game.playersTurn].hand.findIndex(cardInHand =>
          cardInHand.id === cardId
        );
        if (monsterIndex !== -1) {
          const monster = _.cloneDeep(game.players[game.playersTurn].hand[monsterIndex]);
          monster.canAttack = false;

          game.players[playerId].hasSummoned = true; // Player cannot summon again
          game.players[game.playersTurn].hand.splice(monsterIndex, 1);
          game.players[game.playersTurn].monsters.push(monster);

          socket.emit('summoned', monster);
          sockets[game.inactivePlayer].emit('opponentSummoned', {
            monster,
            opponentsHandSize: game.players[game.playersTurn].hand.length
          });
        } else {
          socket.emit('invalidMove', 'card not in hand');
        }
      } else if (!(game.gameStarted && game.playersTurn === playerId)) {
        socket.emit('invalidMove', 'not your turn');
      } else {
        socket.emit('invalidMove', 'you already summoned');
      }
    });

    socket.on('attack', (attackingMonsterId, target) => {
      if (game.gameStarted && game.playersTurn === playerId) {
        const attackingMonster = game.players[game.playersTurn].monsters.find(cardInHand =>
          cardInHand.id === attackingMonsterId
        );
        if (attackingMonster !== undefined) {
          if (attackingMonster.canAttack) {
            if (target === 'shield' && game.players[game.inactivePlayer].shields.length > 0) {
              // Move shield into hand
              const shield = deckUtils.drawFrom(game.players[game.inactivePlayer].shields);
              game.players[game.inactivePlayer].hand.push(shield);
              attackingMonster.canAttack = false;
              socket.emit('attacked', attackingMonsterId, target);
              sockets[game.inactivePlayer].emit('opponentAttacked', attackingMonsterId, target, { shield });
            } else if (target === 'player' && game.players[game.inactivePlayer].shields.length === 0) {
              // End game
              games[game.id].gameOver = true;
              socket.emit('win', 'Destroyed opponent');
              sockets[game.inactivePlayer].emit('lose', 'You were detroyed');
              socket.disconnect(true);
              delete sockets[playerId];
              sockets[game.inactivePlayer].disconnect(true);
              delete sockets[game.inactivePlayer];
              delete games[game.id];
            } else {
              const targetMonster = _.cloneDeep(game.players[game.inactivePlayer].monsters.find(opponentMonster =>
                opponentMonster.id === target
              ));
              const destroyedMonsters = [];
              if (targetMonster !== undefined) {
                if (targetMonster.attributes.attack < attackingMonster.attributes.attack) {
                  game.players[game.inactivePlayer].monsters = game.players[game.inactivePlayer].monsters.filter(monster =>
                    monster.id !== target
                  );
                  destroyedMonsters.push(target);
                } else if (targetMonster.attributes.attack > attackingMonster.attributes.attack) {
                  game.players[game.playersTurn].monsters = game.players[game.playersTurn].monsters.filter(monster =>
                    monster.id !== attackingMonster.id
                  );
                  destroyedMonsters.push(attackingMonsterId);
                } else {
                  game.players[game.inactivePlayer].monsters = game.players[game.inactivePlayer].monsters.filter(monster =>
                    monster.id !== target
                  );
                  game.players[game.playersTurn].monsters = game.players[game.playersTurn].monsters.filter(monster =>
                    monster.id !== attackingMonster.id
                  );
                  destroyedMonsters.push(targetMonster);
                  destroyedMonsters.push(attackingMonsterId);
                }
                console.log(`${attackingMonster.name} (Atk: ${attackingMonster.attributes.attack}) attacked ${targetMonster.name} (Atk: ${targetMonster.attributes.attack})`);
                socket.emit('attacked', attackingMonsterId, target, { destroyedMonsters });
                sockets[game.inactivePlayer].emit('opponentAttacked', attackingMonsterId, target, { destroyedMonsters });
              } else {
                socket.emit('invalidMove', 'invalid target');
              }
            }
          } else {
            socket.emit('invalidMove', 'monster cannot attack');
          }
        } else {
          socket.emit('invalidMove', 'no monster with that id');
        }
      } else {
        socket.emit('invalidMove', 'not your turn');
      }
    });

    // On player disconnect, other player wins
    socket.on('disconnect', () => {
      // If only one player waiting
      if (games.gameWithPlayerWaiting === game.id) {
        delete sockets[playerId];
        delete games[game.id];
        games.gameWithPlayerWaiting = undefined;
        console.log('killed 1P game. sockets:', Object.keys(sockets).length, 'games:', Object.keys(games).length - 1);
      } else if (games[game.id] && games[game.id].gameOver !== true) {
        const otherPlayerId = Object.keys(game.players).find(gamePlayerId =>
          gamePlayerId !== playerId
        );
        sockets[otherPlayerId].emit('win', 'Other player left');
        games[game.id].gameOver = true;
        sockets[otherPlayerId].disconnect(true);
        delete sockets[otherPlayerId];
        delete sockets[playerId];
        delete games[game.id];
        console.log('killed 2P game. sockets:', Object.keys(sockets).length, 'games:', Object.keys(games).length - 1);
      }
    });
  });
};

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

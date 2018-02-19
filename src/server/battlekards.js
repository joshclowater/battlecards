const _ = require('lodash');
const uuid = require('uuid/v4');

const deckUtils = require('./deck');

// Game constants
const NUM_CARDS_ON_GAME_START = 5;
const NUM_SHIELDS_ON_GAME_START = 3;

// Games will be stored here with uuids as keys
const games = {
  gameWithPlayerWaiting: undefined,
};
// Player's sockets stored here with uuids as keys
const sockets = {};

exports.initialiseBattlekardsSocketIo = function initialiseBattlekardsSocketIo(io) {
  console.log('>> Initialising battlekards io sockets');
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
        players: {},
      };
      game = games[gameId];
      game.players[playerId] = {
        playerId,
        deck: deckUtils.createDeck(),
        hand: [],
        shields: [],
        monsters: [],
        traps: [],
        hasSummoned: false,
      };
      game.players[playerId].hand.push({
        id: uuid(),
        name: 'Trapping pit',
        type: 'trap',
        effect: 'destroyMonster',
        description: 'These pits, which can measure up to 4 by 7 metres (13 ft × 23 ft) in size and be up to several metres deep, were camouflaged with branches and leaves.',
      });
      for (let i = 0; i < NUM_CARDS_ON_GAME_START; i += 1) {
        game.players[playerId].hand.push(deckUtils.drawFrom(game.players[playerId].deck));
      }
      for (let i = 0; i < NUM_SHIELDS_ON_GAME_START; i += 1) {
        game.players[playerId].shields.push(deckUtils.drawFrom(game.players[playerId].deck));
      }

      console.log('First player (', playerId, ') joined game ', game.id);

      socket.emit('waitingForAnotherPlayer');
    } else {
      game = games[games.gameWithPlayerWaiting];
      games.gameWithPlayerWaiting = undefined;
      game.players[playerId] = {
        playerId,
        deck: deckUtils.createDeck(),
        hand: [],
        shields: [],
        monsters: [],
        traps: [],
        hasSummoned: false,
      };
      game.players[playerId].hand.push({
        id: uuid(),
        name: 'Trapping pit',
        type: 'trap',
        effect: 'destroyMonster',
        description: 'These pits, which can measure up to 4 by 7 metres (13 ft × 23 ft) in size and be up to several metres deep, were camouflaged with branches and leaves.',
      });
      for (let i = 0; i < NUM_CARDS_ON_GAME_START; i += 1) {
        game.players[playerId].hand.push(deckUtils.drawFrom(game.players[playerId].deck));
      }
      for (let i = 0; i < NUM_SHIELDS_ON_GAME_START; i += 1) {
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
        game.players[game.playersTurn].monsters =
          game.players[game.playersTurn].monsters.map(monster => (
            Object.assign(monster, { canAttack: true })
          ));
        // Allow for summon
        game.players[game.playersTurn].hasSummoned = false;
        // Active player draw card
        const cardDrawn = deckUtils.drawFrom(game.players[game.playersTurn].deck);
        game.players[game.playersTurn].hand.push(cardDrawn);

        sockets[game.playersTurn].emit('opponentTurnEnded', {
          cardDrawn,
          myDeckSize: game.players[game.playersTurn].deck.length,
        });
        sockets[game.inactivePlayer].emit('turnEnded', {
          opponentsHandSize: game.players[game.playersTurn].hand.length,
          opponentsDeckSize: game.players[game.playersTurn].deck.length,
        });
      } else {
        socket.emit('invalidMove', 'Not your turn');
      }
    });

    socket.on('summon', (cardId) => {
      if (game.gameStarted &&
          game.playersTurn === playerId &&
          !game.players[playerId].hasSummoned) {
        const monsterIndex = game.players[game.playersTurn].hand.findIndex(cardInHand => (
          cardInHand.id === cardId
        ));
        if (monsterIndex !== -1) {
          const monster = _.cloneDeep(game.players[game.playersTurn].hand[monsterIndex]);
          if (monster.type === 'monster') {
            monster.canAttack = false;

            game.players[playerId].hasSummoned = true; // Player cannot summon again
            game.players[game.playersTurn].hand.splice(monsterIndex, 1);
            game.players[game.playersTurn].monsters.push(monster);

            socket.emit('summoned', monster);
            sockets[game.inactivePlayer].emit('opponentSummoned', {
              monster,
              opponentsHandSize: game.players[game.playersTurn].hand.length,
            });
          } else {
            socket.emit('invalidMove', 'card is not monster');
          }
        } else {
          socket.emit('invalidMove', 'card not in hand');
        }
      } else if (!(game.gameStarted && game.playersTurn === playerId)) {
        socket.emit('invalidMove', 'not your turn');
      } else {
        socket.emit('invalidMove', 'you already summoned');
      }
    });

    socket.on('setTrap', (cardId) => {
      if (game.gameStarted &&
          game.playersTurn === playerId) {
        const cardIndex = game.players[game.playersTurn].hand.findIndex(cardInHand => (
          cardInHand.id === cardId
        ));
        if (cardIndex !== -1) {
          const trap = _.cloneDeep(game.players[game.playersTurn].hand[cardIndex]);
          if (trap.type === 'trap') {
            game.players[game.playersTurn].hand.splice(cardIndex, 1);
            game.players[game.playersTurn].traps.push(trap);

            socket.emit('trapSet', trap);
            sockets[game.inactivePlayer].emit('opponentTrapSet');
          } else {
            socket.emit('invalidMove', 'card is not trap');
          }
        } else {
          socket.emit('invalidMove', 'card not in hand');
        }
      } else {
        socket.emit('invalidMove', 'not your turn');
      }
    });

    const attackShield = (attackingMonster) => {
      // Move shield into hand
      const shield = deckUtils.drawFrom(game.players[game.inactivePlayer].shields);
      game.players[game.inactivePlayer].hand.push(shield);
      attackingMonster.canAttack = false; // eslint-disable-line
      sockets[game.playersTurn].emit('attacked', attackingMonster.id, 'shield');
      sockets[game.inactivePlayer].emit('opponentAttacked', attackingMonster.id, 'shield', { shield });
    };

    const endGame = () => {
      games[game.id].gameOver = true;
      sockets[game.playersTurn].emit('win');
      sockets[game.inactivePlayer].emit('lose');
      sockets[game.playersTurn].disconnect(true);
      delete sockets[playerId];
      sockets[game.inactivePlayer].disconnect(true);
      delete sockets[game.inactivePlayer];
      delete games[game.id];
    };

    const attackMonster = (targetMonster, attackingMonster) => {
      const target = targetMonster.id;
      const attackingMonsterId = attackingMonster.id;
      const destroyedMonsters = [];
      if (targetMonster.attributes.attack < attackingMonster.attributes.attack) {
        game.players[game.inactivePlayer].monsters =
          game.players[game.inactivePlayer].monsters.filter(monster => (
            monster.id !== target
          ));
        destroyedMonsters.push(target);
      } else if (targetMonster.attributes.attack > attackingMonster.attributes.attack) {
        game.players[game.playersTurn].monsters =
          game.players[game.playersTurn].monsters.filter(monster => (
            monster.id !== attackingMonster.id
          ));
        destroyedMonsters.push(attackingMonsterId);
      } else {
        game.players[game.inactivePlayer].monsters =
          game.players[game.inactivePlayer].monsters.filter(monster => (
            monster.id !== target
          ));
        game.players[game.playersTurn].monsters =
          game.players[game.playersTurn].monsters.filter(monster => (
            monster.id !== attackingMonster.id
          ));
        destroyedMonsters.push(target);
        destroyedMonsters.push(attackingMonsterId);
      }
      console.log(`${attackingMonster.name} (Atk: ${attackingMonster.attributes.attack}) attacked ${targetMonster.name} (Atk: ${targetMonster.attributes.attack})`);
      sockets[game.playersTurn].emit('attacked', attackingMonsterId, target, { destroyedMonsters });
      sockets[game.inactivePlayer].emit('opponentAttacked', attackingMonsterId, target, { destroyedMonsters });
    };

    socket.on('attack', (attackingMonsterId, target) => {
      console.log('attack', attackingMonsterId, target);

      if (game.gameStarted && game.playersTurn === playerId) {
        const attackingMonster = game.players[game.playersTurn].monsters.find(cardInHand => (
          cardInHand.id === attackingMonsterId
        ));
        if (attackingMonster !== undefined) {
          if (attackingMonster.canAttack) {
            if (target === 'shield' && game.players[game.inactivePlayer].shields.length > 0) {
              if (game.players[game.inactivePlayer].traps.length) {
                game.playersTurn = `${game.playersTurn}-trapPhase`;
                game.currentAttack = {
                  target,
                  attackingMonster,
                };
                socket.emit('opponentTrapPhase');
                sockets[game.inactivePlayer].emit('trapPhase', attackingMonster.id, target);
              } else {
                attackShield(attackingMonster);
              }
            } else if (target === 'player' && game.players[game.inactivePlayer].shields.length === 0) {
              if (game.players[game.inactivePlayer].traps.length) {
                game.playersTurn = `${game.playersTurn}-trapPhase`;
                game.currentAttack = {
                  target,
                  attackingMonster,
                };
                socket.emit('opponentTrapPhase');
                sockets[game.inactivePlayer].emit('trapPhase', attackingMonster.id, target);
              } else {
                endGame();
              }
            } else {
              const targetMonster = _.cloneDeep((
                game.players[game.inactivePlayer].monsters.find(opponentMonster => (
                  opponentMonster.id === target
                ))
              ));
              if (targetMonster !== undefined) {
                if (game.players[game.inactivePlayer].traps.length) {
                  game.playersTurn = `${game.playersTurn}-trapPhase`;
                  game.currentAttack = {
                    target: targetMonster,
                    attackingMonster,
                  };
                  socket.emit('opponentTrapPhase');
                  sockets[game.inactivePlayer].emit('trapPhase', attackingMonster.id, target);
                } else {
                  attackMonster(targetMonster, attackingMonster);
                }
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

    const attackFromTrapPhase = () => {
      game.playersTurn = game.playersTurn.slice(0, game.playersTurn.indexOf('-trapPhase'));
      if (game.currentAttack.target === 'shield') {
        attackShield(game.currentAttack.attackingMonster);
      } else if (game.currentAttack.target === 'opponent') {
        endGame();
      } else {
        attackMonster(game.currentAttack.target, game.currentAttack.attackingMonster);
      }
      delete game.currentAttack;
    };

    socket.on('activateTrap', (trapId) => {
      const otherPlayerId = Object.keys(game.players).find(gamePlayerId => (
        gamePlayerId !== playerId
      ));
      if (game.gameStarted && game.playersTurn === `${otherPlayerId}-trapPhase`) {
        if (trapId !== 'skip') {
          const trap = game.players[playerId].traps.find(trapLayed => (
            trapLayed.id === trapId
          ));
          if (trap !== undefined) {
            if (trap.effect === 'none') {
              game.players[playerId].traps.filter(trapLayed => (
                trapLayed.id !== trapId
              ));
              socket.emit('trapActivated', trapId, 'none');
              sockets[otherPlayerId].emit('opponentTrapActivated', trap, 'none');
            } else if (trap.effect === 'destroyMonster') {
              game.players[otherPlayerId].monsters.filter(monster => (
                monster !== game.currentAttack.attackingMonster.id
              ));
              game.players[playerId].traps.filter(trapLayed => (
                trapLayed.id !== trapId
              ));
              socket.emit('trapActivated', trapId, 'destroyedMonsters', [game.currentAttack.attackingMonster.id]);
              sockets[otherPlayerId].emit('opponentTrapActivated', trap, 'destroyedMonsters', [game.currentAttack.attackingMonster.id]);
              game.playersTurn = game.playersTurn.slice(0, game.playersTurn.indexOf('-trapPhase'));
              delete game.currentAttack;
              return;
            } else {
              socket.emit('invalidMove', 'unhandled trap effect');
              console.log('Unhandled trap effect: ', trap.effect);
              return;
            }

            attackFromTrapPhase();
          } else {
            socket.emit('invalidMove', 'trap card not set');
          }
        } else {
          socket.emit('trapPhaseEnded');
          sockets[otherPlayerId].emit('opponentTrapPhaseEnded');
          attackFromTrapPhase();
        }
      } else {
        socket.emit('invalidMove', 'not your trap phase');
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
        const otherPlayerId = Object.keys(game.players).find(gamePlayerId => (
          gamePlayerId !== playerId
        ));
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
    opponentId: otherPlayer,
    opponentsDeckSize: game.players[otherPlayer].deck.length,
    opponentsShieldsSize: game.players[otherPlayer].shields.length,
    opponentsHandSize: game.players[otherPlayer].hand.length,
  };
}

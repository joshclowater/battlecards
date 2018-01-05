/* eslint-disable no-param-reassign */

import * as types from './mutation-types';

export default {

  [types.SET_IS_LANDSCAPE](state, isLandscape) {
    state.isLandscape = isLandscape;
  },

  [types.SET_GAME_STATUS](state, gameStatus) {
    state.gameStatus = gameStatus;
  },

  [types.START_GAME](state, response) {
    state.gameStatus = 'playing';
    state.playersTurn = response.playersTurn;
    state.opponent = {
      deckSize: response.opponentsDeckSize,
      shieldsSize: response.opponentsShieldsSize,
      handSize: response.opponentsHandSize,
      monsters: [],
    };
    state.myPlayer = {
      playerId: response.playerId,
      deckSize: response.myDeckSize,
      shieldsSize: response.myShieldsSize,
      hand: response.myHand,
      monsters: [],
      hasSummoned: false,
    };
  },

  [types.TURN_ENDED](state, response) {
    state.playersTurn = state.opponent.playerId;
    state.opponent.handSize = response.opponentsHandSize;
    state.opponent.deckSize = response.opponentsDeckSize;
  },

  [types.OPPONENT_TURN_ENDED](state, response) {
    state.playersTurn = state.myPlayer.playerId;
    state.myPlayer.hand.push(response.cardDrawn);
    state.myPlayer.deckSize = response.myDeckSize;
    state.myPlayer.hasSummoned = false;
    state.myPlayer.monsters = state.myPlayer.monsters.map(monster => (
      Object.assign(monster, { canAttack: true })
    ));
  },

  [types.SUMMONED](state, card) {
    const monsterIndex = state.myPlayer.hand.findIndex(cardInHand => (
      cardInHand.id === card.id
    ));
    state.myPlayer.hand.splice(monsterIndex, 1);
    state.myPlayer.monsters.push(card);
    state.myPlayer.hasSummoned = true;

    state.selectedCard = undefined;
  },

  [types.OPPONENT_SUMMONED](state, response) {
    state.opponent.monsters.push(response.monster);
    state.opponent.handSize = response.opponentsHandSize;
  },

  [types.ATTACKED](state, response) {
    const myMonster = state.myPlayer.monsters.find(cardInHand => (
      cardInHand.id === response.attackingMonsterId
    ));
    myMonster.canAttack = false;
    if (response.target === 'shield') {
      state.opponent.shieldsSize -= 1;
    } else {
      response.results.destroyedMonsters.forEach((destroyedMonsterId) => {
        state.myPlayer.monsters = state.myPlayer.monsters.filter(monster => (
          monster.id !== destroyedMonsterId
        ));
        state.opponent.monsters = state.opponent.monsters.filter(monster => (
          (monster.id !== destroyedMonsterId)
        ));
      });
    }
    state.selectedCard = undefined;
  },

  [types.OPPONENT_ATTACKED](state, response) {
    if (response.target === 'shield') {
      state.myPlayer.shieldsSize -= 1;
      state.myPlayer.hand.push(response.results.shield);
    } else {
      response.results.destroyedMonsters.forEach((destroyedMonsterId) => {
        state.myPlayer.monsters = state.myPlayer.monsters.filter(monster => (
          monster.id !== destroyedMonsterId
        ));
        state.opponent.monsters = state.opponent.monsters.filter(monster => (
          monster.id !== destroyedMonsterId
        ));
      });
    }
  },

  [types.SET_SELECTED_CARD](state, selectedCard) {
    state.selectedCard = selectedCard;
  },

  [types.SET_SHOW_MODAL](state, showModal) {
    state.showModal = showModal;
  },
};

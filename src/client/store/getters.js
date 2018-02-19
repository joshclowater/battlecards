
const myPlayerId = state =>
  state.myPlayer !== undefined &&
  state.myPlayer.playerId;

const opponentPlayerId = state =>
  state.opponent !== undefined &&
  state.opponent.playerId;

export const isMyTurn = state =>
  myPlayerId(state) === state.playersTurn;

export const hasSelectedCard = state => state.selectedCard !== undefined;

export const myPlayerHasSummoned = state =>
  state.myPlayer !== undefined &&
  state.myPlayer.hasSummoned;

export const opponentsShieldsSize = state =>
  state.opponent !== undefined &&
  state.opponent.shieldsSize;

export const opponentsMonsters = state =>
  state.opponent !== undefined &&
  state.opponent.monsters;

export const myPlayerHasTrapInHand = state =>
  state.myPlayer !== undefined &&
  state.myPlayer.hand.find(card => (
    card.type === 'trap'
  )) !== undefined;

export const myPlayerHasAttackMonster = state =>
  state.myPlayer !== undefined &&
  state.myPlayer.monsters.find(monster => (
    monster.canAttack
  )) !== undefined;

export const selectedCardId = (state) => {
  if (state.selectedCard !== undefined &&
      state.selectedCard.card !== undefined) {
    return state.selectedCard.card.id;
  }
  return undefined;
};

export const endTurnIsOnlyMove = state =>
  isMyTurn(state) &&
    myPlayerHasSummoned(state) &&
    !myPlayerHasTrapInHand(state) &&
    !myPlayerHasAttackMonster(state);

export const isMyTrapPhase = state =>
  `${myPlayerId(state)}-TRAP_PHASE` === state.playersTurn;

export const isOpponentTrapPhase = state =>
  `${opponentPlayerId(state)}-TRAP_PHASE` === state.playersTurn;

export const myTraps = state =>
  state.myPlayer !== undefined &&
  state.myPlayer.traps;

export const opponentAttackingMonsterName = state =>
  state.attackingMonsterId &&
  state.opponent.monsters.find(monster => (
    monster.id === state.attackingMonsterId
  )).name;

export const attackingMonsterTarget = (state) => {
  if (state.attackingMonsterTarget === 'opponent') {
    return 'you';
  } else if (state.attackingMonsterTarget === 'shield') {
    return 'your shield';
  } else if (state.attackingMonsterTarget !== undefined) {
    return state.myPlayer.monsters.find(monster => (
      monster.id === state.attackingMonsterTarget
    )).name;
  }
  return '';
};


export const isMyTurn = state =>
  state.myPlayer !== undefined &&
  state.myPlayer.playerId === state.playersTurn;

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

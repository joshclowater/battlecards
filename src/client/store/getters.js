
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

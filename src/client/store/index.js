import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions';
import * as getters from './getters';
import mutations from './mutations';

Vue.use(Vuex);

const state = {
  isLandscape: undefined,
  gameStatus: undefined,
  playersTurn: undefined,
  myPlayer: undefined,
  opponent: undefined,
  selectedCard: undefined,
  showModal: undefined,
};

export default new Vuex.Store({
  state,
  actions,
  getters,
  mutations,
  strict: process.env.NODE_ENV !== 'production',
});

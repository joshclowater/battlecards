import Vue from 'vue';
import BattleKards from './battlekards.vue';

new Vue({
  el: '#app-container',
  render(createElement) {
    return createElement(BattleKards);
  },
});

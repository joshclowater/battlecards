import Vue from 'vue';
import BattleKards from './components/battlekards.vue';

new Vue({ // eslint-disable-line no-new
  el: '#app-container',
  render(createElement) {
    return createElement(BattleKards);
  }
});

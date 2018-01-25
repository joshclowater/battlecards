<style>
  .centerWindow {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  #gameOverMessage {
    text-align: center;
    margin-bottom: 20px;
  }
</style>

<template>
  <div id="battlekards">
    <div v-if="gameStatus === undefined">
      <div class="centerWindow">
        <span>
          Connecting to server...
        </span>
      </div>
    </div>
    <div v-else-if="gameStatus === 'waitingForAnotherPlayer'">
      <div class="centerWindow">
        <span>
          Waiting for another player to join...
        </span>
      </div>
    </div>
    <div v-else-if="gameStatus.includes('gameOver')">
      <div class="centerWindow">
        <span>
          <div id="gameOverMessage">
            <div v-if="gameStatus === 'gameOverWin'">
              You won!
            </div>
            <div v-if="gameStatus === 'gameOverLose'">
              You lost...
            </div>
          </div>
          <button onclick="window.location.reload(true);">
            Play again?
          </button>
        </span>
      </div>
    </div>
    <div v-else-if="gameStatus === 'playing'">
      <battle-kards-game />
    </div>
    <div v-else>
      Invalid game status {{ this.gameStatus }}
    </div>
  </div>
</template>

<script>
  import { mapState, mapMutations, mapActions } from 'vuex';
  import { SET_IS_LANDSCAPE } from '../store/mutation-types';
  import BattleKardsGame from './battlekards_game';

  export default {
    name: 'BattleKards',
    components: {
      BattleKardsGame,
    },
    beforeMount() {
      this.initiateGame();
      window.addEventListener('resize', this.handleResize);
      this.handleResize();
    },
    beforeDestroy() {
      this.terminateGame();
      window.removeEventListener('resize', this.handleResize);
    },
    methods: {
      ...mapMutations({
        setIsLandscape: SET_IS_LANDSCAPE,
      }),
      ...mapActions([
        'initiateGame',
        'terminateGame',
      ]),
      handleResize() {
        const isLandscape = window.innerWidth > window.innerHeight;
        if (this.isLandscape !== isLandscape) {
          this.setIsLandscape(isLandscape);
        }
      },
    },
    computed: {
      ...mapState([
        'gameStatus',
      ]),
    },
  };
</script>

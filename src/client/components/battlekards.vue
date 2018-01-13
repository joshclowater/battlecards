<style>
  span {
    cursor: default;
  }

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

  #gameContainer {
    display: flex;
  }

  #game {
    flex: 60;
    order: 0;
    position: relative;
    height: 100vh;
    overflow-y: hidden;
  }

  #details {
    flex: 40;
    order: 1;
    height: 100vh;
    box-shadow: 0px 0px 2px #757D75;
  }

  #detailsModal {
    position: absolute;
    z-index: 2;
    top: 5vh;
    left: 5vw;
    height: 88vh;
    width: 90vw;
    background-color: white;
    box-shadow: 0px 1px 4px #757D75;
    border-radius: 3px;
  }

  #modalClose {
    display: inline-block;
    position: absolute;
    right: 2vw;
    cursor: pointer;
    font-size: 4vh;
  }

  .bar {
    display: flex;
    height: 7vh;
    width: calc(100% - 1px);
    position: absolute;
  }

  .bar > div {
    padding: 1vh;
  }

  .flexEven {
    flex: 1 1 0;
  }

  .right {
    float: right;
  }

  .iconContainer {
    display: inline-block;
  }

  .bar .icon {
    height: 4.5vh;
  }

  .bar .unicodeIcon {
    font-size: 5.5vh;
    line-height: 4.5vh;
  }

  .pulse {
    box-shadow: 0 0 0 0 rgba(140, 140, 140, 0.7);
    animation: pulse 1.25s infinite cubic-bezier(0.66, 0, 0, 1);
  }

  .pulse:hover {
    animation: none;
  }

  @keyframes pulse {
    to {
      box-shadow: 0 0 0 20px rgba(232, 76, 61, 0);
    }
  }

  #actionIcon {
    cursor: pointer;
  }

  .circle {
    border-radius: 100%;
  }

  .iconTitle {
    vertical-align: top;
    font-size: 2.5vh;
    line-height: 4.5vh;
  }

  #opponent {
    padding-top: 7vh;
    height: 34vh;
  }

  hr {
    margin: 0.5vh 0;
  }

  .scrollX {
    white-space: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    height: 17vh;
    width: calc(100% - 1px);
  }

  .scrollXCardContainer {
    width: 60vh;
    margin: 0 auto;
  }

  .card {
    display: inline-block;
    width: 11vh;
    height: 16vh;
    font-size: 1.5vh;
    border-radius: 3px;
    background-color: #FFFFFF;
    box-shadow: 0px 1px 4px #757D75;
    margin: 0.25vh 0.5vh 0;
    vertical-align: top;
  }

  .cardPlaceholder {
    box-shadow: inset 0px 1px 3px #757D75;
  }

  #bottomBar {
    bottom: 0;
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
      <div id="gameContainer">
        <div id="details" v-if="isLandscape">
          <div id="modalClose" v-if="hasSelectedCard" v-on:click="setSelectedCard(undefined);">
            &#10005;
          </div>
          <battle-kards-details />
        </div>
        <div id="detailsModal" v-if="!isLandscape" v-show="showModal || hasSelectedCard" >
          <div id="modalClose" v-on:click="setShowModal(false); setSelectedCard(undefined);">
            &#10005;
          </div>
          <battle-kards-details />
        </div>
        <div id="game">
          <div class="bar">
            <div class="deck flexEven">
              <div class="iconContainer">
                <img src="../assets/deck.svg" alt="Deck:" class="icon"/>
                <span class="iconTitle">x&nbsp;{{ opponent.deckSize }}</span>
              </div>
            </div>
            <div class="shields">
              <div class="iconContainer">
                <img src="../assets/shield.svg" alt="Shields:" class="icon"/>
                <span class="iconTitle">x&nbsp;{{ opponent.shieldsSize }}</span>
              </div>
            </div>
            <div class="hand flexEven">
              <div class="iconContainer right">
                <img src="../assets/card.svg" alt="Cards:" class="icon"/>
                <span class="iconTitle">x&nbsp;{{ opponent.handSize }}</span>
              </div>
            </div>
          </div>
          <div id="opponent">
            <div class="magic scrollX">
              <div class="scrollXCardContainer">
                <div v-for="n in 5" class="card cardPlaceholder"></div>
              </div>
            </div>
            <div class="monsters scrollX">
              <div class="scrollXCardContainer">
                <card
                  v-for="card in opponent.monsters"
                  :key="card.id"
                  :card="card"
                  @onClick="setSelectedCard({ card, cardField: 'opponentMonster' })"
                />
                <div v-for="n in (5 - opponent.monsters.length)" class="card cardPlaceholder"></div>
              </div>
            </div>
          </div>
          <hr />
          <div id="me">
            <div class="monsters scrollX">
              <div class="scrollXCardContainer">
                <card
                  v-for="card in myPlayer.monsters"
                  :key="card.id"
                  :card="card"
                  @onClick="setSelectedCard({ card, cardField: 'myMonster' })"
                />
                <div v-for="n in (5 - myPlayer.monsters.length)" class="card cardPlaceholder"></div>
              </div>
            </div>
            <div class="magic scrollX">
              <div class="scrollXCardContainer">
                <div v-for="n in 5" class="card cardPlaceholder"></div>
              </div>
            </div>
            <div class="hand scrollX">
              <div class="scrollXCardContainer" v-bind:style="{width: myPlayer.hand.length * 12 + 'vh'}">
                <card
                  v-for="card in myPlayer.hand"
                  :key="card.id"
                  :card="card"
                  @onClick="setSelectedCard({ card, cardField: 'myHand' })"
                  :pulse="isMyTurn &&
                      !hasSelectedCard &&
                      !myPlayer.hasSummoned"
                />
              </div>
            </div>
          </div>
          <div id="bottomBar" class="bar">
            <div class="deck flexEven">
              <div class="iconContainer">
                <img src="../assets/deck.svg" alt="Deck:" class="icon"/>
                <span class="iconTitle">x&nbsp;{{ myPlayer.deckSize }}</span>
              </div>
            </div>
            <div class="shields">
              <div class="iconContainer">
                <img src="../assets/shield.svg" alt="Shields:" class="icon"/>
                <span class="iconTitle">x&nbsp;{{ myPlayer.shieldsSize }}</span>
              </div>
            </div>
            <div class="flexEven">
              <div
                v-if="!isLandscape"
                v-on:click="setShowModal(true); setSelectedCard(undefined);"
                class="iconContainer right circle"
                v-bind:class="hasAction"
              >
                <span id="actionIcon" class="unicodeIcon">
                  &#9876;
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      Invalid game status {{ this.gameStatus }}
    </div>
  </div>
</template>

<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
  import * as types from '../store/mutation-types';
  import BattleKardsDetails from './battlekards_details';
  import Card from './card';

  export default {
    name: 'BattleKards',
    components: {
      BattleKardsDetails,
      Card,
    },
    beforeMount() {
      this.initiateGame();
      window.addEventListener('resize', this.handleResize);
      this.handleResize();
    },
    beforeDestroy() {
      this.disconnectFromGame();
      window.removeEventListener('resize', this.handleResize);
    },
    methods: {
      ...mapMutations({
        setIsLandscape: types.SET_IS_LANDSCAPE,
        setSelectedCard: types.SET_SELECTED_CARD,
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
        'isLandscape',
        'gameStatus',
        'myPlayer',
        'opponent',
        'selectedCard',
        'showModal',
      ]),
      ...mapGetters([
        'isMyTurn',
        'hasSelectedCard',
      ]),
      hasAction() {
        // TODO use getter for this
        return {
          pulse: this.isMyTurn &&
              !this.showModal &&
              this.myPlayer.hasSummoned,
        };
      },
    },
  };
</script>

<style>
  /* Hide vue show attribute used so they don't appear until vue instance is ready */
  [v-show], [v-if], [v-else-if], [v-else], [v-cloak] {
    display: none;
  }

  body {
    background-color: #ecf0f1;
    color: #292929;
    font-family: 'Open Sans', sans-serif;
    margin: 0;
    font-size: 2vh;
  }

  span {
    cursor: default;
  }

  button {
    border-radius: .25rem;
    border: 1px solid transparent;
    background-color: #c3d7e8;
    padding: .5rem 1rem;
    cursor: pointer;
  }

  button:hover {
    background-color: #a9c5dc;
  }

  button:active {
    background-color: #8aa8c1;
  }

  .centerWindow {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
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

  .cardPulse {
    animation: cardPulse 1.25s infinite ease-in-out;
  }

  @keyframes cardPulse {
    0% {
      box-shadow: 0 0 0 0.1vh rgba(140, 140, 140, 0.7);
    }
    50% {
      box-shadow: 0 0 0 0.25vh rgba(140, 140, 140, 0.7);
    }
    100% {
      box-shadow: 0 0 0 0.1vh rgba(140, 140, 140, 0.7);
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

  .pointer {
    cursor: pointer;
  }

  .card.selected {
    box-shadow: 0px 0px 0.5vh #006eff;
  }

  .cardPlaceholder {
    box-shadow: inset 0px 1px 3px #757D75;
  }

  .card div {
    padding: 0.5vh;
    text-align: center;
  }

  .card .title {
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .card .atk {
    margin-top: 7vh;
  }

  #bottomBar {
    bottom: 0;
  }
</style>

<template>
  <div v-if='gameStatus === undefined'>
    <div class="centerWindow">
      <span>
        Connecting to server...
      </span>
    </div>
  </div>
  <div v-else-if='gameStatus === "waitingForAnotherPlayer"'>
    <div class="centerWindow">
      <span>
        Waiting for another player to join...
      </span>
    </div>
  </div>
  <div v-else-if="gameStatus === 'gameOver'">
    <div class="centerWindow">
      <span>
        <button onclick="window.location.reload(true);">
          Play again?
        </button>
      </span>
    </div>
  </div>
  <div v-else-if="gameStatus === 'playing'">
    <div id="gameContainer">
      <div id="details" v-if="windowWidth > windowHeight">
        <div id="modalClose" v-if="selectedCard !== undefined" v-on:click="selectedCard = undefined;">
          &#10005;
        </div>
        <Battle-Kards-Details
          :myPlayerId="myPlayerId"
          :playersTurn="playersTurn"
          :selectedCard="selectedCard"
          :hasSummoned="myPlayer.hasSummoned"
          :opponentsShieldsSize="opponent.shieldsSize"
          :socket="socket"
        />
      </div>
      <div id="detailsModal" v-if="windowWidth <= windowHeight" v-show="showModal || selectedCard !== undefined" >
        <div id="modalClose" v-on:click="showModal = false; selectedCard = undefined;">
          &#10005;
        </div>
        <Battle-Kards-Details
          :myPlayerId="myPlayerId"
          :playersTurn="playersTurn"
          :selectedCard="selectedCard"
          :hasSummoned="myPlayer.hasSummoned"
          :opponentsShieldsSize="opponent.shieldsSize"
          :socket="socket"
        />
      </div>
      <div id="game">
        <div class="bar">
          <div class="deck flexEven">
            <div class="iconContainer">
              <img src="assets/deck.svg" alt="Deck:" class="icon"/>
              <span class="iconTitle">x&nbsp;{{ opponent.deckSize }}</span>
            </div>
          </div>
          <div class="shields">
            <div class="iconContainer">
              <img src="assets/shield.svg" alt="Shields:" class="icon"/>
              <span class="iconTitle">x&nbsp;{{ opponent.shieldsSize }}</span>
            </div>
          </div>
          <div class="hand flexEven">
            <div class="iconContainer right">
              <img src="assets/card.svg" alt="Cards:" class="icon"/>
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
              <div v-for="card in opponent.monsters" class="card">
                <div class="title" v-bind:title="card.name">
                  <span>
                    {{ card.name }}
                  </span>
                </div>
                <div class="atk">
                  <span>
                    Atk: {{ card.attributes.attack }}
                  </span>
                </div>
                <div class="def">
                  <span>
                    Def: {{ card.attributes.defense }}
                  </span>
                </div>
              </div>
              <div v-for="n in (5 - opponent.monsters.length)" class="card cardPlaceholder"></div>
            </div>
          </div>
        </div>
        <hr />
        <div id="me">
          <div class="monsters scrollX">
            <div class="scrollXCardContainer">
              <div v-for="card in myPlayer.monsters" v-on:click="() => selectCard(card, 'myMonster')" class="card pointer">
                <div class="title" v-bind:title="card.name">
                  <span>
                    {{ card.name }}
                  </span>
                </div>
                <div class="atk">
                  <span>
                    Atk: {{ card.attributes.attack }}
                  </span>
                </div>
                <div class="def">
                  <span>
                    Def: {{ card.attributes.defense }}
                  </span>
                </div>
              </div>
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
              <div v-for="card in myPlayer.hand" v-on:click="() => selectCard(card, 'myHand')" class="card pointer" v-bind:class="monsterCardClass">
                <div class="title" v-bind:title="card.name">
                  <span>
                    {{ card.name }}
                  </span>
                </div>
                <div class="atk">
                  <span>
                    Atk: {{ card.attributes.attack }}
                  </span>
                </div>
                <div class="def">
                  <span>
                    Def: {{ card.attributes.defense }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="bottomBar" class="bar">
          <div class="deck flexEven">
            <div class="iconContainer">
              <img src="assets/deck.svg" alt="Deck:" class="icon"/>
              <span class="iconTitle">x&nbsp;{{ myPlayer.deckSize }}</span>
            </div>
          </div>
          <div class="shields">
            <div class="iconContainer">
              <img src="assets/shield.svg" alt="Shields:" class="icon"/>
              <span class="iconTitle">x&nbsp;{{ myPlayer.shieldsSize }}</span>
            </div>
          </div>
          <div class="flexEven">
            <div
              v-if="windowWidth <= windowHeight"
              v-on:click="showModal = !showModal; selectedCard = undefined;"
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
</template>

<script>
  import io from 'socket.io-client';
  import BattleKardsDetails from './battlekards_details.vue';

  export default {
    name: 'BattleKards',
    data: () => ({
      windowHeight: undefined,
      windowWidth: undefined,
      socket: undefined,
      showModal: false,
      gameStatus: undefined,
      myPlayerId: undefined,
      playersTurn: undefined,
      opponent: undefined,
      myPlayer: undefined,
      selectedCard: undefined
    }),
    beforeMount() {
      this.socket = io();
      this.initGameSocket();
      console.log('Game socket initiated');
    },
    mounted() {
      window.addEventListener('resize', this.handleResize);
      this.handleResize();
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.handleResize);
    },
    methods: {
      handleResize() {
        this.windowHeight = window.innerHeight;
        this.windowWidth = window.innerWidth;
      },
      initGameSocket() {
        this.socket.on('waitingForAnotherPlayer', () => {
          console.log('waitingForAnotherPlayer');
          this.gameStatus = 'waitingForAnotherPlayer';
        });

        this.socket.on('gameStarted', (response) => {
          console.log('gameStarted', response);
          this.gameStatus = 'playing';
          this.myPlayerId = response.playerId;
          this.playersTurn = response.playersTurn;
          this.opponent = {
            deckSize: response.opponentsDeckSize,
            shieldsSize: response.opponentsShieldsSize,
            handSize: response.opponentsHandSize,
            monsters: []
          };
          this.myPlayer = {
            deckSize: response.myDeckSize,
            shieldsSize: response.myShieldsSize,
            hand: response.myHand,
            monsters: [],
            hasSummoned: false
          };
        });

        this.socket.on('turnEnded', (response) => {
          console.log('turnEnded', response);
          this.playersTurn = response.playersTurn;
          if (this.playersTurn === this.myPlayerId) {
            this.myPlayer.hand.push(response.cardDrawn);
            this.myPlayer.deckSize = response.myDeckSize;
            this.myPlayer.hasSummoned = false;
            this.myPlayer.monsters = this.myPlayer.monsters.map(monster =>
              Object.assign(monster, { canAttack: true })
            );
          } else {
            this.opponent.handSize = response.opponentsHandSize;
            this.opponent.deckSize = response.opponentsDeckSize;
          }
        });

        this.socket.on('summoned', (card) => {
          console.log('Summoned: ', card);

          const monsterIndex = this.myPlayer.hand.findIndex(cardInHand =>
            cardInHand.id === card.id
          );
          this.myPlayer.hand.splice(monsterIndex, 1);
          this.myPlayer.monsters.push(card);
          this.myPlayer.hasSummoned = true;

          this.selectedCard = undefined;
        });

        this.socket.on('opponentSummoned', (response) => {
          console.log('Opponent summoned: ', response);
          this.opponent.monsters.push(response.monster);
          this.opponent.handSize = response.opponentsHandSize;
        });

        this.socket.on('attacked', (monster, target) => {
          console.log('attacked', monster, target);
          const myMonster = this.myPlayer.monsters.find(cardInHand =>
            cardInHand.id === monster.id
          );
          myMonster.canAttack = false;
          if (target === 'shield') {
            this.opponent.shieldsSize -= 1;
          } else {
            console.error('invalid target');
          }
        });

        this.socket.on('opponentAttacked', (monster, target, shield) => {
          console.log('opponentAttacked', monster, target, shield);
          if (target === 'shield') {
            this.myPlayer.shieldsSize -= 1;
            this.myPlayer.hand.push(shield);
          } else {
            console.error('invalid target');
          }
        });

        this.socket.on('win', (message) => {
          console.log('win', message);
          this.gameStatus = 'gameOver';

          // TODO Use modal instead of alert
          alert(`You won! ${message}`);
        });

        this.socket.on('lose', (message) => {
          console.log('lose', message);
          this.gameStatus = 'gameOver';

          // TODO Use modal instead of alert
          alert(`You lost! ${message}`);
        });

        this.socket.on('invalidMove', (message) => {
          console.warn('Invalid move:', message);
        });
      },
      selectCard(card, cardField) {
        this.selectedCard = { card, cardField };
      }
    },
    computed: {
      hasAction() {
        return {
          pulse: this.playersTurn === this.myPlayerId &&
              !this.showModal &&
              this.myPlayer.hasSummoned
        };
      },
      monsterCardClass() {
        const result = [];
        if (this.playersTurn === this.myPlayerId &&
            this.selectedCard === undefined &&
            !this.myPlayer.hasSummoned) {
          result.push('cardPulse');
        }
        return result;
      }
    },
    components: {
      BattleKardsDetails
    }
  };
</script>

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
    flex: 65;
    order: 0;
    position: relative;
    height: 100vh;
    overflow-y: hidden;
  }

  #details {
    flex: 35;
    order: 1;
    height: 100vh;
    box-shadow: 0px 0px 2px #757D75;
  }

  .bar {
    display: flex;
    height: 5vh;
    width: calc(100% - 1px);
    position: absolute;
  }

  .bar div {
    padding: .5vh;
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
    height: 3vh;
  }

  .iconTitle {
    vertical-align: top;
  }

  #opponent {
    padding-top: 5vh;
    height: 35vh;
  }

  .scrollX {
    white-space: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    height: 18vh;
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
    margin: 0 0.5vh;
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
        {{ this.gameStatus }}
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
        <button onclick="window.location.reload();">
          Play again?
        </button>
      </span>
    </div>
  </div>
  <div v-else-if="gameStatus === 'playing'">
    <div id="gameContainer">
      <div id="details" v-show="windowWidth > windowHeight">
        <div class="turn">
          <span>
            Curent turn: {{ this.myPlayerId === this.playersTurn ? 'Me' : 'Other player' }}
          </span>
          <button v-if="myPlayerId === playersTurn" v-on:click="endTurn">
            End turn
          </button>
        </div>
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
              <div v-for="n in 5" class="card cardPlaceholder"></div>
            </div>
          </div>
        </div>
        <hr />
        <div id="me">
          <div class="monsters scrollX">
            <div class="scrollXCardContainer">
              <div v-for="n in 5" class="card cardPlaceholder"></div>
            </div>
          </div>
          <div class="magic scrollX">
            <div class="scrollXCardContainer">
              <div v-for="n in 5" class="card cardPlaceholder"></div>
            </div>
          </div>
          <div class="hand scrollX">
            <div class="scrollXCardContainer" v-bind:style="{width: myPlayer.hand.length * 12 + 'vh'}">
              <div v-for="card in myPlayer.hand" class="card">
                <div class="title" v-bind:title="card.name">
                  <span>
                    {{ card.name }}
                  <span>
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
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    Invalid game status
  </div>
</template>

<script>
  // import axios from 'axios';

  export default {
    name: 'BattleKards',
    data: () => ({
      windowHeight: undefined,
      windowWidth: undefined,
      gameStatus: undefined,
      myPlayerId: undefined,
      playersTurn: undefined,
      opponent: undefined,
      myPlayer: undefined
    }),
    beforeMount () {
      this.socket = io();
      this.initGameSocket();
      console.log('Game socket initiated')
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
            handSize: response.opponentsHandSize
          };
          this.myPlayer = {
            deckSize: response.myDeckSize,
            shieldsSize: response.myShieldsSize,
            hand: response.myHand
          };
        });

        this.socket.on('turnEnded', (response) => {
          console.log('turnEnded', response);
          this.playersTurn = response.playersTurn;
          if (this.playersTurn === this.myPlayerId) {
            this.myPlayer.hand.push(response.cardDrawn);
            this.myPlayer.deckSize = response.myDeckSize;
          } else {
            this.opponent.deckSize = response.opponentsDeckSize;
          }
        });

        this.socket.on('win', (message) => {
          console.log('win', message);
          this.gameStatus = 'gameOver';
          alert('You won! ' + message);
        });

        this.socket.on('invalidMove', (message) => {
          console.warn('Invalid move:', message);
        });
      },

      endTurn() {
        console.log('end my turn');
        this.socket.emit('endTurn');
      },
    }
  };
</script>

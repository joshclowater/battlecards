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
        <div id="details" v-if="isLandscape">
          <div id="modalClose" v-if="selectedCard !== undefined" v-on:click="selectedCard = undefined;">
            &#10005;
          </div>
          <battle-kards-details
            :myPlayerId="myPlayerId"
            :playersTurn="playersTurn"
            :selectedCard="selectedCard"
            :hasSummoned="myPlayer.hasSummoned"
            :opponentsShieldsSize="opponent.shieldsSize"
            :opponentsMonsters="opponent.monsters"
            :socket="socket"
          />
        </div>
        <div id="detailsModal" v-if="!isLandscape" v-show="showModal || selectedCard !== undefined" >
          <div id="modalClose" v-on:click="showModal = false; selectedCard = undefined;">
            &#10005;
          </div>
          <battle-kards-details
            :myPlayerId="myPlayerId"
            :playersTurn="playersTurn"
            :selectedCard="selectedCard"
            :hasSummoned="myPlayer.hasSummoned"
            :opponentsShieldsSize="opponent.shieldsSize"
            :opponentsMonsters="opponent.monsters"
            :socket="socket"
          />
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
                  @onClick="selectCard(card, 'opponentMonster')"
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
                  @onClick="selectCard(card, 'myMonster')"
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
                  @onClick="selectCard(card, 'myHand')"
                  :pulse="playersTurn === myPlayerId &&
                      selectedCard === undefined &&
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
  </div>
</template>

<script>
  import io from 'socket.io-client';
  import BattleKardsDetails from './battlekards_details';
  import Card from './card';

  export default {
    name: 'BattleKards',
    components: {
      BattleKardsDetails,
      Card,
    },
    data: () => ({
      isLandscape: true,
      socket: undefined,
      showModal: false,
      gameStatus: undefined,
      myPlayerId: undefined,
      playersTurn: undefined,
      opponent: undefined,
      myPlayer: undefined,
      selectedCard: undefined,
    }),
    beforeMount() {
      this.socket = io();
      this.initGameSocket();
      console.log('Game socket initiated');

      window.addEventListener('resize', this.handleResize);
      this.handleResize();
    },
    beforeDestroy() {
      this.socket.disconnect();
      window.removeEventListener('resize', this.handleResize);
    },
    methods: {
      handleResize() {
        this.isLandscape = window.innerWidth > window.innerHeight;
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
            monsters: [],
          };
          this.myPlayer = {
            deckSize: response.myDeckSize,
            shieldsSize: response.myShieldsSize,
            hand: response.myHand,
            monsters: [],
            hasSummoned: false,
          };
        });

        this.socket.on('turnEnded', (response) => {
          console.log('turnEnded', response);
          this.playersTurn = response.playersTurn;
          if (this.playersTurn === this.myPlayerId) {
            this.myPlayer.hand.push(response.cardDrawn);
            this.myPlayer.deckSize = response.myDeckSize;
            this.myPlayer.hasSummoned = false;
            this.myPlayer.monsters = this.myPlayer.monsters.map(monster => (
              Object.assign(monster, { canAttack: true })
            ));
          } else {
            this.opponent.handSize = response.opponentsHandSize;
            this.opponent.deckSize = response.opponentsDeckSize;
          }
        });

        this.socket.on('summoned', (card) => {
          console.log('Summoned: ', card);

          const monsterIndex = this.myPlayer.hand.findIndex(cardInHand => (
            cardInHand.id === card.id
          ));
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

        this.socket.on('attacked', (attackingMonsterId, target, results) => {
          console.log('attacked', attackingMonsterId, target, results);
          const myMonster = this.myPlayer.monsters.find(cardInHand => (
            cardInHand.id === attackingMonsterId
          ));
          myMonster.canAttack = false;
          if (target === 'shield') {
            this.opponent.shieldsSize -= 1;
          } else {
            results.destroyedMonsters.forEach((destroyedMonsterId) => {
              this.myPlayer.monsters = this.myPlayer.monsters.filter(monster => (
                monster.id !== destroyedMonsterId
              ));
              this.opponent.monsters = this.opponent.monsters.filter(monster => (
                (monster.id !== destroyedMonsterId)
              ));
            });
          }
          this.selectedCard = undefined;
        });

        this.socket.on('opponentAttacked', (attackingMonsterId, target, results) => {
          console.log('opponentAttacked', attackingMonsterId, target, results);
          if (target === 'shield') {
            this.myPlayer.shieldsSize -= 1;
            this.myPlayer.hand.push(results.shield);
          } else {
            results.destroyedMonsters.forEach((destroyedMonsterId) => {
              this.myPlayer.monsters = this.myPlayer.monsters.filter(monster => (
                monster.id !== destroyedMonsterId
              ));
              this.opponent.monsters = this.opponent.monsters.filter(monster => (
                monster.id !== destroyedMonsterId
              ));
            });
          }
        });

        this.socket.on('win', (message) => {
          console.log('win', message);
          this.gameStatus = 'gameOver';

          // TODO Use modal instead of alert
          alert(`You won! ${message}`); // eslint-disable-line no-alert
        });

        this.socket.on('lose', (message) => {
          console.log('lose', message);
          this.gameStatus = 'gameOver';

          // TODO Use modal instead of alert
          alert(`You lost! ${message}`); // eslint-disable-line no-alert
        });

        this.socket.on('invalidMove', (message) => {
          console.warn('Invalid move:', message);
        });
      },
      selectCard(card, cardField) {
        this.selectedCard = { card, cardField };
      },
    },
    computed: {
      hasAction() {
        return {
          pulse: this.playersTurn === this.myPlayerId &&
              !this.showModal &&
              this.myPlayer.hasSummoned,
        };
      },
    },
  };
</script>

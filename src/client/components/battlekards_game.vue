<style>
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

  .closeDetails {
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

  .cardFacedown {
    background-color: #757d750a;
  }

  .pointer {
    cursor: pointer;
  }

  #bottomBar {
    bottom: 0;
  }
</style>

<template>
  <div id="gameContainer">
    <div id="details" v-if="isLandscape">
      <div class="closeDetails" v-if="hasSelectedCard" v-on:click="setSelectedCard(undefined);">
        &#10005;
      </div>
      <battle-kards-details />
    </div>
    <div id="detailsModal" v-if="!isLandscape" v-show="showModal || hasSelectedCard" >
      <div class="closeDetails" v-on:click="setShowModal(false); setSelectedCard(undefined);">
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
        <div class="traps scrollX">
          <div class="scrollXCardContainer">
            <div v-for="n in opponent.trapsSize" class="card cardFacedown"></div>
            <div v-for="n in (5 - opponent.trapsSize)" class="card cardPlaceholder"></div>
          </div>
        </div>
        <div class="monsters scrollX">
          <div class="scrollXCardContainer">
            <card
              v-for="card in opponent.monsters"
              v-if="card.position === 'defense'"
              :key="card.id"
              :card="card"
              cardField="opponentMonster"
              class="card cardFacedown pointer"
            />
            <card
              v-for="card in opponent.monsters"
              v-if="card.position === 'attak'"
              :key="card.id"
              :card="card"
              cardField="opponentMonster"
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
              cardField="myMonster"
            />
            <div v-for="n in (5 - myPlayer.monsters.length)" class="card cardPlaceholder"></div>
          </div>
        </div>
        <div class="traps scrollX">
          <div class="scrollXCardContainer">
            <div
              v-for="card in myPlayer.traps"
              :key="card.id"
              class="card cardFacedown pointer"
              v-on:click="setSelectedCard({ card, cardField: 'trap' })"
            />
            <div v-for="n in (5 - myPlayer.traps.length)" class="card cardPlaceholder"></div>
          </div>
        </div>
        <div class="hand scrollX">
          <div class="scrollXCardContainer" v-bind:style="{width: myPlayer.hand.length * 12 + 'vh'}">
            <card
              v-for="card in myPlayer.hand"
              :key="card.id"
              :card="card"
              cardField="myHand"
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
            v-bind:class="{ pulse: endTurnIsOnlyMove && !showModal }"
          >
            <span id="actionIcon" class="unicodeIcon">
              &#9876;
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapMutations, mapState, mapGetters } from 'vuex';
  import { SET_SELECTED_CARD, SET_SHOW_MODAL } from '../store/mutation-types';
  import BattleKardsDetails from './battlekards_details';
  import Card from './card';

  export default {
    name: 'BattleKardsGame',
    components: {
      BattleKardsDetails,
      Card,
    },
    methods: {
      ...mapMutations({
        setSelectedCard: SET_SELECTED_CARD,
        setShowModal: SET_SHOW_MODAL,
      }),
    },
    computed: {
      ...mapState([
        'isLandscape',
        'myPlayer',
        'opponent',
        'selectedCard',
        'showModal',
      ]),
      ...mapGetters([
        'isMyTurn',
        'hasSelectedCard',
        'endTurnIsOnlyMove',
      ]),
    },
  };
</script>

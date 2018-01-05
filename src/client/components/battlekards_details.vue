<style scoped>
  #detailsContainer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: calc(100% - 4vh);
    padding: 2vh;
  }

  .cardDetailsText {
    display: block;
    text-align: center;
  }

  .message {
    display: block;
    text-align: center;
  }

  button {
    display: block;
    margin: 2vh auto 0;
  }
</style>

<template>
  <div id="detailsContainer">
    <div v-if="selectedCard !== undefined">
      <span class="cardDetailsText">
        {{ selectedCard.card.name }}
      </span>
      <span class="cardDetailsText">
        Atk: {{ selectedCard.card.attributes.attack }}
      </span>
      <span class="cardDetailsText">
        Def: {{ selectedCard.card.attributes.defense }}
      </span>
      <button
        v-if="isMyTurn && selectedCard.cardField === 'myHand' && !myPlayerHasSummoned"
        id="summonButton"
        v-on:click="summon"
      >
        Summon Attak
      </button>
      <div v-else-if="isMyTurn && selectedCard.cardField === 'myMonster' && selectedCard.card.canAttack">
        <button
          v-if="opponentsShieldsSize > 0"
          id="attackShieldButton"
          v-on:click="attackShield"
        >
          Attak Shield
        </button>
        <button
          v-else
          id="attackOpponentButton"
          v-on:click="attackOpponent"
        >
          Attak Opponent
        </button>
        <button
          v-for="opponentMonster in opponentsMonsters"
          v-on:click="attackMonster(opponentMonster.id)"
        >
          Attak {{ opponentMonster.name }} (Atk: {{ opponentMonster.attributes.attack }}, Def: {{ opponentMonster.attributes.defense }})
        </button>
      </div>
    </div>
    <div v-else >
      <span class="message">
        <span v-if="isMyTurn && !myPlayerHasSummoned">
          It is currently your turn. You may summon a monster. Once you are finished, you may end your turn.
        </span>
        <span v-else-if="isMyTurn">
          You have summoned a monster. You may end your turn.
        </span>
        <span v-else>
          It is currently the other players turn.
        </span>
      </span>
      <button id="endTurnButton" v-if="isMyTurn" v-on:click="endTurn" v-bind:class="endTurnButtonClass()">
        End turn
      </button>
    </div>
  </div>
</template>

<script>
  import { mapState, mapGetters } from 'vuex';

  export default {
    computed: {
      ...mapState([
        'selectedCard',
      ]),
      ...mapGetters([
        'isMyTurn',
        'myPlayerHasSummoned',
        'opponentsShieldsSize',
        'opponentsMonsters',
      ]),
    },
    methods: {
      endTurn() {
        console.log('endTurn()');
        window.battlekardsSocket.emit('endTurn');
      },

      summon() {
        console.log('summon()', this.selectedCard.card.id);
        window.battlekardsSocket.emit('summon', this.selectedCard.card.id);
      },

      attackShield() {
        console.log('attack', this.selectedCard.card.id, 'shield');
        window.battlekardsSocket.emit('attack', this.selectedCard.card.id, 'shield');
      },

      attackOpponent() {
        console.log('attack', this.selectedCard.card.id, 'player');
        window.battlekardsSocket.emit('attack', this.selectedCard.card.id, 'player');
      },

      attackMonster(opponentMonsterId) {
        console.log('attack', this.selectedCard.card.id, opponentMonsterId);
        window.battlekardsSocket.emit('attack', this.selectedCard.card.id, opponentMonsterId);
      },

      endTurnButtonClass() {
        return this.isMyTurn && this.myPlayerHasSummoned ? 'pulse' : '';
      },
    },
  };

</script>

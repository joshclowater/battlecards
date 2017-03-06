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
        v-if="myPlayerId === playersTurn && selectedCard.cardField === 'myHand' && !hasSummoned"
        id="summonButton"
        v-on:click="summon"
      >
        Summon Attak
      </button>
      <button
        v-else-if="myPlayerId === playersTurn && selectedCard.cardField === 'myMonster' && selectedCard.card.canAttack"
        id="attackButton"
        v-on:click="attack"
      >
        Attak
      </button>
    </div>
    <div v-else >
      <span class="message">
        <span v-if="myPlayerId === playersTurn && !hasSummoned">
          It is currently your turn. You may summon a monster. Once you are finished, you may end your turn.
        </span>
        <span v-else-if="myPlayerId === playersTurn">
          You have summoned a monster. You may end your turn.
        </span>
        <span v-else>
          It is currently the other players turn.
        </span>
      </span>
      <button id="endTurnButton" v-if="myPlayerId === playersTurn" v-on:click="endTurn" v-bind:class="endTurnButtonClass()">
        End turn
      </button>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      myPlayerId: {
        type: String,
        required: true
      },
      playersTurn: {
        type: String,
        required: true
      },
      selectedCard: {
        type: Object
      },
      hasSummoned: {
        type: Boolean,
        required: true
      },
      socket: {
        type: Object,
        required: true
      }
    },
    methods: {
      endTurn() {
        console.log('endTurn()');
        this.socket.emit('endTurn');
      },

      summon() {
        console.log('summon()', this.selectedCard.card.id);
        this.socket.emit('summon', this.selectedCard.card.id);
      },

      attack() {
        console.log('attack', this.selectedCard.card.id);
        this.socket.emit('attack', this.selectedCard.card.id);
      },

      endTurnButtonClass() {
        return this.myPlayerId === this.playersTurn && this.hasSummoned ? 'pulse' : '';
      }
    }
  };

</script>

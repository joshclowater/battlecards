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
        {{ selectedCard.name }}
      </span>
      <span class="cardDetailsText">
        Atk: {{ selectedCard.attributes.attack }}
      </span>
      <span class="cardDetailsText">
        Def: {{ selectedCard.attributes.defense }}
      </span>
      <button id="summonButton" v-if="myPlayerId === playersTurn && !hasSummoned" v-on:click="summon">
        Summon Attack
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
        console.log('summon()', this.selectedCard.id);
        this.socket.emit('summon', this.selectedCard.id);
      },

      endTurnButtonClass() {
        return this.myPlayerId === this.playersTurn && this.hasSummoned ? 'pulse' : '';
      }
    }
  };

</script>

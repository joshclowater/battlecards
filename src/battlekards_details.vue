<style scoped>
  #detailsContainer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: calc(100% - 4vh);
    padding: 2vh;
  }

  .message {
    display: block;
    text-align: center;
  }
</style>

<template>
  <div id="detailsContainer">
    <div v-if="selectedCard !== undefined">
      <div>
        {{ selectedCard.name }}
      </div>
      <div>
        {{ selectedCard.attributes.attack }}
      </div>
      <div>
        {{ selectedCard.attributes.defense }}
      </div>
      <button v-if="myPlayerId === playersTurn && !hasSummoned" v-on:click="summon">
        Summon Attack
      </button>
    </div>
    <div v-else >
      <span class="message">
        {{
          this.myPlayerId === this.playersTurn
            ? 'It is currently your turn. Once you are finished, you may end your turn.'
            : 'It is currently the other players turn.'
        }}
      </span>
      <button v-if="myPlayerId === playersTurn" v-on:click="endTurn">
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
        type: Object,
      },
      socket: {
        type: Object,
        required: true
      },
    },
    methods: {
      endTurn() {
        console.log('end my turn');
        this.socket.emit('endTurn');
      },

      summon(){
        this.socket.emit('summon', this.selectedCard.id);

      }
    },
  };

</script>

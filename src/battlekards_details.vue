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
      socket: {
        required: true
      }
    },
    methods: {
      endTurn() {
        console.log('end my turn');
        this.socket.emit('endTurn');
      },
    },
  };

</script>

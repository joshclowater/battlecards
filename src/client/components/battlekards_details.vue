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

  li {
    text-align: left;
    padding-bottom: 1vh;
  }
</style>

<template>
  <div id="detailsContainer">
    <div v-if="selectedCard !== undefined">
      <span class="cardDetailsText">
        {{ selectedCard.card.name }}
      </span>
      <div v-if="selectedCard.card.type === 'monster'">
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
      <div v-else-if="selectedCard.card.type === 'trap'">
        <span class="cardDetailsText">
          {{ selectedCard.card.description }}
        </span>
        <button
          v-if="isMyTurn && selectedCard.cardField === 'myHand'"
          id="setTrap"
          v-on:click="setTrap"
        >
          Set Trap
        </button>
      </div>
    </div>
    <div v-else class="message">
      <div v-if="isMyTurn">
        <span>
          It is currently your turn. You may:
        </span>
        <ul>
          <li v-if="!myPlayerHasSummoned">
            <span>Summon a monster</span>
          </li>
          <li v-if="myPlayerHasTrapInHand">
            <span>Set a trap</span>
          </li>
          <li v-if="myPlayerHasAttackMonster">
            <span>Attack with monster</span>
          </li>
          <li>
            <span>End your turn</span>
          </li>
        </ul>
        <button id="endTurnButton" v-if="isMyTurn" v-on:click="endTurn" v-bind:class="{ pulse: endTurnIsOnlyMove }">
          End turn
        </button>
      </div>
      <span v-else>
        It is currently the other players turn.
      </span>
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
        'opponentsShieldsSize',
        'opponentsMonsters',
        'myPlayerHasSummoned',
        'myPlayerHasTrapInHand',
        'myPlayerHasAttackMonster',
        'endTurnIsOnlyMove',
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

      setTrap() {
        console.log('setTrap', this.selectedCard.card.id);
        window.battlekardsSocket.emit('setTrap', this.selectedCard.card.id);
      },
    },
  };

</script>

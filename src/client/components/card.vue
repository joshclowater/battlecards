<style scoped>
  .card, .card * {
    cursor: pointer !important;
  }

  .card.selected {
    box-shadow: 0px 0px 0.5vh #006eff;
  }

  .card div {
    padding: 0.5vh;
    text-align: center;
  }

  .title {
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .bottom {
    margin-top: 7vh;
  }

  .description {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cardPulse {
    animation: cardPulse 1.25s infinite ease-in-out;
  }

  @keyframes cardPulse {
    0% {
      box-shadow: 0 0 0 0.1vh rgba(140, 140, 140, 0.7);
    }
    50% {
      box-shadow: 0 0 0 0.35vh rgba(140, 140, 140, 0.7);
    }
    100% {
      box-shadow: 0 0 0 0.1vh rgba(140, 140, 140, 0.7);
    }
  }

  .selectedCard {
    border: 2px solid #c3d7e8;
    box-sizing: border-box;
  }
</style>

<template>
  <div
    v-bind:class="[{ cardPulse : isCardPulse() }, { selectedCard: isSelectedCard() }, 'card']"
    v-on:click="onClick"
  >
    <div class="title" v-bind:title="card.name">
      <span>
        {{ card.name }}
      </span>
    </div>
    <div class="bottom">
      <div v-if="card.type === 'monster'">
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
      <div v-else-if="card.type === 'trap'">
        <span class="description" :title="card.description">
          {{ card.description }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters, mapMutations } from 'vuex';
  import { SET_SELECTED_CARD } from '../store/mutation-types';
  
  export default {
    props: {
      card: {
        type: Object,
        required: true,
      },
      cardField: {
        type: String,
        required: true,
      },
    },
    computed: {
      ...mapGetters([
        'isMyTurn',
        'myPlayerHasSummoned',
        'selectedCardId',
      ]),
    },
    methods: {
      ...mapMutations({
        setSelectedCard: SET_SELECTED_CARD,
      }),
      onClick() {
        if (!this.isSelectedCard()) {
          this.setSelectedCard({ card: this.card, cardField: this.cardField });
        } else {
          this.setSelectedCard(undefined);
        }
      },
      isSelectedCard() {
        return this.selectedCardId === this.card.id;
      },
      isCardPulse() {
        if (!this.isSelectedCard()) {
          if (this.cardField === 'myHand' && this.isMyTurn) {
            if (this.card.type === 'monster') {
              return !this.myPlayerHasSummoned;
            }
            return true;
          } else if (this.cardField === 'myMonster') {
            return this.card.canAttack;
          }
        }
        return false;
      },
    },
  };
</script>

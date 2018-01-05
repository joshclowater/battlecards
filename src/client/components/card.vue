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

  .atk {
    margin-top: 7vh;
  }

  .cardPulse {
    animation: cardPulse 1.25s infinite ease-in-out;
  }

  @keyframes cardPulse {
    0% {
      box-shadow: 0 0 0 0.1vh rgba(140, 140, 140, 0.7);
    }
    50% {
      box-shadow: 0 0 0 0.25vh rgba(140, 140, 140, 0.7);
    }
    100% {
      box-shadow: 0 0 0 0.1vh rgba(140, 140, 140, 0.7);
    }
  }
</style>

<template>
  <div v-bind:class="[{ cardPulse : pulse }, 'card']" v-on:click="onClick">
    <div class="title" v-bind:title="card.name">
      <span>
        {{ card.name }}
      </span>
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
</template>

<script>
  export default {
    props: {
      card: {
        type: Object,
        required: true,
      },
      pulse: {
        type: Boolean,
        default: false,
      },
    },
    methods: {
      onClick() {
        this.$emit('onClick');
      },
    },
  };
</script>

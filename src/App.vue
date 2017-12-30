<template>
  <div id="app">
    <battlekards></battlekards>
  </div>
</template>

<script>
import Battlekards from './components/battlekards';

export default {
  name: 'app',
  components: {
    Battlekards,
  },
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>

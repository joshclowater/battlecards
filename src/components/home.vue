<style scoped>
  #homeContainer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 5vh;
    height: 90vh;
  }

  #title {
    font-size: 7vh;
  }

  #description {
    font-size: 4vh;
    margin-bottom: 4vh;
  }
</style>

<template>
  <div id="homeContainer">
    <div id="title">
      Battle Kards
    </div>
    <div id="description">
      America's favorite battle card game!
    </div>
    <router-link tag="button" to="battle">
      Battle now!
    </router-link>
  </div>
</template>

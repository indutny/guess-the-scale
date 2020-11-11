<template>
  <div id="app">
    <h1>Guess the scale?</h1>

    <Player/>

    <footer>
      <small>
        Made by
        <a href="https://github.com/indutny/guess-the-scale" target="_blank">
          @indutny
        </a>
      </small>
    </footer>
  </div>
</template>

<script>
import Player from './components/Player.vue';

export default {
  name: 'App',
  components: {
    Player,
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Pacifico');
@import url('https://fonts.googleapis.com/css?family=Montserrat');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;

  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #212121;
}

h1, h2, h3, h4, h5, h6 {
  font-family: Pacifico;
}

h1 {
  font-size: 4rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

h3 {
  font-size: 2rem;
  margin-top: 1rem;
  margin-bottom: 0.5rem;;
}

h4 {
  margin-top: 1rem;
  margin-bottom: 0.5rem;;
  font-size: 1.5rem;
}

body {
  background: #FEFCFF;
}

#app {
  margin: 0 auto;
  max-width: 640px;
}

footer {
  margin-top: 1rem;
}

footer small, footer a {
  color: #bebdbf;
}
</style>

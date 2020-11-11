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

input, button {
  margin: 0.5rem 0.25rem;
  padding: 0 0.5rem;
  background: #FEFCFF;

  border: 1px solid #4F4F4F;
  font-size: 2rem;

  border-radius: 0.25rem;
  transition: box-shadow 0.1s;
}

input:hover, button:hover {
  border-color: #212121;
}

input[type="submit"]:not(:disabled):hover, button:hover {
  background: #3F3FD4;
  color: #FEFCFF;
  box-shadow: 0 0 0.25rem #3F3FD4;
}

input:focus, button:focus {
  box-shadow: 0 0 0.25rem #3F3FD4;
  outline: none;
}

input[type="submit"]:disabled {
  background: #d8d6d8;
  color: #424242;
}

input[type="submit"]:not(:disabled), button {
  cursor: pointer;
}

</style>

<template>
  <div class="player">
    <h3 class="score">
      Score: {{score}} <span v-if="multiplier !== 1">(x{{multiplier}})</span>
      /
      Best score: {{best}}
    </h3>

    <span v-if="state === 'idle'">
      <button class="start" @click.prevent="onStart">Start</button>
    </span>
    <span v-else-if="state === 'guessing'" class="guessing">
      <form @submit.prevent="onGuess">
        <div class="row">
          <input v-focus v-model="guess" placeholder="Scale name"/>
          <input type="submit" :disabled="!matchedScale" value="Check"/>
        </div>

        <div class="row">
          <button class="repeat" @click.prevent="onRepeat">Play Again</button>
          <button class="skip" @click.prevent="onSkip">Skip</button>
        </div>
      </form>
    </span>
    <span v-else class="wrong">
      <span v-if="matchedScale">
        <p>Sorry, but you got it wrong. It was</p>
        <p>
          <b class="expected">{{scale}}</b>
          (and sadly not <b class="actual">{{matchedScale}}</b>)
        </p>
      </span>
      <span v-else>
        <p>It was</p>
        <p><b>{{scale}}</b></p>
      </span>

      <button class="repeat" v-focus @click.prevent="onStart">
        Next Scale
      </button>
    </span>

    <div class="config">
      <h4 @click.prevent="onToggleConfig">[Configuration]</h4>

      <div v-if="showConfig">
        <div class="scale-list">
          <div class="scale" v-for="(scale, index) in scaleNames" :key="scale">
            <label>
              <input type="checkbox" @change="persist" v-model="toggleScales[index]"/>
              {{scale}}
            </label>
            <button @click.prevent="onToggleScale(scale)">Play</button>
          </div>
        </div>

        <div class="gain">
          <label>
            Gain:
            <br/>
            <input type="range" v-model="gain" min="0.25" max="1" step="0.01"/>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ScalePlayer, { SCALE_NAMES } from '../audio/player.js';

export default {
  name: 'Player',
  data() {
    return {
      player: null,
      scaleNames: SCALE_NAMES,
      toggleScales: SCALE_NAMES.map(() => true),
      gain: 1,

      showConfig: false,
      state: 'idle',
      score: 0,
      best: 0,
      streak: 0,
      multiplier: 1,

      scale: null,
      base: null,
      guess: '',
    };
  },

  mounted() {
    if (localStorage.toggleScales) {
      this.toggleScales = JSON.parse(localStorage.toggleScales);
    }
    if (localStorage.best) {
      this.best = JSON.parse(localStorage.best);
    }
    if (localStorage.gain) {
      this.gain = JSON.parse(localStorage.gain);
    }
  },

  unmounted() {
    if (this.player) {
      this.player.close();
    }
  },

  computed: {
    selectedScales() {
      return this.scaleNames.filter((_, i) => {
        return this.toggleScales[i];
      });
    },

    matchedScale() {
      let guess = this.guess.toLowerCase();
      if (/^ma/.test(guess)) {
        guess = 'ionian';
      } else if (/^min/.test(guess)) {
        guess = 'natural';
      }
      const matching = this.scaleNames.filter((scale) => {
        return scale.toLowerCase().startsWith(guess);
      });

      if (matching.length !== 1) {
        return null;
      }

      return matching[0];
    }
  },

  watch: {
    gain(newGain) {
      this.player.setGain(newGain);
      this.persist();
    }
  },

  methods: {
    onStart() {
      // Create audio player on click
      if (!this.player) {
        this.player = new ScalePlayer();
      }

      this.state = 'guessing';
      this.guess = '';

      this.scale = this.selectedScales[
          (Math.random() * this.selectedScales.length) | 0];

      let newBase;
      do {
        newBase = Math.floor(Math.random() * 12);
      } while (newBase === this.base);
      this.base = newBase;

      this.player.playScale(this.scale, { base: this.base });
    },

    onRepeat() {
      this.player.playScale(this.scale, { base: this.base });
    },

    onSkip() {
      this.state = 'skip';
    },

    onGuess() {
      if (this.matchedScale === this.scale) {
        this.score += 100 * this.multiplier;
        this.best = Math.max(this.best, this.score);

        this.streak += 1;

        this.persist();
        this.onStart();
      } else {
        this.streak = 1;

        this.onSkip();
      }
      this.multiplier = 1 + Math.floor(Math.log(this.streak) / Math.log(2));
    },

    onToggleScale(scale) {
      this.player.playScale(scale, { base: 0 });
    },

    onToggleConfig() {
      this.showConfig = !this.showConfig;
    },

    // Helpers

    persist() {
      localStorage.toggleScales = JSON.stringify(this.toggleScales);
      localStorage.best = JSON.stringify(this.best);
      localStorage.gain = JSON.stringify(this.gain);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.config {
  margin-top: 4rem;
}

.config h4 {
  cursor: pointer;
  user-select: none;
}

.config .scale-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.config .scale-list .scale {
  flex: 0;
}

.config .scale-list .scale button {
  margin-left: 0.5rem;
  font-size: 1rem;
  padding: 0 0.25rem;
}

.config .gain label {
  line-height: 2rem;
}

.config .gain input {
  margin: 0;
  padding: 0;
  margin-left: 0.25rem;
  width: 100%;
}

.wrong b {
  font-family: Pacifico;
  font-size: 1.5rem;
}

.wrong b.expected {
  color: #3F3FD4;
}

.wrong b.actual {
  color: #D43F3F;
}

.repeat {
  margin-top: 2rem;
}

.score {
  margin-bottom: 2rem;
}
</style>

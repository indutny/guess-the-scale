<template>
  <div class="player">
    <h3 class="score">
      Score: {{score}} <span v-if="multiplier !== 1">(x{{multiplier}})</span>
      /
      Best score: {{best}}
    </h3>

    <span v-if="state === 'idle'">
      <button v-focus class="start" @click.prevent="onStart">Start</button>
    </span>
    <span v-else-if="state === 'guessing'" class="guessing">
      <form @submit.prevent="onGuess">
        <div class="row">
          <input v-focus autofocus v-model="guess" class="guess"
            placeholder="Scale name"/>
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
        <section class="scale-list">
          <div class="scale-column"
               v-for="group in scaleGroups"
               :key="group.name">
            <div class="scale" v-for="scale in group.scales" :key="scale">
              <label>
                <input
                  type="checkbox"
                  @change="onToggleScale(scale.name)"
                  v-model="scale.active"/>
                {{scale.name}}
              </label>
              <button @click.prevent="onPlayScale(scale.name)">Play</button>
            </div>
          </div>
        </section>

        <section class="gain">
          <label>
            Gain:
            <br/>
            <input type="range" v-model="gain" @change="persist"
              min="0.01" max="0.5" step="0.01"/>
          </label>
        </section>

        <section class="melody">
          <label>
            Melody:
            <br/>
            <input
              v-model="melody" @change="persist" placeholder="1,2,3,4,5,6,7,8"/>
          </label>
        </section>

        <section class="bpm">
          <label>
            BPM:
            <br/>
            <input
              type="number"
              v-model="bpm" @change="persist" placeholder="120"/>
          </label>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import ScalePlayer, { SCALES } from '../audio/player.js';

export default {
  name: 'Player',
  data() {
    const scales = [];
    for (const [ name, { type } ] of SCALES) {
      scales.push({ type, name, active: true });
    }

    return {
      player: null,
      scales,

      gain: 0.125,
      melody: '1,2,3,4,5,6,7,8',
      bpm: 120,

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
    if (localStorage.scales) {
      for (const [ name, active ] of JSON.parse(localStorage.scales)) {
        const scale = this.scales.find((scale) => scale.name === name);
        scale.active = !!active;
      }
    }

    if (localStorage.best) {
      this.best = JSON.parse(localStorage.best);
    }
    if (localStorage.gain) {
      this.gain = JSON.parse(localStorage.gain);
    }
    if (localStorage.melody) {
      this.melody = JSON.parse(localStorage.melody);
    }
    if (localStorage.bpm) {
      this.bpm = JSON.parse(localStorage.bpm);
    }
  },

  unmounted() {
    if (this.player) {
      this.player.close();
    }
  },

  computed: {
    scaleGroups() {
      return [ 'maj', 'min' ].map((groupName) => {
        const group = [];
        for (const scale of this.scales) {
          if (scale.type === groupName) {
            group.push(scale);
          }
        }

        return {
          name: groupName,
          scales: group,
        };
      });
    },

    scaleNames() {
      return Array.from(SCALES.keys());
    },

    selectedScales() {
      return this.scales.filter((scale) => scale.active);
    },

    matchedScale() {
      let guess = this.guess.toLowerCase();
      if (/^ma/.test(guess)) {
        guess = 'ionian';
      } else if (/^min/.test(guess)) {
        guess = 'aeolian';
      }
      const matching = this.scaleNames.filter((scale) => {
        return scale.toLowerCase().startsWith(guess);
      });

      if (matching.length !== 1) {
        return null;
      }

      return matching[0];
    },
  },

  watch: {
    gain(newGain) {
      if (this.player) {
        this.player.setGain(newGain);
      }
    },
  },

  methods: {
    onStart() {
      this.state = 'guessing';
      this.guess = '';

      this.scale = this.selectedScales[
          (Math.random() * this.selectedScales.length) | 0].name;

      let newBase;
      do {
        newBase = Math.floor(Math.random() * 12) - 6;
      } while (newBase === this.base);
      this.base = newBase;

      this.lazyPlayer().playScale(this.scale, {
        base: this.base,
        bpm: this.bpm,
        melody: this.melody,
      });
    },

    onRepeat() {
      this.lazyPlayer().playScale(this.scale, {
        base: this.base,
        bpm: this.bpm,
        melody: this.melody,
      });
    },

    onSkip() {
      this.state = 'skip';
    },

    onGuess() {
      if (this.matchedScale === this.scale) {
        this.score += 100 * this.multiplier;
        this.best = Math.max(this.best, this.score);

        this.streak += 1;

        this.onStart();
      } else {
        this.score = Math.max(this.score - 75, 0);
        this.streak = 1;

        this.onSkip();
      }
      this.persist();
      this.multiplier = 1 + Math.floor(Math.log(this.streak) / Math.log(2));
    },

    onToggleScale() {
      this.state = 'idle';
      this.persist();
    },

    onPlayScale(scale) {
      this.lazyPlayer().playScale(scale, { base: 0, bpm: this.bpm });
    },

    onToggleConfig() {
      this.showConfig = !this.showConfig;
    },

    // Helpers

    lazyPlayer() {
      // Create audio player on click
      if (!this.player) {
        this.player = new ScalePlayer();
        this.player.setGain(this.gain);
      }
      return this.player;
    },

    persist() {
      const scales = [];
      for (const scale of this.scales) {
        scales.push([ scale.name, scale.active ]);
      }
      localStorage.scales = JSON.stringify(scales);
      localStorage.best = JSON.stringify(this.best);
      localStorage.gain = JSON.stringify(this.gain);
      localStorage.melody = JSON.stringify(this.melody);
      localStorage.bpm = JSON.stringify(this.bpm);
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
  grid-template-columns: repeat(2, 1fr);
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

.config .section:not(:last-child) {
  margin-bottom: 2rem;
}

.guess {
  max-width: 16rem;
}
</style>

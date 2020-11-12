import Synthesizer from './synthesizer';

export const SCALES = new Map();

function addScale(name, type, notes) {
  SCALES.set(name, { type, notes });
}
addScale('Ionian/Major', 'maj', [ 0, 2, 4, 5, 7, 9, 11 ]);
addScale('Mixolydian', 'maj', [ 0, 2, 4, 5, 7, 9, 10 ]);
addScale('Lydian', 'maj', [ 0, 2, 4, 6, 7, 9, 11 ]);

addScale('Phrygian', 'min', [ 0, 1, 3, 5, 7, 8, 10 ]);
addScale('Locrian', 'min', [ 0, 1, 3, 5, 6, 8, 10 ]);
addScale('Melodic minor', 'min', [ 0, 2, 3, 5, 7, 9, 11 ]);
addScale('Aeolian/Natural minor', 'min', [ 0, 2, 3, 5, 7, 8, 10 ]);
addScale('Dorian', 'min', [ 0, 2, 3, 5, 7, 9, 10 ]);
addScale('Harmonic minor', 'min', [ 0, 2, 3, 5, 7, 8, 11 ]);

export default class Player {
  constructor() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.context = new AudioContext();

    this.harmony = new Synthesizer(this.context, { type: 'triangle' });
    this.melody = new Synthesizer(this.context);

    this.gain = this.context.createGain();
    this.gain.gain.setValueAtTime(1, this.context.currentTime);

    this.harmony.connect(this.gain);
    this.melody.connect(this.gain);

    this.compressor = this.context.createDynamicsCompressor();
    this.gain.connect(this.compressor);
    this.compressor.connect(this.context.destination);

    // Limiter
    this.compressor.threshold.value = -1;
    this.compressor.attack.value = 0.001;
    this.compressor.release.value = 0.050;
    this.compressor.ratio.value = 1000;
  }

  setGain(value) {
    this.gain.gain.setValueAtTime(value, this.context.currentTime);
  }

  note(scale, base, index) {
    let shift = 0;
    while (index >= 7) {
      shift++;
      index -= 7;
    }
    while (index < 0) {
      shift--;
      index += 7;
    }
    return base + scale[index % 7] + shift * 12;
  }

  parseMelody(melody) {
    const notes = melody.toLowerCase().split(/[^r\d+]/g)
      .filter((n) => n)
      .map((n) => {
        // Rest
        if (n === 'r') {
          return 'rest';
        }
        return parseInt(n, 10) - 1;
      });

    const out = [];
    for (const n of notes) {
      const last = out[out.length - 1];
      if (last && last.note === n) {
        last.duration++;
      } else {
        out.push({ note: n, duration: 1 });
      }
    }
    return out;
  }

  playScale(name, { base, melody = '1,2,3,4,5,6,7,8', bpm = 120 } = {}) {
    const start = this.context.currentTime;

    const eight = 60 / bpm / 2;

    let total = 0;

    melody = this.parseMelody(melody);

    const scale = SCALES.get(name).notes;

    if (base === undefined) {
      base = Math.floor(Math.random() * 12);
    }

    this.harmony.stop(start);
    this.melody.stop(start);

    for (const { note, duration } of melody) {
      if (note !== 'rest') {
        this.melody.play(start + total, this.note(scale, base, 7 + note), {
          gain: 0.5,
          duration: duration * eight,
        });
      }
      total += duration * eight;
    }

    // Shell chord
    const long = { gain: 0.7, duration: total };
    this.harmony.play(start, this.note(scale, base, -7), long);
    this.harmony.play(start, this.note(scale, base, 0), long);
    this.harmony.play(start, this.note(scale, base, 2), long);

    return { base };
  }

  close() {
    this.context.close();
  }
}

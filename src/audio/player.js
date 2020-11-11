import Synthesizer from './synthesizer';

export const SCALES = {
  'Ionian/Major': [ 0, 2, 4, 5, 7, 9, 11 ],
  Dorian: [ 0, 2, 3, 5, 7, 9, 10 ],
  Phrygian: [ 0, 1, 3, 5, 7, 8, 10 ],
  Lydian: [ 0, 2, 4, 6, 7, 9, 11 ],
  Mixolydian: [ 0, 2, 4, 5, 7, 9, 10 ],
  Aeolian: [ 0, 2, 3, 5, 7, 8, 10 ],
  Locrian: [ 0, 1, 3, 5, 6, 8, 10 ],

  'Natural minor': [ 0, 2, 3, 5, 7, 8, 10 ],
  'Harmonic minor': [ 0, 2, 3, 5, 7, 8, 11 ],
  'Melodic minor': [ 0, 2, 3, 5, 7, 9, 11 ],
};

export const SCALE_NAMES = Object.keys(SCALES);

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
    this.gain.connect(this.context.destination);
  }

  setGain(value) {
    this.gain.gain.setValueAtTime(value, this.context.currentTime);
  }

  playScale(name, { base, bpm = 240 } = {}) {
    const start = this.context.currentTime;

    const duration = 60 / bpm;

    this.harmony.stop(start);
    this.melody.stop(start);

    const mode = SCALES[name];

    if (base === undefined) {
      base = Math.floor(Math.random() * 12);
    }

    const long = { gain: 1, duration: duration * (1 + mode.length) };
    const short = { gain: 0.75, duration };

    // Shell chord
    this.harmony.play(start, base - 12 + mode[0], long);
    this.harmony.play(start, base + mode[0], long);
    this.harmony.play(start, base + mode[2], long);

    for (let i = 0; i < mode.length; i++) {
      this.melody.play(start + i * duration, base + 12 + mode[i], short);
    }
    this.melody.play(start + mode.length * duration,
      base + 24 + mode[0], short);

    return { base };
  }

  close() {
    this.context.close();
  }
}

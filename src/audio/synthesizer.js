import Oscillator from './oscillator';

export default class Synthesizer {
  constructor(context, { type, voices = 8 } = {}) {
    this.context = context;
    this.voices = [];
    for (let i = 0; i < voices; i++) {
      this.voices.push({
        osc: new Oscillator(context, type),
        freeAt: context.currentTime,
      });
    }
  }

  connect(destination) {
    for (const v of this.voices) {
      v.osc.connect(destination);
    }
  }

  play(time, note, params) {
    const first = this.voices[0];
    // Start at C3
    const freq = 110 * Math.pow(2, (3 + note) / 12);
    first.freeAt = first.osc.play(time, freq, params);

    this.voices.sort(Synthesizer.voiceCompare);
  }

  stop(time) {
    for (const v of this.voices) {
      v.osc.stop(time);
    }
  }

  static voiceCompare(a, b) {
    return a.freeAt - b.freeAt;
  }
}

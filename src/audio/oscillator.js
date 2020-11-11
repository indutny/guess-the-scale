export default class Oscillator {
  constructor(context, type = 'square', options) {
    this.options = {
      gain: {},
      filter: {},
      ...options,
    };
    this.options = {
      gain: {
        attack: 0.001,
        sustain: 2,
        release: 0.05,
        ...this.options.gain,
      },
      filter: {
        ground: 600,
        attack: { time: 0.02, value: 7000 },
        sustain: { time: 0, value: 6000 },
        release: { time: 0.2 },
        ...this.options.filter,
      },
    };
    this.osc = context.createOscillator();
    this.osc.type = type;

    this.filter = context.createBiquadFilter();
    this.filter.type = 'lowpass';

    this.gain = context.createGain();
    this.gain.gain.setValueAtTime(0, context.currentTime);

    this.osc.connect(this.filter);
    this.filter.connect(this.gain);
    this.gain.connect(context.destination);

    this.osc.start();
  }

  envelope(param, time, duration, options) {
    const { ground, attack, sustain, release } = options;

    param.cancelScheduledValues(time);
    param.linearRampToValueAtTime(ground, time);

    let d = Math.min(duration, attack.time)
    time += d;
    duration = Math.max(0, duration - d);
    param.linearRampToValueAtTime(attack.value, time);

    d = Math.min(duration, sustain.time);
    time += d;
    duration = Math.max(0, duration - d);
    param.linearRampToValueAtTime(sustain.value, time);

    time += duration;
    duration = 0;
    param.linearRampToValueAtTime(sustain.value, time);

    time += release.time;
    param.linearRampToValueAtTime(ground, time);
  }


  play(time, freq = 440, { gain = 0.2, duration = 0.25 } = {}) {
    this.osc.frequency.cancelScheduledValues(time);
    this.osc.frequency.setValueAtTime(freq, time);

    this.envelope(this.gain.gain, time, duration, {
      ground: 0,
      attack: { time: this.options.gain.attack, value: gain },
      sustain: { time: this.options.gain.sustain, value: gain * 0.75 },
      release: { time: this.options.gain.release },
    });

    this.envelope(this.filter.frequency, time, duration, this.options.filter);

    return time + duration + this.options.gain.release;
  }

  stop(time) {
    this.gain.gain.cancelScheduledValues(time);
    this.gain.gain.linearRampToValueAtTime(0, time);
  }
}

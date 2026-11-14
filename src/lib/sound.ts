"use client";

/**
 * Procedural sound effects on the Web Audio API: no audio files, no dependencies.
 * Every cue also has a visual counterpart elsewhere (CLAUDE.md #10).
 */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.9;
    master.connect(ctx.destination);
  }
  return ctx;
}

/** Call from a user gesture (iOS only starts audio after a tap). */
export function unlockAudio() {
  const c = ac();
  if (c && c.state === "suspended") void c.resume();
}

export function setMuted(value: boolean) {
  muted = value;
  if (master && ctx) master.gain.setTargetAtTime(value ? 0 : 0.9, ctx.currentTime, 0.03);
}

function noiseBuffer(c: AudioContext, seconds: number) {
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

interface NoiseOpts { dur: number; freq: number; q?: number; gain: number; type?: BiquadFilterType; attack?: number; sweepTo?: number }
function noise({ dur, freq, q = 1, gain, type = "bandpass", attack = 0.003, sweepTo }: NoiseOpts, delay = 0) {
  const c = ac();
  if (!c || !master) return;
  const t = c.currentTime + delay;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, dur);
  const f = c.createBiquadFilter();
  f.type = type;
  f.frequency.setValueAtTime(freq, t);
  if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
  f.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t);
  src.stop(t + dur + 0.02);
}

interface ToneOpts { freq: number; dur: number; gain: number; type?: OscillatorType; to?: number; attack?: number }
function tone({ freq, dur, gain, type = "sine", to, attack = 0.005 }: ToneOpts, delay = 0) {
  const c = ac();
  if (!c || !master) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export const sfx = {
  /** Typewriter key. */
  key() {
    noise({ dur: 0.035, freq: 2600 + Math.random() * 900, q: 2.5, gain: 0.12 });
    tone({ freq: 180, dur: 0.03, gain: 0.05, type: "square" });
  },
  /** Rubber stamp on paper. */
  stamp() {
    tone({ freq: 95, to: 48, dur: 0.16, gain: 0.5 });
    noise({ dur: 0.09, freq: 700, q: 0.7, gain: 0.35, type: "lowpass" });
  },
  paper() {
    noise({ dur: 0.22, freq: 3200, q: 0.8, gain: 0.07, sweepTo: 1400, attack: 0.04 });
  },
  /** Glass panel touching glass or wood. */
  clink() {
    const base = 1900 + Math.random() * 700;
    tone({ freq: base, dur: 0.28, gain: 0.07 });
    tone({ freq: base * 1.52, dur: 0.2, gain: 0.04 });
    tone({ freq: base * 2.31, dur: 0.12, gain: 0.025 });
  },
  /** Panel settling into straw. */
  settle() {
    noise({ dur: 0.16, freq: 1500, q: 0.6, gain: 0.16, sweepTo: 600 });
    tone({ freq: 150, to: 90, dur: 0.12, gain: 0.25 });
  },
  reject() {
    tone({ freq: 210, to: 150, dur: 0.14, gain: 0.12, type: "triangle" });
  },
  /** Crate lid and hammer. */
  lid() {
    for (let i = 0; i < 3; i++) {
      tone({ freq: 130, to: 70, dur: 0.12, gain: 0.45 }, 0.25 + i * 0.17);
      noise({ dur: 0.05, freq: 1800, q: 1, gain: 0.2 }, 0.25 + i * 0.17);
    }
    noise({ dur: 0.3, freq: 500, q: 0.5, gain: 0.25, type: "lowpass", attack: 0.05 });
  },
  /** Distant shock wave. */
  rumble() {
    noise({ dur: 2.6, freq: 70, q: 0.4, gain: 0.9, type: "lowpass", attack: 0.5 });
    tone({ freq: 38, to: 26, dur: 2.2, gain: 0.5, attack: 0.4 });
  },
  /** Church bell of the Sint-Jan. */
  bell() {
    const partials = [1, 2.0, 2.4, 3.0, 4.2, 5.4];
    partials.forEach((p, i) =>
      tone({ freq: 196 * p, dur: 3.2 - i * 0.4, gain: 0.16 / (i + 1), attack: 0.004 }),
    );
  },
  /** Oar stroke; `loud` 0..1 scales the splash. */
  oar(loud = 0.6) {
    noise({ dur: 0.34, freq: 900, q: 0.6, gain: 0.08 + loud * 0.2, sweepTo: 300, attack: 0.04 });
    tone({ freq: 110, to: 70, dur: 0.14, gain: 0.08 });
  },
  /** Bicycle bell: two bright strikes. */
  ring() {
    for (const d of [0, 0.13]) {
      tone({ freq: 2350, dur: 0.5, gain: 0.09 }, d);
      tone({ freq: 3520, dur: 0.3, gain: 0.05 }, d);
    }
  },
  /** A bomb coming down: the falling whistle that gives you time to get away. */
  fall() {
    tone({ freq: 1700, to: 320, dur: 2.5, gain: 0.07, type: "triangle", attack: 0.3 });
  },
  /** A footstep on roof tiles. */
  step() {
    noise({ dur: 0.05, freq: 1100 + Math.random() * 500, q: 1.4, gain: 0.07 });
  },
  whistle() {
    tone({ freq: 2300, to: 2500, dur: 0.5, gain: 0.12, type: "square", attack: 0.02 });
    tone({ freq: 2380, dur: 0.5, gain: 0.08, type: "sine", attack: 0.02 });
  },
  /** Quiet confirmation when something goes right. */
  chime() {
    tone({ freq: 660, dur: 0.5, gain: 0.07 });
    tone({ freq: 990, dur: 0.6, gain: 0.05 }, 0.09);
  },
};

let bed: { src: AudioBufferSourceNode; lfo: OscillatorNode; gain: GainNode } | null = null;

/** Night on the canal: water lapping against the quay, slowly swelling and fading. */
export const ambience = {
  start() {
    const c = ac();
    if (!c || !master || bed) return;
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c, 4);
    src.loop = true;
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 340;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.11, c.currentTime + 2.5);
    const lfo = c.createOscillator();
    lfo.frequency.value = 0.17;
    const depth = c.createGain();
    depth.gain.value = 0.05;
    lfo.connect(depth).connect(gain.gain);
    src.connect(filter).connect(gain).connect(master);
    src.start();
    lfo.start();
    bed = { src, lfo, gain };
  },
  stop() {
    if (!bed || !ctx) return;
    const { src, lfo, gain } = bed;
    bed = null;
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.3);
    src.stop(ctx.currentTime + 1.2);
    lfo.stop(ctx.currentTime + 1.2);
  },
};

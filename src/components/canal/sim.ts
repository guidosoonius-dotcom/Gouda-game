/**
 * Nachtvaart: pure simulation, no rendering. Frame-rate independent (all damping is exp(-k*dt)).
 * Coordinates in metres: the canal runs along Z, the boat travels toward -Z, x = 0 is mid-canal.
 */
import { TUNING } from "@/game/tuning";

const T = TUNING.canal;

export interface Reed {
  x: number;
  z: number;
  r: number;
}

export const COURSE = {
  length: T.length,
  halfWidth: T.halfWidth,
  bridgeZ: -70,
  lockZ: -T.length,
  /** Hazard A: the bridge guard's searchlight zig-zags over this stretch. */
  beam: { zNear: -31, zFar: -57, radius: 3.0, alertFrom: -22, alertTo: -66 },
  /** Hazard B: a lamp on the lock sweeps a full-width band up and down this stretch. */
  band: { zNear: -84, zFar: -128, half: 2.6, alertFrom: -78, alertTo: -132 },
  reeds: [
    { x: -3.4, z: -14, r: 2.4 },
    { x: -3.4, z: -29, r: 2.4 },
    { x: 3.4, z: -40, r: 2.4 },
    { x: -3.4, z: -51, r: 2.4 },
    { x: 3.4, z: -62, r: 2.4 },
    { x: -3.4, z: -80, r: 2.4 },
    { x: 3.4, z: -91, r: 2.4 },
    { x: -3.4, z: -102, r: 2.4 },
    { x: 3.4, z: -113, r: 2.4 },
    { x: -3.4, z: -124, r: 2.4 },
  ] as Reed[],
} as const;

export type Side = "L" | "R";
export type Status = "ready" | "play" | "caught" | "done";
export type Outcome = "stil" | "gezien" | "omweg";
export type SimEvent =
  | { type: "stroke"; side: Side; masked: boolean; rhythm: boolean }
  | { type: "bump" }
  | { type: "bellStart" }
  | { type: "toll" }
  | { type: "bellEnd" }
  | { type: "alert" }
  | { type: "caught" }
  | { type: "respawn" }
  | { type: "checkpoint" }
  | { type: "done"; outcome: Outcome };

export interface Sim {
  status: Status;
  t: number;
  x: number;
  z: number;
  /** Radians; 0 points down the canal (-Z), positive turns toward +X. */
  heading: number;
  v: number;
  yawRate: number;
  noise: number;
  cooldown: Record<Side, number>;
  lastStroke: { side: Side; t: number } | null;
  braking: boolean;
  hidden: boolean;
  lit: boolean;
  underBridge: boolean;
  exposure: number;
  caught: number;
  checkpoint: { x: number; z: number; reed: number };
  /** Current centre of the bridge searchlight on the water. */
  beam: { x: number; z: number };
  bandZ: number;
  alertUntil: number;
  graceUntil: number;
  caughtUntil: number;
  bell: { active: boolean; next: number; until: number; nextToll: number };
  outcome: Outcome | null;
}

export interface SimInput {
  /** Strokes pressed since the previous step. */
  strokes: Side[];
  /** Both oars held: brake and lie still. */
  holdBoth: boolean;
}

export function createSim(): Sim {
  return {
    status: "ready",
    t: 0,
    x: 0,
    z: 0,
    heading: 0,
    v: 0,
    yawRate: 0,
    noise: 0,
    cooldown: { L: 0, R: 0 },
    lastStroke: null,
    braking: false,
    hidden: false,
    lit: false,
    underBridge: false,
    exposure: 0,
    caught: 0,
    checkpoint: { x: 0, z: 0, reed: -1 },
    beam: { x: 0, z: COURSE.beam.zNear },
    bandZ: COURSE.band.zNear,
    alertUntil: 0,
    graceUntil: 0,
    caughtUntil: 0,
    bell: { active: false, next: T.bellEvery * 0.55, until: 0, nextToll: 0 },
    outcome: null,
  };
}

const damp = (rate: number, dt: number) => Math.exp(-rate * dt);
const approach = (from: number, to: number, rate: number, dt: number) => to + (from - to) * damp(rate, dt);

/** Where the searchlight would be if the guard were just sweeping. */
export function beamSweep(t: number) {
  const b = COURSE.beam;
  const mid = (b.zNear + b.zFar) / 2;
  return {
    x: Math.sin((2 * Math.PI * t) / T.sweepPeriod) * (COURSE.halfWidth - 1.2),
    z: mid + Math.sin((2 * Math.PI * t) / (T.sweepPeriod * 1.7) + 1) * ((b.zNear - b.zFar) / 2),
  };
}

export function bandSweep(t: number) {
  const b = COURSE.band;
  return b.zNear - ((1 - Math.cos((2 * Math.PI * t) / (T.sweepPeriod * 1.25))) / 2) * (b.zNear - b.zFar);
}

export function reedAt(x: number, z: number): number {
  return COURSE.reeds.findIndex((r) => Math.hypot(x - r.x, z - r.z) < r.r);
}

/** Advance the simulation by dt seconds. Mutates `s`, returns what happened. */
export function step(s: Sim, input: SimInput, dt: number): SimEvent[] {
  const ev: SimEvent[] = [];
  if (s.status === "ready" || s.status === "done") return ev;
  s.t += dt;

  if (s.status === "caught") {
    if (s.t >= s.caughtUntil) {
      if (s.caught >= T.maxCaught) {
        s.status = "done";
        s.outcome = "omweg";
        ev.push({ type: "done", outcome: "omweg" });
      } else {
        Object.assign(s, { status: "play", x: s.checkpoint.x, z: s.checkpoint.z, heading: 0, v: 0, yawRate: 0, noise: 0, exposure: 0 });
        s.alertUntil = 0;
        s.graceUntil = s.t + 2.5;
        ev.push({ type: "respawn" });
      }
    }
    return ev;
  }

  // Bells of the Sint-Jan: while they toll, strokes make no noise.
  const bell = s.bell;
  if (!bell.active && s.t >= bell.next) {
    bell.active = true;
    bell.until = s.t + T.bellDuration;
    bell.nextToll = s.t;
    ev.push({ type: "bellStart" });
  }
  if (bell.active) {
    if (s.t >= bell.nextToll && s.t < bell.until - 0.4) {
      bell.nextToll = s.t + 1.7;
      ev.push({ type: "toll" });
    }
    if (s.t >= bell.until) {
      bell.active = false;
      bell.next = s.t + T.bellEvery;
      ev.push({ type: "bellEnd" });
    }
  }

  // Oars
  s.cooldown.L = Math.max(0, s.cooldown.L - dt);
  s.cooldown.R = Math.max(0, s.cooldown.R - dt);
  s.braking = input.holdBoth;
  for (const side of input.strokes) {
    if (s.cooldown[side] > 0 || s.braking) continue;
    s.cooldown[side] = 0.3;
    const rhythm = !!s.lastStroke && s.lastStroke.side !== side && s.t - s.lastStroke.t < T.rhythmWindow;
    s.lastStroke = { side, t: s.t };
    s.v = Math.min(T.maxSpeed, s.v + T.strokeImpulse + (rhythm ? T.rhythmBonus : 0));
    // "L" steers left: the heading decreases (toward -X).
    s.yawRate += (side === "R" ? 1 : -1) * T.strokeYaw * T.yawDamping;
    if (!bell.active) s.noise = Math.min(1, s.noise + T.strokeNoise);
    ev.push({ type: "stroke", side, masked: bell.active, rhythm });
  }

  // Motion
  s.v *= damp(s.braking ? T.brakeDamping : T.glideDamping, dt);
  s.heading += s.yawRate * dt;
  s.yawRate *= damp(T.yawDamping, dt);
  s.heading = Math.max(-1.2, Math.min(1.2, s.heading));
  s.x += Math.sin(s.heading) * s.v * dt;
  s.z -= Math.cos(s.heading) * s.v * dt;
  const limit = COURSE.halfWidth - 0.8;
  if (Math.abs(s.x) > limit) {
    s.x = Math.sign(s.x) * limit;
    // Only a real knock against the quay is heard; sliding along it is not.
    if (Math.abs(Math.sin(s.heading)) * s.v > T.bumpSpeed) {
      s.noise = Math.min(1, s.noise + T.bumpNoise);
      s.v *= 0.45;
      ev.push({ type: "bump" });
    }
    s.heading *= 0.5;
    s.yawRate = 0;
  }
  s.noise = Math.max(0, s.noise - T.noiseDecay * dt);

  // Cover and checkpoints
  const reed = reedAt(s.x, s.z);
  s.hidden = reed >= 0;
  s.underBridge = Math.abs(s.z - COURSE.bridgeZ) < 2.2;
  if (reed > s.checkpoint.reed) {
    s.checkpoint = { x: COURSE.reeds[reed].x, z: COURSE.reeds[reed].z, reed };
    ev.push({ type: "checkpoint" });
  }

  // Guards react to noise inside their stretch.
  const inA = s.z < COURSE.beam.alertFrom && s.z > COURSE.beam.alertTo;
  const inB = s.z < COURSE.band.alertFrom && s.z > COURSE.band.alertTo;
  if (s.noise >= T.noiseAlert && (inA || inB) && s.t > s.alertUntil) {
    s.alertUntil = s.t + 3.5;
    ev.push({ type: "alert" });
  }
  const alerted = s.t < s.alertUntil;
  const sweep = beamSweep(s.t);
  const targetA = alerted && inA ? { x: s.x, z: s.z } : sweep;
  s.beam.x = approach(s.beam.x, targetA.x, alerted && inA ? 2.6 : 3.5, dt);
  s.beam.z = approach(s.beam.z, targetA.z, alerted && inA ? 2.6 : 3.5, dt);
  s.bandZ = approach(s.bandZ, alerted && inB ? s.z : bandSweep(s.t), alerted && inB ? 1.8 : 3.5, dt);

  // Exposure
  const inBeam = Math.hypot(s.x - s.beam.x, s.z - s.beam.z) < COURSE.beam.radius + 0.7;
  const inBand = Math.abs(s.z - s.bandZ) < COURSE.band.half + 0.5;
  s.lit = (inBeam || inBand) && !s.underBridge;
  if (s.lit && !s.hidden && s.t > s.graceUntil) s.exposure += dt;
  else s.exposure = Math.max(0, s.exposure - 2 * dt);
  if (s.exposure >= T.exposureLimit) {
    s.status = "caught";
    s.caught += 1;
    s.caughtUntil = s.t + 1.8;
    s.v = 0;
    ev.push({ type: "caught" });
    return ev;
  }

  if (s.z <= COURSE.lockZ + 4) {
    s.status = "done";
    s.outcome = s.caught === 0 ? "stil" : "gezien";
    ev.push({ type: "done", outcome: s.outcome });
  }
  return ev;
}

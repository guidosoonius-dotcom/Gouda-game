/**
 * Over de daken: pure simulation, no rendering, frame-rate independent.
 * The courier runs along the ridges (x in metres) from chimney to chimney while searchlights
 * sweep the roofs. One thumb: tap to dash to the next chimney, hold to lie flat on the tiles.
 */
import { TUNING } from "@/game/tuning";

const T = TUNING.rooftop;

export const ROOF = {
  /** Chimneys to hide behind; the last one is the skylight of the print shop. */
  covers: [0, 9, 19, 27, 38, 47, 58, 66, 77, 88, 97, 108, 118],
  /** Searchlights sweep back and forth between `from` and `to`; `r` is the half-width of the light. */
  beams: [
    { from: 4, to: 72, period: 26, phase: 0.6, r: 3.0 },
    { from: 62, to: 124, period: 19, phase: 2.4, r: 2.7 },
  ],
} as const;

export type RoofStatus = "ready" | "play" | "caught" | "done";
export type RoofOutcome = "ongezien" | "gezien" | "telaat";
export type RoofEvent = { type: "dash" | "arrive" | "flat" | "caught" | "respawn" } | { type: "done"; outcome: RoofOutcome };

export interface RoofSim {
  status: RoofStatus;
  t: number;
  x: number;
  /** Index of the chimney the courier is at, or left last. */
  cover: number;
  moving: boolean;
  flat: boolean;
  lit: boolean;
  exposure: number;
  caught: number;
  timeLeft: number;
  /** Kees comes along: he trails behind and must stay out of the light too. */
  kees: boolean;
  caughtUntil: number;
  outcome: RoofOutcome | null;
}

export function createRoof(kees = false, startCover = 0): RoofSim {
  return {
    status: "ready", t: 0, x: ROOF.covers[startCover], cover: startCover, moving: false, flat: false, lit: false,
    exposure: 0, caught: 0, timeLeft: T.time, kees, caughtUntil: 0, outcome: null,
  };
}

export function beamX(i: number, t: number): number {
  const b = ROOF.beams[i];
  return (b.from + b.to) / 2 + ((b.to - b.from) / 2) * Math.sin((2 * Math.PI * t) / b.period + b.phase);
}

/** Is someone at x (with Kees trailing behind) in a searchlight at time t? */
export function inLight(x: number, t: number, kees: boolean): boolean {
  const tail = kees ? T.keesGap : 0;
  return ROOF.beams.some((b, i) => {
    const bx = beamX(i, t);
    return bx > x - tail - b.r && bx < x + b.r;
  });
}

export const speedOf = (s: RoofSim) => (s.kees ? T.keesSpeed : T.runSpeed);

/** Would a straight dash to the next chimney, started now, stay unseen? Kees whispers this. */
export function dashIsSafe(s: RoofSim): boolean {
  const next = ROOF.covers[s.cover + 1];
  if (next === undefined) return false;
  const v = speedOf(s);
  let exposure = 0;
  for (let tau = 0; tau <= (next - s.x) / v; tau += 0.04) {
    if (inLight(s.x + v * tau, s.t + tau, s.kees)) exposure += 0.04;
    else exposure = Math.max(0, exposure - 0.08);
    if (exposure > T.exposureLimit * 0.6) return false;
  }
  return true;
}

export interface RoofInput {
  tap: boolean;
  hold: boolean;
}

export function stepRoof(s: RoofSim, input: RoofInput, dt: number): RoofEvent[] {
  const ev: RoofEvent[] = [];
  if (s.status === "ready" || s.status === "done") return ev;
  s.t += dt;
  s.timeLeft = Math.max(0, s.timeLeft - dt);
  const finish = (outcome: RoofOutcome) => {
    s.status = "done";
    s.outcome = outcome;
    ev.push({ type: "done", outcome });
  };

  if (s.status === "caught") {
    if (s.t >= s.caughtUntil) {
      if (s.caught >= T.maxCaught) return finish("telaat"), ev;
      Object.assign(s, { status: "play", x: ROOF.covers[s.cover], moving: false, flat: false, exposure: 0 });
      ev.push({ type: "respawn" });
    }
    return ev;
  }
  if (s.timeLeft <= 0) return finish("telaat"), ev;

  if (!s.moving && input.tap && s.cover < ROOF.covers.length - 1) {
    s.moving = true;
    ev.push({ type: "dash" });
  }
  if (s.moving) {
    const flat = input.hold;
    if (flat && !s.flat) ev.push({ type: "flat" });
    s.flat = flat;
    if (!flat) s.x += speedOf(s) * dt;
    const next = ROOF.covers[s.cover + 1];
    if (s.x >= next) {
      Object.assign(s, { x: next, cover: s.cover + 1, moving: false, flat: false });
      ev.push({ type: "arrive" });
      if (s.cover === ROOF.covers.length - 1) return finish(s.caught === 0 ? "ongezien" : "gezien"), ev;
    }
  }

  // Behind a chimney nobody sees you; on the open ridge the light counts, less so lying flat.
  s.lit = s.moving && inLight(s.x, s.t, s.kees);
  if (s.lit) s.exposure += dt * (s.flat ? T.flatFactor : 1);
  else s.exposure = Math.max(0, s.exposure - 2 * dt);
  if (s.exposure >= T.exposureLimit) {
    Object.assign(s, { status: "caught", caught: s.caught + 1, caughtUntil: s.t + 1.6, moving: false, flat: false });
    ev.push({ type: "caught" });
  }
  return ev;
}

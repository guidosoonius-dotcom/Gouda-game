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
  /**
   * Alleys between two houses, crossed with a timed jump: `after` is the chimney before it, `w` the
   * width of the gap (m). The gap is centred between the two chimneys.
   */
  alleys: [
    { after: 1, w: 1.8 },
    { after: 3, w: 2.2 },
    { after: 5, w: 2.0 },
    { after: 7, w: 2.4 },
    { after: 10, w: 1.7 },
  ],
  /** Searchlights sweep back and forth between `from` and `to`; `r` is the half-width of the light. */
  beams: [
    { from: 4, to: 72, period: 26, phase: 0.6, r: 3.0 },
    { from: 62, to: 124, period: 19, phase: 2.4, r: 2.7 },
  ],
} as const;

export type RoofStatus = "ready" | "play" | "caught" | "done";
export type RoofOutcome = "ongezien" | "gezien" | "telaat";
export type RoofEvent =
  | { type: "dash" | "arrive" | "flat" | "caught" | "respawn" | "jumpCue" | "balk" | "land" | "scramble" }
  | { type: "jump"; clean: boolean; standing: boolean }
  | { type: "done"; outcome: RoofOutcome };
/** Where you are in crossing an alley: not near one, in the tap window, in the air, or hesitating at the edge. */
export type Leap = "none" | "open" | "air" | "balk";

/** Run-up between the take-off point and the edge of the gap, and between the gap and landing (m). */
export const RUNUP = 0.45;

/** The alley on the dash that starts at chimney `cover`, as take-off and landing points, if any. */
export function alleyAfter(cover: number) {
  const a = ROOF.alleys.find((al) => al.after === cover);
  if (!a) return null;
  const mid = (ROOF.covers[cover] + ROOF.covers[cover + 1]) / 2;
  return { from: mid - a.w / 2, to: mid + a.w / 2, takeoff: mid - a.w / 2 - RUNUP, land: mid + a.w / 2 + RUNUP };
}

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
  leap: Leap;
  /** The alley ahead has been crossed on this dash. */
  crossed: boolean;
  standing: boolean;
  /** Seconds left hanging from the far edge after a jump that came too early. */
  hang: number;
  /** Was the last jump too early (you grab the edge when you land)? */
  short: boolean;
}

export function createRoof(kees = false, startCover = 0): RoofSim {
  return {
    status: "ready", t: 0, x: ROOF.covers[startCover], cover: startCover, moving: false, flat: false, lit: false,
    exposure: 0, caught: 0, timeLeft: T.time, kees, caughtUntil: 0, outcome: null,
    leap: "none", crossed: false, standing: false, hang: 0, short: false,
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

/**
 * Crossing an alley. Inside the window before the take-off point a tap jumps: in its last stretch a
 * clean jump, earlier and you land short and hang from the far edge for a moment. Without a tap
 * you stop at the edge, in the open, until you tap and jump from standing. Never a fall.
 */
function jump(s: RoofSim, input: RoofInput, dt: number, ev: RoofEvent[]) {
  const al = alleyAfter(s.cover);
  if (s.hang > 0) {
    s.hang -= dt;
    if (s.hang <= 0) ev.push({ type: "land" });
    return;
  }
  if (!al || s.crossed) return;
  const take = (standing: boolean) => {
    const clean = !standing && al.takeoff - s.x <= T.jumpClean;
    Object.assign(s, { leap: "air", standing, short: !standing && !clean });
    ev.push({ type: "jump", clean: clean || standing, standing });
  };
  if (s.leap === "none" && s.x >= al.takeoff - T.jumpWindow) {
    s.leap = "open";
    ev.push({ type: "jumpCue" });
  }
  // the tap that starts the dash does not also jump
  const tap = input.tap && !(s.leap === "open" && ev.some((e) => e.type === "dash"));
  if (s.leap === "open" && tap) take(false);
  else if (s.leap === "balk" && tap) take(true);
  else if (s.leap === "open" && s.x >= al.takeoff) {
    s.x = al.takeoff;
    s.leap = "balk";
    ev.push({ type: "balk" });
  }
  if (s.leap === "air" && s.x >= al.land) {
    Object.assign(s, { x: al.land, leap: "none", crossed: true, standing: false });
    if (s.short) {
      s.hang = T.scramble;
      ev.push({ type: "scramble" });
    } else ev.push({ type: "land" });
  }
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
      Object.assign(s, { status: "play", x: ROOF.covers[s.cover], moving: false, flat: false, exposure: 0, leap: "none", crossed: false, hang: 0 });
      ev.push({ type: "respawn" });
    }
    return ev;
  }
  if (s.timeLeft <= 0) return finish("telaat"), ev;

  if (!s.moving && input.tap && s.cover < ROOF.covers.length - 1) {
    s.moving = true;
    ev.push({ type: "dash" });
  }
  if (s.moving) jump(s, input, dt, ev);
  if (s.moving) {
    // no lying down in mid-air or while hanging from an edge
    const flat = input.hold && s.leap !== "air" && s.hang <= 0;
    if (flat && !s.flat) ev.push({ type: "flat" });
    s.flat = flat;
    if (!flat && s.leap !== "balk" && s.hang <= 0) s.x += speedOf(s) * (s.leap === "air" && s.standing ? T.standingJump : 1) * dt;
    const next = ROOF.covers[s.cover + 1];
    if (s.x >= next) {
      Object.assign(s, { x: next, cover: s.cover + 1, moving: false, flat: false, leap: "none", crossed: false });
      ev.push({ type: "arrive" });
      if (s.cover === ROOF.covers.length - 1) return finish(s.caught === 0 ? "ongezien" : "gezien"), ev;
    }
  }

  // Behind a chimney nobody sees you; on the open ridge (or at the edge of an alley) the light
  // counts, less so lying flat.
  s.lit = s.moving && inLight(s.x, s.t, s.kees);
  if (s.lit) s.exposure += dt * (s.flat ? T.flatFactor : 1);
  else s.exposure = Math.max(0, s.exposure - 2 * dt);
  if (s.exposure >= T.exposureLimit) {
    Object.assign(s, { status: "caught", caught: s.caught + 1, caughtUntil: s.t + 1.6, moving: false, flat: false });
    ev.push({ type: "caught" });
  }
  return ev;
}

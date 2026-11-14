import { describe, expect, it } from "vitest";
import { COURSE, bandSweep, beamSweep, createSim, reedAt, step, type Side, type Sim } from "@/components/canal/sim";
import { TUNING } from "@/game/tuning";

const DT = 1 / 60;

function started(): Sim {
  const s = createSim();
  s.status = "play";
  return s;
}

/** Would a straight dash from the boat to (tx, tz) at `speed` stay out of both lights? */
function dashIsSafe(s: Sim, tx: number, tz: number, speed: number): boolean {
  const dist = Math.hypot(tx - s.x, tz - s.z);
  const total = dist / speed + 0.8;
  for (let tau = 0; tau <= total; tau += 0.1) {
    const k = Math.min(1, (tau * speed) / dist);
    const x = s.x + (tx - s.x) * k;
    const z = s.z + (tz - s.z) * k;
    if (Math.abs(z - COURSE.bridgeZ) < 2.2 || reedAt(x, z) >= 0) continue;
    const beam = beamSweep(s.t + tau);
    if (Math.hypot(x - beam.x, z - beam.z) < COURSE.beam.radius + 1.6) return false;
    if (Math.abs(z - bandSweep(s.t + tau)) < COURSE.band.half + 1.6) return false;
  }
  return true;
}

/** A cautious player: waits in cover, dashes to the next cover when the lights are elsewhere. */
function runBot(maxSeconds: number) {
  const s = started();
  const stops = [...COURSE.reeds.map((r) => ({ x: Math.sign(r.x) * 1.9, z: r.z })), { x: 0, z: COURSE.bridgeZ }, { x: 0, z: COURSE.lockZ }].sort(
    (a, b) => b.z - a.z,
  );
  let next = 0;
  let going = false;
  let lastStrokeAt = -9;
  let lastSide: Side = "R";
  let alerts = 0;

  while (s.t < maxSeconds && s.status !== "done") {
    const strokes: Side[] = [];
    let holdBoth = false;
    if (s.status === "play") {
      while (next < stops.length - 1 && s.z < stops[next].z - 1) next++;
      const target = stops[next];
      const dist = Math.hypot(target.x - s.x, target.z - s.z);
      const covered = s.hidden || s.underBridge || s.z > COURSE.beam.zNear + 6;
      if (!going && covered && s.v < 0.4 && s.noise < 0.2 && dashIsSafe(s, target.x, target.z, 2.8)) going = true;
      if (going) {
        const last = next === stops.length - 1;
        const arrived = !last && (dist < 1.2 || (s.hidden && Math.abs(s.z - target.z) < 2) || (s.underBridge && target.z === COURSE.bridgeZ));
        if (arrived) {
          going = false;
          next = Math.min(stops.length - 1, next + 1);
          holdBoth = true;
        } else {
          let desired = Math.max(-0.6, Math.min(0.6, Math.atan2(target.x - s.x, -(target.z - s.z))));
          if (Math.abs(s.x) > 3.3) desired = -Math.sign(s.x) * 0.4;
          const err = desired - (s.heading + s.yawRate / TUNING.canal.yawDamping);
          const wantsSpeed = s.v < 3.0 && s.noise < 0.38;
          const wantsTurn = Math.abs(err) > 0.3 && s.noise < 0.5;
          if (s.t - lastStrokeAt >= 0.46 && (wantsSpeed || wantsTurn)) {
            const side: Side = err > 0.07 ? "R" : err < -0.07 ? "L" : lastSide === "L" ? "R" : "L";
            strokes.push(side);
            lastSide = side;
            lastStrokeAt = s.t;
          }
        }
      } else if (s.v > 0.3) {
        holdBoth = true;
      }
    } else {
      going = false;
    }
    for (const e of step(s, { strokes, holdBoth }, DT)) {
      if (e.type === "alert") alerts++;
      if (process.env.BOT_DEBUG && (e.type === "caught" || e.type === "alert" || e.type === "checkpoint"))
        console.log(e.type, `t=${s.t.toFixed(1)} x=${s.x.toFixed(1)} z=${s.z.toFixed(1)} v=${s.v.toFixed(1)} noise=${s.noise.toFixed(2)} next=${next} beam=${s.beam.x.toFixed(1)},${s.beam.z.toFixed(1)} band=${s.bandZ.toFixed(1)} going=${going}`);
      if (e.type === "respawn") next = Math.max(0, stops.findIndex((p) => p.z < s.z - 1));
    }
  }
  return { time: s.t, outcome: s.outcome, caught: s.caught, alerts };
}

describe("Nachtvaart course", () => {
  it("can be completed unseen by a patient player", () => {
    const run = runBot(600);
    expect(run.outcome).toBe("stil");
    expect(run.time).toBeLessThan(300);
    process.stderr.write(`bot: ${run.time.toFixed(0)} s, caught ${run.caught}, alerts ${run.alerts}\n`);
  });

  it("rowing flat out through the lights gets you seen, but never stuck", () => {
    const s = started();
    let side: Side = "L";
    let last = 0;
    while (s.t < 400 && s.status !== "done") {
      const strokes: Side[] = [];
      if (s.status === "play" && s.t - last > 0.32) {
        side = side === "L" ? "R" : "L";
        strokes.push(side);
        last = s.t;
      }
      step(s, { strokes, holdBoth: false }, DT);
    }
    expect(s.status).toBe("done");
    expect(s.outcome).not.toBe("stil");
  });

  it("gives the same result at 30, 60 and 120 frames per second", () => {
    const glide = (fps: number) => {
      const s = started();
      step(s, { strokes: ["L"], holdBoth: false }, 1 / fps);
      for (let i = 1; i < fps * 3; i++) step(s, { strokes: [], holdBoth: false }, 1 / fps);
      return { z: s.z, heading: s.heading };
    };
    const a = glide(30), b = glide(60), c = glide(120);
    expect(Math.abs(a.z - c.z)).toBeLessThan(0.08);
    expect(Math.abs(b.z - c.z)).toBeLessThan(0.04);
    expect(Math.abs(a.heading - c.heading)).toBeLessThan(0.02);
  });

  it("bells mask the oars", () => {
    const s = started();
    s.bell.active = true;
    s.bell.until = 99;
    s.bell.nextToll = 99;
    step(s, { strokes: ["L"], holdBoth: false }, DT);
    expect(s.noise).toBe(0);
    s.bell.active = false;
    s.bell.next = 999;
    step(s, { strokes: ["R"], holdBoth: false }, DT);
    expect(s.noise).toBeGreaterThan(0.15);
  });
});

describe("Nachtvaart layout", () => {
  it("lines both banks with houses, keeps the bridge clear and lets a little light escape the blackout", async () => {
    const { LAYOUT, HW } = await import("@/components/canal/layout");
    expect(LAYOUT.houses.length).toBeGreaterThan(40);
    for (const side of [-1, 1]) expect(LAYOUT.houses.filter((h) => h.side === side).length).toBeGreaterThan(20);
    expect(LAYOUT.houses.every((h) => Math.abs(h.z - COURSE.bridgeZ) >= 6.5)).toBe(true);
    expect(LAYOUT.slivers.length).toBeGreaterThanOrEqual(6);
    expect(LAYOUT.slivers.length).toBeLessThan(LAYOUT.houses.length / 2);
    expect(LAYOUT.trees.every((t) => Math.abs(t.x) > HW)).toBe(true);
    process.stderr.write(`layout: ${LAYOUT.houses.length} houses, ${LAYOUT.slivers.length} slivers, ${LAYOUT.trees.length} trees\n`);
  });

  it("moored boats never block a hiding place or the middle of the canal", () => {
    for (const m of COURSE.moored) {
      expect(Math.abs(m.x)).toBeGreaterThan(3.5);
      for (const reed of COURSE.reeds) expect(Math.hypot(m.x - reed.x, m.z - reed.z)).toBeGreaterThan(reed.r + 2.2);
    }
  });
});

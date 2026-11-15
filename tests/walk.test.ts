import { describe, expect, it } from "vitest";
import { tickWalk, updateWalk, walkStart, type Fix, type WalkState } from "@/lib/walk";
import { TUNING } from "@/game/tuning";

const L = TUNING.location;
/** One degree of latitude is about 111 km. */
const M = 1 / 111_000;

/** A fix `t` seconds in, `north` metres north of the origin. */
const fix = (t: number, north: number, extra: Partial<Fix> = {}): Fix => ({ lat: 52 + north * M, lng: 4.7, t: t * 1000, accuracy: 8, ...extra });
function run(fixes: Fix[], from: WalkState = walkStart()) {
  return fixes.reduce(updateWalk, from);
}

describe("walking guard", () => {
  it("blocks at a brisk walk (1.4 m/s) and not while standing", () => {
    const walking = run(Array.from({ length: 10 }, (_, i) => fix(i, i * 1.4)));
    expect(walking.blocked).toBe(true);
    expect(run(Array.from({ length: 8 }, (_, i) => fix(i, 0))).blocked).toBe(false);
  });

  it("is not fooled by GPS jitter around one spot", () => {
    const jitter = [0, 3, -2, 4, -3, 2, -4, 3, 0, -2].map((n, i) => fix(i, n, { accuracy: 12 }));
    expect(run(jitter).blocked).toBe(false);
  });

  it("uses the speed the device reports, when it has one", () => {
    const s = run([fix(0, 0, { speed: 1.5 }), fix(1, 0, { speed: 1.6 }), fix(2, 0, { speed: 1.5 })]);
    expect(s.blocked).toBe(true);
  });

  it("lifts the block only after standing still for a few seconds, not at once", () => {
    let s = run(Array.from({ length: 10 }, (_, i) => fix(i, i * 1.5)));
    expect(s.blocked).toBe(true);
    const stop = 9 * 1.5;
    s = run([fix(10, stop), fix(11, stop)], s);
    expect(s.blocked).toBe(true);
    s = run(Array.from({ length: 9 }, (_, i) => fix(12 + i, stop)), s);
    expect(s.blocked).toBe(false);
  });

  it("a slow shuffle (0.8 m/s) between the limits does not lift it", () => {
    let s = run(Array.from({ length: 10 }, (_, i) => fix(i, i * 1.5)));
    s = run(Array.from({ length: 10 }, (_, i) => fix(10 + i, 13.5 + i * 0.8)), s);
    expect(s.blocked).toBe(s.speed >= L.calmSpeed);
  });

  it("ignores fixes that are too vague to judge by", () => {
    const s = run([fix(0, 0), fix(1, 60, { accuracy: L.maxAccuracy + 30 }), fix(2, 120, { accuracy: L.maxAccuracy + 30 })]);
    expect(s.blocked).toBe(false);
  });

  it("lifts the block when fixes stop coming: iOS reports nothing when you stand still", () => {
    const s = run(Array.from({ length: 10 }, (_, i) => fix(i, i * 1.5)));
    expect(s.blocked).toBe(true);
    expect(tickWalk(s, s.last!.t + 1000).blocked).toBe(true);
    expect(tickWalk(s, s.last!.t + (L.staleAfter + 1) * 1000).blocked).toBe(false);
  });
});

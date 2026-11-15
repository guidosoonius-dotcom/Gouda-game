import { describe, expect, it } from "vitest";
import { ROOF, alleyAfter, createRoof, dashIsSafe, stepRoof, type RoofSim } from "@/components/rooftop/sim";
import { TUNING } from "@/game/tuning";

const DT = 1 / 60;

function started(kees = false, startCover = 0): RoofSim {
  const s = createRoof(kees, startCover);
  s.status = "play";
  return s;
}

/** Taps for the jump this far before the take-off point (m); null never jumps on time. */
function jumpTap(s: RoofSim, at: number | null) {
  const al = alleyAfter(s.cover);
  if (!al || at === null) return s.leap === "balk";
  return s.leap === "open" && al.takeoff - s.x <= at;
}

/** A patient courier: waits behind each chimney until the dash is safe, jumps cleanly. */
function runBot(kees: boolean, startCover = 0, patient = true, jumpAt: number | null = 0.5) {
  const s = started(kees, startCover);
  while (s.status !== "done" && s.t < 400) {
    const tap = !s.moving ? (patient ? dashIsSafe(s) : true) : jumpTap(s, jumpAt);
    stepRoof(s, { tap, hold: false }, DT);
  }
  return s;
}

/** Runs one dash from chimney `cover` across its alley, tapping at `at` m before take-off. */
function dashAcross(cover: number, at: number | null) {
  const s = started(false, cover);
  s.x = ROOF.covers[cover];
  s.t = 1000; // far from the searchlights' timing: only the jump matters here
  s.timeLeft = 1e6;
  const events: string[] = [];
  stepRoof(s, { tap: true, hold: false }, DT);
  let t = 0;
  while (s.cover === cover && t < 20) {
    for (const e of stepRoof(s, { tap: jumpTap(s, at), hold: false }, DT)) events.push(e.type);
    t += DT;
    s.exposure = 0;
    if (s.status === "caught") Object.assign(s, { status: "play" });
  }
  return { s, t, events };
}

describe("Over de daken", () => {
  it("can be crossed unseen and before curfew, alone and with Kees", () => {
    for (const kees of [false, true]) {
      const s = runBot(kees);
      expect(s.outcome, `kees=${kees}`).toBe("ongezien");
      expect(s.timeLeft, `kees=${kees}`).toBeGreaterThan(8);
      process.stderr.write(`roof bot kees=${kees}: ${s.t.toFixed(0)} s, ${s.timeLeft.toFixed(0)} s to spare\n`);
    }
  });

  it("Willem's key (start two chimneys further) leaves more time to spare", () => {
    expect(runBot(false, 2).timeLeft).toBeGreaterThan(runBot(false, 0).timeLeft);
  });

  it("running without looking gets you seen, and after three times you take the alley: never stuck", () => {
    const s = runBot(false, 0, false);
    expect(s.status).toBe("done");
    expect(s.outcome).not.toBe("ongezien");
  });

  it("the clock ends the run: arriving after eight changes the story", () => {
    const s = started();
    while (s.status !== "done") stepRoof(s, { tap: false, hold: false }, 0.1);
    expect(s.outcome).toBe("telaat");
    expect(s.t).toBeCloseTo(TUNING.rooftop.time, 0);
  });

  it("lying flat stops you, and the light counts less", () => {
    const s = started();
    stepRoof(s, { tap: true, hold: false }, DT);
    const x = s.x;
    for (let i = 0; i < 30; i++) stepRoof(s, { tap: false, hold: true }, DT);
    expect(s.flat).toBe(true);
    expect(s.x).toBe(x);
  });

  it("an alley is a timed jump: on time is quickest, too early you hang from the edge, too late you stop", () => {
    const cover = ROOF.alleys[1].after;
    const clean = dashAcross(cover, 0.5);
    const early = dashAcross(cover, TUNING.rooftop.jumpWindow - 0.1);
    const late = dashAcross(cover, null);
    expect(clean.events).toContain("jump");
    expect(clean.events).not.toContain("scramble");
    expect(early.events).toContain("scramble");
    expect(late.events).toContain("balk");
    // everyone gets across; hesitating or grabbing the edge only costs time
    for (const r of [clean, early, late]) expect(r.s.cover).toBe(cover + 1);
    expect(early.t).toBeGreaterThan(clean.t + TUNING.rooftop.scramble * 0.9);
    expect(late.t).toBeGreaterThan(clean.t);
  });

  it("hesitating at the edge leaves you in the open: the light can find you there", () => {
    const s = started(false, ROOF.alleys[0].after);
    s.x = ROOF.covers[s.cover];
    stepRoof(s, { tap: true, hold: false }, DT);
    for (let i = 0; i < 400 && s.leap !== "balk"; i++) stepRoof(s, { tap: false, hold: false }, DT);
    expect(s.leap).toBe("balk");
    expect(s.moving).toBe(true);
    const x = s.x;
    for (let i = 0; i < 60; i++) stepRoof(s, { tap: false, hold: false }, DT);
    expect(s.x).toBe(x);
  });

  it("every alley lies between two chimneys, with room to run up to it", () => {
    for (const a of ROOF.alleys) {
      const al = alleyAfter(a.after)!;
      expect(al.takeoff).toBeGreaterThan(ROOF.covers[a.after] + 0.5);
      expect(al.land).toBeLessThan(ROOF.covers[a.after + 1]);
    }
  });

  it("covers are in order and every searchlight leaves both ends of its sweep dark at times", () => {
    for (let i = 1; i < ROOF.covers.length; i++) expect(ROOF.covers[i]).toBeGreaterThan(ROOF.covers[i - 1] + 6);
    for (const b of ROOF.beams) expect(b.to - b.from).toBeGreaterThan(4 * b.r);
  });
});

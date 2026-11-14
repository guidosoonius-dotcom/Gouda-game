import { describe, expect, it } from "vitest";
import { ROOF, createRoof, dashIsSafe, stepRoof, type RoofSim } from "@/components/rooftop/sim";
import { TUNING } from "@/game/tuning";

const DT = 1 / 60;

function started(kees = false, startCover = 0): RoofSim {
  const s = createRoof(kees, startCover);
  s.status = "play";
  return s;
}

/** A patient courier: waits behind each chimney until the dash is safe. */
function runBot(kees: boolean, startCover = 0, patient = true) {
  const s = started(kees, startCover);
  while (s.status !== "done" && s.t < 400) {
    const tap = !s.moving && (patient ? dashIsSafe(s) : true);
    stepRoof(s, { tap, hold: false }, DT);
  }
  return s;
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

  it("covers are in order and every searchlight leaves both ends of its sweep dark at times", () => {
    for (let i = 1; i < ROOF.covers.length; i++) expect(ROOF.covers[i]).toBeGreaterThan(ROOF.covers[i - 1] + 6);
    for (const b of ROOF.beams) expect(b.to - b.from).toBeGreaterThan(4 * b.r);
  });
});

import { describe, expect, it } from "vitest";
import { STREET, createBike, peopleSafe, peopleTotal, resolveDilemma, stepBike, type BikeSim } from "@/components/bike/sim";
import { TUNING } from "@/game/tuning";

const DT = 1 / 60;
const T = TUNING.bike;

function started(): BikeSim {
  const s = createBike();
  s.status = "play";
  return s;
}

/** A careful rider: steers round rubble, stops short of marked impacts, rings for everyone. */
function runBot(choice: "zoeken" | "groep", careful = true) {
  const s = started();
  let lastBell = -9;
  while (s.status !== "done" && s.t < 300) {
    if (s.status === "dilemma") resolveDilemma(s, choice);
    let want = 0;
    const waiting = s.groups.find((g) => (g.state === "waiting" || g.state === "scared") && g.z < s.z + 8 && g.z > s.z - 12);
    if (waiting && careful) want = waiting.x * 0.55;
    for (const r of STREET.rubble) {
      if (r.z < s.z && r.z > s.z - 9 && Math.abs(want - r.x) < r.r + 1.4) want = r.x + (r.x > 0 ? -1 : 1) * (r.r + 1.9);
    }
    const danger = careful && s.bombs.some((b) => Math.hypot(b.x - s.x, b.z - (s.z - 2.5)) < T.bombRadius + 2.2 && b.z < s.z + 1);
    const left = danger || want < s.x - 0.25;
    const right = danger || want > s.x + 0.25;
    const bell = careful && !!waiting && Math.hypot(waiting.x - s.x, waiting.z - s.z) < T.bellRange - 0.5 && s.t - lastBell > 0.6;
    if (bell) lastBell = s.t;
    stepBike(s, { left, right, bell }, DT);
  }
  return s;
}

describe("Vluchtspoor", () => {
  it("everyone can be brought to the shelter in time when you escort the group", () => {
    const s = runBot("groep");
    expect(s.outcome).toBe("allen");
    expect(peopleSafe(s)).toBe(peopleTotal);
    process.stderr.write(`bike bot groep: ${s.t.toFixed(0)} s, ${s.timeLeft.toFixed(0)} s to spare\n`);
  });

  it("searching the collapsed house also ends well, with Gerrit bringing the others", () => {
    const s = runBot("zoeken");
    expect(s.outcome).toBe("allen");
    expect(s.z).toBeLessThan(STREET.ruin.z + 3);
  });

  it("riding straight through without ringing leaves people behind, but never blocks the story", () => {
    const s = runBot("groep", false);
    expect(s.status).toBe("done");
    expect(s.outcome).not.toBe("allen");
  });

  it("when the raid ends before you arrive, Gerrit takes over: nobody is lost by the clock", () => {
    const s = started();
    while (s.status !== "done") stepBike(s, { left: true, right: true, bell: false }, 0.1);
    expect(s.outcome).toBe("telaat");
  });

  it("a bomb too close scatters the people behind you; the bell brings them back", () => {
    const s = started();
    s.nextBomb = 999;
    s.groups[0].state = "following";
    s.bombs.push({ x: s.x, z: s.z - 1, at: s.t + 0.05 });
    for (let i = 0; i < 10; i++) stepBike(s, { left: false, right: false, bell: false }, DT);
    expect(s.groups[0].state).toBe("scared");
    s.x = s.groups[0].x;
    s.z = s.groups[0].z;
    stepBike(s, { left: true, right: true, bell: true }, DT);
    expect(s.groups[0].state).toBe("following");
  });

  it("rubble and people never overlap, and the dilemma comes before the collapsed house", () => {
    for (const g of STREET.groups) for (const r of STREET.rubble) expect(Math.hypot(g.x - r.x, g.z - r.z)).toBeGreaterThan(r.r + 1.5);
    expect(STREET.dilemmaZ).toBeGreaterThan(STREET.ruin.z + 20);
  });
});

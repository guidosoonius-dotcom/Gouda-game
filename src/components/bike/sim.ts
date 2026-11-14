/**
 * Vluchtspoor: pure simulation, no rendering, frame-rate independent.
 * A street near the station during an air raid. The courier cycles toward the shelter; people who
 * hear the bell follow on foot. Rubble blocks the way, and where a bomb is about to fall the
 * street is marked first: stay out, or the people behind you scatter. Nobody is hurt on screen
 * and there is no game over: when the raid ends, the story records who reached the shelter.
 */
import { TUNING } from "@/game/tuning";

const T = TUNING.bike;

export const STREET = {
  halfWidth: 5.4,
  shelterZ: -150,
  /** Where the man calls out: the dilemma. */
  dilemmaZ: -72,
  /** The collapsed house on the left side of the street. */
  ruin: { x: -4.2, z: -131 },
  groups: [
    { x: -3.6, z: -22, n: 3 },
    { x: 3.7, z: -48, n: 2 },
    { x: -3.3, z: -98, n: 3 },
    { x: 3.6, z: -122, n: 2 },
  ],
  rubble: [
    { x: -1.5, z: -13, r: 1.6 },
    { x: 2.4, z: -33, r: 1.8 },
    { x: -2.6, z: -59, r: 1.7 },
    { x: 1.3, z: -84, r: 1.9 },
    { x: -0.8, z: -110, r: 1.6 },
    { x: 2.8, z: -139, r: 1.5 },
  ],
} as const;

export type GroupState = "waiting" | "following" | "scared" | "gerrit" | "safe";
export type BikeOutcome = "allen" | "enkelen" | "telaat";
export type BikeEvent =
  | { type: "bell" | "join" | "bump" | "whistle" | "impact" | "scatter" | "dilemma" }
  | { type: "done"; outcome: BikeOutcome };

export interface Bomb {
  x: number;
  z: number;
  /** Time of impact. */
  at: number;
}

export interface BikeSim {
  status: "ready" | "play" | "dilemma" | "done";
  t: number;
  x: number;
  z: number;
  v: number;
  timeLeft: number;
  groups: { state: GroupState; x: number; z: number }[];
  choice: "zoeken" | "groep" | null;
  bombs: Bomb[];
  nextBomb: number;
  bombCount: number;
  outcome: BikeOutcome | null;
}

export function createBike(): BikeSim {
  return {
    status: "ready", t: 0, x: 0, z: 0, v: 0, timeLeft: T.time,
    groups: STREET.groups.map((g) => ({ state: "waiting" as GroupState, x: g.x, z: g.z })),
    choice: null, bombs: [], nextBomb: 6, bombCount: 0, outcome: null,
  };
}

const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const following = (s: BikeSim) => s.groups.filter((g) => g.state === "following").length;
export const peopleSafe = (s: BikeSim) =>
  s.groups.reduce((sum, g, i) => sum + (g.state === "safe" || g.state === "gerrit" ? STREET.groups[i].n : 0), 0);
export const peopleTotal = STREET.groups.reduce((sum, g) => sum + g.n, 0);

/** The player's answer to the man by the collapsed house. */
export function resolveDilemma(s: BikeSim, choice: "zoeken" | "groep") {
  s.choice = choice;
  s.status = "play";
  // Searching: Gerrit takes over everyone who is with you; you ride ahead alone.
  if (choice === "zoeken") s.groups.forEach((g) => g.state === "following" && (g.state = "gerrit"));
}

export interface BikeInput {
  left: boolean;
  right: boolean;
  bell: boolean;
}

export function stepBike(s: BikeSim, input: BikeInput, dt: number): BikeEvent[] {
  const ev: BikeEvent[] = [];
  if (s.status !== "play") return ev;
  s.t += dt;
  s.timeLeft = Math.max(0, s.timeLeft - dt);
  const finish = (late: boolean) => {
    // Whoever is still walking behind you is brought in by Gerrit.
    s.groups.forEach((g) => g.state === "following" && (g.state = late ? "gerrit" : "safe"));
    s.status = "done";
    s.outcome = late ? "telaat" : peopleSafe(s) === peopleTotal ? "allen" : "enkelen";
    ev.push({ type: "done", outcome: s.outcome });
  };
  if (s.timeLeft <= 0) return finish(true), ev;

  // Riding: walking pace with people behind you, both brakes to stop.
  const brake = input.left && input.right;
  const target = brake ? 0 : following(s) > 0 ? T.walkSpeed : T.rideSpeed;
  s.v += (target - s.v) * (1 - Math.exp(-3.2 * dt));
  const turn = brake ? 0 : (input.right ? 1 : 0) - (input.left ? 1 : 0);
  s.x += turn * T.steer * dt * Math.min(1, s.v / T.walkSpeed + 0.25);
  s.x = Math.max(-STREET.halfWidth + 0.6, Math.min(STREET.halfWidth - 0.6, s.x));
  s.z -= s.v * dt;
  for (const r of STREET.rubble) {
    const dx = s.x - r.x;
    const dz = s.z - r.z;
    const d = Math.hypot(dx, dz);
    if (d < r.r + 0.5 && d > 0.001) {
      s.x += (dx / d) * (r.r + 0.5 - d);
      s.z += (dz / d) * (r.r + 0.5 - d);
      if (s.v > 1.5) ev.push({ type: "bump" });
      s.v *= 0.5;
    }
  }

  // The bell: whoever hears it close by falls in behind the bike.
  if (input.bell) {
    ev.push({ type: "bell" });
    s.groups.forEach((g) => {
      if ((g.state === "waiting" || g.state === "scared") && Math.hypot(g.x - s.x, g.z - s.z) < T.bellRange) {
        g.state = "following";
        ev.push({ type: "join" });
      }
    });
  }
  s.groups.forEach((g, i) => {
    if (g.state !== "following") return;
    const slot = s.groups.slice(0, i).filter((o) => o.state === "following").length;
    g.x += (s.x - g.x) * (1 - Math.exp(-2.5 * dt));
    g.z += (s.z + 2.6 + slot * 2.2 - g.z) * (1 - Math.exp(-2.5 * dt));
  });

  // Bombs: first the whistle and a mark on the street, then the impact.
  if (s.t >= s.nextBomb) {
    const n = s.bombCount++;
    s.bombs.push({ x: (hash(n) - 0.5) * 7.5, z: s.z - 7 - hash(n + 50) * 11, at: s.t + T.bombWarn });
    s.nextBomb = s.t + T.bombEvery * (0.8 + 0.4 * hash(n + 99));
    ev.push({ type: "whistle" });
  }
  s.bombs = s.bombs.filter((b) => {
    if (s.t < b.at) return true;
    ev.push({ type: "impact" });
    if (Math.hypot(b.x - s.x, b.z - s.z) < T.bombRadius + 1) {
      // Too close: everyone behind you runs for cover and has to be called again.
      let scattered = false;
      s.groups.forEach((g, i) => {
        if (g.state !== "following") return;
        g.state = "scared";
        g.x = (i % 2 ? 1 : -1) * (STREET.halfWidth - 1.2);
        g.z = s.z + 5 + i * 1.5;
        scattered = true;
      });
      s.v = 0;
      if (scattered) ev.push({ type: "scatter" });
    }
    return false;
  });

  if (s.choice === null && s.z <= STREET.dilemmaZ) {
    s.status = "dilemma";
    ev.push({ type: "dilemma" });
    return ev;
  }
  // Searching ends at the collapsed house; escorting ends at the shelter door.
  if (s.choice === "zoeken" && s.z <= STREET.ruin.z + 2) {
    s.groups.forEach((g) => (g.state === "waiting" || g.state === "scared") && g.z < STREET.dilemmaZ && (g.state = "gerrit"));
    return finish(false), ev;
  }
  if (s.z <= STREET.shelterZ + 3) return finish(false), ev;
  return ev;
}

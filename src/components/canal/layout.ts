/**
 * Where everything stands along the canal. Pure data, generated once from a fixed seed, so the
 * static world, the animated details and the tests all agree.
 */
import { COURSE } from "./sim";

export const HW = COURSE.halfWidth;
export const LEN = COURSE.length + 40;
/** Top of the quay above the water. */
export const QUAY = 1.26;

export function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const HOUSE_WIDTHS = [5.6, 6.2, 5.0];

export interface House {
  kind: number;
  side: number;
  z: number;
  /** Vertical stretch, so no two roof lines are equal. */
  sy: number;
  tint: [number, number, number];
}

export interface Sliver {
  x: number;
  y: number;
  z: number;
  side: number;
  seed: number;
}

function build() {
  const r = rng(1944);
  const houses: House[] = [];
  const slivers: Sliver[] = [];
  for (const side of [1, -1]) {
    let z = 14;
    while (z > -LEN + 24) {
      const kind = Math.floor(r() * 3);
      const w = HOUSE_WIDTHS[kind];
      const zc = z - w / 2;
      z -= w + 0.03;
      if (Math.abs(zc - COURSE.bridgeZ) < 6.5) continue;
      const sy = 0.92 + r() * 0.22;
      const shade = 1.5 + r() * 0.8;
      houses.push({ kind, side, z: zc, sy, tint: [shade * (0.95 + r() * 0.15), shade, shade * (0.92 + r() * 0.12)] });
      // Blackout: only now and then a sliver of light escapes past a curtain.
      if (r() < 0.42 && zc < -4) {
        // Either past the shutters on the ground floor, or past a curtain upstairs.
        const ground = r() < 0.6;
        slivers.push({
          x: side * (HW + 3.0),
          y: QUAY + (ground ? 1.75 : 4.5) * sy,
          z: ground ? zc - side * w * 0.2 + 0.3 : zc + (Math.floor(r() * 3) - 1) * w * 0.3 + 0.3,
          side,
          seed: r() * 100,
        });
      }
    }
  }

  const trees: { x: number; z: number; yaw: number; s: number }[] = [];
  for (const side of [1, -1]) {
    for (let z = 9 - r() * 6; z > -LEN + 30; z -= 11 + r() * 7) {
      if (Math.abs(z - COURSE.bridgeZ) < 7 || z < COURSE.lockZ + 6) continue;
      trees.push({ x: side * (HW + 1.9), z, yaw: r() * 6.28, s: 0.85 + r() * 0.4 });
    }
  }

  // Mooring posts stand on the bank opposite each reed bed, where the water is open.
  const posts = COURSE.reeds.map((reed) => ({ x: -Math.sign(reed.x) * (HW - 0.55), z: reed.z + 1.5 - r() * 3 }));
  COURSE.moored.forEach((m) => posts.push({ x: Math.sign(m.x) * (HW - 0.5), z: m.z + 2.0 }, { x: Math.sign(m.x) * (HW - 0.5), z: m.z - 2.0 }));

  const leaves = Array.from({ length: 70 }, () => ({ x: (r() * 2 - 1) * (HW - 0.4), z: r() * 80, yaw: r() * 6.28, s: 0.09 + r() * 0.08, drift: 0.03 + r() * 0.05 }));
  return { houses, slivers, trees, posts, leaves };
}

export const LAYOUT = build();

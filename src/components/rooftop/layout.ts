/** Where the roofs stand. Derived from the chimneys of the course: one house per chimney. */
import { rng } from "@/components/canal/layout";
import { ROOF } from "./sim";

/** Ridge height and width of the `dakhuis` model at scale 1. */
const RIDGE = 10.2;
const WIDTH = 9;

export interface RoofHouse {
  x0: number;
  x1: number;
  sx: number;
  sy: number;
  ridge: number;
  tint: [number, number, number];
}

function build(): RoofHouse[] {
  const r = rng(1942);
  const c = ROOF.covers;
  // scenery houses before the first and after the last chimney
  const centres = [c[0] - 27, c[0] - 18, c[0] - 9, ...c, c[c.length - 1] + 9, c[c.length - 1] + 19, c[c.length - 1] + 28];
  const edges = centres.map((x, i) => (i === 0 ? x - 5 : (centres[i - 1] + x) / 2 + (r() - 0.5) * 1.2));
  edges.push(centres[centres.length - 1] + 5);
  return centres.map((_, i) => {
    const alley = i % 3 === 1 ? 0.7 : 0.08;
    const x0 = edges[i] + alley;
    const x1 = edges[i + 1] - alley;
    const sy = 0.88 + r() * 0.24;
    const shade = 1.15 + r() * 0.6;
    return { x0, x1, sx: (x1 - x0) / WIDTH, sy, ridge: RIDGE * sy, tint: [shade * (0.95 + r() * 0.12), shade, shade * 0.95] };
  });
}

export const HOUSES = build();
export const houseAt = (x: number) => Math.max(0, HOUSES.findIndex((h) => x < h.x1 + 0.4));
export const ridgeAt = (x: number) => HOUSES[houseAt(x)].ridge;
/** The two lookout towers behind the roofs, each with a searchlight. */
export const TOWERS = ROOF.beams.map((b) => ({ x: (b.from + b.to) / 2, z: -13 }));
export const TOWER_TOP = 14.3;

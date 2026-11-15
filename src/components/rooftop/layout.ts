/**
 * Where the roofs stand. Derived from the chimneys of the course: one house per chimney. Purely
 * visual: the simulation only knows x, so jumps and climbs never change the timing of a dash.
 */
import { rng } from "@/components/canal/layout";
import { ROOF } from "./sim";

export type RoofKind = "dakhuis" | "dakhuis_steil" | "dakhuis_plat";

/** Per kind at scale 1: height of the walking line (ridge or flat roof) and the roof's rise per metre. */
const KINDS: Record<RoofKind, { top: number; slope: number }> = {
  dakhuis: { top: 10.2, slope: 3.2 / (4.8 * 1.05) },
  dakhuis_steil: { top: 11.0, slope: 4.6 / (4.8 * 1.05) },
  dakhuis_plat: { top: 9.0, slope: 0 },
};
const WIDTH = 9;
/** The ridges run along z = RIDGE_Z; the courier runs on them, chimneys stand just behind. */
export const RIDGE_Z = -1.2;
export const CHIMNEY_Z = -2.0;

export interface RoofHouse {
  x0: number;
  x1: number;
  kind: RoofKind;
  sx: number;
  sy: number;
  /** Height of the walking line: the ridge, or the lead of a flat roof. */
  ridge: number;
  /** Rise per metre away from the ridge (0 on a flat roof). */
  slope: number;
  tint: [number, number, number];
}

function build(): RoofHouse[] {
  const r = rng(1942);
  const c = ROOF.covers;
  // scenery houses before the first and after the last chimney
  const centres = [c[0] - 27, c[0] - 18, c[0] - 9, ...c, c[c.length - 1] + 9, c[c.length - 1] + 19, c[c.length - 1] + 28];
  const edges = centres.map((x, i) => (i === 0 ? x - 5 : (centres[i - 1] + x) / 2 + (r() - 0.5) * 1.2));
  edges.push(centres[centres.length - 1] + 5);
  // an alley (steeg) between some houses: the courier jumps it
  const alley = edges.map((_, i) => (i > 0 && i < edges.length - 1 && r() < 0.45 ? 0.8 + r() * 0.45 : 0.06));
  let last = 10.2;
  const order: RoofKind[] = ["dakhuis", "dakhuis_steil", "dakhuis", "dakhuis_plat"];
  let before: RoofKind = "dakhuis";
  return centres.map((_, i) => {
    // never the same kind twice in a row
    let kind = order[Math.floor(r() * order.length)];
    if (kind === before) kind = order[(order.indexOf(kind) + 1 + Math.floor(r() * 3)) % order.length];
    if (kind === before) kind = before === "dakhuis" ? "dakhuis_steil" : "dakhuis";
    before = kind;
    const k = KINDS[kind];
    const x0 = edges[i] + alley[i];
    const x1 = edges[i + 1] - alley[i + 1];
    // heights vary from house to house, but never more than a climb of 2.2 m from the last one
    const want = (0.78 + r() * 0.5) * k.top;
    const ridge = Math.max(last - 2.2, Math.min(last + 2.2, want));
    last = ridge;
    const sy = ridge / k.top;
    const shade = 1.15 + r() * 0.6;
    return { x0, x1, kind, sx: (x1 - x0) / WIDTH, sy, ridge, slope: k.slope * sy, tint: [shade * (0.95 + r() * 0.12), shade, shade * 0.95] };
  });
}

export const HOUSES = build();
export const houseAt = (x: number) => Math.max(0, HOUSES.findIndex((h) => x < h.x1 + 0.4));
export const ridgeAt = (x: number) => HOUSES[houseAt(x)].ridge;
/** Height of the roof `dz` metres in front of (positive) or behind the ridge line at x. */
export const roofAt = (x: number, dz: number) => {
  const h = HOUSES[houseAt(x)];
  return h.ridge - h.slope * Math.abs(dz);
};

/** How far before an edge the courier takes off, and after it lands; further for a big step. */
const TAKEOFF = 0.45;
const TAKEOFF_PER_METRE = 0.35;

/**
 * Height of the courier's feet at x, and how far into a jump they are (0 on a roof, 1 at the top
 * of the arc). Over an alley the feet follow a parabola from one walking line to the next; between
 * houses that touch, a small hop takes them up or down the step.
 */
export function stride(x: number) {
  for (let i = 0; i < HOUSES.length - 1; i++) {
    const a = HOUSES[i];
    const b = HOUSES[i + 1];
    const run = TAKEOFF + TAKEOFF_PER_METRE * Math.abs(b.ridge - a.ridge);
    const from = a.x1 - run;
    const to = b.x0 + run;
    if (x <= from || x >= to) continue;
    const u = (x - from) / (to - from);
    const gap = b.x0 - a.x1;
    const apex = 0.25 + gap * 0.32 + Math.max(0, b.ridge - a.ridge) * 0.55;
    return { y: a.ridge + (b.ridge - a.ridge) * u + apex * 4 * u * (1 - u), air: Math.sin(Math.PI * u), gap };
  }
  return { y: ridgeAt(x), air: 0, gap: 0 };
}

/** The two lookout towers behind the roofs, each with a searchlight. */
export const TOWERS = ROOF.beams.map((b) => ({ x: (b.from + b.to) / 2, z: -13 }));
export const TOWER_TOP = 14.3;

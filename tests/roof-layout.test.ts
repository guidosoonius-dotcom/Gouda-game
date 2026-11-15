import { describe, expect, it } from "vitest";
import { HOUSES, stride } from "@/components/rooftop/layout";
import { ROOF } from "@/components/rooftop/sim";

describe("rooftop layout", () => {
  const first = ROOF.covers[0];
  const last = ROOF.covers[ROOF.covers.length - 1];
  const played = HOUSES.filter((h) => h.x1 > first && h.x0 < last);

  it("varies the roofs: all three kinds on the route, never the same kind twice in a row", () => {
    expect(new Set(played.map((h) => h.kind)).size).toBe(3);
    HOUSES.slice(1).forEach((h, i) => expect(h.kind).not.toBe(HOUSES[i].kind));
  });

  it("has height differences, but no climb over 2.2 m", () => {
    const steps = HOUSES.slice(1).map((h, i) => Math.abs(h.ridge - HOUSES[i].ridge));
    expect(Math.max(...steps)).toBeLessThanOrEqual(2.2 + 1e-9);
    expect(steps.filter((d) => d > 1).length).toBeGreaterThanOrEqual(4);
  });

  it("puts alleys on the route that the courier jumps", () => {
    const gaps = played.slice(1).map((h, i) => h.x0 - played[i].x1);
    expect(gaps.filter((g) => g > 1.5).length).toBeGreaterThanOrEqual(3);
  });

  it("keeps the feet on a continuous path: no teleporting up or down", () => {
    let prev = stride(first - 5).y;
    for (let x = first - 5; x <= last + 5; x += 0.05) {
      const { y, air } = stride(x);
      expect(Math.abs(y - prev)).toBeLessThan(0.25);
      expect(air).toBeGreaterThanOrEqual(0);
      expect(air).toBeLessThanOrEqual(1);
      prev = y;
    }
  });

  it("stands every chimney on a roof, not over a gap", () => {
    for (const c of ROOF.covers) expect(stride(c).air).toBe(0);
  });
});

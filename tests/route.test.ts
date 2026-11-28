import { describe, expect, it } from "vitest";
import { hasPaper, legMetres, ROUTE, routeMetres, stopFacts, stopPictures } from "@/data/route";
import { PLACES } from "@/data/places";
import { SPOREN } from "@/data/sporen";
import { FACTS } from "@/data/sources";

describe("city walk", () => {
  it("passes every place exactly once", () => {
    const ids = ROUTE.map((s) => s.place);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort((a, b) => a - b)).toEqual(PLACES.map((p) => p.id).sort((a, b) => a - b));
  });

  it("shows each spoor at its own place", () => {
    for (const s of ROUTE) for (const id of s.sporen) expect(SPOREN.find((x) => x.id === id)?.chapter).toBe(s.place);
    expect(ROUTE.flatMap((s) => s.sporen).sort()).toEqual(SPOREN.map((s) => s.id).sort());
  });

  it("has something real to tell at every stop", () => {
    for (const s of ROUTE) {
      const facts = stopFacts(s.place);
      expect(facts.length, `stop ${s.place}`).toBeGreaterThan(0);
      for (const id of facts) expect(FACTS[id]).toBeDefined();
    }
  });

  it("marks every picture as a photograph with credit or as an illustration", () => {
    for (const s of ROUTE)
      for (const p of stopPictures(s.place)) {
        if (p.src.startsWith("/img/archive/")) expect(p.credit).toBeTruthy();
        else expect(p.credit).toBeUndefined();
      }
  });

  it("is a walk, not a hike", () => {
    for (let i = 0; i < ROUTE.length - 1; i++) expect(legMetres(i)!).toBeLessThan(900);
    expect(legMetres(ROUTE.length - 1)).toBeNull();
    expect(routeMetres()).toBeLessThan(4000);
    expect(ROUTE.some((s) => hasPaper(s.place))).toBe(true);
  });
});

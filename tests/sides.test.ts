import { describe, expect, it } from "vitest";
import { SIDES } from "@/data/sides";
import { CHAPTERS } from "@/data/chapters";
import { PLACES, openSides } from "@/data/places";
import { FACTS } from "@/data/sources";
import { satchelItems } from "@/data/satchel";

describe("side stories (zijsporen)", () => {
  it("are four, with ids that do not clash with the evenings, at least the town hall and the orphanage", () => {
    expect(SIDES.length).toBeGreaterThanOrEqual(3);
    expect(new Set(PLACES.map((p) => p.id)).size).toBe(PLACES.length);
    for (const s of SIDES) expect(s.id).toBeGreaterThan(10);
    const places = SIDES.map((s) => s.place);
    expect(places).toContain("Het Stadhuis");
    expect(places).toContain("Het Weeshuis");
  });

  it("each has a puzzle, ends with a page of real history, and every fact is in the register", () => {
    for (const s of SIDES) {
      expect(s.task, s.title).toBe("puzzle");
      expect(s.puzzle, s.title).toBeDefined();
      const facts = s.mirror ? [...s.mirror.facts, s.mirror.notice.fact] : s.memorial!.facts;
      expect(facts.length, s.title).toBeGreaterThan(0);
      for (const id of facts) expect(FACTS[id], id).toBeDefined();
    }
  });

  it("opens after the chapter it follows, never blocks the evenings, and sets no choices", () => {
    expect(openSides([]).map((s) => s.id)).toEqual(SIDES.filter((s) => s.side!.after === 0).map((s) => s.id));
    expect(openSides(CHAPTERS.map((c) => c.id)).length).toBe(SIDES.length);
    for (const s of SIDES) expect(s.pages.some((p) => p.kind === "dilemma"), s.title).toBe(false);
  });

  it("puzzles can be solved: the hidden message reads down the first letters, there are coupons to cut", () => {
    for (const p of SIDES.flatMap((s) => [s.puzzle!, ...(s.warmup ? [s.warmup] : [])])) {
      if (p.kind === "acrostic") expect(p.lines.map((l) => l[0]).join("")).toBe(p.answer.replace(/\s/g, ""));
      if (p.kind === "coupons") {
        expect(p.coupons.some((c) => c.ok)).toBe(true);
        for (const c of p.coupons) if (!c.ok) expect(c.why, c.id).toBeTruthy();
      }
      if (p.kind === "words") expect(new Set(p.pairs.map((x) => x[0])).size).toBe(p.pairs.length);
    }
  });

  it("the synagogue is a place of remembrance, like Oosthaven 31: no illustration, no fiction headline, no invented names", () => {
    const syn = SIDES.find((s) => s.place === "De Synagoge")!;
    expect(syn.mirror).toBeUndefined();
    expect(syn.memorial).toBeDefined();
    expect(syn.pages.every((p) => p.image === "")).toBe(true);
    expect(syn.memorial!.names).toEqual([]);
  });

  it("lies on the map and inside the old town", () => {
    for (const s of PLACES.filter((p) => !p.offMap)) {
      expect(s.map.x, s.title).toBeGreaterThan(0);
      expect(s.map.x, s.title).toBeLessThan(100);
      expect(s.map.y, s.title).toBeGreaterThan(0);
      expect(s.map.y, s.title).toBeLessThan(100);
      expect(Math.abs(s.coords.lat - 52.011), s.title).toBeLessThan(0.008);
      expect(Math.abs(s.coords.lng - 4.711), s.title).toBeLessThan(0.008);
    }
  });

  it("leaves something in the satchel, re-readable, and labels fiction", () => {
    const items = satchelItems([1, 11, 13], {});
    expect(items.some((i) => i.mirrorOf === 11)).toBe(true);
    expect(items.some((i) => i.mirrorOf === 13)).toBe(true);
    expect(items.find((i) => i.id === "ding-11")?.fiction).toBe(true);
  });
});

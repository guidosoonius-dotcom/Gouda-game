import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { SPOREN } from "@/data/sporen";
import { CHAPTERS } from "@/data/chapters";
import { FACTS } from "@/data/sources";
import { haversine } from "@/lib/geo";

describe("sporen (things to look at on location)", () => {
  it("each has a chapter, a look-assignment, facts from the register and a picture that exists", () => {
    expect(new Set(SPOREN.map((s) => s.id)).size).toBe(SPOREN.length);
    for (const s of SPOREN) {
      expect(CHAPTERS.some((c) => c.id === s.chapter), s.id).toBe(true);
      expect(s.look.length, s.id).toBeGreaterThan(10);
      expect(s.facts.length, s.id).toBeGreaterThan(0);
      for (const f of s.facts) expect(FACTS[f], `${s.id}: ${f}`).toBeDefined();
      expect(existsSync(`public${s.image.src}`), s.image.src).toBe(true);
      expect(s.image.alt, s.id).toBeTruthy();
    }
  });

  it("lie in the centre of Gouda, within a short walk of their chapter", () => {
    for (const s of SPOREN) {
      const chapter = CHAPTERS.find((c) => c.id === s.chapter)!;
      expect(haversine(s.coords, { lat: 52.0116, lng: 4.7104 }), s.id).toBeLessThan(1500);
      expect(haversine(s.coords, chapter.coords), s.id).toBeLessThan(400);
    }
  });

  it("make no claims of their own: no digits (years, counts) outside the facts", () => {
    for (const s of SPOREN) expect(/\d{3,}/.test(s.intro + s.look), s.id).toBe(false);
  });
});

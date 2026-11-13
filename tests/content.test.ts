import { describe, expect, it } from "vitest";
import { CHAPTERS } from "@/data/chapters";
import { FACTS } from "@/data/sources";
import { LEVELS, canPlace, initPieces, isPacked, dims } from "@/components/packing/levels";

describe("history rules", () => {
  it("every fact shown in a mirror exists in the sources register", () => {
    for (const ch of CHAPTERS) {
      if (!ch.mirror) continue;
      for (const id of [...ch.mirror.facts, ch.mirror.notice.fact]) expect(FACTS[id], id).toBeDefined();
    }
  });

  it("a verified fact always names a real source", () => {
    for (const [id, f] of Object.entries(FACTS)) {
      if (f.verified) expect(f.source.startsWith("nog te bepalen"), id).toBe(false);
    }
  });

  it("chapter 3 is a testimony: no task with score, timer or failure", () => {
    expect(CHAPTERS.find((c) => c.id === 3)!.task).toBe("witness");
  });
});

describe("packing puzzle", () => {
  it("each crate is exactly filled by its panels", () => {
    for (const level of LEVELS) {
      const area = level.pieces.reduce((sum, p) => sum + p.w * p.h, 0);
      expect(area, level.crate).toBe(level.cols * level.rows);
    }
  });

  it("the stored solution of each crate is valid, so Willem can always finish", () => {
    for (const level of LEVELS) {
      let pieces = initPieces(level);
      for (const def of level.pieces) {
        const piece = { ...pieces.find((p) => p.id === def.id)!, rot: def.sol.rot };
        expect(canPlace(level, pieces, piece, def.sol.col, def.sol.row), `${level.crate}/${def.id}`).toBe(true);
        pieces = pieces.map((p) => (p.id === def.id ? { ...piece, at: { col: def.sol.col, row: def.sol.row } } : p));
      }
      expect(isPacked(pieces)).toBe(true);
    }
  });

  it("rejects overlaps and panels sticking out of the crate", () => {
    const level = LEVELS[0];
    const pieces = initPieces(level);
    const a = pieces.find((p) => p.id === "a")!;
    const b = pieces.find((p) => p.id === "b")!;
    expect(canPlace(level, pieces, a, 3, 0)).toBe(false);
    const placed = pieces.map((p) => (p.id === "a" ? { ...p, at: { col: 0, row: 0 } } : p));
    expect(canPlace(level, placed, b, 1, 1)).toBe(false);
    expect(canPlace(level, placed, b, 2, 0)).toBe(true);
    expect(dims({ w: 1, h: 3, rot: true })).toEqual({ w: 3, h: 1 });
  });
});

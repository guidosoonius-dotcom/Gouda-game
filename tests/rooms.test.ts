import { describe, expect, it } from "vitest";
import { emptyPlacement, evaluate, neighbours, place, remove, solve } from "@/game/rooms";
import { ROOM_LEVELS } from "@/data/rooms";

describe("the rooms of the orphanage", () => {
  it("every level fits on its grid, names unique, and can be solved", () => {
    for (const l of ROOM_LEVELS) {
      const cells = l.cols * l.rows;
      expect(l.cells.length, l.id).toBe(cells);
      if (l.groups) expect(l.groups.length, l.id).toBe(cells);
      if (l.rowLabels) expect(l.rowLabels.length, l.id).toBe(l.rows);
      expect(l.tokens.length, l.id).toBeLessThanOrEqual(cells);
      expect(new Set(l.tokens.map((t) => t.id)).size, l.id).toBe(l.tokens.length);
      const solution = solve(l);
      expect(solution, l.id).not.toBeNull();
      expect(evaluate(l, solution!).solved, l.id).toBe(true);
    }
  });

  it("an empty room breaks no rule, and a letter follows every room but the last", () => {
    for (const l of ROOM_LEVELS) expect(evaluate(l, emptyPlacement(l)).rules.every((r) => r.v === 0), l.id).toBe(true);
    ROOM_LEVELS.slice(0, -1).forEach((l) => expect(l.letter, l.id).toBeTruthy());
  });

  it("neighbours sit side by side in one row and one room, never across a wall", () => {
    const [dorm] = ROOM_LEVELS;
    expect(neighbours(dorm, 0, 1)).toBe(true);
    expect(neighbours(dorm, 2, 3)).toBe(false); // end of one row, start of the next
    expect(neighbours(dorm, 0, 3)).toBe(false); // above each other
    const halls = ROOM_LEVELS.find((l) => l.groups)!;
    expect(neighbours(halls, 1, 2)).toBe(false); // the wall between the two dormitories
  });

  it("placing swaps with whoever was there, and a broken rule names who breaks it", () => {
    const [dorm] = ROOM_LEVELS;
    let p = place(emptyPlacement(dorm), "kurt", 0);
    p = place(p, "paul", 2);
    let e = evaluate(dorm, p);
    expect(e.rules[0].v).toBe(-1);
    expect([...e.bad].sort()).toEqual(["kurt", "paul"]);
    p = place(p, "paul", 0); // onto Kurt: Kurt moves to where Paul was
    expect(p[0]).toBe("paul");
    expect(p[2]).toBe("kurt");
    p = remove(p, "kurt");
    expect(p.includes("kurt")).toBe(false);
    e = evaluate(dorm, place(p, "kurt", 1));
    expect(e.rules[0].v).toBe(1);
  });

  it("the kitchen keeps meat and milk on separate shelves", () => {
    const kitchen = ROOM_LEVELS.find((l) => l.id === "keuken")!;
    const p = place(place(emptyPlacement(kitchen), "kip", 3), "kaas", 4);
    const e = evaluate(kitchen, p);
    expect(e.rules[0].v).toBe(-1);
    expect(e.bad.has("kip") && e.bad.has("kaas")).toBe(true);
  });
});

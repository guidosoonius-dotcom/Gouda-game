import { describe, expect, it } from "vitest";
import { decodeSave, encodeSave, type Progress } from "@/game/save";
import { CHOICES, OUTCOMES } from "@/game/choices";

describe("recovery code", () => {
  it("round-trips an empty game", () => {
    const p: Progress = { completed: [], flags: {} };
    expect(decodeSave(encodeSave(p))).toEqual(p);
  });

  it("round-trips every combination of choices for a finished game", () => {
    const n = CHOICES.length;
    for (let mask = 0; mask < 3 ** n; mask++) {
      const flags: Record<string, string> = {};
      let m = mask;
      for (const c of CHOICES) {
        const v = m % 3;
        m = Math.floor(m / 3);
        if (v === 1) flags[c.id] = c.A.value;
        if (v === 2) flags[c.id] = c.B.value;
      }
      const p: Progress = { completed: [1, 2, 3, 4, 5, 6], flags };
      expect(decodeSave(encodeSave(p))).toEqual(p);
    }
  });

  it("round-trips task outcomes", () => {
    for (const a of OUTCOMES["ch1.task"]) {
      for (const b of OUTCOMES["ch4.task"]) {
        const p: Progress = { completed: [1, 4], flags: { "ch1.task": a, "ch4.task": b } };
        expect(decodeSave(encodeSave(p))).toEqual(p);
      }
    }
  });

  it("is short enough to write down", () => {
    expect(encodeSave({ completed: [1, 2, 3, 4, 5, 6], flags: {} }).length).toBeLessThanOrEqual(12);
  });

  it("accepts sloppy typing: lower case, spaces, O for 0, I/L for 1", () => {
    const p: Progress = { completed: [1], flags: { "ch1.pass": "glazen", "ch1.task": "alleen" } };
    const code = encodeSave(p);
    expect(decodeSave(code.toLowerCase().replace(/-/g, " "))).toEqual(p);
    expect(decodeSave(code.replace(/0/g, "O").replace(/1/g, "l"))).toEqual(p);
  });

  it("rejects typos and garbage instead of restoring a wrong game", () => {
    const code = encodeSave({ completed: [1], flags: { "ch1.pass": "student" } });
    const body = code.split("-")[1];
    const wrong = body[0] === "A" ? "B" : "A";
    expect(decodeSave(`KG-${wrong}${body.slice(1)}-${code.split("-")[2]}`)).toBeNull();
    expect(decodeSave("")).toBeNull();
    expect(decodeSave("KG-HELLO")).toBeNull();
    expect(decodeSave("KG-ZZZZZZ-Z")).toBeNull();
  });
});

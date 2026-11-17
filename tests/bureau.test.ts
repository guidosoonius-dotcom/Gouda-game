import { describe, expect, it } from "vitest";
import { decide, messenger, monthGrid, nextDay, START, toolsOn, type DeskState } from "@/game/bureau";
import { ORDERS, OUTCOME_TEXT, RULE_FACT, FRIDAY_FACT } from "@/data/bureau";
import { FACTS } from "@/data/sources";
import { TUNING } from "@/game/tuning";

const B = TUNING.bureau;

describe("the messenger's desk (town hall)", () => {
  it("has an order for every day before Friday, each flaw on a real line and the tool for it on the desk", () => {
    expect(ORDERS.length).toBe(4);
    ORDERS.forEach((o, day) => {
      expect(o.flaw).toBeLessThan(o.lines.length);
      if (o.flaw >= 0) {
        expect(o.why, o.day).toBeTruthy();
        expect(o.gain).toBeGreaterThan(0);
      } else expect(o.wrong, o.day).toBeTruthy();
      expect(toolsOn(ORDERS, day).length).toBeGreaterThan(0);
    });
    expect(toolsOn(ORDERS, 3)).toEqual(["regels", "kalender", "adresboek"]);
    expect(FACTS[RULE_FACT]).toBeDefined();
    expect(FACTS[FRIDAY_FACT]).toBeDefined();
  });

  it("finding the flaw wins days at no risk; a wrong guess costs suspicion and keeps the order on the desk", () => {
    const hit = decide(ORDERS, START, "terug", ORDERS[0].flaw);
    expect(hit.result?.found).toBe(true);
    expect(hit.state.suspicion).toBe(0);
    expect(hit.state.gained).toBe(ORDERS[0].gain);

    const none = decide(ORDERS, START, "terug", -1);
    expect(none.result).toBeNull();
    expect(none.state).toEqual(START);

    const miss = decide(ORDERS, START, "terug", 0);
    expect(miss.result).toBeNull();
    expect(miss.miss).toBeTruthy();
    expect(miss.state.suspicion).toBe(B.wrongGuess);
    expect(miss.state.day).toBe(0);
  });

  it("an order without a flaw cannot be sent back without suspicion", () => {
    const day1: DeskState = { ...START, day: 1 };
    for (let line = 0; line < ORDERS[1].lines.length; line++) {
      expect(decide(ORDERS, day1, "terug", line).state.suspicion).toBe(B.wrongGuess);
    }
  });

  it("leaving wins a day and costs suspicion, signing calms things down; suspicion stays in range", () => {
    const left = decide(ORDERS, START, "liggen", -1).state;
    expect(left.suspicion).toBe(B.leave);
    expect(left.gained).toBe(B.leaveGain);
    expect(decide(ORDERS, left, "tekenen", -1).state.suspicion).toBe(B.leave - B.signRelief);
    expect(decide(ORDERS, START, "tekenen", -1).state.suspicion).toBe(0);
    let s = START;
    for (let i = 0; i < 10; i++) s = decide(ORDERS, s, "liggen", -1).state;
    expect(s.suspicion).toBe(B.suspicionMax);
  });

  it("a clean week leaves the messenger unnoticed; leaving everything gets him moved", () => {
    let s = START;
    for (const o of ORDERS) s = nextDay(decide(ORDERS, s, o.flaw >= 0 ? "terug" : "tekenen", o.flaw).state);
    expect(messenger(s.suspicion)).toBe("stil");
    expect(s.gained).toBe(ORDERS.reduce((n, o) => n + o.gain, 0));

    let lazy = START;
    for (let d = 0; d < ORDERS.length; d++) lazy = nextDay(decide(ORDERS, lazy, "liggen", -1).state);
    expect(messenger(lazy.suspicion)).toBe("weg");
    expect(messenger(B.listedAt)).toBe("lijstje");
    for (const k of ["stil", "lijstje", "weg"] as const) expect(OUTCOME_TEXT[k].title).toBeTruthy();
  });

  it("the calendar of June 1940 has 30 days and starts on a Saturday", () => {
    const grid = monthGrid(1940, 6);
    expect(grid.filter((d) => d !== null).length).toBe(30);
    expect(grid.indexOf(1)).toBe(5);
    expect(grid.includes(31)).toBe(false);
  });
});

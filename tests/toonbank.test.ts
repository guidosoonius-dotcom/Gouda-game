import { describe, expect, it } from "vitest";
import { CUSTOMERS } from "@/data/toonbank";
import { TUNING } from "@/game/tuning";
import { cutCoupon, decideExtra, decideKok, giveLoaf, gramsAt, margarineForYou, outcome, start, stepOf, wait, weigh, type Shop } from "@/game/toonbank";

/** A bot behind the counter: cuts the right coupons, cuts margarine at `grams` a try, follows the rules unless told otherwise. */
function play(opts: { giveKok?: boolean; giveExtra?: boolean; grams?: (need: number) => number; wrongFirst?: boolean } = {}) {
  let s: Shop = start();
  for (let guard = 0; guard < 200 && s.at < CUSTOMERS.length; guard++) {
    const c = CUSTOMERS[s.at];
    const step = stepOf(CUSTOMERS, s);
    if (step === "coupons") {
      if (opts.wrongFirst && s.cut.length === 0) {
        const bad = c.coupons.findIndex((k) => !k.ok);
        const r = cutCoupon(CUSTOMERS, s, bad);
        expect(r.why).toBeTruthy();
        s = r.shop;
      }
      const i = c.coupons.findIndex((k, j) => k.ok && !s.cut.includes(j));
      s = cutCoupon(CUSTOMERS, s, i).shop;
    } else if (step === "margarine") s = weigh(CUSTOMERS, s, opts.grams ? opts.grams(c.margarine - s.piece) : c.margarine).shop;
    else if (step === "bread") s = giveLoaf(CUSTOMERS, s);
    else if (step === "dilemma") s = decideKok(CUSTOMERS, s, !!opts.giveKok);
    else if (step === "rush") s = decideExtra(CUSTOMERS, s, !!opts.giveExtra);
  }
  return s;
}

describe("achter de toonbank", () => {
  it("has exactly one loaf left for you when nobody gets bread without a coupon", () => {
    const s = play();
    expect(s.at).toBe(CUSTOMERS.length);
    expect(s.loaves).toBe(1);
    expect(outcome(s)).toBe("thuis");
    expect(margarineForYou(s)).toBe(true);
    expect(s.wrong).toBe(0);
  });

  it("the loaf for mevrouw Kok is the one you go home without", () => {
    expect(outcome(play({ giveKok: true }))).toBe("kok");
    expect(outcome(play({ giveExtra: true }))).toBe("leeg");
    // Kok and the man in a hurry both: the empty basket is still your choice for her
    expect(outcome(play({ giveKok: true, giveExtra: true }))).toBe("kok");
  });

  it("margarine: a short piece is topped up, a heavy one costs the queue", () => {
    const short = play({ grams: (need) => Math.max(10, need - 40) });
    expect(short.over).toBe(0);
    expect(margarineForYou(short)).toBe(true);
    const heavy = play({ grams: (need) => need + 60 });
    expect(heavy.over).toBe(180);
    expect(margarineForYou(heavy)).toBe(false);
    expect(gramsAt(0.25)).toBe(TUNING.toonbank.blockGrams / 4);
  });

  it("a wrong coupon stays on the card and makes the queue restless; serving calms it", () => {
    const s = play({ wrongFirst: true });
    expect(s.wrong).toBeGreaterThan(0);
    expect(outcome(s)).toBe("thuis");
    let w = start();
    w = wait(w, TUNING.toonbank.patience - 1, 5);
    expect(w.unrest).toBe(0);
    for (let i = 0; i < 400; i++) w = wait(w, 100, 0.5);
    expect(w.unrest).toBe(TUNING.toonbank.unrestMax);
  });

  it("every customer can be served, and every coupon that is not valid says why", () => {
    for (const c of CUSTOMERS) {
      if (!c.dilemma) expect(c.coupons.some((k) => k.ok), c.name).toBe(true);
      for (const k of c.coupons) if (!k.ok) expect(k.why, `${c.name} ${k.label}`).toBeTruthy();
      expect(c.margarine % TUNING.toonbank.portion).toBe(0);
      expect(c.coupons.filter((k) => k.ok && k.label === "412").length).toBe(c.loaves);
      expect(c.coupons.filter((k) => k.ok && k.label === "415").length * TUNING.toonbank.portion).toBe(c.margarine);
    }
  });
});

/**
 * Behind the counter (side story at the Markt, April 1945): a pure model of handing out Swedish
 * white bread. Each customer brings a ration card: cut the coupons that the board says are valid,
 * weigh out margarine, hand over the loaves. The basket holds just enough for everyone and for you
 * at the end; a loaf given without a coupon is one you will not have. Tested by
 * `tests/toonbank.test.ts`.
 */
import { TUNING } from "./tuning";

export interface Coupon {
  label: string;
  ok: boolean;
  /** Why a coupon that is not valid stays on the card (shown when the player cuts it). */
  why?: string;
}

export interface Customer {
  name: string;
  /** Mouths at home: shown on the name card. */
  mouths: number;
  /** Painted scene in `public/img/markt/`. */
  scene: string;
  coupons: Coupon[];
  /** Grams of margarine on the valid coupons (0: none). */
  margarine: number;
  loaves: number;
  /** A card that is not valid, and a reason to give anyway: the player decides. */
  dilemma?: boolean;
  /** Asks for one loaf more than the coupons allow, once the bread is in the bag. */
  rush?: boolean;
}

export type Step = "coupons" | "margarine" | "bread" | "rush" | "dilemma";

export interface Shop {
  /** Index of the customer at the counter; `customers.length` once the queue is empty. */
  at: number;
  step: number;
  loaves: number;
  margarine: number;
  unrest: number;
  /** Coupons cut so far for this customer, by index on the card. */
  cut: number[];
  /** Grams on the scale for this customer so far. */
  piece: number;
  given: number;
  /** Totals for the end: valid coupons cut, wrong tries, grams given away over the portions. */
  good: number;
  wrong: number;
  over: number;
  gaveKok: boolean | null;
  gaveExtra: boolean | null;
}

export type Outcome = "thuis" | "kok" | "leeg";

const T = () => TUNING.toonbank;

export function start(): Shop {
  return { at: 0, step: 0, loaves: T().loaves, margarine: T().margarine, unrest: 0, cut: [], piece: 0, given: 0, good: 0, wrong: 0, over: 0, gaveKok: null, gaveExtra: null };
}

export function stepsOf(c: Customer): Step[] {
  if (c.dilemma) return ["dilemma"];
  const steps: Step[] = ["coupons"];
  if (c.margarine > 0) steps.push("margarine");
  if (c.loaves > 0) steps.push("bread");
  if (c.rush) steps.push("rush");
  return steps;
}

export const stepOf = (customers: Customer[], s: Shop): Step | null => (s.at < customers.length ? stepsOf(customers[s.at])[s.step] : null);
const calm = (unrest: number, by: number) => Math.max(0, Math.min(T().unrestMax, unrest + by));

/** The next step for this customer, or the next customer (the queue calms a little). */
function next(customers: Customer[], s: Shop): Shop {
  if (s.step + 1 < stepsOf(customers[s.at]).length) return { ...s, step: s.step + 1, piece: 0, given: 0 };
  return { ...s, at: s.at + 1, step: 0, cut: [], piece: 0, given: 0, unrest: calm(s.unrest, -T().served) };
}

/** Cut coupon `i` from the card. A wrong one stays on the card and the queue grows restless. */
export function cutCoupon(customers: Customer[], s: Shop, i: number): { shop: Shop; why?: string } {
  const c = customers[s.at];
  const coupon = c.coupons[i];
  if (!coupon || s.cut.includes(i)) return { shop: s };
  if (!coupon.ok) return { shop: { ...s, wrong: s.wrong + 1, unrest: calm(s.unrest, T().wrongCut) }, why: coupon.why ?? "Die staat niet op het bord." };
  const shop = { ...s, cut: [...s.cut, i], good: s.good + 1 };
  const all = c.coupons.every((k, j) => !k.ok || shop.cut.includes(j));
  return { shop: all ? next(customers, shop) : shop };
}

export type Weigh = "short" | "good" | "over";

/** Grams in a cut at `fraction` (0..1) of the block on the knife. */
export const gramsAt = (fraction: number) => Math.round(Math.max(0, Math.min(1, fraction)) * T().blockGrams);

/**
 * Put a cut piece on the scale. Too little: cut a little more. Enough: the piece goes over the
 * counter; whatever is more than the portion is gone from the margarine for the rest of the queue.
 */
export function weigh(customers: Customer[], s: Shop, grams: number): { shop: Shop; verdict: Weigh; total: number } {
  const need = customers[s.at].margarine;
  const total = s.piece + grams;
  if (total < need - T().tolerance) return { shop: { ...s, piece: total }, verdict: "short", total };
  const over = Math.max(0, total - need);
  const shop = { ...s, margarine: Math.max(0, s.margarine - total), over: s.over + over };
  return { shop: next(customers, shop), verdict: over > T().tolerance ? "over" : "good", total };
}

/** One loaf from the basket into the customer's bag. */
export function giveLoaf(customers: Customer[], s: Shop): Shop {
  if (s.loaves <= 0) return s;
  const shop = { ...s, loaves: s.loaves - 1, given: s.given + 1 };
  return shop.given >= customers[s.at].loaves ? next(customers, shop) : shop;
}

/** The expired coupon: give a loaf anyway, or refuse as the rules say. */
export function decideKok(customers: Customer[], s: Shop, give: boolean): Shop {
  const shop = { ...s, gaveKok: give, loaves: give ? Math.max(0, s.loaves - 1) : s.loaves };
  return next(customers, shop);
}

/** The customer in a hurry asks for one loaf more than his coupon allows. */
export function decideExtra(customers: Customer[], s: Shop, give: boolean): Shop {
  const shop = { ...s, gaveExtra: give, loaves: give ? Math.max(0, s.loaves - 1) : s.loaves };
  return next(customers, shop);
}

/** The queue grows restless while a customer waits longer than `patience` seconds. */
export function wait(s: Shop, waited: number, dt: number): Shop {
  if (waited < T().patience) return s;
  return { ...s, unrest: calm(s.unrest, T().unrestPerSecond * dt) };
}

/** When the queue is empty: is there bread left for you, and if not, why not. */
export function outcome(s: Shop): Outcome {
  if (s.loaves > 0) return "thuis";
  return s.gaveKok ? "kok" : "leeg";
}

/** Margarine left for your own coupon at the end. */
export const margarineForYou = (s: Shop) => s.margarine >= T().portion;

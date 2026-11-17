/**
 * The messenger's desk (side story at the town hall, June 1940): a pure model of stalling orders.
 * Each day one order arrives. Find the line that is wrong and send it back at no risk, leave it on
 * the desk (a day won, suspicion up) or sign it (suspicion down). Tested by `tests/bureau.test.ts`.
 */
import { TUNING } from "./tuning";

export type Tool = "regels" | "kalender" | "adresboek";
export type Verdict = "terug" | "liggen" | "tekenen";

export interface Order {
  day: string;
  date: string;
  lines: string[];
  /** Index of the line that makes the order invalid, or -1 when the order is lawful. */
  flaw: number;
  /** Days won by sending it back over its flaw. */
  gain: number;
  /** The tool that arrives on the desk this day. */
  tool?: Tool;
  /** Why the flaw counts (shown when the player finds it). */
  why?: string;
  /** What the sergeant says when the player sends it back over something that is not wrong. */
  wrong?: string;
  /** What happens when the order is signed. */
  signed: string;
}

export interface DeskState {
  day: number;
  suspicion: number;
  gained: number;
  verdicts: Verdict[];
}

export interface Result {
  verdict: Verdict;
  text: string;
  /** True when the order went back over a real flaw. */
  found: boolean;
}

export const START: DeskState = { day: 0, suspicion: 0, gained: 0, verdicts: [] };

const B = TUNING.bureau;
const clamp = (v: number) => Math.max(0, Math.min(B.suspicionMax, v));

export const LEAVE_TEXT = "Het bevel blijft liggen. Je wint een dag, maar morgen belt de Ortskommandant zelf.";
export const PICK_FIRST = "Tik eerst op de regel waar iets mis mee is.";
export const NOT_WRONG = "Daar is niets mis mee. De sergeant kijkt je lang aan.";

/**
 * One decision on today's order. `line` is the line the player marked (-1: none).
 * A wrong send-back costs suspicion and leaves the order on the desk (`result` is null, `miss` says why).
 */
export function decide(orders: Order[], s: DeskState, verdict: Verdict, line: number): { state: DeskState; result: Result | null; miss: string | null } {
  const order = orders[s.day];
  if (verdict === "terug") {
    if (line < 0) return { state: s, result: null, miss: PICK_FIRST };
    if (line !== order.flaw) return { state: { ...s, suspicion: clamp(s.suspicion + B.wrongGuess) }, result: null, miss: order.wrong ?? NOT_WRONG };
    return {
      state: { ...s, gained: s.gained + order.gain, verdicts: [...s.verdicts, verdict] },
      result: { verdict, text: order.why ?? "", found: true },
      miss: null,
    };
  }
  if (verdict === "liggen") {
    return {
      state: { ...s, suspicion: clamp(s.suspicion + B.leave), gained: s.gained + B.leaveGain, verdicts: [...s.verdicts, verdict] },
      result: { verdict, text: LEAVE_TEXT, found: false },
      miss: null,
    };
  }
  return {
    state: { ...s, suspicion: clamp(s.suspicion - B.signRelief), verdicts: [...s.verdicts, verdict] },
    result: { verdict, text: order.signed, found: false },
    miss: null,
  };
}

export const nextDay = (s: DeskState): DeskState => ({ ...s, day: s.day + 1 });

/** Tools on the desk on a given day: every tool that has arrived so far. */
export const toolsOn = (orders: Order[], day: number): Tool[] =>
  orders.slice(0, day + 1).flatMap((o) => (o.tool ? [o.tool] : []));

/** The story outcome at the end of the week (stored as `side12.bode`). */
export function messenger(suspicion: number): "stil" | "lijstje" | "weg" {
  if (suspicion >= B.suspicionMax) return "weg";
  if (suspicion >= B.listedAt) return "lijstje";
  return "stil";
}

/** The days of a month as a Monday-first grid (null: blank before the 1st). */
export function monthGrid(year: number, month: number): (number | null)[] {
  const first = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return [...Array<null>(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
}

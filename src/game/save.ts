/**
 * Recovery code ("herstelcode"): the whole progress in a short code a player can write down.
 * iOS Safari may evict localStorage after ~7 days, so progress must be restorable.
 * Layout (LSB first): version(3) | completed chapters 1..6 (6) | choices (2 each) | outcomes (2 each)
 *   | version >= 2: side stories 11..14 (4) | version >= 3: outcomes added later (2 each)
 * Codes of older versions (written before the side stories, or before their outcomes) still decode.
 */
import { CHOICES, OUTCOMES, type Flags } from "./choices";

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford base32, no I L O U
const VERSION = 3;
const ALL_OUTCOMES = Object.keys(OUTCOMES) as (keyof typeof OUTCOMES)[];
/** The outcomes version 1 knew; the rest are stored after the side stories (version 3). */
const OUTCOME_IDS = ALL_OUTCOMES.slice(0, 4);
const LATER_OUTCOMES = ALL_OUTCOMES.slice(4);
/** Side stories, in bit order. Append only. */
const SIDE_IDS = [11, 12, 13, 14];
const BITS_V1 = 3 + 6 + CHOICES.length * 2 + OUTCOME_IDS.length * 2;
const BITS_V2 = BITS_V1 + SIDE_IDS.length;
const BITS_V3 = BITS_V2 + LATER_OUTCOMES.length * 2;
const CHARS_BY_VERSION: Record<number, number> = { 1: Math.ceil(BITS_V1 / 5), 2: Math.ceil(BITS_V2 / 5), 3: Math.ceil(BITS_V3 / 5) };
const CHARS = CHARS_BY_VERSION[VERSION];

export interface Progress {
  completed: number[];
  flags: Flags;
}

function checksum(digits: number[]): number {
  return digits.reduce((acc, d, i) => (acc + d * (i + 3)) % 32, 7);
}

export function encodeSave({ completed, flags }: Progress): string {
  let bits = 0n;
  let shift = 0n;
  const push = (value: number, width: number) => {
    bits |= BigInt(value) << shift;
    shift += BigInt(width);
  };
  push(VERSION, 3);
  let mask = 0;
  for (const ch of completed) if (ch >= 1 && ch <= 6) mask |= 1 << (ch - 1);
  push(mask, 6);
  for (const c of CHOICES) {
    const v = flags[c.id];
    push(v === c.A.value ? 1 : v === c.B.value ? 2 : 0, 2);
  }
  const outcome = (id: keyof typeof OUTCOMES) => push((OUTCOMES[id] as readonly string[]).indexOf(flags[id] ?? "") + 1, 2);
  OUTCOME_IDS.forEach(outcome);
  push(SIDE_IDS.reduce((m, id, i) => (completed.includes(id) ? m | (1 << i) : m), 0), SIDE_IDS.length);
  LATER_OUTCOMES.forEach(outcome);
  const digits: number[] = [];
  for (let i = 0; i < CHARS; i++) digits.push(Number((bits >> BigInt(i * 5)) & 31n));
  const body = digits.map((d) => ALPHABET[d]).join("");
  return `KG-${body}-${ALPHABET[checksum(digits)]}`;
}

export function decodeSave(code: string): Progress | null {
  const clean = code
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, "")
    .replace(/O/g, "0")
    .replace(/[IL]/g, "1");
  const raw = clean.startsWith("KG") ? clean.slice(2) : clean;
  const length = raw.length - 1;
  if (!Object.values(CHARS_BY_VERSION).includes(length)) return null;
  const digits = [...raw].map((ch) => ALPHABET.indexOf(ch));
  if (digits.some((d) => d < 0)) return null;
  const check = digits.pop()!;
  if (check !== checksum(digits)) return null;

  let bits = 0n;
  digits.forEach((d, i) => (bits |= BigInt(d) << BigInt(i * 5)));
  let shift = 0n;
  const pull = (width: number) => {
    const v = Number((bits >> shift) & ((1n << BigInt(width)) - 1n));
    shift += BigInt(width);
    return v;
  };
  const version = pull(3);
  if (CHARS_BY_VERSION[version] !== length) return null;
  const mask = pull(6);
  const completed = [1, 2, 3, 4, 5, 6].filter((ch) => mask & (1 << (ch - 1)));
  const flags: Flags = {};
  for (const c of CHOICES) {
    const v = pull(2);
    if (v === 3) return null;
    if (v === 1) flags[c.id] = c.A.value;
    if (v === 2) flags[c.id] = c.B.value;
  }
  const outcome = (id: keyof typeof OUTCOMES) => {
    const v = pull(2);
    const values = OUTCOMES[id] as readonly string[];
    if (v > values.length) return false;
    if (v > 0) flags[id] = values[v - 1];
    return true;
  };
  if (!OUTCOME_IDS.every(outcome)) return null;
  if (version >= 2) {
    const sides = pull(SIDE_IDS.length);
    SIDE_IDS.forEach((id, i) => sides & (1 << i) && completed.push(id));
  }
  if (version >= 3 && !LATER_OUTCOMES.every(outcome)) return null;
  return { completed, flags };
}

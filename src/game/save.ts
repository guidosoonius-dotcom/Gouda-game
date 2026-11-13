/**
 * Recovery code ("herstelcode"): the whole progress in a short code a player can write down.
 * iOS Safari may evict localStorage after ~7 days, so progress must be restorable.
 * Layout (LSB first): version(3) | completed chapters 1..6 (6) | choices (2 each) | outcomes (2 each)
 */
import { CHOICES, OUTCOMES, type Flags } from "./choices";

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford base32, no I L O U
const VERSION = 1;
const OUTCOME_IDS = Object.keys(OUTCOMES) as (keyof typeof OUTCOMES)[];
const BITS = 3 + 6 + CHOICES.length * 2 + OUTCOME_IDS.length * 2;
const CHARS = Math.ceil(BITS / 5);

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
  for (const id of OUTCOME_IDS) {
    const idx = (OUTCOMES[id] as readonly string[]).indexOf(flags[id] ?? "");
    push(idx + 1, 2);
  }
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
  if (raw.length !== CHARS + 1) return null;
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
  if (pull(3) !== VERSION) return null;
  const mask = pull(6);
  const completed = [1, 2, 3, 4, 5, 6].filter((ch) => mask & (1 << (ch - 1)));
  const flags: Flags = {};
  for (const c of CHOICES) {
    const v = pull(2);
    if (v === 3) return null;
    if (v === 1) flags[c.id] = c.A.value;
    if (v === 2) flags[c.id] = c.B.value;
  }
  for (const id of OUTCOME_IDS) {
    const v = pull(2);
    const values = OUTCOMES[id] as readonly string[];
    if (v > values.length) return null;
    if (v > 0) flags[id] = values[v - 1];
  }
  return { completed, flags };
}

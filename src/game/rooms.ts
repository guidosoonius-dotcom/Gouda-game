/**
 * Rooms of the orphanage (side story, 1939): a small placement puzzle. Tokens (boys, food) go on a
 * grid of cells; rules say who sits next to whom. Pure, tested by `tests/rooms.test.ts`, which also
 * proves that every level can be solved.
 */
export interface Token {
  id: string;
  name: string;
  note: string;
  tags?: string[];
}

export type Rule =
  | { kind: "next"; a: string; b: string; text: string }
  | { kind: "apart"; a: string; b: string; text: string }
  | { kind: "at"; a: string; cells: number[]; text: string }
  | { kind: "together"; a: string; b: string; text: string }
  | { kind: "rowsApart"; tags: [string, string]; text: string }
  | { kind: "eachNext"; tag: string; to: string; text: string };

export interface Level {
  id: string;
  month: string;
  title: string;
  intro: string;
  cols: number;
  rows: number;
  /** A label per cell ("raam", "deur"), or "". */
  cells: string[];
  /** A label per row (shelves), optional. */
  rowLabels?: string[];
  /** Which room a cell belongs to; neighbours only count within one room. */
  groups?: string[];
  tokens: Token[];
  rules: Rule[];
  /** Painted picture above the board (`public/img/weeshuis/`). */
  image?: { src: string; alt: string };
  /** Max's letter home after the level is solved (fiction). */
  letter: string;
}

/** Cell index → token id, or null when empty. */
export type Placement = (string | null)[];
/** 1: holds, -1: broken, 0: not decided yet. */
export interface RuleState {
  v: -1 | 0 | 1;
  who: string[];
}

export const emptyPlacement = (l: Level): Placement => Array(l.cols * l.rows).fill(null);

export function neighbours(l: Level, a: number, b: number) {
  if (a < 0 || b < 0) return false;
  const sameRow = Math.floor(a / l.cols) === Math.floor(b / l.cols);
  const sameRoom = !l.groups || l.groups[a] === l.groups[b];
  return sameRow && sameRoom && Math.abs(a - b) === 1;
}

const tagged = (l: Level, tag: string) => l.tokens.filter((t) => t.tags?.includes(tag)).map((t) => t.id);

export function check(l: Level, rule: Rule, p: Placement): RuleState {
  const at = (id: string) => p.indexOf(id);
  switch (rule.kind) {
    case "next":
    case "apart": {
      const a = at(rule.a);
      const b = at(rule.b);
      if (a < 0 || b < 0) return { v: 0, who: [] };
      const ok = neighbours(l, a, b) === (rule.kind === "next");
      return { v: ok ? 1 : -1, who: ok ? [] : [rule.a, rule.b] };
    }
    case "together": {
      const a = at(rule.a);
      const b = at(rule.b);
      if (a < 0 || b < 0) return { v: 0, who: [] };
      const ok = (l.groups?.[a] ?? "") === (l.groups?.[b] ?? "");
      return { v: ok ? 1 : -1, who: ok ? [] : [rule.a, rule.b] };
    }
    case "at": {
      const a = at(rule.a);
      if (a < 0) return { v: 0, who: [] };
      return rule.cells.includes(a) ? { v: 1, who: [] } : { v: -1, who: [rule.a] };
    }
    case "rowsApart": {
      const [x, y] = rule.tags.map((t) => tagged(l, t));
      const who: string[] = [];
      for (let r = 0; r < l.rows; r++) {
        const row = p.slice(r * l.cols, (r + 1) * l.cols);
        const xs = row.filter((id): id is string => !!id && x.includes(id));
        const ys = row.filter((id): id is string => !!id && y.includes(id));
        if (xs.length && ys.length) who.push(...xs, ...ys);
      }
      if (who.length) return { v: -1, who };
      return [...x, ...y].every((id) => at(id) >= 0) ? { v: 1, who: [] } : { v: 0, who: [] };
    }
    case "eachNext": {
      const helpers = tagged(l, rule.to);
      let open = false;
      const who: string[] = [];
      for (const id of tagged(l, rule.tag)) {
        const a = at(id);
        if (a < 0) {
          open = true;
          continue;
        }
        const around = p.map((_, c) => c).filter((c) => neighbours(l, a, c));
        if (around.some((c) => p[c] && helpers.includes(p[c]!))) continue;
        // still possible while a neighbouring bed is empty
        if (around.some((c) => !p[c])) open = true;
        else who.push(id);
      }
      if (who.length) return { v: -1, who };
      return { v: open ? 0 : 1, who: [] };
    }
  }
}

export function evaluate(l: Level, p: Placement) {
  const rules = l.rules.map((r) => check(l, r, p));
  const bad = new Set(rules.flatMap((r) => r.who));
  const full = l.tokens.every((t) => p.includes(t.id));
  return { rules, bad, solved: full && rules.every((r) => r.v === 1) };
}

/** Puts token `id` on cell `cell`; a token already there swaps to where `id` came from (or leaves). */
export function place(p: Placement, id: string, cell: number): Placement {
  const next = p.slice();
  const from = next.indexOf(id);
  const other = next[cell];
  if (from >= 0) next[from] = other && other !== id ? other : null;
  next[cell] = id;
  return next;
}

export function remove(p: Placement, id: string): Placement {
  return p.map((x) => (x === id ? null : x));
}

/** Brute force: a solution, or null. For tests; levels are small. */
export function solve(l: Level): Placement | null {
  const cells = l.cols * l.rows;
  const p: Placement = Array(cells).fill(null);
  const go = (k: number): boolean => {
    if (k === l.tokens.length) return evaluate(l, p).solved;
    for (let c = 0; c < cells; c++) {
      if (p[c]) continue;
      p[c] = l.tokens[k].id;
      if (!l.rules.some((r) => check(l, r, p).v === -1) && go(k + 1)) return true;
      p[c] = null;
    }
    return false;
  };
  return go(0) ? p.slice() : null;
}

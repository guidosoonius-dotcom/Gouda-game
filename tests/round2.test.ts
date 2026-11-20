import { afterEach, describe, expect, it } from "vitest";
import { TUNING } from "@/game/tuning";
import { applyAssist, assistOn } from "@/game/assist";

// The store only gets its persistence when a storage exists; give the test one before loading it.
const mem = new Map<string, string>();
const localStorage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) };
Object.assign(globalThis, { window: { localStorage }, localStorage });
const { DEFAULT_SETTINGS, useGameStore } = await import("@/store/useGameStore");

describe("hulpmodus", () => {
  afterEach(() => applyAssist(false));

  it("makes the minigames gentler and restores the designed values exactly", () => {
    const before = { exp: TUNING.canal.exposureLimit, time: TUNING.bike.time, jump: TUNING.rooftop.jumpWindow, rumble: TUNING.packing.rumbleInterval };
    applyAssist(true);
    expect(assistOn()).toBe(true);
    expect(TUNING.canal.exposureLimit).toBeGreaterThan(before.exp);
    expect(TUNING.bike.time).toBeGreaterThan(before.time);
    expect(TUNING.rooftop.jumpWindow).toBeGreaterThan(before.jump);
    expect(TUNING.packing.rumbleInterval).toBeGreaterThan(before.rumble);
    // the guard still reacts before the noise meter is full
    expect(TUNING.canal.noiseAlert).toBeLessThan(1);
    // a clean jump stays inside the jump window
    expect(TUNING.rooftop.jumpClean).toBeLessThanOrEqual(TUNING.rooftop.jumpWindow);
    applyAssist(false);
    expect({ exp: TUNING.canal.exposureLimit, time: TUNING.bike.time, jump: TUNING.rooftop.jumpWindow, rumble: TUNING.packing.rumbleInterval }).toEqual(before);
  });

  it("only touches numbers that exist, and makes things easier, never harder", () => {
    const live = TUNING as unknown as Record<string, Record<string, number>>;
    const easier = new Set(["exposureLimit", "noiseAlert", "sweepPeriod", "jumpWindow", "jumpClean", "time", "bombEvery", "bombWarn", "bellRange", "rumbleInterval", "tolerance"]);
    for (const [game, table] of Object.entries(TUNING.assist)) {
      for (const [key, f] of Object.entries(table)) {
        expect(typeof live[game][key], `${game}.${key}`).toBe("number");
        if (easier.has(key)) expect(f, `${game}.${key}`).toBeGreaterThan(1);
        else expect(f, `${game}.${key}`).toBeLessThan(1);
      }
    }
  });
});

describe("saved progress", () => {
  const persist = useGameStore.persist.getOptions();

  it("an old save (version 1) gets the default settings and keeps its progress", () => {
    const old = { mode: "home", completed: [1, 2], flags: { "ch1.pass": "glazen" }, muted: false, letter: "" };
    const migrated = persist.migrate!(old, 1) as { settings: unknown; completed: number[]; textScale: number };
    expect(migrated.settings).toEqual(DEFAULT_SETTINGS);
    expect(migrated.completed).toEqual([1, 2]);
    expect(migrated.textScale).toBe(1);
  });

  it("a reload brings the player back to the dossier, also from inside a minigame", () => {
    const saved = persist.partialize!({ ...useGameStore.getState(), view: "task", chapter: 4, page: 2 }) as { view: string; chapter: number; page: number };
    expect(saved).toMatchObject({ view: "dossier", chapter: 4, page: 2 });
  });
});

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { applyChoice, applyOutcome, type ChoiceId, type Flags, type OutcomeId, OUTCOMES } from "@/game/choices";
import { CHAPTERS } from "@/data/chapters";
import { chapterById, dossierPages } from "@/data/places";
import type { Progress } from "@/game/save";

export type View = "title" | "map" | "dossier" | "task" | "mirror" | "epilogue";
export type Mode = "location" | "home";
export interface Settings {
  assist: boolean;
  oneButton: boolean;
  still: boolean;
  ambience: boolean;
  hifi: boolean;
}
/** High picture quality starts on for phones and computers with room to spare (6+ cores, 4+ GB). */
function roomy() {
  if (typeof navigator === "undefined") return false;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return (navigator.hardwareConcurrency ?? 4) >= 6 && memory >= 4;
}
export const DEFAULT_SETTINGS: Settings = { assist: false, oneButton: false, still: false, ambience: true, hifi: roomy() };

/** Where a reload brings the player back: a minigame restarts from its dossier page. */
const RESUME: Record<View, View> = { title: "title", map: "map", dossier: "dossier", task: "dossier", mirror: "mirror", epilogue: "epilogue" };

interface GameState {
  view: View;
  mode: Mode;
  /** Chapter currently open in dossier/task/mirror. */
  chapter: number;
  page: number;
  completed: number[];
  flags: Flags;
  muted: boolean;
  /** Multiplier on all text sizes (`TUNING.ui.textScales`). */
  textScale: number;
  /** Settings (see SettingsSheet). `assist`: gentler minigames (`TUNING.assist`); `oneButton`: a
   *  single button instead of holding two at once; `still`: less motion, on top of the system
   *  setting; `ambience`: the background sound beds; `hifi`: photo detail and relief in the 3D
   *  scenes (`TUNING.gfx.hifi`). */
  settings: Settings;
  /** The player's "letter to later", written in the epilogue. Stays on this device. */
  letter: string;
  /** True when the mirror is re-read from the satchel (no progress change on close). */
  rereading: boolean;
  /** Sporen (things to look at on location) the player says they have seen. Stays on this device. */
  seen: string[];

  start: (mode: Mode) => void;
  setMode: (mode: Mode) => void;
  go: (view: View) => void;
  openChapter: (id: number) => void;
  openTask: (id: number) => void;
  nextPage: () => void;
  /** After a dilemma or task: the next dossier page, or the mirror when the dossier is finished. */
  advance: () => void;
  choose: (id: ChoiceId, option: "A" | "B") => void;
  /** Record a choice made in the middle of a task, without leaving the task. */
  decide: (id: ChoiceId, option: "A" | "B") => void;
  finishTask: <K extends OutcomeId>(id: K, value: (typeof OUTCOMES)[K][number]) => void;
  completeChapter: () => void;
  finishEpilogue: (letter: string) => void;
  rereadMirror: (id: number) => void;
  /** The phone's back button: one step back (a page, a screen), never out of the game by accident. */
  back: () => void;
  toggleMute: () => void;
  setTextScale: (scale: number) => void;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  markSeen: (id: string) => void;
  restore: (p: Progress) => void;
  reset: () => void;
}

/** First chapter that is not completed yet (or the last one). */
export function currentChapterId(completed: number[]): number {
  return CHAPTERS.find((c) => !completed.includes(c.id))?.id ?? CHAPTERS[CHAPTERS.length - 1].id;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      view: "title",
      mode: "home",
      chapter: 1,
      page: 0,
      completed: [],
      flags: {},
      muted: false,
      textScale: 1,
      settings: DEFAULT_SETTINGS,
      letter: "",
      rereading: false,
      seen: [],

      start: (mode) => set({ mode, view: "map" }),
      setMode: (mode) => set({ mode }),
      go: (view) => set({ view }),
      openChapter: (id) => set({ chapter: id, page: 0, view: "dossier", rereading: false }),
      openTask: (id) => set({ chapter: id, view: "task", rereading: false }),
      nextPage: () => set((s) => ({ page: s.page + 1 })),
      advance: () => {
        const { chapter, page, mode } = get();
        const pages = dossierPages(chapterById(chapter), mode);
        set(page + 1 < pages.length ? { page: page + 1, view: "dossier" } : { view: "mirror" });
      },
      choose: (id, option) => {
        set((s) => ({ flags: applyChoice(s.flags, id, option) }));
        get().advance();
      },
      decide: (id, option) => set((s) => ({ flags: applyChoice(s.flags, id, option) })),
      finishTask: (id, value) => set((s) => ({ flags: applyOutcome(s.flags, id, value) })),
      completeChapter: () => {
        const { chapter, completed, rereading } = get();
        if (rereading) return set({ view: "map", rereading: false });
        set({
          completed: completed.includes(chapter) ? completed : [...completed, chapter].sort((a, b) => a - b),
          view: "map",
        });
      },
      finishEpilogue: (letter) =>
        set((s) => ({ letter, completed: s.completed.includes(6) ? s.completed : [...s.completed, 6].sort((a, b) => a - b), view: "map" })),
      rereadMirror: (id) => set({ chapter: id, view: "mirror", rereading: true }),
      back: () => {
        const { view, page } = get();
        if (view === "map") return set({ view: "title" });
        if (view === "dossier") return set(page > 0 ? { page: page - 1 } : { view: "map" });
        // leaving the newspaper counts as reading it, as the button at its foot does
        if (view === "mirror") return get().completeChapter();
        if (view === "task" || view === "epilogue") return set({ view: "map" });
      },
      toggleMute: () => set((s) => ({ muted: !s.muted })),
      setTextScale: (textScale) => set({ textScale }),
      setSetting: (key, value) => set((s) => ({ settings: { ...s.settings, [key]: value } })),
      markSeen: (id) => set((s) => (s.seen.includes(id) ? s : { seen: [...s.seen, id] })),
      restore: (p) => set({ completed: p.completed, flags: p.flags, view: "map" }),
      reset: () => set({ completed: [], flags: {}, seen: [], letter: "", chapter: 1, page: 0, view: "title", rereading: false }),
    }),
    {
      name: "koerier-aan-de-gouwe",
      // 2: settings, and where the player was (iOS discards tabs in the background)
      version: 2,
      migrate: (old, version) => {
        const s = (old ?? {}) as Partial<GameState>;
        // version 1 had no settings and no saved position: start those fresh
        if (version < 2) return { ...s, settings: DEFAULT_SETTINGS, textScale: s.textScale ?? 1 } as GameState;
        return s as GameState;
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<GameState>;
        return { ...current, ...p, settings: { ...DEFAULT_SETTINGS, ...p.settings } };
      },
      partialize: (s) => ({
        mode: s.mode,
        completed: s.completed,
        flags: s.flags,
        muted: s.muted,
        textScale: s.textScale,
        settings: s.settings,
        letter: s.letter,
        seen: s.seen,
        view: RESUME[s.view],
        chapter: s.chapter,
        page: s.page,
        rereading: s.rereading,
      }),
    },
  ),
);

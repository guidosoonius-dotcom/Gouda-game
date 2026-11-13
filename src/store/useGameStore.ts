"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { applyChoice, applyOutcome, type ChoiceId, type Flags, type OutcomeId, OUTCOMES } from "@/game/choices";
import { CHAPTERS } from "@/data/chapters";
import type { Progress } from "@/game/save";

export type View = "title" | "map" | "dossier" | "task" | "mirror";
export type Mode = "location" | "home";

interface GameState {
  view: View;
  mode: Mode;
  /** Chapter currently open in dossier/task/mirror. */
  chapter: number;
  page: number;
  completed: number[];
  flags: Flags;
  muted: boolean;
  /** True when the mirror is re-read from the satchel (no progress change on close). */
  rereading: boolean;

  start: (mode: Mode) => void;
  setMode: (mode: Mode) => void;
  go: (view: View) => void;
  openChapter: (id: number) => void;
  openTask: (id: number) => void;
  nextPage: () => void;
  choose: (id: ChoiceId, option: "A" | "B") => void;
  finishTask: <K extends OutcomeId>(id: K, value: (typeof OUTCOMES)[K][number]) => void;
  completeChapter: () => void;
  rereadMirror: (id: number) => void;
  toggleMute: () => void;
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
      rereading: false,

      start: (mode) => set({ mode, view: "map" }),
      setMode: (mode) => set({ mode }),
      go: (view) => set({ view }),
      openChapter: (id) => set({ chapter: id, page: 0, view: "dossier", rereading: false }),
      openTask: (id) => set({ chapter: id, view: "task", rereading: false }),
      nextPage: () => set((s) => ({ page: s.page + 1 })),
      choose: (id, option) => set((s) => ({ flags: applyChoice(s.flags, id, option), view: "mirror" })),
      finishTask: (id, value) => set((s) => ({ flags: applyOutcome(s.flags, id, value) })),
      completeChapter: () => {
        const { chapter, completed, rereading } = get();
        if (rereading) return set({ view: "map", rereading: false });
        set({
          completed: completed.includes(chapter) ? completed : [...completed, chapter].sort(),
          view: "map",
        });
      },
      rereadMirror: (id) => set({ chapter: id, view: "mirror", rereading: true }),
      toggleMute: () => set((s) => ({ muted: !s.muted })),
      restore: (p) => set({ completed: p.completed, flags: p.flags, view: "map" }),
      reset: () => set({ completed: [], flags: {}, chapter: 1, page: 0, view: "title", rereading: false }),
    }),
    {
      name: "koerier-aan-de-gouwe",
      version: 1,
      partialize: (s) => ({ mode: s.mode, completed: s.completed, flags: s.flags, muted: s.muted }),
    },
  ),
);

"use client";

import { useReducedMotion } from "motion/react";
import { useGameStore } from "@/store/useGameStore";

/** Less motion: the player's own setting, or the system's "reduce motion". */
export function prefersStill() {
  if (useGameStore.getState().settings.still) return true;
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useStill() {
  const own = useGameStore((s) => s.settings.still);
  const system = useReducedMotion();
  return own || !!system;
}

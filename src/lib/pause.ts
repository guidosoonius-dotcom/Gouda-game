"use client";

import { useSyncExternalStore } from "react";
import { isWalkBlocked } from "./walk";

/**
 * One pause for the whole game. A minigame is paused by its pause button, by the phone's back
 * button, or by the page going to the background (a call, another app). While paused the game
 * clock stands still and the sound is suspended.
 */
let paused = false;
const listeners = new Set<() => void>();

export const isPaused = () => paused;

export function setPaused(value: boolean) {
  if (paused === value) return;
  paused = value;
  listeners.forEach((f) => f());
}

export function usePaused() {
  return useSyncExternalStore(
    (f) => (listeners.add(f), () => void listeners.delete(f)),
    () => paused,
    () => false,
  );
}

/** The game clock stands still: paused, the page hidden, or (location mode) the player walking. */
export const isFrozen = () => paused || isWalkBlocked() || (typeof document !== "undefined" && document.hidden);

/**
 * What the phone's back button does in the current screen, if not the default. A minigame
 * registers "pause, or resume when paused"; it returns true when it handled the press.
 */
let backOverride: (() => boolean) | null = null;
export const setBackOverride = (f: (() => boolean) | null) => void (backOverride = f);
export const handleBackOverride = () => backOverride?.() ?? false;

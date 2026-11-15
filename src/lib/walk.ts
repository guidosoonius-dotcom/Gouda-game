"use client";

import { useEffect, useSyncExternalStore } from "react";
import { TUNING } from "@/game/tuning";
import { haversine } from "./geo";

const L = TUNING.location;

export interface Fix {
  lat: number;
  lng: number;
  /** Milliseconds, as `performance.now()` or `Date.now()` (only differences are used). */
  t: number;
  /** Metres. */
  accuracy: number;
  /** m/s as reported by the device, when it knows. */
  speed?: number | null;
}

export interface WalkState {
  /** Recent usable fixes, oldest first (at most `window` seconds plus one fix). */
  history: Fix[];
  last: Fix | null;
  /** Speed over the window (m/s). */
  speed: number;
  blocked: boolean;
  /** Since when the speed has been low, while blocked (ms). */
  calmSince: number | null;
  /** How many fixes in a row were above the walking speed. */
  fast: number;
}

/** Fixes in a row above the walking speed before the block comes: one jittery fix must not do it. */
const FAST_FIXES = 3;

export const walkStart = (): WalkState => ({ history: [], last: null, speed: 0, blocked: false, calmSince: null, fast: 0 });

/**
 * Feeds one position fix into the walking detector. Speed is the distance covered over the last
 * `window` seconds (or the speed the device reports): one fix per second with a few metres of
 * jitter would look like walking, six seconds of it do not. Blocks above `walkSpeed`, lifts the
 * block after `calmFor` seconds below `calmSpeed`.
 */
export function updateWalk(s: WalkState, fix: Fix): WalkState {
  if (fix.accuracy > L.maxAccuracy) return s;
  const history = [...s.history.filter((f) => fix.t - f.t <= L.window * 1000), fix];
  const oldest = history[0];
  const span = (fix.t - oldest.t) / 1000;
  let speed = s.speed;
  if (fix.speed != null && fix.speed >= 0) speed = fix.speed;
  else if (span >= L.window * 0.75) speed = haversine(oldest, fix) / span;
  else if (span === 0 && history.length === 1) speed = 0;
  let { blocked, calmSince } = s;
  const fast = speed > L.walkSpeed ? s.fast + 1 : 0;
  if (fast >= FAST_FIXES) {
    blocked = true;
    calmSince = null;
  } else if (fast > 0) {
    calmSince = null;
  } else if (blocked && speed < L.calmSpeed) {
    calmSince ??= fix.t;
    if (fix.t - calmSince >= L.calmFor * 1000) {
      blocked = false;
      calmSince = null;
    }
  } else if (blocked) {
    calmSince = null;
  }
  return { history, last: fix, speed, blocked, calmSince, fast };
}

/** Called on a timer: no fix for a while while blocked means the player stopped (see `staleAfter`). */
export function tickWalk(s: WalkState, now: number): WalkState {
  if (!s.blocked || !s.last || now - s.last.t < L.staleAfter * 1000) return s;
  return { ...s, history: [], blocked: false, calmSince: null, speed: 0, fast: 0 };
}

// ---------- the shared guard ----------

interface Guard {
  /** The player has allowed location on this device (the map asked); the guard never asks by itself. */
  consent: boolean;
  blocked: boolean;
  speed: number;
  /** Until when (performance.now) the player says they are not walking. */
  overrideUntil: number;
}

let guard: Guard = { consent: false, blocked: false, speed: 0, overrideUntil: 0 };
const listeners = new Set<() => void>();
const set = (g: Partial<Guard>) => {
  guard = { ...guard, ...g };
  listeners.forEach((l) => l());
};

/** True while a minigame must stand still: walking, and no override. Read it every frame. */
export const isWalkBlocked = () => guard.blocked && performance.now() >= guard.overrideUntil;
export const allowWalkGuard = () => !guard.consent && set({ consent: true });
export const overrideWalkGuard = () => set({ overrideUntil: performance.now() + L.overrideFor * 1000, blocked: false });

const subscribe = (l: () => void) => (listeners.add(l), () => void listeners.delete(l));
/** For components: re-renders when the block changes. */
export const useWalkBlocked = () =>
  useSyncExternalStore(subscribe, () => guard.blocked && performance.now() >= guard.overrideUntil, () => false);
export const useWalkConsent = () => useSyncExternalStore(subscribe, () => guard.consent, () => false);

/** Watches the position and keeps the guard up to date. Mount while a chapter is open in location mode. */
export function useWalkWatcher(active: boolean) {
  const consent = useWalkConsent();
  useEffect(() => {
    if (!active || !("geolocation" in navigator)) return;
    let cancelled = false;
    let id: number | null = null;
    let timer: number | null = null;
    let state = walkStart();
    const start = () => {
      if (cancelled) return;
      id = navigator.geolocation.watchPosition(
        (pos) => {
          state = updateWalk(state, { lat: pos.coords.latitude, lng: pos.coords.longitude, t: performance.now(), accuracy: pos.coords.accuracy, speed: pos.coords.speed });
          set({ blocked: state.blocked, speed: state.speed });
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 },
      );
      timer = window.setInterval(() => {
        const next = tickWalk(state, performance.now());
        if (next !== state) {
          state = next;
          set({ blocked: false, speed: 0 });
        }
      }, 1000);
    };
    // Only once the player has said yes to location (on the map, or earlier on this device).
    if (consent) start();
    else if ("permissions" in navigator) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((p) => p.state === "granted" && start())
        .catch(() => {});
    }
    return () => {
      cancelled = true;
      if (id !== null) navigator.geolocation.clearWatch(id);
      if (timer !== null) window.clearInterval(timer);
      set({ blocked: false, speed: 0 });
    };
  }, [active, consent]);
}

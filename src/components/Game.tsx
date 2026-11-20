"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useGameStore, type View } from "@/store/useGameStore";
import { setAmbience, setMuted, setSuspended, unlockAudio } from "@/lib/sound";
import { handleBackOverride, isPaused } from "@/lib/pause";
import { applyAssist } from "@/game/assist";
import { chapterById } from "@/data/places";
import { TitleScreen } from "./screens/TitleScreen";
import { MapScreen } from "./screens/MapScreen";
import { DossierScreen } from "./screens/DossierScreen";
import { EpilogueScreen } from "./screens/EpilogueScreen";
import { MirrorScreen } from "./screens/MirrorScreen";
import { MemorialScreen, WitnessScreen } from "./screens/WitnessScreen";
import { PackingGame } from "./packing/PackingGame";
import { PuzzleScreen } from "./puzzles/PuzzleScreen";
import { WalkGuard } from "./ui/WalkGuard";
import { useServiceWorker } from "./ui/PwaSetup";
import { useWalkWatcher } from "@/lib/walk";

// The WebGL minigame is only loaded (and its canvas only mounted) when it is played.
const CanalGame = dynamic(() => import("./canal/CanalGame").then((m) => m.CanalGame), {
  ssr: false,
  loading: () => <Loading />,
});

const RoofGame = dynamic(() => import("./rooftop/RoofGame").then((m) => m.RoofGame), {
  ssr: false,
  loading: () => <Loading />,
});

const BikeGame = dynamic(() => import("./bike/BikeGame").then((m) => m.BikeGame), {
  ssr: false,
  loading: () => <Loading />,
});

/** While the dossier of a 3D chapter is open, fetch its minigame and the detail maps ahead. */
const AHEAD: Record<string, () => Promise<unknown>> = {
  canal: () => import("./canal/CanalGame"),
  rooftop: () => import("./rooftop/RoofGame"),
  bicycle: () => import("./bike/BikeGame"),
};
function usePreloadTask(view: string) {
  const chapter = useGameStore((s) => s.chapter);
  useEffect(() => {
    const ahead = view === "dossier" ? AHEAD[chapterById(chapter).task] : undefined;
    if (!ahead) return;
    const id = window.setTimeout(() => {
      ahead().catch(() => undefined);
      import("./canal/DetailMaps").then((m) => m.preloadDetailMaps()).catch(() => undefined);
    }, 1200);
    return () => window.clearTimeout(id);
  }, [view, chapter]);
}

function Loading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-night">
      <span className="label text-[length:calc(11px*var(--ts,1))] text-bone">Even geduld</span>
    </div>
  );
}

function Task() {
  const chapter = useGameStore((s) => s.chapter);
  const kind = chapterById(chapter).task;
  if (kind === "packing") return <PackingGame />;
  if (kind === "canal") return <CanalGame />;
  if (kind === "rooftop") return <RoofGame />;
  if (kind === "bicycle") return <BikeGame />;
  if (kind === "witness") return <WitnessScreen />;
  if (kind === "puzzle") return <PuzzleScreen />;
  return <Loading />;
}

/** A chapter ends with its newspaper, or, at a place of remembrance, with a memorial page. */
function Mirror() {
  const chapter = useGameStore((s) => s.chapter);
  return chapterById(chapter).memorial ? <MemorialScreen /> : <MirrorScreen />;
}

const SCREENS: Record<View, () => React.ReactNode> = {
  title: () => <TitleScreen />,
  map: () => <MapScreen />,
  dossier: () => <DossierScreen />,
  task: () => <Task />,
  mirror: () => <Mirror />,
  epilogue: () => <EpilogueScreen />,
};

/**
 * The phone's back button (and the swipe back on iOS) steps back inside the game instead of
 * leaving it: one sentinel entry in the browser history catches the press. On the title screen
 * the press is left alone, so the player can still leave.
 */
function useBackButton(view: View) {
  const armed = useRef(false);
  useEffect(() => {
    if (view === "title" || armed.current) return;
    window.history.pushState({ koerier: true }, "");
    armed.current = true;
  }, [view]);
  useEffect(() => {
    const onPop = () => {
      armed.current = false;
      if (!handleBackOverride()) useGameStore.getState().back();
      if (useGameStore.getState().view !== "title") {
        window.history.pushState({ koerier: true }, "");
        armed.current = true;
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
}

export function Game() {
  const view = useGameStore((s) => s.view);
  const muted = useGameStore((s) => s.muted);
  const location = useGameStore((s) => s.mode === "location");
  const textScale = useGameStore((s) => s.textScale);
  const settings = useGameStore((s) => s.settings);
  useBackButton(view);
  usePreloadTask(view);
  const [mounted, setMounted] = useState(false);
  // Location mode: no games while walking. The watcher runs only in a chapter, never on the map.
  useWalkWatcher(location && (view === "dossier" || view === "task"));
  useServiceWorker();

  useEffect(() => {
    setMounted(true);
    // Dev aid: /?canal=1 and /?roof=1 open a minigame directly (ignored in production builds).
    if (process.env.NODE_ENV !== "production") {
      const q = new URLSearchParams(window.location.search);
      if (q.has("canal")) useGameStore.getState().openTask(4);
      if (q.has("roof")) useGameStore.getState().openTask(2);
      if (q.has("bike")) useGameStore.getState().openTask(5);
    }
  }, []);
  useEffect(() => setMuted(muted), [muted]);
  // every font size is written as calc(px * var(--ts)), so this one variable scales all text
  useEffect(() => document.documentElement.style.setProperty("--ts", String(textScale)), [textScale]);
  useEffect(() => applyAssist(settings.assist), [settings.assist]);
  useEffect(() => setAmbience(settings.ambience), [settings.ambience]);
  useEffect(() => void document.documentElement.classList.toggle("still", settings.still), [settings.still]);
  // a resumed game (straight into a dossier) has had no tap on the title screen to start the sound
  useEffect(() => {
    const first = () => unlockAudio();
    window.addEventListener("pointerdown", first, { once: true });
    return () => window.removeEventListener("pointerdown", first);
  }, []);
  // no sound from a page in the background
  useEffect(() => {
    const onVisibility = () => setSuspended(document.hidden || isPaused());
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <MotionConfig reducedMotion={settings.still ? "always" : "user"}>
      <main className="fixed inset-0 flex justify-center bg-[#050608]">
        <div className="relative h-dvh w-full max-w-[430px] overflow-hidden bg-night shadow-[0_0_80px_rgba(0,0,0,0.8)]">
          {mounted && (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={view}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                {SCREENS[view]()}
              </motion.div>
            </AnimatePresence>
          )}
          {location && (view === "dossier" || view === "task") && <WalkGuard />}
        </div>
      </main>
    </MotionConfig>
  );
}

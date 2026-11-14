"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useGameStore, type View } from "@/store/useGameStore";
import { setMuted } from "@/lib/sound";
import { chapterById } from "@/data/chapters";
import { TitleScreen } from "./screens/TitleScreen";
import { MapScreen } from "./screens/MapScreen";
import { DossierScreen } from "./screens/DossierScreen";
import { MirrorScreen } from "./screens/MirrorScreen";
import { PackingGame } from "./packing/PackingGame";

// The WebGL minigame is only loaded (and its canvas only mounted) when it is played.
const CanalGame = dynamic(() => import("./canal/CanalGame").then((m) => m.CanalGame), {
  ssr: false,
  loading: () => <Loading />,
});

const RoofGame = dynamic(() => import("./rooftop/RoofGame").then((m) => m.RoofGame), {
  ssr: false,
  loading: () => <Loading />,
});

function Loading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-night">
      <span className="label text-[11px] text-bone">Even geduld</span>
    </div>
  );
}

function Task() {
  const chapter = useGameStore((s) => s.chapter);
  const kind = chapterById(chapter).task;
  if (kind === "packing") return <PackingGame />;
  if (kind === "canal") return <CanalGame />;
  if (kind === "rooftop") return <RoofGame />;
  return <Loading />;
}

const SCREENS: Record<View, () => React.ReactNode> = {
  title: () => <TitleScreen />,
  map: () => <MapScreen />,
  dossier: () => <DossierScreen />,
  task: () => <Task />,
  mirror: () => <MirrorScreen />,
};

export function Game() {
  const view = useGameStore((s) => s.view);
  const muted = useGameStore((s) => s.muted);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Dev aid: /?canal=1 and /?roof=1 open a minigame directly (ignored in production builds).
    if (process.env.NODE_ENV !== "production") {
      const q = new URLSearchParams(window.location.search);
      if (q.has("canal")) useGameStore.getState().openTask(4);
      if (q.has("roof")) useGameStore.getState().openTask(2);
    }
  }, []);
  useEffect(() => setMuted(muted), [muted]);

  return (
    <MotionConfig reducedMotion="user">
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
        </div>
      </main>
    </MotionConfig>
  );
}

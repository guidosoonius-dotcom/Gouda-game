"use client";

import { useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useGameStore } from "@/store/useGameStore";
import { setBackOverride, setPaused, usePaused } from "@/lib/pause";
import { setSuspended, sfx, unlockAudio } from "@/lib/sound";
import { Arrow, Pause, Speaker } from "@/components/ui/icons";
import { TextSize } from "@/components/ui/TextSize";

/**
 * Pause for the 3D minigames: a button at the top, the Escape key, the phone's back button, and
 * automatically when the page goes to the background. Paused, the clock stands still, the sound is
 * suspended and the scene stops drawing. From here the player can resume, start over or leave.
 */
const CENTRE = "left-1/2 top-[max(30px,env(safe-area-inset-top))] -translate-x-1/2";

export function PauseLayer({
  active,
  title,
  onRestart,
  at = CENTRE,
}: {
  active: boolean;
  title: string;
  onRestart: () => void;
  /** Where the pause button sits, so it never covers the HUD of this game. */
  at?: string;
}) {
  const paused = usePaused();
  const go = useGameStore((s) => s.go);
  const muted = useGameStore((s) => s.muted);
  const toggleMute = useGameStore((s) => s.toggleMute);

  const pause = useCallback(() => {
    setPaused(true);
    setSuspended(true);
  }, []);
  const resume = useCallback(() => {
    unlockAudio();
    setSuspended(false);
    setPaused(false);
  }, []);

  // never leave the game paused behind us
  useEffect(() => () => (setPaused(false), setSuspended(false)), []);

  useEffect(() => {
    if (!active) return;
    const onHide = () => document.hidden && pause();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && (paused ? resume() : pause());
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("keydown", onKey);
    setBackOverride(() => (paused ? resume() : pause(), true));
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("keydown", onKey);
      setBackOverride(null);
    };
  }, [active, paused, pause, resume]);

  return (
    <>
      {active && !paused && (
        <button
          type="button"
          aria-label="Pauze"
          onClick={() => (sfx.paper(), pause())}
          className={`absolute ${at} z-20 flex h-11 w-11 items-center justify-center border border-parchment/35 bg-night/55`}
        >
          <Pause color="#ede6d6" />
        </button>
      )}
      <AnimatePresence>
        {active && paused && (
          <motion.div
            key="pause"
            role="dialog"
            aria-modal="true"
            aria-label="Gepauzeerd"
            className="absolute inset-0 z-30 flex flex-col justify-center gap-5 bg-night/85 px-7 text-parchment"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col gap-1">
              <span className="label text-[length:calc(11px*var(--ts,1))] text-ochre">Gepauzeerd</span>
              <h2 className="m-0 font-fell text-[length:calc(30px*var(--ts,1))] font-normal leading-tight">{title}</h2>
              <p className="m-0 font-news text-[length:calc(15px*var(--ts,1))] italic text-bone">De klok staat stil tot je verdergaat.</p>
            </div>
            <button
              type="button"
              autoFocus
              onClick={resume}
              className="flex h-[54px] items-center justify-between bg-ochre px-[18px] font-label text-[length:calc(14px*var(--ts,1))] font-bold tracking-[0.17em] text-slate"
            >
              VERDER <Arrow color="#14181d" />
            </button>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => (resume(), onRestart())}
                className="label h-12 border border-parchment/40 text-[length:calc(12px*var(--ts,1))]"
              >
                Opnieuw
              </button>
              <button type="button" onClick={() => (resume(), go("map"))} className="label h-12 border border-parchment/40 text-[length:calc(12px*var(--ts,1))]">
                Naar de kaart
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-4">
              <button type="button" onClick={toggleMute} className="label flex h-11 items-center gap-2.5 text-[length:calc(11px*var(--ts,1))]">
                <Speaker off={muted} color="#ede6d6" />
                Geluid {muted ? "uit" : "aan"}
              </button>
              <TextSize />
            </div>
            <p className="m-0 font-news text-[length:calc(13px*var(--ts,1))] text-ash">
              Naar de kaart: je speelt dit hoofdstuk later opnieuw vanaf het begin van de opdracht.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

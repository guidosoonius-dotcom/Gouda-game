"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { chapterById } from "@/data/chapters";
import { useGameStore } from "@/store/useGameStore";
import { sfx } from "@/lib/sound";
import { Arrow } from "@/components/ui/icons";
import { ArchivePlaceholder } from "@/components/ui/ArchivePlaceholder";
import { FactBlock, FactLegend } from "@/components/ui/Fact";

const quiet = "flex h-[54px] items-center justify-between border border-parchment/45 px-[18px] font-label text-[14px] font-bold tracking-[0.17em] text-parchment transition-transform active:translate-x-1";

/**
 * Chapter 3: a testimony. No score, no timer, no failure, no choice (CLAUDE.md #8).
 * A few quiet moments to read; nothing here can be done wrong.
 */
export function WitnessScreen() {
  const { chapter: chapterId, advance } = useGameStore();
  const moments = chapterById(chapterId).witness!.moments;
  const [index, setIndex] = useState(0);
  const moment = moments[index];
  const last = index === moments.length - 1;

  return (
    <div className="absolute inset-0 flex flex-col bg-dusk px-[26px] pb-[calc(26px+env(safe-area-inset-bottom))] pt-[max(54px,env(safe-area-inset-top))] text-parchment">
      <div className="flex items-center gap-3">
        <span className="label text-[10.5px] text-bone">Verzonnen scène · de plek is echt</span>
        <span className="h-px flex-1 bg-rule" />
        <span className="label text-[10.5px] text-bone">
          {index + 1} / {moments.length}
        </span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="flex flex-1 flex-col justify-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1 }}
        >
          {moment.lines.map((line) => (
            <p key={line} className="m-0 font-news text-[21px] leading-[1.5]">
              {line}
            </p>
          ))}
          {moment.quote && <p className="m-0 border-l-2 border-bone/60 pl-4 font-fell text-[22px] italic leading-[1.4] text-bone">{moment.quote}</p>}
        </motion.div>
      </AnimatePresence>
      <button type="button" className={quiet} onClick={() => (sfx.paper(), last ? advance() : setIndex(index + 1))}>
        {last ? "NAAR BUITEN" : "VERDER"}
        <Arrow color="#ede6d6" />
      </button>
    </div>
  );
}

const HOLD_SECONDS = 5;

/** The memorial page that closes chapter 3: what happened here, the names, a moment of silence. */
export function MemorialScreen() {
  const { chapter: chapterId, rereading, completeChapter } = useGameStore();
  const memorial = chapterById(chapterId).memorial!;
  const [held, setHeld] = useState(0);
  const timer = useRef<number | null>(null);
  const stones = memorial.names.length > 0 ? memorial.names : Array.from({ length: 6 }, () => "");

  const stop = () => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
  };
  const hold = () => {
    stop();
    timer.current = window.setInterval(() => setHeld((h) => Math.min(1, h + 0.1 / HOLD_SECONDS)), 100);
  };
  useEffect(() => stop, []);
  useEffect(() => {
    if (held >= 1) stop();
  }, [held]);

  return (
    <div className="absolute inset-0 flex flex-col gap-4 overflow-y-auto bg-slate px-6 pb-[calc(26px+env(safe-area-inset-bottom))] pt-[max(56px,env(safe-area-inset-top))] text-parchment">
      <span className="label text-[10.5px] tracking-[0.27em] text-ash">Ter herinnering</span>
      <h1 className="m-0 font-fell text-[36px] font-normal leading-[1.05]">{memorial.title}</h1>
      <p className="m-0 font-news text-[17px] italic leading-[1.45] text-[#cfc7b4]">{memorial.lead}</p>
      <ArchivePlaceholder slot={memorial.photo} className="h-[130px] flex-none border border-rule" />
      <p className="m-0 font-news text-[15.5px] leading-[1.6] text-[#ddd5c2]">
        <FactBlock ids={memorial.facts} dark />
      </p>
      <div className="grid grid-cols-3 gap-2">
        {stones.map((name, i) => (
          <div
            key={i}
            className="flex aspect-square items-center justify-center p-1.5 text-center font-label text-[9px] font-bold leading-[1.35] text-[#2a2213]"
            style={{ background: "linear-gradient(145deg, #c9a65a, #8f6f2b)" }}
          >
            {name || <span className="opacity-60">HIER WOONDE</span>}
          </div>
        ))}
      </div>
      <span className="-mt-1 font-news text-[13px] italic leading-snug text-ash">{memorial.namesNote}</span>
      <FactLegend ids={memorial.facts} dark />

      <div className="mt-auto flex flex-col gap-2.5 pt-2">
        <button
          type="button"
          onPointerDown={hold}
          onPointerUp={stop}
          onPointerLeave={stop}
          onPointerCancel={stop}
          onContextMenu={(e) => e.preventDefault()}
          className="relative flex h-14 touch-none items-center justify-center overflow-hidden border border-ochre/70 font-label text-[13px] font-bold tracking-[0.17em]"
        >
          <span className="absolute inset-y-0 left-0 bg-ochre/25 transition-[width] duration-100 ease-linear" style={{ width: `${held * 100}%` }} />
          <span className="relative">{held >= 1 ? "DANK JE" : "HOUD VAST VOOR EEN MOMENT STILTE"}</span>
        </button>
        <button type="button" className={quiet} onClick={() => (sfx.paper(), completeChapter())}>
          {rereading ? "TERUG NAAR DE KAART" : "VERDER"}
          <Arrow color="#ede6d6" />
        </button>
      </div>
    </div>
  );
}

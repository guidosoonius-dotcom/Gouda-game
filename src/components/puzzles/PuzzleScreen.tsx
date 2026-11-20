"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { chapterById } from "@/data/places";
import { useGameStore } from "@/store/useGameStore";
import { sfx } from "@/lib/sound";
import { Arrow, Back } from "@/components/ui/icons";
import { Grain } from "@/components/ui/Grain";
import { WordsPuzzle } from "./WordsPuzzle";
import { AcrosticPuzzle } from "./AcrosticPuzzle";
import { StarsPuzzle } from "./StarsPuzzle";
import { CouponsPuzzle } from "./CouponsPuzzle";
import { BureauPuzzle } from "./BureauPuzzle";
import { RoomsPuzzle } from "./RoomsPuzzle";
import { ToonbankPuzzle } from "./ToonbankPuzzle";

/**
 * The small paper puzzle of a side story. No clock, no score, no way to fail: a wrong try gets a
 * kind word and, after a while, a hint. When it is solved the side story's page follows.
 */
export function PuzzleScreen() {
  const { chapter: chapterId, go, advance } = useGameStore();
  const chapter = chapterById(chapterId);
  // A warm-up puzzle first (if any), then the main one.
  const [stage, setStage] = useState<"warmup" | "main">(chapter.warmup ? "warmup" : "main");
  const puzzle = stage === "warmup" ? chapter.warmup! : chapter.puzzle!;
  const [solved, setSolved] = useState(false);
  const solve = () => {
    sfx.chime();
    setSolved(true);
  };
  const task = chapter.pages.find((p) => p.kind === "task");

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-dusk text-parchment">
      <Grain id="puzzle-grain" />
      <header className="relative flex flex-none items-center gap-3.5 px-4 pb-3 pt-[max(46px,env(safe-area-inset-top))]">
        <button
          type="button"
          aria-label="Terug naar de kaart"
          onClick={() => go("map")}
          className="flex h-11 w-11 flex-none items-center justify-center border border-parchment/35 bg-dusk/45"
        >
          <Back color="#ede6d6" />
        </button>
        <div className="flex flex-col gap-0.5">
          <span className="label text-[length:calc(11px*var(--ts,1))] text-ochre">Zijspoor · {chapter.place}</span>
          <h1 className="m-0 font-fell text-[length:calc(24px*var(--ts,1))] font-normal leading-tight">{"title" in puzzle ? puzzle.title : task?.kind === "task" ? task.title : chapter.title}</h1>
        </div>
      </header>
      <div key={stage} className="relative flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-[calc(24px+env(safe-area-inset-bottom))]">
        <p className="m-0 font-news text-[length:calc(15.5px*var(--ts,1))] italic leading-snug text-bone">{puzzle.intro}</p>
        {puzzle.kind === "words" && <WordsPuzzle pairs={puzzle.pairs} onSolved={solve} />}
        {puzzle.kind === "acrostic" && <AcrosticPuzzle puzzle={puzzle} onSolved={solve} />}
        {puzzle.kind === "stars" && <StarsPuzzle onSolved={solve} />}
        {puzzle.kind === "coupons" && <CouponsPuzzle puzzle={puzzle} onSolved={solve} />}
        {puzzle.kind === "bureau" && <BureauPuzzle onSolved={solve} />}
        {puzzle.kind === "rooms" && <RoomsPuzzle onSolved={solve} />}
        {puzzle.kind === "toonbank" && <ToonbankPuzzle onSolved={solve} />}
        {solved && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-auto flex flex-col gap-3 pt-2">
            <p className="m-0 border-l-2 border-ochre pl-3 font-news text-[length:calc(16px*var(--ts,1))] leading-snug">{puzzle.done}</p>
            <button
              type="button"
              onClick={() => {
                sfx.paper();
                if (stage === "warmup") {
                  setStage("main");
                  setSolved(false);
                } else advance();
              }}
              className="flex h-[54px] items-center justify-between bg-ochre px-[18px] font-label text-[length:calc(14px*var(--ts,1))] font-bold tracking-[0.17em] text-slate"
            >
              VERDER
              <Arrow color="#14181d" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { choiceById, type ChoiceId } from "@/game/choices";
import { useGameStore } from "@/store/useGameStore";
import { sfx } from "@/lib/sound";

/** Two paper strips with a stamped A and B. There is no right answer. */
export function Dilemma({ id, ready }: { id: ChoiceId; ready: boolean }) {
  const def = choiceById(id)!;
  const choose = useGameStore((s) => s.choose);
  const [picked, setPicked] = useState<"A" | "B" | null>(null);

  const pick = (key: "A" | "B") => {
    if (picked) return;
    setPicked(key);
    sfx.stamp();
    window.setTimeout(() => choose(id, key), 1150);
  };

  return (
    <motion.div
      className="flex flex-col gap-3.5"
      initial={false}
      animate={{ opacity: ready ? 1 : 0.25 }}
      transition={{ duration: 0.6 }}
      style={{ pointerEvents: ready ? "auto" : "none" }}
    >
      <h1 className="m-0 font-fell text-[28px] font-normal leading-[1.12]">
        {def.question}
        <br />
        <span className="italic text-ochre">{def.questionAccent}</span>
      </h1>
      {(["A", "B"] as const).map((key) => {
        const opt = def[key];
        const chosen = picked === key;
        const other = picked !== null && !chosen;
        return (
          <motion.button
            key={key}
            type="button"
            onClick={() => pick(key)}
            animate={{ opacity: other ? 0.3 : 1, x: chosen ? 6 : 0 }}
            whileTap={{ x: 4 }}
            className="relative flex min-h-[76px] items-stretch bg-parchment p-0 text-left text-ink"
          >
            <span className="flex w-[58px] flex-none items-center justify-center border-r-2 border-dotted border-ink/35">
              <span
                className={`flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 font-stamp text-[17px] ${
                  key === "A" ? "-rotate-[8deg] border-wax text-wax" : "rotate-[6deg] border-ink text-ink"
                }`}
              >
                {key}
              </span>
            </span>
            <span className="flex flex-col justify-center gap-[3px] px-3.5 py-2.5">
              <span className="font-news text-[17px] font-semibold leading-tight">{opt.title}</span>
              <span className="font-news text-[14px] italic leading-[1.35] text-[#55534d]">{opt.sub}</span>
            </span>
            {chosen && (
              <motion.span
                initial={{ opacity: 0, scale: 1.9, rotate: -16 }}
                animate={{ opacity: 0.9, scale: 1, rotate: -8 }}
                transition={{ duration: 0.28, ease: [0.3, 1.6, 0.5, 1] }}
                className="absolute right-3 top-1/2 -mt-4 border-[2.5px] border-wax bg-parchment/80 px-2 py-0.5 font-stamp text-[15px] tracking-[0.18em] text-wax"
              >
                GEKOZEN
              </motion.span>
            )}
          </motion.button>
        );
      })}
      <div className="label flex items-center gap-2.5 pt-1 text-[10.5px] tracking-[0.16em] text-ash">
        <span className="h-px flex-1 bg-rule" />
        Geen goed antwoord · je keuze komt terug
        <span className="h-px flex-1 bg-rule" />
      </div>
    </motion.div>
  );
}

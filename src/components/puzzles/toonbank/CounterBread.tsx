"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { useStill } from "@/lib/still";
import { sfx } from "@/lib/sound";
import { TS } from "./ts";

/**
 * Hand a loaf over the counter: drag it from the basket into the customer's bag. A loaf dropped
 * anywhere else slides back. The button under it does the same for whoever cannot drag.
 */
export function CounterBread({ given, need, left, onGive }: { given: number; need: number; left: number; onGive: () => void }) {
  const still = useStill();
  const bag = useRef<HTMLDivElement>(null);
  const give = () => {
    sfx.lid();
    onGive();
  };
  const inBag = (x: number, y: number) => {
    const r = bag.current?.getBoundingClientRect();
    return !!r && x > r.left - 20 && x < r.right + 20 && y > r.top - 20 && y < r.bottom + 20;
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-[150px]">
        {left > 0 ? (
          <motion.img
            // a fresh loaf for every one handed over
            key={given}
            src="/img/markt/loaf.webp"
            alt="Een Zweeds wittebrood"
            className="absolute left-1 top-4 z-10 w-[132px] cursor-grab touch-none drop-shadow-[0_12px_10px_rgba(0,0,0,.55)] active:cursor-grabbing"
            draggable={false}
            drag
            dragSnapToOrigin
            dragElastic={0.2}
            whileDrag={{ scale: 1.06, rotate: -4 }}
            initial={still ? false : { x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            onDragEnd={(_, info) => inBag(info.point.x - window.scrollX, info.point.y - window.scrollY) && give()}
          />
        ) : (
          <span className={`absolute left-2 top-10 font-news ${TS[15]} italic text-bone`}>De mand is leeg.</span>
        )}
        <svg aria-hidden="true" className="absolute left-[140px] top-[46px]" width="96" height="40" viewBox="0 0 96 40" fill="none" stroke="#ede6d6" strokeWidth="2" strokeDasharray="6 6">
          <path d="M4 30 C30 6 62 6 90 18" />
          <path d="M80 8 L92 18 L78 26" strokeDasharray="0" />
        </svg>
        <div ref={bag} className="absolute right-0 top-0 flex w-[118px] flex-col items-center">
          <img src="/img/markt/bag.webp" alt="De boodschappentas" className="h-[136px] w-auto" draggable={false} />
          <span className={`-mt-1 bg-paper px-2 py-0.5 font-label ${TS[12]} font-bold text-ink`}>
            {given} van {need} {need === 1 ? "brood" : "broden"}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={give}
        disabled={left <= 0}
        className={`h-11 self-start border border-parchment/40 bg-dusk/70 px-4 font-label ${TS[13]} tracking-[0.1em] text-parchment disabled:opacity-40`}
      >
        GEEF EEN BROOD
      </button>
    </div>
  );
}

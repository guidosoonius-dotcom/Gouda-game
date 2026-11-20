"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { gramsAt } from "@/game/toonbank";
import { TUNING } from "@/game/tuning";
import { useStill } from "@/lib/still";
import { sfx } from "@/lib/sound";
import { TS } from "./ts";

/** Grams per full turn of the dial on the painted scale. */
const DIAL = 1000;
/** The block of margarine sits between these fractions of its image (the paper around it). */
const BLOCK = { from: 0.07, to: 0.93 };
/** How long the needle swings before the piece counts. */
const SETTLE_MS = 900;

/**
 * Cut margarine with one stroke and weigh it. The whole block weighs `TUNING.toonbank.blockGrams`;
 * the player judges the share by eye. Drag the knife along the block (or use the arrow keys) and
 * let go to cut: the piece flies onto the scale, the needle swings and settles, then the weight
 * counts. `piece` is what is already on the scale for this customer.
 */
export function CounterScale({ need, piece, onCut }: { need: number; piece: number; onCut: (grams: number) => void }) {
  const still = useStill();
  const block = useRef<HTMLDivElement>(null);
  const [knife, setKnife] = useState(0.3);
  const [dragging, setDragging] = useState(false);
  const [flying, setFlying] = useState<number | null>(null);
  const busy = flying !== null;
  const shown = piece + (flying ?? 0);

  const at = (clientX: number) => {
    const r = block.current!.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - r.left) / r.width));
  };
  const toGrams = (f: number) => gramsAt((f - BLOCK.from) / (BLOCK.to - BLOCK.from));
  const cut = () => {
    if (busy) return;
    const grams = toGrams(knife);
    if (grams <= 0) return;
    sfx.paper();
    setFlying(grams);
    window.setTimeout(() => sfx.settle(), still ? 0 : 350);
    window.setTimeout(() => {
      setFlying(null);
      onCut(grams);
    }, still ? 300 : SETTLE_MS);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-[176px] w-full">
        <img src="/img/markt/scale.webp" alt="" className="absolute left-1/2 top-0 h-[176px] w-auto -translate-x-1/2" draggable={false} />
        <motion.div
          aria-hidden="true"
          className="absolute left-1/2 top-[40px] h-[46px] w-[3px] -ml-px origin-bottom bg-[#2a2622]"
          animate={{ rotate: (shown / DIAL) * 360 }}
          transition={still ? { duration: 0 } : { type: "spring", stiffness: 70, damping: 7 }}
        />
      </div>
      <div className="flex flex-col items-center" aria-live="polite">
        <span className={`font-fell ${TS[28]} leading-none`}>{shown} gram</span>
        <span className={`font-label ${TS[12]} tracking-[0.06em] text-bone`}>
          nodig: {need} gram{piece > 0 && !busy ? " · nog wat bijsnijden" : ""}
        </span>
      </div>
      <div
        ref={block}
        role="slider"
        tabIndex={0}
        aria-label="Mes op het blok margarine"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(knife * 100)}
        aria-valuetext={`${Math.round(((knife - BLOCK.from) / (BLOCK.to - BLOCK.from)) * 100)} procent van het blok`}
        className="relative mt-2 h-[120px] w-full max-w-[340px] touch-none select-none"
        onPointerDown={(e) => {
          if (busy) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
          setKnife(at(e.clientX));
        }}
        onPointerMove={(e) => dragging && setKnife(at(e.clientX))}
        onPointerUp={() => {
          if (!dragging) return;
          setDragging(false);
          cut();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setKnife((k) => Math.min(1, k + 0.01));
          if (e.key === "ArrowLeft") setKnife((k) => Math.max(0, k - 0.01));
          if (e.key === "Enter" || e.key === " ") cut();
        }}
      >
        <img src="/img/markt/marg.webp" alt="" className="absolute inset-x-0 top-2 w-full" draggable={false} />
        {flying !== null && (
          <motion.img
            src="/img/markt/marg.webp"
            alt=""
            className="absolute inset-x-0 top-2 w-full"
            style={{ clipPath: `inset(0 ${(1 - knife) * 100}% 0 0)` }}
            initial={{ y: 0, opacity: 1 }}
            animate={still ? { opacity: 0 } : { y: -150, scale: 0.5, opacity: 0 }}
            transition={{ duration: still ? 0.2 : 0.5, ease: "easeIn" }}
          />
        )}
        <div className="pointer-events-none absolute -top-1 bottom-0 w-0 border-l-2 border-dashed border-parchment" style={{ left: `${knife * 100}%` }} />
      </div>
      <span className={`font-label ${TS[12]} text-bone`}>Het hele blok weegt {TUNING.toonbank.blockGrams} gram.</span>
    </div>
  );
}

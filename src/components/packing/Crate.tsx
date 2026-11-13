"use client";

import { forwardRef } from "react";
import { motion } from "motion/react";
import { dims, type Level, type Piece } from "./levels";
import { GlassPanel } from "./GlassPanel";

const FRAME = 14;
const WOOD =
  "repeating-linear-gradient(90deg, rgba(0,0,0,.14) 0 1px, transparent 1px 23px), repeating-linear-gradient(0deg, rgba(255,255,255,.035) 0 2px, transparent 2px 7px), linear-gradient(180deg, #7b5a36, #5e4326)";
const STRAW =
  "repeating-linear-gradient(63deg, rgba(92,62,18,.38) 0 1.5px, transparent 1.5px 9px), repeating-linear-gradient(-48deg, rgba(255,240,190,.35) 0 1px, transparent 1px 7px), repeating-linear-gradient(12deg, rgba(120,84,30,.3) 0 1px, transparent 1px 11px), radial-gradient(ellipse at 40% 35%, #d3b46a, #a98742)";

export interface Hover {
  col: number;
  row: number;
  w: number;
  h: number;
  valid: boolean;
}

/** Open wooden crate lined with straw; `ref` points at the cell area for hit-testing. */
export const Crate = forwardRef<
  HTMLDivElement,
  {
    level: Level;
    pieces: Piece[];
    cell: number;
    dragId: string | null;
    hover: Hover | null;
    closed: boolean;
    onGrab: (e: React.PointerEvent, piece: Piece) => void;
  }
>(function Crate({ level, pieces, cell, dragId, hover, closed, onGrab }, ref) {
  const W = level.cols * cell;
  const H = level.rows * cell;
  return (
    <div
      className="relative shadow-[0_18px_34px_rgba(0,0,0,.6)]"
      style={{ width: W + FRAME * 2, height: H + FRAME * 2, background: WOOD, padding: FRAME }}
    >
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-[#2b1f12] shadow-[inset_0_1px_0_rgba(255,255,255,.25)]"
          style={{ [i < 2 ? "top" : "bottom"]: 4, [i % 2 ? "right" : "left"]: 4 }}
        />
      ))}
      <div
        ref={ref}
        data-crate={level.crate}
        data-cell={cell}
        className="relative shadow-[inset_0_8px_18px_rgba(0,0,0,.65),inset_0_0_0_1px_rgba(0,0,0,.5)]"
        style={{ width: W, height: H, background: STRAW }}
      >
        {/* faint slot guides */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(40,26,8,.9) 1px, transparent 1px), linear-gradient(0deg, rgba(40,26,8,.9) 1px, transparent 1px)",
            backgroundSize: `${cell}px ${cell}px`,
          }}
        />
        {hover && (
          <div
            className="absolute transition-[left,top] duration-75"
            style={{
              left: hover.col * cell,
              top: hover.row * cell,
              width: hover.w * cell,
              height: hover.h * cell,
              background: hover.valid ? "rgba(255,236,170,.34)" : "rgba(226,91,74,.3)",
              outline: `2px dashed ${hover.valid ? "#fff3c4" : "#e25b4a"}`,
              outlineOffset: -3,
            }}
          />
        )}
        {pieces.map((p) => {
          if (!p.at || p.id === dragId) return null;
          const d = dims(p);
          return (
            <motion.div
              key={p.id}
              initial={{ scale: 1.08, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 520, damping: 22 }}
              onPointerDown={(e) => onGrab(e, p)}
              className="absolute touch-none"
              style={{ left: p.at.col * cell, top: p.at.row * cell, width: d.w * cell, height: d.h * cell }}
            >
              <GlassPanel id={`${level.crate}-${p.id}`} w={p.w} h={p.h} rot={p.rot} palette={p.palette} cell={cell} />
            </motion.div>
          );
        })}
      </div>

      {/* Lid slides on when the crate is full. */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center gap-1"
        style={{ background: WOOD, pointerEvents: "none" }}
        initial={false}
        animate={closed ? { y: 0, opacity: 1 } : { y: "-108%", opacity: 0 }}
        transition={closed ? { duration: 0.55, ease: [0.3, 0, 0.2, 1] } : { duration: 0 }}
      >
        <span className="font-stamp text-[15px] tracking-[0.3em] text-[#2b1f12]/85">ST. JAN · GOUDA</span>
        <span className="font-stamp text-[54px] leading-none text-[#2b1f12]/85">{level.crate}</span>
        <span className="mt-1 border-2 border-[#2b1f12]/75 px-2 font-stamp text-[13px] tracking-[0.3em] text-[#2b1f12]/85">
          BREEKBAAR
        </span>
      </motion.div>
    </div>
  );
});

export const CRATE_FRAME = FRAME;

"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { sfx } from "@/lib/sound";

const STARS = [
  { x: 52, y: 62 },
  { x: 100, y: 62 },
  { x: 148, y: 62 },
  { x: 52, y: 178 },
  { x: 100, y: 178 },
  { x: 148, y: 178 },
];
/** The star that comes loose, as on the plaque on the door. */
const FALLS = 2;

function star(r: number) {
  const pts: string[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI / 6) * i - Math.PI / 2;
    const d = i % 2 ? r * 0.55 : r;
    pts.push(`${(Math.cos(a) * d).toFixed(1)},${(Math.sin(a) * d).toFixed(1)}`);
  }
  return pts.join(" ");
}

/**
 * The arms of Gouda: red, a white bar, six gold stars. Touch them one by one; when all six have
 * been touched, one comes loose and falls. No score, no right or wrong: a moment, not a game.
 */
export function StarsPuzzle({ onSolved }: { onSolved: () => void }) {
  const [touched, setTouched] = useState<number[]>([]);
  const all = touched.length === STARS.length;
  useEffect(() => {
    if (!all) return;
    const id = window.setTimeout(onSolved, 1600);
    return () => window.clearTimeout(id);
  }, [all]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 200 330" className="w-[210px] overflow-visible" role="img" aria-label={all ? "Het wapen van Gouda met vijf sterren; één ster is gevallen" : `Het wapen van Gouda, ${touched.length} van de 6 sterren aangeraakt`}>
        <path d="M10 10 H190 V140 C190 200 150 232 100 248 C50 232 10 200 10 140 Z" fill="#9e2a2b" stroke="#c9bfa8" strokeWidth="3" />
        <rect x="10" y="104" width="180" height="36" fill="#ede6d6" />
        {STARS.map((s, i) => {
          const on = touched.includes(i);
          return (
            <motion.g
              key={i}
              initial={false}
              animate={all && i === FALLS ? { x: 18, y: 120, rotate: 70, opacity: 0.85 } : { x: 0, y: 0, rotate: 0, opacity: 1 }}
              transition={{ duration: 1.4, ease: [0.5, 0, 0.75, 0.4] }}
              style={{ originX: `${s.x}px`, originY: `${s.y}px` }}
            >
              <polygon
                points={star(22)}
                transform={`translate(${s.x} ${s.y})`}
                fill={on ? "#f0c35a" : "#c9952f"}
                stroke={on ? "#fff3c9" : "none"}
                strokeWidth="1.5"
                role="button"
                tabIndex={0}
                aria-label={`Ster ${i + 1}`}
                onClick={() => !on && (sfx.settle(), setTouched((t) => [...t, i]))}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && !on && setTouched((t) => [...t, i])}
                style={{ cursor: on ? "default" : "pointer" }}
              />
              {/* generous touch target */}
              <circle cx={s.x} cy={s.y} r="26" fill="transparent" onClick={() => !on && (sfx.settle(), setTouched((t) => [...t, i]))} />
            </motion.g>
          );
        })}
      </svg>
      <span className="font-news text-[14px] italic text-bone" aria-live="polite">
        {all ? "Vijf sterren. Eén is gevallen." : `${touched.length} van de 6`}
      </span>
    </div>
  );
}

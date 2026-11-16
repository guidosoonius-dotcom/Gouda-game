"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { sfx } from "@/lib/sound";

/** Three gold stars on either side of the white pale, as in the arms of Gouda. */
const STARS = [
  { x: 72, y: 108 },
  { x: 72, y: 160 },
  { x: 72, y: 212 },
  { x: 168, y: 108 },
  { x: 168, y: 160 },
  { x: 168, y: 212 },
];
/** The star that comes loose, as on the plaque on the door, and where it comes to rest. */
const FALLS = 3;
const REST = { x: 28, y: 242, rotate: 80 };

const SHIELD = "M40 70 Q80 64 120 70 Q160 64 200 70 V190 C200 238 166 262 120 274 C74 262 40 238 40 190 Z";
const STAR = "0,-13 2.93,-5.07 11.26,-6.5 5.85,0 11.26,6.5 2.93,5.07 0,13 -2.93,5.07 -11.26,6.5 -5.85,0 -11.26,-6.5 -2.93,-5.07";
const GOLD = "#d9a93a";
const GOLD_DARK = "#8a6416";

/** The open crown above the shield: a band with jewels, arches over a red cushion, three fleurons. */
function Crown() {
  const fleurons = [
    [124, 64],
    [160, 42],
    [196, 64],
  ];
  return (
    <g transform="translate(120 -46) scale(1.4) translate(-160 0)" aria-hidden="true">
      <path d="M126 76 Q160 50 194 76 Z" fill="#8f1f24" />
      <path d="M124 76 Q130 56 160 52 Q190 56 196 76 M160 50 V76" fill="none" stroke={GOLD} strokeWidth="4" />
      <rect x="118" y="74" width="84" height="12" rx="4" fill={GOLD} stroke={GOLD_DARK} strokeWidth="1" />
      {[132, 146, 160, 174, 188].map((x) => (
        <circle key={x} cx={x} cy="80" r="2.2" fill="#8f1f24" />
      ))}
      <g fill={GOLD} stroke={GOLD_DARK} strokeWidth="0.8">
        {fleurons.map(([x, y]) => (
          <g key={x}>
            <circle cx={x - 4} cy={y + 2} r="4.5" />
            <circle cx={x + 4} cy={y + 2} r="4.5" />
            <circle cx={x} cy={y - 4} r="4.5" />
          </g>
        ))}
        <circle cx="142" cy="57" r="2.6" />
        <circle cx="178" cy="57" r="2.6" />
      </g>
    </g>
  );
}

/** The blue scroll under the shield with the town's motto. */
function Motto() {
  return (
    <g aria-hidden="true">
      <path d="M2 298 L18 284 L24 312 L6 318 Z M238 298 L222 284 L216 312 L234 318 Z" fill="#152048" />
      <path d="M14 282 Q120 318 226 282 L220 310 Q120 346 20 310 Z" fill="#23306b" stroke="#141d44" strokeWidth="1.2" />
      <path id="motto-line" d="M26 302 Q120 334 214 302" fill="none" />
      <text fontSize="11" letterSpacing="1.2" fill="#e8bb52" style={{ fontFamily: "var(--font-fell)" }}>
        <textPath href="#motto-line" startOffset="50%" textAnchor="middle">
          PER·ASPERA·AD·ASTRA
        </textPath>
      </text>
    </g>
  );
}

/**
 * The arms of Gouda: a red shield with a white pale, three gold stars on either side, the crown
 * above and the motto below. Touch the stars one by one; when all six have been touched, one comes
 * loose and falls. No score, no right or wrong: a moment, not a game.
 */
export function StarsPuzzle({ onSolved }: { onSolved: () => void }) {
  const [touched, setTouched] = useState<number[]>([]);
  const all = touched.length === STARS.length;
  useEffect(() => {
    if (!all) return;
    const id = window.setTimeout(onSolved, 1600);
    return () => window.clearTimeout(id);
  }, [all]); // eslint-disable-line react-hooks/exhaustive-deps
  const touch = (i: number) => {
    if (touched.includes(i)) return;
    sfx.settle();
    setTouched((t) => [...t, i]);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        viewBox="0 0 240 365"
        className="w-[290px] max-w-full overflow-visible"
        role="img"
        aria-label={all ? "Het wapen van Gouda met vijf sterren; één ster is gevallen" : `Het wapen van Gouda, ${touched.length} van de 6 sterren aangeraakt`}
      >
        <defs>
          <clipPath id="gouda-shield">
            <path d={SHIELD} />
          </clipPath>
        </defs>
        <Motto />
        <path d={SHIELD} fill="#b3262d" />
        <rect x="104" y="50" width="32" height="240" fill="#f1ede4" clipPath="url(#gouda-shield)" />
        <path d={SHIELD} fill="none" stroke={GOLD} strokeWidth="2.5" />
        <Crown />
        {/* where the loose star sat: a darker scar, only seen once it has fallen */}
        <polygon points={STAR} transform={`translate(${STARS[FALLS].x} ${STARS[FALLS].y}) scale(1.3)`} fill="#7e1d22" stroke="#5c1418" strokeWidth="0.8" strokeDasharray="2 2" />
        {STARS.map((s, i) => {
          const on = touched.includes(i);
          return (
            <g key={i} transform={`translate(${s.x} ${s.y})`}>
              <motion.g
                initial={false}
                animate={all && i === FALLS ? { ...REST, opacity: 0.85 } : { x: 0, y: 0, rotate: 0, opacity: 1 }}
                transition={{ duration: 1.4, ease: [0.5, 0, 0.75, 0.4] }}
                role="button"
                tabIndex={0}
                aria-label={`Ster ${i + 1}`}
                aria-pressed={on}
                onClick={() => touch(i)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && touch(i)}
                className="outline-none focus-visible:[outline:2px_solid_#e2a93a]"
                style={{ cursor: on ? "default" : "pointer" }}
              >
                {/* generous touch target (about 48 px on a phone) */}
                <circle r="20" fill="transparent" />
                <polygon points={STAR} transform="scale(1.3)" fill={on ? "#f6cd63" : GOLD} stroke={on ? "#fff3c9" : GOLD_DARK} strokeWidth="0.9" />
              </motion.g>
            </g>
          );
        })}
      </svg>
      <span className="font-news text-[14px] italic text-bone" aria-live="polite">
        {all ? "Vijf sterren. Eén is gevallen." : `${touched.length} van de 6`}
      </span>
    </div>
  );
}

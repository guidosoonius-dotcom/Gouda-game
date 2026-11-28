"use client";

import { chapterById } from "@/data/places";
import { ROUTE } from "@/data/route";

/** The map image is 1100 x 1216; chapter `map` positions are percentages of it. */
const MW = 1100;
const MH = 1216;
const PAD = 70;

/** The walk on the old map: a dashed line through the stops, numbered in order. */
export function WalkMap({ seen, current }: { seen: number[]; current: number }) {
  const pts = ROUTE.map((s) => {
    const m = chapterById(s.place).map;
    return { x: (m.x / 100) * MW, y: (m.y / 100) * MH, place: s.place };
  });
  const x0 = Math.max(0, Math.min(...pts.map((p) => p.x)) - PAD);
  const y0 = Math.max(0, Math.min(...pts.map((p) => p.y)) - PAD);
  const x1 = Math.min(MW, Math.max(...pts.map((p) => p.x)) + PAD);
  const y1 = Math.min(MH, Math.max(...pts.map((p) => p.y)) + PAD);
  const r = (x1 - x0) / 34;

  return (
    <svg viewBox={`${x0} ${y0} ${x1 - x0} ${y1 - y0}`} className="block h-auto w-full flex-none border border-rule" role="img" aria-label="De route van de wandeling op de oude kaart van Gouda">
      <image href="/img/map/kaart_kleur.webp" x={0} y={0} width={MW} height={MH} opacity={0.75} />
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="#0a0d11" opacity={0.35} />
      <polyline
        points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        stroke="#e2a93a"
        strokeWidth={r / 3}
        strokeDasharray={`${r * 0.9} ${r * 0.6}`}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map((p, i) => {
        const done = seen.includes(p.place);
        const now = i === current;
        return (
          <g key={p.place} transform={`translate(${p.x} ${p.y})`}>
            <circle r={now ? r * 1.25 : r} fill={done ? "#e2a93a" : "#0a0d11"} stroke={now ? "#ede6d6" : "#e2a93a"} strokeWidth={r / 4} />
            <text y={r * 0.38} textAnchor="middle" fontSize={r * 1.1} fontFamily="var(--font-label)" fontWeight={700} fill={done ? "#14181d" : "#ede6d6"}>
              {i + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

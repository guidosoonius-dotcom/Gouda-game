"use client";

import { memo, useMemo } from "react";
import type { Palette } from "./levels";

const GLASS: Record<Palette, string[]> = {
  blue: ["#1f4e8c", "#2b6cb0", "#173a66", "#3b82c4", "#6ea8d8"],
  ruby: ["#8c1c2b", "#b02a37", "#6b1420", "#c9463c", "#d9705f"],
  amber: ["#d9a021", "#e8b84a", "#b47a14", "#f1cf7a", "#c98f1a"],
  green: ["#1f6b4a", "#2f8a5f", "#174f38", "#5aa97c", "#3f7d63"],
  violet: ["#5b3a8c", "#7650a8", "#432a69", "#9a7cc4", "#6a4a9c"],
};
const ACCENT: Record<Palette, Palette> = { blue: "amber", ruby: "blue", amber: "ruby", green: "amber", violet: "amber" };
const PALE = ["#e9e2c9", "#cfd9d6", "#f3ecd2"];
const LEAD = "#16181a";

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

interface Shard {
  d: string;
  fill: string;
}

/** Jittered-grid leading: irregular quads, some split into triangles, like hand-cut glass. */
function shards(w: number, h: number, palette: Palette, seed: string): Shard[] {
  const rand = rng(hash(seed));
  const S = 100;
  const nx = w * 2;
  const ny = h * 2;
  const step = S / 2;
  const pts: [number, number][][] = [];
  for (let j = 0; j <= ny; j++) {
    pts.push([]);
    for (let i = 0; i <= nx; i++) {
      const edgeX = i === 0 || i === nx;
      const edgeY = j === 0 || j === ny;
      pts[j].push([
        i * step + (edgeX ? 0 : (rand() - 0.5) * step * 0.42),
        j * step + (edgeY ? 0 : (rand() - 0.5) * step * 0.42),
      ]);
    }
  }
  const pick = () => {
    const r = rand();
    const set = r < 0.62 ? GLASS[palette] : r < 0.86 ? GLASS[ACCENT[palette]] : PALE;
    return set[Math.floor(rand() * set.length)];
  };
  const out: Shard[] = [];
  const P = (p: [number, number]) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const a = pts[j][i], b = pts[j][i + 1], c = pts[j + 1][i + 1], d = pts[j + 1][i];
      if (rand() < 0.38) {
        const flip = rand() < 0.5;
        out.push({ d: flip ? `M${P(a)}L${P(b)}L${P(c)}Z` : `M${P(a)}L${P(b)}L${P(d)}Z`, fill: pick() });
        out.push({ d: flip ? `M${P(a)}L${P(c)}L${P(d)}Z` : `M${P(b)}L${P(c)}L${P(d)}Z`, fill: pick() });
      } else {
        out.push({ d: `M${P(a)}L${P(b)}L${P(c)}L${P(d)}Z`, fill: pick() });
      }
    }
  }
  return out;
}

/** One leaded stained-glass panel of w x h crate cells, drawn procedurally (no archive imagery). */
export const GlassPanel = memo(function GlassPanel({
  id,
  w,
  h,
  rot,
  palette,
  cell,
  lifted = false,
}: {
  id: string;
  w: number;
  h: number;
  rot: boolean;
  palette: Palette;
  cell: number;
  lifted?: boolean;
}) {
  const cells = useMemo(() => shards(w, h, palette, `${id}-${w}x${h}-${palette}`), [id, w, h, palette]);
  const bw = w * cell;
  const bh = h * cell;
  const cx = (w * 100) / 2;
  const cy = (h * 100) / 2;
  const r = Math.min(w, h) * 27;
  const medallion = GLASS[ACCENT[palette]];
  const motif = hash(id) % 3;

  return (
    <div
      style={{
        width: rot ? bh : bw,
        height: rot ? bw : bh,
        filter: lifted ? "drop-shadow(0 16px 14px rgba(0,0,0,.55))" : "drop-shadow(0 2px 2px rgba(0,0,0,.45))",
      }}
    >
      <svg
        width={bw}
        height={bh}
        viewBox={`0 0 ${w * 100} ${h * 100}`}
        style={{
          display: "block",
          transformOrigin: "0 0",
          transform: rot ? `translate(${bh}px, 0) rotate(90deg)` : undefined,
        }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`sheen-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".28" />
            <stop offset=".45" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity=".28" />
          </linearGradient>
        </defs>
        <g stroke={LEAD} strokeWidth="5" strokeLinejoin="round">
          {cells.map((s, i) => (
            <path key={i} d={s.d} fill={s.fill} />
          ))}
          {w * h >= 2 && motif === 0 && (
            <>
              <circle cx={cx} cy={cy} r={r} fill={medallion[1]} />
              <path
                d={`M${cx} ${cy - r}L${cx + r * 0.5} ${cy}L${cx} ${cy + r}L${cx - r * 0.5} ${cy}Z`}
                fill={medallion[3]}
                strokeWidth="4"
              />
            </>
          )}
          {w * h >= 2 && motif === 1 && (
            <>
              {[[0, -1], [1, 0], [0, 1], [-1, 0]].map(([dx, dy], i) => (
                <circle key={i} cx={cx + dx * r * 0.52} cy={cy + dy * r * 0.52} r={r * 0.5} fill={medallion[i % 2 ? 3 : 1]} strokeWidth="4" />
              ))}
              <circle cx={cx} cy={cy} r={r * 0.3} fill={PALE[0]} strokeWidth="4" />
            </>
          )}
          {w * h >= 2 && motif === 2 && (
            <>
              <path
                d={`M${cx - r * 0.8} ${cy - r}H${cx + r * 0.8}V${cy + r * 0.1}C${cx + r * 0.8} ${cy + r * 0.7} ${cx + r * 0.3} ${cy + r} ${cx} ${cy + r * 1.1}C${cx - r * 0.3} ${cy + r} ${cx - r * 0.8} ${cy + r * 0.7} ${cx - r * 0.8} ${cy + r * 0.1}Z`}
                fill={medallion[1]}
              />
              <path d={`M${cx - r * 0.8} ${cy - r * 0.35}H${cx + r * 0.8}M${cx} ${cy - r}V${cy + r * 1.1}`} fill="none" strokeWidth="4" />
            </>
          )}
        </g>
        <rect width={w * 100} height={h * 100} fill={`url(#sheen-${id})`} />
        <rect x="4" y="4" width={w * 100 - 8} height={h * 100 - 8} fill="none" stroke={LEAD} strokeWidth="8" />
        <rect x="9" y="9" width={w * 100 - 18} height={h * 100 - 18} fill="none" stroke="#5c6166" strokeWidth="1.5" opacity=".7" />
      </svg>
    </div>
  );
});

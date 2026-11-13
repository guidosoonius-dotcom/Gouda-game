"use client";

import { CHAPTERS, type Chapter } from "@/data/chapters";

/** Map image is 1100 x 1216; the SVG overlay uses the same units. */
const MW = 1100;
const MH = 1216;
/** The map layer is this much wider than the stage, so the engraving reads at phone size. */
const ZOOM = 1.6;
/** Overlay units per CSS pixel at a 390px stage. */
const U = MW / (390 * ZOOM);
const START = { x: 37, y: 63 };

const px = (c: { x: number; y: number }) => ({ x: (c.x / 100) * MW, y: (c.y / 100) * MH });

function arc(a: { x: number; y: number }, b: { x: number; y: number }, bend = 0.18) {
  const mx = (a.x + b.x) / 2 - (b.y - a.y) * bend;
  const my = (a.y + b.y) / 2 + (b.x - a.x) * bend;
  return `M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}`;
}

function Seal({ chapter, state, onSelect }: { chapter: Chapter; state: "done" | "active" | "sealed"; onSelect: () => void }) {
  const p = px(chapter.map);
  const label = `Hoofdstuk ${chapter.id}: ${chapter.title}`;
  return (
    <g
      transform={`translate(${p.x} ${p.y})`}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect()}
      style={{ cursor: "pointer" }}
    >
      {/* generous invisible touch target (>= 44px) */}
      <circle r={26 * U} fill="transparent" />
      {state === "active" && (
        <>
          <circle className="anim-halo" r={30 * U} fill="#c9473c" opacity=".35" />
          <g className="anim-seal">
            <path
              transform={`scale(${U})`}
              d="M0,-21 C6,-21 9,-18 13,-17 C18,-14 21,-9 20,-3 C22,3 19,8 16,12 C13,17 8,20 2,21 C-4,22 -9,19 -13,16 C-18,12 -21,7 -20,1 C-22,-5 -18,-10 -15,-14 C-11,-18 -6,-21 0,-21Z"
              fill="url(#wax)"
              stroke="#4a1011"
              strokeWidth=".8"
            />
            <circle r={13.5 * U} fill="none" stroke="#6e1b1c" strokeWidth={1.4 * U} opacity=".8" />
            <text y={6.5 * U} textAnchor="middle" fill="#f3d6c4" fontFamily="var(--font-fell)" fontSize={19 * U}>
              {chapter.id}
            </text>
          </g>
        </>
      )}
      {state === "done" && (
        <>
          <circle r={13 * U} fill="rgba(10,13,17,.78)" stroke="#d9cbb0" strokeWidth={1.6 * U} />
          <path
            transform={`scale(${U})`}
            d="M-5 0.5 L-1.5 4 L5.5 -3.5"
            fill="none"
            stroke="#d9cbb0"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {state === "sealed" && (
        <>
          <circle r={12 * U} fill="rgba(10,13,17,.78)" stroke="#8f989f" strokeWidth={1.2 * U} />
          <text y={4.5 * U} textAnchor="middle" fill="#b8bec2" fontFamily="var(--font-fell)" fontSize={14 * U}>
            {chapter.id}
          </text>
        </>
      )}
      {chapter.offMap && (
        <text
          x={-12 * U}
          y={30 * U}
          fill="#8f989f"
          fontFamily="var(--font-label)"
          fontWeight="600"
          fontSize={9 * U}
          letterSpacing={1.2 * U}
        >
          ← STATION
        </text>
      )}
    </g>
  );
}

export function BlaeuMap({
  selected,
  current,
  completed,
  onSelect,
}: {
  selected: Chapter;
  current: number;
  completed: number[];
  onSelect: (id: number) => void;
}) {
  const focus = selected.map;
  const tx = Math.max(-(1 - 1 / ZOOM) * 100, Math.min(0, (50 / ZOOM - focus.x)));
  const prev = CHAPTERS.find((c) => c.id === selected.id - 1);
  const from = px(prev ? prev.map : START);
  const to = px(focus);
  const lantern = 250;

  return (
    <div
      className="absolute left-0 top-0 w-[160%]"
      style={{
        aspectRatio: `${MW} / ${MH}`,
        transform: `translate(${tx}%, clamp(calc(100cqh - 100%), calc(44cqh - ${focus.y}%), 64px))`,
        transition: "transform 1.5s cubic-bezier(.3,.1,.2,1)",
      }}
    >
      <img src="/img/map/kaart_nacht.webp" alt="" className="absolute inset-0 h-full w-full" draggable={false} />
      {/* The lantern: the hand-coloured original shows through a soft drifting circle of light. */}
      <img
        src="/img/map/kaart_kleur.webp"
        alt=""
        draggable={false}
        className="map-lantern absolute inset-0 h-full w-full"
        style={
          {
            "--mx": `calc(${focus.x}% + ${(lantern * (focus.x - 50)) / 100}px)`,
            "--my": `calc(${focus.y}% + ${(lantern * (focus.y - 50)) / 100}px)`,
            "--ms": `${lantern}px`,
            filter: "saturate(.85) brightness(.92) sepia(.15)",
          } as React.CSSProperties
        }
      />
      <svg viewBox={`0 0 ${MW} ${MH}`} className="absolute inset-0 h-full w-full" aria-label="Kaart van Gouda met de vijf adressen">
        <defs>
          <radialGradient id="wax" cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#c9473c" />
            <stop offset="55%" stopColor="#9e2a2b" />
            <stop offset="100%" stopColor="#5e1617" />
          </radialGradient>
        </defs>
        {CHAPTERS.slice(0, -1).map((c, i) => (
          <path
            key={c.id}
            d={arc(px(c.map), px(CHAPTERS[i + 1].map), 0.1)}
            fill="none"
            stroke="#c9bfa8"
            strokeOpacity=".3"
            strokeWidth={1.2 * U}
            strokeDasharray={`${1 * U} ${5 * U}`}
            strokeLinecap="round"
          />
        ))}
        {selected.id === current && (
          <>
            <path
              className="anim-route"
              d={arc(from, to)}
              fill="none"
              stroke="#e2a93a"
              strokeWidth={2.4 * U}
              strokeDasharray={`${4 * U} ${7 * U}`}
              strokeLinecap="round"
              style={{ strokeDashoffset: 0 }}
            />
            {!prev && (
              <>
                <circle className="anim-ping" cx={from.x} cy={from.y} r={8 * U} fill="none" stroke="#e2a93a" strokeWidth={1.5 * U} />
                <circle cx={from.x} cy={from.y} r={5.5 * U} fill="#e2a93a" stroke="#0a0d11" strokeWidth={2 * U} />
                <text
                  x={from.x - 12 * U}
                  y={from.y + 22 * U}
                  fill="#e2a93a"
                  fontFamily="var(--font-label)"
                  fontWeight="700"
                  fontSize={10 * U}
                  letterSpacing={1.5 * U}
                >
                  JIJ
                </text>
              </>
            )}
          </>
        )}
        {CHAPTERS.map((c) => (
          <Seal
            key={c.id}
            chapter={c}
            state={completed.includes(c.id) ? "done" : c.id === selected.id || c.id === current ? "active" : "sealed"}
            onSelect={() => onSelect(c.id)}
          />
        ))}
      </svg>
    </div>
  );
}

"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { CHAPTERS, type Chapter } from "@/data/chapters";
import { openSides } from "@/data/places";
import { MAX_ZOOM, MIN_ZOOM, useMapView } from "./useMapView";

/** Map image is 1100 x 1216; the SVG overlay uses the same units. */
const MW = 1100;
const MH = 1216;
const START = { x: 37, y: 63 };

const px = (c: { x: number; y: number }) => ({ x: (c.x / 100) * MW, y: (c.y / 100) * MH });

function arc(a: { x: number; y: number }, b: { x: number; y: number }, bend = 0.18) {
  const mx = (a.x + b.x) / 2 - (b.y - a.y) * bend;
  const my = (a.y + b.y) / 2 + (b.x - a.x) * bend;
  return `M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}`;
}

/** `u` is overlay units per CSS pixel on screen, so seals keep their size whatever the zoom. */
function Seal({ chapter, state, onSelect, u: U }: { chapter: Chapter; state: "done" | "active" | "sealed"; onSelect: () => void; u: number }) {
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

/** A side story (zijspoor): a small ochre diamond, filled when chosen, a tick when done. */
function SideMark({ chapter, done, active, onSelect, u: U }: { chapter: Chapter; done: boolean; active: boolean; onSelect: () => void; u: number }) {
  const p = px(chapter.map);
  return (
    <g
      transform={`translate(${p.x} ${p.y})`}
      role="button"
      tabIndex={0}
      aria-label={`Zijspoor: ${chapter.title}`}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect()}
      style={{ cursor: "pointer" }}
    >
      <circle r={24 * U} fill="transparent" />
      {active && <circle className="anim-halo" r={19 * U} fill="#e2a93a" opacity=".3" />}
      <rect
        x={-8.5 * U}
        y={-8.5 * U}
        width={17 * U}
        height={17 * U}
        transform="rotate(45)"
        fill={active ? "#e2a93a" : "rgba(10,13,17,.8)"}
        stroke="#e2a93a"
        strokeWidth={1.6 * U}
      />
      {done ? (
        <path
          transform={`scale(${U})`}
          d="M-4.5 0.5 L-1.5 3.5 L4.5 -3"
          fill="none"
          stroke={active ? "#14181d" : "#e2a93a"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <circle r={2.4 * U} fill={active ? "#14181d" : "#e2a93a"} />
      )}
    </g>
  );
}

function Button({ label, onClick, children, className = "" }: { label: string; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      className={`pointer-events-auto flex h-11 w-11 items-center justify-center border border-[#3a434b] bg-night/75 font-label text-[length:calc(20px*var(--ts,1))] font-bold leading-none text-parchment active:bg-night ${className}`}
    >
      {children}
    </button>
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
  const stageRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState({ w: 390, h: 560 });
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setStage({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const focus = selected.map;
  const { view, smooth, away, recenter, zoomIn, zoomOut, wheel, handlers } = useMapView(stage, MH / MW, focus, selected.id);
  // wheel zoom needs a non-passive listener to stop the page from scrolling
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const on = (e: WheelEvent) => wheel(e, el.getBoundingClientRect());
    el.addEventListener("wheel", on, { passive: false });
    return () => el.removeEventListener("wheel", on);
  }, [wheel]);

  const U = MW / (stage.w * view.zoom);
  const prev = CHAPTERS.find((c) => c.id === selected.id - 1);
  const from = px(prev ? prev.map : START);
  const to = px(focus);
  // The lantern circle is 250 screen pixels wide whatever the zoom.
  const lantern = 250 / view.zoom;

  return (
    <div ref={stageRef} className="absolute inset-0 touch-none select-none overflow-hidden" {...handlers} role="application" aria-label="Kaart van Gouda: sleep om te bewegen, knijp om te zoomen">
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width: stage.w,
          aspectRatio: `${MW} / ${MH}`,
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`,
          transition: smooth ? "transform 1.2s cubic-bezier(.3,.1,.2,1)" : "none",
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
              u={U}
            />
          ))}
            {openSides(completed).map((c) => (
              <SideMark key={c.id} chapter={c} done={completed.includes(c.id)} active={c.id === selected.id} onSelect={() => onSelect(c.id)} u={U} />
            ))}
        </svg>
      </div>

      <div className="pointer-events-none absolute bottom-[70px] left-3 z-10 flex flex-col gap-1.5">
        <Button label="Inzoomen" onClick={zoomIn} className={view.zoom >= MAX_ZOOM - 0.01 ? "opacity-40" : ""}>
          +
        </Button>
        <Button label="Uitzoomen" onClick={zoomOut} className={view.zoom <= MIN_ZOOM + 0.01 ? "opacity-40" : ""}>
          −
        </Button>
        {away && (
          <Button label={`Terug naar hoofdstuk ${selected.id}`} onClick={recenter}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="5.5" />
              <path d="M11 1.5v4M11 16.5v4M1.5 11h4M16.5 11h4" />
            </svg>
          </Button>
        )}
      </div>
    </div>
  );
}
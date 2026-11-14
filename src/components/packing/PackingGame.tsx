"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TUNING } from "@/game/tuning";
import { useGameStore } from "@/store/useGameStore";
import { sfx } from "@/lib/sound";
import { Arrow, Back } from "@/components/ui/icons";
import { Crate, CRATE_FRAME } from "./Crate";
import { GlassPanel } from "./GlassPanel";
import { LEVELS, dims } from "./levels";
import { usePacking } from "./usePacking";

const MAX = TUNING.packing.rumblesBeforeHelp;

function willemSays(phase: string, rumbles: number, moves: number, helped: boolean, levelIndex: number): string {
  if (phase === "done") return helped ? "‘Geeft niks. Het glas is heel, daar gaat het om.’" : "‘Netjes. Daar kan geen strohalm meer bij.’";
  if (phase === "helping") return "‘Laat mij maar, jongen. De vloer trilt te hard.’";
  if (phase === "lid") return "‘Die is dicht.’";
  if (rumbles === 2) return "‘Weer een. Het komt dichterbij, lijkt het.’";
  if (rumbles === 1) return "‘Dat was Rotterdam. Doorwerken.’";
  if (moves === 0 && levelIndex === 0) return "‘Sleep een paneel in het stro. Tik erop om het te draaien.’";
  if (levelIndex === 1 && moves < 6) return "‘Deze kist is groter. Begin met de grote stukken.’";
  return "‘Rand tegen rand. Glas dat kan schuiven, breekt.’";
}

export function PackingGame() {
  const { finishTask, advance, go } = useGameStore();
  const stage = useRef<HTMLDivElement>(null);
  const crate = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 390, h: 844 });
  const maxCols = Math.max(...LEVELS.map((l) => l.cols));
  const maxRows = Math.max(...LEVELS.map((l) => l.rows));
  const cell = Math.floor(Math.min((size.w - 44 - CRATE_FRAME * 2) / maxCols, (size.h - 440 - CRATE_FRAME * 2) / maxRows, 66));
  const trayCell = Math.round(cell * 0.5);
  const g = usePacking(cell, stage, crate);
  const dragged = g.pieces.find((p) => p.id === g.dragId);

  useLayoutEffect(() => {
    const el = stage.current!;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Shake the room on every shock wave (visual twin of the rumble sound).
  const [shaking, setShaking] = useState(false);
  useEffect(() => {
    if (g.rumbles === 0) return;
    setShaking(true);
    const id = window.setTimeout(() => setShaking(false), 1000);
    return () => window.clearTimeout(id);
  }, [g.rumbles]);

  const finish = () => {
    sfx.paper();
    finishTask("ch1.task", g.helped ? "willem" : "alleen");
    advance();
  };

  return (
    <div ref={stage} className="absolute inset-0 touch-none overflow-hidden bg-dusk text-parchment">
      <div className="absolute -inset-6 bg-cover bg-center opacity-55 blur-[14px]" style={{ backgroundImage: "url(/img/scenes/kisten.webp)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 90% 60% at 50% 42%, rgba(14,17,20,.35), rgba(14,17,20,.92) 100%)" }} />

      <div className={`absolute inset-0 flex flex-col ${shaking ? "anim-tremble" : ""}`}>
        <header className="flex items-start justify-between gap-3 px-5 pt-[max(46px,env(safe-area-inset-top))]">
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Terug naar het dossier" onClick={() => go("dossier")} className="flex h-11 w-11 flex-none items-center justify-center border border-parchment/35 bg-dusk/45">
              <Back color="#ede6d6" />
            </button>
            <div className="flex flex-col gap-1">
              <span className="label text-[10.5px] text-bone">
                Kist {g.levelIndex + 1} van {LEVELS.length}
              </span>
              <span className="font-fell text-[24px] leading-none">Paneel voor paneel</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5" role="img" aria-label={`Schokgolven: ${g.rumbles} van ${MAX}`}>
            <span className="label text-[10.5px] text-bone">Schokgolven</span>
            <div className="flex gap-1.5">
              {Array.from({ length: MAX }, (_, i) => (
                <span key={i} className={`h-3 w-3 rotate-45 border transition-colors duration-500 ${i < g.rumbles ? "border-alarm bg-alarm" : "border-parchment/50"}`} />
              ))}
            </div>
            <div className="h-0.5 w-[62px] bg-parchment/20">
              <div className="h-full bg-ochre transition-[width] duration-300 ease-linear" style={{ width: `${(g.phase === "play" ? g.toNext : 0) * 100}%` }} />
            </div>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div key={g.levelIndex} initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -80, opacity: 0 }} transition={{ duration: 0.45 }}>
              <Crate ref={crate} level={g.level} pieces={g.pieces} cell={cell} dragId={g.dragId} hover={g.hover} closed={g.phase === "lid" || g.phase === "done"} onGrab={g.grab} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex min-h-[176px] flex-wrap content-center items-center justify-center gap-x-3 gap-y-2.5 px-5">
          {g.phase !== "done" &&
            g.pieces.map((p) => {
              const d = dims(p);
              const away = p.at !== null || p.id === g.dragId;
              return (
                <div
                  key={`${g.levelIndex}-${p.id}`}
                  onPointerDown={away ? undefined : (e) => g.grab(e, p)}
                  className="touch-none"
                  data-piece={p.id}
                  data-rot={p.rot ? 1 : 0}
                  style={{ width: d.w * trayCell, height: d.h * trayCell, outline: away ? "1.5px dashed rgba(237,230,214,.22)" : undefined }}
                >
                  {!away && <GlassPanel id={`${g.level.crate}-${p.id}`} w={p.w} h={p.h} rot={p.rot} palette={p.palette} cell={trayCell} />}
                </div>
              );
            })}
          {g.phase === "done" && (
            <motion.button
              type="button"
              onClick={finish}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex h-[54px] w-full items-center justify-between bg-ochre px-[18px] font-label text-[14px] font-bold tracking-[0.17em] text-slate"
            >
              DE KISTEN ZIJN DICHT
              <Arrow color="#14181d" />
            </motion.button>
          )}
        </div>

        <div className="flex min-h-[86px] items-start gap-3 px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full border-[1.5px] border-ochre bg-[#2a2f35] font-fell text-[18px] text-ochre">W</span>
          <div className="flex flex-col gap-1">
            <span className="label text-[10.5px] text-ochre">Willem</span>
            <AnimatePresence mode="wait">
              <motion.p
                key={willemSays(g.phase, g.rumbles, g.moves, g.helped, g.levelIndex)}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="m-0 font-news text-[16px] italic leading-[1.35]"
              >
                {willemSays(g.phase, g.rumbles, g.moves, g.helped, g.levelIndex)}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Dust shaken loose by the shock wave */}
      {shaking &&
        Array.from({ length: 9 }, (_, i) => (
          <span
            key={`${g.rumbles}-${i}`}
            className="pointer-events-none absolute h-1 w-1 rounded-full bg-[#d8d0be]"
            style={{ left: `${8 + i * 10.5}%`, top: `${14 + ((i * 37) % 30)}%`, animation: `dust 1s ${i * 0.06}s ease-in both` }}
          />
        ))}

      {/* The panel under the finger */}
      {dragged && (
        <div ref={g.float} className="pointer-events-none absolute left-0 top-0 z-10 will-change-transform">
          <GlassPanel id={`${g.level.crate}-${dragged.id}`} w={dragged.w} h={dragged.h} rot={dragged.rot} palette={dragged.palette} cell={cell} lifted />
        </div>
      )}
    </div>
  );
}

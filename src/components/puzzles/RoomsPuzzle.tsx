"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { emptyPlacement, evaluate, place, remove, type Placement } from "@/game/rooms";
import { ROOM_LEVELS } from "@/data/rooms";
import { sfx } from "@/lib/sound";
import { MaxLetter } from "./MaxLetter";
import { RoomBoard } from "./RoomBoard";

/**
 * The orphanage, April to October 1939: one room a month (dormitory, kitchen, classroom, two
 * dormitories), each with one new kind of rule. Tap a name, then a place. Between the rooms a letter
 * from Max. No clock and no way to fail: a broken rule turns red and says so.
 */
export function RoomsPuzzle({ onSolved }: { onSolved: () => void }) {
  const [li, setLi] = useState(0);
  const level = ROOM_LEVELS[li];
  const [p, setP] = useState<Placement>(() => emptyPlacement(level));
  const [hist, setHist] = useState<Placement[]>([]);
  const [sel, setSel] = useState("");
  const { rules, bad, solved } = useMemo(() => evaluate(level, p), [level, p]);
  const last = li === ROOM_LEVELS.length - 1;
  const root = useRef<HTMLDivElement>(null);
  // a new room starts at its picture, not wherever the last one was scrolled to
  useEffect(() => {
    root.current?.parentElement?.scrollTo({ top: 0 });
  }, [li]);

  useEffect(() => {
    if (!solved) return;
    sfx.chime();
    if (last) onSolved();
  }, [solved]); // eslint-disable-line react-hooks/exhaustive-deps

  const put = (next: Placement) => {
    setHist((h) => [...h, p]);
    setP(next);
    setSel("");
  };
  const onCell = (cell: number) => {
    if (solved) return;
    if (sel) {
      if (p[cell] === sel) return setSel("");
      sfx.settle();
      return put(place(p, sel, cell));
    }
    if (p[cell]) setSel(p[cell]!);
  };
  const nextLevel = () => {
    sfx.paper();
    const n = ROOM_LEVELS[li + 1];
    setLi(li + 1);
    setP(emptyPlacement(n));
    setHist([]);
    setSel("");
  };
  const tray = level.tokens.filter((t) => !p.includes(t.id));
  const selPlaced = sel && p.includes(sel);

  return (
    <div ref={root} className="flex flex-col gap-3">
      <ol className="m-0 grid list-none grid-cols-5 gap-1 p-0 text-center font-label text-[length:calc(11px*var(--ts,1))] uppercase tracking-[0.08em]">
        {[...ROOM_LEVELS.map((l) => l.month), "December"].map((m, i) => (
          <li key={m} aria-current={i === li ? "step" : undefined} className={`border-t-[3px] pt-1.5 ${i < li ? "border-ochre text-bone" : i === li ? "border-parchment font-bold text-parchment" : "border-rule text-ash"}`}>
            {m.slice(0, 3)}
          </li>
        ))}
      </ol>
      {level.image && (
        <div className="relative -mx-5 h-[170px] overflow-hidden bg-slate">
          <motion.img
            key={level.id}
            src={level.image.src}
            alt={level.image.alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="h-full w-full object-cover"
          />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-dusk to-transparent" />
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        <span className="font-fell text-[length:calc(21px*var(--ts,1))]">{level.title}</span>
        <span className="font-news text-[length:calc(14.5px*var(--ts,1))] italic leading-snug text-bone">{level.intro}</span>
      </div>

      <RoomBoard level={level} p={p} sel={sel} rules={rules} bad={bad} onCell={onCell} />

      {!solved && (
        <>
          <div className="flex min-h-[50px] flex-wrap gap-1.5">
            {tray.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={sel === t.id}
                onClick={() => setSel(sel === t.id ? "" : t.id)}
                className={`min-h-[46px] border-[1.5px] border-ochre px-2.5 py-1 text-left font-news text-[length:calc(14.5px*var(--ts,1))] leading-tight ${sel === t.id ? "bg-ochre text-slate" : "bg-slate text-parchment"}`}
              >
                {t.name}
                <span className="block font-label text-[length:calc(11px*var(--ts,1))] opacity-85">{t.note}</span>
              </button>
            ))}
            {selPlaced && (
              <button type="button" onClick={() => put(remove(p, sel))} className="min-h-[46px] border border-dashed border-ash px-3 font-label text-[length:calc(12px*var(--ts,1))] tracking-[0.08em] text-bone">
                TERUG IN DE RIJ
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" disabled={!hist.length} onClick={() => (setP(hist[hist.length - 1]), setHist(hist.slice(0, -1)), setSel(""))} className="h-12 flex-1 border border-rule font-label text-[length:calc(13px*var(--ts,1))] font-bold tracking-[0.12em] disabled:opacity-40">
              STAP TERUG
            </button>
            <button type="button" onClick={() => put(emptyPlacement(level))} className="h-12 flex-1 border border-rule font-label text-[length:calc(13px*var(--ts,1))] font-bold tracking-[0.12em]">
              OPNIEUW
            </button>
          </div>
        </>
      )}

      {solved && !last && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
          <MaxLetter month={level.month} text={level.letter} />
          <button type="button" onClick={nextLevel} className="flex h-[54px] items-center justify-between bg-ochre px-[18px] font-label text-[length:calc(14px*var(--ts,1))] font-bold tracking-[0.17em] text-slate">
            {ROOM_LEVELS[li + 1].month.toUpperCase()} <span aria-hidden="true">→</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}

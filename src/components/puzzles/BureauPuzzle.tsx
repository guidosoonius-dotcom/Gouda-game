"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { decide, messenger, nextDay, START, toolsOn, type DeskState, type Result, type Tool, type Verdict } from "@/game/bureau";
import { FRIDAY_FACT, ORDERS, OUTCOME_TEXT } from "@/data/bureau";
import { TUNING } from "@/game/tuning";
import { useGameStore } from "@/store/useGameStore";
import { sfx } from "@/lib/sound";
import { FactText } from "@/components/ui/Fact";
import { BureauTools } from "./BureauTools";

const STAMP: Record<Verdict, { label: string; color: string }> = {
  terug: { label: "TERUG", color: "#2b3a67" },
  liggen: { label: "LIGT", color: "#5b5f62" },
  tekenen: { label: "GETEKEND", color: "#9e2a2b" },
};

/**
 * The messenger's desk, 3–7 June 1940. Every day an order: mark the line that is wrong and send it
 * back, leave it lying, or sign it. Suspicion and days won carry through the week; on Friday the
 * mayor is taken away and the week's suspicion decides what becomes of the messenger.
 */
export function BureauPuzzle({ onSolved }: { onSolved: () => void }) {
  const finishTask = useGameStore((s) => s.finishTask);
  const still = useReducedMotion();
  const [desk, setDesk] = useState<DeskState>(START);
  const [line, setLine] = useState(-1);
  const [tool, setTool] = useState<Tool | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [miss, setMiss] = useState<{ text: string; n: number } | null>(null);
  const friday = desk.day >= ORDERS.length;
  const order = ORDERS[Math.min(desk.day, ORDERS.length - 1)];
  const outcome = messenger(desk.suspicion);

  useEffect(() => {
    if (!friday) return;
    finishTask("side12.bode", outcome);
    onSolved();
  }, [friday]); // eslint-disable-line react-hooks/exhaustive-deps

  const act = (verdict: Verdict) => {
    const step = decide(ORDERS, desk, verdict, line);
    setDesk(step.state);
    if (step.miss) {
      if (step.state.suspicion > desk.suspicion) sfx.reject();
      setMiss({ text: step.miss, n: (miss?.n ?? 0) + 1 });
      setLine(-1);
      return;
    }
    sfx.stamp();
    setMiss(null);
    setTool(null);
    setResult(step.result);
  };
  const next = () => {
    sfx.paper();
    setDesk(nextDay(desk));
    setLine(-1);
    setResult(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="label text-[length:calc(11px*var(--ts,1))] text-bone">Argwaan</span>
          <div className="flex gap-[3px]" role="img" aria-label={`Argwaan ${desk.suspicion} van ${TUNING.bureau.suspicionMax}`}>
            {Array.from({ length: TUNING.bureau.suspicionMax }, (_, i) => (
              <motion.span
                key={i}
                animate={{ scaleY: i === desk.suspicion - 1 && !still ? [1, 1.8, 1] : 1 }}
                className={`h-2 w-[18px] ${i < desk.suspicion ? "bg-alarm" : "bg-rule"}`}
              />
            ))}
          </div>
        </div>
        <span className="font-label text-[length:calc(13px*var(--ts,1))] text-ochre" aria-live="polite">
          Gewonnen: {desk.gained} {desk.gained === 1 ? "dag" : "dagen"}
        </span>
      </div>

      {friday ? (
        <div className="flex flex-col gap-3 pt-1">
          <span className="label text-[length:calc(11px*var(--ts,1))] text-ochre">Vrijdag 7 juni 1940</span>
          <p className="m-0 font-fell text-[length:calc(22px*var(--ts,1))] leading-snug">{OUTCOME_TEXT[outcome].title}</p>
          <p className="m-0 font-news text-[length:calc(15.5px*var(--ts,1))] leading-snug text-bone">{OUTCOME_TEXT[outcome].body}</p>
          <div className="flex flex-col gap-1 bg-paper px-3.5 py-3 font-news text-[length:calc(15px*var(--ts,1))] leading-snug text-ink">
            <span className="label text-[length:calc(11px*var(--ts,1))] text-wax-dark">Burgemeester James</span>
            <span>
              <FactText id={FRIDAY_FACT} />
            </span>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-baseline justify-between">
            <span className="font-fell text-[length:calc(20px*var(--ts,1))]">{order.day}</span>
            <span className="label text-[length:calc(11px*var(--ts,1))] text-ash">dag {desk.day + 1} van {ORDERS.length}</span>
          </div>
          <div className="relative bg-paper px-3.5 pb-3 pt-4 font-type text-[length:calc(13.5px*var(--ts,1))] leading-[1.45] text-ink shadow-[0_6px_18px_rgba(0,0,0,0.45)]">
            <div className="flex justify-between px-1.5 pb-2 text-[length:calc(11.5px*var(--ts,1))] tracking-[0.06em]">
              <span>ORTSKOMMANDANTUR GOUDA</span>
              <span>{order.date}</span>
            </div>
            {order.lines.map((text, i) => (
              <button
                key={i}
                type="button"
                aria-pressed={line === i}
                disabled={!!result}
                onClick={() => (sfx.key(), setLine(line === i ? -1 : i), setMiss(null))}
                className="my-px block min-h-9 w-full border-[2.5px] px-2 py-1 text-left"
                style={{ borderColor: line === i ? "#b3262d" : "transparent", borderRadius: "46% 54% 48% 52% / 62% 44% 56% 40%" }}
              >
                {text}
              </button>
            ))}
            <div className="px-1.5 pt-2 font-label text-[length:calc(11px*var(--ts,1))] text-[#5b5f62]">Verzonnen bevel, naar het soort bevelen uit 1940</div>
            {result && (
              <motion.div
                initial={still ? false : { scale: 1.9, rotate: -16, opacity: 0 }}
                animate={{ scale: 1, rotate: -8, opacity: 1 }}
                transition={{ type: "spring", stiffness: 520, damping: 18 }}
                className="absolute right-4 top-14 border-[3px] bg-paper/60 px-3 py-1 text-[length:calc(22px*var(--ts,1))] tracking-[0.18em]"
                style={{ color: STAMP[result.verdict].color, borderColor: STAMP[result.verdict].color }}
              >
                {STAMP[result.verdict].label}
              </motion.div>
            )}
          </div>

          {miss && (
            <motion.p
              key={miss.n}
              role="status"
              initial={false}
              animate={still ? {} : { x: [0, -6, 6, -3, 0] }}
              transition={{ duration: 0.28 }}
              className="m-0 border border-alarm bg-[#3a1a1b] px-3 py-2.5 font-news text-[length:calc(14.5px*var(--ts,1))] leading-snug"
            >
              {miss.text}
            </motion.p>
          )}

          {result ? (
            <>
              <p className="m-0 font-news text-[length:calc(16px*var(--ts,1))] leading-snug">{result.text}</p>
              <button type="button" onClick={next} className="flex h-[54px] items-center justify-between bg-ochre px-[18px] font-label text-[length:calc(14px*var(--ts,1))] font-bold tracking-[0.17em] text-slate">
                {desk.day + 1 < ORDERS.length ? "VOLGENDE DAG" : "VRIJDAG"} <span aria-hidden="true">→</span>
              </button>
            </>
          ) : (
            <>
              <BureauTools tools={toolsOn(ORDERS, desk.day)} open={tool} onOpen={setTool} fresh={order.tool} />
              <p className="m-0 font-news text-[length:calc(14px*var(--ts,1))] italic leading-snug text-bone">
                Vind de fout en stuur het bevel zonder gevaar terug. Gok je mis, dan stijgt de argwaan.
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {(["terug", "liggen", "tekenen"] as Verdict[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => act(v)}
                    className={`min-h-14 px-1 font-label text-[length:calc(12.5px*var(--ts,1))] font-bold leading-tight tracking-[0.08em] ${v === "terug" ? "bg-ochre text-slate" : "border border-rule bg-slate text-parchment"}`}
                  >
                    {v === "terug" ? "TERUG WEGENS FOUT" : v === "liggen" ? "LATEN LIGGEN" : "TEKENEN"}
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

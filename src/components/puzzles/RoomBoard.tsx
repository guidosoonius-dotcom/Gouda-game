"use client";

import { Fragment } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Level, Placement, RuleState } from "@/game/rooms";

interface Props {
  level: Level;
  p: Placement;
  sel: string;
  rules: RuleState[];
  bad: Set<string>;
  onCell: (cell: number) => void;
}

const MARK = { 1: { icon: "✓", word: "klopt", color: "#8fc79a" }, 0: { icon: "·", word: "nog open", color: "#8f989f" }, [-1]: { icon: "×", word: "klopt niet", color: "#e25b4a" } };

/** The room as a grid of beds, desks or shelf places, with the rules and whether each one holds. */
export function RoomBoard({ level, p, sel, rules, bad, onCell }: Props) {
  const still = useReducedMotion();
  const name = (id: string | null) => level.tokens.find((t) => t.id === id);
  const rows = Array.from({ length: level.rows }, (_, r) => r);
  const cols = Array.from({ length: level.cols }, (_, c) => c);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 border border-[#4a4236] bg-[#2a2620] p-2.5">
        {rows.map((r) => (
          <div key={r} className="flex flex-col gap-1">
            {level.rowLabels && <span className="label text-[length:calc(11px*var(--ts,1))] text-bone">{level.rowLabels[r]}</span>}
            <div className="flex gap-2">
              {cols.map((c) => {
                const i = r * level.cols + c;
                const t = name(p[i]);
                const wall = level.groups && c > 0 && level.groups[i] !== level.groups[i - 1];
                const wrong = t && bad.has(t.id);
                const picked = t && sel === t.id;
                return (
                  <Fragment key={c}>
                    {wall && <span aria-hidden="true" className="w-1 flex-none bg-[#6b604f]" />}
                    <button
                      type="button"
                      onClick={() => onCell(i)}
                      aria-label={`${level.cells[i] ? level.cells[i] + ", " : ""}${level.groups ? level.groups[i] + ", " : ""}${t ? t.name : "leeg"}`}
                      className="flex min-h-[74px] min-w-0 flex-1 flex-col justify-between border-2 p-1.5 text-left font-news text-ink"
                      style={{
                        background: t ? (picked ? "#f3e7a9" : "#ece5d3") : "#d9d0bb",
                        borderColor: wrong ? "#e25b4a" : picked ? "#e2a93a" : "#8a7f69",
                      }}
                    >
                      <span className="font-label text-[length:calc(11px*var(--ts,1))] uppercase tracking-[0.1em]" style={{ color: wrong ? "#9e2a2b" : "#5b5f62" }}>
                        {level.cells[i] || (level.groups && c % 2 === 0 && r === 0 ? level.groups[i] : "")}
                      </span>
                      {t && (
                        <motion.span key={t.id} initial={still ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 600, damping: 20 }} className="text-[length:calc(15px*var(--ts,1))] font-medium leading-tight">
                          {t.name}
                        </motion.span>
                      )}
                    </button>
                  </Fragment>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {level.rules.map((rule, k) => {
          const m = MARK[rules[k].v];
          return (
            <li key={k} className="grid min-h-7 grid-cols-[22px_1fr_auto] items-center gap-2">
              <span aria-hidden="true" className="flex h-[18px] w-[18px] items-center justify-center border-[1.5px] font-label text-[length:calc(12px*var(--ts,1))] font-bold" style={{ borderColor: m.color, color: m.color }}>
                {m.icon}
              </span>
              <span className="font-news text-[length:calc(14.5px*var(--ts,1))] leading-tight">{rule.text}</span>
              <span className="font-label text-[length:calc(11.5px*var(--ts,1))]" style={{ color: m.color }}>
                {m.word}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

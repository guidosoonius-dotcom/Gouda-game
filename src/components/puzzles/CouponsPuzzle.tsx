"use client";

import { useState } from "react";
import type { Puzzle } from "@/data/chapters";
import { sfx } from "@/lib/sound";

type Coupons = Extract<Puzzle, { kind: "coupons" }>;

/** A ration card: read the shop's board and cut out the right coupons, and only those. */
export function CouponsPuzzle({ puzzle, onSolved }: { puzzle: Coupons; onSolved: () => void }) {
  const [cut, setCut] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const need = puzzle.coupons.filter((c) => c.ok).length;

  const tap = (c: Coupons["coupons"][number]) => {
    if (cut.includes(c.id)) return;
    if (!c.ok) {
      sfx.reject();
      setNote(`Bon ${c.label}: ${c.why ?? "die hoort er niet bij."}`);
      return;
    }
    sfx.paper();
    const next = [...cut, c.id];
    setCut(next);
    setNote("");
    if (next.length === need) onSolved();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 border-[3px] border-double border-parchment/60 bg-[#101418] px-4 py-3 text-center">
        {puzzle.board.map((line, i) => (
          <span key={line} className={i === 0 ? "label text-[10.5px] text-bone" : "font-type text-[16px] leading-snug"}>
            {line}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-2 bg-[#d9cfb4] p-3 text-ink shadow-[0_10px_24px_rgba(0,0,0,.45)]">
        <span className="label text-[10px] text-[#5c5a52]">Bonkaart · 1945 (illustratie)</span>
        <div className="grid grid-cols-4 gap-1.5">
          {puzzle.coupons.map((c) => {
            const gone = cut.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => tap(c)}
                aria-label={gone ? `Bon ${c.label}, uitgeknipt` : `Bon ${c.label}`}
                className={`flex h-14 items-center justify-center font-type text-[17px] transition-all ${gone ? "border border-dashed border-ink/40 bg-transparent text-ink/30 line-through" : "border border-ink/50 bg-[#efe6cd] active:scale-95"}`}
                style={gone ? undefined : { outline: "1px dashed rgba(29,33,36,.35)", outlineOffset: "-5px" }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>
      <span className="min-h-5 font-news text-[14px] italic text-[#f0b5aa]" aria-live="polite">
        {note || (cut.length > 0 && cut.length < need ? `Nog ${need - cut.length} bon te knippen.` : "")}
      </span>
    </div>
  );
}

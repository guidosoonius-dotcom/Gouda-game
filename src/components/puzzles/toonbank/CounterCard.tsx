"use client";

import type { Customer } from "@/game/toonbank";

import { TS } from "./ts";

/** The customer's ration card on the counter: tap a coupon to cut it out. */
export function CounterCard({ customer, cut, onCut }: { customer: Customer; cut: number[]; onCut: (i: number) => void }) {
  return (
    <div
      className="flex -rotate-1 flex-col gap-2 p-3 text-ink shadow-[0_10px_22px_rgba(0,0,0,.55)]"
      style={{ background: "#e6dcc4 url(/img/markt/card.webp) center/cover" }}
    >
      <div className="flex items-baseline justify-between">
        <span className={`label ${TS[11]} text-[#4f4b42]`}>Bonkaart · brood en vet</span>
        <span className={`font-label ${TS[12]} text-[#4f4b42]`}>{customer.mouths === 1 ? "1 persoon" : `${customer.mouths} personen`}</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {customer.coupons.map((c, i) => {
          const gone = cut.includes(i);
          return (
            <button
              key={i}
              type="button"
              disabled={gone}
              onClick={() => onCut(i)}
              aria-label={gone ? `Bon ${c.label}, uitgeknipt` : `Bon ${c.label}`}
              className={`flex h-12 items-center justify-center font-type ${TS[17]} transition-transform ${gone ? "bg-[#3a2a1c]/80 text-ochre" : "border border-dashed border-[#8d8577] bg-[#efe6cd]/90 active:scale-95"}`}
            >
              {gone ? <span className={TS[12]}>geknipt</span> : c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Two ways out of a moment at the counter (the expired coupon, the man in a hurry). */
export function CounterChoice({ options }: { options: { title: string; sub: string; onPick: () => void; strong?: boolean }[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {options.map((o) => (
        <button
          key={o.title}
          type="button"
          onClick={o.onPick}
          className={`flex min-h-14 flex-col items-start justify-center gap-0.5 border-[1.5px] bg-dusk/80 px-4 py-2 text-left ${o.strong ? "border-ochre" : "border-ash"}`}
        >
          <span className={`label ${TS[13]} ${o.strong ? "text-ochre" : "text-bone"}`}>{o.title}</span>
          <span className={`font-news ${TS[14]} text-[#d8cdb8]`}>{o.sub}</span>
        </button>
      ))}
    </div>
  );
}

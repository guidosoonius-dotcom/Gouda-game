"use client";

import { monthGrid, type Tool } from "@/game/bureau";
import { ADDRESSES, RULE_FACT } from "@/data/bureau";
import { FactText } from "@/components/ui/Fact";

const NAMES: Record<Tool, string> = { regels: "Regels van 1937", kalender: "Kalender", adresboek: "Adresboek" };
const WEEK = ["ma", "di", "wo", "do", "vr", "za", "zo"];

/** What lies on the messenger's desk: the rules, a calendar of June 1940 and the address book. */
export function BureauTools({ tools, open, onOpen, fresh }: { tools: Tool[]; open: Tool | null; onOpen: (t: Tool | null) => void; fresh?: Tool }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1.5">
        {tools.map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={open === t}
            onClick={() => onOpen(open === t ? null : t)}
            className={`relative min-h-11 flex-1 border px-2 font-label text-[12.5px] font-bold tracking-[0.08em] ${open === t ? "border-ochre bg-rule text-parchment" : "border-rule bg-slate text-parchment"}`}
          >
            {NAMES[t].toUpperCase()}
            {fresh === t && <span className="absolute -right-1 -top-2 bg-ochre px-1 text-[9.5px] text-slate">NIEUW</span>}
          </button>
        ))}
      </div>
      {open === "regels" && (
        <div className="flex flex-col gap-1.5 border border-rule bg-slate px-3.5 py-3 font-news text-[14.5px] leading-snug">
          <span className="font-label text-[11px] font-bold tracking-[0.15em] text-ochre">WAT DE STAD MOEST, EN WAT NIET</span>
          <span>
            <FactText id={RULE_FACT} dark />
          </span>
          <span className="text-[13.5px] italic text-bone">Spelregel: een bevel dat rechtstreeks helpt bij het oorlog voeren, of dat zelf niet klopt, mag terug.</span>
        </div>
      )}
      {open === "kalender" && (
        <div className="border border-rule bg-slate px-3 py-2.5">
          <span className="font-label text-[11px] font-bold tracking-[0.15em] text-ochre">JUNI 1940</span>
          <div className="mt-1.5 grid grid-cols-7 gap-0.5 text-center font-label text-[12.5px]">
            {WEEK.map((w) => (
              <span key={w} className="text-ash">{w}</span>
            ))}
            {monthGrid(1940, 6).map((d, i) => (
              <span key={i} className={`py-0.5 ${d && d >= 3 && d <= 7 ? "bg-ochre text-slate" : "text-parchment"}`}>
                {d ?? ""}
              </span>
            ))}
          </div>
        </div>
      )}
      {open === "adresboek" && (
        <div className="flex flex-col gap-1 border border-rule bg-paper px-3.5 py-3 font-type text-[13px] text-ink">
          <span className="font-label text-[11px] font-bold tracking-[0.15em] text-wax-dark">ADRESBOEK DER GEMEENTE GOUDA</span>
          {ADDRESSES.map(([who, where]) => (
            <span key={who} className="flex justify-between gap-2 border-b border-dashed border-[#b8ae98] py-0.5">
              <span>{who}</span>
              <span>{where}</span>
            </span>
          ))}
          <span className="pt-1 font-label text-[11px] text-[#5b5f62]">De mensen zijn verzonnen, de straten zijn echt.</span>
        </div>
      )}
    </div>
  );
}

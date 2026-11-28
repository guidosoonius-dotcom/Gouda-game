"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { DISPUTES, type DisputeId } from "@/data/disputes";
import { FactBlock, FactLegend } from "@/components/ui/Fact";
import { sfx } from "@/lib/sound";

function Quote() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h7M4 12h7M4 17h7M14 9l6-3v12l-6-3z" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/** The sources side by side, without choosing, and what is settled. */
function DisputeSheet({ id, onClose }: { id: DisputeId; onClose: () => void }) {
  const d = DISPUTES[id];
  return (
    <motion.div className="fixed inset-0 z-40 flex justify-center bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-label="Bronnen verschillen"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="mt-auto flex max-h-[90%] w-full max-w-[430px] flex-col gap-3.5 overflow-y-auto bg-paper px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-5 text-ink shadow-[0_-20px_60px_rgba(0,0,0,.7)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="label text-[length:calc(11px*var(--ts,1))] tracking-[0.16em] text-wax-dark">Bronnen verschillen</span>
            <h2 className="m-0 font-fell text-[length:calc(26px*var(--ts,1))] font-normal leading-[1.1]">{d.question}</h2>
          </div>
          <button type="button" onClick={onClose} className="label h-11 flex-none px-1 text-[length:calc(11px*var(--ts,1))] text-wax-dark">
            Sluit
          </button>
        </div>
        <p className="m-0 font-news text-[length:calc(15px*var(--ts,1))] leading-snug">{d.intro}</p>
        <ul className="m-0 flex list-none flex-col p-0">
          {d.voices.map((v) => (
            <li key={v.year + v.who} className="grid grid-cols-[64px_minmax(0,1fr)] gap-2.5 border-t border-ink/20 py-2.5">
              <span className="font-type text-[length:calc(15px*var(--ts,1))] text-wax-dark">{v.year}</span>
              <span className="flex flex-col gap-0.5">
                <span className="font-label text-[length:calc(12px*var(--ts,1))] font-bold tracking-[0.06em]">{v.who}</span>
                <span className="font-news text-[length:calc(14.5px*var(--ts,1))] leading-snug">{v.says}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-1 bg-ink px-3.5 py-3 text-parchment">
          <span className="label text-[length:calc(11px*var(--ts,1))] text-ochre">Wat wel vaststaat</span>
          <p className="m-0 font-news text-[length:calc(14.5px*var(--ts,1))] leading-snug">
            <FactBlock ids={[...d.settled]} dark />
          </p>
        </div>
        <FactLegend ids={[...d.settled]} />
      </motion.section>
    </motion.div>
  );
}

/** A dashed button that opens where sources disagree. `light` for paper backgrounds. */
export function DisputeButton({ id, light = false }: { id: DisputeId; light?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => (sfx.paper(), setOpen(true))}
        className={`flex min-h-[52px] items-center gap-2.5 border-[1.5px] border-dashed px-3 py-2 text-left ${light ? "border-[#55534d] text-ink" : "border-bone text-parchment"}`}
      >
        <span className={light ? "text-wax-dark" : "text-ochre"}>
          <Quote />
        </span>
        <span className="flex flex-1 flex-col gap-0.5">
          <span className={`label text-[length:calc(11px*var(--ts,1))] tracking-[0.14em] ${light ? "text-wax-dark" : "text-ochre"}`}>Bronnen verschillen</span>
          <span className="font-news text-[length:calc(14.5px*var(--ts,1))] leading-snug">{DISPUTES[id].question}</span>
        </span>
      </button>
      <AnimatePresence>{open && <DisputeSheet id={id} onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}

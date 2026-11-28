"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { SPOREN, sporenByPlace } from "@/data/sporen";
import { Arrow, Eye } from "@/components/ui/icons";
import { sfx } from "@/lib/sound";
import { useGameStore } from "@/store/useGameStore";
import { SpoorDetail } from "./SpoorDetail";

/** The list of traces, grouped by place; `initial` opens one straight away (from a newspaper). */
export function SporenSheet({ onClose, initial = null }: { onClose: () => void; initial?: string | null }) {
  const seen = useGameStore((s) => s.seen);
  const [open, setOpen] = useState<string | null>(initial);
  const spoor = SPOREN.find((s) => s.id === open);

  return (
    <motion.div className="absolute inset-0 z-20 flex flex-col justify-end bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-label="Sporen"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="flex max-h-[90%] flex-col bg-[#15191d] text-parchment shadow-[0_-20px_60px_rgba(0,0,0,.7)]"
      >
        <header className="flex items-end justify-between border-b border-rule px-5 pb-3 pt-5">
          <div className="flex flex-col gap-1">
            <span className="label text-[length:calc(11px*var(--ts,1))] text-bone">Wat je nog kunt zien</span>
            <h2 className="m-0 font-fell text-[length:calc(30px*var(--ts,1))] font-normal leading-none">Sporen</h2>
          </div>
          <button type="button" onClick={onClose} className="label h-11 px-1 text-[length:calc(11px*var(--ts,1))] text-ochre">
            Sluit
          </button>
        </header>
        <div className="flex flex-col gap-4 overflow-y-auto px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-4">
          {spoor ? (
            <SpoorDetail spoor={spoor} onBack={() => setOpen(null)} />
          ) : (
            <>
              <p className="m-0 font-news text-[length:calc(15.5px*var(--ts,1))] italic leading-snug text-bone">
                Plekken in het centrum waar de oorlog nog te zien is. Geen punten en geen tijd: kijk, en vink af wat je hebt gezien.
              </p>
              {sporenByPlace().map((g) => (
                <section key={g.place} className="flex flex-col gap-1.5">
                  <h3 className="label m-0 text-[length:calc(11px*var(--ts,1))] tracking-[0.14em] text-ash">{g.place}</h3>
                  <ul className="m-0 flex list-none flex-col gap-2 p-0">
                    {g.items.map((s) => (
                      <li key={s.id}>
                        <button type="button" onClick={() => (sfx.paper(), setOpen(s.id))} className="flex min-h-[64px] w-full items-center gap-3 bg-parchment px-3.5 py-2.5 text-left text-ink">
                          <span className="flex flex-1 flex-col gap-1">
                            <span className="flex flex-wrap items-center gap-2 font-label text-[length:calc(11px*var(--ts,1))] font-bold tracking-[0.16em] text-wax">
                              <span>
                                HOOFDSTUK {s.chapter}
                                {seen.includes(s.id) ? " · GEZIEN" : ""}
                              </span>
                              {s.dispute && <span className="border border-wax-dark px-1 tracking-[0.1em] text-wax-dark">BRONNEN VERSCHILLEN</span>}
                            </span>
                            <span className="font-news text-[length:calc(16px*var(--ts,1))] font-semibold leading-tight">{s.title}</span>
                            <span className="font-news text-[length:calc(13.5px*var(--ts,1))] italic leading-snug text-[#55534d]">{s.where}</span>
                          </span>
                          <Arrow color="#9e2a2b" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </>
          )}
        </div>
      </motion.section>
    </motion.div>
  );
}

/** The map button: an eye with the number of traces seen. */
export function SporenButton({ onPress }: { onPress: () => void }) {
  const seen = useGameStore((s) => s.seen.length);
  return (
    <button
      type="button"
      aria-label={`Sporen, ${seen} van ${SPOREN.length} gezien`}
      onClick={onPress}
      className="relative flex h-[46px] w-[46px] items-center justify-center border border-[#3a434b] bg-night/70"
    >
      <Eye color="#ede6d6" />
      <span className="absolute -right-1.5 -top-1.5 h-[18px] min-w-[18px] bg-ochre px-0.5 text-center font-label text-[length:calc(11px*var(--ts,1))] font-bold leading-[calc(18px*var(--ts,1))] text-slate">
        {seen}/{SPOREN.length}
      </span>
    </button>
  );
}

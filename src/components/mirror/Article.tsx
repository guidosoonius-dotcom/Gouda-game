"use client";

import { AnimatePresence, motion } from "motion/react";
import { FACTS, type FactId } from "@/data/sources";
import type { Article } from "@/data/newspapers";
import { sfx } from "@/lib/sound";

/** A fact in the newspaper. Tap it for the source; an unverified one is underlined in pencil. */
function PenFact({ id, onPick }: { id: FactId; onPick: (id: FactId) => void }) {
  const fact = FACTS[id];
  return (
    <button type="button" onClick={() => (sfx.paper(), onPick(id))} className="m-0 block w-full p-0 text-left">
      <span className={fact.verified ? "" : "underline decoration-[#6e6c66] decoration-dotted decoration-[1.5px] underline-offset-[3px]"}>{fact.claim}</span>
      {!fact.verified && <sup className="ml-0.5 font-label text-[length:calc(11px*var(--ts,1))] font-bold">?</sup>}
    </button>
  );
}

/** One article: headline in stencil letters, an optional drawing, then facts and plain lines. */
export function ArticleView({ article, lead = false, onPick }: { article: Article; lead?: boolean; onPick: (id: FactId) => void }) {
  const size = lead ? "text-[length:calc(15.5px*var(--ts,1))] leading-[1.6]" : "text-[length:calc(14px*var(--ts,1))] leading-[1.55]";
  return (
    <article className="flex flex-col gap-2.5">
      {lead && <span className="text-[length:calc(11.5px*var(--ts,1))] tracking-[0.14em]">WAT ECHT GEBEURDE</span>}
      <h2 className={`m-0 font-stamp font-bold uppercase ${lead ? "text-[length:calc(31px*var(--ts,1))] leading-[1.02]" : "text-[length:calc(20px*var(--ts,1))] leading-[1.05]"}`}>
        {article.headline}
      </h2>
      {article.deck && <p className="m-0 border-y border-[#1c1c1a] py-1.5 text-[length:calc(14px*var(--ts,1))] leading-[1.45]">{article.deck}</p>}
      {article.drawing && (
        <figure className="m-0 flex flex-col gap-1">
          <img src={article.drawing.src} alt={article.drawing.alt} className="block h-auto w-full mix-blend-multiply" />
          <figcaption className="text-[length:calc(11.5px*var(--ts,1))] text-[#3a3935]">TEKENING · zo kan het eruit hebben gezien. Geen foto.</figcaption>
        </figure>
      )}
      {article.paras.map((p, i) =>
        typeof p === "string" ? (
          <div key={p} className={size}>
            <PenFact id={p} onPick={onPick} />
          </div>
        ) : (
          <p key={i} className={`m-0 ${size}`}>
            {p.say}
          </p>
        ),
      )}
    </article>
  );
}

/** Where a fact comes from, and what is still being checked. */
export function SourceSheet({ id, onClose }: { id: FactId | null; onClose: () => void }) {
  const fact = id ? FACTS[id] : null;
  return (
    <AnimatePresence>
      {fact && (
        <motion.div className="absolute inset-0 z-30 flex flex-col justify-end bg-black/55" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label="Waar dit vandaan komt"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="flex max-h-[80%] flex-col gap-3 overflow-y-auto bg-paper px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-4 text-ink shadow-[0_-20px_60px_rgba(0,0,0,.6)]"
          >
            <div className="flex items-center justify-between">
              <span className="label text-[length:calc(11px*var(--ts,1))] tracking-[0.16em] text-wax-dark">{fact.verified ? "Gecontroleerd" : "Nog niet gecontroleerd"}</span>
              <button type="button" onClick={onClose} className="label h-11 px-1 text-[length:calc(11px*var(--ts,1))] text-wax-dark">
                Sluit
              </button>
            </div>
            <p className="m-0 font-news text-[length:calc(16px*var(--ts,1))] leading-[1.45]">{fact.claim}</p>
            <div className="flex flex-col gap-1 border-t border-ink/20 pt-2.5">
              <span className="label text-[length:calc(11px*var(--ts,1))] tracking-[0.12em] text-[#55534d]">Waar het vandaan komt</span>
              <span className="font-news text-[length:calc(14.5px*var(--ts,1))] leading-snug">{fact.source}</span>
            </div>
            {!fact.verified && "todo" in fact && fact.todo && (
              <div className="flex flex-col gap-1">
                <span className="label text-[length:calc(11px*var(--ts,1))] tracking-[0.12em] text-[#55534d]">Wat nog wordt uitgezocht</span>
                <span className="font-news text-[length:calc(14.5px*var(--ts,1))] italic leading-snug">{fact.todo}</span>
              </div>
            )}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

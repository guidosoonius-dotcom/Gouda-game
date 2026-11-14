"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useGameStore } from "@/store/useGameStore";
import { satchelItems, type SatchelItem } from "@/data/satchel";
import { CHOICES } from "@/game/choices";
import { decodeSave, encodeSave } from "@/game/save";
import { sfx } from "@/lib/sound";
import { Arrow, Speaker } from "@/components/ui/icons";

const KIND_LABEL: Record<SatchelItem["kind"], string> = { krant: "KRANT", voorwerp: "VOORWERP", bron: "BRON" };

function Item({ item, onRead }: { item: SatchelItem; onRead?: () => void }) {
  const body = (
    <>
      <span className="flex items-center justify-between">
        <span className="label text-[9.5px] tracking-[0.18em] text-wax">{KIND_LABEL[item.kind]}</span>
        {item.fiction && (
          <span className="border border-wax px-1 font-stamp text-[9px] tracking-[0.14em] text-wax">FICTIE</span>
        )}
      </span>
      <span className="font-news text-[16px] font-semibold leading-tight">{item.title}</span>
      <span className="font-news text-[13.5px] italic leading-snug text-[#55534d]">{item.note}</span>
    </>
  );
  if (!onRead) return <li className="flex flex-col gap-1 bg-parchment px-3.5 py-3 text-ink">{body}</li>;
  return (
    <li>
      <button type="button" onClick={onRead} className="flex w-full items-center gap-3 bg-parchment px-3.5 py-3 text-left text-ink">
        <span className="flex flex-1 flex-col gap-1">{body}</span>
        <Arrow color="#9e2a2b" />
      </button>
    </li>
  );
}

export function SatchelSheet({ onClose }: { onClose: () => void }) {
  const { completed, flags, muted, letter, toggleMute, rereadMirror, restore, reset } = useGameStore();
  const items = satchelItems(completed, flags);
  const made = CHOICES.filter((c) => flags[c.id]);
  const code = encodeSave({ completed, flags });
  const [entry, setEntry] = useState("");
  const [error, setError] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const tryRestore = () => {
    const p = decodeSave(entry);
    if (!p) return setError(true);
    sfx.stamp();
    restore(p);
    onClose();
  };

  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col justify-end bg-black/60"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-label="Koerierstas"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="flex max-h-[86%] flex-col bg-[#15191d] text-parchment shadow-[0_-20px_60px_rgba(0,0,0,.7)]"
      >
        <header className="flex items-end justify-between border-b border-rule px-5 pb-3 pt-5">
          <div className="flex flex-col gap-1">
            <span className="label text-[10.5px] text-bone">Wat je bij je draagt</span>
            <h2 className="m-0 font-fell text-[30px] font-normal leading-none">Koerierstas</h2>
          </div>
          <button type="button" onClick={onClose} className="label h-11 px-1 text-[11px] text-ochre">
            Sluit
          </button>
        </header>

        <div className="flex flex-col gap-6 overflow-y-auto px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-4">
          {items.length === 0 ? (
            <p className="m-0 font-news text-[16px] italic leading-relaxed text-bone">
              Nog leeg. Wat je onderweg krijgt, bewaar je hier: kranten, bronnen en wat mensen je toevertrouwen.
            </p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {items.map((it) => (
                <Item
                  key={it.id}
                  item={it}
                  onRead={it.mirrorOf ? () => (sfx.paper(), rereadMirror(it.mirrorOf!)) : undefined}
                />
              ))}
            </ul>
          )}

          {made.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="label text-[10.5px] text-bone">Jouw keuzes</span>
              {made.map((c) => {
                const opt = flags[c.id] === c.A.value ? c.A : c.B;
                return (
                  <p key={c.id} className="m-0 border-l-2 border-ochre pl-3 font-news text-[15px] leading-snug">
                    <span className="text-ash">Hoofdstuk {c.chapter}: </span>
                    {opt.title}
                  </p>
                );
              })}
            </div>
          )}

          {letter && (
            <div className="flex flex-col gap-2">
              <span className="label text-[10.5px] text-bone">Jouw brief aan later</span>
              <p className="m-0 whitespace-pre-wrap bg-parchment px-3.5 py-3 font-type text-[14px] leading-[1.55] text-ink">{letter}</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <span className="label text-[10.5px] text-bone">Herstelcode</span>
            <p className="m-0 font-news text-[14px] leading-snug text-ash">
              Schrijf deze code op. Daarmee haal je je voortgang terug op elk toestel.
            </p>
            <span className="select-text font-type text-[22px] tracking-[0.12em] text-ochre">{code}</span>
            <div className="flex gap-2">
              <label className="sr-only" htmlFor="restore-code">
                Voer een herstelcode in
              </label>
              <input
                id="restore-code"
                value={entry}
                onChange={(e) => (setEntry(e.target.value), setError(false))}
                placeholder="KG-…"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                className="h-11 min-w-0 flex-1 select-text border border-rule bg-transparent px-3 font-type text-[16px] uppercase text-parchment placeholder:text-ash-dim"
              />
              <button type="button" onClick={tryRestore} className="label h-11 border border-parchment/40 px-4 text-[11px]">
                Herstel
              </button>
            </div>
            {error && <span className="font-news text-[14px] italic text-[#f0b5aa]">Deze code klopt niet. Kijk de tekens nog eens na.</span>}
          </div>

          <div className="flex items-center justify-between border-t border-rule pt-4">
            <button type="button" onClick={toggleMute} className="label flex h-11 items-center gap-2.5 text-[11px]">
              <Speaker off={muted} color="#ede6d6" />
              Geluid {muted ? "uit" : "aan"}
            </button>
            {confirmReset ? (
              <button type="button" onClick={() => (reset(), onClose())} className="label h-11 border border-alarm px-3 text-[11px] text-[#f0b5aa]">
                Zeker weten: wis alles
              </button>
            ) : (
              <button type="button" onClick={() => setConfirmReset(true)} className="label h-11 text-[11px] text-ash">
                Begin opnieuw
              </button>
            )}
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}

"use client";

import { motion } from "motion/react";
import { useGameStore, type Settings } from "@/store/useGameStore";
import { TextSize } from "./TextSize";

const t = (px: number) => `text-[length:calc(${px}px*var(--ts,1))]`;

function Switch({ label, note, on, onChange }: { label: string; note: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex min-h-12 w-full items-start justify-between gap-4 py-1 text-left">
      <span className="flex flex-col gap-0.5">
        <span className="font-news text-[length:calc(16px*var(--ts,1))] leading-tight">{label}</span>
        <span className="font-news text-[length:calc(13.5px*var(--ts,1))] leading-snug text-ash">{note}</span>
      </span>
      <span aria-hidden="true" className={`mt-0.5 flex h-7 w-12 flex-none items-center border p-0.5 transition-colors ${on ? "justify-end border-ochre bg-ochre" : "justify-start border-parchment/40"}`}>
        <span className={`h-5 w-5 ${on ? "bg-slate" : "bg-parchment/60"}`} />
      </span>
    </button>
  );
}

/**
 * Every setting in one place, reachable from the title screen, the satchel and the pause menu:
 * text size, sound, motion, and two ways to make the minigames easier to play.
 */
export function SettingsSheet({ onClose }: { onClose: () => void }) {
  const settings = useGameStore((s) => s.settings);
  const set = useGameStore((s) => s.setSetting);
  const muted = useGameStore((s) => s.muted);
  const toggleMute = useGameStore((s) => s.toggleMute);
  const flip = (key: keyof Settings) => (v: boolean) => set(key, v);

  return (
    <motion.div
      className="absolute inset-0 z-40 flex flex-col justify-end bg-black/60"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => (e.stopPropagation(), onClose())}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-label="Instellingen"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="flex max-h-[90%] flex-col bg-[#15191d] text-parchment shadow-[0_-20px_60px_rgba(0,0,0,.7)]"
      >
        <header className="flex items-end justify-between border-b border-rule px-5 pb-3 pt-5">
          <h2 className={`m-0 font-fell ${t(30)} font-normal leading-none`}>Instellingen</h2>
          <button type="button" autoFocus onClick={onClose} className={`label h-11 px-1 ${t(11)} text-ochre`}>
            Sluit
          </button>
        </header>
        <div className="flex flex-col gap-5 overflow-y-auto px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-4">
          <section className="flex flex-col gap-2">
            <span className={`label ${t(11)} text-bone`}>Lezen</span>
            <TextSize />
            <span className={`font-news ${t(13.5)} text-ash`}>Knijpen om te zoomen werkt ook, behalve in de 3D-scènes.</span>
          </section>
          <section className="flex flex-col gap-1 border-t border-rule pt-4">
            <span className={`label ${t(11)} text-bone`}>Geluid</span>
            <Switch label="Geluid" note="Alle geluid van het spel." on={!muted} onChange={toggleMute} />
            <Switch label="Achtergrondgeluid" note="Water, wind en verre geluiden. Effecten blijven aan." on={settings.ambience} onChange={flip("ambience")} />
          </section>
          <section className="flex flex-col gap-1 border-t border-rule pt-4">
            <span className={`label ${t(11)} text-bone`}>Beweging</span>
            <Switch label="Minder beweging" note="Geen bewegende beelden, schuddende camera of typmachine-tekst. Staat je telefoon al op minder beweging, dan volgt het spel die." on={settings.still} onChange={flip("still")} />
          </section>
          <section className="flex flex-col gap-1 border-t border-rule pt-4">
            <span className={`label ${t(11)} text-bone`}>Spelen</span>
            <Switch label="Hulpmodus" note="Meer tijd, tragere zoeklichten, ruimere sprongen en minder bommen. Het verhaal blijft hetzelfde." on={settings.assist} onChange={flip("assist")} />
            <Switch label="Eén knop voor stil liggen en remmen" note="Een knop Stil of Rem, in plaats van twee duimen tegelijk vasthouden." on={settings.oneButton} onChange={flip("oneButton")} />
          </section>
        </div>
      </motion.section>
    </motion.div>
  );
}

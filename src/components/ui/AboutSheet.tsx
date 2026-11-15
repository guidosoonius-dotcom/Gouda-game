"use client";

import { motion } from "motion/react";

/** Who made what, and what is real and what is not. Reached from the satchel and the title screen. */
const BLOCKS: { title: string; lines: string[] }[] = [
  {
    title: "Wat echt is en wat verzonnen",
    lines: [
      "De koerier, Kees, Marie, Jaap en de mensen die je tegenkomt zijn verzonnen. De plaatsen en gebeurtenissen waar ze doorheen lopen zijn echt, maar nog niet allemaal nagetrokken door een historicus. Wat nog niet gecontroleerd is, laat dit spel weg.",
      "Waar later een echte foto uit het archief komt, staat nu een leeg kader. Er staan geen nagemaakte archieffoto’s in.",
    ],
  },
  {
    title: "De kaart",
    lines: [
      "De kaart op het beginscherm is een plattegrond van Gouda door J. Blaeu, 1649, publiek domein. Dat is niet de stad van 1940: sindsdien is er veel gebouwd en gesloopt. De plek van de vijf adressen op de kaart is met de hand bepaald.",
    ],
  },
  {
    title: "Beelden en 3D",
    lines: [
      "De luchten, de achtergronden en het wegdek zijn met AI gemaakt (Higgsfield) en zijn geen foto’s. De huizen, boten en rekwisieten zijn in Blender gebouwd; de personages zijn uit getekende ontwerpbladen opgebouwd en geanimeerd, naar niemand echts.",
      "De Waag en De Zalm op de achtergrond van Over de daken zijn getekend naar foto’s van nu, niet naar hoe ze er in 1942 uitzagen.",
    ],
  },
  {
    title: "Lettertypen",
    lines: ["IM Fell DW Pica, Newsreader, Archivo Narrow, Special Elite en Stardos Stencil, via Fontsource."],
  },
  {
    title: "Jouw gegevens",
    lines: [
      "Je voortgang en je brief staan alleen op dit toestel. Je locatie wordt alleen gebruikt op de kaart en tijdens een hoofdstuk om te zien hoe ver je bent en of je loopt; er wordt niets verstuurd.",
    ],
  },
];

export function AboutSheet({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col justify-end bg-black/60"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => (e.stopPropagation(), onClose())}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-label="Over dit spel"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="flex max-h-[86%] flex-col bg-[#15191d] text-parchment shadow-[0_-20px_60px_rgba(0,0,0,.7)]"
      >
        <header className="flex items-end justify-between border-b border-rule px-5 pb-3 pt-5">
          <div className="flex flex-col gap-1">
            <span className="label text-[10.5px] text-bone">Koerier aan de Gouwe</span>
            <h2 className="m-0 font-fell text-[30px] font-normal leading-none">Over dit spel</h2>
          </div>
          <button type="button" onClick={onClose} className="label h-11 px-1 text-[11px] text-ochre">
            Sluit
          </button>
        </header>
        <div className="flex flex-col gap-5 overflow-y-auto px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-4">
          {BLOCKS.map((b) => (
            <div key={b.title} className="flex flex-col gap-1.5">
              <span className="label text-[10.5px] text-bone">{b.title}</span>
              {b.lines.map((l) => (
                <p key={l} className="m-0 font-news text-[15px] leading-[1.5] text-[#d8d0be]">
                  {l}
                </p>
              ))}
            </div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}

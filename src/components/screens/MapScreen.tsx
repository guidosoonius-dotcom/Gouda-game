"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { chapterById } from "@/data/chapters";
import { currentChapterId, useGameStore, type Mode } from "@/store/useGameStore";
import { useDistance } from "@/lib/geo";
import { sfx, unlockAudio } from "@/lib/sound";
import { BlaeuMap } from "@/components/map/BlaeuMap";
import { ChapterCard, type CardAction } from "@/components/map/ChapterCard";
import { SatchelSheet } from "@/components/map/SatchelSheet";
import { Satchel } from "@/components/ui/icons";
import { satchelItems } from "@/data/satchel";

function ModeTab({ mode, label }: { mode: Mode; label: string }) {
  const active = useGameStore((s) => s.mode === mode);
  const setMode = useGameStore((s) => s.setMode);
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => setMode(mode)}
      className={`-my-2 py-2 font-label text-[12px] tracking-[0.14em] ${active ? "font-bold text-parchment" : "font-semibold text-ash"}`}
    >
      <span className={`block border-b-2 pb-1.5 ${active ? "border-ochre" : "border-transparent"}`}>{label}</span>
    </button>
  );
}

function Timeline({ at, year }: { at: number; year: string }) {
  return (
    <div className="absolute inset-x-5 bottom-3 h-[34px]" role="img" aria-label={`Tijdlijn: ${year}`}>
      <div className="absolute inset-x-0 top-2.5 h-px bg-[#4a535b]" />
      <div
        className="absolute inset-x-0 top-1 h-[7px]"
        style={{ background: "repeating-linear-gradient(90deg, #4a535b 0 1px, transparent 1px calc(100% / 30))" }}
      />
      <div className="absolute inset-x-0 top-4 flex justify-between font-label text-[10px] font-semibold tracking-[0.1em] text-ash-dim">
        {[1940, 1941, 1942, 1943, 1944, 1945].map((y) => (
          <span key={y} className={year.endsWith(String(y)) ? "text-parchment" : ""}>
            {y}
          </span>
        ))}
      </div>
      <div
        className="absolute top-0 h-3.5 w-0.5 bg-ochre transition-[left] duration-[1500ms] ease-out"
        style={{ left: `${at * 100}%` }}
      />
    </div>
  );
}

export function MapScreen() {
  const { mode, completed, flags, openChapter, openTask, rereadMirror } = useGameStore();
  const current = currentChapterId(completed);
  const [selectedId, setSelectedId] = useState(current);
  const [satchelOpen, setSatchelOpen] = useState(false);
  const [measuring, setMeasuring] = useState(false);
  const selected = chapterById(selectedId);
  const location = mode === "location";
  const geo = useDistance(selected.coords, location && measuring);
  const items = satchelItems(completed, flags);
  const done = completed.includes(selected.id);
  const state = done ? "done" : selected.id === current ? "open" : "sealed";

  const press = (fn: () => void) => () => {
    unlockAudio();
    sfx.paper();
    fn();
  };

  let primary: CardAction;
  let secondary: CardAction | undefined;
  if (done) {
    primary = { label: "Herlees de krant", onPress: press(() => rereadMirror(selected.id)) };
    secondary = { label: "Speel dit hoofdstuk opnieuw", onPress: press(() => openChapter(selected.id)) };
  } else if (selected.status === "playable" && selected.id === current) {
    primary = { label: location ? "Ik ben er · open het dossier" : "Open het dossier", onPress: press(() => openChapter(selected.id)) };
  } else if (selected.status === "prototype") {
    primary = { label: "Proefvaart · speel het prototype", onPress: press(() => openTask(selected.id)) };
  } else if (selected.status === "soon") {
    primary = { label: "Nog in de maak", onPress: () => {}, disabled: true };
  } else {
    primary = { label: "Nog verzegeld", onPress: () => {}, disabled: true };
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-night text-parchment">
      <div className="relative min-h-0 flex-1 overflow-hidden" style={{ containerType: "size" }}>
        <BlaeuMap
          selected={selected}
          current={current}
          completed={completed}
          onSelect={(id) => {
            sfx.paper();
            setSelectedId(id);
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 75% 55% at 50% 46%, rgba(10,13,17,0) 40%, rgba(10,13,17,.78) 100%)" }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-night from-20% to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-night from-15% to-transparent" />

        <header className="absolute inset-x-5 top-[max(46px,env(safe-area-inset-top))] flex items-start justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="font-fell text-[21px] italic leading-none">Koerier aan de Gouwe</span>
            <div className="mt-2 flex gap-[18px]">
              <ModeTab mode="location" label="OP LOCATIE" />
              <ModeTab mode="home" label="THUIS" />
            </div>
          </div>
          <button
            type="button"
            aria-label={`Koerierstas, ${items.length} stukken`}
            onClick={press(() => setSatchelOpen(true))}
            className="relative flex h-[46px] w-[46px] items-center justify-center border border-[#3a434b] bg-night/70"
          >
            <Satchel color="#ede6d6" />
            {items.length > 0 && (
              <span className="absolute -right-1.5 -top-1.5 h-[18px] min-w-[18px] bg-wax text-center font-label text-[11px] font-bold leading-[18px] text-[#f3d6c4]">
                {items.length}
              </span>
            )}
          </button>
        </header>

        <span className="absolute bottom-[52px] right-5 font-label text-[9px] font-medium tracking-[0.15em] text-ash-dim">
          KAART: J. BLAEU, 1649 · PUBLIEK DOMEIN
        </span>
        <Timeline at={selected.timeline} year={selected.date} />
      </div>

      <AnimatePresence mode="popLayout">
        <ChapterCard
          key={selected.id}
          chapter={selected}
          state={state}
          location={location}
          geo={geo}
          onMeasure={() => setMeasuring(true)}
          primary={primary}
          secondary={secondary}
        />
      </AnimatePresence>

      <AnimatePresence>{satchelOpen && <SatchelSheet onClose={() => setSatchelOpen(false)} />}</AnimatePresence>
    </div>
  );
}


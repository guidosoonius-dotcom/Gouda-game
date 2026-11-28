"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { chapterById } from "@/data/places";
import { hasPaper, legMetres, ROUTE, stopFacts, stopPictures } from "@/data/route";
import { spoorById } from "@/data/sporen";
import { formatMetres, useDistance } from "@/lib/geo";
import { sfx } from "@/lib/sound";
import { useGameStore } from "@/store/useGameStore";
import { FactLegend, FactText } from "@/components/ui/Fact";
import { Arrow, Back } from "@/components/ui/icons";
import { SporenSheet } from "@/components/map/SporenSheet";

/** One stop of the walk: the pictures, what really happened, the newspaper and the traces here. */
export function WalkStopScreen() {
  const { walkStop, openStop, readPaper, go } = useGameStore();
  const stop = ROUTE[Math.min(walkStop, ROUTE.length - 1)];
  const c = chapterById(stop.place);
  const pictures = stopPictures(stop.place);
  const facts = stopFacts(stop.place);
  const next = walkStop + 1 < ROUTE.length ? chapterById(ROUTE[walkStop + 1].place) : null;
  const leg = legMetres(walkStop);
  const [spoor, setSpoor] = useState<string | null>(null);
  const [measuring, setMeasuring] = useState(false);
  const geo = useDistance(c.coords, measuring);
  const where =
    geo.status === "ok" ? (geo.metres < 40 ? "Je bent er." : `Nog ${formatMetres(geo.metres)} lopen`) : geo.status === "asking" ? "Je plek wordt gemeten…" : geo.status === "denied" ? "Je plek is niet te bepalen." : "HOE VER IS HET?";

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-night text-parchment">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-5">
        <div className="relative flex-none">
          {pictures.length > 0 ? (
            <div className="flex snap-x snap-mandatory overflow-x-auto">
              {pictures.map((p) => (
                <figure key={p.src} className="m-0 w-full flex-none snap-start">
                  <img src={p.src} alt={p.alt} className="h-[300px] w-full object-cover" />
                  <figcaption className="px-5 pt-1.5 font-label text-[length:calc(11px*var(--ts,1))] tracking-wide text-ash">
                    {p.credit ?? "Illustratie bij het verhaal, geen foto"}
                    {pictures.length > 1 ? " · veeg voor meer" : ""}
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className="h-[150px] bg-gradient-to-b from-slate to-night" />
          )}
          <button
            type="button"
            aria-label="Terug naar de route"
            onClick={() => go("walk")}
            className="absolute left-4 top-[max(46px,env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center border border-parchment/35 bg-dusk/60"
          >
            <Back color="#ede6d6" />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-5">
          <div className="flex flex-col gap-1">
            <span className="label text-[length:calc(11px*var(--ts,1))] text-ochre">
              Stop {walkStop + 1} van {ROUTE.length} · {c.dateShort}
            </span>
            <h1 className="m-0 font-fell text-[length:calc(30px*var(--ts,1))] font-normal leading-[1.05]">{c.place}</h1>
            <span className="font-label text-[length:calc(12.5px*var(--ts,1))] tracking-wide text-bone">
              Waar je staat: {c.placeHint.charAt(0).toLowerCase() + c.placeHint.slice(1)}
            </span>
          </div>

          <button type="button" onClick={() => (sfx.paper(), setMeasuring(true))} className="h-11 self-start border border-rule px-3.5 font-label text-[length:calc(12px*var(--ts,1))] font-bold tracking-[0.12em]">
            {where}
          </button>

          <section className="flex flex-col gap-2.5">
            <span className="label text-[length:calc(11px*var(--ts,1))] text-bone">{c.memorial ? "Hier wordt herdacht" : "Wat hier echt gebeurde"}</span>
            {facts.map((id) => (
              <p key={id} className="m-0 font-news text-[length:calc(15.5px*var(--ts,1))] leading-relaxed">
                <FactText id={id} dark />
              </p>
            ))}
            <FactLegend ids={facts} dark />
          </section>

          {(hasPaper(stop.place) || stop.sporen.length > 0) && (
            <section className="flex flex-col gap-2">
              {hasPaper(stop.place) && (
                <button type="button" onClick={() => (sfx.paper(), readPaper(stop.place))} className="flex min-h-[56px] items-center gap-3 bg-parchment px-3.5 text-left text-ink">
                  <span className="flex flex-1 flex-col">
                    <span className="label text-[length:calc(11px*var(--ts,1))] text-wax">De Koerier</span>
                    <span className="font-news text-[length:calc(15.5px*var(--ts,1))] font-semibold">Lees de krant van deze plek</span>
                  </span>
                  <Arrow color="#9e2a2b" />
                </button>
              )}
              {stop.sporen.map((id) => (
                <button key={id} type="button" onClick={() => (sfx.paper(), setSpoor(id))} className="flex min-h-[56px] items-center gap-3 border border-ochre px-3.5 text-left">
                  <span className="flex flex-1 flex-col">
                    <span className="label text-[length:calc(11px*var(--ts,1))] text-ochre">Spoor · kijk om je heen</span>
                    <span className="font-news text-[length:calc(15.5px*var(--ts,1))] font-semibold">{spoorById(id)?.title}</span>
                  </span>
                  <Arrow color="#e2a93a" />
                </button>
              ))}
            </section>
          )}
        </div>
      </div>

      <div className="flex-none px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-2">
        <button
          type="button"
          onClick={() => (sfx.paper(), next ? openStop(walkStop + 1, ROUTE[walkStop + 1].place) : go("walk"))}
          className="flex min-h-[54px] w-full items-center justify-between gap-3 bg-ochre px-[18px] py-2 text-left font-label font-bold text-slate"
        >
          <span className="flex flex-col">
            <span className="text-[length:calc(14px*var(--ts,1))] tracking-[0.17em]">{next ? "VOLGENDE STOP" : "EINDE VAN DE WANDELING"}</span>
            {next && leg !== null && (
              <span className="text-[length:calc(12px*var(--ts,1))] font-semibold tracking-wide text-[#3a2e14]">
                {next.place} · ongeveer {formatMetres(leg)}
              </span>
            )}
          </span>
          <Arrow color="#14181d" />
        </button>
      </div>
      <AnimatePresence>{spoor && <SporenSheet initial={spoor} onClose={() => setSpoor(null)} />}</AnimatePresence>
    </div>
  );
}

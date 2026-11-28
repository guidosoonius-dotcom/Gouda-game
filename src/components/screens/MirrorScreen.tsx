"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { chapterById } from "@/data/places";
import { useGameStore } from "@/store/useGameStore";
import { sfx } from "@/lib/sound";
import { Arrow, Satchel } from "@/components/ui/icons";
import { PaperTexture } from "@/components/ui/Grain";
import { FactBlock, FactLegend } from "@/components/ui/Fact";
import { ArchivePlaceholder } from "@/components/ui/ArchivePlaceholder";
import { SHOW_UNVERIFIED } from "@/data/sources";
import { encodeSave } from "@/game/save";
import { SPOREN } from "@/data/sporen";
import { SpoorTeaser } from "@/components/map/SpoorTeaser";
import { SporenSheet } from "@/components/map/SporenSheet";

/** De Historische Spiegel: the player's fiction, stamped as fiction, next to what really happened. */
export function MirrorScreen() {
  const { chapter: chapterId, flags, rereading, completeChapter, completed } = useGameStore();
  const chapter = chapterById(chapterId);
  const mirror = chapter.mirror!;
  const story = mirror.story(flags);
  // a placeholder for a missing scan is a note for us, not for players: only in dev and preview builds
  const showScan = !!mirror.scan.image || SHOW_UNVERIFIED;
  const teasers = SPOREN.filter((s) => s.chapter === chapter.id && s.teaser);
  const [spoor, setSpoor] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => sfx.stamp(), 950);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-paper text-press">
      <PaperTexture id="newsprint" />
      <div className="relative flex h-full flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-4 pt-[max(44px,env(safe-area-inset-top))]">
        <div className="label flex justify-between text-[length:calc(11px*var(--ts,1))] tracking-[0.16em] text-[#3c3b37]">
          <span>{mirror.edition}</span>
          <span>Extra editie</span>
          <span>Lees · geef door</span>
        </div>
        <div className="border-b border-t-[3px] border-press pb-0.5 pt-1 text-center shadow-[0_3px_0_-2px_#1a1b1c]">
          <span className="font-fell text-[length:calc(58px*var(--ts,1))] leading-none tracking-[-0.5px]">De Koerier</span>
        </div>
        <div className="-mt-1 flex justify-between font-label text-[length:calc(11px*var(--ts,1))] font-semibold tracking-[0.15em] text-[#3c3b37]">
          <span>{mirror.dateline}</span>
          <span>DE HISTORISCHE SPIEGEL</span>
        </div>

        <section className="relative flex flex-col gap-1.5 pt-1">
          <span className="label text-[length:calc(11px*var(--ts,1))] text-wax">Jouw verhaal</span>
          <h1 className="anim-print m-0 pr-2 font-fell text-[length:calc(26px*var(--ts,1))] font-normal leading-[1.08]">{story.headline}</h1>
          <p className="m-0 text-[length:calc(15px*var(--ts,1))] leading-[1.5]">{story.body}</p>
          <span className="anim-slam absolute -right-1 -top-1.5 border-[2.5px] border-wax bg-paper/70 px-2.5 py-0.5 font-stamp text-[length:calc(17px*var(--ts,1))] tracking-[0.18em] text-wax">
            FICTIE
          </span>
        </section>

        <div className="h-px flex-none bg-press" />

        <section className="grid grid-cols-5 gap-3.5">
          <div className={`${showScan ? "col-span-3" : "col-span-5"} flex flex-col gap-1.5`}>
            <span className="label text-[length:calc(11px*var(--ts,1))]">Wat echt gebeurde</span>
            <h2 className="anim-print-late m-0 font-fell text-[length:calc(22px*var(--ts,1))] font-normal italic leading-[1.1]">{mirror.factsTitle}</h2>
            <p className="m-0 text-[length:calc(13.5px*var(--ts,1))] leading-[1.5]" style={{ hyphens: "auto" }}>
              <FactBlock ids={mirror.facts.slice(0, 2)} />
            </p>
          </div>
          {showScan && (
            <div className="col-span-2 flex flex-col gap-1.5">
              <ArchivePlaceholder slot={mirror.scan} className="h-[132px]" />
              {!mirror.scan.image && <span className="text-[length:calc(11.5px*var(--ts,1))] italic leading-[1.35] text-[#3c3b37]">Hier komt een echte scan, met bron.</span>}
            </div>
          )}
          {mirror.facts.length > 2 && (
            <p className="col-span-5 m-0 -mt-1 text-[length:calc(13.5px*var(--ts,1))] leading-[1.5]" style={{ hyphens: "auto" }}>
              <FactBlock ids={mirror.facts.slice(2)} />
            </p>
          )}
        </section>

        <aside className="mx-1 mt-1.5 flex flex-col gap-1 border border-press px-3 py-2.5 text-center outline outline-1 outline-offset-[3px] outline-press">
          <span className="label text-[length:calc(11px*var(--ts,1))] tracking-[0.2em]">{mirror.notice.title}</span>
          <span className="font-fell text-[length:calc(16px*var(--ts,1))] leading-[1.2]">
            <FactBlock ids={[mirror.notice.fact]} />
          </span>
          <span className="text-[length:calc(12.5px*var(--ts,1))] italic leading-[1.4] text-[#3c3b37]">{mirror.notice.body}</span>
        </aside>
        <FactLegend ids={[...mirror.facts, mirror.notice.fact]} />
        {teasers.map((t) => (
          <SpoorTeaser key={t.id} spoor={t} onOpen={() => setSpoor(t.id)} />
        ))}
        {!rereading && (
          // iOS can wipe a site's storage: the code (with this chapter in it) brings the game back
          <p className="m-0 border border-dashed border-press/50 px-3 py-2 text-[length:calc(13px*var(--ts,1))] leading-snug text-[#3c3b37]">
            Je herstelcode: <span className="font-type text-[length:calc(15px*var(--ts,1))] text-press">{encodeSave({ completed: [...completed, chapter.id], flags })}</span>
            <br />
            Schrijf hem op. Daarmee haal je je voortgang terug, ook op een ander toestel.
          </p>
        )}

      </div>
      <div className="flex flex-none flex-col gap-3 px-5 pb-[calc(22px+env(safe-area-inset-bottom))] shadow-[0_-14px_14px_-6px_#ece5d3]">
        <div className="flex items-center gap-3 border-t-[3px] border-double border-press pt-3">
          <Satchel color="#1a1b1c" size={30} />
          <span className="flex flex-1 flex-col gap-px">
            <span className="label text-[length:calc(11px*var(--ts,1))] text-wax">{rereading ? "Uit je koerierstas" : "Nieuw in je koerierstas"}</span>
            <span className="text-[length:calc(15px*var(--ts,1))] font-semibold leading-tight">{mirror.reward}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => (sfx.paper(), completeChapter())}
          className="flex h-[54px] flex-none items-center justify-between bg-press px-[18px] font-label text-[length:calc(14px*var(--ts,1))] font-bold tracking-[0.17em] text-paper transition-transform active:translate-x-1"
        >
          {rereading ? "TERUG NAAR DE KAART" : "VOLGEND ADRES"}
          <Arrow color="#e2a93a" />
        </button>
      </div>
      </div>
      <AnimatePresence>{spoor && <SporenSheet initial={spoor} onClose={() => setSpoor(null)} />}</AnimatePresence>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { chapterById } from "@/data/places";
import { useGameStore } from "@/store/useGameStore";
import { sfx } from "@/lib/sound";
import { Arrow, Satchel } from "@/components/ui/icons";
import { ArchivePlaceholder } from "@/components/ui/ArchivePlaceholder";
import { FACTS, SHOW_UNVERIFIED, type FactId } from "@/data/sources";
import { PAPERS, paperFacts } from "@/data/newspapers";
import { encodeSave } from "@/game/save";
import { SPOREN } from "@/data/sporen";
import { SpoorTeaser } from "@/components/map/SpoorTeaser";
import { SporenSheet } from "@/components/map/SporenSheet";
import { ArticleView, SourceSheet } from "@/components/mirror/Article";

const TS = {
  11: "text-[length:calc(11px*var(--ts,1))]",
  12: "text-[length:calc(12px*var(--ts,1))]",
  13: "text-[length:calc(13px*var(--ts,1))]",
  15: "text-[length:calc(15px*var(--ts,1))]",
} as const;

/**
 * De Koerier, an underground sheet on thin stencil paper: the player's night (stamped FICTIE) next
 * to what really happened (`newspapers.ts`). Every fact can be tapped for its source; unverified
 * ones are underlined in pencil.
 */
export function MirrorScreen() {
  const { chapter: chapterId, flags, rereading, completeChapter, completed, walkReading } = useGameStore();
  const chapter = chapterById(chapterId);
  const mirror = chapter.mirror!;
  const story = mirror.story(flags);
  const [lead, ...side] = PAPERS[chapter.id] ?? [];
  // a placeholder for a missing scan is a note for us, not for players: only in dev and preview builds
  const showScan = !!mirror.scan.image || SHOW_UNVERIFIED;
  const teasers = SPOREN.filter((s) => s.chapter === chapter.id && s.teaser);
  const [spoor, setSpoor] = useState<string | null>(null);
  const [source, setSource] = useState<FactId | null>(null);
  const unverified = [...paperFacts(chapter.id), mirror.notice.fact].some((id) => !FACTS[id].verified);
  const notice = FACTS[mirror.notice.fact];

  useEffect(() => {
    const id = window.setTimeout(() => sfx.stamp(), 950);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden text-[#1c1c1a]" style={{ background: "#d8d3c7 url(/img/krant/papier.webp) center top / 100% auto repeat-y" }}>
      <div className="relative flex h-full flex-col font-type [text-shadow:0_0_.7px_rgba(20,20,18,.5)]">
        <div className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto px-[22px] pb-5 pt-[max(44px,env(safe-area-inset-top))]">
          <header className="flex flex-col items-center gap-1.5 text-center">
            <span className={`${TS[11]} tracking-[0.12em]`}>LEES AANDACHTIG · GEEF DOOR · LAAT NIET SLINGEREN</span>
            <span className="font-stamp text-[length:calc(56px*var(--ts,1))] font-bold leading-[0.95] tracking-[0.04em]">DE KOERIER</span>
            <span aria-hidden="true" className={`${TS[12]} w-full overflow-hidden whitespace-nowrap`}>
              {"=".repeat(60)}
            </span>
            <div className={`flex w-full justify-between gap-2 ${TS[12]}`}>
              <span>{mirror.edition}</span>
              <span>{mirror.dateline}</span>
              <span>Extra</span>
            </div>
            <p className={`m-0 mt-0.5 ${TS[12]} leading-[1.45] text-[#3a3935]`}>
              {walkReading ? "Alles in deze krant komt uit de archieven: tik op een stuk tekst voor de bron." : "Jouw verhaal is verzonnen. De rest komt uit de archieven: tik op een stuk tekst voor de bron."}
            </p>
          </header>

          {/* on the city walk nothing was played: no story of yours, only what really happened */}
          {!walkReading && (
          <>
          <section className="relative flex flex-col gap-2 border-[1.5px] border-[#1c1c1a] bg-white/20 px-3.5 pb-4 pt-3.5">
            <span className={`${TS[11]} tracking-[0.14em]`}>JOUW VERHAAL</span>
            <h1 className="anim-print m-0 pr-16 font-stamp text-[length:calc(22px*var(--ts,1))] font-bold uppercase leading-[1.1]">{story.headline}</h1>
            <p className={`m-0 ${TS[15]} leading-[1.55]`}>{story.body}</p>
            <span className="anim-slam absolute right-2.5 top-2.5 rotate-6 border-[2.5px] border-wax px-2 py-0.5 font-stamp text-[length:calc(16px*var(--ts,1))] font-bold tracking-[0.16em] text-wax">
              FICTIE
            </span>
          </section>

          <div aria-hidden="true" className={`text-center ${TS[13]} tracking-[0.5em]`}>
            * * *
          </div>
          </>
          )}

          {lead && <ArticleView article={lead} lead onPick={setSource} />}

          {showScan && (
            <div className="flex flex-col gap-1">
              <ArchivePlaceholder slot={mirror.scan} tone="light" className="h-[150px]" />
              {!mirror.scan.image && <span className={`${TS[11]} italic text-[#3a3935]`}>Hier komt een echte scan, met bron.</span>}
            </div>
          )}

          {side.length > 0 && (
            <>
              <div aria-hidden="true" className={`overflow-hidden whitespace-nowrap text-center ${TS[12]}`}>
                {"- ".repeat(40)}
              </div>
              <div className={side.length > 1 ? "grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-3.5" : "flex flex-col"}>
                {side.map((a, i) => (
                  <div key={a.headline} className={side.length > 1 && i === 0 ? "border-r border-[#1c1c1a] pr-3" : ""}>
                    <ArticleView article={a} onPick={setSource} />
                  </div>
                ))}
              </div>
            </>
          )}

          <aside className="mx-1 mt-1 flex flex-col gap-1.5 border-[1.5px] border-[#1c1c1a] px-3.5 py-3 text-center outline outline-1 outline-offset-[3px] outline-[#1c1c1a]">
            <span className={`${TS[11]} tracking-[0.16em]`}>{mirror.notice.title.toUpperCase()}</span>
            <button type="button" onClick={() => (sfx.paper(), setSource(mirror.notice.fact))} className="font-stamp text-[length:calc(17px*var(--ts,1))] leading-[1.25]">
              <span className={notice.verified ? "" : "underline decoration-[#6e6c66] decoration-dotted decoration-[1.5px] underline-offset-[3px]"}>{notice.claim}</span>
              {!notice.verified && <sup className={`ml-0.5 font-label ${TS[11]} font-bold`}>?</sup>}
            </button>
            {!walkReading && <span className={`${TS[13]} leading-[1.5] text-[#3a3935]`}>{mirror.notice.body}</span>}
          </aside>

          {teasers.map((t) => (
            <SpoorTeaser key={t.id} spoor={t} onOpen={() => setSpoor(t.id)} />
          ))}

          {unverified && <p className={`m-0 ${TS[11]} leading-[1.45] text-[#3a3935]`}>Potloodstreep met ? = nog niet gecontroleerd. Tik erop om te zien waar het vandaan komt.</p>}

          {!rereading && (
            // iOS can wipe a site's storage: the code (with this chapter in it) brings the game back
            <p className={`m-0 border border-dashed border-[#1c1c1a]/50 px-3 py-2 ${TS[13]} leading-snug text-[#3a3935]`}>
              Je herstelcode: <span className={`${TS[15]} text-[#1c1c1a]`}>{encodeSave({ completed: [...completed, chapter.id], flags })}</span>
              <br />
              Schrijf hem op. Daarmee haal je je voortgang terug, ook op een ander toestel.
            </p>
          )}
        </div>

        <div className="flex flex-none flex-col gap-3 px-[22px] pb-[calc(22px+env(safe-area-inset-bottom))] pt-1 [text-shadow:none]">
          <div className={`flex items-center gap-3 border-t-[3px] border-double border-[#1c1c1a] pt-3 ${walkReading ? "hidden" : ""}`}>
            <Satchel color="#1c1c1a" size={30} />
            <span className="flex flex-1 flex-col gap-px">
              <span className={`${TS[11]} tracking-[0.14em] text-wax`}>{rereading ? "UIT JE KOERIERSTAS" : "NIEUW IN JE KOERIERSTAS"}</span>
              <span className={`${TS[15]} leading-tight`}>{mirror.reward}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => (sfx.paper(), completeChapter())}
            className="flex h-[54px] flex-none items-center justify-between bg-[#1c1c1a] px-[18px] font-label text-[length:calc(14px*var(--ts,1))] font-bold tracking-[0.17em] text-paper transition-transform active:translate-x-1"
          >
            {walkReading ? "TERUG NAAR DE WANDELING" : rereading ? "TERUG NAAR DE KAART" : "VOLGEND ADRES"}
            <Arrow color="#e2a93a" />
          </button>
        </div>
      </div>
      <SourceSheet id={source} onClose={() => setSource(null)} />
      <AnimatePresence>{spoor && <SporenSheet initial={spoor} onClose={() => setSpoor(null)} />}</AnimatePresence>
    </div>
  );
}

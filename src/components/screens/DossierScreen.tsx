"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { chapterById } from "@/data/chapters";
import { echoesFor } from "@/game/choices";
import { useGameStore } from "@/store/useGameStore";
import { sfx } from "@/lib/sound";
import { Arrow, Back } from "@/components/ui/icons";
import { Grain } from "@/components/ui/Grain";
import { Slip } from "@/components/dossier/Slip";
import { ThenNow } from "@/components/dossier/ThenNow";
import { Dilemma } from "@/components/dossier/Dilemma";

function Continue({ label, onPress, dim }: { label: string; onPress: () => void; dim?: boolean }) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={`flex h-[54px] items-center justify-between bg-ochre px-[18px] font-label text-[14px] font-bold tracking-[0.17em] text-slate transition-all active:translate-x-1 ${dim ? "opacity-55" : ""}`}
    >
      {label.toUpperCase()}
      <Arrow color="#14181d" />
    </button>
  );
}

export function DossierScreen() {
  const { chapter: chapterId, page: pageIndex, flags, nextPage, go } = useGameStore();
  const chapter = chapterById(chapterId);
  const page = chapter.pages[Math.min(pageIndex, chapter.pages.length - 1)];
  const [typedPage, setTypedPage] = useState(-1);
  const typed = typedPage === pageIndex;
  const markTyped = () => setTypedPage(pageIndex);
  const echo = pageIndex === 0 ? echoesFor(chapter.id, flags).find((e) => e.slot === "scene" || e.slot === "satchel")?.text : undefined;

  const advance = () => {
    sfx.paper();
    nextPage();
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-dusk text-parchment">
      <div className="absolute inset-x-0 top-0 h-[58%] overflow-hidden">
        <AnimatePresence>
          <motion.div
            key={page.image}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
          >
            <div
              className="anim-kenburns absolute inset-0 bg-cover"
              style={{ backgroundImage: `url(${page.image})`, backgroundPosition: "50% 38%" }}
            />
          </motion.div>
        </AnimatePresence>
        <Grain id="dossier-grain" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(14,17,20,.85) 0%, rgba(14,17,20,0) 26%, rgba(14,17,20,0) 52%, #0e1114 100%)",
          }}
        />
      </div>

      <header className="absolute left-4 right-5 top-[max(46px,env(safe-area-inset-top))] flex items-center gap-3.5">
        <button
          type="button"
          aria-label="Terug naar de kaart"
          onClick={() => go("map")}
          className="flex h-11 w-11 flex-none items-center justify-center border border-parchment/35 bg-dusk/45"
        >
          <Back color="#ede6d6" />
        </button>
        <div className="flex flex-1 flex-col gap-1.5">
          <span className="label text-[11px] text-bone">
            Dossier 0{chapter.id} · {chapter.date} · {chapter.time.replace(" uur", "")}
          </span>
          <div className="flex gap-1" role="img" aria-label={`Blad ${pageIndex + 1} van ${chapter.pages.length}`}>
            {chapter.pages.map((_, i) => (
              <span key={i} className={`h-0.5 flex-1 transition-colors duration-500 ${i <= pageIndex ? "bg-ochre" : "bg-parchment/25"}`} />
            ))}
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={pageIndex}
          className="absolute inset-x-[22px] bottom-[calc(26px+env(safe-area-inset-bottom))] flex flex-col gap-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
        >
          {page.kind === "scene" && (
            <>
              <Slip lines={page.lines} quote={page.quote} echo={echo} onDone={markTyped} />
              <Continue label="Verder" onPress={advance} dim={!typed} />
            </>
          )}
          {page.kind === "then-now" && (
            <>
              <div className="flex flex-col gap-2">
                <span className="label text-[10.5px] text-bone">Toen en nu</span>
                <h1 className="m-0 font-fell text-[28px] font-normal leading-[1.1]">
                  Dezelfde plek, <span className="italic text-ochre">een andere tijd</span>
                </h1>
              </div>
              <ThenNow then={page.then} now={page.now} year={chapter.date.split(" ").slice(-1)[0]} />
              <p className="m-0 font-news text-[15px] leading-[1.5] text-[#d8d0be]">{page.intro}</p>
              <p className="m-0 border-l-2 border-ochre pl-3 font-news text-[14.5px] italic leading-snug text-bone">{page.anchor}</p>
              <Continue label="Verder" onPress={advance} />
            </>
          )}
          {page.kind === "task" && (
            <>
              <div className="flex flex-col gap-2">
                <span className="label text-[10.5px] text-bone">Jouw opdracht</span>
                <h1 className="m-0 font-fell text-[30px] font-normal leading-[1.08]">{page.title}</h1>
              </div>
              <p className="m-0 font-news text-[16.5px] leading-[1.5] text-[#d8d0be]">{page.brief}</p>
              {echoesFor(chapter.id, flags, "route").map((e) => (
                <p key={e.id} className="m-0 border-l-2 border-ochre pl-3 font-news text-[14.5px] italic leading-snug text-bone">
                  {e.text}
                </p>
              ))}
              <Continue label={page.cta} onPress={() => (sfx.paper(), go("task"))} />
            </>
          )}
          {page.kind === "dilemma" && (
            <>
              <Slip lines={page.lines} quote={page.quote} onDone={markTyped} />
              <Dilemma id={page.choice} ready={typed} />
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

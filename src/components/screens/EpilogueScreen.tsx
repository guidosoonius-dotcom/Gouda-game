"use client";

import { useState } from "react";
import { CHOICES, EPILOGUE, echoesFor } from "@/game/choices";
import { useGameStore } from "@/store/useGameStore";
import { sfx } from "@/lib/sound";
import { Arrow, Back } from "@/components/ui/icons";
import { FactBlock, FactLegend } from "@/components/ui/Fact";
import type { FactId } from "@/data/sources";
import { PaperTexture } from "@/components/ui/Grain";
import { DisputeButton } from "@/components/ui/DisputeCard";

/** The days in May, each only through facts from the register (the dispute is shown, not decided). */
const DAYS: { date: string; facts: FactId[] }[] = [
  { date: "5 MEI", facts: ["spoor.zalm.1945", "stadhuis.return"] },
  { date: "7 MEI", facts: ["liberation.may"] },
];

/**
 * May 1945, the Markt. No task: who is standing there depends on the five evenings, and the
 * player writes a short letter to later. The choices did not change history, only this story.
 */
export function EpilogueScreen() {
  const { flags, letter: saved, finishEpilogue, go } = useGameStore();
  const [letter, setLetter] = useState(saved);
  const present = echoesFor(EPILOGUE, flags, "epilogue");
  const made = CHOICES.filter((c) => flags[c.id]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-paper text-press">
      <PaperTexture id="epilogue-paper" />
      <div className="relative flex h-full flex-col gap-4 overflow-y-auto px-6 pb-[calc(26px+env(safe-area-inset-bottom))] pt-[max(46px,env(safe-area-inset-top))]">
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Terug naar de kaart" onClick={() => go("map")} className="flex h-11 w-11 flex-none items-center justify-center border border-press/40">
            <Back color="#1a1b1c" />
          </button>
          <span className="label text-[length:calc(11px*var(--ts,1))] tracking-[0.2em] text-[#3c3b37]">Epiloog · mei 1945 · de Markt</span>
        </div>
        <h1 className="m-0 font-fell text-[length:calc(40px*var(--ts,1))] font-normal leading-[1.02]">
          Het is licht <span className="italic text-wax">op de Markt</span>
        </h1>
        <p className="m-0 text-[length:calc(16.5px*var(--ts,1))] leading-[1.55]">
          Voor het eerst in vijf jaar staan mensen stil zonder om te kijken. Iemand heeft een vlag uit een kussensloop genaaid. Je loopt
          tussen hen door met een lege tas.
        </p>
        <img src="/img/sporen/markt-1945.webp" alt="De Markt in mei 1945: de Waag en hotel De Zalm, mensen van achteren" className="-mx-6 h-[170px] max-w-none object-cover" style={{ width: "calc(100% + 3rem)" }} />
        <section className="flex flex-col gap-2.5">
          <span className="label text-[length:calc(11px*var(--ts,1))] text-wax">Drie dagen in mei</span>
          {DAYS.map((d) => (
            <div key={d.date} className="grid grid-cols-[62px_minmax(0,1fr)] gap-2.5">
              <span className="font-type text-[length:calc(15px*var(--ts,1))] leading-[1.35] text-wax">{d.date}</span>
              <p className="m-0 text-[length:calc(14.5px*var(--ts,1))] leading-[1.45]">
                <FactBlock ids={d.facts} />
              </p>
            </div>
          ))}
          <DisputeButton id="bevrijding" light />
          <p className="m-0 border-t border-press/30 pt-2.5 text-[length:calc(14px*var(--ts,1))] italic leading-[1.45] text-[#3c3b37]">
            <FactBlock ids={["bs.vrouwen"]} />
          </p>
        </section>

        {present.length > 0 && (
          <section className="flex flex-col gap-2.5">
            <span className="label text-[length:calc(11px*var(--ts,1))] text-wax">Wie er staan</span>
            {present.map((e) => (
              <p key={e.id} className="m-0 font-news text-[length:calc(16px*var(--ts,1))] italic leading-[1.45]">
                {e.text}
              </p>
            ))}
            <span className="self-start border border-wax px-1.5 font-stamp text-[length:calc(11px*var(--ts,1))] tracking-[0.14em] text-wax">FICTIE</span>
          </section>
        )}

        {made.length > 0 && (
          <section className="flex flex-col gap-1.5 border-y border-press py-3">
            <span className="label text-[length:calc(11px*var(--ts,1))]">Jouw vijf avonden</span>
            {made.map((c) => {
              const opt = flags[c.id] === c.A.value ? c.A : c.B;
              return (
                <p key={c.id} className="m-0 text-[length:calc(14.5px*var(--ts,1))] leading-snug">
                  <span className="text-[#5c5a52]">
                    {c.question} {c.questionAccent}{" "}
                  </span>
                  <strong className="font-semibold">{opt.title}.</strong>
                </p>
              );
            })}
            <p className="m-0 mt-1 text-[length:calc(13.5px*var(--ts,1))] italic leading-snug text-[#3c3b37]">
              Geen van je keuzes heeft de geschiedenis veranderd. Ze hebben alleen bepaald wie jij daarin was.
            </p>
          </section>
        )}

        <section className="flex flex-col gap-2">
          <label htmlFor="letter" className="label text-[length:calc(11px*var(--ts,1))] text-wax">
            Brief aan later
          </label>
          <span className="text-[length:calc(14px*var(--ts,1))] leading-snug text-[#3c3b37]">Wat moet iemand over tachtig jaar hiervan weten? Schrijf het op. Het blijft op dit toestel.</span>
          <textarea
            id="letter"
            value={letter}
            onChange={(e) => setLetter(e.target.value)}
            maxLength={600}
            rows={5}
            placeholder="Aan wie dit later leest…"
            className="select-text resize-none border border-press/60 bg-[#f4efe3] p-3 font-type text-[length:calc(15px*var(--ts,1))] leading-[1.55] text-ink placeholder:text-[#8a857a]"
          />
        </section>
        <FactLegend ids={["liberation.gouda", ...DAYS.flatMap((d) => d.facts), "bs.vrouwen"]} />

        <button
          type="button"
          onClick={() => (sfx.stamp(), finishEpilogue(letter.trim()))}
          className="mt-auto flex h-[54px] flex-none items-center justify-between bg-press px-[18px] font-label text-[length:calc(14px*var(--ts,1))] font-bold tracking-[0.17em] text-paper"
        >
          SLUIT HET DOSSIER
          <Arrow color="#e2a93a" />
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { CHOICES, EPILOGUE, echoesFor } from "@/game/choices";
import { useGameStore } from "@/store/useGameStore";
import { sfx } from "@/lib/sound";
import { Arrow, Back } from "@/components/ui/icons";
import { FactBlock, FactLegend } from "@/components/ui/Fact";
import { PaperTexture } from "@/components/ui/Grain";

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
          <span className="label text-[10.5px] tracking-[0.2em] text-[#3c3b37]">Epiloog · mei 1945 · de Markt</span>
        </div>
        <h1 className="m-0 font-fell text-[40px] font-normal leading-[1.02]">
          Het is licht <span className="italic text-wax">op de Markt</span>
        </h1>
        <p className="m-0 text-[16.5px] leading-[1.55]">
          Voor het eerst in vijf jaar staan mensen stil zonder om te kijken. Iemand heeft een vlag uit een kussensloop genaaid. Je loopt
          tussen hen door met een lege tas.
        </p>
        <p className="m-0 border-l-2 border-press/50 pl-3 text-[14.5px] leading-[1.5]">
          <FactBlock ids={["liberation.gouda"]} />
        </p>

        {present.length > 0 && (
          <section className="flex flex-col gap-2.5">
            <span className="label text-[10.5px] text-wax">Wie er staan</span>
            {present.map((e) => (
              <p key={e.id} className="m-0 font-news text-[16px] italic leading-[1.45]">
                {e.text}
              </p>
            ))}
            <span className="self-start border border-wax px-1.5 font-stamp text-[10px] tracking-[0.14em] text-wax">FICTIE</span>
          </section>
        )}

        {made.length > 0 && (
          <section className="flex flex-col gap-1.5 border-y border-press py-3">
            <span className="label text-[10.5px]">Jouw vijf avonden</span>
            {made.map((c) => {
              const opt = flags[c.id] === c.A.value ? c.A : c.B;
              return (
                <p key={c.id} className="m-0 text-[14.5px] leading-snug">
                  <span className="text-[#5c5a52]">
                    {c.question} {c.questionAccent}{" "}
                  </span>
                  <strong className="font-semibold">{opt.title}.</strong>
                </p>
              );
            })}
            <p className="m-0 mt-1 text-[13.5px] italic leading-snug text-[#3c3b37]">
              Geen van je keuzes heeft de geschiedenis veranderd. Ze hebben alleen bepaald wie jij daarin was.
            </p>
          </section>
        )}

        <section className="flex flex-col gap-2">
          <label htmlFor="letter" className="label text-[10.5px] text-wax">
            Brief aan later
          </label>
          <span className="text-[14px] leading-snug text-[#3c3b37]">Wat moet iemand over tachtig jaar hiervan weten? Schrijf het op. Het blijft op dit toestel.</span>
          <textarea
            id="letter"
            value={letter}
            onChange={(e) => setLetter(e.target.value)}
            maxLength={600}
            rows={5}
            placeholder="Aan wie dit later leest…"
            className="select-text resize-none border border-press/60 bg-[#f4efe3] p-3 font-type text-[15px] leading-[1.55] text-ink placeholder:text-[#8a857a]"
          />
        </section>
        <FactLegend ids={["liberation.gouda"]} />

        <button
          type="button"
          onClick={() => (sfx.stamp(), finishEpilogue(letter.trim()))}
          className="mt-auto flex h-[54px] flex-none items-center justify-between bg-press px-[18px] font-label text-[14px] font-bold tracking-[0.17em] text-paper"
        >
          SLUIT HET DOSSIER
          <Arrow color="#e2a93a" />
        </button>
      </div>
    </div>
  );
}

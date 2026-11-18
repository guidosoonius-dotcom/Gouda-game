"use client";

import { useMemo, useState } from "react";
import { sfx } from "@/lib/sound";

/** A fixed shuffle, so the right column never lines up with the left one. */
const shuffle = <T,>(list: T[]) => list.map((v, i) => ({ v, k: (i * 7 + 3) % list.length })).sort((a, b) => a.k - b.k).map((x) => x.v);

/** Max's exercise book: match each German word to the Dutch one. */
export function WordsPuzzle({ pairs, onSolved }: { pairs: [string, string][]; onSolved: () => void }) {
  const right = useMemo(() => shuffle(pairs.map((p, i) => ({ word: p[1], pair: i }))), [pairs]);
  const [picked, setPicked] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [miss, setMiss] = useState<number | null>(null);

  const tapRight = (pair: number) => {
    if (picked === null || matched.includes(pair)) return;
    if (pair === picked) {
      sfx.settle();
      const next = [...matched, pair];
      setMatched(next);
      setPicked(null);
      if (next.length === pairs.length) onSolved();
    } else {
      sfx.reject();
      setMiss(pair);
      window.setTimeout(() => setMiss(null), 600);
    }
  };

  const tile = "flex min-h-11 items-center px-3 py-2 text-left font-type text-[length:calc(16px*var(--ts,1))] transition-colors";
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-2 bg-parchment p-3 text-ink" style={{ backgroundImage: "repeating-linear-gradient(transparent 0 31px, rgba(70,110,150,.22) 31px 32px)" }}>
      <span className="label text-[length:calc(11px*var(--ts,1))] text-[#5c5a52]">Duits</span>
      <span className="label text-[length:calc(11px*var(--ts,1))] text-[#5c5a52]">Nederlands</span>
      {pairs.map(([de], i) => (
        <div key={de} className="contents">
          <button
            type="button"
            disabled={matched.includes(i)}
            onClick={() => (sfx.paper(), setPicked(i))}
            className={`${tile} border ${matched.includes(i) ? "border-transparent text-[#5c5a52] line-through decoration-ochre" : picked === i ? "border-wax bg-wax/10" : "border-ink/25"}`}
          >
            {de}
          </button>
          <button
            type="button"
            disabled={matched.includes(right[i].pair)}
            onClick={() => tapRight(right[i].pair)}
            aria-label={`${right[i].word}${picked === null ? "" : `, koppel aan ${pairs[picked][0]}`}`}
            className={`${tile} border ${matched.includes(right[i].pair) ? "border-transparent text-[#2c5a3a]" : miss === right[i].pair ? "anim-tremble border-alarm" : "border-ink/25"}`}
          >
            {right[i].word}
          </button>
        </div>
      ))}
      <span className="col-span-2 font-news text-[length:calc(13px*var(--ts,1))] italic text-[#5c5a52]" aria-live="polite">
        {matched.length === pairs.length ? "Alle woorden staan goed." : picked === null ? "Tik eerst een Duits woord." : `Welk woord hoort bij ‘${pairs[picked][0]}’?`}
      </span>
    </div>
  );
}

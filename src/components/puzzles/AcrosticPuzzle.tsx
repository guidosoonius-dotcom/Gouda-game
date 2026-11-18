"use client";

import { useState } from "react";
import type { Puzzle } from "@/data/chapters";
import { sfx } from "@/lib/sound";

type Acrostic = Extract<Puzzle, { kind: "acrostic" }>;
const norm = (s: string) => s.toUpperCase().replace(/[^A-Z]/g, "");

/** A forged proclamation with a message down its first letters. Type what it says. */
export function AcrosticPuzzle({ puzzle, onSolved }: { puzzle: Acrostic; onSolved: () => void }) {
  const [entry, setEntry] = useState("");
  const [tries, setTries] = useState(0);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState(false);
  const showLetters = solved || tries >= 3;

  const check = () => {
    if (norm(entry) === norm(puzzle.answer)) {
      setSolved(true);
      onSolved();
    } else {
      sfx.reject();
      setTries((t) => t + 1);
      setWrong(true);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5 bg-[#e9e1cc] px-4 py-4 text-ink shadow-[0_10px_24px_rgba(0,0,0,.45)]">
        <span className="text-center font-stamp text-[length:calc(15px*var(--ts,1))] tracking-[0.18em]">{puzzle.heading}</span>
        <span className="mb-1 h-px bg-ink/40" />
        {puzzle.lines.map((line) => (
          <p key={line} className="m-0 font-type text-[length:calc(14.5px*var(--ts,1))] leading-[1.45]">
            <span className={showLetters ? "bg-ochre/50 px-0.5 font-bold" : ""}>{line[0]}</span>
            {line.slice(1)}
          </p>
        ))}
        <span className="mt-1 text-right font-type text-[length:calc(13px*var(--ts,1))] italic">{puzzle.signed}</span>
      </div>
      {!solved && (
        <>
          <label htmlFor="acrostic" className="label text-[length:calc(11px*var(--ts,1))] text-bone">
            Wat zegt de bode?
          </label>
          <div className="flex gap-2">
            <input
              id="acrostic"
              value={entry}
              onChange={(e) => (setEntry(e.target.value), setWrong(false))}
              onKeyDown={(e) => e.key === "Enter" && check()}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className="h-11 min-w-0 flex-1 select-text border border-rule bg-transparent px-3 font-type text-[length:calc(17px*var(--ts,1))] uppercase tracking-[0.1em] text-parchment"
            />
            <button type="button" onClick={check} className="label h-11 border border-parchment/40 px-4 text-[length:calc(11px*var(--ts,1))]">
              Klopt het?
            </button>
          </div>
          <span className="min-h-5 font-news text-[length:calc(14px*var(--ts,1))] italic text-[#f0b5aa]" aria-live="polite">
            {tries >= 3 ? `Kijk naar de gemarkeerde letters.` : tries >= 1 ? `${wrong ? "Nog niet. " : ""}${puzzle.hint}` : ""}
          </span>
        </>
      )}
    </div>
  );
}

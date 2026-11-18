"use client";

import { useGameStore } from "@/store/useGameStore";
import { TUNING } from "@/game/tuning";

/** Three text sizes for every screen; also pinch-zoom works everywhere outside the 3D scenes. */
export function TextSize({ dark = true }: { dark?: boolean }) {
  const scale = useGameStore((s) => s.textScale);
  const setScale = useGameStore((s) => s.setTextScale);
  return (
    <div className="flex items-center gap-2" role="group" aria-label="Tekstgrootte">
      <span className={`label text-[length:calc(11px*var(--ts,1))] ${dark ? "text-bone" : "text-[#3c3b37]"}`}>Tekst</span>
      {TUNING.ui.textScales.map((s, i) => (
        <button
          key={s}
          type="button"
          aria-pressed={scale === s}
          aria-label={["Normale tekst", "Grote tekst", "Grootste tekst"][i]}
          onClick={() => setScale(s)}
          className={`flex h-11 w-11 items-center justify-center border font-fell ${
            scale === s ? "border-ochre bg-ochre text-slate" : dark ? "border-parchment/35 text-parchment" : "border-press/40 text-press"
          }`}
          style={{ fontSize: 14 + i * 4 }}
        >
          A
        </button>
      ))}
    </div>
  );
}

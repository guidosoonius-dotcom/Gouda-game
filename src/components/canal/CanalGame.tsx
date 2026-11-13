"use client";

import { useGameStore } from "@/store/useGameStore";

/** Placeholder until the Nachtvaart prototype (M4) lands. */
export function CanalGame() {
  const go = useGameStore((s) => s.go);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-night px-8 text-center">
      <span className="label text-[11px] text-bone">Nachtvaart</span>
      <p className="m-0 font-fell text-[26px]">De boot ligt nog op de werf.</p>
      <button type="button" onClick={() => go("map")} className="label h-11 border border-parchment/40 px-4 text-[11px]">
        Terug naar de kaart
      </button>
    </div>
  );
}

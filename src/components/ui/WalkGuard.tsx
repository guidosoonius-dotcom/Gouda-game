"use client";

import { overrideWalkGuard, useWalkBlocked } from "@/lib/walk";

/**
 * Shown over a chapter while the player is walking (location mode). Games are never played on the
 * move: next to canals and traffic eyes belong on the street. The games stand still behind it.
 * "Ik sta of zit stil" is for a false alarm (GPS jumping, a train, a bench) and lasts a minute and a half.
 */
export function WalkGuard() {
  const blocked = useWalkBlocked();
  if (!blocked) return null;
  return (
    <div role="alertdialog" aria-modal="true" aria-labelledby="walk-title" className="absolute inset-0 z-50 flex flex-col justify-end bg-night/88 px-5 pb-[calc(28px+env(safe-area-inset-bottom))] backdrop-blur-[3px]">
      <div className="flex flex-col gap-3.5 bg-parchment px-[18px] py-5 text-ink shadow-[0_18px_40px_rgba(0,0,0,.6)]">
        <span className="label text-[10.5px] text-wax">Stop even</span>
        <h2 id="walk-title" className="m-0 font-fell text-[28px] font-normal leading-[1.05]">
          Blijf even staan
        </h2>
        <p className="m-0 font-news text-[16px] leading-[1.45]">
          Je loopt. Speel pas als je stilstaat: kijk uit voor fietsers, verkeer en het water. Het spel wacht op je.
        </p>
        <button
          type="button"
          onClick={overrideWalkGuard}
          className="flex h-11 items-center justify-between border border-press/60 px-[18px] font-label text-[12.5px] font-bold tracking-[0.17em] text-press"
        >
          IK STA OF ZIT STIL
        </button>
      </div>
    </div>
  );
}

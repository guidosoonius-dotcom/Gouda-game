"use client";

import { TUNING } from "@/game/tuning";
import { peopleTotal } from "./sim";

export interface BikeHudState {
  timeLeft: number;
  safe: number;
  behind: number;
  warning: boolean;
  near: boolean;
  searching: boolean;
  dist: number;
}

export const BIKE_HUD_START: BikeHudState = { timeLeft: TUNING.bike.time, safe: 0, behind: 0, warning: false, near: false, searching: false, dist: 150 };

function caption(h: BikeHudState): string {
  if (h.warning) return "Het fluit! Weg van het rode vlak, of rem.";
  if (h.near) return "Daar staan mensen. Bel!";
  if (h.searching) return "Naar het ingestorte huis. Gerrit heeft de groep.";
  if (h.behind > 0) return "Rustig aan. Ze lopen achter je.";
  return "Bel, en wie je hoort loopt mee naar de kelder.";
}

const zone =
  "pointer-events-auto absolute -bottom-[70px] h-60 w-60 touch-none rounded-full border border-parchment/35 bg-night/45 p-0 transition-colors active:border-ochre active:bg-ochre/15";

/** DOM overlay of the bicycle run: the raid clock, who is safe, steering thumbs and the bell. */
export function BikeHud({ hud, onSteer, onBell }: { hud: BikeHudState; onSteer: (side: "L" | "R", down: boolean) => void; onBell: () => void }) {
  const m = Math.floor(hud.timeLeft / 60);
  const sec = String(Math.floor(hud.timeLeft % 60)).padStart(2, "0");
  const thumb = (side: "L" | "R") => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => (e.currentTarget.setPointerCapture(e.pointerId), onSteer(side, true)),
    onPointerUp: () => onSteer(side, false),
    onPointerCancel: () => onSteer(side, false),
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });
  return (
    <div className="pointer-events-none absolute inset-0 font-label text-parchment" style={{ textShadow: "0 1px 2px rgba(10,13,17,.9), 0 0 8px rgba(10,13,17,.7)" }}>
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-night/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-night/75 to-transparent" />

      <div className="absolute inset-x-5 top-[max(46px,env(safe-area-inset-top))] flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <span className="label text-[10.5px] text-bone">In de schuilkelder</span>
          <div className="flex gap-[3px]" role="img" aria-label={`${hud.safe} van ${peopleTotal} mensen veilig, ${hud.behind} lopen achter je`}>
            {Array.from({ length: peopleTotal }, (_, i) => (
              <span key={i} className="h-3.5 w-[11px]" style={{ background: i < hud.safe ? "#e2a93a" : i < hud.safe + hud.behind ? "rgba(226,169,58,.4)" : "rgba(237,230,214,.2)" }} />
            ))}
          </div>
          <span className="label text-[10.5px] text-bone">{hud.behind > 0 ? `${hud.behind} lopen achter je` : `Nog ${Math.max(0, Math.round(hud.dist))} m`}</span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="font-fell text-[34px] leading-none text-[#f2c1b8]">
            {m}:{sec}
          </span>
          <span className="label flex items-center gap-1.5 text-[10.5px] text-[#f2c1b8]">
            <span className="h-2 w-2 bg-alarm" />
            Luchtalarm
          </span>
        </div>
      </div>

      {hud.warning && (
        <span className="label absolute left-5 top-[calc(max(46px,env(safe-area-inset-top))+82px)] border-l-2 border-alarm bg-night/70 px-2 py-1.5 text-[10px] text-[#f2c1b8]">
          Inslag op komst · blijf uit het rode vlak
        </span>
      )}

      <p className="absolute inset-x-12 bottom-[176px] m-0 text-center font-fell text-[16px] italic leading-snug tracking-normal">{caption(hud)}</p>

      <button type="button" aria-label="Stuur naar links" className={`${zone} -left-[70px]`} {...thumb("L")}>
        <span className="label absolute left-[92px] top-[78px] text-[12px] tracking-[0.2em]">Links</span>
      </button>
      <button type="button" aria-label="Stuur naar rechts" className={`${zone} -right-[70px]`} {...thumb("R")}>
        <span className="label absolute left-[80px] top-[78px] text-[12px] tracking-[0.2em]">Rechts</span>
      </button>
      <button
        type="button"
        aria-label="Bel"
        onPointerDown={onBell}
        className={`pointer-events-auto absolute bottom-[calc(26px+env(safe-area-inset-bottom))] left-1/2 flex h-[84px] w-[84px] -translate-x-1/2 touch-none flex-col items-center justify-center gap-1 rounded-full border-2 transition-transform active:scale-90 ${
          hud.near ? "border-ochre bg-ochre text-slate" : "border-parchment/50 bg-night/60"
        }`}
        style={{ textShadow: "none" }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 17h14 M7 17v-5a5 5 0 0 1 10 0v5 M12 5v2 M10.5 20h3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        <span className="label text-[11px] tracking-[0.2em]">Bel</span>
      </button>
      <span className="absolute inset-x-0 bottom-[118px] text-center font-fell text-[12.5px] italic tracking-normal text-bone">beide vast: remmen</span>
    </div>
  );
}

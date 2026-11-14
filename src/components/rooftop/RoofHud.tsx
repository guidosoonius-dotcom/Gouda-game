"use client";

import { TUNING } from "@/game/tuning";
import { ROOF } from "./sim";

export interface RoofHudState {
  timeLeft: number;
  cover: number;
  moving: boolean;
  flat: boolean;
  lit: boolean;
  exposure: number;
  kees: boolean;
  safe: boolean;
  caught: number;
}

export const ROOF_HUD_START: RoofHudState = {
  timeLeft: TUNING.rooftop.time, cover: 0, moving: false, flat: false, lit: false, exposure: 0, kees: false, safe: false, caught: 0,
};

/** 19:52 at the start, 20:00 when the time is up. */
function clock(timeLeft: number) {
  const seconds = Math.round(480 * (1 - timeLeft / TUNING.rooftop.time));
  const m = 52 + Math.floor(seconds / 60);
  return m >= 60 ? "20:00" : `19:${m}`;
}

function caption(h: RoofHudState): string {
  if (h.lit) return h.flat ? "Plat blijven. Niet bewegen." : "Het licht! Plat op de pannen!";
  if (h.kees) return h.moving ? "‘Doorlopen, ik zit achter je.’" : h.safe ? "‘Nu! Het licht is weg.’" : "‘Wacht… nog niet.’";
  if (h.moving) return "Rennen. Niet omkijken.";
  if (h.cover === 0) return "Kijk hoe het licht beweegt. Tel. Dan rennen.";
  return h.timeLeft < 25 ? "De klok loopt. Hendrik weet nog van niets." : "Wachten achter de schoorsteen. Tellen.";
}

/** DOM overlay of the rooftop run: the clock to curfew, the light on you, one big thumb pad. */
export function RoofHud({ hud, onDown, onUp }: { hud: RoofHudState; onDown: () => void; onUp: () => void }) {
  const left = hud.timeLeft / TUNING.rooftop.time;
  const urgent = hud.timeLeft < 20;
  return (
    <div className="pointer-events-none absolute inset-0 font-label text-parchment" style={{ textShadow: "0 1px 2px rgba(10,13,17,.9), 0 0 8px rgba(10,13,17,.7)" }}>
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-night/55 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-night/80 to-transparent" />

      <div className="absolute inset-x-5 top-[max(46px,env(safe-area-inset-top))] flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <span className="label text-[10.5px] text-bone">Spertijd om acht uur</span>
          <div className="h-[3px] w-[150px] bg-parchment/20" role="img" aria-label={`Nog ${Math.ceil(hud.timeLeft)} seconden`}>
            <div className={`h-full ${urgent ? "bg-alarm" : "bg-ochre"}`} style={{ width: `${left * 100}%` }} />
          </div>
          <span className="label text-[10.5px] text-bone">
            Schoorsteen {hud.cover} van {ROOF.covers.length - 1}
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className={`font-fell text-[34px] leading-none ${urgent ? "text-[#f2c1b8]" : ""}`}>{clock(hud.timeLeft)}</span>
          <span className="label text-[10.5px] text-bone">Nov 1942</span>
        </div>
      </div>

      <div className="absolute inset-x-5 top-[calc(max(46px,env(safe-area-inset-top))+78px)] flex h-9 items-center justify-between gap-2">
        {hud.lit ? (
          <div className="flex flex-1 items-center gap-2.5 border-l-2 border-alarm bg-night/65 px-2 py-1.5">
            <span className="label text-[10px] text-[#f2c1b8]">In het licht</span>
            <span className="h-[3px] flex-1 bg-parchment/15">
              <span className="block h-full bg-alarm" style={{ width: `${Math.min(1, hud.exposure) * 100}%` }} />
            </span>
          </div>
        ) : !hud.moving ? (
          <span className="label border-l-2 border-ochre bg-night/65 px-2 py-1.5 text-[10px] text-ochre">Achter de schoorsteen · onzichtbaar</span>
        ) : hud.flat ? (
          <span className="label border-l-2 border-ochre bg-night/65 px-2 py-1.5 text-[10px] text-ochre">Plat op het dak</span>
        ) : (
          <span />
        )}
        {hud.kees && !hud.moving && (
          <span className={`label flex-none border px-2 py-1.5 text-[10px] ${hud.safe ? "border-ochre bg-ochre text-slate" : "border-parchment/25 bg-night/60"}`} style={{ textShadow: "none" }}>
            Kees: {hud.safe ? "nu!" : "wacht"}
          </span>
        )}
      </div>

      <p className="absolute inset-x-10 bottom-[196px] m-0 text-center font-fell text-[16px] italic leading-snug tracking-normal">{caption(hud)}</p>

      <button
        type="button"
        aria-label="Tik om te rennen, houd vast om plat te gaan liggen"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          onDown();
        }}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onContextMenu={(e) => e.preventDefault()}
        className="pointer-events-auto absolute inset-x-5 bottom-[calc(22px+env(safe-area-inset-bottom))] flex h-[150px] touch-none items-center justify-around border border-parchment/35 bg-night/45 transition-colors active:border-ochre active:bg-ochre/15"
        style={{ textShadow: "none" }}
      >
        <span className="flex flex-col items-center gap-1">
          <span className="label text-[13px] tracking-[0.2em]">Tik</span>
          <span className="font-fell text-[15px] italic tracking-normal text-bone">ren naar de volgende schoorsteen</span>
        </span>
        <span className="h-16 w-px bg-parchment/25" />
        <span className="flex flex-col items-center gap-1">
          <span className="label text-[13px] tracking-[0.2em]">Houd vast</span>
          <span className="font-fell text-[15px] italic tracking-normal text-bone">plat op de pannen</span>
        </span>
      </button>
    </div>
  );
}

"use client";

import { TUNING } from "@/game/tuning";
import { Bell } from "@/components/ui/icons";
import type { Side } from "./sim";

export interface HudState {
  noise: number;
  dist: number;
  clock: string;
  bellActive: boolean;
  bellIn: number;
  hidden: boolean;
  lit: boolean;
  exposure: number;
  alerted: boolean;
  underBridge: boolean;
  z: number;
  caught: number;
}

export const HUD_START: HudState = {
  noise: 0, dist: TUNING.canal.length, clock: "19:45", bellActive: false, bellIn: 13, hidden: false,
  lit: false, exposure: 0, alerted: false, underBridge: false, z: 0, caught: 0,
};

function marieSays(h: HudState): string {
  if (h.lit && !h.hidden) return "‘We liggen in het licht! Naar het riet!’";
  if (h.alerted) return "‘Te hard! Stil liggen, tot hij wegkijkt.’";
  if (h.bellActive) return "‘De Sint-Jan slaat. Nu roeien, niemand hoort ons.’";
  if (h.underBridge) return "‘Onder de brug ziet hij ons niet. Even ademhalen.’";
  if (h.hidden) return "‘Goed zo. Wacht tot het licht voorbij is.’";
  if (h.z > -10) return "‘Links, rechts, om de beurt. Rustig, dan hoort niemand ons.’";
  if (h.z > -24) return "‘In het riet zijn we onzichtbaar. Onthoud dat.’";
  if (h.z > -68) return "‘Van riet naar riet, als het licht aan de overkant is.’";
  if (h.z > -131) return "‘Dit licht veegt over de hele breedte. Alleen het riet helpt.’";
  return "‘Daar is de sluis. We zijn er bijna.’";
}

function Thumb({ side, onDown, onUp }: { side: Side; onDown: (s: Side) => void; onUp: (s: Side) => void }) {
  const left = side === "L";
  return (
    <button
      type="button"
      aria-label={left ? "Roei links" : "Roei rechts"}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        onDown(side);
      }}
      onPointerUp={() => onUp(side)}
      onPointerCancel={() => onUp(side)}
      onContextMenu={(e) => e.preventDefault()}
      className={`absolute -bottom-[70px] h-60 w-60 touch-none rounded-full border border-parchment/35 bg-night/45 p-0 transition-colors active:border-ochre active:bg-ochre/15 ${left ? "-left-[70px]" : "-right-[70px]"}`}
    >
      <span className={`absolute top-[62px] flex flex-col items-center gap-1.5 ${left ? "left-[92px]" : "left-[80px]"}`}>
        <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
          <path
            d={left ? "M6 28 L24 10 M22 6 l7 7 -4 4 -7 -7z" : "M28 28 L10 10 M12 6 l-7 7 4 4 7 -7z"}
            fill="none"
            stroke="#ede6d6"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        <span className="label text-[12px] tracking-[0.2em] text-parchment">{left ? "Links" : "Rechts"}</span>
      </span>
    </button>
  );
}

/** DOM overlay of the Nachtvaart minigame: every sound cue has a visual twin here. */
export function CanalHud({ hud, onDown, onUp }: { hud: HudState; onDown: (s: Side) => void; onUp: (s: Side) => void }) {
  const bars = Math.round(hud.noise * 10);
  const alertBar = Math.round(TUNING.canal.noiseAlert * 10);
  const ring = 113;
  const wait = Math.max(0, Math.min(1, hud.bellIn / TUNING.canal.bellEvery));

  return (
    <div className="pointer-events-none absolute inset-0 font-label text-parchment">
      <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-night/85 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-night/75 to-transparent" />

      <div className="absolute inset-x-5 top-[max(46px,env(safe-area-inset-top))] flex items-start justify-between">
        <div className="flex flex-col gap-[7px]" role="img" aria-label={`Lawaai ${Math.round(hud.noise * 100)} procent`}>
          <span className="label text-[10.5px] text-bone">Lawaai</span>
          <div className="flex items-end gap-[3px]">
            {Array.from({ length: 10 }, (_, i) => (
              <span
                key={i}
                className="w-[11px] transition-colors duration-150"
                style={{
                  height: 8 + i,
                  background: i < bars ? (i >= alertBar ? "#e25b4a" : "#e2a93a") : i >= alertBar ? "rgba(226,91,74,.35)" : "rgba(237,230,214,.2)",
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="font-fell text-[34px] leading-none">{hud.clock}</span>
          <span className="label text-[10.5px] text-bone">Okt 1944</span>
        </div>
      </div>

      <div className="absolute inset-x-5 top-[calc(max(46px,env(safe-area-inset-top))+70px)] flex items-center gap-2.5 text-[12px] font-semibold tracking-[0.14em]">
        <span>NAAR DE SLUIS</span>
        <span className="h-px flex-1 bg-parchment/30" />
        <span className="font-fell text-[17px] tracking-normal">{Math.max(0, Math.round(hud.dist))} m</span>
      </div>

      <div className="absolute inset-x-5 top-[calc(max(46px,env(safe-area-inset-top))+102px)] flex h-7 items-center">
        {hud.lit && !hud.hidden ? (
          <div className="flex w-full items-center gap-2.5 border-l-2 border-alarm bg-night/65 px-2 py-1">
            <span className="label text-[10px] text-[#f2c1b8]">In het licht</span>
            <span className="h-[3px] flex-1 bg-parchment/15">
              <span className="block h-full bg-alarm" style={{ width: `${Math.min(1, hud.exposure) * 100}%` }} />
            </span>
          </div>
        ) : hud.alerted ? (
          <span className="label border-l-2 border-alarm bg-night/65 px-2 py-1 text-[10px] text-[#f2c1b8]">De wacht heeft iets gehoord</span>
        ) : hud.hidden || hud.underBridge ? (
          <span className="label border-l-2 border-ochre bg-night/65 px-2 py-1 text-[10px] text-ochre">
            {hud.hidden ? "In het riet · onzichtbaar" : "Onder de brug · onzichtbaar"}
          </span>
        ) : null}
      </div>

      <div
        className={`absolute bottom-[196px] left-5 right-5 flex items-center gap-3 border px-2.5 py-2.5 transition-colors duration-300 ${
          hud.bellActive ? "border-ochre bg-ochre/20" : "border-parchment/20 bg-night/60"
        }`}
      >
        <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true" className="flex-none">
          <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(237,230,214,.18)" strokeWidth="2" />
          <circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            stroke="#e2a93a"
            strokeWidth="2"
            strokeDasharray={ring}
            strokeDashoffset={hud.bellActive ? 0 : ring * wait}
            transform="rotate(-90 22 22)"
          />
          <Bell color={hud.bellActive ? "#e2a93a" : "#ede6d6"} />
        </svg>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="label text-[11.5px] tracking-[0.14em]">
            {hud.bellActive ? "De Sint-Jan slaat · roei door" : `Sint-Jan slaat over ${Math.ceil(hud.bellIn)} s`}
          </span>
          <span className="font-fell text-[14.5px] italic leading-tight tracking-normal text-bone">{marieSays(hud)}</span>
        </div>
      </div>

      <div className="pointer-events-auto">
        <Thumb side="L" onDown={onDown} onUp={onUp} />
        <Thumb side="R" onDown={onDown} onUp={onUp} />
      </div>
      <span className="absolute inset-x-0 bottom-[calc(22px+env(safe-area-inset-bottom))] text-center font-fell text-[13px] italic leading-tight text-bone">
        beide vast:
        <br />
        stil liggen
      </span>
    </div>
  );
}

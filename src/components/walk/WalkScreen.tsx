"use client";

import { chapterById } from "@/data/places";
import { legMetres, ROUTE, routeMetres } from "@/data/route";
import { formatMetres } from "@/lib/geo";
import { sfx } from "@/lib/sound";
import { useGameStore } from "@/store/useGameStore";
import { Arrow, Back } from "@/components/ui/icons";
import { WalkMap } from "./WalkMap";

/**
 * The city walk without the games: one round past every place, in a fixed order. What you have
 * seen is kept apart from the game's progress, so the evenings can still be played later.
 */
export function WalkScreen() {
  const { walkSeen, walkStop, openStop, go } = useGameStore();
  const next = ROUTE.findIndex((s) => !walkSeen.includes(s.place));
  const resume = walkSeen.length === 0 ? 0 : next === -1 ? walkStop : next;
  const press = (i: number) => () => (sfx.paper(), openStop(i, ROUTE[i].place));

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-night text-parchment">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-5 pt-[max(46px,env(safe-area-inset-top))]">
        <header className="flex items-start gap-3.5">
          <button type="button" aria-label="Terug naar het begin" onClick={() => go("title")} className="flex h-11 w-11 flex-none items-center justify-center border border-parchment/35">
            <Back color="#ede6d6" />
          </button>
          <div className="flex flex-col gap-1">
            <span className="label text-[length:calc(11px*var(--ts,1))] text-ochre">Zonder spellen</span>
            <h1 className="m-0 font-fell text-[length:calc(30px*var(--ts,1))] font-normal leading-none">Stadswandeling</h1>
            <span className="font-label text-[length:calc(12.5px*var(--ts,1))] tracking-wide text-bone">
              {ROUTE.length} plekken · ongeveer {formatMetres(routeMetres())} in rechte lijn · {walkSeen.length} bezocht
            </span>
          </div>
        </header>

        <WalkMap seen={walkSeen} current={resume} />

        <p className="m-0 font-news text-[length:calc(15px*var(--ts,1))] italic leading-snug text-bone">
          Van het station door de binnenstad naar de Havensluis. Bij elke plek: de beelden, wat er echt gebeurde, de krant en wat je er nog kunt zien.
        </p>

        <ol className="m-0 flex list-none flex-col p-0">
          {ROUTE.map((s, i) => {
            const c = chapterById(s.place);
            const done = walkSeen.includes(s.place);
            const leg = legMetres(i);
            return (
              <li key={s.place} className="flex flex-col">
                <button type="button" onClick={press(i)} className="flex min-h-[60px] items-center gap-3 border-b border-rule py-2.5 text-left">
                  <span className={`flex h-9 w-9 flex-none items-center justify-center font-label text-[length:calc(14px*var(--ts,1))] font-bold ${done ? "bg-ochre text-slate" : "border border-ochre text-parchment"}`}>
                    {i + 1}
                  </span>
                  <span className="flex flex-1 flex-col gap-0.5">
                    <span className="font-news text-[length:calc(16px*var(--ts,1))] font-semibold leading-tight">{c.place}</span>
                    <span className="font-label text-[length:calc(12px*var(--ts,1))] tracking-wide text-ash">
                      {c.dateShort} · {c.title}
                      {done ? " · bezocht" : ""}
                    </span>
                  </span>
                  <Arrow color="#e2a93a" />
                </button>
                {leg !== null && <span className="py-1 pl-12 font-label text-[length:calc(11px*var(--ts,1))] tracking-wide text-ash-dim">↓ {formatMetres(leg)}</span>}
              </li>
            );
          })}
        </ol>
      </div>
      <div className="flex-none px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-2">
        <button type="button" onClick={press(resume)} className="flex h-[54px] w-full items-center justify-between bg-ochre px-[18px] font-label text-[length:calc(14px*var(--ts,1))] font-bold tracking-[0.17em] text-slate">
          {walkSeen.length === 0 ? "BEGIN BIJ HET STATION" : `VERDER: STOP ${resume + 1}`}
          <Arrow color="#14181d" />
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { Spoor } from "@/data/sporen";
import { FactBlock, FactLegend } from "@/components/ui/Fact";
import { DisputeButton } from "@/components/ui/DisputeCard";
import { Arrow } from "@/components/ui/icons";
import { formatMetres, useDistance } from "@/lib/geo";
import { sfx } from "@/lib/sound";
import { useGameStore } from "@/store/useGameStore";

/** One trace: where it is, what to look for, what is known (facts from the register). */
export function SpoorDetail({ spoor, onBack }: { spoor: Spoor; onBack: () => void }) {
  const { mode, seen, markSeen } = useGameStore();
  const location = mode === "location";
  const [measuring, setMeasuring] = useState(false);
  const geo = useDistance(spoor.coords, location && measuring);
  const done = seen.includes(spoor.id);
  const distance =
    geo.status === "ok" ? `Nog ${formatMetres(geo.metres)} lopen` : geo.status === "asking" ? "Je plek wordt gemeten…" : geo.status === "denied" ? "Je plek is niet te bepalen." : "";

  return (
    <div className="flex flex-col gap-4">
      <button type="button" onClick={onBack} className="label -mb-1 h-11 self-start text-[length:calc(11px*var(--ts,1))] text-ochre">
        ← Alle sporen
      </button>
      <img src={spoor.image.src} alt={spoor.image.alt} className="-mx-5 h-[170px] max-w-none object-cover" style={{ width: "calc(100% + 2.5rem)" }} />
      <div className="flex flex-col gap-1">
        <span className="label text-[length:calc(11px*var(--ts,1))] text-bone">
          Hoofdstuk {spoor.chapter} · {spoor.where}
        </span>
        <h3 className="m-0 font-fell text-[length:calc(26px*var(--ts,1))] font-normal leading-tight">{spoor.title}</h3>
      </div>
      <p className="m-0 font-news text-[length:calc(15.5px*var(--ts,1))] italic leading-snug text-bone">{spoor.intro}</p>
      <div className="flex flex-col gap-1.5 border-l-[3px] border-ochre bg-slate/60 px-3.5 py-3">
        <span className="label text-[length:calc(11px*var(--ts,1))] text-ochre">Kijk</span>
        <p className="m-0 font-news text-[length:calc(16px*var(--ts,1))] leading-snug">{spoor.look}</p>
      </div>
      <p className="m-0 font-news text-[length:calc(15.5px*var(--ts,1))] leading-relaxed">
        <FactBlock ids={spoor.facts} dark />
      </p>
      <span className="label text-[length:calc(11px*var(--ts,1))] tracking-[0.1em] text-ash">{spoor.sources}</span>
      <FactLegend ids={spoor.facts} dark />
      {spoor.dispute && <DisputeButton id={spoor.dispute} />}

      {location && !done && (
        <button
          type="button"
          onClick={() => (sfx.paper(), setMeasuring(true))}
          disabled={measuring && geo.status === "ok"}
          className="h-12 border border-rule font-label text-[length:calc(12px*var(--ts,1))] font-bold tracking-[0.12em] disabled:opacity-60"
        >
          {distance || "HOE VER IS HET?"}
        </button>
      )}
      <button
        type="button"
        aria-pressed={done}
        onClick={() => (sfx.stamp(), markSeen(spoor.id))}
        className={`flex h-[54px] items-center justify-between px-[18px] font-label text-[length:calc(14px*var(--ts,1))] font-bold tracking-[0.17em] ${done ? "border border-ochre text-ochre" : "bg-ochre text-slate"}`}
      >
        {done ? "GEZIEN" : location ? "IK HEB HET GEZIEN" : "IK HEB HET OOIT GEZIEN"}
        <Arrow color={done ? "#e2a93a" : "#14181d"} />
      </button>
      {!location && !done && (
        <p className="m-0 font-news text-[length:calc(13.5px*var(--ts,1))] italic leading-snug text-ash">Thuis lezen kan altijd. Zie je het ooit zelf, dan vink je het hier af.</p>
      )}
    </div>
  );
}

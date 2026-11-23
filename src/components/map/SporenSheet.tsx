"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { SPOREN, type Spoor } from "@/data/sporen";
import { FactBlock, FactLegend } from "@/components/ui/Fact";
import { Arrow, Eye } from "@/components/ui/icons";
import { formatMetres, useDistance } from "@/lib/geo";
import { sfx } from "@/lib/sound";
import { useGameStore } from "@/store/useGameStore";

/** One trace: where it is, what to look for, what is known (facts from the register). */
function Detail({ spoor, onBack }: { spoor: Spoor; onBack: () => void }) {
  const { mode, seen, markSeen } = useGameStore();
  const location = mode === "location";
  const [measuring, setMeasuring] = useState(false);
  const geo = useDistance(spoor.coords, location && measuring);
  const done = seen.includes(spoor.id);
  const distance =
    geo.status === "ok"
      ? `Nog ${formatMetres(geo.metres)} lopen`
      : geo.status === "asking"
        ? "Je plek wordt gemeten…"
        : geo.status === "denied"
          ? "Je plek is niet te bepalen."
          : "";

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className={`label -mb-1 h-11 self-start text-[length:calc(11px*var(--ts,1))] text-ochre`}
      >
        ← Alle sporen
      </button>
      <img
        src={spoor.image.src}
        alt={spoor.image.alt}
        className="-mx-5 h-[150px] max-w-none object-cover"
        style={{ width: "calc(100% + 2.5rem)" }}
      />
      <div className="flex flex-col gap-1">
        <span
          className={`label text-[length:calc(11px*var(--ts,1))] text-bone`}
        >
          Hoofdstuk {spoor.chapter} · {spoor.where}
        </span>
        <h3
          className={`m-0 font-fell text-[length:calc(26px*var(--ts,1))] font-normal leading-tight`}
        >
          {spoor.title}
        </h3>
      </div>
      <p
        className={`m-0 font-news text-[length:calc(15.5px*var(--ts,1))] italic leading-snug text-bone`}
      >
        {spoor.intro}
      </p>
      <div className="flex flex-col gap-1.5 border-l-[3px] border-ochre bg-slate/60 px-3.5 py-3">
        <span
          className={`label text-[length:calc(11px*var(--ts,1))] text-ochre`}
        >
          Kijk
        </span>
        <p
          className={`m-0 font-news text-[length:calc(16px*var(--ts,1))] leading-snug`}
        >
          {spoor.look}
        </p>
      </div>
      <p
        className={`m-0 font-news text-[length:calc(15.5px*var(--ts,1))] leading-relaxed`}
      >
        <FactBlock ids={spoor.facts} dark />
      </p>
      <FactLegend ids={spoor.facts} dark />

      {location && !done && (
        <button
          type="button"
          onClick={() => (sfx.paper(), setMeasuring(true))}
          disabled={measuring && geo.status === "ok"}
          className={`h-12 border border-rule font-label text-[length:calc(12px*var(--ts,1))] font-bold tracking-[0.12em] disabled:opacity-60`}
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
        {done
          ? "GEZIEN"
          : location
            ? "IK HEB HET GEZIEN"
            : "IK HEB HET OOIT GEZIEN"}
        <Arrow color={done ? "#e2a93a" : "#14181d"} />
      </button>
      {!location && !done && (
        <p
          className={`m-0 font-news text-[length:calc(13.5px*var(--ts,1))] italic leading-snug text-ash`}
        >
          Thuis lezen kan altijd. Zie je het ooit zelf, dan vink je het hier af.
        </p>
      )}
    </div>
  );
}

export function SporenSheet({ onClose }: { onClose: () => void }) {
  const seen = useGameStore((s) => s.seen);
  const [open, setOpen] = useState<string | null>(null);
  const spoor = SPOREN.find((s) => s.id === open);

  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col justify-end bg-black/60"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-label="Sporen"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="flex max-h-[88%] flex-col bg-[#15191d] text-parchment shadow-[0_-20px_60px_rgba(0,0,0,.7)]"
      >
        <header className="flex items-end justify-between border-b border-rule px-5 pb-3 pt-5">
          <div className="flex flex-col gap-1">
            <span
              className={`label text-[length:calc(11px*var(--ts,1))] text-bone`}
            >
              Wat je nog kunt zien
            </span>
            <h2
              className={`m-0 font-fell text-[length:calc(30px*var(--ts,1))] font-normal leading-none`}
            >
              Sporen
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`label h-11 px-1 text-[length:calc(11px*var(--ts,1))] text-ochre`}
          >
            Sluit
          </button>
        </header>
        <div className="flex flex-col gap-4 overflow-y-auto px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-4">
          {spoor ? (
            <Detail spoor={spoor} onBack={() => setOpen(null)} />
          ) : (
            <>
              <p
                className={`m-0 font-news text-[length:calc(15.5px*var(--ts,1))] italic leading-snug text-bone`}
              >
                Plekken in het centrum waar de oorlog nog te zien is. Geen
                punten en geen tijd: kijk, en vink af wat je hebt gezien.
              </p>
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {SPOREN.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => (sfx.paper(), setOpen(s.id))}
                      className="flex w-full items-center gap-3 bg-parchment px-3.5 py-3 text-left text-ink"
                    >
                      <span className="flex flex-1 flex-col gap-1">
                        <span
                          className={`label text-[length:calc(11px*var(--ts,1))] tracking-[0.18em] text-wax`}
                        >
                          HOOFDSTUK {s.chapter}
                          {seen.includes(s.id) ? " · GEZIEN" : ""}
                        </span>
                        <span
                          className={`font-news text-[length:calc(16px*var(--ts,1))] font-semibold leading-tight`}
                        >
                          {s.title}
                        </span>
                        <span
                          className={`font-news text-[length:calc(13.5px*var(--ts,1))] italic leading-snug text-[#55534d]`}
                        >
                          {s.where}
                        </span>
                      </span>
                      <Arrow color="#9e2a2b" />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </motion.section>
    </motion.div>
  );
}

/** The map button: an eye with the number of traces seen. */
export function SporenButton({ onPress }: { onPress: () => void }) {
  const seen = useGameStore((s) => s.seen.length);
  return (
    <button
      type="button"
      aria-label={`Sporen, ${seen} van ${SPOREN.length} gezien`}
      onClick={onPress}
      className="relative flex h-[46px] w-[46px] items-center justify-center border border-[#3a434b] bg-night/70"
    >
      <Eye color="#ede6d6" />
      <span className="absolute -right-1.5 -top-1.5 h-[18px] min-w-[18px] bg-ochre px-0.5 text-center font-label text-[length:calc(11px*var(--ts,1))] font-bold leading-[calc(18px*var(--ts,1))] text-slate">
        {seen}/{SPOREN.length}
      </span>
    </button>
  );
}

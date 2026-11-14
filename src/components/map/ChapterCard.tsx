"use client";

import { motion } from "motion/react";
import type { Chapter } from "@/data/chapters";
import { formatMetres, type GeoState } from "@/lib/geo";
import { Arrow } from "@/components/ui/icons";

function Field({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="label text-[9.5px] tracking-[0.16em] text-[#6e6a60]">{label}</span>
      <span className={`truncate font-type text-[14px] ${accent ? "text-wax" : ""}`}>{value}</span>
    </div>
  );
}

export interface CardAction {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

/** Ruled index card describing the selected chapter. */
export function ChapterCard({
  chapter,
  state,
  location,
  geo,
  onMeasure,
  primary,
  secondary,
}: {
  chapter: Chapter;
  state: "open" | "done" | "sealed";
  location: boolean;
  geo: GeoState;
  onMeasure: () => void;
  primary: CardAction;
  secondary?: CardAction;
}) {
  const stamp = state === "done" ? "VOLBRACHT" : chapter.status === "soon" ? "IN DE MAAK" : "GEHEIM";
  let distance: React.ReactNode = chapter.time;
  let distanceLabel = "TIJD";
  if (location) {
    distanceLabel = "AFSTAND";
    distance =
      geo.status === "ok" ? (
        formatMetres(geo.metres)
      ) : geo.status === "asking" ? (
        "zoekt…"
      ) : geo.status === "denied" ? (
        "geen gps"
      ) : (
        <button type="button" onClick={onMeasure} className="-my-3 py-3 underline decoration-dotted underline-offset-4">
          meet
        </button>
      );
  }

  return (
    <motion.div
      key={chapter.id}
      initial={{ y: 40, opacity: 0, rotate: -2 }}
      animate={{ y: 0, opacity: 1, rotate: -0.6 }}
      transition={{ type: "spring", stiffness: 210, damping: 24 }}
      className="relative mx-3.5 -mb-3 flex flex-col gap-[9px] bg-parchment px-[18px] pb-[calc(26px+env(safe-area-inset-bottom))] pt-3.5 text-ink shadow-[0_-2px_0_rgba(0,0,0,.2),0_18px_40px_rgba(0,0,0,.6)]"
      style={{ backgroundImage: "repeating-linear-gradient(transparent 0 27px, rgba(70,110,150,.22) 27px 28px)" }}
    >
      <div className="absolute bottom-0 left-10 top-0 w-px bg-[rgba(176,58,46,.35)]" />
      <div className="flex items-center justify-between pl-[34px]">
        <span className="label text-[10.5px] text-[#5c5a52]">Kaart 0{chapter.id} / 05</span>
        <span className="rotate-3 whitespace-nowrap border-[1.5px] border-wax px-1.5 py-px font-stamp text-[12px] tracking-[0.16em] text-wax opacity-85">
          {stamp}
        </span>
      </div>
      <h2 className="m-0 pl-[34px] font-fell text-[28px] font-normal leading-[1.05]">{chapter.title}</h2>
      <div className="grid grid-cols-[1.25fr_1.1fr_0.85fr] gap-2 pl-[34px]">
        <Field label="ADRES" value={chapter.place} />
        <Field label={location ? "TIJD" : "DATUM"} value={location ? chapter.time : chapter.dateShort} />
        <Field label={distanceLabel} value={distance} accent={location} />
      </div>
      <button
        type="button"
        onClick={primary.onPress}
        disabled={primary.disabled}
        className="mt-1.5 flex h-[52px] items-center justify-between bg-press px-[18px] font-label text-[14px] font-bold tracking-[0.17em] text-parchment transition-transform active:translate-x-1 disabled:bg-[#b9b1a0] disabled:text-[#5c5a52] disabled:active:translate-x-0"
      >
        {primary.label.toUpperCase()}
        {!primary.disabled && <Arrow color="#e2a93a" />}
      </button>
      {secondary && (
        <button
          type="button"
          onClick={secondary.onPress}
          className="flex h-11 items-center justify-between border border-press/60 px-[18px] font-label text-[12.5px] font-bold tracking-[0.17em] text-press transition-transform active:translate-x-1"
        >
          {secondary.label.toUpperCase()}
          <Arrow color="#1a1b1c" />
        </button>
      )}
    </motion.div>
  );
}

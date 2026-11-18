"use client";

import { useState } from "react";
import type { ArchiveSlot } from "@/data/chapters";

/**
 * A slot for an archive photograph. With a licensed `image` it shows the photograph and its credit;
 * without one (or when the file is missing) it shows a halftone block that says exactly what is
 * missing. We never generate "archive photos" (CLAUDE.md #7).
 */
export function ArchivePlaceholder({
  slot,
  tone = "dark",
  className = "",
  caption = true,
  onBroken,
}: {
  slot: ArchiveSlot;
  tone?: "dark" | "light";
  className?: string;
  /** Show the credit on the picture; false when the parent shows it elsewhere. */
  caption?: boolean;
  /** Called when the photograph file cannot be loaded and the placeholder takes over. */
  onBroken?: () => void;
}) {
  const [broken, setBroken] = useState(false);
  const dark = tone === "dark";
  const image = slot.image && !broken ? slot.image : undefined;

  if (image) {
    return (
      <figure className={`relative m-0 overflow-hidden bg-press ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/img/archive/${image.file}`}
          alt={image.alt}
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => (setBroken(true), onBroken?.())}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: image.focus ?? "50% 50%" }}
        />
        {caption && (
          <figcaption className="absolute inset-x-0 bottom-0 bg-press/85 px-1.5 py-[3px] font-label text-[length:calc(11px*var(--ts,1))] leading-tight text-parchment">
            {image.credit}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <div
      className={`flex items-end overflow-hidden p-2 ${className}`}
      style={{
        backgroundColor: dark ? "#1a1b1c" : "#d9d1bd",
        backgroundImage: `radial-gradient(circle, ${dark ? "#ece5d3" : "#1a1b1c"} 1.1px, transparent 1.5px)`,
        backgroundSize: "4.5px 4.5px",
      }}
      role="img"
      aria-label={`Nog geen beeld: ${slot.label}`}
    >
      <span
        className="font-label text-[length:calc(11px*var(--ts,1))] font-semibold leading-tight tracking-wide"
        style={{
          background: dark ? "#1a1b1c" : "#ece5d3",
          color: dark ? "#ece5d3" : "#1a1b1c",
          padding: "2px 5px",
        }}
      >
        [{slot.label}]
        <span className="block font-medium opacity-75">{slot.credit}</span>
      </span>
    </div>
  );
}

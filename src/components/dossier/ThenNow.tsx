"use client";

import { useRef, useState } from "react";
import type { ArchiveSlot } from "@/data/chapters";
import { ArchivePlaceholder } from "@/components/ui/ArchivePlaceholder";

/** Draggable then/now comparison. Shows placeholders until licensed photographs exist. */
export function ThenNow({ then, now, year }: { then: ArchiveSlot; now: ArchiveSlot; year: string }) {
  const [pos, setPos] = useState(56);
  const box = useRef<HTMLDivElement>(null);

  const move = (clientX: number) => {
    const r = box.current!.getBoundingClientRect();
    setPos(Math.max(6, Math.min(94, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <div
      ref={box}
      className="relative h-[190px] touch-none overflow-hidden border-[6px] border-[#f4efe3] shadow-[0_3px_10px_rgba(0,0,0,.35)]"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e.clientX);
      }}
      onPointerMove={(e) => e.buttons > 0 && move(e.clientX)}
    >
      <ArchivePlaceholder slot={now} tone="light" className="absolute inset-0" />
      <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <div className="absolute inset-y-0 left-0" style={{ width: box.current?.clientWidth ?? 330 }}>
          <ArchivePlaceholder slot={then} tone="dark" className="absolute inset-0" />
        </div>
      </div>
      <span className="label absolute left-2 top-2 bg-press px-1.5 py-0.5 text-[10px] text-parchment">{year}</span>
      <span className="label absolute right-2 top-2 bg-parchment px-1.5 py-0.5 text-[10px] text-press">Nu</span>
      <div className="absolute inset-y-0 w-0.5 bg-wax" style={{ left: `calc(${pos}% - 1px)` }} />
      <div
        role="slider"
        tabIndex={0}
        aria-label="Vergelijk toen en nu"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setPos((p) => Math.max(6, p - 5));
          if (e.key === "ArrowRight") setPos((p) => Math.min(94, p + 5));
        }}
        className="absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-wax"
        style={{ left: `${pos}%` }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" fill="none" stroke="#ede6d6" strokeWidth="2.2" />
        </svg>
      </div>
    </div>
  );
}

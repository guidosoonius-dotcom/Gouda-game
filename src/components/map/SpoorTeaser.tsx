"use client";

import type { Spoor } from "@/data/sporen";
import { Arrow } from "@/components/ui/icons";
import { sfx } from "@/lib/sound";

/** Under a chapter's newspaper: a trace in town that continues this evening. */
export function SpoorTeaser({ spoor, onOpen }: { spoor: Spoor; onOpen: () => void }) {
  return (
    <aside className="mt-1 flex flex-col border-[1.5px] border-press bg-[#f4efe3]">
      <img src={spoor.image.src} alt={spoor.image.alt} className="h-[130px] w-full object-cover" />
      <div className="flex flex-col gap-2 px-3.5 pb-3.5 pt-3">
        <span className="label text-[length:calc(11px*var(--ts,1))] tracking-[0.16em] text-wax">{spoor.teaser?.label}</span>
        <span className="font-fell text-[length:calc(22px*var(--ts,1))] leading-[1.1]">{spoor.title}</span>
        <p className="m-0 text-[length:calc(14.5px*var(--ts,1))] leading-[1.45] text-[#3c3b37]">{spoor.teaser?.text}</p>
        <button
          type="button"
          onClick={() => (sfx.paper(), onOpen())}
          className="mt-1 flex h-12 items-center justify-between border border-press px-4 font-label text-[length:calc(13px*var(--ts,1))] font-bold tracking-[0.16em] text-press"
        >
          NAAR HET SPOOR
          <Arrow color="#9e2a2b" />
        </button>
      </div>
    </aside>
  );
}

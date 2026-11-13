import { ECHOES, type Flags } from "@/game/choices";
import { CHAPTERS } from "./chapters";

export interface SatchelItem {
  id: string;
  kind: "krant" | "voorwerp" | "bron";
  title: string;
  note: string;
  /** Fiction is always labelled as such. */
  fiction: boolean;
  /** Chapter whose mirror can be re-read from this item. */
  mirrorOf?: number;
}

/** The satchel is derived from progress, so it never needs to be saved separately. */
export function satchelItems(completed: number[], flags: Flags): SatchelItem[] {
  const items: SatchelItem[] = [];
  for (const ch of CHAPTERS) {
    if (!completed.includes(ch.id) || !ch.mirror) continue;
    items.push({
      id: `krant-${ch.id}`,
      kind: "krant",
      title: `De Koerier ${ch.mirror.edition}`,
      note: `${ch.title}. Jouw verhaal naast wat echt gebeurde.`,
      fiction: false,
      mirrorOf: ch.id,
    });
    items.push({
      id: `bron-${ch.id}`,
      kind: "bron",
      title: ch.mirror.scan.label,
      note: ch.mirror.scan.credit,
      fiction: false,
    });
  }
  if (completed.includes(1) && flags["ch1.pass"] === "glazen") {
    items.push({
      id: "pass",
      kind: "voorwerp",
      title: "Doorgangsbewijs van de kerkvoogdij",
      note: "Het reserve-exemplaar. Je hebt het gehouden.",
      fiction: true,
    });
  }
  const nextChapter = Math.max(0, ...completed) + 1;
  for (const e of ECHOES) {
    if (e.slot === "satchel" && e.chapter <= nextChapter && completed.includes(e.chapter) && flags[e.when.flag] === e.when.is) {
      items.push({ id: e.id, kind: "voorwerp", title: "Briefje zonder afzender", note: e.text, fiction: true });
    }
  }
  return items;
}

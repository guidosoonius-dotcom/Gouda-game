import { ECHOES, type Flags } from "@/game/choices";
import { CHAPTERS } from "./chapters";
import { SIDES } from "./sides";

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
  const ch3 = CHAPTERS.find((c) => c.id === 3);
  if (completed.includes(3) && ch3?.memorial) {
    items.push({
      id: "gedenken-3",
      kind: "bron",
      title: `${ch3.memorial.title}: gedenkblad`,
      note: "Wat hier gebeurde, en de namen zodra ze zijn gecontroleerd.",
      fiction: false,
      mirrorOf: 3,
    });
    items.push({
      id: "brief",
      kind: "voorwerp",
      title: "Brief voor een zoon in Amsterdam",
      note: "Een envelop zonder adres. Je draagt hem nog steeds bij je.",
      fiction: true,
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
  const nextChapter = Math.max(0, ...completed.filter((c) => c <= 6)) + 1;
  for (const e of ECHOES) {
    if (e.slot === "satchel" && e.chapter <= nextChapter && completed.includes(e.chapter) && flags[e.when.flag] === e.when.is) {
      items.push({ id: e.id, kind: "voorwerp", title: "Briefje zonder afzender", note: e.text, fiction: true });
    }
  }
  // side stories: their page can be re-read, and each leaves something in the satchel
  for (const side of SIDES) {
    if (!completed.includes(side.id)) continue;
    if (side.mirror) {
      items.push({ id: `zijspoor-${side.id}`, kind: "krant", title: `Zijspoor: ${side.title}`, note: `${side.place}. Jouw verhaal naast wat echt gebeurde.`, fiction: false, mirrorOf: side.id });
      items.push({ id: `ding-${side.id}`, kind: "voorwerp", title: side.mirror.reward, note: "Uit een zijspoor.", fiction: true });
    } else if (side.memorial) {
      items.push({ id: `gedenken-${side.id}`, kind: "bron", title: `${side.memorial.title}: gedenkblad`, note: side.memorial.lead, fiction: false, mirrorOf: side.id });
    }
  }
  return items;
}

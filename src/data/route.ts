/**
 * The city walk: every place of the game in one round through the centre, without the games.
 * From the station (where most visitors arrive) via the Turfmarkt and the Markt to the Sint-Jan,
 * the orphanage and the Oosthaven, ending at the Havensluis. Each stop shows the place's pictures,
 * what really happened there, its newspaper and the traces (sporen) you can still see.
 */
import type { ArchiveImage } from "./chapters";
import { chapterById } from "./places";
import { PAPERS } from "./newspapers";
import type { FactId } from "./sources";
import { haversine } from "@/lib/geo";

export interface Stop {
  /** Chapter or side-story id. */
  place: number;
  /** Ids in `sporen.ts` at this place. */
  sporen: string[];
}

export const ROUTE: Stop[] = [
  { place: 5, sporen: ["station"] },
  { place: 13, sporen: [] },
  { place: 14, sporen: [] },
  { place: 2, sporen: ["zalm"] },
  { place: 12, sporen: [] },
  { place: 1, sporen: ["glas", "kerk"] },
  { place: 11, sporen: [] },
  { place: 3, sporen: [] },
  { place: 4, sporen: [] },
];

/** Straight-line metres from stop `i` to the next one (the real walk is a little longer). */
export function legMetres(i: number): number | null {
  if (i >= ROUTE.length - 1) return null;
  return haversine(chapterById(ROUTE[i].place).coords, chapterById(ROUTE[i + 1].place).coords);
}

export const routeMetres = () => ROUTE.slice(0, -1).reduce((m, _, i) => m + (legMetres(i) ?? 0), 0);

export interface StopPicture {
  src: string;
  alt: string;
  /** A real photograph carries its credit; an illustration says it is one. */
  credit?: string;
}

/** The pictures of a place: its illustrations and any real photograph, each only once. */
export function stopPictures(place: number): StopPicture[] {
  const c = chapterById(place);
  const out: StopPicture[] = [];
  const add = (p: StopPicture) => !out.some((o) => o.src === p.src) && out.push(p);
  const photo = (img: ArchiveImage) => add({ src: `/img/archive/${img.file}`, alt: img.alt, credit: img.credit });
  for (const p of c.pages) {
    if (p.kind === "scene" && p.photo) photo(p.photo);
    if (p.kind === "then-now" && p.then.image) photo(p.then.image);
    if ("image" in p && p.image) add({ src: p.image, alt: `Illustratie bij het verhaal: ${c.title}` });
  }
  return out;
}

/** How many facts a stop shows before it hands over to the newspaper. */
const STOP_FACTS = 3;

/**
 * What really happened here: the opening facts of the lead article (the newspaper tells the
 * rest), or all facts of a memorial.
 */
export function stopFacts(place: number): FactId[] {
  const lead = PAPERS[place]?.[0];
  if (!lead) return chapterById(place).memorial?.facts ?? [];
  return lead.paras.filter((p): p is FactId => typeof p === "string").slice(0, STOP_FACTS);
}

/** A stop has a newspaper to read (places of remembrance have none). */
export const hasPaper = (place: number) => !!chapterById(place).mirror && !!PAPERS[place];

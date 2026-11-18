/** Every place in the game: the five evenings and the side stories. */
import { CHAPTERS, type Chapter, type DossierPage } from "./chapters";
import { SIDES } from "./sides";

export const PLACES: Chapter[] = [...CHAPTERS, ...SIDES];
export const chapterById = (id: number) => PLACES.find((c) => c.id === id)!;

/** Side stories the player can see on the map: opened by a finished chapter, or already done. */
export const openSides = (completed: number[]) => SIDES.filter((s) => s.side!.after === 0 || completed.includes(s.side!.after) || completed.includes(s.id));

/** Text still waiting for a field visit or a source carries a [bracketed note]; players never see it. */
export const isFinished = (text: string) => !text.includes("[");

/**
 * The dossier pages a player sees. A then/now page needs a real archive photograph, or, when
 * playing on location, a finished instruction for the spot; otherwise it is left out instead of
 * showing placeholders.
 */
export function dossierPages(c: Chapter, mode: "location" | "home"): DossierPage[] {
  return c.pages.filter((p) => p.kind !== "then-now" || !!p.then.image || (mode === "location" && isFinished(p.anchor)));
}

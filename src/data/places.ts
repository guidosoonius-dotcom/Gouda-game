/** Every place in the game: the five evenings and the side stories. */
import { CHAPTERS, type Chapter } from "./chapters";
import { SIDES } from "./sides";

export const PLACES: Chapter[] = [...CHAPTERS, ...SIDES];
export const chapterById = (id: number) => PLACES.find((c) => c.id === id)!;

/** Side stories the player can see on the map: opened by a finished chapter, or already done. */
export const openSides = (completed: number[]) => SIDES.filter((s) => s.side!.after === 0 || completed.includes(s.side!.after) || completed.includes(s.id));

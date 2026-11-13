export type Palette = "blue" | "ruby" | "amber" | "green" | "violet";

export interface PieceDef {
  id: string;
  w: number;
  h: number;
  palette: Palette;
  /** Whether the panel starts rotated in the tray. */
  startRot: boolean;
  /** One valid position: used when Willem takes over. */
  sol: { col: number; row: number; rot: boolean };
}

export interface Level {
  crate: string;
  cols: number;
  rows: number;
  pieces: PieceDef[];
}

/** Each crate has exactly as many cells as its panels cover: glass that can slide, breaks. */
export const LEVELS: Level[] = [
  {
    crate: "27",
    cols: 4,
    rows: 4,
    pieces: [
      { id: "a", w: 2, h: 3, palette: "blue", startRot: false, sol: { col: 0, row: 0, rot: false } },
      { id: "c", w: 1, h: 2, palette: "amber", startRot: false, sol: { col: 2, row: 2, rot: true } },
      { id: "b", w: 2, h: 2, palette: "ruby", startRot: false, sol: { col: 2, row: 0, rot: false } },
      { id: "e", w: 1, h: 1, palette: "violet", startRot: false, sol: { col: 3, row: 3, rot: false } },
      { id: "d", w: 1, h: 3, palette: "green", startRot: false, sol: { col: 0, row: 3, rot: true } },
    ],
  },
  {
    crate: "28",
    cols: 5,
    rows: 5,
    pieces: [
      { id: "b", w: 2, h: 3, palette: "ruby", startRot: false, sol: { col: 2, row: 0, rot: true } },
      { id: "d", w: 1, h: 3, palette: "amber", startRot: true, sol: { col: 4, row: 2, rot: false } },
      { id: "c", w: 2, h: 2, palette: "green", startRot: false, sol: { col: 2, row: 2, rot: false } },
      { id: "g", w: 1, h: 1, palette: "ruby", startRot: false, sol: { col: 3, row: 4, rot: false } },
      { id: "a", w: 2, h: 3, palette: "blue", startRot: true, sol: { col: 0, row: 0, rot: false } },
      { id: "e", w: 1, h: 2, palette: "violet", startRot: false, sol: { col: 0, row: 3, rot: true } },
      { id: "f", w: 1, h: 3, palette: "blue", startRot: false, sol: { col: 0, row: 4, rot: true } },
    ],
  },
];

export interface Piece extends PieceDef {
  rot: boolean;
  at: { col: number; row: number } | null;
}

export const initPieces = (level: Level): Piece[] => level.pieces.map((p) => ({ ...p, rot: p.startRot, at: null }));

export const dims = (p: { w: number; h: number; rot: boolean }) => (p.rot ? { w: p.h, h: p.w } : { w: p.w, h: p.h });

export function canPlace(level: Level, pieces: Piece[], piece: Piece, col: number, row: number): boolean {
  const d = dims(piece);
  if (col < 0 || row < 0 || col + d.w > level.cols || row + d.h > level.rows) return false;
  for (const other of pieces) {
    if (other.id === piece.id || !other.at) continue;
    const o = dims(other);
    const apart =
      col + d.w <= other.at.col || other.at.col + o.w <= col || row + d.h <= other.at.row || other.at.row + o.h <= row;
    if (!apart) return false;
  }
  return true;
}

export const isPacked = (pieces: Piece[]) => pieces.every((p) => p.at !== null);

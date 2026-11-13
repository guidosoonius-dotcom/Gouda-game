"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TUNING } from "@/game/tuning";
import { sfx } from "@/lib/sound";
import { LEVELS, canPlace, dims, initPieces, isPacked, type Piece } from "./levels";
import type { Hover } from "./Crate";

export type Phase = "play" | "lid" | "helping" | "done";
const T = TUNING.packing;
const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

/** All state and rules of the packing puzzle; the component only draws. */
export function usePacking(cell: number, stage: React.RefObject<HTMLDivElement | null>, crate: React.RefObject<HTMLDivElement | null>) {
  const [levelIndex, setLevelIndex] = useState(0);
  const level = LEVELS[levelIndex];
  const [pieces, setPieces] = useState<Piece[]>(() => initPieces(LEVELS[0]));
  const [phase, setPhase] = useState<Phase>("play");
  const [rumbles, setRumbles] = useState(0);
  const [toNext, setToNext] = useState(0);
  const [dragId, setDragId] = useState<string | null>(null);
  const [hover, setHover] = useState<Hover | null>(null);
  const [moves, setMoves] = useState(0);
  const helped = useRef(false);
  const elapsed = useRef(0);
  const rumbleCount = useRef(0);
  const float = useRef<HTMLDivElement>(null);
  const live = useRef({ pieces, level, phase, cell });
  live.current = { pieces, level, phase, cell };

  // Shock-wave clock: only runs while the player is actually packing.
  useEffect(() => {
    if (phase !== "play") return;
    const id = window.setInterval(() => {
      elapsed.current += 0.25;
      const n = Math.floor(elapsed.current / T.rumbleInterval);
      setToNext((elapsed.current % T.rumbleInterval) / T.rumbleInterval);
      if (n > rumbleCount.current) {
        rumbleCount.current = n;
        setRumbles(n);
        sfx.rumble();
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [phase]);

  const closeCrate = useCallback(async (index: number) => {
    setPhase("lid");
    sfx.lid();
    await wait(1900);
    if (index + 1 < LEVELS.length && !helped.current) {
      setLevelIndex(index + 1);
      setPieces(initPieces(LEVELS[index + 1]));
      setPhase("play");
    } else {
      sfx.chime();
      setPhase("done");
    }
  }, []);

  // Third shock wave: Willem takes over the rest of this crate (no game over, the story changes).
  useEffect(() => {
    if (rumbles < T.rumblesBeforeHelp || phase !== "play") return;
    helped.current = true;
    setPhase("helping");
    setDragId(null);
    setHover(null);
    void (async () => {
      await wait(900);
      setPieces((ps) => ps.map((p) => ({ ...p, at: null })));
      for (const def of live.current.level.pieces) {
        await wait(360);
        sfx.settle();
        setPieces((ps) => ps.map((p) => (p.id === def.id ? { ...p, rot: def.sol.rot, at: { col: def.sol.col, row: def.sol.row } } : p)));
      }
      await wait(500);
      void closeCrate(LEVELS.indexOf(live.current.level));
    })();
  }, [rumbles, phase, closeCrate]);

  const grab = useCallback(
    (e: React.PointerEvent, piece: Piece) => {
      if (live.current.phase !== "play") return;
      e.preventDefault();
      const start = { x: e.clientX, y: e.clientY };
      const touch = e.pointerType !== "mouse";
      let moved = false;
      let target: Hover | null = null;

      const place = (ev: PointerEvent) => {
        const { cell: c, level: lv, pieces: ps } = live.current;
        const current = ps.find((p) => p.id === piece.id)!;
        const d = dims(current);
        const s = stage.current!.getBoundingClientRect();
        const x = ev.clientX - s.left - (d.w * c) / 2;
        const y = ev.clientY - s.top - (touch ? d.h * c + T.fingerLift - 28 : (d.h * c) / 2);
        if (float.current) float.current.style.transform = `translate(${x}px, ${y}px)`;
        const k = crate.current!.getBoundingClientRect();
        const fx = (x + s.left - k.left) / c;
        const fy = (y + s.top - k.top) / c;
        const col = Math.round(fx);
        const row = Math.round(fy);
        const near = fx > -d.w * T.snapCells && fy > -d.h * T.snapCells && fx < lv.cols - d.w * (1 - T.snapCells) && fy < lv.rows - d.h * (1 - T.snapCells);
        const next: Hover | null = near
          ? { col: Math.max(0, Math.min(lv.cols - d.w, col)), row: Math.max(0, Math.min(lv.rows - d.h, row)), w: d.w, h: d.h, valid: false }
          : null;
        if (next) next.valid = canPlace(lv, ps, current, next.col, next.row);
        if (JSON.stringify(next) !== JSON.stringify(target)) setHover(next);
        target = next;
      };

      const onMove = (ev: PointerEvent) => {
        if (!moved && Math.hypot(ev.clientX - start.x, ev.clientY - start.y) < T.dragThreshold) return;
        if (!moved) {
          moved = true;
          setDragId(piece.id);
          sfx.clink();
        }
        // The floating element mounts on the next frame; position it then as well.
        place(ev);
        requestAnimationFrame(() => place(ev));
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        setDragId(null);
        setHover(null);
        let next: Piece[];
        const ps = live.current.pieces;
        if (!moved) {
          // Tap: rotate in the tray, or lift a packed panel back out.
          sfx.clink();
          next = ps.map((p) => (p.id === piece.id ? (p.at ? { ...p, at: null } : { ...p, rot: !p.rot }) : p));
        } else if (target?.valid) {
          sfx.settle();
          setMoves((m) => m + 1);
          next = ps.map((p) => (p.id === piece.id ? { ...p, at: { col: target!.col, row: target!.row } } : p));
        } else {
          if (target) sfx.reject();
          next = ps.map((p) => (p.id === piece.id ? { ...p, at: null } : p));
        }
        setPieces(next);
        if (isPacked(next)) void closeCrate(LEVELS.indexOf(live.current.level));
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [stage, crate, closeCrate],
  );

  return { level, levelIndex, pieces, phase, rumbles, toNext, dragId, hover, moves, float, grab, helped: helped.current };
}

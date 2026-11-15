"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export interface View {
  zoom: number;
  /** Translation of the map layer in CSS pixels (the layer is `stage.w` wide at zoom 1). */
  x: number;
  y: number;
}
export interface Stage {
  w: number;
  h: number;
}

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 2.6;
const START_ZOOM = 1.6;
/** Where on the stage a chapter lands when it is selected: centred sideways, a bit above the middle. */
const FOCUS_AT = { x: 0.5, y: 0.44 };
/** The map may slide this far down under the header, in pixels. */
const TOP_ROOM = 64;
/** A finger must move this far before it is a drag and not a tap on a seal. */
const SLOP = 7;

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * Pan and zoom of the old map: drag with a finger, pinch, the +/- buttons or the wheel, with a little
 * momentum. Choosing a chapter glides the map to it. `ratio` is map height / width.
 */
export function useMapView(stage: Stage, ratio: number, focus: { x: number; y: number }, focusKey: number) {
  const [view, setView] = useState<View>({ zoom: START_ZOOM, x: 0, y: 0 });
  const [smooth, setSmooth] = useState(true);
  const [away, setAway] = useState(false);
  const v = useRef(view);
  v.current = view;
  const st = useRef(stage);
  st.current = stage;
  const focusRef = useRef(focus);
  focusRef.current = focus;

  const limit = useCallback((c: View): View => {
    const { w, h } = st.current;
    const lw = w * c.zoom;
    const lh = lw * ratio;
    return {
      zoom: c.zoom,
      x: lw <= w ? (w - lw) / 2 : clamp(c.x, w - lw, 0),
      y: lh <= h ? (h - lh) / 2 : clamp(c.y, h - lh, TOP_ROOM),
    };
  }, [ratio]);

  /** The view that puts `f` (percent of the map) at the usual place on the stage. */
  const targetFor = useCallback(
    (f: { x: number; y: number }, zoom: number) => {
      const { w, h } = st.current;
      const lw = w * zoom;
      return limit({ zoom, x: w * FOCUS_AT.x - (f.x / 100) * lw, y: h * FOCUS_AT.y - (f.y / 100) * lw * ratio });
    },
    [limit, ratio],
  );

  // A new chapter (or the first measurement of the stage): glide there, at the zoom the player chose.
  useLayoutEffect(() => {
    if (stage.w === 0) return;
    setSmooth(true);
    setView(targetFor(focusRef.current, v.current.zoom));
    setAway(false);
  }, [focusKey, stage.w, stage.h, targetFor]);

  const recenter = useCallback(() => {
    setSmooth(true);
    setView(targetFor(focusRef.current, Math.max(v.current.zoom, START_ZOOM)));
    setAway(false);
  }, [targetFor]);

  /** Zoom by a factor around a point of the stage (default: its middle). */
  const zoomAt = useCallback(
    (factor: number, px?: number, py?: number, animate = false) => {
      const { w, h } = st.current;
      const c = v.current;
      const zoom = clamp(c.zoom * factor, MIN_ZOOM, MAX_ZOOM);
      const f = zoom / c.zoom;
      const ax = px ?? w / 2;
      const ay = py ?? h / 2;
      setSmooth(animate);
      setView(limit({ zoom, x: ax - (ax - c.x) * f, y: ay - (ay - c.y) * f }));
      setAway(true);
    },
    [limit],
  );

  // ---- gestures ----
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const drag = useRef({ moved: false, lastT: 0, vx: 0, vy: 0, startX: 0, startY: 0, pinch: 0 });
  const raf = useRef(0);
  const dragged = useRef(false);

  const stopMomentum = () => cancelAnimationFrame(raf.current);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const onPointerDown = (e: React.PointerEvent) => {
    stopMomentum();
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const d = drag.current;
    if (pointers.current.size === 1) Object.assign(d, { moved: false, startX: e.clientX, startY: e.clientY, vx: 0, vy: 0, lastT: e.timeStamp });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      d.pinch = Math.hypot(a.x - b.x, a.y - b.y);
      d.moved = true;
    }
    dragged.current = false;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const p = pointers.current.get(e.pointerId);
    if (!p) return;
    const d = drag.current;
    const rect = e.currentTarget.getBoundingClientRect();
    if (pointers.current.size >= 2) {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (d.pinch > 0) zoomAt(dist / d.pinch, (a.x + b.x) / 2 - rect.left, (a.y + b.y) / 2 - rect.top);
      d.pinch = dist;
      dragged.current = true;
      return;
    }
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    if (!d.moved) {
      if (Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < SLOP) return;
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    dragged.current = true;
    const dt = Math.max(1, e.timeStamp - d.lastT);
    d.vx = 0.8 * d.vx + 0.2 * (dx / dt);
    d.vy = 0.8 * d.vy + 0.2 * (dy / dt);
    d.lastT = e.timeStamp;
    setSmooth(false);
    setAway(true);
    setView((c) => limit({ ...c, x: c.x + dx, y: c.y + dy }));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    const d = drag.current;
    if (pointers.current.size === 1) {
      // one finger of a pinch is still down: carry on dragging from where it is
      const rest = [...pointers.current.values()][0];
      Object.assign(d, { startX: rest.x, startY: rest.y, pinch: 0 });
      return;
    }
    if (pointers.current.size > 0 || !d.moved || reduced()) return;
    // a little momentum
    let vx = d.vx;
    let vy = d.vy;
    if (Math.hypot(vx, vy) < 0.15 || e.timeStamp - d.lastT > 90) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(40, now - last);
      last = now;
      const k = Math.exp(-dt / 260);
      vx *= k;
      vy *= k;
      setView((c) => limit({ ...c, x: c.x + vx * dt, y: c.y + vy * dt }));
      if (Math.hypot(vx, vy) > 0.02) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  /** True right after a drag, so the click that ends it does not select a chapter. */
  const swallowClick = (e: React.MouseEvent) => {
    if (dragged.current) {
      e.stopPropagation();
      dragged.current = false;
    }
  };

  const wheel = useCallback(
    (e: WheelEvent, rect: DOMRect) => {
      e.preventDefault();
      zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX - rect.left, e.clientY - rect.top);
    },
    [zoomAt],
  );

  return {
    view,
    smooth,
    away,
    recenter,
    zoomIn: () => zoomAt(1.45, undefined, undefined, true),
    zoomOut: () => zoomAt(1 / 1.45, undefined, undefined, true),
    wheel,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onClickCapture: swallowClick },
  };
}

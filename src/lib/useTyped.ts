"use client";

import { useEffect, useRef, useState } from "react";
import { sfx } from "./sound";

/** Typewriter reveal. Returns the visible part of `text`, whether it is done, and a skip function. */
export function useTyped(text: string, cps = 38) {
  const [count, setCount] = useState(0);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced.current) return setCount(text.length);
    setCount(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setCount(i);
      const ch = text[i - 1];
      if (ch && ch !== " " && i % 2 === 0) sfx.key();
      if (i >= text.length) window.clearInterval(id);
    }, 1000 / cps);
    return () => window.clearInterval(id);
  }, [text, cps]);

  return { shown: text.slice(0, count), done: count >= text.length, skip: () => setCount(text.length) };
}

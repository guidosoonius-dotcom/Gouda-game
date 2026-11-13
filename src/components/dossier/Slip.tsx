"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { useTyped } from "@/lib/useTyped";

/** A typed note held by a paperclip: the voice of the story. */
export function Slip({
  lines,
  quote,
  echo,
  onDone,
}: {
  lines: string[];
  quote?: string;
  echo?: string;
  onDone?: () => void;
}) {
  const text = lines.join(" ");
  const { shown, done, skip } = useTyped(text);
  useEffect(() => {
    if (done) onDone?.();
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      initial={{ opacity: 0, y: -18, rotate: -4 }}
      animate={{ opacity: 1, y: 0, rotate: -1.4 }}
      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.25, 1] }}
      onClick={skip}
      className="relative mx-0.5 bg-parchment px-5 pb-4 pt-[18px] text-ink shadow-[0_14px_30px_rgba(0,0,0,.55)]"
    >
      <svg width="18" height="44" viewBox="0 0 18 44" className="absolute -top-[18px] right-[26px]" aria-hidden="true">
        <path d="M5 40V8a4 4 0 0 1 8 0v28a2.5 2.5 0 0 1-5 0V12" fill="none" stroke="#8c9298" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      {/* Full text reserves the height, so the slip does not grow while typing. */}
      <p className="relative m-0 font-type text-[14.5px] leading-[1.55]">
        <span className="invisible" aria-hidden="true">
          {text}▍
        </span>
        <span className="absolute inset-0">
          {shown}
          <span className="anim-caret text-wax">▍</span>
        </span>
        <span className="sr-only">{text}</span>
      </p>
      {quote && (
        <p
          className="m-0 mt-2.5 font-news text-[17px] italic leading-[1.4] transition-opacity duration-700"
          style={{ opacity: done ? 1 : 0 }}
        >
          {quote}
        </p>
      )}
      {echo && (
        <p
          className="m-0 mt-2.5 border-l-2 border-wax pl-2.5 font-news text-[14.5px] italic leading-snug text-[#4a4842] transition-opacity delay-300 duration-700"
          style={{ opacity: done ? 1 : 0 }}
        >
          {echo}
        </p>
      )}
    </motion.div>
  );
}

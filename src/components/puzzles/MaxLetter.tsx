"use client";

/**
 * One of Max's letters home on airmail paper. The paper is painted, the words are plain text (sharp,
 * scalable, copyable). Max and his letters are fiction (`data/rooms.ts`).
 */
export function MaxLetter({ month, text }: { month: string; text: string }) {
  const m = /^((?:Liebe )?Mama,)\s+(.*)$/.exec(text);
  const greeting = m?.[1] ?? "";
  const body = m?.[2] ?? "";
  return (
    <figure
      className="relative m-0 aspect-square w-full -rotate-[1.2deg] shadow-[0_14px_34px_rgba(0,0,0,.6)]"
      style={{ background: "#ece5d3 url(/img/weeshuis/brief.webp) center/cover" }}
    >
      <div className="absolute inset-[12%] flex flex-col gap-2.5 bg-[#ece5d3]/75 p-2 font-fell italic text-[#1d2124]">
        <span className="text-[length:calc(14px*var(--ts,1))] text-[#3a3f45]">Gouda, {month.toLowerCase()}</span>
        <p className="m-0 text-[length:calc(19px*var(--ts,1))] leading-[1.35]">
          {body ? (
            <>
              {greeting}
              <br />
              {body}
            </>
          ) : (
            text
          )}
        </p>
      </div>
    </figure>
  );
}

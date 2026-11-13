import type { ArchiveSlot } from "@/data/chapters";

/**
 * Stand-in for a licensed archive scan. We never generate "archive photos" (CLAUDE.md #7):
 * until a real scan with rights exists, this halftone block says exactly what is missing.
 */
export function ArchivePlaceholder({
  slot,
  tone = "dark",
  className = "",
}: {
  slot: ArchiveSlot;
  tone?: "dark" | "light";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div
      className={`flex items-end overflow-hidden p-2 ${className}`}
      style={{
        backgroundColor: dark ? "#1a1b1c" : "#d9d1bd",
        backgroundImage: `radial-gradient(circle, ${dark ? "#ece5d3" : "#1a1b1c"} 1.1px, transparent 1.5px)`,
        backgroundSize: "4.5px 4.5px",
      }}
      role="img"
      aria-label={`Nog geen beeld: ${slot.label}`}
    >
      <span
        className="font-label text-[10px] font-semibold leading-tight tracking-wide"
        style={{
          background: dark ? "#1a1b1c" : "#ece5d3",
          color: dark ? "#ece5d3" : "#1a1b1c",
          padding: "2px 5px",
        }}
      >
        [{slot.label}]
        <span className="block font-medium opacity-75">{slot.credit}</span>
      </span>
    </div>
  );
}

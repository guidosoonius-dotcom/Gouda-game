import { FACTS, type Fact, type FactId } from "@/data/sources";

/**
 * Renders factual claims from the sources register (CLAUDE.md #7).
 * Verified: plain text. Unverified: shown in every build, but visibly marked (dotted line and a
 * question mark) with what is still being checked in its title, so a player never takes it for a
 * checked fact.
 */
/** Legend for the dotted markers; only rendered while one of the facts is unverified. */
export function FactLegend({ ids, dark = false }: { ids: FactId[]; dark?: boolean }) {
  if (ids.every((id) => FACTS[id].verified)) return null;
  return (
    <span className={`font-label text-[length:calc(11px*var(--ts,1))] font-semibold tracking-wide ${dark ? "text-[#f0b5aa]" : "text-wax-dark"}`}>
      [?] GESTIPPELD = NOG NIET GECONTROLEERD, BRON BEKEND
    </span>
  );
}

export function FactText({ id, dark = false }: { id: FactId; dark?: boolean }) {
  const fact: Fact = FACTS[id];
  if (fact.verified) return <>{fact.claim}</>;
  return (
    <span className={dark ? "tbc-dark" : "tbc"} title={`Nog te controleren: ${fact.todo ?? fact.source}`}>
      {fact.claim}
      <sup className="ml-0.5 font-label text-[length:calc(11px*var(--ts,1))] font-bold">[?]</sup>
    </span>
  );
}

/** A run of facts as one paragraph. */
export function FactBlock({ ids, dark = false }: { ids: FactId[]; dark?: boolean }) {
  return (
    <>
      {ids.map((id) => (
        <span key={id}>
          <FactText id={id} dark={dark} />{" "}
        </span>
      ))}
    </>
  );
}

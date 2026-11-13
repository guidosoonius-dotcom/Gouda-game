import { FACTS, SHOW_UNVERIFIED, type Fact, type FactId } from "@/data/sources";

/**
 * Renders one factual claim from the sources register.
 * Verified: plain text. Unverified: visibly marked in dev/preview, withheld in production.
 */
/** Legend for the dotted markers; only rendered while unverified facts are visible. */
export function FactLegend({ ids }: { ids: FactId[] }) {
  if (!SHOW_UNVERIFIED || ids.every((id) => FACTS[id].verified)) return null;
  return (
    <span className="font-label text-[10px] font-semibold tracking-wide text-wax-dark">
      [?] ROOD GESTIPPELD = NOG NIET GEVERIFIEERD, BRON VOLGT
    </span>
  );
}

export function FactText({ id, dark = false }: { id: FactId; dark?: boolean }) {
  const fact: Fact = FACTS[id];
  if (fact.verified) return <>{fact.claim}</>;
  if (!SHOW_UNVERIFIED) {
    return <span className={dark ? "tbc-dark" : "tbc"}>[Dit feit wordt nog gecontroleerd.]</span>;
  }
  return (
    <span className={dark ? "tbc-dark" : "tbc"} title={`Te verifiëren: ${fact.todo ?? fact.source}`}>
      {fact.claim}
      <sup className="ml-0.5 font-label text-[9px] font-bold">[?]</sup>
    </span>
  );
}

/**
 * A run of facts as one paragraph. In production, unverified claims are withheld and replaced by
 * a single honest note instead of a row of gaps.
 */
export function FactBlock({ ids }: { ids: FactId[] }) {
  const hidden = SHOW_UNVERIFIED ? [] : ids.filter((id) => !FACTS[id].verified);
  const shown = ids.filter((id) => !hidden.includes(id));
  return (
    <>
      {shown.map((id) => (
        <span key={id}>
          <FactText id={id} />{" "}
        </span>
      ))}
      {hidden.length > 0 && (
        <span className="tbc">
          [{hidden.length === 1 ? "Eén feit wordt" : `${hidden.length} feiten worden`} hier nog gecontroleerd door een historicus.]
        </span>
      )}
    </>
  );
}

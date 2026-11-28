/**
 * Where historians disagree. Shown to players as "Bronnen verschillen": the sources side by side,
 * without choosing, plus what is settled. Each voice says what a source says, not what happened,
 * and names that source; the settled part is facts from the register.
 */
import type { FactId } from "./sources";

export interface Voice {
  year: string;
  who: string;
  says: string;
}

export interface Dispute {
  question: string;
  intro: string;
  voices: Voice[];
  settled: FactId[];
}

export const DISPUTES = {
  bevrijding: {
    question: "Was Gouda op 5 mei al bevrijd?",
    intro: "Historici kijken niet altijd hetzelfde naar wat er gebeurde. Hier zie je wie wat zegt, naast elkaar.",
    voices: [
      { year: "1985", who: "A. Scheygrond, Tidinge", says: "In De Zalm droeg de Ortskommandant op 5 mei de macht over. Daarmee was de bevrijding van Gouda een feit." },
      { year: "1995", who: "Rinus van Dam, ‘Gouda in de Tweede Wereldoorlog’", says: "Een hoofdstuk van zijn boek heet ‘Gouda bevrijdt zichzelf, 5 mei 1945’." },
      { year: "2025", who: "Erik Kooistra, ‘80 jaar in dienst van de vrijheid’", says: "Geen enkele Nederlandse stad werd op 5 mei bevrijd. In Gouda leefden verhalen die niet altijd klopten." },
    ],
    settled: ["stadhuis.return", "liberation.may"],
  },
} as const satisfies Record<string, Dispute>;

export type DisputeId = keyof typeof DISPUTES;

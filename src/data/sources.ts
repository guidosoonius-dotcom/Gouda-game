/**
 * Register of every factual claim and real name shown to players.
 * Rule (CLAUDE.md #7): nothing here is presented as fact until `verified` is true
 * and `source` points at a checkable reference.
 */
export interface Fact {
  /** Player-facing Dutch sentence. */
  claim: string;
  /** Where the claim was (or must be) checked. */
  source: string;
  /** What exactly still needs checking. */
  todo?: string;
  verified: boolean;
}

const UNSOURCED = "nog te bepalen (Streekarchief Midden-Holland / Sint-Janskerk Gouda)";

export const FACTS = {
  "glazen.what": {
    claim:
      "De Sint-Janskerk bezit een reeks zestiende-eeuwse gebrandschilderde ramen: de Goudse Glazen.",
    source: UNSOURCED,
    todo: "aantal glazen en datering",
    verified: false,
  },
  "glazen.removed": {
    claim:
      "Rond het uitbreken van de oorlog zijn de glazen paneel voor paneel uit de sponningen genomen en in kisten verpakt.",
    source: UNSOURCED,
    todo: "jaar, opdrachtgever en uitvoerende glazenier",
    verified: false,
  },
  "glazen.stored": {
    claim: "De kisten zijn buiten de stad in veiligheid gebracht.",
    source: UNSOURCED,
    todo: "opslagplaatsen en data van de transporten",
    verified: false,
  },
  "glazen.returned": {
    claim: "Na de bevrijding zijn de glazen teruggeplaatst. Je kunt ze vandaag in de kerk zien.",
    source: UNSOURCED,
    todo: "jaar van terugplaatsing; of er originele kisten in de kerk staan",
    verified: false,
  },
  "rotterdam.bombing": {
    claim: "Op 14 mei 1940 werd de binnenstad van Rotterdam gebombardeerd.",
    source: "nog te bepalen (NIOD / Stadsarchief Rotterdam)",
    todo: "tijdstip; of de rook vanuit Gouda zichtbaar was",
    verified: false,
  },
  "vroman.flight": {
    claim:
      "De in Gouda opgegroeide dichter en bioloog Leo Vroman vluchtte in mei 1940 naar Engeland.",
    source: "nog te bepalen (biografie / Literatuurmuseum)",
    todo: "datum, route en vervoermiddel",
    verified: false,
  },
  "press.gouda": {
    claim: "In Gouda werden tijdens de bezetting illegale bladen gedrukt en door koeriers rondgebracht.",
    source: UNSOURCED,
    todo: "titels, drukkers, adressen en jaren",
    verified: false,
  },
  "oosthaven.home": {
    claim: "Aan de Oosthaven 31 was tot 1943 een Joods bejaardentehuis gevestigd.",
    source: "nog te bepalen (Joods Monument / Streekarchief Midden-Holland)",
    todo: "naam van het tehuis, aantal bewoners en personeel",
    verified: false,
  },
  "oosthaven.deportation": {
    claim: "In het voorjaar van 1943 zijn de bewoners weggevoerd. Bijna niemand van hen heeft de oorlog overleefd.",
    source: "nog te bepalen (Joods Monument / Stichting Stolpersteine Gouda)",
    todo: "datum, route, aantallen en alle namen",
    verified: false,
  },
  "station.raid": {
    claim: "Op 26 november 1944 vielen geallieerde vliegtuigen het spoor bij Gouda aan. Ook huizen en een ziekenhuis in de buurt werden getroffen.",
    source: UNSOURCED,
    todo: "tijdstip, aantal toestellen, getroffen gebouwen, aantal en namen van de slachtoffers",
    verified: false,
  },
  "lbd.role": {
    claim: "De Luchtbeschermingsdienst bracht bij luchtalarm mensen naar schuilkelders en hielp na een inslag bij het redden.",
    source: "nog te bepalen (NIOD / Streekarchief Midden-Holland)",
    todo: "organisatie in Gouda, plaats van schuilkelders bij het station",
    verified: false,
  },
  "liberation.gouda": {
    claim: "In mei 1945 werd Gouda bevrijd.",
    source: UNSOURCED,
    todo: "datum en verloop van de bevrijding van Gouda",
    verified: false,
  },
  "curfew.hours": {
    claim: "Tijdens de bezetting gold een spertijd: 's avonds mocht niemand zonder vergunning op straat.",
    source: "nog te bepalen (NIOD)",
    todo: "tijden per periode",
    verified: false,
  },
  "locks.route": {
    claim:
      "Via de Goudse sluizen en de plassen ten noorden van de stad werden in de laatste oorlogswinter mensen en voedsel over water verplaatst.",
    source: UNSOURCED,
    todo: "welke sluizen, welke periode, bronvermelding",
    verified: false,
  },
} as const satisfies Record<string, Fact>;

export type FactId = keyof typeof FACTS;

/** Unverified claims are only shown (clearly marked) in dev and preview builds. */
export const SHOW_UNVERIFIED =
  process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_SHOW_UNVERIFIED === "1";

export function unverifiedFacts(): FactId[] {
  return (Object.keys(FACTS) as FactId[]).filter((id) => !FACTS[id].verified);
}

/**
 * Sporen: things you can still look at in the centre of Gouda, each tied to a place in the game.
 * Every claim is a fact in `sources.ts`; the look-assignments only say where to look. No score, no
 * clock, no way to fail (like chapter 3). Where sources disagree, the trace points to a dispute
 * (`disputes.ts`) instead of choosing.
 */
import type { DisputeId } from "./disputes";
import type { FactId } from "./sources";

export interface Spoor {
  id: string;
  /** The chapter this trace belongs to (its evening, or the place it continues). */
  chapter: number;
  /** Group heading in the list: the place, in capitals. */
  place: string;
  title: string;
  where: string;
  coords: { lat: number; lng: number };
  image: { src: string; alt: string };
  /** What to look for on location. */
  look: string;
  /** Short text before the facts: a link to the evening, no claims of its own. */
  intro: string;
  facts: FactId[];
  /** One line naming the sources, shown under the facts. */
  sources: string;
  dispute?: DisputeId;
  /** Under the newspaper of its chapter: a label and a line pointing to this trace (no claims). */
  teaser?: { label: string; text: string };
}

const SINT_JAN = { lat: 52.01083, lng: 4.71139 };

export const SPOREN: Spoor[] = [
  {
    id: "glas",
    chapter: 1,
    place: "Sint-Janskerk",
    title: "Het Bevrijdingsglas",
    where: "Glas 28a",
    coords: SINT_JAN,
    image: { src: "/img/scenes/kisten.webp", alt: "De kisten met glas in de Sint-Janskerk" },
    look: "Zoek in de kerk glas 28a. Boven het donkere wolken met ruiters, onder een kleurige stoet.",
    intro: "In Hoofdstuk 1 pak je de glazen van de Sint-Jan in kisten. Dit is wat de kerk er nu van laat zien.",
    facts: ["glazen.returned", "spoor.glas.maker", "spoor.glas.beeld"],
    sources: "Bronnen: Denslagen (DBNL), Nationaal Comité 4 en 5 mei",
  },
  {
    id: "kerk",
    chapter: 1,
    place: "Sint-Janskerk",
    title: "De nacht in de kerk",
    where: "Het middenschip",
    coords: SINT_JAN,
    image: { src: "/img/sporen/kerk.webp", alt: "Het schip van de kerk bij nacht: mannen liggen op stro, een paar kaarsen branden" },
    look: "Ga in het middenschip staan en kijk naar de vloer. Zoek daarna op het Bevrijdingsglas de zijpanelen: een ervan toont een razzia.",
    intro: "In Hoofdstuk 1 pak je hier de glazen in. Vijf jaar later is de kerk het decor van een andere nacht.",
    facts: ["spoor.kerk.razzia", "spoor.kerk.nacht", "spoor.kerk.ochtend"],
    sources: "Drie bronnen: Sijes (RIOD), Van Dam, Wikipedia",
    teaser: {
      label: "Vijf jaar later · een nieuw spoor",
      text: "De kerk waar jij de glazen inpakte, is vijf jaar later het decor van een andere nacht. Ga kijken, of lees het thuis.",
    },
  },
  {
    id: "zalm",
    chapter: 2,
    place: "De Markt",
    title: "Waar het begon en eindigde",
    where: "De Zalm, Markt 34",
    coords: { lat: 52.01222, lng: 4.71111 },
    image: { src: "/img/sporen/markt-1945.webp", alt: "De Markt in mei 1945: de Waag en ernaast de witte gevel van hotel De Zalm, mensen van achteren" },
    look: "Zoek de gevelsteen met ‘Niet te hooch niet te laech van passe’, en kijk dan naar de Waag ernaast.",
    intro: "In Hoofdstuk 2 zie je De Zalm vanaf de daken, naast de Waag. Dit is wat er in het hotel gebeurde.",
    facts: ["spoor.zalm.1940", "spoor.zalm.1945", "spoor.zalm.gevelsteen"],
    sources: "Bronnen: Canon van Gouda, Scheygrond (Tidinge), De Jong",
    dispute: "bevrijding",
  },
  {
    id: "station",
    chapter: 5,
    place: "Stationsplein",
    title: "De inslagen in het staal",
    where: "Station Gouda, perron 3 en 5",
    coords: { lat: 52.0175, lng: 4.70556 },
    image: { src: "/img/scenes/vluchtspoor.webp", alt: "Het stationsplein bij avond" },
    look: "Kijk omhoog naar de stalen balken van de overkapping bij perron 3 en 5.",
    intro: "Je kent dit station van het Vluchtspoor in Hoofdstuk 5. Dit is wat je er nu van kunt zien.",
    facts: ["spoor.station.doel", "station.raid", "spoor.station.inslagen", "spoor.station.blindgangers"],
    sources: "Bronnen: Verzetsmuseum, Wikipedia, Vooronderzoek explosieven (2011)",
  },
];

export const spoorById = (id: string) => SPOREN.find((s) => s.id === id);

/** The list, grouped by place in the order the traces appear. */
export function sporenByPlace(): { place: string; items: Spoor[] }[] {
  const groups: { place: string; items: Spoor[] }[] = [];
  for (const s of SPOREN) {
    const g = groups.find((x) => x.place === s.place);
    if (g) g.items.push(s);
    else groups.push({ place: s.place, items: [s] });
  }
  return groups;
}

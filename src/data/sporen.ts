/**
 * Sporen: things you can still look at in the centre of Gouda, each tied to a place in the game.
 * Every claim is a fact in `sources.ts`; the look-assignments only say where to look. No score, no
 * clock, no way to fail (like chapter 3). The pictures are the painted scenes of the chapters.
 */
import type { FactId } from "./sources";

export interface Spoor {
  id: string;
  /** The chapter this trace belongs to (its evening, or the place it continues). */
  chapter: number;
  title: string;
  where: string;
  coords: { lat: number; lng: number };
  image: { src: string; alt: string };
  /** What to look for on location. */
  look: string;
  /** Short text before the facts: a link to the evening, no claims of its own. */
  intro: string;
  facts: FactId[];
}

export const SPOREN: Spoor[] = [
  {
    id: "glas",
    chapter: 1,
    title: "Het Bevrijdingsglas",
    where: "Sint-Janskerk, Achter de Kerk 16",
    coords: { lat: 52.01083, lng: 4.71139 },
    image: {
      src: "/img/scenes/kisten.webp",
      alt: "De kisten met glas in de Sint-Janskerk",
    },
    look: "Zoek in de kerk glas 28a. Boven het donkere wolken met ruiters, onder een kleurige stoet.",
    intro:
      "In Hoofdstuk 1 pak je de glazen van de Sint-Jan in kisten. Dit is wat de kerk er nu van laat zien.",
    facts: ["glazen.returned", "spoor.glas.maker", "spoor.glas.beeld"],
  },
  {
    id: "station",
    chapter: 5,
    title: "De inslagen in het staal",
    where: "Station Gouda, perron 3 en 5",
    coords: { lat: 52.0175, lng: 4.70556 },
    image: {
      src: "/img/scenes/vluchtspoor.webp",
      alt: "Het stationsplein bij avond",
    },
    look: "Kijk omhoog naar de stalen balken van de overkapping bij perron 3 en 5.",
    intro:
      "Je kent dit station van het Vluchtspoor in Hoofdstuk 5. Dit is wat je er nu van kunt zien.",
    facts: [
      "spoor.station.doel",
      "station.raid",
      "spoor.station.inslagen",
      "spoor.station.blindgangers",
    ],
  },
];

export const spoorById = (id: string) => SPOREN.find((s) => s.id === id);

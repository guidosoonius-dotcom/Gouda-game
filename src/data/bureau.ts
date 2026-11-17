/**
 * The orders on the messenger's desk, 3–6 June 1940. All orders are invented for the game, after
 * the kind of demands made in 1940; they are labelled as such on screen. The rule they are checked
 * against is the fact `stadhuis.aanwijzingen`; the arrest on Friday is `stadhuis.arrest`.
 */
import type { Order } from "@/game/bureau";
import type { FactId } from "./sources";

export const ORDERS: Order[] = [
  {
    day: "Maandag 3 juni",
    date: "3 Juni 1940",
    tool: "regels",
    lines: [
      "Aan den Burgemeester der gemeente Gouda.",
      "De gemeente levert dertig arbeiders",
      "voor het herstel van het vliegveld Ypenburg.",
      "Melden op de Markt, 4 Juni, 7 uur.",
    ],
    flaw: 2,
    gain: 3,
    why: "Raak. Een vliegveld herstellen helpt het oorlog voeren rechtstreeks, en daar hoeft de stad niet aan mee te werken. De Ortskommandant moet een nieuw bevel schrijven. Drie dagen winst.",
    signed: "Op 4 juni staan er dertig Goudse mannen met een schop op de Markt. Een vrachtwagen brengt ze naar Ypenburg.",
  },
  {
    day: "Dinsdag 4 juni",
    date: "4 Juni 1940",
    lines: [
      "Aan den Burgemeester der gemeente Gouda.",
      "Inkwartiering van dertig man in het Weeshuis,",
      "Spieringstraat, met ingang van 6 Juni.",
      "Bedden en dekens te leveren door de gemeente.",
    ],
    flaw: -1,
    gain: 0,
    wrong: "Hier is niets mis mee: soldaten inkwartieren mocht. De sergeant kijkt je lang aan.",
    signed: "Je tekent. Dit bevel klopte. Vanaf 6 juni slapen er soldaten in het weeshuis, in de bedden van vorig jaar.",
  },
  {
    day: "Woensdag 5 juni",
    date: "5 Juni 1940",
    tool: "kalender",
    lines: [
      "Aan den Burgemeester der gemeente Gouda.",
      "Opgave van alle ambtenaren der gemeente,",
      "met naam, adres en geboortedatum,",
      "uiterlijk in te leveren op 31 Juni 1940.",
    ],
    flaw: 3,
    gain: 2,
    why: "Raak. Juni heeft maar dertig dagen: het bevel is ongeldig. Een nieuw bevel komt pas na het weekend. Twee dagen winst.",
    signed: "De lijst gaat de deur uit. Elke ambtenaar van Gouda staat erop, met zijn adres.",
  },
  {
    day: "Donderdag 6 juni",
    date: "6 Juni 1940",
    tool: "adresboek",
    lines: [
      "Inkwartiering van twee officieren",
      "bij Dr. H. van Dam, arts,",
      "wonende Westhaven 12.",
      "Met ingang van heden.",
    ],
    flaw: 2,
    gain: 2,
    why: "Raak. Volgens het adresboek woont dokter Van Dam aan de Oosthaven, niet aan de Westhaven. Het bevel gaat terug naar de Kommandantur. Twee dagen winst, en de dokter houdt zijn spreekkamer.",
    signed: "Twee officieren bellen aan op Westhaven 12. Daar woont de weduwe Kok, die er niets van begrijpt.",
  },
];

/** The address book of the desk. The people are invented; the streets are real streets of Gouda. */
export const ADDRESSES: [string, string][] = [
  ["Brouwer, J., kruidenier", "Lange Tiendeweg 40"],
  ["Dam, H. van, arts", "Oosthaven 8"],
  ["Kok, wed. A.", "Westhaven 12"],
  ["Vries, P. de, bakker", "Hoogstraat 3"],
  ["Zwart, K., schilder", "Turfmarkt 50"],
];

/** The rule the orders are checked against, and what happens on Friday. */
export const RULE_FACT: FactId = "stadhuis.aanwijzingen";
export const FRIDAY_FACT: FactId = "stadhuis.arrest";

export const OUTCOME_TEXT = {
  stil: {
    title: "Niemand let op de bode.",
    body: "Je bent een saaie, trage bode, en dat is precies goed. Wie later een papier nodig heeft, weet je te vinden.",
  },
  lijstje: {
    title: "De bode staat op een lijstje.",
    body: "Je mag blijven, maar ze kijken mee. Nog één keer kun je iets laten verdwijnen, daarna niet meer.",
  },
  weg: {
    title: "De bode wordt overgeplaatst.",
    body: "Je hebt veel tijd gewonnen, maar de Ortskommandant wil je niet meer op het stadhuis. Vanaf maandag werk je bij de distributie.",
  },
} as const;

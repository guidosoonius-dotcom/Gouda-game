/**
 * The articles of De Koerier, the newspaper after each evening and side story ("Wat echt
 * gebeurde"). A paragraph is a fact from the register, or a line that claims nothing: a question
 * or a turn that carries the reader to the next fact. Drawings are drawings (made for this game),
 * never presented as photographs.
 */
import type { FactId } from "./sources";

/** A fact, or `{ say }`: a line without a claim of its own (tested: no years, no numbers). */
export type Para = FactId | { say: string };

export interface Article {
  headline: string;
  /** One line under the headline; claims nothing. */
  deck?: string;
  drawing?: { src: string; alt: string };
  paras: Para[];
}

const draw = (name: string, alt: string) => ({ src: `/img/krant/${name}.webp`, alt });

/** By chapter id: the lead article first, then the smaller ones. */
export const PAPERS: Record<number, Article[]> = {
  1: [
    {
      headline: "De glazen gingen ondergronds",
      deck: "Hoe verstop je de ramen van een hele kerk?",
      drawing: draw("glas", "Tekening: twee werklieden op een steiger tillen een paneel uit een kerkraam, onder hen kisten"),
      paras: ["glazen.what", "glazen.removed", { say: "Maar waar laat je al die kisten, als er oorlog komt?" }, "glazen.stored", "glazen.returned"],
    },
    {
      headline: "Op stro in de kerk",
      drawing: draw("soldaten", "Tekening: soldaten liggen op stro tussen de pilaren, fietsen tegen de zuilen"),
      paras: ["kerk.soldaten"],
    },
    {
      headline: "Rook boven Rotterdam",
      paras: ["rotterdam.bombing", "spoor.zalm.1940", { say: "Wat dat betekent, weet nog niemand." }],
    },
  ],
  2: [
    {
      headline: "Gouda drukt door",
      deck: "Wie een verboden krant maakt, heeft papier nodig, inkt, en een plek waar niemand komt kijken.",
      drawing: draw("pers", "Tekening: in een kelder draait een man aan een stencilmachine, stapels papier op tafel"),
      paras: ["press.gouda", { say: "Maar waar maak je een krant die niemand mag zien?" }, "press.grafkelder", "press.verzijl"],
    },
    {
      headline: "De lamp die de bommen trok",
      paras: ["bommen.1941", { say: "Waarom juist Gouda?" }, "bommen.baken"],
    },
  ],
  4: [
    {
      headline: "Water rond Gouda",
      deck: "Hoe maak je van een polder een verdedigingslinie?",
      drawing: draw("water", "Tekening: ondergelopen polder bij nacht, een roeibootje tussen de knotwilgen"),
      paras: ["locks.route"],
    },
    {
      headline: "Een bom voor de kaarsenfabriek",
      paras: ["kaarsen.bom", { say: "Daarmee is het niet voorbij." }, "kaarsen.beslag"],
    },
  ],
  5: [
    {
      headline: "Bommen op het spoor",
      deck: "Wat moest er geraakt worden, en wat werd er geraakt?",
      drawing: draw("station", "Tekening: een kapotte perronoverkapping na een bombardement, puin op de rails"),
      paras: ["spoor.station.doel", "raid.6nov", "station.raid", { say: "En wat is er nu nog van te zien?" }, "spoor.station.inslagen"],
    },
    {
      headline: "Mannen uit Rotterdam",
      paras: ["spoor.kerk.razzia", "spoor.kerk.nacht", "spoor.kerk.ochtend"],
    },
  ],
  11: [
    {
      headline: "Veertig jongens en een weeshuis",
      deck: "Wat heb je nodig om veertig gevluchte jongens op te vangen?",
      drawing: draw("weeshuis", "Tekening: jongens met koffers lopen de poort van het weeshuis in, ijzeren bedden tegen de muur"),
      paras: ["weeshuis.arrival", "weeshuis.care", "weeshuis.help", { say: "Maar hoe lang blijft een veilige haven veilig?" }],
    },
  ],
  12: [
    {
      headline: "De burgemeester zegt nee",
      deck: "Wat doe je als de bezetter iets vraagt wat je niet wilt geven?",
      drawing: draw("stadhuis", "Tekening: het stadhuis van Gouda op een bijna leeg plein, een motor met zijspan bij de trap"),
      paras: ["stadhuis.refuse", "stadhuis.aanwijzingen", "stadhuis.arrest", { say: "En wie zit er dan op zijn stoel?" }, "stadhuis.liera", "stadhuis.return"],
    },
    {
      headline: "Een commandant in De Zalm",
      paras: ["spoor.zalm.1940"],
    },
  ],
  14: [
    {
      headline: "Brood uit Zweden",
      deck: "Wit brood, na een lange winter. Maar waar kwam het vandaan?",
      drawing: draw("markt", "Tekening: een rij mensen in winterjassen voor een winkel, op de toonbank ronde broden"),
      paras: ["markt.hunger", "brood.ships", "brood.gouda"],
    },
    {
      headline: "Kinderen naar het oosten",
      paras: ["kinderen.ikb"],
    },
  ],
};

/** Every fact a newspaper uses, for the register checks. */
export const paperFacts = (id: number): FactId[] => (PAPERS[id] ?? []).flatMap((a) => a.paras.filter((p): p is FactId => typeof p === "string"));

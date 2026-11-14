import type { ChoiceId, Flags } from "@/game/choices";
import type { FactId } from "./sources";

export type TaskKind = "packing" | "canal" | "rooftop" | "bicycle" | "witness";

export interface ArchiveSlot {
  /** What the licensed scan will show. Rendered by ArchivePlaceholder until it exists. */
  label: string;
  credit: string;
}

export type DossierPage =
  | { kind: "scene"; image: string; lines: string[]; quote?: string }
  | { kind: "then-now"; image: string; intro: string; then: ArchiveSlot; now: ArchiveSlot; anchor: string }
  | { kind: "task"; image: string; title: string; brief: string; cta: string }
  | { kind: "dilemma"; image: string; lines: string[]; quote: string; choice: ChoiceId };

export interface MirrorStory {
  headline: string;
  body: string;
}

export interface Mirror {
  edition: string;
  dateline: string;
  /** Fiction: the player's own night, written from their flags. */
  story: (flags: Flags) => MirrorStory;
  factsTitle: string;
  facts: FactId[];
  scan: ArchiveSlot;
  notice: { title: string; fact: FactId; body: string };
  reward: string;
}

export interface Chapter {
  id: number;
  title: string;
  /** e.g. "14 MEI 1940" */
  date: string;
  /** Typed on the index card, e.g. "14 mei 1940". */
  dateShort: string;
  time: string;
  /** 0..1 on the 1940–1945 timeline. */
  timeline: number;
  place: string;
  placeHint: string;
  coords: { lat: number; lng: number };
  /** Position on the Blaeu map image, in percent. Approximate until georeferenced. */
  map: { x: number; y: number };
  /** The railway station did not exist in 1649: shown as an edge marker. */
  offMap?: boolean;
  teaser: string;
  status: "playable" | "soon";
  task: TaskKind;
  pages: DossierPage[];
  mirror?: Mirror;
}

const yearPos = (year: number, month: number) => (year - 1940 + (month - 1) / 12) / 5;

export const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: "De Kisten van Sint-Jan",
    date: "14 MEI 1940",
    dateShort: "14 mei 1940",
    time: "16:40 uur",
    timeline: yearPos(1940, 5),
    place: "Sint-Janskerk",
    placeHint: "Zuidzijde, Achter de Kerk",
    coords: { lat: 52.0106, lng: 4.7105 },
    map: { x: 60.5, y: 48.5 },
    teaser: "De grond trilt. De laatste glazen moeten de kist in, en buiten wacht iemand op een antwoord.",
    status: "playable",
    task: "packing",
    pages: [
      {
        kind: "scene",
        image: "/img/scenes/kisten.webp",
        lines: [
          "Dinsdagmiddag. In het westen staat een zwarte rookkolom boven Rotterdam.",
          "In de Sint-Jan leunen de laatste panelen nog los tegen de muur.",
        ],
        quote: "‘Handen uit de mouwen, koerier. Glas wacht op niemand.’",
      },
      {
        kind: "then-now",
        image: "/img/scenes/kisten.webp",
        intro: "Sleep de schuif. Links de kerk zonder glazen, rechts de kerk van nu.",
        then: {
          label: "ARCHIEFFOTO · koor van de Sint-Jan zonder glazen",
          credit: "Rechten aanvragen: Streekarchief Midden-Holland",
        },
        now: { label: "FOTO VAN NU · zelfde standpunt", credit: "Zelf maken bij veldbezoek" },
        anchor: "Op locatie: zoek in de kerk het anker van dit hoofdstuk [te bepalen bij veldbezoek].",
      },
      {
        kind: "task",
        image: "/img/scenes/kisten.webp",
        title: "Pak de laatste panelen in",
        brief:
          "Elke kist moet tot de rand gevuld. Glas dat kan schuiven, breekt. Sleep de panelen in het stro; tik op een paneel om het te draaien.",
        cta: "Aan het werk",
      },
      {
        kind: "dilemma",
        image: "/img/scenes/student.webp",
        lines: [
          "Buiten, bij de kerkmuur, staat een student met zijn fiets. Hij wil naar de kust, vannacht nog.",
          "Voor de pont heeft hij een doorgangsbewijs nodig. Jullie hebben er één, voor het transport van de kisten.",
        ],
        quote: "‘Ik vraag het maar één keer. Daarna ben ik weg.’",
        choice: "ch1.pass",
      },
    ],
    mirror: {
      edition: "No. 1",
      dateline: "GOUDA · 14 MEI 1940",
      story: (flags) => {
        const helped = flags["ch1.task"] === "willem";
        const gave = flags["ch1.pass"] === "student";
        return {
          headline: gave
            ? "Kisten dicht voor donker; student vertrekt met kerkpapier"
            : "Kisten dicht, papieren compleet; student rijdt weg zonder bewijs",
          body:
            (helped
              ? "Bij de laatste kist nam Willem het van je over: de vloer trilde te hard. "
              : "Je pakte de laatste panelen zelf in, tot er geen strohalm meer bij kon. ") +
            (gave
              ? "Het reservebewijs verdween in de binnenzak van een jongen op een fiets. Willem zei er niets van."
              : "Het doorgangsbewijs bleef bij de kisten. De student knikte en reed de steeg uit. Je hebt nooit gehoord of hij de kust haalde."),
        };
      },
      factsTitle: "De glazen gingen ondergronds",
      facts: ["glazen.what", "glazen.removed", "glazen.stored", "glazen.returned"],
      scan: {
        label: "SCAN · kisten met glazen in de Sint-Jan",
        credit: "Bron volgt: Streekarchief Midden-Holland, inv.nr.",
      },
      notice: {
        title: "En de student?",
        fact: "vroman.flight",
        body: "De student in jouw verhaal is verzonnen. Deze dichter niet.",
      },
      reward: "De eerste editie van De Koerier, en een keuze die je nog terugziet",
    },
  },
  {
    id: 2,
    title: "Drukinkt in het Donker",
    date: "NOVEMBER 1942",
    dateShort: "nov. 1942",
    time: "19:52 uur",
    timeline: yearPos(1942, 11),
    place: "De Waag",
    placeHint: "Achterzijde, aan de Markt",
    coords: { lat: 52.0118, lng: 4.7113 },
    map: { x: 51.4, y: 34.9 },
    teaser: "Acht minuten voor spertijd. De straten zijn afgezet, de daken niet.",
    status: "soon",
    task: "rooftop",
    pages: [
      {
        kind: "scene",
        image: "/img/scenes/daken.webp",
        lines: [
          "November, acht minuten voor spertijd. De Peperstraat is afgezet: aan beide einden staat een post.",
          "Drukker Hendrik weet van niets. Zijn pers draait nog.",
        ],
        quote: "‘Over de daken dan. Een andere weg is er niet.’",
      },
      {
        kind: "dilemma",
        image: "/img/scenes/daken.webp",
        lines: [
          "Op de zolder achter de Waag wacht Kees, de zoon van de drukker. Veertien jaar, zijn jas al aan.",
          "Hij kent hier elke dakgoot. Hij is ook de enige zoon die Hendrik heeft.",
        ],
        quote: "‘Laat mij mee. Twee paar ogen zien meer dan één.’",
        choice: "ch2.kees",
      },
      {
        kind: "task",
        image: "/img/scenes/daken.webp",
        title: "Over de daken naar de drukkerij",
        brief:
          "Van schoorsteen naar schoorsteen, als het zoeklicht weg is. Wie in het licht blijft staan, wordt gezien. Om acht uur slaat de klok: dan moet Hendrik het weten.",
        cta: "Het dak op",
      },
    ],
    mirror: {
      edition: "No. 2",
      dateline: "GOUDA · NOVEMBER 1942",
      story: (flags) => {
        const kees = flags["ch2.kees"] === "mee";
        const run = flags["ch2.task"];
        return {
          headline:
            run === "telaat"
              ? "Controle in de Peperstraat; drukker ontkomt op het nippertje"
              : run === "gezien"
                ? "Fluitsignaal boven de Markt, maar de pers staat op tijd stil"
                : "Koerier ongezien over de daken; drukkerij gewaarschuwd",
          body:
            (run === "telaat"
              ? "Het sloeg acht uur toen je het dakraam bereikte. Hendrik kon alleen nog het zetsel in de kachel gooien. "
              : run === "gezien"
                ? "Iemand heeft een schim op het dak gezien. Toen de controle kwam, lag het lood al onder de vloer. "
                : "Niemand keek omhoog. Toen de controle aanbelde, stond de pers stil en rook het naar soep. ") +
            (kees
              ? "Kees wees je elke losse pan. Zijn vader zei niets, en legde een hand in zijn nek."
              : "Je ging alleen. Kees zat thuis bij het raam en heeft je niet gegroet."),
        };
      },
      factsTitle: "Gouda drukte door",
      facts: ["press.gouda"],
      scan: {
        label: "SCAN · illegale uitgave uit Gouda",
        credit: "Bron volgt: Streekarchief Midden-Holland, inv.nr.",
      },
      notice: {
        title: "Acht uur",
        fact: "curfew.hours",
        body: "Hendrik en Kees zijn verzonnen. Wie in Gouda echt drukte, zoeken we nog uit.",
      },
      reward: "De tweede editie van De Koerier",
    },
  },
  {
    id: 3,
    title: "Stille Getuigen aan de Oosthaven",
    date: "VOORJAAR 1943",
    dateShort: "voorjaar 1943",
    time: "avond",
    timeline: yearPos(1943, 4),
    place: "Oosthaven 31",
    placeHint: "Bij de stenen voor de deur",
    coords: { lat: 52.0112, lng: 4.7138 },
    map: { x: 75, y: 64 },
    teaser: "Hier valt niets te winnen. Hier wordt herinnerd.",
    status: "soon",
    task: "witness",
    pages: [],
  },
  {
    id: 4,
    title: "Nachtvaart bij het Verlaat",
    date: "OKTOBER 1944",
    dateShort: "okt. 1944",
    time: "19:45 uur",
    timeline: yearPos(1944, 10),
    place: "De Havensluis",
    placeHint: "Aan de kade bij de sluisdeuren",
    coords: { lat: 52.0082, lng: 4.7125 },
    map: { x: 82, y: 80.5 },
    teaser: "Marie wacht bij de sluis. Er moet iemand weg, vannacht nog.",
    status: "playable",
    task: "canal",
    pages: [
      {
        kind: "scene",
        image: "/img/scenes/nachtvaart.webp",
        lines: [
          "Oktober, kwart voor acht. De gracht ligt zwart en glad.",
          "Bij de kade wacht Marie met een schouw. Onder een zeil zit een man die vannacht de stad uit moet.",
        ],
        quote: "‘Geen woord op het water. Geluid draagt ver.’",
      },
      {
        kind: "dilemma",
        image: "/img/scenes/nachtvaart.webp",
        lines: [
          "Op de kade staat Jaap, de broer van Marie. Zeventien, een plunjezak over zijn schouder.",
          "Hij is opgeroepen om in Duitsland te gaan werken en is niet gegaan. Thuis kan hij niet blijven.",
        ],
        quote: "‘Ik kan roeien. Laat me hier niet staan.’",
        choice: "ch4.broer",
      },
      {
        kind: "task",
        image: "/img/scenes/nachtvaart.webp",
        title: "Roei naar de sluis",
        brief:
          "Honderdveertig meter gracht. Een brug met een wacht en een zoeklicht, en aan het eind de sluis. Blijf uit het licht, en maak geen lawaai.",
        cta: "Naar de boot",
      },
    ],
    mirror: {
      edition: "No. 4",
      dateline: "GOUDA · OKTOBER 1944",
      story: (flags) => {
        const jaap = flags["ch4.broer"] === "mee";
        const run = flags["ch4.task"];
        return {
          headline:
            run === "omweg"
              ? "Schouw keert om; onderduiker ontkomt langs een achtersloot"
              : run === "gezien"
                ? "Fluit en geschreeuw bij de brug, maar de schouw haalt de sluis"
                : "Ongezien langs de wacht: schouw bereikt de sluis",
          body:
            (run === "omweg"
              ? "Drie keer vond het licht jullie. Toen stuurde Marie de boot een sloot in die op geen kaart staat. "
              : run === "gezien"
                ? "Eén keer lag de boot vol in het licht. Het riet heeft jullie gered. "
                : "Niemand op de brug heeft iets gehoord. De sluisdeur ging op een kier. ") +
            (jaap
              ? "Jaap roeide mee tot zijn handen open lagen. Hij is niet teruggegaan."
              : "Jaap bleef op de kade staan. Marie heeft niet meer omgekeken."),
        };
      },
      factsTitle: "Over water de stad uit",
      facts: ["locks.route"],
      scan: {
        label: "KAART · sluizen en plassen rond Gouda, 1944",
        credit: "Bron volgt: Streekarchief Midden-Holland, inv.nr.",
      },
      notice: {
        title: "Na acht uur",
        fact: "curfew.hours",
        body: "Marie, Jaap en de man onder het zeil zijn verzonnen. Wie hier echt voer, zoeken we nog uit.",
      },
      reward: "De vierde editie van De Koerier",
    },
  },
  {
    id: 5,
    title: "Vluchtspoor bij het Station",
    date: "26 NOVEMBER 1944",
    dateShort: "26 nov. 1944",
    time: "16:44 uur",
    timeline: yearPos(1944, 11.8),
    place: "Stationsplein",
    placeHint: "Voor het station",
    coords: { lat: 52.0163, lng: 4.7062 },
    map: { x: 13.6, y: 27.8 },
    offMap: true,
    teaser: "Luchtalarm. Door de rook heen moet een groep mensen de kelder vinden.",
    status: "soon",
    task: "bicycle",
    pages: [],
  },
];

export const chapterById = (id: number) => CHAPTERS.find((c) => c.id === id)!;

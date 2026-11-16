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
  // Not shown through FactText: the credit sits as plain text in `AboutSheet` ("Over dit spel"), as
  // the map caption did before it. Recorded here so it is checked like every other claim.
  "kaart.blaeu": {
    claim: "De kaart op het beginscherm is een plattegrond van Gouda door J. Blaeu, 1649, publiek domein.",
    source: "nog te bepalen (herkomst van het kaartbestand; Wikimedia Commons / Toonneel der Steden)",
    todo: "controleer jaar en editie (1649 eerste druk, 1652 Toonneel der Steden) en de rechten van de gebruikte scan",
    verified: false,
  },
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
  // ---------- zijsporen (research Nov 2026; sources found, not yet checked by a historian) ----------
  "weeshuis.arrival": {
    claim:
      "Op 3 april 1939 kwamen veertig Joodse jongens, op de vlucht uit nazi-Duitsland, uit het quarantainekamp in Rotterdam naar het weeshuis aan de Spieringstraat.",
    source: "joodserfgoedrotterdam.nl/gouda; NIW, ‘Wandelen in de mediene: Gouda’s glorie’",
    todo: "datum en aantal nalezen in het archief van het vluchtelingencomité (Streekarchief Midden-Holland)",
    verified: false,
  },
  "weeshuis.care": {
    claim: "De keuken werd koosjer gemaakt en de jongens kregen les, ook in het Nederlands.",
    source: "joodserfgoedrotterdam.nl/gouda",
    verified: false,
  },
  "weeshuis.help": {
    claim:
      "Gouwenaren hielpen als vrijwilliger bij de verbouwing, de Goudsche Stoombleekerij deed gratis de was, en het personeel van de Garenspinnerij stond drie maanden lang 1 procent van het loon af.",
    source: "NIW, ‘Wandelen in de mediene: Gouda’s glorie’ (citaat Dekker)",
    todo: "originele bron van het citaat zoeken",
    verified: false,
  },
  "weeshuis.end": {
    claim:
      "Er woonden uiteindelijk ruim honderd vluchtelingenkinderen. Eind 1939 werd de opvang opgeheven en gingen de kinderen naar tehuizen elders, vooral in Amsterdam. Twee op de drie overleefden de oorlog.",
    source: "NIW (110 kinderen, tweederde overleefde); joodserfgoedrotterdam.nl (120 kinderen, december 1939, Amsterdam)",
    todo: "aantal (110 of 120) en het aandeel overlevenden vaststellen",
    verified: false,
  },
  "stadhuis.refuse": {
    claim:
      "Burgemeester K.F.O. James beriep zich in 1940 op het Landoorlogreglement en weigerde mee te werken aan het sturen van arbeiders voor het herstel van vliegveld Ypenburg.",
    source: "Die Goude, ‘Gouda 1901–1965, Kroniek van Gouda’; L. de Jong, Het Koninkrijk der Nederlanden in de Tweede Wereldoorlog, deel 4",
    verified: false,
  },
  "stadhuis.paratrooper": {
    claim:
      "In de meidagen zocht James een gevangen Duitse parachutist op in een cel van het politiebureau en zei hem: ‘Deutsche Pflicht, Deutsche Ehre, Deutsche Treue, ich kenne das, ich pfeife darauf.’",
    source: "L. de Jong, Het Koninkrijk der Nederlanden in de Tweede Wereldoorlog, deel 4 (citaat van James zelf)",
    verified: false,
  },
  "stadhuis.arrest": {
    claim:
      "Op 7 juni 1940 werd hij gearresteerd. Hij kreeg een jaar gevangenisstraf, die hij uitzat in Scheveningen, het ‘Oranjehotel’. Na zijn vrijlating in juni 1941 dook hij onder.",
    source: "Digitaal Namenregister Oranjehotel (K.F.O. James); Canon van Gouda, ‘Tweede Wereldoorlog’",
    verified: false,
  },
  "stadhuis.liera": {
    claim: "De NSB’er E.A.A. Liera werd burgemeester van Gouda. Uit de toren van de Sint-Jan en uit het stadhuis werden klokken weggehaald.",
    source: "Canon van Gouda, ‘Tweede Wereldoorlog’ (canonvannederland.nl)",
    todo: "datum van de benoeming en van het weghalen van de klokken",
    verified: false,
  },
  "stadhuis.return": {
    claim: "Op 5 mei 1945 kwam James terug op het stadhuis en werd hij weer burgemeester.",
    source: "Canon van Gouda, ‘Tweede Wereldoorlog’; Digitaal Namenregister Oranjehotel",
    verified: false,
  },
  "synagoge.building": {
    claim: "De synagoge aan de Turfmarkt werd in 1827 ingewijd. Al sinds 1798 kwam de Joodse gemeente van Gouda op deze plek bijeen.",
    source: "joodserfgoedrotterdam.nl/gouda; Joods Cultureel Kwartier, ‘Gouda’",
    verified: false,
  },
  "synagoge.war": {
    claim:
      "Van de ongeveer 500 Joodse Gouwenaars werden er tussen 1940 en 1945 zo’n 390 vermoord. In 1943 werd de synagoge geplunderd. De thorarollen waren verstopt en zijn na de oorlog teruggevonden.",
    source: "Canon van Gouda, ‘Tweede Wereldoorlog’; Joods Cultureel Kwartier, ‘Gouda’",
    verified: false,
  },
  "synagoge.after": {
    claim: "In 1950 moest de kleine Joodse gemeente het gebouw verkopen. Sindsdien is het een kerk van de Vrije Evangelische Gemeente.",
    source: "Wikipedia, ‘Synagoge (Gouda)’; veggouda.nl/turfmarkt",
    verified: false,
  },
  "synagoge.plaque": {
    claim:
      "Sinds 9 september 1997 hangt op de deur een plaquette van Ralph Prins: het wapen van Gouda, waaruit één van de zes sterren is gescheurd. Elk jaar op 4 mei is hier een korte herdenking.",
    source: "veggouda.nl/turfmarkt; Canon van Gouda, ‘Tweede Wereldoorlog’",
    verified: false,
  },
  "brood.ships": {
    claim:
      "Het ‘Zweedse wittebrood’ werd niet uit vliegtuigen gegooid. Het werd in Nederlandse bakkerijen gebakken van meel dat het Zweedse Rode Kruis per schip aanvoerde; de eerste schepen kwamen op 28 januari 1945 in Delfzijl aan.",
    source: "Andere Tijden, ‘Geschenk uit de hemel: de mythe van het Zweeds wittebrood’; Wikipedia, ‘Zweeds wittebrood’",
    verified: false,
  },
  "brood.gouda": {
    claim: "In Gouda werd het brood onder meer uitgedeeld bij Albert Heijn aan de Markt.",
    source: "Canon van Gouda, ‘Tweede Wereldoorlog’; Geschiedenislokaal Midden-Holland, ‘Zweedse wittebrood in Gouda (1945)’ (foto)",
    todo: "adres van de winkel in 1945",
    verified: false,
  },
  "brood.gouka": {
    claim: "Jan Gouka, toen een jongen, vond het brood ‘hemels gewoon’, vooral geroosterd.",
    source: "Canon van Gouda, ‘Tweede Wereldoorlog’",
    verified: false,
  },
  "markt.hunger": {
    claim:
      "Razzia’s en een ernstig tekort aan voedsel en brandstof maakten de laatste oorlogswinter zwaar. Eind april 1945 volgden voedseldroppings in de Zuidplaspolder, tussen Gouda en Moordrecht.",
    source: "Canon van Gouda, ‘Tweede Wereldoorlog’",
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

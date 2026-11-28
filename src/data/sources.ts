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
      "De oudste hangen er al sinds de zestiende eeuw: de Goudse Glazen, de gebrandschilderde ramen van de Sint-Janskerk.",
    source: "NGV, ‘The Interior of St Janskerk at Gouda’ (schenkingen tot 1603); Wikipedia, ‘Gebrandschilderde glazen in de Grote of Sint-Janskerk in Gouda’",
    todo: "aantal glazen",
    verified: false,
  },
  "glazen.removed": {
    claim:
      "Dan komt 28 augustus 1939. Nederland mobiliseert, en direct daarna beginnen de werklieden. Paneel voor paneel lichten ze de ramen uit hun sponningen. Het glas verdwijnt in 201 houten kisten; in de sponningen komt dubbeldik vensterglas.",
    source: "Wikipedia, ‘Sint-Janskerk (Gouda)’; Canon van Nederland, ‘Goudse glazen in WOII’ (plan van 4 april 1939)",
    todo: "uitvoerende glazenier; andere bron noemt september tot december 1939",
    verified: false,
  },
  "glazen.stored": {
    claim:
      "Gouda spreidt de kisten. In bankkluizen. In de kelders van boerderijen rond de stad. In het weeshuis van Moordrecht. En in 1943 gaan alle glazen naar de rijkskluizen bij Vogelenzang.",
    source: "Wikipedia, ‘Sint-Janskerk (Gouda)’; Canon van Nederland, ‘Goudse glazen in WOII’",
    todo: "welke bankkluizen (in de stad?) en data van de transporten",
    verified: false,
  },
  "glazen.returned": {
    claim: "Na de bevrijding zijn de glazen teruggeplaatst. Je kunt ze vandaag in de kerk zien.",
    source: UNSOURCED,
    todo: "jaar van terugplaatsing; of er originele kisten in de kerk staan",
    verified: false,
  },
  "rotterdam.bombing": {
    claim:
      "Dinsdag 14 mei 1940. De binnenstad van Rotterdam wordt gebombardeerd.",
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
    claim:
      "Ook Gouda heeft zijn illegale bladen. De Flitspuit verschijnt van 1941 tot 1943, later komt De Vrije Gedachte. Koeriers brengen ze rond, van hand tot hand.",
    source: "‘De Ondergrondse Pers 1940–1945’ (De Flitspuit); Canon van Gouda, ‘Tweede Wereldoorlog’ (De Vrije Gedachte); Streekarchief Midden-Holland, collectie 0196",
    todo: "drukkers en adressen; de Flitspuit werd gestencild, niet gedrukt",
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
    claim:
      "Op zondagmiddag 26 november 1944 om 16.44 uur vielen geallieerde vliegtuigen het station en het spoor bij Gouda aan. Bommen troffen ook het Sint Jozefpaviljoen, door de Duitsers als lazaret gebruikt; daar vielen doden.",
    source: "Gouda 40-45, ‘Bombardement Sint Jozef Paviljoen’; Nationaal Comité 4 en 5 mei, plaquette Sint Josefpaviljoen; Vooronderzoek conventionele explosieven Gouda (2011)",
    todo: "aantal doden: 17 (4 en 5 mei) of 16 Nederlandse en 15 Duitse (Canon van Gouda); namen; aantal toestellen (14, 18 of 26)",
    verified: false,
  },
  "lbd.role": {
    claim: "De Luchtbeschermingsdienst, in Gouda opgericht in 1938, hielp na een bombardement bij het redden en richtte schuilplaatsen in, ook op de Markt.",
    source: "Historische Vereniging Die Goude, ‘Bommen op Gouda’ (lezing Erik Kooistra); Streekarchief Midden-Holland, Ac 307 (LBD)",
    todo: "schuilkelders bij het station; rol bij het alarm",
    verified: false,
  },
  "liberation.gouda": {
    claim: "In mei 1945 werd Gouda bevrijd.",
    source: UNSOURCED,
    todo: "datum en verloop van de bevrijding van Gouda: op 5 mei droeg de Ortskommandant de macht in De Zalm over aan de Binnenlandse Strijdkrachten en kwam burgemeester James terug (Canon van Gouda; Wikipedia), maar de eerste bevrijders kwamen pas op 7 mei (RAF) en 8 mei (Canadezen); Erik Kooistra (boek ‘80 jaar in dienst van de vrijheid’, 2025) corrigeert het verhaal dat Gouda op 5 mei werd bevrijd; gebruik dus niet ‘eerste stad’ of ‘bevrijd op 5 mei’ zonder die bron",
    verified: false,
  },
  "curfew.hours": {
    claim:
      "Vanaf 1 november 1940 gold in bezet Nederland een spertijd, aanvankelijk van middernacht tot vier uur. Later werd die vervroegd: voor Joden vanaf juni 1942 tot acht uur ’s avonds, na aanslagen ook in Amsterdam, en vanaf september 1944 voor iedereen van acht tot vier.",
    source: "Wikipedia, ‘Avondklok’; Historiek, ‘Nederland in de Tweede Wereldoorlog: de bezetting’",
    todo: "welke uren gold in Gouda in november 1942?",
    verified: false,
  },
  "locks.route": {
    claim:
      "In 1943 gaan polders ten westen van Gouda onder water: de Vordere Wasserstellung, een verdedigingslinie van water. De voedselproductie komt daardoor in gevaar.",
    source: "Canon van Gouda, ‘Tweede Wereldoorlog’",
    todo: "bron voor mensen of voedsel over water via de Goudse sluizen in 1944–45 (niet gevonden)",
    verified: false,
  },
  // ---------- zijsporen (research Nov 2026; sources found, not yet checked by a historian) ----------
  "weeshuis.arrival": {
    claim:
      "3 april 1939. Veertig Joodse jongens komen aan bij het weeshuis aan de Spieringstraat. Ze zijn gevlucht uit nazi-Duitsland en komen uit het quarantainekamp in Rotterdam.",
    source: "joodserfgoedrotterdam.nl/gouda; NIW, ‘Wandelen in de mediene: Gouda’s glorie’",
    todo: "datum en aantal nalezen in het archief van het vluchtelingencomité (Streekarchief Midden-Holland)",
    verified: false,
  },
  "weeshuis.care": {
    claim:
      "De keuken wordt koosjer gemaakt. Er komt les, ook in het Nederlands.",
    source: "joodserfgoedrotterdam.nl/gouda",
    verified: false,
  },
  "weeshuis.help": {
    claim:
      "En Gouda helpt. Vrijwilligers verbouwen mee, de Goudsche Stoombleekerij doet gratis de was, en het personeel van de Garenspinnerij staat drie maanden lang 1 procent van het loon af.",
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
      "1940. De bezetter wil arbeiders uit Gouda om vliegveld Ypenburg te herstellen. Burgemeester K.F.O. James weigert mee te werken. Hij beroept zich op het Landoorlogreglement.",
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
    claim:
      "Later wordt de NSB’er E.A.A. Liera burgemeester van Gouda. Uit de toren van de Sint-Jan en uit het stadhuis worden de klokken weggehaald.",
    source: "Canon van Gouda, ‘Tweede Wereldoorlog’ (canonvannederland.nl)",
    todo: "datum van de benoeming en van het weghalen van de klokken",
    verified: false,
  },
  "stadhuis.return": {
    claim: "Op 5 mei 1945 kwam James terug op het stadhuis en werd hij weer burgemeester.",
    source: "Canon van Gouda, ‘Tweede Wereldoorlog’; Digitaal Namenregister Oranjehotel",
    verified: false,
  },
  "stadhuis.aanwijzingen": {
    claim:
      "Volgens de Aanwijzingen van 1937 bleven ambtenaren in oorlogstijd op hun post, zolang dat in het belang van de bevolking was. De bezetter mocht goederen en diensten vorderen en soldaten inkwartieren, maar niets eisen wat rechtstreeks met de oorlogvoering te maken had.",
    source: "Verzetsmuseum, kennisbank ‘Duits bestuur’; Berghapedia, ‘Aanwijzingen van 1937’; R. Bakker, ‘Landoorlogreglement en Aanwijzingen’ (Verbum)",
    todo: "tekst van de Aanwijzingen zelf nalezen (artikel 1 en de bepalingen over vorderingen)",
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
      "Het ‘Zweedse wittebrood’ valt niet uit de lucht. Het wordt in Nederlandse bakkerijen gebakken, van meel dat het Zweedse Rode Kruis per schip aanvoert; de eerste schepen komen op 28 januari 1945 in Delfzijl aan. Vanaf eind februari en in maart 1945 wordt het in de steden verdeeld: 800 gram brood en 125 gram margarine per persoon.",
    source: "Andere Tijden, ‘Geschenk uit de hemel: de mythe van het Zweeds wittebrood’; Wikipedia, ‘Zweeds wittebrood’",
    verified: false,
  },
  "brood.gouda": {
    claim:
      "In Gouda gaat het brood onder meer over de toonbank bij Albert Heijn aan de Markt.",
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
  // Sporen: things to look at on location (side layer of the map, `data/sporen.ts`)
  "spoor.glas.maker": {
    claim: "In de Sint-Janskerk hangt het Bevrijdingsglas uit 1947, ontworpen door Charles Eyck. Burgemeester James liet het maken, nadat alle glazen na de oorlog waren teruggeplaatst.",
    source: "Wim Denslagen, ‘De gebrandschilderde glazen in de Sint Janskerk, Gouda’ (DBNL), met verwijzing naar Dolder, Goudse Glazen (1995) en Vaandrager, Bevrijdingsglas (1997)",
    todo: "controleer het initiatief van James in een tweede bron; het glas heet glas 28a",
    verified: false,
  },
  "spoor.glas.beeld": {
    claim: "Bovenin het glas hangen donkere wolken met de ruiters uit Openbaringen 6, die dood en verderf zaaien. In het midden trekt een kleurrijke stoet voorbij, de vreugde van de bevrijding. Op de zijpanelen zie je de beproevingen van de oorlog, onder meer verdronken land, een brandende toren, een razzia en uitgehongerde mensen in de kampen.",
    source: "Wim Denslagen, ‘De gebrandschilderde glazen in de Sint Janskerk, Gouda’ (DBNL); Nationaal Comité 4 en 5 mei, ‘Gouda, Bevrijdingsglas’",
    todo: "twee bronnen stemmen overeen over de zijpanelen, maar ter plekke bevestigen; het razzia-paneel toont niet per se de nacht van 10 op 11 november 1944 in de kerk, zeg dat dus niet; dichtregel: Denslagen noemt Yge Foppema, 4en5mei de bundel ‘Oude en Nieuwe Geuzenliederen’",
    verified: false,
  },
  "spoor.station.inslagen": {
    claim: "In een aantal stalen balken van de overkapping van de perrons zijn de inslagen van de bommen uit november 1944 nog te zien, bij perron 3 en 5.",
    source: "Wikipedia, ‘Gouda railway station’; Verzetsmuseum Zuid-Holland; Tourism Utrecht, ‘Een andere kijk op het station’; TracesOfWar, ‘Granaatinslagen NS-station Gouda’",
    todo: "ter plekke controleren of de balken na de renovatie van 2022 nog zichtbaar zijn en bij welke pijlers precies",
    verified: false,
  },
  "spoor.station.doel": {
    claim: "Het station werd op 6 en 26 november 1944 gebombardeerd: de geallieerden wilden voorkomen dat de Duitsers dit spoorknooppunt tussen oost en west konden gebruiken. De aanval op het spoor zelf mislukte grotendeels.",
    source: "Verzetsmuseum Zuid-Holland; Tourism Utrecht; Historische Vereniging Die Goude, ‘Bommen op Gouda’ (Erik Kooistra, over de V2-trein van 6 november)",
    todo: "aantal vliegtuigen en bommen (138 vliegtuigen en 43,6 ton in één bron); aantal doden en welke aanval",
    verified: false,
  },
  "spoor.station.blindgangers": {
    claim: "Bij werkzaamheden rond het station moet Gouda nog steeds rekening houden met niet ontplofte bommen in de grond.",
    source: "Tourism Utrecht, ‘Een andere kijk op het station’; Vooronderzoek conventionele explosieven Gouda (2011)",
    todo: "actuele situatie bij de gemeente of Omgevingsdienst",
    verified: false,
  },
  "spoor.kerk.razzia": {
    claim: "Op 10 en 11 november 1944 hielden de Duitsers in Rotterdam en Schiedam een razzia op mannen van 17 tot 40 jaar.",
    source: "Stadsarchief Rotterdam, ‘De razzia’; B.A. Sijes, ‘De razzia van Rotterdam’ (RIOD, 1951)",
    todo: "aantal weggevoerden: ongeveer 52.000 (Stadsarchief) of 51.000 (Wikipedia)",
    verified: false,
  },
  "spoor.kerk.nacht": {
    claim: "Ongeveer 2.400 van hen moesten te voet naar Gouda en brachten de nacht door in de Sint-Jan. Het was er stikdonker, op een paar kaarsvlammetjes na. Ze lagen op stro op de stenen vloer, in hun natte jassen.",
    source: "B.A. Sijes, ‘De razzia van Rotterdam’ (RIOD, 1951), getuigenissen over de Grote Kerk in Gouda; M.J. van Dam, ‘Gouda in de Tweede Wereldoorlog’ (2006), p. 222; Wikipedia, ‘Sint-Janskerk (Gouda)’",
    todo: "aantal (2.400, in twee groepen, de tweede van ongeveer 1.200 om 23.00 uur) in Van Dam nalezen; een deel ging via Waddinxveen",
    verified: false,
  },
  "spoor.kerk.ochtend": {
    claim: "In de duisternis wisten sommigen zich te verstoppen of te vluchten. ’s Ochtends kregen de mannen brood en kaas en liepen ze verder naar Utrecht.",
    source: "Wikipedia, ‘Sint-Janskerk (Gouda)’ (naar Van Dam); B.A. Sijes (1951)",
    todo: "vertrektijd: om vijf uur (Wikipedia) of het bevel om zeven uur (getuige bij Sijes)",
    verified: false,
  },
  "spoor.zalm.1940": {
    claim: "Op 15 mei 1940 trokken Duitse troepen Gouda binnen. De commandant en zijn staf namen eerst hun intrek in hotel De Zalm; op 19 mei verhuisden ze naar een groot huis aan de Kattensingel.",
    source: "Canon van Gouda, ‘Tweede Wereldoorlog’",
    todo: "tweede bron (Van Dam 2006, hoofdstuk 1)",
    verified: false,
  },
  "spoor.zalm.1945": {
    claim: "Op 5 mei 1945 droeg de Duitse Ortskommandant in De Zalm de macht over de stad over aan de Binnenlandse Strijdkrachten.",
    source: "A. Scheygrond, ‘Hotel de Zalm’, Tidinge van Die Goude 1985 nr. 2 (via Wikipedia, ‘De Zalm (Gouda)’)",
    todo: "onafhankelijke tweede bron zoeken; de huidige uitbater noemt 7 mei; verschil met ‘bevrijd’: zie het geschil ‘bevrijding’",
    verified: false,
  },
  "spoor.zalm.gevelsteen": {
    claim: "Een gevelsteen uit 1670, ‘Niet te hooch niet te laech van passe’, herinnert eraan dat de nieuwe herberg niet hoger mocht worden dan de Waag ernaast.",
    source: "Theo de Jong, ‘Goudse gevelstenen’ (2004), via Wikipedia, ‘De Zalm (Gouda)’; Gouds Dagblad, ‘Voormalig hotel de Zalm in de steigers’",
    todo: "ter plekke: waar de steen zit",
    verified: false,
  },
  "liberation.may": {
    claim: "Op 7 mei 1945, tegen zeven uur ’s avonds, reden vrachtauto’s van de RAF de Markt op: de eerste bevrijders in Gouda. Een dag later kwamen de Canadezen.",
    source: "Canon van Gouda, ‘Tweede Wereldoorlog’; Oorlogsbronnen, ‘Bevrijding Gouda’; E. Kooistra, ‘De aankomst van de bevrijders in Gouda’, Tidinge 2016 nr. 2",
    todo: "Wikipedia noemt 8 mei rond 18.45 uur voor de RAF; artikel van Kooistra nalezen",
    verified: false,
  },
  "bs.vrouwen": {
    claim: "Op 16 juni 1945 liepen in Gouda ook vrouwen mee in een parade van de Binnenlandse Strijdkrachten. Wie zij waren, wordt nog uitgezocht.",
    source: "Historische Vereniging Die Goude, Nieuwsbrief 140 (oktober 2024), foto uit de collectie-Daems; AD, 1 mei 2024",
    todo: "geen namen gebruiken zonder overleg met Die Goude",
    verified: false,
  },
  "tas.gastenboek": {
    claim: "Het Streekarchief Midden-Holland bewaart het gastenboek van het Duitse soldatentehuis in Gouda, 1942 tot 1944. Op de laatste bladzijde staat een aantekening van de commandant van de Binnenlandse Strijdkrachten, van 9 mei 1945.",
    source: "Streekarchief Midden-Holland, archief van de Ortskommandantur Gouda 1940–1945 (toegang 198), inv.nr. 20",
    todo: "het stuk inzien: waar stond het soldatentehuis, wat staat er in de aantekening",
    verified: false,
  },
  // Newspapers (De Koerier): facts that only the articles use
  "kerk.soldaten": {
    claim: "In de meidagen van 1940 trekken ongeveer 1.200 Nederlandse militairen, wielrijders, zich vanuit Rotterdam terug naar Gouda. Ze belanden in de Sint-Jan. Dagenlang slapen ze op stro. Er is één wc voor allemaal; water wordt in gamellen aangesleept.",
    source: "Wikipedia, ‘Sint-Janskerk (Gouda)’ (tijdlijn: 1940, opvang van 1200 Nederlandse militairen)",
    todo: "nalezen in M.J. van Dam, ‘Gouda in de Tweede Wereldoorlog’ (2006); welke dagen precies",
    verified: false,
  },
  "press.grafkelder": {
    claim: "De redactie van De Vrije Gedachte vindt onderdak op een onverwachte plek: een lege grafkelder op de rooms-katholieke begraafplaats aan de Graaf Florisweg.",
    source: "Canon van Gouda, ‘Tweede Wereldoorlog’; L.E. Winkel, ‘De Ondergrondse Pers 1940–1945’ (De Vrije Gedachte)",
    todo: "vanaf wanneer (volgens Winkel vanaf voorjaar 1944)",
    verified: false,
  },
  "press.verzijl": {
    claim: "Tussen najaar 1944 en mei 1945 wordt Vrij Nederland in Gouda een paar keer nagedrukt, bij drukkerij B.A. Verzijl.",
    source: "L.E. Winkel, ‘De Ondergrondse Pers 1940–1945’, nr. 972 (Vrij Nederland, Gouda)",
    todo: "adres van de drukkerij",
    verified: false,
  },
  "bommen.1941": {
    claim: "In 1941 wordt Gouda door minstens twintig luchtaanvallen getroffen. De eerste bommen vallen in februari, op de Fluwelensingel.",
    source: "Canon van Gouda, ‘Tweede Wereldoorlog’; M.J. van Dam, ‘Gouda in de Tweede Wereldoorlog’ (2006), hoofdstuk ‘Bommen op Gouda’ (25 februari 1941: Fluwelensingel)",
    verified: false,
  },
  "bommen.baken": {
    claim: "De oorzaak staat aan de overkant van de IJssel: een draailicht, een baken voor Duitse vliegtuigen op weg naar Engeland. Het is geen nepvliegveld, zoals lang werd gedacht. Eind 1941 wordt het weggehaald.",
    source: "Historische Vereniging Die Goude, ‘Bommen op Gouda’ (lezing Erik Kooistra, 2018); E. Kooistra, ‘Bommen op Gouda’ (2021); Canon van Gouda (lichtbaken aan de zuidkant van Gouda)",
    verified: false,
  },
  "kaarsen.bom": {
    claim: "Op 18 september 1944 valt er een bom in de Nobelstraat. Hij is bedoeld voor de kaarsenfabriek, waar de Duitsers goederen hebben opgeslagen.",
    source: "Historische Vereniging Die Goude, ‘Bommen op Gouda’ (lezing Erik Kooistra, 2018); M.J. van Dam (2006), ‘18 september 1944: Nobelstraat’",
    todo: "slachtoffers en schade",
    verified: false,
  },
  "kaarsen.beslag": {
    claim: "Eind 1944 nemen de Duitsers de kaarsenfabriek in beslag. Tot november 1945 ligt de productie stil.",
    source: "Gouda Kaarsen, ‘Historie’",
    todo: "tweede bron (Streekarchief)",
    verified: false,
  },
  "raid.6nov": {
    claim: "Maandag 6 november 1944, rond acht uur ’s ochtends: zes bommen vallen tussen de Ridder van Catsweg en de nieuwe verbindingsweg. Later die ochtend volgt een tweede aanval. Acht Gouwenaars komen die dag om.",
    source: "M.J. van Dam, ‘Gouda in de Tweede Wereldoorlog’ (2006), p. 224; Werkgroep Goudse oorlogsslachtoffers (gouda4045.nl)",
    todo: "aantal toestellen en bommen van de tweede aanval",
    verified: false,
  },
  "kinderen.ikb": {
    claim: "In 1945 worden via het Interkerkelijk Bureau 125 Goudse kinderen naar het oosten van het land gestuurd, waar nog eten is. Dat is ongeveer één op de honderd kinderen in de stad.",
    source: "I.J.J. de Zwarte, ‘The Hunger Winter’ (proefschrift UvA, 2019), tabel 7.1",
    todo: "andere uitzendingen vanuit Gouda (UNO, ds. Ten Brink) los daarvan",
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

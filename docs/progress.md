# Voortgang

Laatste update: sessie 3 (alle vijf hoofdstukken en de epiloog speelbaar). Start: `npm install && npm run dev` → http://localhost:3000.
Kies "Speel thuis". Alle vijf hoofdstukken en de epiloog zijn speelbaar.

## Af
- **M0 Fundament:** Next.js 16 (App Router, TS), Tailwind v4-tokens, zelf-gehoste fonts, Zustand-store
  met persist, view-router, procedureel geluid (`src/lib/sound.ts`).
- **M1 Hoofdstuk 1 speelbaar:** titel → Blaeu-kaart (lantaarn, lakzegels, tijdlijn, archiefkaart) →
  dossier (getypt briefje, toen-en-nu, opdracht) → pakpuzzel (2 kisten, schokgolven, Willem) →
  dilemma → krant "De Koerier" → koerierstas met herstelcode.
- **M2 Keuzesysteem:** `src/game/choices.ts` (keuzes, uitkomsten, echo's), herstelcode
  (`src/game/save.ts`), unittests.
- **M3 Blender-pijplijn:** `npm run assets` bouwt de modellen uit `assets/blender/build_*.py`. Zie `assets/blender/README.md`.
- **Nachtvaart aangekleed (sessie 2):** lagere camera de gracht in, 59 grachtenhuizen in drie
  geveltypes, bomen, meerpalen, aangemeerde bootjes, fietsen, vracht, wachtpost; drie soldaten met
  twee zoeklichten; wuivend riet, mist, drijvende bladeren, lichtkieren achter verduisterde ramen,
  kielzog, roeier en passagier die bewegen en wegduiken, omgevingsgeluid. 16 modellen, 254 KB.
- **M4 Nachtvaart, prototype:** pure simulatie (`src/components/canal/sim.ts`) met roeien, lawaai,
  zoeklicht, lichtband, riet en klokken; R3F-scène met de kit; HUD volgens ontwerp; drie aflopen
  (stil, gezien, omweg), geen game over. Een testbot vaart het parcours ongezien in 68 s.

- **Hoofdstuk 4 compleet (sessie 2):** dossier met echo van hoofdstuk 1, het dilemma over Jaap
  (vóór de vaart: neem je hem mee, dan roeit hij mee en is de boot zwaarder en luider), de vaart
  en krant No. 4 met zes varianten. Speelbare hoofdstukken mag je in elke volgorde openen zolang
  2, 3 en 5 nog in de maak zijn.

- **Hoofdstuk 2 compleet (sessie 2):** dossier, het dilemma over Kees (vóór de tocht), "Over de
  daken" en krant No. 2 met zes varianten. Eén duim: tik = ren naar de volgende schoorsteen,
  vasthouden = plat op de pannen. Twee zoeklichten op uitkijktorens, de klok naar acht uur.
  Met Kees: hij fluistert wanneer het veilig is, maar loopt achter je in het licht. Wie in
  hoofdstuk 1 het bewijs bewaarde, begint twee daken verder (Willems sleutel).

- **Hoofdstuk 3 compleet (sessie 2):** de getuigenis aan de Oosthaven. Geen spel, klok, keuze of
  score, en geen gegenereerd beeld. Vier stille momenten (gelabeld als verzonnen), daarna een
  gedenkblad in plaats van een krant: feiten uit het bronnenregister, lege stenen tot de namen
  zijn gecontroleerd, en "houd vast voor een moment stilte".

- **Visuele verfijning (sessie 2):** alle rekwisieten en personages afgerond en glad, schaduwen
  van maan en zoeklichten, weerspiegelend water, procedurele texturen, vignet en filmkorrel.
  21 modellen, samen ongeveer 560 KB.

- **Hoofdstuk 5 compleet (sessie 3):** Vluchtspoor. Je fietst door een straat bij het station
  tijdens een luchtaanval: sturen om het puin, bellen zodat mensen achter je aan lopen, en weg
  blijven van het rode vlak waar een bom gaat vallen (anders stuift iedereen uiteen; niemand
  raakt in beeld gewond). Het dilemma komt midden in de rit: help je de man zoeken of breng je
  de groep eerst? Krant No. 5 met zes varianten. Kees fietst mee als je hem in hoofdstuk 2 meenam.
- **Epiloog (sessie 3):** mei 1945 op de Markt. Wie er staan hangt af van je vier keuzes; daarna
  je vijf avonden op een rij en een brief aan later (blijft op het toestel). Opent zodra alle
  vijf hoofdstukken gespeeld zijn.

- **Vluchtspoor drastisch verbeterd (sessie 3):** een straat met leven. Lucht, station en keien
  zijn met Higgsfield gegenereerd (`public/img/bike/`); de lucht is ook de weerspiegeling in de
  plassen. Gevels met kozijnen, lateien, regenpijpen, winkelpuien, luifels en beschadigde
  varianten (uitgeblazen ramen, roet, gebroken gevel); ramen gloeien door de branden. Rennende
  mensen, vliegtuigen met gedrein, sirene, vuur met rook, vonken en as, puin en stof bij elke
  inslag, een lage zon die lange schaduwen de straat in werpt. Camera lager, met lucht erboven.
  Gemeten: ± 200 draw calls en 250k driehoeken per beeld (schaduwlaag inbegrepen).

- **Nachtvaart en Over de daken dezelfde behandeling (sessie 3):** elk een gegenereerde nachtlucht
  (`public/img/canal/sky.webp`, `public/img/rooftop/sky.webp`) via het gedeelde `canal/Sky.tsx`;
  die lucht is ook de weerspiegeling in water en ruiten. Hier en daar licht achter de
  verduistering (`useWindowGlow`). Leven: eenden op de gracht die wegpeddelen voor de boot en
  soms kwaken, duiven op de nokken die klapwiekend opvliegen als de koerier aankomt, dunne
  kolenrook uit een deel van de schoorstenen. De nieuwe gevels zijn in beide scènes bekeken.
  Zoeklichten werpen alleen nog schaduw van wat ertoe doet (laag `SPOT_LAYER`: boot, riet, eenden,
  koeriers, schoorstenen), en de lange rijen langs de gracht worden per blok van 50 m
  weggelaten als ze buiten beeld zijn. Gemeten: vaart 186 draw calls en 240–262k driehoeken
  (was 374k), daken 55 calls en 145k (was 256k).

- **Echte personages (sessie 3):** koerier, soldaat, man en vrouw zijn vervangen door getextureerde
  figuren met een skelet (character sheets in `docs/characters/`). De koerier rent met een echte
  renbeweging, hurkt achter de schoorsteen en ligt plat; op de fiets volgen zijn voeten de
  trappers en houden zijn handen het stuur vast; in de schouw trekt hij aan de riemen. Soldaten
  lopen over de brug, roken en houden het zoeklicht vast; burgers lopen, rennen en duiken weg.
  Gemeten: fietsstraat 145 draw calls en 265–270k driehoeken (was 250k), vaart 255–278k, daken 160k.
  Nog niet gedaan: gezichten zijn van dichtbij vaag, er zijn geen kinderfiguren (een kind is een
  verkleinde volwassene), en Marie en Jaap hebben geen eigen model.

- **Over de daken afwisselender (sessie 3):** drie soorten daken (donkere pannen, steile rode
  pannen met hijsbalk, plat loodsdak achter een borstwering), hoogteverschillen tot 2,2 m tussen
  buren, en vijf stegen van 1,7 tot 2,4 m. De sprong over een steeg time je zelf met een
  springbalk: op tijd een schone sprong, te vroeg grijp je de rand, te laat blijf je aarzelend
  aan de rand staan. Hij loopt nu
  echt op de nok (zweefde eerst boven het dak). De Waag en De Zalm staan op de achtergrond, links
  vooruit over de Markt, naast de Sint-Jan. De camera gaat omhoog als een hoger dak het zicht
  dreigt te blokkeren. Gemeten: 54 draw calls en 143k driehoeken.
  Ontwikkelhulp: `/?roof=1&cam=wide` bekijkt de koerier van dichtbij vanaf de straatkant.

- **Locatiemodus (M8, sessie 3):** een hoofdstuk ontgrendelt binnen 30 m van het adres ("Je bent
  er"); verder dan dat staat er "Nog 1,4 km lopen" en blijft "Ik ben er al · zonder gps" als
  terugval; zonder gps of zonder meting werkt "Ik ben er" meteen. In een hoofdstuk (dossier en
  minigame) kijkt een loopdetector mee: boven 0,9 m/s over zes seconden, drie metingen achter
  elkaar, komt er een scherm "Blijf even staan" en wachten alle minigames en de klok van het
  inpakspel; na drie seconden stilstaan (of als de gps niets meer meldt, zoals iOS doet) gaat het
  weg. "Ik sta of zit stil" zet de blokkade negentig seconden uit (trein, bankje, gps die springt).
  De detector vraagt nooit zelf om toestemming: pas nadat de kaart ("meet") of een eerdere keer is
  toegestaan. PWA: manifest, lakzegel-icoon (gewoon, maskable, Apple), service worker die de
  pagina, modellen en beelden bewaart (werkt met slecht bereik) en een eenmalige tip "Zet op
  beginscherm" (Installeer-knop op Android, uitleg over Deel op iOS).
  Nog open voor M8: de ankers ter plekke (zie hieronder) en een veldtest met twee spelers.

- **Kaart beweegbaar (sessie 3):** de kaart sleep je met een vinger (met een beetje uitloop), zoom je met
  knijpen, de +/−-knoppen of het muiswiel (1× tot 2,6×); bij 1× staat de hele stad met alle vijf
  de adressen en het station in beeld. Een hoofdstuk kiezen laat de kaart er nog steeds naartoe
  glijden, en de knop met het vizier brengt je terug. Zegels houden hun grootte bij elke zoom, en
  een sleepbeweging die op een zegel begint kiest het hoofdstuk niet. Code: `map/useMapView.ts`.

## Half af
- Nachtvaart is nog niet op een echte iPhone gespeeld (fps, duimbereik, moeilijkheid).
- De tekst van hoofdstuk 3 is een voorstel: laat die lezen door iemand van het Joods Monument
  of het Streekarchief voordat hij openbaar wordt.
- Over de daken en Nachtvaart zijn op de testbot afgesteld, niet op mensen.
- De Waag en De Zalm zijn naar foto's van nu gemaakt; of De Zalm er in 1942 zo uitzag, is niet nagegaan.
- De springtiming (venster 2,6 m, schoon in de laatste 1,3 m) is op de bot afgesteld; speeltest met 12-jarigen.
- De zwaarste scène (Vluchtspoor) is niet op een telefoon gemeten. In software haalt hij 1 beeld
  per seconde; schakel anders `gfx.life`, schaduwen of details uit in `src/game/tuning.ts`.
- Locatiemodus: ankers ontbreken nog. Het dossier toont alleen een zin ("zoek in de kerk…", "voor de
  deur liggen de Stolpersteine"); wat er precies te vinden is (jaartal, kisten, namen) moet ter
  plekke bekeken en in `sources.ts` gezet worden. De loopdetector en de 30 m zijn nooit op straat
  geprobeerd, alleen met een nagebootste gps (`node scripts/location-check.cjs`, na `npm run build`).
- Alle historische feiten staan op `verified: false` (`src/data/sources.ts`).

## Controle
- `npm run build` · `npm test` (60 tests) · `npm run test:e2e` (speelt hoofdstuk 1 door op 390×844,
  speelt het dossier van hoofdstuk 4 tot in de vaart en zet screenshots in `test-results/`) · `npm run assets`.
- Ontwikkelhulp (alleen in dev): `/?canal=1` opent de vaart direct, `&z=-60` start verderop;
  `/?roof=1` opent de daken, `&cover=8` start verderop; `/?bike=1` opent de fietstocht (`&bomb=1` laat direct een bom vallen, `&plane=1` toont een
  vliegtuig; `node scripts/bike-shots.cjs` en `bike-impact.cjs` maken screenshots). `node scripts/roof-shots.cjs` maakt screenshots.
  `node scripts/figure-shots.cjs` maakt close-ups van de personages (`/?bike=1&cam=side` bekijkt de
  fietser van opzij). `node scripts/canal-shots.cjs` maakt screenshots van de vaart; `node scripts/night-shots.cjs` maakt
  vier vaste shots van vaart en daken en meldt draw calls en driehoeken. `node scripts/location-check.cjs`
  (na een build) test de locatiemodus met een nagebootste gps en controleert manifest en service worker.

## Volgende stap
1. Speel hoofdstuk 1 en 4 op een iPhone; pas daarna `src/game/tuning.ts` aan.
2. Locatiemodus afmaken (M8): de ankers ter plekke, na een veldbezoek, en de veldtest met twee spelers.
   Daarna afwerking (M9): stemmen, toegankelijkheidscheck, archieffoto's. Kees (hoofdstuk 2) en Jaap (hoofdstuk 4) komen daar terug; de echo's staan als data klaar.
3. Laat de feiten van alle hoofdstukken verifiëren en vraag de eerste archieffoto's aan.

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

## Half af
- Nachtvaart is nog niet op een echte iPhone gespeeld (fps, duimbereik, moeilijkheid).
- De tekst van hoofdstuk 3 is een voorstel: laat die lezen door iemand van het Joods Monument
  of het Streekarchief voordat hij openbaar wordt.
- Over de daken en Nachtvaart zijn op de testbot afgesteld, niet op mensen.
- Locatiemodus: afstand via GPS en "Ik ben er" werken; ankers, veiligheidsblokkade en PWA niet.
- Alle historische feiten staan op `verified: false` (`src/data/sources.ts`).

## Controle
- `npm run build` · `npm test` (45 tests) · `npm run test:e2e` (speelt hoofdstuk 1 door op 390×844,
  speelt het dossier van hoofdstuk 4 tot in de vaart en zet screenshots in `test-results/`) · `npm run assets`.
- Ontwikkelhulp (alleen in dev): `/?canal=1` opent de vaart direct, `&z=-60` start verderop;
  `/?roof=1` opent de daken, `&cover=8` start verderop; `/?bike=1` opent de fietstocht. `node scripts/roof-shots.cjs` maakt screenshots.
  `node scripts/canal-shots.cjs` maakt screenshots van de vaart.

## Volgende stap
1. Speel hoofdstuk 1 en 4 op een iPhone; pas daarna `src/game/tuning.ts` aan.
2. Locatiemodus afmaken (M8): ankers ter plekke, veiligheidsblokkade tijdens lopen, PWA.
   Daarna afwerking (M9): stemmen, toegankelijkheidscheck, archieffoto's. Kees (hoofdstuk 2) en Jaap (hoofdstuk 4) komen daar terug; de echo's staan als data klaar.
3. Laat de feiten van alle hoofdstukken verifiëren en vraag de eerste archieffoto's aan.

# Voortgang

Laatste update: sessie 2 (hoofdstuk 1, 2 en 4 speelbaar). Start: `npm install && npm run dev` → http://localhost:3000.
Kies "Speel thuis". Hoofdstuk 1, 2 en 4 zijn volledig.

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

## Half af
- Nachtvaart is nog niet op een echte iPhone gespeeld (fps, duimbereik, moeilijkheid).
- Hoofdstuk 3 en 5: alleen kaartgegevens en keuzes/echo's als data. De epiloog ontbreekt.
- Over de daken en Nachtvaart zijn op de testbot afgesteld, niet op mensen.
- Locatiemodus: afstand via GPS en "Ik ben er" werken; ankers, veiligheidsblokkade en PWA niet.
- Alle historische feiten staan op `verified: false` (`src/data/sources.ts`).

## Controle
- `npm run build` · `npm test` (38 tests) · `npm run test:e2e` (speelt hoofdstuk 1 door op 390×844,
  speelt het dossier van hoofdstuk 4 tot in de vaart en zet screenshots in `test-results/`) · `npm run assets`.
- Ontwikkelhulp (alleen in dev): `/?canal=1` opent de vaart direct, `&z=-60` start verderop;
  `/?roof=1` opent de daken, `&cover=8` start verderop. `node scripts/roof-shots.cjs` maakt screenshots.
  `node scripts/canal-shots.cjs` maakt screenshots van de vaart.

## Volgende stap
1. Speel hoofdstuk 1 en 4 op een iPhone; pas daarna `src/game/tuning.ts` aan.
2. Hoofdstuk 5 (M6, Vluchtspoor) of hoofdstuk 3 (M7, de getuigenis zonder spelmechanica) en de
   epiloog. Kees (hoofdstuk 2) en Jaap (hoofdstuk 4) komen daar terug; de echo's staan als data klaar.
3. Laat de feiten van hoofdstuk 1, 2 en 4 verifiëren en vraag de eerste archieffoto's aan.

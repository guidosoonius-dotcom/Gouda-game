# Voortgang

Laatste update: sessie 1 (M0 t/m M4). Start: `npm install && npm run dev` → http://localhost:3000.
Kies "Speel thuis". Hoofdstuk 1 is volledig; tik op zegel 4 voor de proefvaart.

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

## Half af
- Nachtvaart is een **proefvaart**: nog zonder dossier, dilemma (Marie's broer) en krant, en nog
  niet op een echte iPhone gespeeld (fps, duimbereik, moeilijkheid).
- Hoofdstuk 2, 3 en 5: alleen kaartgegevens en keuzes/echo's als data.
- Locatiemodus: afstand via GPS en "Ik ben er" werken; ankers, veiligheidsblokkade en PWA niet.
- Alle historische feiten staan op `verified: false` (`src/data/sources.ts`).

## Controle
- `npm run build` · `npm test` (28 tests) · `npm run test:e2e` (speelt hoofdstuk 1 door op 390×844,
  start de proefvaart en zet screenshots in `test-results/`) · `npm run assets`.
- Ontwikkelhulp: `/?z=-60` start de proefvaart verderop (alleen in dev).
  `node scripts/canal-shots.cjs` maakt screenshots van de vaart.

## Volgende stap
1. Speel hoofdstuk 1 en de proefvaart op een iPhone; pas daarna `src/game/tuning.ts` aan.
2. Maak hoofdstuk 4 af (dossier, dilemma, krant, echo van hoofdstuk 1) of begin aan hoofdstuk 2
   (M5, Over de daken); de pijplijn en de schermen zijn herbruikbaar.
3. Laat de feiten van hoofdstuk 1 verifiëren en vraag de eerste archieffoto aan.

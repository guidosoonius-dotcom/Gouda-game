# Voortgang

Laatste update: sessie 2 (hoofdstuk 1 en 4 speelbaar). Start: `npm install && npm run dev` → http://localhost:3000.
Kies "Speel thuis". Hoofdstuk 1 en 4 zijn volledig; tik op zegel 4 voor de Nachtvaart.

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

## Half af
- Nachtvaart is nog niet op een echte iPhone gespeeld (fps, duimbereik, moeilijkheid).
- Hoofdstuk 2, 3 en 5: alleen kaartgegevens en keuzes/echo's als data.
- Locatiemodus: afstand via GPS en "Ik ben er" werken; ankers, veiligheidsblokkade en PWA niet.
- Alle historische feiten staan op `verified: false` (`src/data/sources.ts`).

## Controle
- `npm run build` · `npm test` (32 tests) · `npm run test:e2e` (speelt hoofdstuk 1 door op 390×844,
  speelt het dossier van hoofdstuk 4 tot in de vaart en zet screenshots in `test-results/`) · `npm run assets`.
- Ontwikkelhulp (alleen in dev): `/?canal=1` opent de vaart direct, `&z=-60` start verderop.
  `node scripts/canal-shots.cjs` maakt screenshots van de vaart.

## Volgende stap
1. Speel hoofdstuk 1 en 4 op een iPhone; pas daarna `src/game/tuning.ts` aan.
2. Hoofdstuk 2 (M5, Over de daken): de keuzes en echo's staan al als data klaar; de kit
   (gevels, soldaat, zoeklicht) is herbruikbaar voor de daken.
3. Laat de feiten van hoofdstuk 1 en 4 verifiëren en vraag de eerste archieffoto's aan.

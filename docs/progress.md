# Voortgang

Laatste update: sessie 1. Start: `npm install && npm run dev` → http://localhost:3000 (kies "Speel thuis").

## Af
- **M0 Fundament:** Next.js 16 (App Router, TS), Tailwind v4-tokens, zelf-gehoste fonts, Zustand-store
  met persist, view-router, procedureel geluid (`src/lib/sound.ts`).
- **M1 Hoofdstuk 1 speelbaar:** titel → Blaeu-kaart (lantaarn, lakzegels, tijdlijn, archiefkaart) →
  dossier (getypt briefje, toen-en-nu, opdracht) → pakpuzzel (2 kisten, schokgolven, Willem) →
  dilemma → krant "De Koerier" → koerierstas.
- **M2 Keuzesysteem:** `src/game/choices.ts` (keuzes, uitkomsten, echo's), herstelcode
  (`src/game/save.ts`), 22 unittests (`npm test`).

## Controle
- `npm run build` · `npm test` · `npm run test:e2e` (speelt hoofdstuk 1 door op 390×844 en zet
  screenshots in `test-results/`).

## Volgende stap
Zie onderaan dit bestand na elke sessie; details per mijlpaal in `docs/roadmap.md`.

# Roadmap — iteratief en zuinig met tokens

Principe: **één mijlpaal per sessie**. Elke mijlpaal levert iets speelbaars of zichtbaars op,
heeft controleerbare acceptatiecriteria en eindigt met een commit. Begin elke sessie met
"Werk aan mijlpaal Mx uit docs/roadmap.md"; Claude leest dan alleen `CLAUDE.md`, deze regel en
de betreffende sectie van `docs/design.md`.

## Mijlpalen

| # | Mijlpaal | Klaar als |
|---|----------|-----------|
| M0 | **Fundament:** Next.js-scaffold, tokens, fonts, store, view-router, `chapters.ts`-stub, Vercel-preview | Lege flow SPLASH→KAART→DOSSIER→SPIEGEL klikbaar op 390×844, build groen |
| M1 | **2D-kern hoofdstuk 1:** kaart (thuismodus), dossier, puzzel "glas inpakken", dilemma, Spiegel, koerierstas, in de gekozen visuele richting | Hoofdstuk 1 volledig speelbaar; screenshot gecontroleerd |
| M2 | **Keuzesysteem:** vlaggen, echo-regels, herstelcode | Unittest: elke vlag wordt in een later hoofdstuk gelezen |
| M3 | **Blender-pijplijn + kit voor H4:** `npm run assets`, kade, riet, brug, sluisdeur, schouw | GLB's binnen budget, voorbeeldrender per asset bekeken |
| M4 | **Nachtvaart, verticale slice:** grijze blokken eerst (`prototype-fast`), dan assets, licht en geluid | Speeltest: 2–3 min speelduur, uitlegbaar zonder tekst, 60 fps op iPhone |
| M5 | **Over de daken (H2)** | Idem |
| M6 | **Vluchtspoor (H5)** met dilemma midden in de level | Idem |
| M7 | **Getuigenis (H3) + epiloog** | Inhoud gereviewd op toon |
| M8 | **Locatiemodus:** GPS, ankers, veiligheidsblokkade, PWA | Veldtest in Gouda met 2 spelers |
| M9 | **Afwerking:** audio, toegankelijkheid, bronverificatie, archieffoto's | Alle `verified: true`; a11y-check |

Stand na sessie 1: M0, M1, M2 en M3 zijn af; M4 is een speelbaar prototype met de kit (nog geen
speeltest op een iPhone, nog geen dossier en krant). Zie `docs/progress.md`.

## Zuinig met tokens

- `CLAUDE.md` kort houden (deze wordt elke sessie geladen); details in `docs/`.
- Inhoud (teksten, keuzes, bronnen) in datamodules, los van componenten, zodat een tekstwijziging
  geen component raakt.
- Bestanden bewerken, niet herschrijven; componenten kleiner dan 250 regels.
- Eén screenshot of één render per controle, laag van resolutie.
- Tuning-getallen in één bestand: na een speeltest stuur je alleen "maak X 20% trager".
- Grijze blokken eerst: pas assets maken als de minigame leuk is.
- Na elke mijlpaal `/clear` en een nieuwe sessie.

## Open beslissingen

- Visuele richting: A, B, C of een mix (advies: C voor kaart en dossier, B voor Spiegel en koerierstas).
- Stemmen: ingesproken door een acteur, of eerst TTS als placeholder.
- Anoniem "hoe kozen anderen" in de epiloog: vraagt een kleine backend (bijvoorbeeld Supabase of Vercel KV).

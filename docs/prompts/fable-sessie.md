# Prompt: grote ontwikkelsessie met Fable

Gebruik: start een nieuwe sessie op deze repo, zet het model op Fable
(`/model claude-fable-5-2`) en de effort hoog, en plak de tekst hieronder.

---

Je bouwt vanavond aan "Koerier aan de Gouwe", een historische locatiegame over Gouda in 1940–1945.
Begin vanaf branch `claude/eloquent-franklin-q7v7py`: daar staan alle plannen.

## Lees eerst (en alleen dit)
- `CLAUDE.md`: harde regels.
- `docs/roadmap.md`: mijlpalen M0–M9.
- `docs/design.md`: secties 2, 3 en 4 (hoofdstuk 1 en 4) en 5.2.
- `docs/screens/`: vijf goedgekeurde schermontwerpen (.dc.html + .webp). Dit is de visuele lat.
- `docs/concept/`: doel-look voor de 3D (sfeer en licht, niet de camera).

## Doel voor deze sessie
Zet de grootst mogelijke stap naar een speelbare verticale slice op iPhone. Concreet, in volgorde:
1. M0, fundament: Next.js-app, tokens, fonts, store, view-router.
2. M1: hoofdstuk 1 volledig speelbaar, van titel tot krant, in de stijl van `docs/screens`.
   Neem de Blaeu-kaart met lantaarn-effect en lakzegels over.
3. M2: keuzesysteem met vlaggen en echo, met unittests.
4. Als er tijd over is: M3 en M4, de Blender-pijplijn en een grijze-blokken-prototype van
   Nachtvaart dat als speltje al leuk voelt.

De regel "één mijlpaal per sessie" uit `CLAUDE.md` geldt vanavond niet. Werk door zolang het
lukt, maar sluit elke mijlpaal af voordat je aan de volgende begint: acceptatiecheck, commit, push.

## Vrijheid
- Jij beslist over architectuur, bestandsstructuur, libraries en de uitwerking van details.
- Zie je een beter idee dan het plan (gameplay, UX, techniek)? Doe het als het binnen de harde
  regels past, en leg het uit in `docs/decisions.md` (beslissing, waarom, alternatief).
- Twijfel je tussen twee wegen? Kies er één en noteer de andere als open vraag. Stop alleen als je
  echt geblokkeerd bent.
- Gebruik subagents voor werk dat parallel kan, bijvoorbeeld de Blender-kit terwijl jij de UI bouwt.
- Gebruik de geïnstalleerde skills waar ze passen (`prototype-fast`, `game-feel`, `threejs-*`,
  `game-ui-ux`, `save-systems`, `dialogue-systems`).

## Niet onderhandelbaar
- Alle harde regels in `CLAUDE.md`, vooral:
  - geen gefabriceerde geschiedenis: feiten in `src/data/sources.ts` met `verified: false`,
    zichtbaar als placeholder;
  - geen gegenereerde archieffoto's;
  - hoofdstuk 3 zonder spelmechanica;
  - geen game over;
  - frame-onafhankelijke physics;
  - tuning-getallen in `src/game/tuning.ts`.
- Kwaliteitslat: het eindresultaat moet aanvoelen als de ontwerpen in `docs/screens`. Geen generieke
  UI, geen pillen. Controleer elk scherm met een Playwright-screenshot op 390×844, bekijk het zelf
  en vergelijk het met de ontwerpen. Repareer verschillen voordat je verder gaat.
- `npm run build` en de tests zijn groen bij elke commit. Push naar je eigen branch. Geen PR.

## Omgeving
- Het setup-script van de omgeving installeert bpy (Blender), `mcp<2`, de EGL-bibliotheken voor
  EEVEE en `gltf-transform`. Controleer dat met `python3 -c 'import bpy'`.
- Ontbreekt bpy toch? `pip install bpy` is via de proxy heel traag. Download het wheel met curl
  van files.pythonhosted.org en installeer het lokaal.
- De bpy-MCP-server staat in `.mcp.json`. Werkt die niet in deze sessie, gebruik dan losse
  bpy-scripts.
- CPU-only rendering: houd renders laag (480×270, 8 samples).

## Voortgang en overdracht
- Houd `docs/progress.md` bij: wat af is, wat half af is, wat de volgende stap is. Dan kan een
  nieuwe sessie zonder uitleg verder.
- Sluit af met een kort verslag:
  - wat er speelbaar is en hoe ik het start;
  - screenshots van de belangrijkste schermen;
  - welke beslissingen je zelf nam;
  - wat je zou voorstellen voor de volgende sessie.

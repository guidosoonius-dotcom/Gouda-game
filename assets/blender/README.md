# Asset-kit (Blender, headless)

`npm run assets` draait elk `build_*.py` met `python3` (Blender als module, `bpy`), ruimt de GLB's op
met `gltf-transform` (dedup + prune, geen compressie) en bewaakt het budget (≤ 250 KB per bestand,
≤ 1,5 MB per minigame). Elke build schrijft ook één voorbeeldrender naar `previews/` (480×270, EEVEE,
8 samples): bekijk die voordat je een asset "klaar" noemt.

Coördinaten in het spel (glTF): Y omhoog, meters, wateroppervlak op y = 0, de gracht loopt langs Z en
de boot vaart richting −Z. In Blender is dat: gracht langs Y, boot richting +Y, Z omhoog.
Materialen zijn alleen een basiskleur (gedeelde namen in `_lib.py`); het licht wordt in het spel
ontworpen. Materiaal `Lamp` krijgt in het spel een gloed.

| Asset | Afmetingen | Oorsprong en richting | Nodes |
|-------|------------|-----------------------|-------|
| `schouw` | 4,2 × 1,4 m | waterlijn midscheeps; boeg naar −Z | `Hull`, `Rower`, `Passenger`, `OarL`, `OarR` (riemen draaien om hun dol) |
| `riet` | ø 1,4 m, 2,2 m hoog | waterlijn, midden van de pol | `Riet` |
| `kade` | 10 m lang, 3 m diep, y −1 … 1,2 | waterlijn, midden van het segment; muur op x = 0, land naar +X | `Kade` |
| `ophaalbrug` | overspanning 10,4 m, dek 3 m breed, dek op y = 1,3 | midden van de gracht, waterlijn; hameipoort op +X | `Ophaalbrug` |
| `sluisdeur` | 10,4 m breed, y −1 … 2 | midden van de gracht, waterlijn; punt van de deuren naar −Z | `Sluisdeur` |
| `gevel_trap`, `gevel_klok`, `gevel_tuit` | 5,0–6,2 m breed, 8 m diep, 11–13 m hoog | maaiveld, midden van de gevel; gevel kijkt naar −X | `Gevel` |
| `soldaat` | 1,8 m; skelet, clips in `moves` | voeten; kijkt naar +Z | `Soldaat`, botten (`Hips`, `Spine`, `LeftArm` …) |
| `zoeklicht` | 1,65 m | voet van het statief | `Zoeklicht`, `Head` (draaipunt op 1,35 m; lens kijkt naar +Z) |
| `wachtpost` | huisje 1,1 × 1,1 × 2,5 m met zandzakken | maaiveld, midden van het huisje; opening naar −X | `Wachtpost` |
| `boom` | ± 7 m | voet van de stam | `Boom` |
| `fiets` | 1,8 m lang | grond, tussen de wielen | `Fiets` |
| `meerpaal` | 2,5 m, waarvan 1,65 m boven water | waterlijn | `Meerpaal` |
| `vracht` | twee kisten en een ton | grond | `Vracht` |
| `dakhuis` | 9 × 9 m, nok op 10,2 m | maaiveld, midden; nok langs X, voorkant naar +Z | `Dakhuis` |
| `schoorsteen` | 1,2 × 1,0 m, 2,4 m boven de nok | op de noklijn | `Schoorsteen` |
| `koerier` | 1,75 m; skelet en clip `run` | voeten; kijkt naar +Z | `Koerier`, botten |
| `uitkijk` | 3,2 m vierkant, platform op 14,3 m | maaiveld | `Uitkijk` |
| `sintjan` | ± 60 m lang, toren 52 m; alleen als silhouet | maaiveld, midden van het schip | `SintJan` |
| `man`, `vrouw` | 1,74 en 1,66 m; burgers, naar niemand gemodelleerd; skelet van de soldaat | voeten; kijken naar +Z | `Man`/`Vrouw`, botten |
| `moves` | alleen het skelet van de soldaat met de clips `walk` en `run` | — | botten |
| `puin` | hoop van ± 3 m | grond | `Puin` |
| `ruine` | 5,6 m breed, ingestort huis | maaiveld, midden van de gevel; gevel naar −X | `Ruine` |
| `schuilkelder` | 7 m breed, ingang met zandzakken | maaiveld, midden van de voorkant; voorkant naar −X | `Schuilkelder` |
| `lantaarn` | 3,4 m, gedoofd (verduistering) | voet | `Lantaarn`, `Light` |
| `dakhuis`, `dakhuis_steil`, `dakhuis_plat` | 9 × 9 m; nok op 10,2 / 11,0 m, plat dak op 9,0 m (zie `_dakhuis.py`) | maaiveld, midden; nok langs X | `dakhuis…` |
| `waag`, `zalm` | Waag 14 m breed en ± 17 m hoog; De Zalm 8 m breed, lager dan de Waag; alleen als silhouet in de verte | maaiveld, midden; voorgevel naar +Z | `Waag`, `Zalm` |
| `eend` | 0,5 m, woerd | waterlijn; snavel naar +Z | `Eend` |
| `duif` | 0,3 m, zittend | onder de poten; snavel naar +Z | `Duif` |

In het spel (`src/components/canal/Kit.tsx`) worden de materiaalkleuren naar vertexkleuren gebakken
en de onderdelen per node samengevoegd: één draw call per model. Uitzonderingen op naam:
`Lamp` gloeit, `Reed`/`ReedPlume` en `Leaf` wuiven in de wind.

Een nieuwe asset: kopieer een `build_*.py`, gebruik `Builder` uit `_lib.py` (dozen, cilinders,
polygonen, loft), sluit af met `export(naam)` en `preview(naam)`.

## Personages

De mensen zijn de uitzondering op "alles met de hand in Blender". Per personage:

1. een character sheet (`docs/characters/<naam>.webp`: voor, achter, portret; A-houding);
2. het vooraanzicht is met Higgsfield (SAM 3D) omgezet naar een mesh met textuur;
3. koerier en soldaat kregen via Higgsfield (Meshy) een skelet van 24 botten en één bewegingsclip
   (`Run_03`, `Casual_Walk_inplace`); de originelen staan in `assets/characters/`;
4. `_figure.py` maakt ze klein genoeg voor een telefoon: lassen, decimeren (koerier 3.000, soldaat
   2.000, man en vrouw 1.150 driehoeken), de man en de vrouw krijgen het skelet van de soldaat
   (gewichten overgenomen van zijn mesh), en de clips worden herschreven tot alleen rotaties, met de
   voorwaartse verplaatsing uit de heupen gehaald. De ren-clip van de koerier wordt naar het skelet
   van de soldaat omgerekend, zodat burgers ook kunnen rennen;
5. `scripts/build-assets.cjs` verkleint de textuur naar 512 px WebP en kwantiseert de attributen.

Zittende houdingen (roeien, fietsen), hurken en wegduiken zijn geen clips: die maakt het spel zelf
door handen en voeten naar een doel te sturen (`src/components/canal/Figure.ts`, `poses.ts`).

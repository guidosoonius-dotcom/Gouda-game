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
| `schouw` | 4,2 × 1,4 m | waterlijn midscheeps; boeg naar −Z | `Hull`, `Crew`, `OarL`, `OarR` (riemen draaien om hun dol) |
| `riet` | ø 1,4 m, 2,2 m hoog | waterlijn, midden van de pol | `Riet` |
| `kade` | 10 m lang, 3 m diep, y −1 … 1,2 | waterlijn, midden van het segment; muur op x = 0, land naar +X | `Kade` |
| `ophaalbrug` | overspanning 10,4 m, dek 3 m breed, dek op y = 1,3 | midden van de gracht, waterlijn; hameipoort op +X | `Ophaalbrug` |
| `sluisdeur` | 10,4 m breed, y −1 … 2 | midden van de gracht, waterlijn; punt van de deuren naar −Z | `Sluisdeur` |
| `wacht` | 1,8 m | voeten; kijkt naar +Z | `Wacht`, `Lamp` (leeg object bij de handlamp) |
| `lantaarn` | 3,4 m | voet | `Lantaarn`, `Light` (leeg object bij de lamp) |

Een nieuwe asset: kopieer een `build_*.py`, gebruik `Builder` uit `_lib.py` (dozen, cilinders,
polygonen, loft), sluit af met `export(naam)` en `preview(naam)`.

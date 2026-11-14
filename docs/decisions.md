# Beslissingen

Keuzes die tijdens het bouwen zijn gemaakt en afwijken van, of verder gaan dan, het plan.
Formaat: beslissing · waarom · alternatief.

## Sessie 1 (M0–M4)

1. **Fonts via `@fontsource`, niet via `next/font/google`.**
   Waarom: de build mag niet afhangen van een netwerkverbinding met Google; fonts staan nu in het
   bundel en werken offline (belangrijk voor de PWA later). Alternatief: `next/font/google`.
2. **Tailwind v4 met tokens in `globals.css` (`@theme`).** Eén bron voor kleur en typografie;
   basisregels staan in `@layer base`, anders overschrijven ze utilities op knoppen.
3. **Eén pagina met een view-router in de store** (`title → map → dossier → task → mirror`), geen
   Next-routes. Waarom: het spel is één doorlopende ervaring en de WebGL-canvas mag alleen
   bestaan tijdens een minigame. Alternatief: routes per scherm (deelbare links, maar complexer
   met persistente state).
4. **Koerierstas wordt afgeleid, niet opgeslagen.** De inhoud is een functie van voltooide
   hoofdstukken en vlaggen. Daardoor past de hele voortgang in een herstelcode van 9 tekens
   (`KG-XXXXX-X`, Crockford base32 met controleteken).
5. **Ook taakuitkomsten zijn vlaggen** (`ch1.task = alleen | willem`). Mislukken verandert het
   verhaal: bij de derde schokgolf neemt Willem de kist over. Er is geen game over.
6. **Hoofdstuk 1 is een pakpuzzel geworden** ("elke kist exact vol") in plaats van "tik op drie
   sloten". Waarom: het is een echt spelletje met een heldere regel die uit het verhaal volgt
   (glas dat kan schuiven, breekt), bedienbaar met één vinger. De panelen worden procedureel
   getekend (geen afbeeldingen van de echte Goudse Glazen).
7. **Onverifieerde feiten: zichtbaar gemarkeerd in dev, achtergehouden in productie.**
   In productie staat er één eerlijke regel ("n feiten worden nog gecontroleerd"). Voor een
   preview voor de historicus: `NEXT_PUBLIC_SHOW_UNVERIFIED=1`.
8. **Kaart panned naar het gekozen zegel; alle zegels zijn aantikbaar.** Voltooide hoofdstukken:
   krant herlezen of opnieuw spelen. De lantaarn glijdt mee via geregistreerde CSS-variabelen
   (`@property`), zonder JavaScript-animatie.
9. **Twee extra scènebeelden voor hoofdstuk 1** (kerkinterieur, student) gemaakt met Higgsfield
   (5,5 credits). Het zijn illustraties bij fictie, geen archiefmateriaal; archiefplekken blijven
   `ArchivePlaceholder`.
10. **Basale GPS zit er al in** (afstand op de archiefkaart na toestemming, plus handmatige
    "Ik ben er"). De volledige locatiemodus (ankers, veiligheidsblokkade, PWA) blijft M8.

11. **Nachtvaart: de simulatie staat los van de weergave** (`sim.ts`, zonder three.js). Daardoor
    kan een testbot het parcours varen: de test bewijst dat het ongezien haalbaar is en dat
    30, 60 en 120 fps hetzelfde resultaat geven. Alternatief: logica in `useFrame`.
12. **"Links" stuurt naar links.** In een echte roeiboot draait de boot naar links als je de
    rechterriem trekt; de knop volgt de richting, de animatie de juiste riem. Alternatief: knop =
    riem (realistischer, maar verwarrend op een telefoon).
13. **Twee soorten licht in plaats van één.** Het zoeklicht van de brugwacht zwenkt zigzag (uitwijken
    opzij), de lamp op de sluis veegt een band over de hele breedte (alleen timing en riet helpen).
    De wal schampen kost alleen lawaai bij een echte klap, omdat het riet tegen de kade staat.
14. **Kit zonder huizen.** In de staande camera valt de bebouwing buiten beeld; de huizen zijn
    donkere blokken (twee draw calls). De kit bevat wat je wel ziet: schouw, riet, kade, brug,
    sluisdeuren, wacht, lantaarn. De subagent voor de kit liep vast op een gebruikslimiet; de kit is
    daarna in de hoofdsessie gebouwd.
15. **Proefvaart bereikbaar via zegel 4**, met stempel "PROEFVAART". Ze telt niet als voltooid
    hoofdstuk; de afloop wordt wel al als vlag bewaard (`ch4.task`).

16. **Nachtvaart: camera lager en dichterbij.** Je kijkt nu de gracht in in plaats van er recht
    bovenop: de huizenrijen, de brug en het zoeklicht in de verte horen bij het beeld. De
    klokmelding is daarom een klein vakje bovenin geworden en Marie spreekt als ondertitel.
17. **Verduistering als sfeer én als regel.** Straatlantaarns zijn gedoofd en ramen donker; alleen
    hier en daar ontsnapt licht langs een luik of gordijn. Daardoor is het zoeklicht hét licht in
    beeld. Dit is scène-fictie; of en hoe Gouda in oktober 1944 verduisterd was, staat nog niet in
    het bronnenregister en wordt nergens als feit gepresenteerd.
18. **Soldaten zonder insignes.** Drie schildwachten in jas en helm: één loopt wacht op de brug
    (blijft staan, kijkt over de reling, rookt), twee bedienen een zoeklicht op statief en stappen
    mee als het licht zwenkt. Hoort de wacht riemen, dan draait hij zich naar de boot.
19. **Eén draw call per model.** Kleuren worden bij het laden naar vertexkleuren gebakken en
    samengevoegd; riet en bladeren wuiven via een kleine vertex-shader die ook op de boot reageert.
20. **Aangemeerde bootjes zijn obstakels.** Drie lege schouwen liggen aan meerpalen; je glijdt
    erlangs af, een harde klap maakt lawaai. Ze liggen nooit bij een rietkraag (getest).

## Open vragen
- Tijdsdruk in hoofdstuk 1: nu 3 schokgolven × 30 s. Te krap of te ruim voor 12-jarigen? Speeltest.
- Blaeu-kaart: pin-posities zijn op het oog geplaatst. Georefereren met controlepunten in M8.
- Nachtvaart: lawaai per slag (0,17) en alarmgrens (0,72) zijn op de bot afgesteld, niet op mensen.
- Nachtvaart: camera kijkt steil omlaag; een iets lagere hoek toont meer sfeer maar minder overzicht.
- Krant in productie: achterhouden (nu) of het hoofdstuk pas vrijgeven als alles geverifieerd is?

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
15. (Vervallen in sessie 2: de proefvaart is hoofdstuk 4 geworden, zie 21.)

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

21. **Het dilemma van hoofdstuk 4 komt vóór de vaart.** Zo bepaalt de keuze het spel: met Jaap
    aan boord is elke slag luider en de boot trager, maar in de maat roeien levert veel meer op.
    De store kent daarvoor één regel (`advance`): na een dilemma of opdracht volgt het volgende
    blad, en na het laatste blad de krant. Een testbot vaart beide varianten ongezien uit.
22. **Speelbare hoofdstukken zijn los te openen** zolang de tussenliggende nog gebouwd worden.
    Als alle vijf er zijn, kan de volgorde weer worden afgedwongen (één regel in `MapScreen`).

23. **Over de daken: camera achter de koerier langs de nok**, niet het zijaanzicht uit het
    ontwerp. In staand formaat zie je in zijaanzicht maar zes meter dak; langs de nok zie je de
    schoorstenen op een rij en het zoeklicht aankomen. Zelfde opzet als de Nachtvaart.
24. **Eén duim, twee werkwoorden:** tikken is rennen naar de volgende schoorsteen, vasthouden is
    plat gaan liggen (het licht telt dan voor 30%). Springen over stegen gaat vanzelf.
25. **De klok is de tweede tegenstander.** 80 seconden staan voor 19:52 tot 20:00. Te laat of drie
    keer gezien: je neemt de steeg en komt te laat; het verhaal gaat door (uitkomst `telaat`).
26. **Kees is een ruil, geen bonus.** Hij zegt wanneer een sprint veilig is (dezelfde berekening
    als de testbot), maar je bent trager en hij loopt twee meter achter je in het licht.
27. **De uitkijktorens met zoeklichten zijn decor bij de fictie**, net als de verduistering: niets
    daarvan staat als feit in het bronnenregister.

28. **Hoofdstuk 3 eindigt met een gedenkblad, niet met de krant.** Geen kop, geen stempel
    FICTIE, geen beloning. De scènes binnen zijn verzonnen en dragen dat label; er wordt geen
    naam van een slachtoffer verzonnen (een test bewaakt dat de lijst leeg blijft zolang de
    feiten niet geverifieerd zijn) en er is op deze plek geen gegenereerd beeld.

29. **Filmische afwerking zonder zware techniek.** Afgeronde en gladde modellen (bevel en
    gewogen normalen in Blender), maanlicht met zachte schaduwen, een nachthemel als
    omgevingslicht zodat water en helmen iets weerspiegelen, glanzend water met rimpels, en
    baksteen, dakpannen, hout en keien als procedureel patroon in de shader (geen afbeeldingen,
    geen downloads). Vignet, korrel en kleur zijn CSS. De eerdere regel "geen realtime schaduwen"
    is daarmee vervangen door schakelaars in `TUNING.gfx`: zet die uit als een telefoon de 60
    beelden per seconde niet haalt. Dat is nog niet op een echt toestel gemeten.

30. **Vluchtspoor: niemand raakt in beeld gewond.** Een inslag te dichtbij laat de mensen achter
    je uiteenstuiven; je belt ze terug. Loopt de tijd af, dan neemt Gerrit het over. De uitkomst
    zegt wie de kelder haalde, niet wie het niet overleefde. De echte doden van die dag komen
    alleen in de krant, en pas met naam als de bron is gecontroleerd.
31. **Het dilemma van hoofdstuk 5 zit in het spel zelf** (`taskChoice`), niet op een dossierblad:
    de man grijpt je stuur terwijl je rijdt. Kies je zoeken, dan neemt Gerrit je groep over en
    rijd je alleen door naar het ingestorte huis.
32. **De epiloog verandert niets en zegt dat ook.** Alle vier keuzes komen terug in wie er op de
    Markt staat (getest voor elke optie); de speler sluit af met een eigen brief. De bevrijding
    van Gouda staat als onverifieerd feit in het bronnenregister.

33. **Gegenereerde beelden als decor voor Vluchtspoor.** Een rokerige schemerlucht, naadloze natte
    keien en een stationsgevel komen uit Higgsfield (`public/img/bike/`, samen 350 KB). Dit
    verruimt de regel "geen afbeeldingen": alleen voor decor en ondergrond, nooit als
    archieffoto. Het station is een generiek Nederlands stationsgebouw, niet het Goudse.
34. **Licht in Vluchtspoor: een lage zon achter het spoor** is de enige schaduwwerper. Die rakelt
    langs de straat, dus de schaduwen vallen naar de speler toe en de gevels zijn aan de rand
    verlicht. De lucht dient ook als omgevingsbeeld voor weerspiegelingen. Het vuur kleurt de
    ramen oranje via de shader (vier vuurpunten), zonder extra geometrie.
35. **Gevels kregen veel meer detail maar geen bevel.** Afgeronde randen op kleine onderdelen
    maakten elk huis 8.000 driehoeken; zonder bevel zijn het er ± 1.000. Personages en
    rekwisieten houden hun gladde vorm.
36. **Het waarschuwingsvlak van een bom is gameplay**, dus altijd getekend (ook als `gfx.life` uit
    staat), en op de heldere straat een witte pulserende ring op rood.
37. **Elke nachtscène krijgt een gegenereerde lucht die ook omgevingsbeeld is** (`canal/Sky.tsx`).
    De lucht volgt de camera, dus geen parallax en nooit een rand. In Nachtvaart kijkt de camera
    steil omlaag; daar zie je de lucht vooral terug in het water.
38. **Zoeklichtschaduw alleen voor wat ertoe doet.** Elke schaduwkaart tekende de hele set
    opnieuw. Nu tekent de maan alles en een zoeklicht alleen laag `SPOT_LAYER` (boot, riet,
    eenden, koeriers, schoorstenen). Lange rijen langs de gracht zijn in blokken van 50 m
    opgeknipt (`Instanced chunk`), en de camera van de vaart kijkt niet verder dan 130 m
    (de mist is daar al dicht).
39. **Dieren zijn sfeer, geen gameplay.** Eenden en duiven reageren op de speler, maar
    veranderen de simulatie niet: een kwak of opvliegende duiven alarmeert geen wacht. Kleine
    ronde dingen krijgen `build(smooth=True)` in plaats van bevel (een bevel verdrievoudigde de
    driehoeken van een eend).
40. **Personages komen uit Higgsfield, niet uit dozen.** De blokfiguren met draaiende benen waren
    het zwakste punt. Nu: character sheet → 3D-mesh met textuur (SAM 3D, 1 credit per stuk) →
    skelet met een echte loop- of renbeweging (Meshy, 8 credits per stuk, alleen voor koerier en
    soldaat) → `_figure.py`. Meshy 7 had mooiere gezichten gegeven, maar kost 38–47 credits per
    personage; op spelafstand is het verschil klein. Dit verruimt regel 3 voor personages.
41. **Eén skelet voor soldaat, man en vrouw.** Alle drie dragen een lange jas; de gewichten van de
    soldaat passen daarom goed. Zo delen ze hun clips (`moves.glb`) en was één betaald skelet genoeg.
42. **Geen AnimationMixer.** Elke frame bouwt een scène de houding opnieuw op: rusthouding, clip
    erin mengen, handgemaakte houding erin mengen (`Figure.begin/clip/blend`). Zitten, roeien en
    fietsen zijn geen clips maar een bereik-oplossing met twee botten: de voeten volgen de trappers,
    de handen de riemen. Geen verborgen toestand, dus een gepauzeerd spel kan niet wegdrijven.
43. **De sprong over een steeg time je zelf** (op verzoek, "dat maakt het leuker"). Vlak voor de
    afzet verschijnt een springbalk: tik je in het laatste stuk, dan is het een schone sprong.
    Tik je eerder, dan kom je te kort, grijp je de rand en trek je je op (0,9 s, in het open).
    Tik je niet, dan blijf je aarzelend aan de rand staan tot je tikt, ook in het open. Nooit een
    val: rule 9. De stegen staan in `ROOF.alleys`; de bot springt en haalt de tijd ruim.
    Hoogteverschillen tussen huizen die tegen elkaar staan blijven een automatisch sprongetje.
44. **De koerier loopt óp de nok.** Hij zweefde een meter boven de voorkant van het dak. Nu loopt
    hij over de nokpannen, staan de schoorstenen net achter de nok (tussen hem en de torens), en
    glijdt hij bij platliggen een halve meter de voorkant af.
45. **Waag en De Zalm naar foto's** (aangeleverd, van nu): de Waag met grijsbruine zandstenen
    voorgevel, boogdeur, wit reliëf van het kaaswegen, fronton met het stadswapen tussen leeuwen,
    leien schilddak met twee pironnen en witte luifels opzij; De Zalm met lichte gepleisterde gevel
    van vijf traveeën, balkonnetjes, kroonlijst op consoles, dakkapel met oeil-de-boeuf en de
    vergulde zalm boven de ingang. Of de gevel van De Zalm er in 1942 al zo uitzag, en hoe ze
    precies ten opzichte van elkaar staan, is niet gecontroleerd. Het is decor, geen bewering.
46. **De loopblokkade is streng op snelheid en mild op fouten.** Snelheid is de afstand over zes
    seconden (twee metingen vlak na elkaar zijn gps-ruis); drie metingen achter elkaar boven
    0,9 m/s blokkeren, drie seconden onder 0,5 m/s heffen op, en een gps die niets meer meldt
    telt als stilstaan (iOS meldt alleen bij beweging). Een kind kan "Ik sta of zit stil"
    indrukken; dat is bewust: een trein of een springende gps mag het spel niet onspeelbaar
    maken, en de blokkade is een hulp, geen slot. De waarden staan in `TUNING.location`.
47. **Ontgrendelen blijft vertrouwen.** Binnen 30 m staat er "Je bent er", ver weg blijft de
    knop dicht, maar een handmatige knop opent hem toch: gps in een smalle straat tussen hoge
    gevels is vaak een straat ernaast. Zonder meting opent "Ik ben er" meteen.
48. **De service worker bewaart, hij beslist niets.** Pagina's eerst via het netwerk (anders blijft
    een oude versie hangen), bestanden met hash en modellen uit de cache met verversing op de
    achtergrond. Alleen in productie geregistreerd.

## Open vragen
- Tijdsdruk in hoofdstuk 1: nu 3 schokgolven × 30 s. Te krap of te ruim voor 12-jarigen? Speeltest.
- Blaeu-kaart: pin-posities zijn op het oog geplaatst. Georefereren met controlepunten in M8.
- Nachtvaart: lawaai per slag (0,17) en alarmgrens (0,72) zijn op de bot afgesteld, niet op mensen.
- Nachtvaart: camera kijkt steil omlaag; een iets lagere hoek toont meer sfeer maar minder overzicht.
- Krant in productie: achterhouden (nu) of het hoofdstuk pas vrijgeven als alles geverifieerd is?

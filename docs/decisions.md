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

## Open vragen
- Tijdsdruk in hoofdstuk 1: nu 3 schokgolven × 30 s. Te krap of te ruim voor 12-jarigen? Speeltest.
- Blaeu-kaart: pin-posities zijn op het oog geplaatst. Georefereren met controlepunten in M8.
- Krant in productie: achterhouden (nu) of het hoofdstuk pas vrijgeven als alles geverifieerd is?

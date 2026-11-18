/**
 * The real photographs of the game. Every one has a licence we checked on the source page (Nov 2026)
 * and is shown with its credit. Not here: anything whose rights lie with an archive that has not
 * answered yet (Streekarchief Midden-Holland, Die Goude); those slots keep their placeholder.
 *
 * The files are made by `npm run archive` (downloads the originals from Wikimedia Commons, scales
 * them to 960 px and writes webp under 250 KB to `public/img/archive/`).
 */
import type { ArchiveImage } from "./chapters";
import present from "./archive-files.json";

const COMMONS = "https://commons.wikimedia.org/wiki/File:";

export const ARCHIVE = {
  stadhuisTrap: {
    file: "stadhuis-trap.webp",
    alt: "De trap en de hoofdingang van het stadhuis op de Markt in Gouda, september 1940.",
    credit: "Foto: Wiel van der Randen, Spaarnestad Photo (SFA004001294), via Wikimedia Commons",
    licence: "Publiek domein",
    source: `${COMMONS}De_trap_van_het_raadhuis_of_stadhuis_op_de_Markt_te_Gouda,_Nederland_september_1940,_SFA004001294.jpg`,
  },
  stadhuisWerkkamer: {
    file: "stadhuis-werkkamer.webp",
    alt: "De werkkamer van de burgemeester op het stadhuis van Gouda, 1940: een bewerkt bureau en een stoel, een kroonluchter en een schilderij boven de schoorsteenmantel.",
    credit: "Foto: Wiel van der Randen, Spaarnestad Photo (SFA004001297), via Wikimedia Commons",
    licence: "Publiek domein",
    source: `${COMMONS}De_werkkamer_van_de_burgemeester_op_het_stadhuis,_Markt_te_Gouda,_Nederland_1940,_SFA004001297.jpg`,
  },
  glazenUitgenomen: {
    file: "sint-jan-glazen.webp",
    alt: "Werklui nemen de gebrandschilderde glazen uit de Sint-Janskerk, aan het begin van de oorlog.",
    credit: "Foto: onbekend, Rijksdienst voor het Cultureel Erfgoed (20326661), CC BY-SA 4.0",
    licence: "CC BY-SA 4.0",
    source: `${COMMONS}Uitneming_glazen_-_Gouda_-_20326661_-_RCE.jpg`,
  },
  synagoge: {
    file: "synagoge-turfmarkt.webp",
    alt: "De Turfmarkt in Gouda met de voormalige synagoge, nu het kerkgebouw van de Vrije Evangelische Gemeente.",
    credit: "Foto: Gouwenaar, 2009, Wikimedia Commons (publiek domein)",
    licence: "Publiek domein",
    source: `${COMMONS}Turfmarkt_Gouda_met_voormalige_synagoge.jpg`,
  },
  plaquette: {
    file: "synagoge-plaquette.webp",
    alt: "De plaquette van Ralph Prins op de deur van de voormalige synagoge: uit het wapen van Gouda is de zesde ster gevallen.",
    credit: "Foto: Gouwenaar, 2010, Wikimedia Commons (publiek domein). Plaquette: Ralph Prins, 1997",
    licence: "Publiek domein",
    source: `${COMMONS}Plaquette_door_Ralph_Prins_op_de_deur_voormalige_synagoge_Gouda.jpg`,
  },
} as const satisfies Record<string, ArchiveImage>;

/**
 * The photograph if its file exists (written to `archive-files.json` by `npm run archive`), else
 * undefined: a slot without a file keeps its placeholder, which players never see.
 */
export const shown = (img: ArchiveImage): ArchiveImage | undefined => ((present as string[]).includes(img.file) ? img : undefined);

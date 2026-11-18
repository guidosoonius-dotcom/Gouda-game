/* eslint-disable */
// npm run archive: fetches the originals of the licensed archive photographs from Wikimedia Commons
// (assets/archive/, not committed) and writes webp files under 250 KB to public/img/archive/.
// Originals you saved by hand into assets/archive/<name>.jpg are used as they are.
// The list below must match src/data/archive.ts (file names) and its sources.
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const ORIGINALS = path.join(__dirname, "..", "assets", "archive");
const OUT = path.join(__dirname, "..", "public", "img", "archive");
const MAX_BYTES = 245 * 1024;
const WIDTH = 960;
// Wikimedia asks automated clients for a descriptive User-Agent, and limits the rate.
const UA = "KoerierAanDeGouwe/0.1 (educational non-commercial game; reuses Commons files with attribution)";

const FILES = {
  "stadhuis-trap": "De_trap_van_het_raadhuis_of_stadhuis_op_de_Markt_te_Gouda,_Nederland_september_1940,_SFA004001294.jpg",
  "stadhuis-werkkamer": "De_werkkamer_van_de_burgemeester_op_het_stadhuis,_Markt_te_Gouda,_Nederland_1940,_SFA004001297.jpg",
  "sint-jan-glazen": "Uitneming_glazen_-_Gouda_-_20326661_-_RCE.jpg",
  "synagoge-turfmarkt": "Turfmarkt_Gouda_met_voormalige_synagoge.jpg",
  "synagoge-plaquette": "Plaquette_door_Ralph_Prins_op_de_deur_voormalige_synagoge_Gouda.jpg",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function download(name, file) {
  const dest = path.join(ORIGINALS, `${name}.jpg`);
  if (fs.existsSync(dest)) return true;
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    let res;
    try {
      res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
    } catch (e) {
      console.log(`  ${name}: ${e.cause?.code || e.message} (behind a proxy? run with NODE_USE_ENV_PROXY=1)`);
      return false;
    }
    if (res.ok && (res.headers.get("content-type") || "").startsWith("image/")) {
      fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
      console.log(`  downloaded ${name} (${Math.round(fs.statSync(dest).size / 1024)} KB)`);
      return true;
    }
    const wait = Number(res.headers.get("retry-after")) * 1000 || attempt * 15000;
    console.log(`  ${name}: HTTP ${res.status}, waiting ${Math.round(wait / 1000)} s (try ${attempt}/4)`);
    await sleep(wait);
  }
  return false;
}

async function convert(name) {
  const src = path.join(ORIGINALS, `${name}.jpg`);
  const out = path.join(OUT, `${name}.webp`);
  for (let q = 82; q >= 40; q -= 6) {
    const buf = await sharp(src).rotate().resize({ width: WIDTH, withoutEnlargement: true }).webp({ quality: q, effort: 5 }).toBuffer();
    if (buf.length <= MAX_BYTES || q <= 40) {
      fs.writeFileSync(out, buf);
      console.log(`  ${name}.webp  q${q}  ${Math.round(buf.length / 1024)} KB`);
      return;
    }
  }
}

(async () => {
  fs.mkdirSync(ORIGINALS, { recursive: true });
  fs.mkdirSync(OUT, { recursive: true });
  const missing = [];
  for (const [name, file] of Object.entries(FILES)) {
    if (!(await download(name, file))) missing.push(name);
    await sleep(3000);
  }
  for (const name of Object.keys(FILES)) if (fs.existsSync(path.join(ORIGINALS, `${name}.jpg`))) await convert(name);
  if (missing.length) {
    console.log(`\nNot downloaded: ${missing.join(", ")}.\nSave the original from Commons as assets/archive/<name>.jpg and run again (see assets/archive/README.md).`);
    process.exitCode = 1;
  }
})();

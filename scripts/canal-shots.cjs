/* eslint-disable */
// Dev tool: plays a few seconds of the Nachtvaart prototype and saves screenshots.
//   BASE_URL=http://localhost:3000 node scripts/canal-shots.cjs
const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require("playwright");

const OUT = path.join(__dirname, "..", "test-results");
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  const base = process.env.BASE_URL || "http://localhost:3000";
  const open = async (query) => {
    // dev-only shortcuts: ?canal=1 opens the crossing, ?z= starts further down the canal
    await page.goto(`${base}/?canal=1${query}`);
    await page.getByRole("button", { name: /Afvaren/i }).waitFor({ timeout: 30000 });
    await page.waitForTimeout(2500);
  };
  await open("");
  await page.screenshot({ path: path.join(OUT, "11-nachtvaart-intro.png") });
  await page.getByRole("button", { name: /Afvaren/i }).click();
  const row = async (keys, gap) => {
    for (const k of keys) {
      await page.keyboard.press(k === "L" ? "ArrowLeft" : "ArrowRight");
      await page.waitForTimeout(gap);
    }
  };
  await row("LRLR", 500);
  await page.screenshot({ path: path.join(OUT, "12-nachtvaart-start.png") });
  await row("LRLRLLRLR", 650);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, "13-nachtvaart-riet.png") });
  await row("RLRLRLRLRLRLRL", 420);
  await page.screenshot({ path: path.join(OUT, "14-nachtvaart-licht.png") });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(OUT, "15-nachtvaart-later.png") });
  // Later stretches, using the dev-only ?z= start offset.
  for (const [z, name, keys] of [[-58, "16-nachtvaart-brug", "LRLR"], [-124, "17-nachtvaart-sluis", "LRLRL"]]) {
    await open(`&z=${z}`);
    await page.getByRole("button", { name: /Afvaren/i }).click();
    await page.waitForTimeout(1500);
    await row(keys, 520);
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  }
  console.log(errors.length ? "ERRORS:\n" + errors.join("\n") : "canal shots ok");
  await browser.close();
})();

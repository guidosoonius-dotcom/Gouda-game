/* eslint-disable */
// Dev tool: screenshots of "Over de daken". BASE_URL=http://localhost:3000 node scripts/roof-shots.cjs
const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require("playwright");

const OUT = path.join(__dirname, "..", "test-results");
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 400)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 400)));
  const base = process.env.BASE_URL || "http://localhost:3000";
  // dev-only shortcuts: ?roof=1 opens the run, ?cover= starts further along
  const open = async (query) => {
    await page.goto(`${base}/?roof=1${query}`);
    await page.getByRole("button", { name: /Het dak op/i }).waitFor({ timeout: 40000 });
    await page.waitForTimeout(2500);
  };
  await open("");
  await page.screenshot({ path: path.join(OUT, "30-daken-intro.png") });
  await page.getByRole("button", { name: /Het dak op/i }).click();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: path.join(OUT, "31-daken-start.png") });
  await page.keyboard.press("Space");
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, "32-daken-rennen.png") });
  await page.waitForTimeout(1800);
  await page.keyboard.press("Space");
  await page.waitForTimeout(500);
  await page.keyboard.down("Space");
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, "33-daken-plat.png") });
  await page.keyboard.up("Space");
  await open("&cover=8");
  await page.getByRole("button", { name: /Het dak op/i }).click();
  await page.waitForTimeout(2200);
  await page.screenshot({ path: path.join(OUT, "34-daken-verder.png") });
  console.log(errors.length ? "ERRORS:\n" + errors.join("\n") : "roof shots ok");
  await browser.close();
})();

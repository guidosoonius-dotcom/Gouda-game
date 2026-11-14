/* eslint-disable */
// Dev tool: screenshots of "Vluchtspoor". BASE_URL=http://localhost:3000 node scripts/bike-shots.cjs
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
  // dev-only shortcuts: ?bike=1 opens the run, ?z= starts further down the street
  const open = async (query) => {
    await page.goto(`${base}/?bike=1${query}`);
    await page.getByRole("button", { name: /Op de fiets/i }).waitFor({ timeout: 40000 });
    await page.waitForTimeout(2500);
    await page.getByRole("button", { name: /Op de fiets/i }).click();
  };
  await open("");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, "50-fiets-start.png") });
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(700);
  await page.keyboard.up("ArrowRight");
  await page.keyboard.down("ArrowLeft");
  await page.waitForTimeout(1500);
  await page.keyboard.up("ArrowLeft");
  await page.keyboard.press("Space");
  await page.waitForTimeout(2600);
  await page.screenshot({ path: path.join(OUT, "51-fiets-volgers.png") });
  await page.waitForTimeout(3500);
  await page.screenshot({ path: path.join(OUT, "52-fiets-inslag.png") });
  await open("&z=-66");
  await page.getByText("Waar ga jij").waitFor({ timeout: 120000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, "53-fiets-dilemma.png") });
  await page.getByRole("button", { name: /Ik help de man zoeken/i }).click();
  await page.waitForTimeout(25000);
  await page.screenshot({ path: path.join(OUT, "54-fiets-zoeken.png") });
  console.log(errors.length ? "ERRORS:\n" + errors.join("\n") : "bike shots ok");
  await browser.close();
})();

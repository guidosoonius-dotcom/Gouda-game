/* eslint-disable */
// Dev tool: close-ups of the people in the three minigames (crops of 390x844 screenshots).
//   BASE_URL=http://localhost:3000 node scripts/figure-shots.cjs
const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require("playwright");

const OUT = path.join(__dirname, "..", "test-results");
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 300)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 300)));
  const base = process.env.BASE_URL || "http://localhost:3000";
  const stats = () => page.evaluate(() => { const i = window.__gl?.info.render; return i ? `${i.calls} calls, ${i.triangles} tris` : "?"; });
  const open = async (query, button) => {
    await page.goto(`${base}/?${query}`);
    await page.getByRole("button", { name: button }).waitFor({ timeout: 60000 });
    await page.getByRole("button", { name: button }).click();
    await page.waitForTimeout(3500);
  };
  const shot = async (name, clip) => {
    await page.screenshot({ path: path.join(OUT, `${name}.png`), clip, timeout: 90000 });
    console.log(name, await stats());
  };
  const only = process.env.ONLY || "";
  if (!only || only === "roof") {
    await open("roof=1", /Het dak op/i);
    await shot("50-figuur-hurkt", { x: 60, y: 380, width: 220, height: 220 });
    await page.keyboard.press("Space");
    await page.waitForTimeout(700);
    await shot("51-figuur-rent", { x: 60, y: 330, width: 260, height: 260 });
    await shot("52-figuur-wacht", { x: 100, y: 180, width: 180, height: 120 });
  }
  if (!only || only === "canal") {
    await open("canal=1", /Afvaren/i);
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(350);
    await shot("53-figuur-roeit", { x: 95, y: 420, width: 200, height: 200 });
    await open("canal=1&z=-52", /Afvaren/i);
    await shot("54-figuur-brug", { x: 60, y: 60, width: 130, height: 110 });
  }
  if (!only || only === "bike") {
    await open("bike=1", /Op de fiets/i);
    await shot("55-figuur-fietst", { x: 95, y: 520, width: 200, height: 200 });
    await shot("56-figuur-straat", { x: 0, y: 330, width: 390, height: 260 });
  }
  if (!only || only === "rider") {
    await open("bike=1&cam=side", /Op de fiets/i);
    await page.keyboard.down("ArrowUp");
    await shot("57-figuur-zijkant", { x: 0, y: 250, width: 390, height: 390 });
  }
  if (errors.length) console.log("errors:", errors.slice(0, 6));
  await browser.close();
})();

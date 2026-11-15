/* eslint-disable */
// Dev tool: two fixed shots each of Nachtvaart and Over de daken, plus draw calls and triangles.
//   BASE_URL=http://localhost:3000 node scripts/night-shots.cjs
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
  const shots = [
    ["canal", "", /Afvaren/i, "40-nacht-kanaal"],
    ["canal", "&z=-60", /Afvaren/i, "41-nacht-brug"],
    ["roof", "", /Het dak op/i, "42-nacht-daken"],
    ["roof", "&cover=8", /Het dak op/i, "43-nacht-toren"],
  ];
  if (process.env.ONLY) shots.splice(0, shots.length, ...shots.filter((s) => s[3].includes(process.env.ONLY)));
  for (const [scene, q, btn, name] of shots) {
    await page.goto(`${base}/?${scene}=1${q}`);
    await page.getByRole("button", { name: btn }).waitFor({ timeout: 60000 });
    await page.getByRole("button", { name: btn }).click();
    await page.waitForTimeout(4000);
    await page.screenshot({ path: path.join(OUT, `${name}.png`) });
    console.log(name, await stats());
  }
  if (errors.length) console.log("errors:", errors.slice(0, 5));
  await browser.close();
})();

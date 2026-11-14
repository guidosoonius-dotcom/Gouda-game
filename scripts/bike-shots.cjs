/* eslint-disable */
// Dev tool: screenshots of "Vluchtspoor" from fixed spots in the street, plus a frame-rate probe.
//   BASE_URL=http://localhost:3000 node scripts/bike-shots.cjs
// Note: headless Chromium renders in software here, so the frame rate is far below a phone's.
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
  const open = async (z) => {
    await page.goto(`${base}/?bike=1${z ? `&z=${z}` : ""}`);
    await page.getByRole("button", { name: /Op de fiets/i }).waitFor({ timeout: 60000 });
    await page.waitForTimeout(1500);
    await page.getByRole("button", { name: /Op de fiets/i }).click();
  };
  const spots = [[0, "50-fiets-start", 9000], [-30, "51-fiets-30", 7000], [-50, "52-fiets-62", 7000], [-100, "53-fiets-100", 4000], [-124, "54-fiets-124", 4000]];
  for (const [z, name, wait] of spots) {
    await open(z);
    if (z === -30) {
      await page.keyboard.press("Space");
    }
    await page.waitForTimeout(wait);
    await page.screenshot({ path: path.join(OUT, `${name}.png`) });
    if (z === 0) {
      const fps = await page.evaluate(() => new Promise((res) => { let n = 0; const t0 = performance.now(); const f = () => { n++; performance.now() - t0 < 4000 ? requestAnimationFrame(f) : res(n / 4); }; requestAnimationFrame(f); }));
      console.log(`software-rendered frame rate here: ${fps.toFixed(1)} fps`);
      const info = await page.evaluate(() => { const i = window.__gl.info; return { calls: i.render.calls, triangles: i.render.triangles, geometries: i.memory.geometries, textures: i.memory.textures }; });
      console.log(`per frame: ${info.calls} draw calls, ${(info.triangles / 1000).toFixed(0)}k triangles; ${info.geometries} geometries, ${info.textures} textures in memory`);
    }
  }
  console.log(errors.length ? "ERRORS:\n" + errors.join("\n") : "bike shots ok");
  await browser.close();
})();

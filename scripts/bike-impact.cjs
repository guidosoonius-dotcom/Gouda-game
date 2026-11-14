/* eslint-disable */
// Dev tool: one impact and one aircraft in the bicycle street. Slow: software rendering is ~1 fps.
const path = require("node:path");
const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 400)));
  const base = process.env.BASE_URL || "http://localhost:3000";
  await page.goto(`${base}/?bike=1&bomb=1&plane=1&z=-20`);
  await page.getByRole("button", { name: /Op de fiets/i }).click({ timeout: 90000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: path.join(__dirname, "..", "test-results", "60-waarschuwing.png") });
  // the whistle lasts 2.6 s of game time; at ~1 fps that is about a minute of waiting
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(12000);
    await page.screenshot({ path: path.join(__dirname, "..", "test-results", `61-inslag-${i}.png`) });
  }
  console.log(errors.length ? "ERRORS:\n" + errors.join("\n") : "impact shots ok");
  await browser.close();
})();

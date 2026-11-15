/* eslint-disable */
// Dev tool: checks location mode with a faked GPS (needs a build: `npm run build`), plus the PWA files.
//   node scripts/location-check.cjs
const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require("playwright");

const PORT = 3113;
const OUT = path.join(__dirname, "..", "test-results");
const M = 1 / 111000; // degrees of latitude per metre
const CH1 = { lat: 52.0106, lng: 4.7105 };

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const server = spawn(process.execPath, [path.join(__dirname, "..", "node_modules", "next", "dist", "bin", "next"), "start", "-p", String(PORT)], { cwd: path.join(__dirname, ".."), stdio: "ignore" });
  const base = `http://localhost:${PORT}`;
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(base)).ok) break; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  const fail = (m) => { console.log("FAIL:", m); process.exitCode = 1; };
  try {
    const manifest = await (await fetch(`${base}/manifest.webmanifest`)).json();
    console.log("manifest:", manifest.name, manifest.display, manifest.icons.length, "icons");
    for (const i of manifest.icons) if (!(await fetch(base + i.src)).ok) fail("icon " + i.src);
    const sw = await fetch(`${base}/sw.js`);
    if (!sw.ok) fail("sw.js");

    const browser = await chromium.launch();
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, permissions: ["geolocation"], geolocation: { latitude: CH1.lat + 1400 * M, longitude: CH1.lng, accuracy: 10 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
    await page.goto(base);
    await page.getByRole("button", { name: /Speel op locatie/i }).click();
    await page.getByText("Kaart 01").waitFor({ timeout: 20000 });
    await page.getByRole("button", { name: /^meet$/i }).click();
    await page.getByText(/Nog .* lopen/i).waitFor({ timeout: 10000 }).catch(() => fail("far: no 'Nog … lopen'"));
    console.log("far     :", (await page.getByText(/Nog .* lopen/i).first().textContent().catch(() => "?")));
    console.log("fallback:", await page.getByRole("button", { name: /zonder gps/i }).count(), "button(s)");
    await page.screenshot({ path: path.join(OUT, "60-locatie-ver.png") });
    await ctx.setGeolocation({ latitude: CH1.lat + 8 * M, longitude: CH1.lng, accuracy: 8 });
    await page.getByRole("button", { name: /Je bent er/i }).waitFor({ timeout: 10000 }).catch(() => fail("near: no 'Je bent er'"));
    console.log("near    : 'Je bent er' shown");
    await page.getByRole("button", { name: /Je bent er/i }).click();
    await page.waitForTimeout(1200);
    // walk north at 1.5 m/s
    let lat = CH1.lat + 8 * M;
    for (let i = 0; i < 14; i++) { lat += 1.5 * M; await ctx.setGeolocation({ latitude: lat, longitude: CH1.lng, accuracy: 6 }); await page.waitForTimeout(1000); }
    const blocked = await page.getByRole("alertdialog").count();
    console.log("walking : overlay", blocked ? "shown" : "MISSING");
    if (!blocked) fail("walking guard did not show");
    await page.screenshot({ path: path.join(OUT, "61-locatie-lopen.png") });
    // stand still: the same position again (no new fixes) lifts it after a few seconds
    await page.waitForTimeout(9000);
    const after = await page.getByRole("alertdialog").count();
    console.log("standing: overlay", after ? "STILL THERE" : "gone");
    if (after) fail("guard not lifted when standing still");
    // home mode: no guard
    const sw2 = await page.evaluate(async () => { const r = await navigator.serviceWorker?.getRegistration(); return r ? (r.active || r.installing || r.waiting)?.state || "registered" : "none"; });
    console.log("service worker:", sw2);
    if (sw2 === "none") fail("service worker not registered");
    if (errors.length) console.log("errors:", errors);
    await browser.close();
  } finally {
    server.kill();
  }
  if (!process.exitCode) console.log("LOCATION OK");
})();

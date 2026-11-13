/* eslint-disable */
// End-to-end walk through chapter 1 at iPhone size. Usage:
//   npm run build && npm run test:e2e            (starts `next start` itself)
//   BASE_URL=http://localhost:3000 npm run test:e2e   (against a running dev server)
// Screenshots land in test-results/. Exits non-zero on the first failed expectation.
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const OUT = path.join(__dirname, "..", "test-results");
const PORT = 3111;
const SOLUTIONS = {
  27: { a: [0, 0, 0, 2, 3], b: [2, 0, 0, 2, 2], c: [2, 2, 1, 1, 2], d: [0, 3, 1, 1, 3], e: [3, 3, 0, 1, 1] },
  28: { a: [0, 0, 0, 2, 3], b: [2, 0, 1, 2, 3], c: [2, 2, 0, 2, 2], d: [4, 2, 0, 1, 3], e: [0, 3, 1, 1, 2], f: [0, 4, 1, 1, 3], g: [3, 4, 0, 1, 1] },
};

async function waitForServer(url) {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("server did not start");
}

async function packCrate(page, crateNo) {
  await page.waitForSelector(`[data-crate="${crateNo}"]`);
  await page.waitForTimeout(600);
  for (const [id, [col, row, rot, w, h]] of Object.entries(SOLUTIONS[crateNo])) {
    const tray = page.locator(`[data-piece="${id}"]`);
    if (Number(await tray.getAttribute("data-rot")) !== rot) {
      await tray.click();
      await page.waitForTimeout(120);
    }
    const from = await tray.boundingBox();
    const crate = page.locator(`[data-crate="${crateNo}"]`);
    const box = await crate.boundingBox();
    const cell = Number(await crate.getAttribute("data-cell"));
    const cw = rot ? h : w;
    const chh = rot ? w : h;
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + (col + cw / 2) * cell, box.y + (row + chh / 2) * cell, { steps: 8 });
    await page.waitForTimeout(60);
    if (process.env.SHOT_DRAG === `${crateNo}${id}`) await page.screenshot({ path: path.join(OUT, "04b-slepen.png") });
    await page.mouse.up();
    await page.waitForTimeout(140);
  }
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  let server;
  let base = process.env.BASE_URL;
  if (!base) {
    server = spawn("npx", ["next", "start", "-p", String(PORT)], { cwd: path.join(__dirname, ".."), stdio: "ignore" });
    base = `http://localhost:${PORT}`;
  }
  const browser = await chromium.launch();
  let failed = false;
  try {
    await waitForServer(base);
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    const shot = (name) => page.screenshot({ path: path.join(OUT, `${name}.png`) });
    const expectText = async (text) => {
      await page.getByText(text, { exact: false }).first().waitFor({ timeout: 15000 });
    };

    await page.goto(base);
    await expectText("aan de Gouwe");
    await page.waitForTimeout(1500);
    await shot("01-titel");

    await page.getByRole("button", { name: /Speel thuis/i }).click();
    await expectText("De Kisten van Sint-Jan");
    await page.waitForTimeout(2200);
    await shot("02-kaart");

    await page.getByRole("button", { name: /Open het dossier/i }).click();
    await expectText("Dossier 01");
    await page.waitForTimeout(5200);
    await shot("03a-dossier-scene");
    await page.getByRole("button", { name: /Verder/i }).click();
    await expectText("Dezelfde plek");
    await page.waitForTimeout(700);
    await shot("03b-toen-en-nu");
    await page.getByRole("button", { name: /Verder/i }).click();
    await expectText("Pak de laatste panelen in");
    await page.waitForTimeout(700);
    await shot("03c-opdracht");
    await page.getByRole("button", { name: /Aan het werk/i }).click();

    await page.waitForSelector('[data-crate="27"]');
    await page.waitForTimeout(900);
    await shot("04a-inpakken");
    await packCrate(page, 27);
    await page.waitForTimeout(900);
    await shot("04c-deksel");
    await packCrate(page, 28);
    await page.getByRole("button", { name: /De kisten zijn dicht/i }).waitFor({ timeout: 8000 });
    await shot("04d-klaar");
    await page.getByRole("button", { name: /De kisten zijn dicht/i }).click();

    await expectText("Geef je hem");
    await page.waitForTimeout(7000);
    await shot("05-dilemma");
    await page.getByRole("button", { name: /Bewaar het voor de glazen/i }).click();
    await expectText("De Koerier");
    await expectText("FICTIE");
    await page.waitForTimeout(2600);
    await shot("06-krant");
    await page.getByRole("button", { name: /Volgend adres/i }).click();

    await expectText("Drukinkt in het Donker");
    await page.waitForTimeout(2200);
    await shot("07-kaart-na-hoofdstuk-1");
    await page.getByRole("button", { name: /Koerierstas/i }).click();
    await expectText("Herstelcode");
    await page.waitForTimeout(600);
    await shot("08-koerierstas");

    if (errors.length) {
      failed = true;
      console.error("Console errors:\n" + errors.join("\n"));
    }
    console.log(failed ? "E2E FAILED" : "E2E OK: hoofdstuk 1 doorlopen, screenshots in test-results/");
  } catch (e) {
    failed = true;
    console.error("E2E FAILED:", e.message);
    try {
      const pages = browser.contexts()[0]?.pages() ?? [];
      if (pages[0]) await pages[0].screenshot({ path: path.join(OUT, "FAILED.png") });
    } catch {}
  } finally {
    await browser.close();
    if (server) server.kill();
    process.exit(failed ? 1 : 0);
  }
})();

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ARCHIVE } from "@/data/archive";
import present from "@/data/archive-files.json";
import { PLACES } from "@/data/places";
import type { Chapter } from "@/data/chapters";

const DIR = path.join(__dirname, "..", "public", "img", "archive");

/** Every archive slot of the game: then/now pairs, mirror scans and memorial photos. */
function slots(c: Chapter) {
  const out = [];
  for (const p of c.pages) if (p.kind === "then-now") out.push(p.then, p.now);
  if (c.mirror) out.push(c.mirror.scan);
  if (c.memorial) out.push(c.memorial.photo);
  return out;
}

describe("archive photographs", () => {
  it("every photograph has its rights on record: credit, licence, a source page and a description", () => {
    for (const [name, img] of Object.entries(ARCHIVE)) {
      expect(img.credit.length, name).toBeGreaterThan(10);
      expect(img.alt.length, name).toBeGreaterThan(20);
      expect(img.source, name).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      expect(["Publiek domein", "CC BY-SA 4.0"], name).toContain(img.licence);
      // a share-alike licence needs the licence named in the credit
      if (img.licence === "CC BY-SA 4.0") expect(img.credit, name).toContain("CC BY-SA 4.0");
      expect(img.file, name).toMatch(/^[a-z0-9-]+\.webp$/);
    }
  });

  it("every photograph is wired to a slot, and a listed file exists", () => {
    const data = ["chapters.ts", "sides.ts"].map((f) => fs.readFileSync(path.join(__dirname, "..", "src", "data", f), "utf8")).join("\n");
    for (const key of Object.keys(ARCHIVE)) expect(data, key).toContain(`shown(ARCHIVE.${key})`);
    for (const f of present as string[]) expect(fs.existsSync(path.join(DIR, f)), `${f} is listed but missing`).toBe(true);
    const used = PLACES.flatMap(slots).flatMap((s) => (s.image ? [s.image.file] : []));
    expect(new Set(used).size).toBe(used.length);
  });

  it("the files that exist are small enough for a phone (250 KB) and have a record", () => {
    if (!fs.existsSync(DIR)) return;
    const known = new Set<string>(Object.values(ARCHIVE).map((i) => i.file));
    for (const f of fs.readdirSync(DIR).filter((f) => f.endsWith(".webp"))) {
      expect(known.has(f), `${f} has no record in data/archive.ts`).toBe(true);
      expect(fs.statSync(path.join(DIR, f)).size, f).toBeLessThanOrEqual(250 * 1024);
    }
  });

  it("slots that show a photograph describe what is in it, not what we still want", () => {
    for (const s of PLACES.flatMap(slots).filter((s) => s.image)) {
      expect(s.label, s.label).not.toMatch(/^SCAN|zandzakken/);
    }
  });
});

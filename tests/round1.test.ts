import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { CHAPTERS } from "@/data/chapters";
import { SIDES } from "@/data/sides";
import { dossierPages, isFinished } from "@/data/places";
import { isFrozen, setPaused } from "@/lib/pause";
import { useGameStore } from "@/store/useGameStore";

describe("dossier: no placeholders for players", () => {
  it("at home a then/now page shows only with a real archive photograph", () => {
    for (const c of [...CHAPTERS, ...SIDES]) {
      for (const p of dossierPages(c, "home")) if (p.kind === "then-now") expect(p.then.image, c.title).toBeDefined();
    }
    // chapter 1 has no photograph of the bare choir yet: its then/now page is left out at home
    const ch1 = CHAPTERS[0];
    expect(dossierPages(ch1, "home").length).toBe(ch1.pages.length - 1);
  });

  it("on location it also shows for a finished instruction, never for one still [to be decided]", () => {
    expect(isFinished("Zoek het jaartal boven de poort.")).toBe(true);
    expect(isFinished("Zoek het anker [te bepalen bij veldbezoek].")).toBe(false);
    for (const c of [...CHAPTERS, ...SIDES]) {
      for (const p of dossierPages(c, "location")) {
        if (p.kind === "then-now" && !p.then.image) expect(isFinished(p.anchor), c.title).toBe(true);
      }
    }
  });
});

describe("back button", () => {
  beforeEach(() => useGameStore.setState({ view: "map", page: 0, chapter: 1, completed: [], rereading: false, mode: "home" }));

  it("steps back one page, then to the map, then to the title", () => {
    const s = useGameStore.getState();
    useGameStore.setState({ view: "dossier", page: 2 });
    s.back();
    expect(useGameStore.getState()).toMatchObject({ view: "dossier", page: 1 });
    useGameStore.setState({ page: 0 });
    s.back();
    expect(useGameStore.getState().view).toBe("map");
    s.back();
    expect(useGameStore.getState().view).toBe("title");
  });

  it("from the newspaper it counts the chapter as read, as the button does", () => {
    useGameStore.setState({ view: "mirror", chapter: 2 });
    useGameStore.getState().back();
    expect(useGameStore.getState()).toMatchObject({ view: "map", completed: [2] });
  });
});

describe("pause", () => {
  it("freezes the game clock", () => {
    setPaused(true);
    expect(isFrozen()).toBe(true);
    setPaused(false);
    expect(isFrozen()).toBe(false);
  });
});

describe("text can be scaled", () => {
  const files = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? files(path.join(dir, d.name)) : d.name.endsWith(".tsx") ? [path.join(dir, d.name)] : []));
  const all = files(path.join(__dirname, "..", "src"));

  it("every font size follows the text-size setting, and none is under 11 px", () => {
    for (const f of all) {
      const s = fs.readFileSync(f, "utf8");
      expect(s.match(/\btext-\[\d+(\.\d+)?px\]/g), f).toBeNull();
      for (const m of s.matchAll(/text-\[length:calc\((\d+(?:\.\d+)?)px\*var\(--ts,1\)\)\]/g)) expect(Number(m[1]), f).toBeGreaterThanOrEqual(11);
    }
  });

  it("the page can be zoomed", () => {
    expect(fs.readFileSync(path.join(__dirname, "..", "src", "app", "layout.tsx"), "utf8")).not.toMatch(/maximumScale|userScalable/);
  });
});

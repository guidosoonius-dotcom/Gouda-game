import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { TUNING } from "@/game/tuning";
import { DETAIL_MAPS, MATERIALS, setDetailMaps, SURFACE } from "@/components/canal/materials";
import { KIND } from "@/components/canal/detailShader";

describe("beeldkwaliteit", () => {
  it("has one scale per detail map, and every map is in public/ within the image budget", () => {
    expect(TUNING.gfx.hifi.scale).toHaveLength(DETAIL_MAPS.length);
    for (const url of DETAIL_MAPS) {
      const file = join(process.cwd(), "public", url);
      expect(existsSync(file), url).toBe(true);
      expect(statSync(file).size, url).toBeLessThanOrEqual(250 * 1024);
    }
  });

  it("gives every kit material a known surface family", () => {
    const known = new Set<number>(Object.values(KIND));
    for (const [name, kind] of Object.entries(SURFACE)) expect(known.has(kind), name).toBe(true);
  });

  it("switches the kit to the detail maps and back with one recompile each way", () => {
    const m = MATERIALS.flat;
    const v = m.version;
    const fake = {} as never;
    setDetailMaps(fake);
    expect(m.defines).toHaveProperty("HIFI");
    setDetailMaps(fake);
    expect(m.version).toBe(v + 1);
    setDetailMaps(null);
    expect(m.defines).not.toHaveProperty("HIFI");
    expect(m.version).toBe(v + 2);
  });
});

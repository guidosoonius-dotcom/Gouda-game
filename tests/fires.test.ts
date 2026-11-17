import { describe, expect, it } from "vitest";
import { FIRE_LIGHTS, FIRE_REACH, FIRES } from "@/components/bike/BikeWorld";

describe("fire lights in the burning street", () => {
  it("never more fires within reach of one point than there are lights, so no lit fire loses its light", () => {
    for (let z = 10; z > -170; z -= 0.5) {
      expect(FIRES.filter((f) => Math.abs(f.z - z) < FIRE_REACH).length, `at z=${z}`).toBeLessThanOrEqual(FIRE_LIGHTS);
    }
  });
});

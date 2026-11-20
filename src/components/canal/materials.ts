/**
 * Materials of the kit: a procedural detail shader (brick, tiles, wood, cobbles, window light)
 * and a swaying one for reeds and leaves. Kept out of Kit.tsx so the model helpers stay short.
 */
import * as THREE from "three";
import { TUNING } from "@/game/tuning";
import { fragColor, fragCommon, fragNormal, fragRoughness, fragWindows, KIND } from "./detailShader";

/**
 * Light in the windows: positions (x, z, strength) of up to four fires (chapter 5) and a master
 * switch. At 0 every window is dark; `useWindowGlow` in Kit.tsx lights a few behind the blackout.
 */
export const glow = {
  uFire: { value: [0, 1, 2, 3].map(() => new THREE.Vector3(0, 9999, 0)) },
  uWindowGlow: { value: 0 },
};

/** Shared by every swaying material: one clock, the boat's position, how hard it brushes the reeds. */
export const sway = { uTime: { value: 0 }, uBoat: { value: new THREE.Vector3() }, uRustle: { value: 0 } };

function swayMaterial(strength: number) {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, side: THREE.DoubleSide });
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, sway, { uStrength: { value: strength } });
    // reeds: dark and green at the water, pale straw toward the tips, each stem a little different
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vStemH;\nvarying float vStem;")
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float tip = smoothstep(0.2, 1.6, vStemH);
        diffuseColor.rgb *= mix(vec3(0.42, 0.5, 0.36), vec3(1.05, 0.98, 0.72), tip) * (0.8 + 0.4 * vStem);`,
      );
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uTime;\nuniform vec3 uBoat;\nuniform float uRustle;\nuniform float uStrength;\nvarying float vStemH;\nvarying float vStem;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        #ifdef USE_INSTANCING
          vec3 ipos = instanceMatrix[3].xyz;
        #else
          vec3 ipos = modelMatrix[3].xyz;
        #endif
        float h = max(transformed.y, 0.0);
        float bend = h * h * 0.5;
        float wind = sin(uTime * 1.4 + ipos.x * 0.9 + ipos.z * 0.7) + 0.5 * sin(uTime * 2.3 + ipos.z * 1.3);
        float brush = uRustle * smoothstep(3.2, 0.6, distance(ipos.xz, uBoat.xz)) * sin(uTime * 11.0 + ipos.x * 5.0 + h * 3.0);
        transformed.x += (wind * 0.035 * uStrength + brush * 0.045) * bend;
        transformed.z += cos(uTime * 1.1 + ipos.x) * 0.02 * uStrength * bend;
        vStemH = h;
        vStem = fract(sin(dot(floor(position.xz * 7.0) + ipos.xz, vec2(12.9898, 78.233))) * 43758.5453);`,
      );
  };
  m.customProgramCacheKey = () => `sway-${strength}`;
  return m;
}

/** Height of the crown's centre in the tree model (build_boom.py): leaf cards are lit as one ball. */
const CROWN_Y = 5.3;

/**
 * Leaf cards of the trees: an alpha-cut atlas of autumn lime sprigs (`leaves.webp`, set by
 * `setLeafMap`), normals pointing out of the crown so it shades as one round mass, a slow sway
 * of the whole crown and a flutter of the outer leaves.
 */
function foliageMaterial() {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.78, side: THREE.DoubleSide, alphaTest: 0.5 });
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, sway);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uTime;")
      .replace(
        "#include <beginnormal_vertex>",
        `vec3 objectNormal = normalize(position - vec3(0.0, ${CROWN_Y.toFixed(1)}, 0.0));
        #ifdef USE_TANGENT
          vec3 objectTangent = vec3(tangent.xyz);
        #endif`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        #ifdef USE_INSTANCING
          vec3 ipos = instanceMatrix[3].xyz;
        #else
          vec3 ipos = modelMatrix[3].xyz;
        #endif
        float lift = smoothstep(2.5, 7.5, position.y);
        transformed.x += sin(uTime * 0.7 + ipos.x * 0.3 + ipos.z * 0.2) * 0.12 * lift * lift;
        transformed += objectNormal * sin(uTime * 3.1 + dot(position, vec3(3.1, 2.3, 2.7)) + ipos.x) * 0.035 * lift;`,
      );
    // the same round normal on both faces of a card (not flipped for the back face)
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <normal_fragment_begin>",
      `#include <normal_fragment_begin>
      normal = normalize(vNormal);
      nonPerturbedNormal = normal;`,
    );
  };
  m.customProgramCacheKey = () => "foliage";
  return m;
}

/** Surface families for the procedural detail shader, stored per vertex as `kind`. */
const { brick, roof, wood, stone, window: glass, soot, cobble, plaster, metal, bark } = KIND;
export const SURFACE: Record<string, number> = {
  Brick: brick, BrickDark: brick, Roof: roof, RoofRed: roof, Slate: roof, Wood: wood, WoodDark: wood, WoodWhite: wood,
  Stone: stone, StonePale: stone, Sandstone: stone, Relief: stone, Cobble: cobble, Stucco: plaster, Lead: metal, Bark: bark,
  Glass: glass, WindowDark: glass, Soot: soot,
};

/** The detail maps of "Hoge beeldkwaliteit", in the order of the layers (see detailShader.ts). */
export const DETAIL_MAPS = ["brick", "tiles", "wood", "stone", "cobble", "plaster"].map((n) => `/img/kit/${n}.webp`);
const detail = {
  uDetail: { value: null as THREE.DataArrayTexture | null },
  uScale: { value: TUNING.gfx.hifi.scale },
  uBump: { value: TUNING.gfx.hifi.bump },
  /** Height of the water in a scene with walls standing in it (the canal); far below: none. */
  uWaterLine: { value: -1000 },
};

/** Walls touching water at this height get a wet band and algae; null switches it off. */
export function setWaterLine(y: number | null) {
  detail.uWaterLine.value = y ?? -1000;
}

/**
 * Vertex colours carry the base colour; the shader in detailShader.ts adds what a texture would:
 * brick courses, roof tiles, wood grain, cobbles, weathering and a roughness per material. With
 * `setDetailMaps` it draws them from the detail maps instead, with relief.
 */
function detailMaterial() {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, metalness: 0.02 });
  if (!TUNING.gfx.detail) return m;
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, glow, detail, { uTimeW: sway.uTime });
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float kind;\nvarying float vKind;\nvarying vec3 vWPos;\nvarying vec3 vWNor;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vKind = kind;
        vec4 wp = vec4(transformed, 1.0);
        vec3 wn = objectNormal;
        #ifdef USE_INSTANCING
          wp = instanceMatrix * wp;
          wn = mat3(instanceMatrix) * wn;
        #endif
        vWPos = (modelMatrix * wp).xyz;
        vWNor = normalize(mat3(modelMatrix) * wn);`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${fragCommon}`)
      .replace("#include <color_fragment>", `#include <color_fragment>\n${fragColor}`)
      .replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>\n${fragRoughness}`)
      .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>\n${fragNormal}`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>\n${fragWindows}`);
  };
  return m;
}

export const MATERIALS = {
  flat: detailMaterial(),
  reed: swayMaterial(1),
  leaf: foliageMaterial(),
  lamp: new THREE.MeshStandardMaterial({ color: "#ffd98a", emissive: "#ffd27a", emissiveIntensity: 2.4, toneMapped: false }),
};
export type Kind = keyof typeof MATERIALS;

/**
 * Switches the kit to the detail maps (or back to the drawn patterns, with null). Changing it
 * recompiles the kit material once, so it happens before the warm-up of a minigame.
 */
export function setLeafMap(map: THREE.Texture) {
  MATERIALS.leaf.map = map;
  MATERIALS.leaf.needsUpdate = true;
}

export function setDetailMaps(maps: THREE.DataArrayTexture | null) {
  const m = MATERIALS.flat;
  if (detail.uDetail.value === maps) return;
  detail.uDetail.value = maps;
  m.defines = maps ? { HIFI: "" } : {};
  m.needsUpdate = true;
}
export const kindOf = (name: string): Kind => (name === "Lamp" ? "lamp" : name === "Leaf" ? "leaf" : name.startsWith("Reed") ? "reed" : "flat");

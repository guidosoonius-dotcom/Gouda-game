/**
 * Materials of the kit: a procedural detail shader (brick, tiles, wood, cobbles, window light)
 * and a swaying one for reeds and leaves. Kept out of Kit.tsx so the model helpers stay short.
 */
import * as THREE from "three";
import { TUNING } from "@/game/tuning";

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
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uTime;\nuniform vec3 uBoat;\nuniform float uRustle;\nuniform float uStrength;")
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
        transformed.z += cos(uTime * 1.1 + ipos.x) * 0.02 * uStrength * bend;`,
      );
  };
  m.customProgramCacheKey = () => `sway-${strength}`;
  return m;
}

/** Surface families for the procedural detail shader, stored per vertex as `kind`. */
export const SURFACE: Record<string, number> = {
  Brick: 1, BrickDark: 1, Roof: 2, RoofRed: 2, StonePale: 4, Lead: 4, Wood: 3, WoodDark: 3, WoodWhite: 3, Bark: 3, Stone: 4, Cobble: 4, Sand: 4,
  Glass: 5, WindowDark: 5, Soot: 6,
};

/**
 * Vertex colours carry the base colour; this adds what a texture would: brick courses, roof
 * tiles, wood grain, cobbles and a little weathering, computed from world position so nothing
 * needs UVs or image files. The patterns fade out with distance, so they never shimmer.
 */
function detailMaterial() {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, metalness: 0.02 });
  if (!TUNING.gfx.detail) return m;
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, glow, { uTimeW: sway.uTime });
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
      .replace(
        "#include <common>",
        `#include <common>
        varying float vKind;
        varying vec3 vWPos;
        varying vec3 vWNor;
        uniform vec3 uFire[4];
        uniform float uWindowGlow;
        uniform float uTimeW;
        float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float vnoise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y);
        }`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        {
          vec3 an = abs(vWNor);
          vec2 uv = an.y > 0.6 ? vWPos.xz : (an.x > an.z ? vWPos.zy : vWPos.xy);
          float fade = smoothstep(75.0, 12.0, length(vWPos - cameraPosition));
          float grain = 0.5 * vnoise(uv * 9.0) + 0.5 * vnoise(uv * 2.3);
          float detail = 0.95 + 0.1 * grain;
          if (vKind > 0.5 && vKind < 1.5) {
            vec2 b = uv / vec2(0.44, 0.15);
            b.x += 0.5 * mod(floor(b.y), 2.0);
            vec2 f = fract(b);
            float face = smoothstep(0.0, 0.07, f.x) * smoothstep(0.0, 0.16, f.y);
            detail = mix(0.6, 0.8 + 0.4 * h21(floor(b)), face);
          } else if (vKind > 1.5 && vKind < 2.5) {
            vec2 t = uv / vec2(0.3, 0.36);
            t.x += 0.5 * mod(floor(t.y), 2.0);
            vec2 f = fract(t);
            detail = (0.78 + 0.34 * h21(floor(t))) * (0.7 + 0.3 * smoothstep(0.0, 0.55, f.y)) * (0.86 + 0.14 * smoothstep(0.0, 0.12, f.x));
          } else if (vKind > 2.5 && vKind < 3.5) {
            detail = 0.8 + 0.2 * vnoise(uv * vec2(3.0, 34.0)) + 0.2 * vnoise(uv * vec2(34.0, 3.0));
          } else if (vKind > 3.5 && vKind < 4.5) {
            vec2 c = uv * 3.1;
            vec2 f = abs(fract(c) - 0.5);
            detail = mix(0.58, 0.8 + 0.38 * h21(floor(c)), smoothstep(0.5, 0.38, max(f.x, f.y)));
          }
          detail *= 0.92 + 0.16 * grain;
          if (vKind > 5.5) detail *= 0.7 + 0.3 * grain;
          diffuseColor.rgb *= mix(1.0, detail, fade);
        }`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        if (uWindowGlow > 0.0 && vKind > 4.5 && vKind < 5.5) {
          // Each window is its own cell: some hold a dim lamp behind the blackout curtain, all
          // pick up the orange of nearby fires, flickering.
          // x + z: works for streets along Z (chapters 4, 5) and the row of houses along X (chapter 2).
          vec2 wc = vec2(floor((vWPos.x + vWPos.z) / 1.7), floor(vWPos.y / 2.7));
          float hw = h21(wc);
          float fire = 0.0;
          for (int i = 0; i < 4; i++) {
            float d = distance(vWPos.xz, uFire[i].xy);
            fire += uFire[i].z / (1.0 + d * d * 0.03);
          }
          float flick = 0.75 + 0.25 * sin(uTimeW * (6.0 + 5.0 * hw) + hw * 40.0);
          totalEmissiveRadiance += vec3(1.0, 0.44, 0.14) * fire * flick * 0.6 * (0.3 + 0.7 * hw) * uWindowGlow;
          totalEmissiveRadiance += vec3(1.0, 0.68, 0.34) * step(0.86, hw) * 0.55 * flick * uWindowGlow;
        }`,
      );
  };
  return m;
}

export const MATERIALS = {
  flat: detailMaterial(),
  reed: swayMaterial(1),
  leaf: swayMaterial(0.07),
  lamp: new THREE.MeshStandardMaterial({ color: "#ffd98a", emissive: "#ffd27a", emissiveIntensity: 2.4, toneMapped: false }),
};
export type Kind = keyof typeof MATERIALS;
export const kindOf = (name: string): Kind => (name === "Lamp" ? "lamp" : name === "Leaf" ? "leaf" : name.startsWith("Reed") ? "reed" : "flat");

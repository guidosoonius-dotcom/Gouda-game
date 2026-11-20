"use client";

import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { TUNING } from "@/game/tuning";
import { useGameStore } from "@/store/useGameStore";
import { glow, sway } from "./materials";

/**
 * Wet clinkers: the generated cobble texture with puddles that mirror the sky and the fires. With
 * "Hoge beeldkwaliteit" the stones get relief from the same image, water stays in the joints
 * (dark there means low and shiny) and the puddles gather in them.
 */
export function useWetStreet(repeatY: number, width: number, tint: string) {
  const { gl } = useThree();
  const hifi = useGameStore((s) => s.settings.hifi);
  const map = useTexture("/img/bike/cobble.webp");
  return useMemo(() => {
    const t = map.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(width / 4.4, repeatY);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    t.needsUpdate = true;
    const m = new THREE.MeshStandardMaterial({ map: t, color: tint, roughness: 0.62, metalness: 0.05 });
    if (hifi) {
      m.bumpMap = t;
      m.bumpScale = TUNING.gfx.hifi.streetBump;
      m.defines = { HIFI: "" };
    }
    m.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, glow, { uTimeS: sway.uTime });
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vSPos;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvSPos = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
          varying vec3 vSPos;
          uniform vec3 uFire[4];
          uniform float uTimeS;
          float sh(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          float sn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
            return mix(mix(sh(i), sh(i + vec2(1.0, 0.0)), f.x), mix(sh(i + vec2(0.0, 1.0)), sh(i + vec2(1.0, 1.0)), f.x), f.y); }
          float puddleAt(vec2 p) { float n = 0.55 * sn(p * 0.55) + 0.3 * sn(p * 1.7 + 4.0) + 0.15 * sn(p * 6.1 + 9.0); return smoothstep(0.54, 0.67, n); }`,
        )
        .replace(
          "#include <map_fragment>",
          `#include <map_fragment>
          float puddle = puddleAt(vSPos.xz);
          #ifdef HIFI
            float low = 1.0 - smoothstep(0.025, 0.05, dot(sampledDiffuseColor.rgb, vec3(0.333)));
            puddle = max(puddle, low * smoothstep(0.42, 0.62, puddleAt(vSPos.xz * 1.9 + 11.0)));
          #endif
          diffuseColor.rgb *= mix(1.0, 0.5, puddle);`,
        )
        .replace(
          "#include <roughnessmap_fragment>",
          `#include <roughnessmap_fragment>
          #ifdef HIFI
            // the tops of the stones are worn matt, the joints between them hold water
            roughnessFactor = mix(0.3, 0.8, smoothstep(0.03, 0.1, dot(sampledDiffuseColor.rgb, vec3(0.333))));
          #endif
          roughnessFactor = mix(roughnessFactor, 0.05, puddle);`,
        )
        .replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>
          float fireLight = 0.0;
          for (int i = 0; i < 4; i++) { float d = distance(vSPos.xz, uFire[i].xy); fireLight += uFire[i].z / (1.0 + d * d * 0.02); }
          float fl = 0.8 + 0.2 * sin(uTimeS * 7.0 + vSPos.z);
          totalEmissiveRadiance += vec3(1.0, 0.42, 0.12) * fireLight * fl * (0.04 + 0.3 * puddle);`,
        );
    };
    return m;
  }, [map, gl, repeatY, width, tint, hifi]);
}


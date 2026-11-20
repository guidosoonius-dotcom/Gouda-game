"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Instanced, Model, glow, place, preload, sway, type ModelName } from "@/components/canal/Kit";
import { rng } from "@/components/canal/layout";
import { radialTexture } from "@/components/canal/textures";
import { TUNING } from "@/game/tuning";
import { useGameStore } from "@/store/useGameStore";
import { BikeBombs } from "./BikeBombs";
import { BikeLife } from "./BikeLife";
import { BikeSky } from "./BikeSky";
import { STREET, type BikeSim } from "./sim";

const GABLES: ModelName[] = ["gevel_trap", "gevel_klok", "gevel_tuit", "gevel_trap_schade", "gevel_klok_schade", "gevel_tuit_schade"];
preload([...GABLES, "puin", "ruine", "schuilkelder", "man", "vrouw", "fiets", "koerier", "lantaarn", "vliegtuig", "handkar", "vracht", "moves"]);
/** Blocks of this many metres down the street are culled on their own (camera and shadow maps). */
const CHUNK = 48;
export const HW = STREET.halfWidth;
const SIDEWALK = 1.7;

/** Fires in the ground floors along the street: flames, smoke, a light, and glow in the windows. */
export const FIRES = [
  { x: -(HW + 2.4), y: 0.9, z: STREET.ruin.z, s: 1.9 },
  { x: -(HW - 0.2), y: 1.6, z: -41, s: 1 },
  { x: HW - 0.2, y: 1.7, z: -78, s: 1.1 },
  { x: -(HW - 0.2), y: 1.6, z: -106, s: 0.9 },
];

/**
 * Wet clinkers: the generated cobble texture with puddles that mirror the sky and the fires. With
 * "Hoge beeldkwaliteit" the stones get relief from the same image, water stays in the joints
 * (dark there means low and shiny) and the puddles gather in them.
 */
function useStreetMaterial(repeatY: number, width: number, tint: string) {
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

function Street() {
  const ground = useStreetMaterial(60, HW * 2 + 0.6, "#cfc8d0");
  const walk = useStreetMaterial(60, SIDEWALK, "#948b84");
  const p = useMemo(() => {
    const r = rng(1126);
    const rows: THREE.Matrix4[][] = GABLES.map(() => []);
    for (const side of [1, -1]) {
      for (let z = 16; z > -190; ) {
        const kind = Math.floor(r() * 3);
        const w = [5.6, 6.2, 5.0][kind];
        const zc = z - w / 2;
        z -= w + 0.03;
        const taken = side < 0 ? Math.abs(zc - STREET.ruin.z) < 4.5 : Math.abs(zc - (STREET.shelterZ - 1)) < 6.5;
        if (taken) continue;
        // houses near a fire are damaged, plus now and then another one
        const hit = FIRES.some((f) => Math.abs(f.z - zc) < 16 && Math.sign(f.x) === side) || r() < 0.1;
        rows[kind + (hit ? 3 : 0)].push(place(side * (HW + 0.3), 0, zc, { yaw: side > 0 ? 0 : Math.PI, sy: 0.92 + r() * 0.22 }));
      }
    }
    const lean = (side: number, z: number, i: number) => place(side * (HW + 0.05 - 0.35), 0.14, z, { yaw: i, roll: side * -0.26 });
    return {
      rows,
      rubble: STREET.rubble.map((q) => place(q.x, 0, q.z, { yaw: r() * 6.28, s: q.r / 1.45 })),
      lamps: [-30, -90, -146].map((z, i) => place((i % 2 ? 1 : -1) * (HW - 0.3), 0.14, z)),
      bikes: [lean(1, -6, 0), lean(-1, -25, 0), lean(1, -52, 0), lean(-1, -91, 0), lean(1, -119, 0)],
      carts: [place(-(HW - 1.2), 0.14, -17, { yaw: 0.25 }), place(HW - 1.1, 0.14, -66, { yaw: Math.PI - 0.3 })],
      crates: [place(HW - 0.9, 0.14, -29, { yaw: 0.6 }), place(-(HW - 0.9), 0.14, -86, { yaw: 2.2 }), place(HW - 0.9, 0.14, -133, { yaw: 1.1 })],
    };
  }, []);
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -85]} receiveShadow>
        <planeGeometry args={[HW * 2 + 0.6, 240]} />
        <primitive object={ground} attach="material" />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * (HW + 0.3 - SIDEWALK / 2), 0.07, -85]} receiveShadow castShadow>
            <boxGeometry args={[SIDEWALK, 0.14, 240]} />
            <primitive object={walk} attach="material" />
          </mesh>
          <mesh position={[side * (HW + 0.3 - SIDEWALK), 0.075, -85]}>
            <boxGeometry args={[0.16, 0.15, 240]} />
            <meshStandardMaterial color="#8d867d" roughness={0.9} />
          </mesh>
        </group>
      ))}
      {GABLES.map((name, i) => (
        <Instanced key={name} name={name} placements={p.rows[i]} chunk={CHUNK} />
      ))}
      <Instanced name="puin" placements={p.rubble} chunk={CHUNK} />
      <Instanced name="lantaarn" placements={p.lamps} chunk={CHUNK} />
      <Instanced name="fiets" placements={p.bikes} chunk={CHUNK} />
      <Instanced name="handkar" placements={p.carts} chunk={CHUNK} />
      <Instanced name="vracht" placements={p.crates} chunk={CHUNK} />
      <Model name="ruine" position={[-(HW + 0.3), 0, STREET.ruin.z]} rotation-y={Math.PI} />
      <Model name="schuilkelder" position={[HW + 0.3, 0, STREET.shelterZ - 1]} />
      <ShelterSign />
    </>
  );
}

/** The painted board over the shelter door; a lit window below it. */
function ShelterSign() {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 96;
    const g = c.getContext("2d")!;
    g.fillStyle = "#1c2a3c";
    g.fillRect(0, 0, 512, 96);
    g.strokeStyle = "#e9e2d0";
    g.lineWidth = 5;
    g.strokeRect(6, 6, 500, 84);
    g.fillStyle = "#e9e2d0";
    g.font = "bold 54px 'Archivo Narrow', 'Arial Narrow', sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("SCHUILKELDER", 256, 52);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <group position={[HW + 0.3 - 0.12, 3.55, STREET.shelterZ - 1]} rotation-y={-Math.PI / 2}>
      <mesh>
        <planeGeometry args={[3.2, 0.6]} />
        <meshStandardMaterial map={tex} emissive="#e9e2d0" emissiveMap={tex} emissiveIntensity={0.35} roughness={0.8} />
      </mesh>
      <pointLight position={[0, -1.4, -1.2]} color="#ffcf8a" intensity={26} distance={9} decay={1.8} />
    </group>
  );
}

/**
 * Real lights for the fires: fewer than there are fires, handed to the fires nearest the player and
 * faded out with distance before they move on. Every point light costs every lit pixel of the street,
 * and the number of lights must stay the same (a change recompiles every shader).
 */
export const FIRE_LIGHTS = 3;
// At most three fires lie within twice this distance of each other, so no lit fire ever loses its light.
export const FIRE_REACH = 44;
const BY_DISTANCE = FIRES.map((_, i) => i);

/** Flames, smoke columns and the light and glow on the ground that they throw. */
function Fires({ sim }: { sim: React.RefObject<BikeSim> }) {
  const tex = useMemo(radialTexture, []);
  const flames = useRef<(THREE.Sprite | null)[]>([]);
  const smoke = useRef<(THREE.Sprite | null)[]>([]);
  const lights = useRef<(THREE.PointLight | null)[]>([]);
  const SMOKE = 6;

  useEffect(() => {
    FIRES.forEach((f, i) => glow.uFire.value[i].set(f.x, f.z, 2.4 * f.s));
    glow.uWindowGlow.value = 1;
    return () => {
      glow.uWindowGlow.value = 0;
      glow.uFire.value.forEach((v) => v.set(0, 9999, 0));
    };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    FIRES.forEach((f, i) => {
      for (let k = 0; k < 4; k++) {
        const sp = flames.current[i * 4 + k];
        if (!sp) continue;
        const ph = i * 3 + k * 1.7;
        const fl = 0.7 + 0.3 * Math.sin(t * (8 + k * 2.3) + ph) * Math.sin(t * 5.1 + ph * 2);
        sp.position.set(f.x + 0.5 + Math.sin(t * 2.2 + ph) * 0.25, f.y + 0.2 + fl * 0.9 * f.s + k * 0.55 * f.s, f.z + (k - 1.5) * 0.8 * f.s);
        sp.scale.set((3.1 - k * 0.5) * f.s * fl, (5.2 - k * 0.8) * f.s * fl, 1);
      }
      for (let k = 0; k < SMOKE; k++) {
        const s = smoke.current[i * SMOKE + k];
        if (!s) continue;
        const rise = (t * 0.16 + k / SMOKE + i * 0.17) % 1;
        s.position.set(f.x + Math.sin(t * 0.3 + k * 2) * 1.2 + rise * 5, f.y + 1 + rise * 15 * f.s, f.z - rise * 4);
        s.scale.setScalar((4.5 + rise * 12) * (0.8 + f.s * 0.3));
        const m = s.material as THREE.SpriteMaterial;
        m.opacity = 0.62 * (1 - rise) * Math.min(1, rise * 6);
        m.color.setRGB(0.12 + 0.5 * (1 - rise) * (1 - rise), 0.1 + 0.2 * (1 - rise) * (1 - rise), 0.1 + 0.05 * (1 - rise));
      }
    });

    // the fire lights go to the fires nearest to where the player looks
    const focus = sim.current.z - 12;
    BY_DISTANCE.sort((a, b) => Math.abs(FIRES[a].z - focus) - Math.abs(FIRES[b].z - focus));
    for (let k = 0; k < FIRE_LIGHTS; k++) {
      const light = lights.current[k];
      const i = BY_DISTANCE[k];
      const f = FIRES[i];
      if (!light || f === undefined) continue;
      const near = THREE.MathUtils.smoothstep(FIRE_REACH - Math.abs(f.z - focus), 0, FIRE_REACH * 0.5);
      light.position.set(f.x * 0.9, f.y + 0.6, f.z);
      light.intensity = near * 90 * f.s * (0.75 + 0.25 * Math.sin(t * 9 + i * 2) * Math.sin(t * 5.3 + i));
    }
  });

  const add = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending } as const;
  return (
    <>
      {Array.from({ length: FIRE_LIGHTS }, (_, k) => (
        <pointLight key={k} ref={(m) => void (lights.current[k] = m)} color="#ff8a3a" intensity={0} distance={19} decay={1.5} />
      ))}
      {FIRES.map((f, i) => (
        <group key={i}>
          {[0, 1, 2, 3].map((k) => (
            <sprite key={k} ref={(m) => void (flames.current[i * 4 + k] = m)}>
              <spriteMaterial map={tex} color={k < 2 ? "#ff7a1c" : "#ffc060"} {...add} opacity={1 - k * 0.1} />
            </sprite>
          ))}
          <mesh rotation-x={-Math.PI / 2} position={[f.x * 0.82, 0.04, f.z]}>
            <circleGeometry args={[7 * f.s, 28]} />
            <meshBasicMaterial color="#ff6a1c" {...add} opacity={0.1} />
          </mesh>
          {Array.from({ length: SMOKE }, (_, k) => (
            <sprite key={k} ref={(m) => void (smoke.current[i * SMOKE + k] = m)}>
              <spriteMaterial map={tex} transparent depthWrite={false} />
            </sprite>
          ))}
        </group>
      ))}
    </>
  );
}

export function BikeWorld({ sim }: { sim: React.RefObject<BikeSim> }) {
  return (
    <group>
      <BikeSky />
      <Street />
      <Fires sim={sim} />
      <BikeBombs sim={sim} />
      {TUNING.gfx.life && <BikeLife sim={sim} />}
    </group>
  );
}

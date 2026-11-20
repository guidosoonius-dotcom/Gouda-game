"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Instanced, Model, place, preload, type ModelName } from "./Kit";
import { setWaterLine } from "./materials";
import { HW, LAYOUT, LEN, QUAY, rng } from "./layout";
import { COURSE } from "./sim";
import { useWetStreet } from "./WetStreet";

/** Soft horizontal streaks: moonlight on small waves. Drawn once on a canvas, then scrolled. */
function useGlints() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const r = rng(11);
    for (let i = 0; i < 90; i++) {
      const w = 14 + r() * 46;
      const x = r() * 256;
      const grad = g.createLinearGradient(x, 0, x + w, 0);
      grad.addColorStop(0, "rgba(190,215,240,0)");
      grad.addColorStop(0.5, `rgba(190,215,240,${0.25 + r() * 0.5})`);
      grad.addColorStop(1, "rgba(190,215,240,0)");
      g.fillStyle = grad;
      g.fillRect(x, r() * 256, w, 1 + r() * 1.5);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1.6, 26);
    return t;
  }, []);
}

/** Street lanterns along the quays (alternating sides); the water mirrors them as streaks. */
const LANTERNS = [-8, -36, -58, -86, -112].map((z, i) => ({ x: (i % 2 ? 1 : -1) * (HW + 0.9), z }));

/**
 * Dark, glossy canal water: reflects the night sky, with ripples in several sizes that bend the
 * highlights. Along the quays it mirrors the dark walls and houses instead of the sky, and under
 * each lantern lies a wavering streak of its light.
 */
function useWater() {
  return useMemo(() => {
    const time = { value: 0 };
    const lamps = { value: LANTERNS.map((l) => new THREE.Vector2(Math.sign(l.x) * (HW - 0.45), l.z)) };
    const m = new THREE.MeshStandardMaterial({ color: "#0c2230", metalness: 0.6, roughness: 0.16, emissive: "#040d13" });
    m.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, { uTime: time, uLamps: lamps, uHW: { value: HW } });
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vWater;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvWater = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", `#include <common>\nvarying vec3 vWater;\nuniform float uTime;\nuniform float uHW;\nuniform vec2 uLamps[${LANTERNS.length}];`)
        .replace(
          "#include <normal_fragment_maps>",
          `#include <normal_fragment_maps>
          vec2 w = vWater.xz;
          vec2 rip = vec2(
            sin(w.x * 2.1 + w.y * 0.7 + uTime * 1.3) + 0.6 * sin(w.x * 5.3 - w.y * 2.9 - uTime * 2.1) + 0.3 * sin(w.x * 11.0 + w.y * 7.0 + uTime * 3.1),
            sin(w.y * 1.7 - w.x * 0.9 + uTime * 1.1) + 0.6 * sin(w.y * 4.7 + w.x * 3.3 + uTime * 1.7) + 0.3 * sin(w.y * 12.0 - w.x * 6.0 - uTime * 2.7));
          normal = normalize(normal + (viewMatrix * vec4(rip.x, 0.0, rip.y, 0.0)).xyz * 0.04);
          // along the quays the water mirrors the dark walls and houses, not the sky
          float nearWall = smoothstep(uHW - 2.4, uHW - 0.2, abs(w.x) + 0.18 * rip.x);`,
        )
        .replace(
          "#include <lights_fragment_maps>",
          `#include <lights_fragment_maps>
          radiance *= mix(1.0, 0.22, nearWall);`,
        )
        .replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>
          {
            // each lantern lies on the water as a streak toward the viewer, broken by the ripples
            float streak = 0.0;
            for (int i = 0; i < ${LANTERNS.length}; i++) {
              vec2 d = w - uLamps[i];
              float dx = d.x + 0.12 * sin(w.y * 3.1 + uTime * 1.9) + 0.06 * rip.x;
              float along = smoothstep(-0.6, 0.4, d.y) * (1.0 - smoothstep(1.5, 6.5, d.y));
              streak += exp(-dx * dx * 22.0) * along;
            }
            float broken = 0.55 + 0.45 * sin(w.y * 9.0 - uTime * 2.3 + rip.y * 2.0);
            totalEmissiveRadiance += vec3(1.0, 0.72, 0.38) * streak * broken * 0.55;
          }`,
        );
    };
    return { material: m, time };
  }, []);
}

function Water() {
  const glints = useGlints();
  // the streets along the quays: the same wet clinkers as the bicycle street, a little darker
  const street = useWetStreet(LEN / 4.4, 12.2, "#8c8a90");
  const { material: water, time } = useWater();
  useFrame((_, dt) => {
    glints.offset.y += dt * 0.012;
    glints.offset.x += dt * 0.004;
    time.value += dt;
  });
  return (
    <group position={[0, 0, -LEN / 2 + 20]}>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[HW * 2 + 1, LEN]} />
        <primitive object={water} attach="material" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.012, 0]}>
        <planeGeometry args={[HW * 2, LEN]} />
        <meshBasicMaterial map={glints} transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* cobbled streets behind the quay strips, under the houses */}
      {[-1, 1].map((side) => (
        <mesh key={side} rotation-x={-Math.PI / 2} position={[side * (HW + 9), QUAY - 0.02, 0]} receiveShadow>
          <planeGeometry args={[12.2, LEN]} />
          <primitive object={street} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

const HOUSES: ModelName[] = ["gevel_trap", "gevel_klok", "gevel_tuit"];
/** Metres per culled block of the long rows along the canal. */
const CHUNK = 50;
preload([...HOUSES, "kade", "riet", "schouw", "ophaalbrug", "sluisdeur", "soldaat", "zoeklicht", "lantaarn", "boom", "fiets", "meerpaal", "wachtpost", "vracht", "eend", "koerier", "man", "moves"]);

/** Three gable types, stretched and tinted per house so the street never repeats. */
function Houses() {
  const sets = useMemo(
    () =>
      HOUSES.map((_, kind) => {
        const list = LAYOUT.houses.filter((h) => h.kind === kind);
        return {
          placements: list.map((h) => place(h.side * (HW + 3.05), QUAY, h.z, { yaw: h.side > 0 ? 0 : Math.PI, sy: h.sy })),
          tints: list.map((h) => new THREE.Color(...h.tint)),
        };
      }),
    [],
  );
  return (
    <>
      {HOUSES.map((name, i) => (
        <Instanced key={name} name={name} placements={sets[i].placements} tints={sets[i].tints} chunk={CHUNK} />
      ))}
    </>
  );
}

function Props() {
  const p = useMemo(() => {
    const r = rng(5);
    const quays: THREE.Matrix4[] = [];
    for (let z = 15; z > -LEN + 20; z -= 10) quays.push(place(HW, 0, z), place(-HW, 0, z, { yaw: Math.PI }));
    const reeds: THREE.Matrix4[] = [];
    for (const reed of COURSE.reeds) {
      for (let i = 0; i < 10; i++) {
        const a = (i / 9) * Math.PI * 2 + r();
        const d = i === 0 ? 0 : reed.r * (0.3 + r() * 0.5);
        const x = Math.max(-HW + 0.5, Math.min(HW - 0.5, reed.x + Math.cos(a) * d));
        reeds.push(place(x, 0, reed.z + Math.sin(a) * d, { yaw: r() * 6.28, s: 0.85 + r() * 0.5 }));
      }
    }
    // a few loose tufts along the walls, so the reed beds do not look planted
    for (let i = 0; i < 16; i++) {
      const side = r() < 0.5 ? -1 : 1;
      reeds.push(place(side * (HW - 0.35 - r() * 0.3), 0, 8 - r() * (LEN - 30), { yaw: r() * 6.28, s: 0.5 + r() * 0.35 }));
    }
    return {
      quays,
      reeds,
      trees: LAYOUT.trees.map((t) => place(t.x, QUAY, t.z, { yaw: t.yaw, s: t.s })),
      posts: LAYOUT.posts.map((q) => place(q.x, 0, q.z, { yaw: r() * 6.28, roll: (r() - 0.5) * 0.08 })),
      lanterns: LANTERNS.map((l) => place(l.x, QUAY, l.z)),
      bikes: [
        place(HW + 0.62, QUAY, -36.6, { yaw: 0.1, roll: -0.24 }),
        place(-(HW + 2.75), QUAY, -17, { yaw: 3.2, roll: 0.22 }),
        place(HW + 2.7, QUAY, -96, { yaw: 0.05, roll: -0.2 }),
      ],
      cargo: [place(-(HW + 1.5), QUAY, -27, { yaw: 0.4 }), place(HW + 1.4, QUAY, -78.5, { yaw: 2.1 }), place(-(HW + 1.6), QUAY, -118, { yaw: 1.2 })],
    };
  }, []);
  return (
    <>
      <Instanced name="kade" placements={p.quays} chunk={CHUNK} />
      <Instanced name="riet" placements={p.reeds} spot chunk={CHUNK} />
      <Instanced name="boom" placements={p.trees} chunk={CHUNK} />
      <Instanced name="meerpaal" placements={p.posts} chunk={CHUNK} />
      <Instanced name="lantaarn" placements={p.lanterns} chunk={CHUNK} />
      <Instanced name="fiets" placements={p.bikes} />
      <Instanced name="vracht" placements={p.cargo} />
    </>
  );
}

/** Everything that does not move: water, quays, houses, trees, bridge, lock and street furniture. */
export function CanalWorld() {
  useEffect(() => {
    setWaterLine(0);
    return () => setWaterLine(null);
  }, []);
  return (
    <group>
      <Water />
      <Houses />
      <Props />
      <Model name="ophaalbrug" position={[0, 0, COURSE.bridgeZ]} />
      <Model name="wachtpost" position={[-(HW + 2.1), QUAY, COURSE.bridgeZ + 4.6]} rotation-y={Math.PI} />
      <Model name="sluisdeur" position={[0, 0, COURSE.lockZ]} />
    </group>
  );
}

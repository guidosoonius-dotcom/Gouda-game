"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Instanced, Model, place, preload, type ModelName } from "./Kit";
import { HW, LAYOUT, LEN, QUAY, rng } from "./layout";
import { COURSE } from "./sim";

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

function Water() {
  const glints = useGlints();
  useFrame((_, dt) => {
    glints.offset.y += dt * 0.012;
    glints.offset.x += dt * 0.004;
  });
  return (
    <group position={[0, 0, -LEN / 2 + 20]}>
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[HW * 2 + 1, LEN]} />
        <meshStandardMaterial color="#12303d" metalness={0.15} roughness={0.42} emissive="#06141b" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.012, 0]}>
        <planeGeometry args={[HW * 2, LEN]} />
        <meshBasicMaterial map={glints} transparent opacity={0.34} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* cobbled streets behind the quay strips, under the houses */}
      {[-1, 1].map((side) => (
        <mesh key={side} rotation-x={-Math.PI / 2} position={[side * (HW + 9), QUAY - 0.02, 0]}>
          <planeGeometry args={[12.2, LEN]} />
          <meshStandardMaterial color="#4a4743" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

const HOUSES: ModelName[] = ["gevel_trap", "gevel_klok", "gevel_tuit"];
preload([...HOUSES, "kade", "riet", "schouw", "ophaalbrug", "sluisdeur", "soldaat", "zoeklicht", "lantaarn", "boom", "fiets", "meerpaal", "wachtpost", "vracht"]);

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
        <Instanced key={name} name={name} placements={sets[i].placements} tints={sets[i].tints} />
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
      lanterns: [-8, -36, -58, -86, -112].map((z, i) => place((i % 2 ? 1 : -1) * (HW + 0.9), QUAY, z)),
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
      <Instanced name="kade" placements={p.quays} />
      <Instanced name="riet" placements={p.reeds} />
      <Instanced name="boom" placements={p.trees} />
      <Instanced name="meerpaal" placements={p.posts} />
      <Instanced name="lantaarn" placements={p.lanterns} />
      <Instanced name="fiets" placements={p.bikes} />
      <Instanced name="vracht" placements={p.cargo} />
    </>
  );
}

/** Everything that does not move: water, quays, houses, trees, bridge, lock and street furniture. */
export function CanalWorld() {
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

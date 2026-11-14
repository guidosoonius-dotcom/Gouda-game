"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Post } from "@/components/canal/CanalGuards";
import { Instanced, Model, place, preload, type ModelName } from "@/components/canal/Kit";
import { rng } from "@/components/canal/layout";
import { beamTexture, radialTexture } from "@/components/canal/textures";
import { HOUSES, TOWERS, TOWER_TOP, ridgeAt } from "./layout";
import { ROOF, beamX, type RoofSim } from "./sim";

const GABLES: ModelName[] = ["gevel_trap", "gevel_klok", "gevel_tuit"];
preload([...GABLES, "dakhuis", "schoorsteen", "koerier", "sintjan", "uitkijk", "soldaat", "zoeklicht", "boom"]);
const UP = new THREE.Vector3(0, 1, 0);

/** The row of roofs the courier crosses, the street behind it and the skyline. */
function Town() {
  const p = useMemo(() => {
    const r = rng(42);
    const scale = new THREE.Vector3();
    const q = new THREE.Quaternion();
    const roofs = HOUSES.map((h) => new THREE.Matrix4().compose(new THREE.Vector3((h.x0 + h.x1) / 2, 0, -1.2), q, scale.set(h.sx, h.sy, 1.05)));
    const back: THREE.Matrix4[][] = [[], [], []];
    for (let x = -40; x < 175; ) {
      const kind = Math.floor(r() * 3);
      const w = [5.6, 6.2, 5.0][kind];
      back[kind].push(place(x + w / 2, -3.5 + r() * 2.5, -19, { yaw: Math.PI / 2, sy: 0.95 + r() * 0.25 }));
      x += w + 0.05;
    }
    return {
      roofs,
      tints: HOUSES.map((h) => new THREE.Color(...h.tint)),
      back,
      chimneys: ROOF.covers.map((x) => place(x, ridgeAt(x) - 0.25, -0.75, { yaw: (r() - 0.5) * 0.1 })),
      towers: TOWERS.map((t) => place(t.x, 0, t.z)),
      trees: [8, 52, 104].map((x) => place(x, 0, 9.5, { s: 1.5, yaw: x })),
    };
  }, []);
  return (
    <>
      <Instanced name="dakhuis" placements={p.roofs} tints={p.tints} />
      <Instanced name="schoorsteen" placements={p.chimneys} />
      <Instanced name="uitkijk" placements={p.towers} />
      <Instanced name="boom" placements={p.trees} />
      {GABLES.map((name, i) => (
        <Instanced key={name} name={name} placements={p.back[i]} />
      ))}
      <Model name="sintjan" position={[178, -6, -62]} rotation-y={0.25} scale={1.25} />
      <mesh rotation-x={-Math.PI / 2} position={[60, 0, 0]}>
        <planeGeometry args={[400, 240]} />
        <meshStandardMaterial color="#1a2029" roughness={1} />
      </mesh>
    </>
  );
}

/** Searchlights on the lookout towers: cone, pool of light on the tiles, and their crews. */
function Lights({ sim }: { sim: React.RefObject<RoofSim> }) {
  const beam = useMemo(beamTexture, []);
  const pool = useMemo(radialTexture, []);
  const feet = useMemo(() => TOWERS.map((t) => new THREE.Vector3(t.x, TOWER_TOP, t.z + 1.2)), []);
  const aims = useRef(TOWERS.map(() => new THREE.Vector3()));
  const aimRefs = useMemo(() => aims.current.map((v) => ({ current: v })), []);
  const targets = useMemo(() => TOWERS.map(() => new THREE.Object3D()), []);
  const cones = useRef<(THREE.Mesh | null)[]>([]);
  const pools = useRef<(THREE.Sprite | null)[]>([]);

  useFrame(() => {
    TOWERS.forEach((_, i) => {
      const x = beamX(i, sim.current.t);
      const to = aims.current[i].set(x, ridgeAt(x) + 0.2, 0.2);
      const from = feet[i].clone().setY(TOWER_TOP + 1.35);
      targets[i].position.copy(to);
      targets[i].updateMatrixWorld();
      pools.current[i]?.position.copy(to);
      const cone = cones.current[i];
      if (cone) {
        const dir = to.clone().sub(from);
        const len = dir.length();
        cone.position.copy(from).addScaledVector(dir, 0.5);
        cone.quaternion.setFromUnitVectors(UP, dir.normalize().negate());
        cone.scale.set(ROOF.beams[i].r, len, ROOF.beams[i].r);
      }
    });
  });

  const glow = { color: "#ffd98a", transparent: true, depthWrite: false, blending: THREE.AdditiveBlending } as const;
  return (
    <>
      {TOWERS.map((_, i) => (
        <group key={i}>
          <Post foot={feet[i]} aim={aimRefs[i]} />
          <primitive object={targets[i]} />
          <spotLight position={[feet[i].x, TOWER_TOP + 1.35, feet[i].z]} target={targets[i]} color="#ffd27a" intensity={900} angle={0.13} penumbra={0.5} distance={90} decay={1.5} />
          <sprite position={[feet[i].x, TOWER_TOP + 1.35, feet[i].z]} scale={1.6}>
            <spriteMaterial map={pool} {...glow} opacity={0.7} />
          </sprite>
          <mesh ref={(m) => void (cones.current[i] = m)}>
            <cylinderGeometry args={[0.05, 1, 1, 20, 1, true]} />
            <meshBasicMaterial {...glow} alphaMap={beam} opacity={0.16} side={THREE.DoubleSide} />
          </mesh>
          <sprite ref={(m) => void (pools.current[i] = m)} scale={[ROOF.beams[i].r * 3.2, ROOF.beams[i].r * 3.2, 1]}>
            <spriteMaterial map={pool} {...glow} opacity={0.42} />
          </sprite>
        </group>
      ))}
    </>
  );
}

export function RoofWorld({ sim }: { sim: React.RefObject<RoofSim> }) {
  const moon = useMemo(radialTexture, []);
  return (
    <group>
      <Town />
      <Lights sim={sim} />
      <sprite position={[230, 78, -150]} scale={26}>
        <spriteMaterial map={moon} color="#dfe8f5" transparent opacity={0.85} depthWrite={false} fog={false} />
      </sprite>
    </group>
  );
}

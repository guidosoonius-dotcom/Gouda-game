"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Instanced, place, sway } from "./Kit";
import { HW, LAYOUT } from "./layout";
import { COURSE, type Sim } from "./sim";
import { radialTexture, streakTexture } from "./textures";

type SimRef = React.RefObject<Sim>;
const MIST = 8;

/** Low banks of mist drifting over the water, recycled around the boat. */
function Mist({ sim }: { sim: SimRef }) {
  const map = useMemo(radialTexture, []);
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const along = (i * 13.7 + t * 0.55) % 96;
      m.position.set(Math.sin(t * 0.05 + i * 2.1) * 3.2, 0.5 + (i % 3) * 0.35, sim.current.z + 16 - along);
      (m.material as THREE.MeshBasicMaterial).opacity = 0.11 + Math.sin(t * 0.2 + i) * 0.03;
    });
  });
  return (
    <>
      {Array.from({ length: MIST }, (_, i) => (
        <mesh key={i} ref={(m) => void (refs.current[i] = m)} rotation-x={-Math.PI / 2} scale={[15 + (i % 3) * 3, 8 + (i % 2) * 3, 1]}>
          <planeGeometry />
          <meshBasicMaterial map={map} color="#a9bfd4" transparent opacity={0.08} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

/** October: leaves floating down the canal. They catch the searchlight when it passes. */
function Leaves({ sim }: { sim: SimRef }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const m = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const flat = useMemo(() => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2), []);
  const spin = useMemo(() => new THREE.Quaternion(), []);
  useLayoutEffect(() => {
    const tones = ["#b98a2e", "#8c5a24", "#c9a13a", "#6e4a22"];
    LAYOUT.leaves.forEach((_, i) => ref.current!.setColorAt(i, new THREE.Color(tones[i % tones.length])));
    ref.current!.instanceColor!.needsUpdate = true;
  }, []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const front = sim.current.z + 22;
    LAYOUT.leaves.forEach((leaf, i) => {
      // world-fixed drift, wrapped into a window that travels with the boat
      const world = -leaf.z * 2 + leaf.drift * t;
      const z = front - ((((front - world) % 80) + 80) % 80);
      spin.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, leaf.yaw + t * leaf.drift * 2);
      q.copy(spin).multiply(flat);
      ref.current!.setMatrixAt(i, m.compose(new THREE.Vector3(leaf.x + Math.sin(t * 0.3 + i) * 0.12, 0.016, z), q, new THREE.Vector3(leaf.s, leaf.s * 0.7, 1)));
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, LAYOUT.leaves.length]} frustumCulled={false}>
      <circleGeometry args={[1, 5]} />
      <meshStandardMaterial roughness={1} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

/** Blackout: a few slivers of lamplight past a curtain, each with its streak on the water. */
function Slivers() {
  const streak = useMemo(streakTexture, []);
  const halo = useMemo(radialTexture, []);
  const glow = useRef<(THREE.Mesh | null)[]>([]);
  const water = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    LAYOUT.slivers.forEach((s, i) => {
      const flicker = 0.8 + 0.12 * Math.sin(t * 7.3 + s.seed) + 0.08 * Math.sin(t * 13.1 + s.seed * 3);
      if (glow.current[i]) (glow.current[i]!.material as THREE.MeshBasicMaterial).opacity = flicker;
      if (water.current[i]) (water.current[i]!.material as THREE.MeshBasicMaterial).opacity = 0.13 * flicker + 0.03 * Math.sin(t * 2.1 + s.seed);
    });
  });
  return (
    <>
      {LAYOUT.slivers.map((s, i) => (
        <group key={i}>
          <mesh ref={(m) => void (glow.current[i] = m)} position={[s.x - s.side * 0.1, s.y, s.z]} rotation-y={(-s.side * Math.PI) / 2}>
            <planeGeometry args={[0.24, 1.3]} />
            <meshBasicMaterial color="#f4b45c" transparent toneMapped={false} />
          </mesh>
          <sprite position={[s.x - s.side * 0.25, s.y, s.z]} scale={4.4}>
            <spriteMaterial map={halo} color="#f0a04a" transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
          <mesh ref={(m) => void (water.current[i] = m)} position={[s.side * (HW - 2.2), 0.02, s.z]} rotation-x={-Math.PI / 2} scale={[-s.side * 4.4, 0.9, 1]}>
            <planeGeometry />
            <meshBasicMaterial map={streak} color="#f4b45c" transparent opacity={0.14} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/** Empty rowboats tied to the mooring posts, rocking on the water. */
function Moored() {
  const placements = useMemo(() => COURSE.moored.map((b) => place(b.x, 0, b.z)), []);
  return (
    <Instanced
      name="schouw"
      only="Hull"
      placements={placements}
      live={(t, out) =>
        COURSE.moored.forEach((b, i) =>
          place(b.x, Math.sin(t * 1.1 + i * 2) * 0.025, b.z, { yaw: (i % 2 ? Math.PI : 0) + Math.sin(t * 0.4 + i) * 0.04, roll: Math.sin(t * 0.9 + i * 1.7) * 0.035 }, out[i]),
        )
      }
    />
  );
}

/** Everything that moves by itself: mist, leaves, light behind curtains, moored boats, wind. */
export function CanalLife({ sim }: { sim: SimRef }) {
  useFrame(({ clock }, delta) => {
    const s = sim.current;
    sway.uTime.value = clock.elapsedTime;
    sway.uBoat.value.set(s.x, 0, s.z);
    sway.uRustle.value += (Math.min(1, s.v / 1.8) - sway.uRustle.value) * (1 - Math.exp(-5 * Math.min(delta, 0.05)));
  });
  return (
    <>
      <Mist sim={sim} />
      <Leaves sim={sim} />
      <Slivers />
      <Moored />
    </>
  );
}

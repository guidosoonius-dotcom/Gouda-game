"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Instanced, MODELS, Model, placement } from "./Kit";
import { COURSE } from "./sim";

const HW = COURSE.halfWidth;
const LEN = COURSE.length + 40;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

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
      const y = r() * 256;
      const grad = g.createLinearGradient(x, 0, x + w, 0);
      grad.addColorStop(0, "rgba(190,215,240,0)");
      grad.addColorStop(0.5, `rgba(190,215,240,${0.25 + r() * 0.5})`);
      grad.addColorStop(1, "rgba(190,215,240,0)");
      g.fillStyle = grad;
      g.fillRect(x, y, w, 1 + r() * 1.5);
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
    </group>
  );
}

function Quays() {
  const placements = useMemo(() => {
    const out: THREE.Matrix4[] = [];
    for (let z = 15; z > -LEN + 20; z -= 10) {
      out.push(placement(HW, 0, z));
      out.push(placement(-HW, 0, z, Math.PI));
    }
    return out;
  }, []);
  return <Instanced url={MODELS.kade} placements={placements} />;
}

function Lanterns() {
  const placements = useMemo(
    () => [-8, -36, -58, -86, -112].map((z, i) => placement((i % 2 ? 1 : -1) * (HW + 0.9), 1.26, z)),
    [],
  );
  return <Instanced url={MODELS.lantaarn} placements={placements} />;
}

/** Dark house blocks behind the quays (two draw calls). Mostly outside the portrait frame. */
function Houses() {
  const bodies = useRef<THREE.InstancedMesh>(null);
  const roofs = useRef<THREE.InstancedMesh>(null);
  const houses = useMemo(() => {
    const r = rng(1944);
    const out: { x: number; z: number; w: number; h: number }[] = [];
    for (const side of [-1, 1]) {
      let z = 16;
      while (z > -LEN + 26) {
        const w = 5.2 + r() * 1.6;
        z -= w;
        out.push({ x: side * (HW + 7), z: z + w / 2, w: w - 0.15, h: 8 + r() * 4.5 });
      }
    }
    return out;
  }, []);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const tilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 4);
    houses.forEach((h, i) => {
      bodies.current!.setMatrixAt(i, m.compose(new THREE.Vector3(h.x, 1.2 + h.h / 2, h.z), q, new THREE.Vector3(8, h.h, h.w)));
      const s = h.w * 0.52;
      roofs.current!.setMatrixAt(i, m.compose(new THREE.Vector3(h.x, 1.2 + h.h, h.z), tilt, new THREE.Vector3(8.2, s, s)));
    });
    bodies.current!.instanceMatrix.needsUpdate = true;
    roofs.current!.instanceMatrix.needsUpdate = true;
  }, [houses]);
  return (
    <>
      <instancedMesh ref={bodies} args={[undefined, undefined, houses.length]} frustumCulled={false}>
        <boxGeometry />
        <meshStandardMaterial color="#54402f" roughness={0.95} />
      </instancedMesh>
      <instancedMesh ref={roofs} args={[undefined, undefined, houses.length]} frustumCulled={false}>
        <boxGeometry />
        <meshStandardMaterial color="#33323a" roughness={0.9} />
      </instancedMesh>
    </>
  );
}

function Reeds() {
  const placements = useMemo(() => {
    const r = rng(7);
    const out: THREE.Matrix4[] = [];
    for (const reed of COURSE.reeds) {
      for (let i = 0; i < 9; i++) {
        const a = (i / 8) * Math.PI * 2 + r();
        const d = i === 0 ? 0 : reed.r * (0.35 + r() * 0.45);
        const x = Math.max(-HW + 0.5, Math.min(HW - 0.5, reed.x + Math.cos(a) * d));
        out.push(placement(x, 0, reed.z + Math.sin(a) * d, r() * 6.28, 0.85 + r() * 0.45));
      }
    }
    return out;
  }, []);
  return <Instanced url={MODELS.riet} placements={placements} />;
}

export function CanalWorld() {
  return (
    <group>
      <Water />
      <Quays />
      <Lanterns />
      <Houses />
      <Reeds />
      <Model url={MODELS.ophaalbrug} position={[0, 0, COURSE.bridgeZ]} />
      <Model url={MODELS.sluisdeur} position={[0, 0, COURSE.lockZ]} />
      <Model url={MODELS.lantaarn} position={[HW + 1.2, 1.5, COURSE.lockZ + 2]} />
    </group>
  );
}

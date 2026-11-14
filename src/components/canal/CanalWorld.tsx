"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { COURSE } from "./sim";

const HW = COURSE.halfWidth;
const LEN = COURSE.length + 40;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function Water() {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, -LEN / 2 + 20]}>
      <planeGeometry args={[HW * 2 + 1, LEN]} />
      <meshStandardMaterial color="#12303d" metalness={0.15} roughness={0.42} emissive="#06141b" />
    </mesh>
  );
}

function Quays() {
  return (
    <>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * (HW + 1.5), 0, -LEN / 2 + 20]}>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[3, 2.2, LEN]} />
            <meshStandardMaterial color="#5a463a" roughness={0.95} />
          </mesh>
          <mesh position={[-side * 1.4, 1.24, 0]}>
            <boxGeometry args={[0.36, 0.14, LEN]} />
            <meshStandardMaterial color="#8a877f" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/** Grey-box canal houses; replaced by the Blender kit (gevel_*.glb) when it lands. */
function Houses() {
  const houses = useMemo(() => {
    const r = rng(1944);
    const out: { x: number; z: number; w: number; h: number; side: number; tone: string; lit: number }[] = [];
    for (const side of [-1, 1]) {
      let z = 16;
      while (z > -LEN + 26) {
        const w = 5.2 + r() * 1.6;
        z -= w / 2;
        if (Math.abs(z - COURSE.bridgeZ) > 5) {
          out.push({ x: side * (HW + 3 + 4), z, w: w - 0.15, h: 8 + r() * 4.5, side, tone: ["#4f3a30", "#5a4435", "#46352e", "#62493a"][Math.floor(r() * 4)], lit: r() });
        }
        z -= w / 2;
      }
    }
    return out;
  }, []);
  return (
    <>
      {houses.map((h, i) => (
        <group key={i} position={[h.x, 1.2, h.z]}>
          <mesh position={[0, h.h / 2, 0]}>
            <boxGeometry args={[8, h.h, h.w]} />
            <meshStandardMaterial color={h.tone} roughness={0.95} />
          </mesh>
          <mesh position={[0, h.h + h.w * 0.18, 0]} rotation-x={Math.PI / 4} scale={[1, 0.72, 0.72]}>
            <boxGeometry args={[8.2, h.w * 0.72, h.w * 0.72]} />
            <meshStandardMaterial color="#33323a" roughness={0.9} />
          </mesh>
          {h.lit > 0.68 && (
            <mesh position={[-h.side * 4.02, 2.2 + h.lit * 3, (h.lit - 0.8) * 3]} rotation-y={(-h.side * Math.PI) / 2}>
              <planeGeometry args={[0.9, 1.4]} />
              <meshBasicMaterial color="#e2a93a" toneMapped={false} />
            </mesh>
          )}
        </group>
      ))}
    </>
  );
}

function Reeds() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const blades = useMemo(() => {
    const r = rng(7);
    const out: { x: number; z: number; h: number; tilt: number; yaw: number }[] = [];
    for (const reed of COURSE.reeds) {
      for (let i = 0; i < 110; i++) {
        const a = r() * Math.PI * 2;
        const d = Math.sqrt(r()) * reed.r;
        const x = reed.x + Math.cos(a) * d;
        if (Math.abs(x) > HW - 0.1) continue;
        out.push({ x, z: reed.z + Math.sin(a) * d, h: 1.3 + r() * 1.1, tilt: (r() - 0.5) * 0.3, yaw: r() * 6 });
      }
    }
    return out;
  }, []);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    blades.forEach((b, i) => {
      e.set(b.tilt, b.yaw, b.tilt * 0.6);
      q.setFromEuler(e);
      m.compose(new THREE.Vector3(b.x, b.h / 2 - 0.05, b.z), q, new THREE.Vector3(1, b.h, 1));
      ref.current!.setMatrixAt(i, m);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [blades]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, blades.length]} frustumCulled={false}>
      <coneGeometry args={[0.1, 1, 4]} />
      <meshStandardMaterial color="#9aa562" roughness={0.9} />
    </instancedMesh>
  );
}

function Bridge() {
  const white = <meshStandardMaterial color="#d8d5c9" roughness={0.8} />;
  return (
    <group position={[0, 0, COURSE.bridgeZ]}>
      <mesh position={[0, 1.3, 0]}>
        <boxGeometry args={[HW * 2 + 3, 0.3, 3.2]} />
        <meshStandardMaterial color="#6b5540" roughness={0.9} />
      </mesh>
      {[-1.5, 1.5].map((z) => (
        <mesh key={z} position={[0, 1.95, z]}>
          <boxGeometry args={[HW * 2 + 3, 0.1, 0.1]} />
          {white}
        </mesh>
      ))}
      {[-1, 1].map((s) =>
        [-1.5, 1.5].map((z) => (
          <mesh key={`${s}${z}`} position={[s * (HW + 0.6), 3.4, z]}>
            <boxGeometry args={[0.3, 4.6, 0.3]} />
            {white}
          </mesh>
        )),
      )}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (HW + 0.6), 5.6, 0]}>
          <boxGeometry args={[0.3, 0.3, 3.4]} />
          {white}
        </mesh>
      ))}
    </group>
  );
}

function Lock() {
  return (
    <group position={[0, 0, COURSE.lockZ]}>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (HW / 2), 0.5, s * 0.5]} rotation-y={s * 0.2}>
          <boxGeometry args={[HW + 0.3, 3, 0.4]} />
          <meshStandardMaterial color="#5e4630" roughness={0.9} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (HW + 1), 0.8, 0]}>
          <boxGeometry args={[2.2, 3.6, 4]} />
          <meshStandardMaterial color="#86837b" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[HW + 1, 3.2, 0]}>
        <sphereGeometry args={[0.22, 10, 8]} />
        <meshBasicMaterial color="#ffd27a" toneMapped={false} />
      </mesh>
    </group>
  );
}

export function CanalWorld() {
  return (
    <group>
      <Water />
      <Quays />
      <Houses />
      <Reeds />
      <Bridge />
      <Lock />
    </group>
  );
}

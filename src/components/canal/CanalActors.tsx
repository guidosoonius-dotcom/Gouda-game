"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useModel } from "./Kit";
import type { Sim } from "./sim";

export interface Fx {
  /** Ring spawn requests (oar strokes, wake), consumed by the scene. */
  rings: { x: number; z: number; loud: number }[];
  oar: { L: number; R: number };
}

const RINGS = 16;
const STROKE = 0.55;

/** The rowboat and its crew, the ripples they leave, and the camera that follows them. */
export function CanalActors({ sim, fx }: { sim: React.RefObject<Sim>; fx: React.RefObject<Fx> }) {
  const boat = useRef<THREE.Group>(null);
  const schouw = useModel("schouw");
  const part = useMemo(
    () => ({
      L: schouw.getObjectByName("OarL")!,
      R: schouw.getObjectByName("OarR")!,
      rower: schouw.getObjectByName("Rower")!,
      passenger: schouw.getObjectByName("Passenger")!,
    }),
    [schouw],
  );
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  const ringState = useRef(Array.from({ length: RINGS }, () => ({ age: 9, loud: 0 })));
  const ringNext = useRef(0);
  const wake = useRef(0);
  const duck = useRef(0);
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(0, 0, -4.7));

  useFrame((_, delta) => {
    const s = sim.current;
    const dt = Math.min(delta, 0.05);
    const t = s.t;

    // Oars: catch at the bow, pull through the water, lift and swing back.
    let lean = 0;
    let heel = 0;
    for (const side of ["L", "R"] as const) {
      const sign = side === "L" ? -1 : 1;
      const p = (t - fx.current.oar[side]) / STROKE;
      const sweep = p < 1 ? 0.55 * Math.cos(p * Math.PI) : p < 1.8 ? -0.55 * (1 - (p - 1) / 0.8) : 0;
      part[side].rotation.set(0, sign * sweep, sign * (p < 1 ? -0.1 : 0.16));
      if (p < 1.8) lean = sweep * 0.55;
      if (p < 1) heel += sign * Math.sin(p * Math.PI) * 0.045;
    }
    // The rower throws his back into it; both duck when they hide or the light finds them.
    const hiding = s.hidden || s.underBridge || s.lit || s.status === "caught" ? 1 : 0;
    duck.current += (hiding - duck.current) * (1 - Math.exp(-6 * dt));
    part.rower.rotation.x = lean + duck.current * 0.35;
    part.rower.scale.y = 1 - duck.current * 0.12;
    part.passenger.rotation.x = -(0.08 + duck.current * 0.5) + Math.sin(t * 0.9) * 0.02;
    part.passenger.scale.y = 1 - duck.current * 0.2;

    if (boat.current) {
      boat.current.position.set(s.x, Math.sin(t * 1.7) * 0.03, s.z);
      boat.current.rotation.set(Math.sin(t * 1.3) * 0.02 - s.v * 0.006, -s.heading, -s.yawRate * 0.12 + heel);
    }

    // Wake: small rings shed from the stern while the boat is under way.
    wake.current += dt;
    if (s.v > 0.9 && wake.current > 0.42) {
      wake.current = 0;
      fx.current.rings.push({ x: s.x - Math.sin(s.heading) * 1.9, z: s.z + Math.cos(s.heading) * 1.9, loud: 0.05 + s.v * 0.035 });
    }
    for (const req of fx.current.rings.splice(0)) {
      const i = ringNext.current++ % RINGS;
      ringState.current[i] = { age: 0, loud: req.loud };
      rings.current[i]?.position.set(req.x, 0.02, req.z);
    }
    ringState.current.forEach((r, i) => {
      r.age += dt;
      const m = rings.current[i];
      if (!m) return;
      const k = Math.min(1, r.age / 2.2);
      m.visible = k < 1;
      m.scale.setScalar(0.4 + k * (1.6 + r.loud * 2.2));
      (m.material as THREE.MeshBasicMaterial).opacity = (1 - k) * (0.18 + r.loud * 0.4);
    });

    // Camera: looks down the canal over the boat, smoothed independent of frame rate.
    const ease = 1 - Math.exp(-3.2 * dt);
    camera.position.x += (s.x * 0.3 - camera.position.x) * ease;
    camera.position.z += (s.z + 13 - camera.position.z) * ease;
    look.current.x += (s.x * 0.3 - look.current.x) * ease;
    look.current.z += (s.z - 4.7 - look.current.z) * ease;
    camera.lookAt(look.current);
  });

  return (
    <>
      <group ref={boat}>
        <primitive object={schouw} />
      </group>
      {Array.from({ length: RINGS }, (_, i) => (
        <mesh key={i} ref={(m) => void (rings.current[i] = m)} rotation-x={-Math.PI / 2} visible={false}>
          <ringGeometry args={[0.82, 1, 28]} />
          <meshBasicMaterial color="#dde6ea" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

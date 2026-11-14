"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { MODELS, Model, useModel } from "./Kit";
import { COURSE, type Sim } from "./sim";

export interface Fx {
  /** Ring spawn requests from oar strokes, consumed by the scene. */
  rings: { x: number; z: number; loud: number }[];
  oar: { L: number; R: number };
}

const RINGS = 10;
const GUARD_POS: [number, number, number] = [2, 1.3, COURSE.bridgeZ];
const GUARD = new THREE.Vector3(2.33, 2.44, COURSE.bridgeZ + 0.5);
const LOCK_LAMP = new THREE.Vector3(COURSE.halfWidth + 1.2, 4.67, COURSE.lockZ + 2);
const UP = new THREE.Vector3(0, 1, 0);

/** Translucent cone from a lamp to a point on the water. */
function useCone(radius: number) {
  const ref = useRef<THREE.Mesh>(null);
  const aim = (from: THREE.Vector3, to: THREE.Vector3) => {
    const m = ref.current;
    if (!m) return;
    const dir = to.clone().sub(from);
    const len = dir.length();
    m.position.copy(from).addScaledVector(dir, 0.5);
    m.quaternion.setFromUnitVectors(UP, dir.normalize().negate());
    m.scale.set(radius, len, radius);
  };
  return { ref, aim };
}

export function CanalActors({ sim, fx }: { sim: React.RefObject<Sim>; fx: React.RefObject<Fx> }) {
  const boat = useRef<THREE.Group>(null);
  const schouw = useModel(MODELS.schouw);
  const oars = useMemo(() => ({ L: schouw.getObjectByName("OarL")!, R: schouw.getObjectByName("OarR")! }), [schouw]);
  const beamDisc = useRef<THREE.Mesh>(null);
  const beamLight = useRef<THREE.SpotLight>(null);
  const band = useRef<THREE.Group>(null);
  const bandLight = useRef<THREE.PointLight>(null);
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  const ringState = useRef(Array.from({ length: RINGS }, () => ({ age: 9, loud: 0 })));
  const ringNext = useRef(0);
  const beamCone = useCone(COURSE.beam.radius);
  const bandCone = useCone(COURSE.band.half);
  const target = useMemo(() => new THREE.Object3D(), []);
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(0, 0, -6));

  useFrame((_, delta) => {
    const s = sim.current;
    const dt = Math.min(delta, 0.05);
    const t = s.t;

    // Boat: bob, lean into the turn, duck when hidden.
    if (boat.current) {
      boat.current.position.set(s.x, Math.sin(t * 1.7) * 0.03, s.z);
      boat.current.rotation.set(Math.sin(t * 1.3) * 0.02, -s.heading, -s.yawRate * 0.12);
    }
    // Oars: catch at the bow, pull through the water, lift and swing back.
    for (const side of ["L", "R"] as const) {
      const sign = side === "L" ? -1 : 1;
      const p = (t - fx.current.oar[side]) / 0.55;
      const sweep = p < 1 ? 0.55 * Math.cos(p * Math.PI) : p < 1.8 ? -0.55 * (1 - (p - 1) / 0.8) : 0;
      oars[side].rotation.set(0, sign * sweep, sign * (p < 1 ? -0.1 : 0.16));
    }

    // Ripples
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

    // Bridge guard's searchlight
    const b = new THREE.Vector3(s.beam.x, 0.03, s.beam.z);
    beamDisc.current?.position.copy(b);
    beamCone.aim(GUARD, b);
    target.position.copy(b);
    target.updateMatrixWorld();
    if (beamLight.current) beamLight.current.intensity = 420 + Math.sin(t * 9) * 12;

    // Lock lamp: a band of light across the whole canal
    band.current?.position.set(0, 0.03, s.bandZ);
    bandLight.current?.position.set(0, 2.2, s.bandZ);
    bandCone.aim(LOCK_LAMP, new THREE.Vector3(0, 0.03, s.bandZ));

    // Camera: high three-quarter view that looks ahead, smoothed independent of frame rate.
    const ease = 1 - Math.exp(-3.2 * dt);
    camera.position.x += (s.x * 0.3 - camera.position.x) * ease;
    camera.position.z += (s.z + 10.5 - camera.position.z) * ease;
    look.current.x += (s.x * 0.3 - look.current.x) * ease;
    look.current.z += (s.z - 3.2 - look.current.z) * ease;
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

      {/* Guard and searchlight */}
      <Model url={MODELS.wacht} position={GUARD_POS} />
      <primitive object={target} />
      <spotLight ref={beamLight} position={GUARD} target={target} color="#ffd27a" angle={0.2} penumbra={0.55} distance={70} decay={1.6} />
      <mesh ref={beamCone.ref}>
        <cylinderGeometry args={[0.04, 1, 1, 20, 1, true]} />
        <meshBasicMaterial color="#ffd98a" transparent opacity={0.06} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={beamDisc} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[COURSE.beam.radius, 32]} />
        <meshBasicMaterial color="#ffd98a" transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      <group ref={band}>
        <mesh rotation-x={-Math.PI / 2}>
          <planeGeometry args={[COURSE.halfWidth * 2, COURSE.band.half * 2]} />
          <meshBasicMaterial color="#ffd98a" transparent opacity={0.16} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
          <planeGeometry args={[COURSE.halfWidth * 2, COURSE.band.half * 0.9]} />
          <meshBasicMaterial color="#fff0c4" transparent opacity={0.14} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>
      <pointLight ref={bandLight} color="#ffd27a" intensity={38} distance={9} decay={1.8} />
      <mesh ref={bandCone.ref}>
        <cylinderGeometry args={[0.04, 1, 1, 4, 1, true]} />
        <meshBasicMaterial color="#ffd98a" transparent opacity={0.05} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
    </>
  );
}

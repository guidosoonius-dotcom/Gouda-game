"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { COURSE, type Sim } from "./sim";

export interface Fx {
  /** Ring spawn requests from oar strokes, consumed by the scene. */
  rings: { x: number; z: number; loud: number }[];
  oar: { L: number; R: number };
}

const RINGS = 10;
const GUARD = new THREE.Vector3(2, 2.75, COURSE.bridgeZ);
const LOCK_LAMP = new THREE.Vector3(COURSE.halfWidth + 1, 3.2, COURSE.lockZ);
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
  const oarL = useRef<THREE.Group>(null);
  const oarR = useRef<THREE.Group>(null);
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
    for (const [side, ref] of [["L", oarL], ["R", oarR]] as const) {
      const since = t - fx.current.oar[side];
      const pull = since < 0.5 ? Math.sin((since / 0.5) * Math.PI) : 0;
      if (ref.current) ref.current.rotation.set(0, (side === "L" ? 1 : -1) * (0.5 - pull * 1.1), (side === "L" ? -1 : 1) * (0.2 + pull * 0.25));
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
      {/* Grey-box rowboat; replaced by schouw.glb when the kit lands. */}
      <group ref={boat}>
        <mesh position={[0, 0.16, 0.1]}>
          <boxGeometry args={[1.3, 0.42, 3.2]} />
          <meshStandardMaterial color="#7a5a3a" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.16, -1.95]} rotation-y={Math.PI / 4} scale={[1, 1, 1]}>
          <boxGeometry args={[0.92, 0.42, 0.92]} />
          <meshStandardMaterial color="#7a5a3a" roughness={0.85} />
        </mesh>
        {[0.55, -0.75].map((z, i) => (
          <group key={i} position={[0, 0.5, z]}>
            <mesh position={[0, 0.15, 0]}>
              <capsuleGeometry args={[0.24, 0.42, 3, 8]} />
              <meshStandardMaterial color="#2b313a" roughness={1} />
            </mesh>
            <mesh position={[0, 0.66, 0]}>
              <sphereGeometry args={[0.17, 8, 6]} />
              <meshStandardMaterial color="#3a3531" roughness={1} />
            </mesh>
          </group>
        ))}
        {[["L", oarL, -1], ["R", oarR, 1]].map(([key, ref, side]) => (
          <group key={key as string} ref={ref as React.RefObject<THREE.Group>} position={[(side as number) * 0.66, 0.42, 0.55]}>
            <mesh position={[(side as number) * 1.05, -0.12, 0]}>
              <boxGeometry args={[2.1, 0.06, 0.1]} />
              <meshStandardMaterial color="#a08256" roughness={0.9} />
            </mesh>
          </group>
        ))}
      </group>

      {Array.from({ length: RINGS }, (_, i) => (
        <mesh key={i} ref={(m) => void (rings.current[i] = m)} rotation-x={-Math.PI / 2} visible={false}>
          <ringGeometry args={[0.82, 1, 28]} />
          <meshBasicMaterial color="#dde6ea" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}

      {/* Guard and searchlight */}
      <group position={[GUARD.x, 1.45, GUARD.z]}>
        <mesh position={[0, 0.8, 0]}>
          <capsuleGeometry args={[0.26, 1.1, 3, 8]} />
          <meshStandardMaterial color="#15171a" roughness={1} />
        </mesh>
        <mesh position={[0, 1.3, -0.3]}>
          <sphereGeometry args={[0.12, 8, 6]} />
          <meshBasicMaterial color="#ffe1a0" toneMapped={false} />
        </mesh>
      </group>
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

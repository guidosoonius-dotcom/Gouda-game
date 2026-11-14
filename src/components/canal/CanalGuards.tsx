"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useModel } from "./Kit";
import { HW } from "./layout";
import { COURSE, type Sim } from "./sim";
import { beamTexture, radialTexture } from "./textures";

type SimRef = React.RefObject<Sim>;
const DECK = 1.3;
const LENS = 1.35;
/** Feet of the two searchlights: on the bridge deck and on the lock head. */
const POST_A = new THREE.Vector3(1.6, DECK, COURSE.bridgeZ + 1.05);
const POST_B = new THREE.Vector3(HW + 1.2, 1.6, COURSE.lockZ + 1.5);
const UP = new THREE.Vector3(0, 1, 0);
const turn = (from: number, to: number) => Math.atan2(Math.sin(to - from), Math.cos(to - from));

function useSoldier() {
  const obj = useModel("soldaat");
  const legs = useMemo(() => [obj.getObjectByName("LegL")!, obj.getObjectByName("LegR")!], [obj]);
  return { obj, legs };
}

/** A searchlight on its tripod and the soldier who swings it: he steps around it as it turns. */
function Post({ foot, aim }: { foot: THREE.Vector3; aim: React.RefObject<THREE.Vector3> }) {
  const lamp = useModel("zoeklicht");
  const head = useMemo(() => lamp.getObjectByName("Head")!, [lamp]);
  const { obj, legs } = useSoldier();
  const yaw = useRef(0);
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    head.lookAt(aim.current);
    const step = turn(yaw.current, Math.atan2(aim.current.x - foot.x, aim.current.z - foot.z)) * (1 - Math.exp(-4 * dt));
    yaw.current += step;
    obj.position.set(foot.x - Math.sin(yaw.current) * 0.85, foot.y, foot.z - Math.cos(yaw.current) * 0.85);
    obj.rotation.set(0, yaw.current, Math.sin(clock.elapsedTime * 0.8) * 0.025);
    // small side-steps while he swings the lamp
    const shuffle = Math.max(-0.4, Math.min(0.4, (step / dt) * 0.35)) * Math.sin(clock.elapsedTime * 7);
    legs[0].rotation.x = shuffle;
    legs[1].rotation.x = -shuffle;
  });
  return (
    <>
      <primitive object={lamp} position={foot} />
      <primitive object={obj} />
    </>
  );
}

/** A sentry pacing the bridge. He stops to look over the railing, and turns when he hears oars. */
function Patrol({ sim }: { sim: SimRef }) {
  const { obj, legs } = useSoldier();
  const st = useRef({ x: -4.2, dir: 1, pause: 1.5, phase: 0, yaw: Math.PI / 2, look: 0 });
  const ember = useRef<THREE.Mesh>(null);
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = sim.current;
    const a = st.current;
    const heard = s.t < s.alertUntil && s.z < COURSE.beam.alertFrom && s.z > COURSE.beam.alertTo;
    let walking = false;
    let want = a.yaw;
    if (heard) {
      want = Math.atan2(s.x - a.x, s.z - COURSE.bridgeZ);
    } else if (a.pause > 0) {
      a.pause -= dt;
      want = a.look;
    } else {
      walking = true;
      a.x += a.dir * 0.85 * dt;
      want = (a.dir * Math.PI) / 2;
      if (a.x > 0.3 || a.x < -4.2) {
        a.x = Math.max(-4.2, Math.min(0.3, a.x));
        a.dir *= -1;
        a.pause = 2.5 + Math.random() * 3;
        a.look = Math.random() < 0.7 ? 0 : Math.PI;
      }
    }
    a.yaw += turn(a.yaw, want) * (1 - Math.exp(-5 * dt));
    if (walking) a.phase += dt * 5.4;
    const swing = walking ? Math.sin(a.phase) * 0.5 : 0;
    const k = 1 - Math.exp(-10 * dt);
    legs[0].rotation.x += (swing - legs[0].rotation.x) * k;
    legs[1].rotation.x += (-swing - legs[1].rotation.x) * k;
    obj.position.set(a.x, DECK + (walking ? Math.abs(Math.sin(a.phase)) * 0.025 : 0), COURSE.bridgeZ - 0.45);
    obj.rotation.y = a.yaw;
    // the ember of his cigarette, brighter when he draws on it
    if (ember.current) {
      ember.current.visible = !walking && !heard;
      ember.current.scale.setScalar(0.7 + 1.3 * Math.max(0, Math.sin(clock.elapsedTime * 0.9)) ** 10);
    }
  });
  return (
    <primitive object={obj}>
      <mesh ref={ember} position={[0.06, 1.55, 0.13]}>
        <sphereGeometry args={[0.022, 6, 4]} />
        <meshBasicMaterial color="#ff7a2a" toneMapped={false} />
      </mesh>
    </primitive>
  );
}

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

/** The soldiers, their searchlights and the light itself. */
export function CanalGuards({ sim }: { sim: SimRef }) {
  const beam = useMemo(beamTexture, []);
  const flare = useMemo(radialTexture, []);
  const aimA = useRef(new THREE.Vector3(0, 0.03, COURSE.beam.zNear));
  const aimB = useRef(new THREE.Vector3(0, 0.03, COURSE.band.zNear));
  const lensA = useMemo(() => POST_A.clone().setY(POST_A.y + LENS), []);
  const lensB = useMemo(() => POST_B.clone().setY(POST_B.y + LENS), []);
  const disc = useRef<THREE.Group>(null);
  const band = useRef<THREE.Group>(null);
  const spot = useRef<THREE.SpotLight>(null);
  const point = useRef<THREE.PointLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const coneA = useCone(COURSE.beam.radius);
  const coneB = useCone(COURSE.band.half);

  useFrame(({ clock }) => {
    const s = sim.current;
    aimA.current.set(s.beam.x, 0.03, s.beam.z);
    aimB.current.set(0, 0.03, s.bandZ);
    disc.current?.position.copy(aimA.current);
    band.current?.position.copy(aimB.current);
    coneA.aim(lensA, aimA.current);
    coneB.aim(lensB, aimB.current);
    target.position.copy(aimA.current);
    target.updateMatrixWorld();
    if (spot.current) spot.current.intensity = 430 + Math.sin(clock.elapsedTime * 9) * 14;
    point.current?.position.set(0, 2.2, s.bandZ);
  });

  const glow = { color: "#ffd98a", transparent: true, depthWrite: false, blending: THREE.AdditiveBlending } as const;
  return (
    <>
      <Post foot={POST_A} aim={aimA} />
      <Post foot={POST_B} aim={aimB} />
      <Patrol sim={sim} />

      <primitive object={target} />
      <spotLight ref={spot} position={lensA} target={target} color="#ffd27a" angle={0.2} penumbra={0.55} distance={75} decay={1.6} />
      <pointLight ref={point} color="#ffd27a" intensity={40} distance={9} decay={1.8} />
      {[lensA, lensB].map((p, i) => (
        <sprite key={i} position={p} scale={1.25}>
          <spriteMaterial map={flare} {...glow} opacity={0.6} />
        </sprite>
      ))}
      <mesh ref={coneA.ref}>
        <cylinderGeometry args={[0.05, 1, 1, 24, 1, true]} />
        <meshBasicMaterial {...glow} alphaMap={beam} opacity={0.13} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={coneB.ref}>
        <cylinderGeometry args={[0.05, 1, 1, 20, 1, true]} />
        <meshBasicMaterial {...glow} alphaMap={beam} opacity={0.06} side={THREE.DoubleSide} />
      </mesh>
      <group ref={disc}>
        <mesh rotation-x={-Math.PI / 2}>
          <circleGeometry args={[COURSE.beam.radius, 36]} />
          <meshBasicMaterial {...glow} opacity={0.17} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
          <circleGeometry args={[COURSE.beam.radius * 0.62, 28]} />
          <meshBasicMaterial {...glow} color="#fff0c4" opacity={0.13} />
        </mesh>
      </group>
      <group ref={band}>
        <mesh rotation-x={-Math.PI / 2}>
          <planeGeometry args={[COURSE.halfWidth * 2, COURSE.band.half * 2]} />
          <meshBasicMaterial {...glow} opacity={0.16} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
          <planeGeometry args={[COURSE.halfWidth * 2, COURSE.band.half * 0.9]} />
          <meshBasicMaterial {...glow} color="#fff0c4" opacity={0.14} />
        </mesh>
      </group>
    </>
  );
}

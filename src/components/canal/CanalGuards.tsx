"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TUNING } from "@/game/tuning";
import { useFigure } from "./Figure";
import { stand } from "./poses";
import { spotOnly, useModel } from "./Kit";
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

const HAND = new THREE.Vector3();
const POLE = new THREE.Vector3();
const TMP = new THREE.Vector3();

/** A searchlight on its tripod and the soldier who swings it: he steps around it as it turns. */
export function Post({ foot, aim }: { foot: THREE.Vector3; aim: React.RefObject<THREE.Vector3> }) {
  const lamp = useModel("zoeklicht");
  const head = useMemo(() => lamp.getObjectByName("Head")!, [lamp]);
  const fig = useFigure("soldaat");
  const st = useRef({ yaw: 0, phase: 0, step: 0 });
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const a = st.current;
    head.lookAt(aim.current);
    const step = turn(a.yaw, Math.atan2(aim.current.x - foot.x, aim.current.z - foot.z)) * (1 - Math.exp(-4 * dt));
    a.yaw += step;
    fig.root.position.set(foot.x - Math.sin(a.yaw) * 0.78, foot.y, foot.z - Math.cos(a.yaw) * 0.78);
    fig.root.rotation.set(0, a.yaw, 0);
    // he shuffles around the tripod while he swings the lamp, and stands still when it rests
    a.step += (Math.min(1, Math.abs(step / dt) * 2.4) - a.step) * (1 - Math.exp(-6 * dt));
    a.phase += dt * (0.5 + a.step * 0.7);
    fig.begin();
    fig.clip("walk", a.phase, a.step * 0.55);
    fig.turn("Spine", fig.dir(1, 0, 0, TMP), 0.1 + Math.sin(clock.elapsedTime * 0.8) * 0.02);
    // both hands on the grips at the back of the lamp
    for (const side of ["Left", "Right"] as const) {
      const out = side === "Left" ? 1 : -1;
      HAND.copy(fig.root.position).add(fig.dir(out * 0.17, 0, 0, TMP).multiplyScalar(0.17));
      HAND.addScaledVector(fig.dir(0, 0, 1, TMP), 0.44).setY(foot.y + 1.24);
      fig.reach("Arm", side, HAND, fig.dir(out, -0.8, -0.3, POLE));
    }
  });
  return (
    <>
      <primitive object={lamp} position={foot} />
      <primitive object={fig.root} />
    </>
  );
}

/** A sentry pacing the bridge. He stops for a smoke, and turns when he hears oars. */
function Patrol({ sim }: { sim: SimRef }) {
  const fig = useFigure("soldaat");
  const st = useRef({ x: -4.2, dir: 1, pause: 1.5, phase: 0, yaw: Math.PI / 2, look: 0, walk: 0, smoke: 0 });
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
    if (walking) a.phase += dt * 0.8;
    const k = 1 - Math.exp(-6 * dt);
    a.walk += ((walking ? 1 : 0) - a.walk) * k;
    const smoking = !walking && !heard;
    // he lifts the cigarette to his mouth every few seconds
    const draw = smoking ? Math.max(0, Math.sin(clock.elapsedTime * 0.9)) ** 3 : 0;
    a.smoke += (draw - a.smoke) * k;
    fig.root.position.set(a.x, DECK, COURSE.bridgeZ - 0.45);
    fig.root.rotation.y = a.yaw;
    fig.begin();
    fig.clip("walk", a.phase, a.walk);
    fig.blend(1 - a.walk, stand);
    if (a.smoke > 0.01) {
      fig.at("Head", HAND).addScaledVector(fig.dir(-0.25, -0.35, 1, TMP), 0.13);
      fig.at("RightHand", TMP).lerp(HAND, a.smoke);
      fig.reach("Arm", "Right", TMP, fig.dir(-1, -0.6, 0.2, POLE));
    }
    if (ember.current) {
      ember.current.visible = smoking;
      fig.at("RightHand", ember.current.position).addScaledVector(fig.dir(-0.1, -0.5, 1, TMP), 0.09);
      ember.current.scale.setScalar(0.7 + 1.6 * draw);
    }
  });
  return (
    <>
      <primitive object={fig.root} />
      <mesh ref={ember}>
        <sphereGeometry args={[0.022, 6, 4]} />
        <meshBasicMaterial color="#ff7a2a" toneMapped={false} />
      </mesh>
    </>
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
      <spotLight ref={(l) => (spotOnly(l), void (spot.current = l))} position={lensA} target={target} color="#ffd27a" angle={0.2} penumbra={0.55} distance={75} decay={1.6} castShadow={TUNING.gfx.spotShadows} shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
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

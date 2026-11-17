"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useFigure } from "@/components/canal/Figure";
import { useModel } from "@/components/canal/Kit";
import { cower, sit, stand } from "@/components/canal/poses";
import { STREET, type BikeSim } from "./sim";

/** One of the townspeople. Stands dazed, walks behind the bike, or cowers after a blast. */
function Person({ sim, group, index }: { sim: React.RefObject<BikeSim>; group: number; index: number }) {
  const child = index === 2;
  const fig = useFigure(index % 2 ? "vrouw" : "man", child ? 0.62 : 0.94 + index * 0.04);
  const st = useRef({ phase: index * 1.3, walk: 0, cower: 0, yaw: 0 });
  const pos = useRef(new THREE.Vector3(STREET.groups[group].x, 0, STREET.groups[group].z));
  const side = (index - 1) * 0.75;
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const a = st.current;
    const g = sim.current.groups[group];
    const tx = g.x + side;
    const tz = g.z + index * 0.7;
    const dist = Math.hypot(tx - pos.current.x, tz - pos.current.z);
    const walking = dist > 0.15;
    const scared = g.state === "scared";
    const k = 1 - Math.exp(-(scared ? 5 : 2.2) * dt);
    pos.current.x += (tx - pos.current.x) * k;
    pos.current.z += (tz - pos.current.z) * k;
    if (walking) {
      a.phase += dt * (scared ? 1.2 : 0.95);
      a.yaw = Math.atan2(tx - pos.current.x, tz - pos.current.z);
    }
    const ease = 1 - Math.exp(-8 * dt);
    a.walk += ((walking ? 1 : 0) - a.walk) * ease;
    a.cower += ((scared && !walking ? 1 : 0) - a.cower) * ease;
    fig.root.position.copy(pos.current);
    fig.root.rotation.y = a.yaw;
    // inside the shelter or with Gerrit: out of the picture
    fig.root.visible = g.state !== "safe" && g.state !== "gerrit";
    if (!fig.root.visible) return;
    fig.begin();
    fig.clip(scared ? "run" : "walk", a.phase, a.walk);
    fig.blend((1 - a.walk) * (1 - a.cower), stand);
    fig.blend((1 - a.walk) * a.cower, cower);
  });
  return <primitive object={fig.root} />;
}

/** Where the rider touches the bicycle, in the bicycle's own frame (it points toward -Z). */
const SADDLE = new THREE.Vector3(0, 1.04, 0.4);
const CRANK = { y: 0.31, z: 0.2, r: 0.165, x: 0.11 };
const GRIP = { x: 0.24, y: 1.08, z: -0.33 };
const FEET: [THREE.Vector3, THREE.Vector3] = [new THREE.Vector3(), new THREE.Vector3()];
const SEAT = new THREE.Vector3();
const HAND = new THREE.Vector3();
const POLE = new THREE.Vector3();

/** A rider on an old Dutch bicycle: on the saddle, hands on the bars, feet going round on the pedals. */
function Rider({ follow, scale = 1 }: { follow: (out: { x: number; z: number; v: number; lean: number }) => void; scale?: number }) {
  const bike = useModel("fiets");
  const fig = useFigure("koerier", scale);
  const group = useRef<THREE.Group>(null);
  const state = useRef({ x: 0, z: 0, v: 0, lean: 0 });
  const pedal = useRef(0);
  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    follow(state.current);
    const s = state.current;
    pedal.current += Math.min(delta, 0.05) * s.v * 2.2;
    g.position.set(s.x, 0, s.z);
    g.rotation.set(0, -s.lean * 0.5, -s.lean * 0.22);
    g.updateMatrixWorld(true);
    fig.begin();
    // the ankles ride a little above and behind the pedals, half a turn apart
    FEET.forEach((foot, i) => {
      const turn = pedal.current + i * Math.PI;
      g.localToWorld(foot.set((i ? -1 : 1) * CRANK.x, CRANK.y + Math.cos(turn) * CRANK.r + 0.09, CRANK.z + Math.sin(turn) * CRANK.r + 0.06));
    });
    sit(fig, g.localToWorld(SEAT.copy(SADDLE)), FEET, 0.9);
    for (const side of ["Left", "Right"] as const) {
      const out = side === "Left" ? 1 : -1;
      // the figure faces -Z, so its left hand is on the bar at -X
      fig.reach("Arm", side, g.localToWorld(HAND.set(-out * GRIP.x, GRIP.y, GRIP.z)), fig.dir(out, -1, -0.3, POLE));
      // knuckles over the grip
      fig.turn(`${side}Hand`, fig.dir(1, 0, 0, POLE), 1.1);
    }
  });
  return (
    <group ref={group}>
      <primitive object={bike} />
      <primitive object={fig.root} rotation-y={Math.PI} />
    </group>
  );
}

const SIDE_VIEW = process.env.NODE_ENV !== "production" && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("cam") === "side";

export function BikeActors({ sim, kees, shake }: { sim: React.RefObject<BikeSim>; kees: boolean; shake: React.RefObject<number> }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(0, 3.6, -14));
  const prevX = useRef(0);
  const lean = useRef(0);
  const baseX = useRef(0);
  // no camera shake for players who asked the system for less motion
  const still = useRef(typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useFrame((_, delta) => {
    const s = sim.current;
    const dt = Math.min(delta, 0.05);
    lean.current += (Math.max(-1, Math.min(1, (s.x - prevX.current) / dt / 3)) - lean.current) * (1 - Math.exp(-8 * dt));
    prevX.current = s.x;
    // Camera behind and above the bike; it shakes when a bomb lands.
    shake.current = Math.max(0, shake.current - dt * 1.6);
    // trauma squared: a near miss shakes hard, the tail dies away gently; smooth sines rather than a
    // fresh random number each frame, which buzzes and depends on the frame rate
    const now = performance.now() / 1000;
    const j = still.current ? 0 : shake.current * shake.current * 0.5;
    const shakeX = j * (Math.sin(now * 37) * 0.6 + Math.sin(now * 23 + 1.3) * 0.4);
    const shakeY = j * (Math.sin(now * 31 + 0.7) * 0.6 + Math.sin(now * 19 + 2.1) * 0.4);
    const ease = 1 - Math.exp(-3.2 * dt);
    // the shake is added on top of a separate base, so it never builds up into a drift
    baseX.current += (s.x * 0.4 - baseX.current) * ease;
    camera.position.x = baseX.current;
    // a little handheld sway, and the view dips lower the faster you ride
    const sway = Math.sin(now / 0.7) * 0.06 * (0.4 + s.v * 0.12);
    camera.position.y = 5.8 - Math.min(1, s.v / 5) * 0.5 + sway + shakeY;
    camera.position.z += (s.z + 11.4 - camera.position.z) * ease;
    look.current.x += (s.x * 0.4 - look.current.x) * ease;
    look.current.y = 3.6;
    look.current.z += (s.z - 14 - look.current.z) * ease;
    camera.lookAt(look.current);
    camera.position.x = baseX.current + shakeX;
    // Dev aid: /?bike=1&cam=side looks at the rider from the side (ignored in production builds).
    if (SIDE_VIEW) {
      camera.position.set(s.x + 3.2, 1.5, s.z - 1.2);
      camera.lookAt(s.x, 1.0, s.z);
    }
  });

  return (
    <>
      <Rider follow={(o) => Object.assign(o, { x: sim.current.x, z: sim.current.z, v: sim.current.v, lean: lean.current })} />
      {kees && <Rider scale={0.88} follow={(o) => Object.assign(o, { x: sim.current.x * 0.8 + 1.5, z: sim.current.z + 3.4, v: sim.current.v, lean: lean.current * 0.7 })} />}
      {STREET.groups.map((g, gi) => Array.from({ length: g.n }, (_, i) => <Person key={`${gi}-${i}`} sim={sim} group={gi} index={i} />))}
    </>
  );
}

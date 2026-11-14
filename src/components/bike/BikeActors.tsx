"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useModel, type ModelName } from "@/components/canal/Kit";
import { STREET, type BikeSim } from "./sim";

function useFigure(name: ModelName, scale = 1) {
  const obj = useModel(name);
  const legs = useMemo(() => [obj.getObjectByName("LegL")!, obj.getObjectByName("LegR")!], [obj]);
  useMemo(() => obj.scale.setScalar(scale), [obj, scale]);
  return { obj, legs };
}

/** One of the townspeople. Stands dazed, walks behind the bike, or cowers after a blast. */
function Person({ sim, group, index }: { sim: React.RefObject<BikeSim>; group: number; index: number }) {
  const child = index === 2;
  const { obj, legs } = useFigure(index % 2 ? "vrouw" : "man", child ? 0.62 : 0.94 + index * 0.04);
  const phase = useRef(index * 1.3);
  const pos = useRef(new THREE.Vector3(STREET.groups[group].x, 0, STREET.groups[group].z));
  const side = (index - 1) * 0.75;
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const g = sim.current.groups[group];
    const tx = g.x + side;
    const tz = g.z + index * 0.7;
    const dist = Math.hypot(tx - pos.current.x, tz - pos.current.z);
    const walking = dist > 0.15;
    const k = 1 - Math.exp(-(g.state === "scared" ? 5 : 2.2) * dt);
    pos.current.x += (tx - pos.current.x) * k;
    pos.current.z += (tz - pos.current.z) * k;
    if (walking) phase.current += dt * (g.state === "scared" ? 14 : 8);
    const swing = walking ? Math.sin(phase.current) * 0.6 : 0;
    legs[0].rotation.x = swing;
    legs[1].rotation.x = -swing;
    obj.position.copy(pos.current);
    obj.rotation.y = walking ? Math.atan2(tx - pos.current.x, tz - pos.current.z) : obj.rotation.y;
    // inside the shelter or with Gerrit: out of the picture
    obj.visible = g.state !== "safe" && g.state !== "gerrit";
    obj.scale.y = obj.scale.x * (g.state === "scared" && !walking ? 0.78 : 1);
  });
  return <primitive object={obj} />;
}

/** A rider on an old Dutch bicycle; the legs pedal with the speed. */
function Rider({ follow }: { follow: (out: { x: number; z: number; v: number; lean: number }) => void }) {
  const bike = useModel("fiets");
  const { obj, legs } = useFigure("koerier");
  const group = useRef<THREE.Group>(null);
  const state = useRef({ x: 0, z: 0, v: 0, lean: 0 });
  const pedal = useRef(0);
  useFrame((_, delta) => {
    follow(state.current);
    const s = state.current;
    pedal.current += Math.min(delta, 0.05) * s.v * 2.2;
    legs[0].rotation.x = -0.9 + Math.sin(pedal.current) * 0.5;
    legs[1].rotation.x = -0.9 - Math.sin(pedal.current) * 0.5;
    group.current?.position.set(s.x, 0, s.z);
    group.current?.rotation.set(0, -s.lean * 0.5, -s.lean * 0.22);
  });
  return (
    <group ref={group}>
      <primitive object={bike} />
      <group position={[0, 0.2, 0.3]} rotation={[-0.3, Math.PI, 0]}>
        <primitive object={obj} />
      </group>
    </group>
  );
}

export function BikeActors({ sim, kees, shake }: { sim: React.RefObject<BikeSim>; kees: boolean; shake: React.RefObject<number> }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(0, 0.5, -5));
  const prevX = useRef(0);
  const lean = useRef(0);

  useFrame((_, delta) => {
    const s = sim.current;
    const dt = Math.min(delta, 0.05);
    lean.current += (Math.max(-1, Math.min(1, (s.x - prevX.current) / dt / 3)) - lean.current) * (1 - Math.exp(-8 * dt));
    prevX.current = s.x;
    // Camera behind and above the bike; it shakes when a bomb lands.
    shake.current = Math.max(0, shake.current - dt * 1.6);
    const j = shake.current * 0.45;
    const ease = 1 - Math.exp(-3.2 * dt);
    camera.position.x += (s.x * 0.4 - camera.position.x) * ease + (Math.random() - 0.5) * j;
    camera.position.y = 9.5 + (Math.random() - 0.5) * j;
    camera.position.z += (s.z + 11 - camera.position.z) * ease;
    look.current.x += (s.x * 0.4 - look.current.x) * ease;
    look.current.z += (s.z - 5 - look.current.z) * ease;
    camera.lookAt(look.current);
  });

  return (
    <>
      <Rider follow={(o) => Object.assign(o, { x: sim.current.x, z: sim.current.z, v: sim.current.v, lean: lean.current })} />
      {kees && <Rider follow={(o) => Object.assign(o, { x: sim.current.x * 0.8 + 1.5, z: sim.current.z + 3.4, v: sim.current.v, lean: lean.current * 0.7 })} />}
      {STREET.groups.map((g, gi) => Array.from({ length: g.n }, (_, i) => <Person key={`${gi}-${i}`} sim={sim} group={gi} index={i} />))}
    </>
  );
}

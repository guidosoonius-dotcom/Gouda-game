"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useModel } from "@/components/canal/Kit";
import { TUNING } from "@/game/tuning";
import { sfx } from "@/lib/sound";
import { houseAt, ridgeAt } from "./layout";
import type { RoofSim } from "./sim";

interface Runner {
  group: THREE.Group | null;
  y: number;
  house: number;
  hop: number;
  phase: number;
  pose: number;
  flat: number;
}
const runner = (): Runner => ({ group: null, y: ridgeAt(0), house: -1, hop: 1, phase: 0, pose: 1, flat: 0 });

function useFigure(scale: number) {
  const obj = useModel("koerier");
  const legs = useMemo(() => [obj.getObjectByName("LegL")!, obj.getObjectByName("LegR")!], [obj]);
  useMemo(() => obj.scale.setScalar(scale), [obj, scale]);
  return { obj, legs };
}

/** The courier (and Kees), running the ridges, hopping the alleys, ducking and lying flat. */
export function RoofActors({ sim }: { sim: React.RefObject<RoofSim> }) {
  const me = useFigure(1);
  const kees = useFigure(0.84);
  const a = useRef(runner());
  const b = useRef(runner());
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(7, ridgeAt(0) + 0.3, -1.2));

  const animate = (r: Runner, fig: ReturnType<typeof useFigure>, x: number, moving: boolean, flat: boolean, dt: number, steps: boolean) => {
    const house = houseAt(x);
    if (house !== r.house) {
      if (r.house >= 0) r.hop = 0;
      r.house = house;
    }
    r.hop = Math.min(1, r.hop + dt / 0.34);
    r.y += (ridgeAt(x) - r.y) * (1 - Math.exp(-14 * dt));
    const running = moving && !flat;
    if (running) {
      const before = Math.floor(r.phase / Math.PI);
      r.phase += dt * 13;
      if (steps && Math.floor(r.phase / Math.PI) !== before) sfx.step();
    }
    const swing = running ? Math.sin(r.phase) * 0.75 : 0;
    const k = 1 - Math.exp(-12 * dt);
    fig.legs[0].rotation.x += (swing - fig.legs[0].rotation.x) * k;
    fig.legs[1].rotation.x += (-swing - fig.legs[1].rotation.x) * k;
    // crouched behind the chimney, upright while running, prone when lying flat
    r.pose += ((moving ? 1 : 0.72) - r.pose) * k;
    r.flat += ((flat ? 1 : 0) - r.flat) * k;
    fig.obj.rotation.x = r.flat * 1.35 + (running ? 0.18 : 0);
    fig.obj.scale.y = fig.obj.scale.x * r.pose;
    r.group?.position.set(x, r.y + 0.1 + Math.sin(r.hop * Math.PI) * 0.6 + (running ? Math.abs(Math.sin(r.phase)) * 0.05 : 0), moving ? 0.3 : 0.15);
  };

  useFrame((_, delta) => {
    const s = sim.current;
    const dt = Math.min(delta, 0.05);
    animate(a.current, me, s.x, s.moving, s.flat, dt, true);
    if (b.current.group) b.current.group.visible = s.kees;
    if (s.kees) animate(b.current, kees, s.x - (s.moving ? TUNING.rooftop.keesGap : 0.9), s.moving, s.flat, dt, false);

    // Camera: behind and above the courier, looking along the roofs toward the next chimneys.
    const ease = 1 - Math.exp(-2.8 * dt);
    const ridge = a.current.y;
    camera.position.x += (s.x - 12 - camera.position.x) * ease;
    camera.position.y += (ridge + 5.2 - camera.position.y) * ease;
    look.current.x += (s.x + 7 - look.current.x) * ease;
    look.current.y += (ridge + 0.3 - look.current.y) * ease;
    camera.lookAt(look.current);
  });

  return (
    <>
      <group ref={(g) => void (a.current.group = g)} rotation-y={Math.PI / 2}>
        <primitive object={me.obj} />
      </group>
      <group ref={(g) => void (b.current.group = g)} rotation-y={Math.PI / 2} visible={false}>
        <primitive object={kees.obj} />
      </group>
    </>
  );
}

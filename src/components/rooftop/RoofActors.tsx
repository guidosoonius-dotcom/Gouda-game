"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { spotCaster } from "@/components/canal/Kit";
import { type Figure, useFigure } from "@/components/canal/Figure";
import { crouch, leap, prone } from "@/components/canal/poses";
import { TUNING } from "@/game/tuning";
import { sfx } from "@/lib/sound";
import { RIDGE_Z, ridgeAt, roofAt, stride } from "./layout";
import type { RoofSim } from "./sim";

interface Runner {
  group: THREE.Group | null;
  /** Height of the feet, smoothed a little for the camera. */
  y: number;
  air: number;
  /** Seconds into the run clip. */
  phase: number;
  run: number;
  flat: number;
}
const runner = (): Runner => ({ group: null, y: ridgeAt(0), air: 0, phase: 0, run: 0, flat: 0 });
/** Lying flat, the courier slides this far down the front slope, out of sight of the towers. */
const FLAT_DZ = 0.5;
/** Feet on the ridge tiles, not in them. */
const SOLE = 0.06;

const WIDE = process.env.NODE_ENV !== "production" && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("cam") === "wide";

/** The courier (and Kees), running the ridges, jumping the alleys, ducking and lying flat. */
export function RoofActors({ sim }: { sim: React.RefObject<RoofSim> }) {
  const me = useFigure("koerier");
  const kees = useFigure("koerier", 0.84);
  const a = useRef(runner());
  const b = useRef(runner());
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(7, ridgeAt(0) + 0.3, RIDGE_Z));

  const animate = (r: Runner, fig: Figure, x: number, moving: boolean, flat: boolean, dt: number, steps: boolean) => {
    const running = moving && !flat;
    if (running) {
      // two footfalls per cycle of the clip; none in the air
      const half = fig.duration("run") / 2;
      const before = Math.floor(r.phase / half);
      r.phase += dt * (TUNING.rooftop.runSpeed / 4.2);
      if (steps && r.air < 0.05 && Math.floor(r.phase / half) !== before) sfx.step();
    }
    const k = 1 - Math.exp(-12 * dt);
    r.run += ((running ? 1 : 0) - r.run) * k;
    r.flat += ((flat ? 1 : 0) - r.flat) * k;
    const st = stride(x);
    if (steps && r.air > 0.3 && st.air === 0) sfx.step();
    r.air = st.air;
    const dz = FLAT_DZ * r.flat;
    const feet = st.air > 0 ? st.y : roofAt(x, dz);
    r.y += (feet - r.y) * (1 - Math.exp(-20 * dt));
    r.group?.position.set(x, feet + SOLE, RIDGE_Z + dz);
    fig.root.rotation.x = r.flat * 1.42;
    fig.root.position.y = r.flat * 0.16;
    fig.begin();
    fig.clip("run", r.phase, r.run);
    // in the air over an alley: legs split, arms out
    fig.blend(st.air * r.run, (f) => leap(f, Math.min(1, st.gap / 2)));
    // crouched behind the chimney, upright while running, prone when lying flat
    fig.blend((1 - r.run) * (1 - r.flat), crouch);
    fig.blend(r.flat, prone);
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
    // above whatever roof lies between the camera and the courier
    const over = Math.max(ridge, ridgeAt(s.x - 4) - 0.6, ridgeAt(s.x - 9) - 1.2);
    // far behind (a dev start further along): jump there instead of gliding over half the town
    if (Math.abs(s.x - 12 - camera.position.x) > 25) {
      camera.position.set(s.x - 12, over + 5.2, camera.position.z);
      look.current.set(s.x + 7, ridge + 0.3, RIDGE_Z);
    }
    camera.position.y += (over + 5.2 - camera.position.y) * ease;
    look.current.x += (s.x + 7 - look.current.x) * ease;
    look.current.y += (ridge + 0.3 - look.current.y) * ease;
    camera.lookAt(look.current);
    // Dev aid: /?roof=1&cam=wide looks at the row from the street (ignored in production builds).
    if (WIDE) {
      camera.position.set(s.x, 13, 13);
      camera.lookAt(s.x, 10, -1.2);
    }
  });

  return (
    <>
      <group ref={(g) => (spotCaster(g), void (a.current.group = g))} rotation-y={Math.PI / 2}>
        <primitive object={me.root} />
      </group>
      <group ref={(g) => (spotCaster(g), void (b.current.group = g))} rotation-y={Math.PI / 2} visible={false}>
        <primitive object={kees.root} />
      </group>
    </>
  );
}

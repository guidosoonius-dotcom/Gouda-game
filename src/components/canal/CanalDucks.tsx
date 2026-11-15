"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Instanced, place } from "./Kit";
import { COURSE, type Sim } from "./sim";
import { sfx } from "@/lib/sound";

/** Where the ducks spend the night: a few small flocks near the quays. */
const FLOCKS = [
  { x: -2.7, z: -7, n: 2 },
  { x: 2.6, z: -27, n: 3 },
  { x: -2.5, z: -46, n: 2 },
  { x: 2.7, z: -76, n: 2 },
  { x: -2.2, z: -96, n: 3 },
  { x: 2.4, z: -119, n: 2 },
];
const SCARE = 5.5; // metres: closer than this and they paddle away
const EDGE = COURSE.halfWidth - 0.5;

interface Duck { hx: number; hz: number; x: number; z: number; vx: number; vz: number; yaw: number; seed: number; scared: boolean }

/**
 * Mallards dozing on the canal. They circle slowly around their spot and paddle off to the quay when
 * the boat comes close; now and then one of them quacks. Purely for life: they do not change the sim.
 */
export function CanalDucks({ sim }: { sim: React.RefObject<Sim> }) {
  const ducks = useMemo<Duck[]>(
    () =>
      FLOCKS.flatMap((f, fi) =>
        Array.from({ length: f.n }, (_, j) => {
          const x = f.x + (j - 1) * 0.55 * Math.sign(-f.x), z = f.z + j * 0.9;
          return { hx: x, hz: z, x, z, vx: 0, vz: 0, yaw: fi + j * 2, seed: fi * 3.1 + j * 1.7, scared: false };
        }),
      ),
    [],
  );
  const placements = useMemo(() => ducks.map((d) => place(d.x, 0, d.z, { yaw: d.yaw, s: 1.5 })), [ducks]);
  const nextQuack = useRef(4);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = clock.elapsedTime;
    const s = sim.current;
    ducks.forEach((d) => {
      // Drift around home, slowly.
      let ax = (d.hx + Math.sin(t * 0.13 + d.seed) * 0.9 - d.x) * 0.22;
      let az = (d.hz + Math.cos(t * 0.11 + d.seed * 1.7) * 1.3 - d.z) * 0.22;
      const dx = d.x - s.x, dz = d.z - s.z;
      const dist = Math.hypot(dx, dz) || 1;
      d.scared = dist < SCARE;
      if (d.scared) {
        // Away from the boat, mostly sideways, toward the nearest quay.
        const push = ((SCARE - dist) / SCARE) * 3.2;
        ax += Math.sign(dx || d.hx) * push;
        az += (dz / dist) * push * 0.5;
      }
      const damp = Math.exp(-1.4 * dt);
      d.vx = (d.vx + ax * dt) * damp;
      d.vz = (d.vz + az * dt) * damp;
      const speed = Math.hypot(d.vx, d.vz);
      if (speed > 1.3) (d.vx *= 1.3 / speed), (d.vz *= 1.3 / speed);
      d.x = Math.max(-EDGE, Math.min(EDGE, d.x + d.vx * dt));
      d.z += d.vz * dt;
      if (speed > 0.06) {
        // The beak (model +Z) turns toward where the duck swims, the short way round.
        const want = Math.atan2(d.vx, d.vz);
        const diff = Math.atan2(Math.sin(want - d.yaw), Math.cos(want - d.yaw));
        d.yaw += diff * (1 - Math.exp(-3 * dt));
      }
    });
    if (t > nextQuack.current) {
      nextQuack.current = t + 7 + Math.random() * 9;
      const near = ducks.some((d) => Math.abs(d.z - s.z) < 25);
      if (near && s.status === "play") sfx.quack();
    }
  });

  return (
    <Instanced
      name="eend"
      spot
      placements={placements}
      live={(t, out) =>
        ducks.forEach((d, i) =>
          place(d.x, 0.01 + Math.sin(t * 1.6 + d.seed) * 0.012, d.z, { yaw: d.yaw, roll: Math.sin(t * 1.2 + d.seed) * 0.05, s: 1.5 }, out[i]),
        )
      }
    />
  );
}

"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Instanced, Model, place, preload, type ModelName } from "@/components/canal/Kit";
import { rng } from "@/components/canal/layout";
import { radialTexture } from "@/components/canal/textures";
import { TUNING } from "@/game/tuning";
import { STREET, type BikeSim } from "./sim";

const GABLES: ModelName[] = ["gevel_trap", "gevel_klok", "gevel_tuit"];
preload([...GABLES, "puin", "ruine", "schuilkelder", "man", "vrouw", "fiets", "koerier", "lantaarn"]);
const HW = STREET.halfWidth;
/** Fires burning along the street: at the collapsed house and where earlier bombs fell. */
const FIRES: [number, number][] = [[-HW - 1.5, STREET.ruin.z + 1], [HW - 0.6, -41], [-HW + 0.4, -76], [HW - 0.4, -104]];

function Street() {
  const p = useMemo(() => {
    const r = rng(1126);
    const rows: THREE.Matrix4[][] = [[], [], []];
    for (const side of [1, -1]) {
      for (let z = 16; z > -190; ) {
        const kind = Math.floor(r() * 3);
        const w = [5.6, 6.2, 5.0][kind];
        const zc = z - w / 2;
        z -= w + 0.03;
        const taken = side < 0 ? Math.abs(zc - STREET.ruin.z) < 4.5 : Math.abs(zc - (STREET.shelterZ - 1)) < 6.5;
        if (!taken) rows[kind].push(place(side * (HW + 0.3), 0, zc, { yaw: side > 0 ? 0 : Math.PI, sy: 0.92 + r() * 0.22 }));
      }
    }
    return {
      rows,
      rubble: STREET.rubble.map((q) => place(q.x, 0, q.z, { yaw: r() * 6.28, s: q.r / 1.45 })),
      lamps: [-30, -90, -146].map((z, i) => place((i % 2 ? 1 : -1) * (HW - 0.3), 0, z)),
    };
  }, []);
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -85]} receiveShadow>
        <planeGeometry args={[HW * 2 + 0.6, 230]} />
        <meshStandardMaterial color="#43464b" roughness={0.95} />
      </mesh>
      {GABLES.map((name, i) => (
        <Instanced key={name} name={name} placements={p.rows[i]} />
      ))}
      <Instanced name="puin" placements={p.rubble} />
      <Instanced name="lantaarn" placements={p.lamps} />
      <Model name="ruine" position={[-(HW + 0.3), 0, STREET.ruin.z]} rotation-y={Math.PI} />
      <Model name="schuilkelder" position={[HW + 0.3, 0, STREET.shelterZ - 1]} />
    </>
  );
}

/** Flames, smoke and the flickering light they throw on the facades. */
function Fires() {
  const tex = useMemo(radialTexture, []);
  const flames = useRef<(THREE.Sprite | null)[]>([]);
  const smoke = useRef<(THREE.Sprite | null)[]>([]);
  const lights = useRef<(THREE.PointLight | null)[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    FIRES.forEach(([x, z], i) => {
      const f = 0.75 + 0.25 * Math.sin(t * 9 + i * 2) * Math.sin(t * 5.3 + i);
      flames.current[i]?.scale.set(2.2 * f, 3.2 * f, 1);
      if (lights.current[i]) lights.current[i]!.intensity = 60 * f;
      for (let k = 0; k < 3; k++) {
        const s = smoke.current[i * 3 + k];
        if (!s) continue;
        const rise = (t * 0.22 + k / 3 + i * 0.17) % 1;
        s.position.set(x + Math.sin(t * 0.4 + k) * 0.8 + rise * 2, 1.5 + rise * 11, z - rise * 3);
        s.scale.setScalar(3 + rise * 7);
        (s.material as THREE.SpriteMaterial).opacity = 0.34 * (1 - rise);
      }
    });
  });
  return (
    <>
      {FIRES.map(([x, z], i) => (
        <group key={i}>
          <sprite ref={(m) => void (flames.current[i] = m)} position={[x, 1.1, z]}>
            <spriteMaterial map={tex} color="#ff8a2a" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
          <pointLight ref={(m) => void (lights.current[i] = m)} position={[x, 1.6, z]} color="#ff8a3a" distance={16} decay={1.5} />
          {[0, 1, 2].map((k) => (
            <sprite key={k} ref={(m) => void (smoke.current[i * 3 + k] = m)}>
              <spriteMaterial map={tex} color="#2a2a2e" transparent depthWrite={false} />
            </sprite>
          ))}
        </group>
      ))}
    </>
  );
}

const MARKS = 3;
/** Where a bomb is about to fall the street is marked first; then a flash and a cloud of dust. */
function Bombs({ sim }: { sim: React.RefObject<BikeSim> }) {
  const tex = useMemo(radialTexture, []);
  const marks = useRef<(THREE.Group | null)[]>([]);
  const bursts = useRef<(THREE.Sprite | null)[]>([]);
  const last = useRef<{ x: number; z: number; t: number }[]>(Array.from({ length: MARKS }, () => ({ x: 0, z: 0, t: -9 })));
  const seen = useRef(new Map<number, number>());
  useFrame(() => {
    const s = sim.current;
    for (let i = 0; i < MARKS; i++) {
      const b = s.bombs[i];
      const g = marks.current[i];
      if (g) g.visible = !!b;
      if (b && g) {
        const k = 1 - (b.at - s.t) / TUNING.bike.bombWarn;
        g.position.set(b.x, 0.03, b.z);
        g.children[0].scale.setScalar(0.25 + 0.75 * k);
        (((g.children[1] as THREE.Mesh).material) as THREE.MeshBasicMaterial).opacity = 0.35 + 0.3 * Math.sin(s.t * 14);
        seen.current.set(b.at, i);
        last.current[i] = { x: b.x, z: b.z, t: b.at };
      }
      const age = s.t - last.current[i].t;
      const burst = bursts.current[i];
      if (burst) {
        burst.visible = age >= 0 && age < 1.6;
        burst.position.set(last.current[i].x, 1.5 + age * 2, last.current[i].z);
        burst.scale.setScalar(3 + age * 9);
        (burst.material as THREE.SpriteMaterial).opacity = Math.max(0, 0.75 - age * 0.5);
        (burst.material as THREE.SpriteMaterial).color.set(age < 0.12 ? "#fff1c8" : "#6a5f55");
      }
    }
  });
  return (
    <>
      {Array.from({ length: MARKS }, (_, i) => (
        <group key={i}>
          <group ref={(g) => void (marks.current[i] = g)} visible={false}>
            <mesh rotation-x={-Math.PI / 2}>
              <circleGeometry args={[TUNING.bike.bombRadius, 36]} />
              <meshBasicMaterial color="#e25b4a" transparent opacity={0.22} depthWrite={false} />
            </mesh>
            <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
              <ringGeometry args={[TUNING.bike.bombRadius - 0.18, TUNING.bike.bombRadius, 48]} />
              <meshBasicMaterial color="#ff8a6a" transparent opacity={0.5} depthWrite={false} />
            </mesh>
          </group>
          <sprite ref={(m) => void (bursts.current[i] = m)} visible={false}>
            <spriteMaterial map={tex} transparent depthWrite={false} />
          </sprite>
        </group>
      ))}
    </>
  );
}

export function BikeWorld({ sim }: { sim: React.RefObject<BikeSim> }) {
  return (
    <group>
      <Street />
      <Fires />
      <Bombs sim={sim} />
    </group>
  );
}

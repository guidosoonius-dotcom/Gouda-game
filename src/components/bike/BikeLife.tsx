"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useFigure, type FigureName } from "@/components/canal/Figure";
import { useModel } from "@/components/canal/Kit";
import { rng } from "@/components/canal/layout";
import { radialTexture } from "@/components/canal/textures";
import { sfx } from "@/lib/sound";
import { FIRES, HW } from "./BikeWorld";
import { STREET, type BikeSim } from "./sim";

type SimRef = React.RefObject<BikeSim>;
const EXTRAS = 15;

/** People running along the pavements: toward the shelter, or away from the fire. Pure scenery. */
function Extra({ sim, seed }: { sim: SimRef; seed: number }) {
  const r = useMemo(() => rng(seed * 977), [seed]);
  const spec = useMemo(() => {
    const kind: FigureName = r() < 0.5 ? "man" : "vrouw";
    const child = r() < 0.16;
    return { kind, scale: child ? 0.62 : 0.9 + r() * 0.14, toShelter: r() < 0.78, speed: 3.1 + r() * 1.5, lane: (r() < 0.5 ? -1 : 1) * (HW - 0.55 - r() * 0.7), z0: 8 - r() * 110, phase: r() * 6 };
  }, [r]);
  const fig = useFigure(spec.kind, spec.scale);
  const st = useRef({ z: spec.z0, phase: spec.phase, lane: spec.lane });

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = st.current;
    const riderZ = sim.current.z;
    const dir = spec.toShelter ? -1 : 1;
    s.z += dir * spec.speed * dt;
    // recycle: people behind the camera reappear far ahead; those who reach the shelter go inside
    if (spec.toShelter && (s.z > riderZ + 16 || s.z < STREET.shelterZ + 4)) {
      s.z = Math.max(riderZ - 70 - r() * 60, STREET.shelterZ + 12);
      s.lane = (r() < 0.5 ? -1 : 1) * (HW - 0.55 - r() * 0.7);
    }
    if (!spec.toShelter && (s.z > riderZ + 14 || s.z < riderZ - 130)) {
      s.z = riderZ - 105 - r() * 20;
      s.lane = (r() < 0.5 ? -1 : 1) * (HW - 0.55 - r() * 0.7);
    }
    // the run clip covers about 3.6 m per second at its own pace
    s.phase += dt * (spec.speed / 3.6);
    fig.root.position.set(s.lane, 0.14, s.z);
    fig.root.rotation.y = dir < 0 ? Math.PI : 0;
    fig.root.visible = s.z < riderZ + 15 && s.z > riderZ - 125;
    if (!fig.root.visible) return;
    fig.begin();
    fig.clip("run", s.phase);
  });
  return <primitive object={fig.root} />;
}

/** Aircraft crossing the burning sky, with their drone. */
function Planes({ sim }: { sim: SimRef }) {
  const planes = [useModel("vliegtuig"), useModel("vliegtuig"), useModel("vliegtuig")];
  // Dev aid: /?plane=1 starts with one aircraft already over the street.
  const demo = process.env.NODE_ENV !== "production" && typeof window !== "undefined" && new URLSearchParams(window.location.search).has("plane");
  const clock = useRef({
    next: 3,
    active: [-1, -1, -1].map((_, i) => ({ x: demo && i === 0 ? -30 : 0, dir: 1, live: demo && i === 0, y: demo && i === 0 ? 30 : 0, dz: demo && i === 0 ? -60 : 0 })),
  });
  useFrame(({ clock: c }, delta) => {
    const dt = Math.min(delta, 0.05);
    const st = clock.current;
    if (c.elapsedTime > st.next) {
      const free = st.active.findIndex((a) => !a.live);
      if (free >= 0) {
        const dir = Math.random() < 0.5 ? 1 : -1;
        st.active[free] = { x: -dir * 190, dir, live: true, y: 40 + Math.random() * 18, dz: -105 - Math.random() * 40 };
        sfx.drone();
      }
      st.next = c.elapsedTime + 9 + Math.random() * 9;
    }
    st.active.forEach((a, i) => {
      const o = planes[i];
      o.visible = a.live;
      if (!a.live) return;
      a.x += a.dir * 24 * dt;
      if (Math.abs(a.x) > 200) a.live = false;
      o.position.set(a.x, a.y + Math.sin(c.elapsedTime * 0.7 + i) * 0.6, sim.current.z + a.dz);
      o.rotation.set(0, a.dir > 0 ? -Math.PI / 2 : Math.PI / 2, a.dir * 0.08);
      o.scale.setScalar(2.4);
    });
  });
  return (
    <>
      {planes.map((o, i) => (
        <primitive key={i} object={o} visible={false} />
      ))}
    </>
  );
}

const EMBERS = 90;
const ASH = 150;

/** Glowing sparks rising from the fires and grey ash drifting down, wrapped around the camera. */
function Particles() {
  const { camera } = useThree();
  const tex = useMemo(radialTexture, []);
  const data = useMemo(() => {
    const r = rng(77);
    const make = (n: number) => Array.from({ length: n }, () => ({ x: r(), y: r(), z: r(), s: 0.4 + r() * 0.8 }));
    return { embers: make(EMBERS), ash: make(ASH) };
  }, []);
  const emberPts = useRef<THREE.Points>(null);
  const ashPts = useRef<THREE.Points>(null);
  const emberPos = useMemo(() => new Float32Array(EMBERS * 3), []);
  const ashPos = useMemo(() => new Float32Array(ASH * 3), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const cx = camera.position.x;
    const cz = camera.position.z;
    data.embers.forEach((e, i) => {
      const f = FIRES[i % FIRES.length];
      const rise = (t * 0.35 * e.s + e.y) % 1;
      // embers start at a fire and drift downwind (+x) as they climb
      emberPos[i * 3] = f.x + (e.x - 0.5) * 2 + rise * 7 + Math.sin(t * 2 + i) * 0.4;
      emberPos[i * 3 + 1] = f.y + rise * 15;
      emberPos[i * 3 + 2] = f.z + (e.z - 0.5) * 3;
    });
    data.ash.forEach((a, i) => {
      const fall = (a.y - t * 0.12 * a.s) % 1;
      const y = (fall < 0 ? fall + 1 : fall) * 14;
      ashPos[i * 3] = cx + (a.x - 0.5) * 22 + Math.sin(t * 0.6 + i) * 0.8 + (14 - y) * 0.25;
      ashPos[i * 3 + 1] = y;
      ashPos[i * 3 + 2] = cz - 2 - a.z * 55;
    });
    if (emberPts.current) emberPts.current.geometry.attributes.position.needsUpdate = true;
    if (ashPts.current) ashPts.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <>
      <points ref={emberPts} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[emberPos, 3]} />
        </bufferGeometry>
        <pointsMaterial map={tex} color="#ff9a3a" size={0.32} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <points ref={ashPts} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[ashPos, 3]} />
        </bufferGeometry>
        <pointsMaterial map={tex} color="#cbbfb3" size={0.16} transparent opacity={0.55} depthWrite={false} />
      </points>
    </>
  );
}

/** Low drifting dust and smoke across the street, lit orange from the fires. */
function Haze({ sim }: { sim: SimRef }) {
  const tex = useMemo(radialTexture, []);
  const refs = useRef<(THREE.Sprite | null)[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    refs.current.forEach((s, i) => {
      if (!s) return;
      const along = (i * 17.3 + t * 1.1) % 130;
      s.position.set(Math.sin(t * 0.08 + i * 1.9) * 3.5, 1.2 + (i % 3) * 0.9, sim.current.z + 12 - along);
      s.scale.set(16 + (i % 4) * 3, 6 + (i % 3) * 2, 1);
      (s.material as THREE.SpriteMaterial).opacity = 0.1 + 0.04 * Math.sin(t * 0.3 + i);
    });
  });
  return (
    <>
      {Array.from({ length: 11 }, (_, i) => (
        <sprite key={i} ref={(m) => void (refs.current[i] = m)}>
          <spriteMaterial map={tex} color="#8a6a55" transparent depthWrite={false} />
        </sprite>
      ))}
    </>
  );
}

export function BikeLife({ sim }: { sim: SimRef }) {
  return (
    <>
      {Array.from({ length: EXTRAS }, (_, i) => (
        <Extra key={i} sim={sim} seed={i + 1} />
      ))}
      <Planes sim={sim} />
      <Particles />
      <Haze sim={sim} />
    </>
  );
}

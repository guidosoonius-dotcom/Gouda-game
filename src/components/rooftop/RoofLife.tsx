"use client";

import { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Instanced, place } from "@/components/canal/Kit";
import { rng } from "@/components/canal/layout";
import { sfx } from "@/lib/sound";
import { HOUSES, ridgeAt } from "./layout";
import { ROOF, type RoofSim } from "./sim";

type SimRef = React.RefObject<RoofSim>;

// ---------- chimney smoke ----------

const PUFFS = 7; // per smoking chimney
/** Chimneys with a fire lit below (November 1942: coal is rationed, so not all of them). */
const SMOKING = ROOF.covers.filter((_, i) => i % 3 !== 2).map((x) => new THREE.Vector3(x + 0.3, ridgeAt(x) - 0.25 + 2.9, -0.75));

const smokeVert = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  uniform float uViewH;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * projectionMatrix[1][1] * uViewH * 0.5 / -mv.z;
    vAlpha = aAlpha;
  }`;
const smokeFrag = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a = smoothstep(1.0, 0.15, d) * vAlpha;
    if (a < 0.004) discard;
    gl_FragColor = vec4(uColor, a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`;

/** Thin coal smoke from a few chimneys, leaning with the wind. One draw call for all of it. */
function Smoke() {
  const size = useThree((s) => s.size.height * s.viewport.dpr);
  const n = SMOKING.length * PUFFS;
  const { geo, mat } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(n), 1));
    g.setAttribute("aAlpha", new THREE.BufferAttribute(new Float32Array(n), 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: smokeVert,
      fragmentShader: smokeFrag,
      uniforms: { uViewH: { value: 800 }, uColor: { value: new THREE.Color("#8a94a2") } },
      transparent: true,
      depthWrite: false,
    });
    return { geo: g, mat: m };
  }, [n]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    mat.uniforms.uViewH.value = size;
    const pos = geo.attributes.position.array as Float32Array;
    const sz = geo.attributes.aSize.array as Float32Array;
    const al = geo.attributes.aAlpha.array as Float32Array;
    SMOKING.forEach((c, ci) => {
      for (let k = 0; k < PUFFS; k++) {
        const i = ci * PUFFS + k;
        const age = (t * 0.11 + k / PUFFS + ci * 0.37) % 1;
        // rises, then bends away downwind (-x, toward the back of the town)
        pos[i * 3] = c.x - age * age * 5.5 + Math.sin(t * 0.7 + i) * 0.2 * age;
        pos[i * 3 + 1] = c.y + age * 4.2;
        pos[i * 3 + 2] = c.z - age * 2.2;
        sz[i] = 0.5 + age * 2.6;
        al[i] = Math.min(1, age * 5) * Math.pow(1 - age, 1.3) * 0.7;
      }
    });
    geo.attributes.position.needsUpdate = true;
    geo.attributes.aSize.needsUpdate = true;
    geo.attributes.aAlpha.needsUpdate = true;
  });

  return <points geometry={geo} material={mat} frustumCulled={false} renderOrder={2} />;
}

// ---------- pigeons ----------

interface Pigeon { hx: number; hy: number; hz: number; yaw: number; seed: number; flown: number; dir: number }

/** Pigeons asleep on the ridges. When the courier runs up they clatter off into the dark. */
function Pigeons({ sim }: { sim: SimRef }) {
  const birds = useMemo<Pigeon[]>(() => {
    const r = rng(1311);
    const c = ROOF.covers;
    const out: Pigeon[] = [];
    // A few metres past most chimneys, on the ridge the courier is about to cross.
    for (let i = 1; i < c.length - 1; i++) {
      if (r() > 0.65) continue;
      const x = c[i] + 2.6 + r();
      const h = HOUSES.find((house) => x > house.x0 + 0.3 && x < house.x1 - 0.3);
      if (!h) continue;
      const count = 2 + Math.floor(r() * 3);
      for (let j = 0; j < count; j++) {
        out.push({ hx: x + j * 0.42 + r() * 0.15, hy: h.ridge + 0.08, hz: -1.2, yaw: r() * Math.PI * 2, seed: r() * 10, flown: -1, dir: r() < 0.5 ? -1 : 1 });
      }
    }
    return out;
  }, []);
  const placements = useMemo(() => birds.map((b) => place(b.hx, b.hy, b.hz, { yaw: b.yaw, s: 1.3 })), [birds]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const s = sim.current;
    let started = false;
    birds.forEach((b) => {
      const ahead = b.hx - s.x;
      if (b.flown < 0 && s.status === "play" && ahead < 4.5 && ahead > -1) {
        b.flown = t + Math.random() * 0.3;
        started = true;
      }
      // Back on the ridge once the courier is long gone (a respawn behind them, or a replay).
      if (b.flown > 0 && t - b.flown > 20 && Math.abs(b.hx - s.x) > 14) b.flown = -1;
    });
    if (started) sfx.flutter();
  });

  return (
    <Instanced
      name="duif"
      placements={placements}
      live={(t, out) =>
        birds.forEach((b, i) => {
          const f = b.flown > 0 ? Math.max(0, t - b.flown) : 0;
          if (f > 0) {
            // Up and away over the street, wings beating (a fast roll and squash).
            const flap = Math.sin(t * 38 + b.seed);
            place(b.hx + f * 3.2 + f * f * 0.8, b.hy + f * 2.6 + f * f * 0.5, b.hz + b.dir * f * 3.5, { yaw: Math.PI / 2 - b.dir * 0.6, roll: flap * 0.35, s: f > 8 ? 0 : 1.3, sy: 0.85 + flap * 0.15 }, out[i]);
          } else {
            // Asleep: a slight bob of breathing, now and then a turn of the head.
            const turn = Math.sin(t * 0.3 + b.seed) > 0.92 ? 0.5 : 0;
            place(b.hx, b.hy, b.hz, { yaw: b.yaw + turn, s: 1.3, sy: 1 + Math.sin(t * 2 + b.seed) * 0.03 }, out[i]);
          }
        })
      }
    />
  );
}

/** What moves on the roofs besides the couriers: smoke and pigeons. */
export function RoofLife({ sim }: { sim: SimRef }) {
  return (
    <>
      <Smoke />
      <Pigeons sim={sim} />
    </>
  );
}

"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { type Figure, useFigure } from "./Figure";
import { spotCaster, useModel } from "./Kit";
import { sit } from "./poses";
import type { Sim } from "./sim";

export interface Fx {
  /** Ring spawn requests (oar strokes, wake), consumed by the scene. */
  rings: { x: number; z: number; loud: number }[];
  oar: { L: number; R: number };
}

const RINGS = 16;
const STROKE = 0.55;

const SEAT = new THREE.Vector3();
const HAND = new THREE.Vector3();
const POLE = new THREE.Vector3();
const TMP = new THREE.Vector3();
const FEET: [THREE.Vector3, THREE.Vector3] = [new THREE.Vector3(), new THREE.Vector3()];
/** Height of the thwarts and of the floor boards above the waterline. */
const THWART = 0.36;
const FLOOR = 0.1;

/** Sits a figure on a thwart at `z` in the boat, facing the stern (+1) or the bow (-1). */
function seat(f: Figure, hull: THREE.Object3D, z: number, facing: 1 | -1, lean: number) {
  f.begin();
  FEET.forEach((foot, i) => hull.localToWorld(foot.set((i ? -1 : 1) * facing * 0.13, FLOOR + 0.08, z + facing * 0.52)));
  sit(f, hull.localToWorld(SEAT.set(0, THWART + 0.08, z)), FEET, lean);
}

/** Both hands in front of the chest, `forward` metres out: on the knees, or pulling along. */
function hands(f: Figure, forward: number) {
  for (const side of ["Left", "Right"] as const) {
    const out = side === "Left" ? 1 : -1;
    f.at("Spine", HAND).add(f.dir(out * 0.5, -0.75, 1, TMP).multiplyScalar(forward + 0.12));
    f.reach("Arm", side, HAND, f.dir(out, -0.8, -0.2, POLE));
  }
}

/** The rowboat and its crew, the ripples they leave, and the camera that follows them. */
export function CanalActors({ sim, fx }: { sim: React.RefObject<Sim>; fx: React.RefObject<Fx> }) {
  const boat = useRef<THREE.Group>(null);
  const schouw = useModel("schouw");
  const part = useMemo(
    () => ({
      L: schouw.getObjectByName("OarL")!,
      R: schouw.getObjectByName("OarR")!,
      rower: schouw.getObjectByName("Rower")!,
      passenger: schouw.getObjectByName("Passenger")!,
    }),
    [schouw],
  );
  // The crew: the courier at the oars (back to the bow), the passenger in the bow, and Jaap, when
  // he comes along, on the stern thwart. The blocky figures of the boat model stay hidden.
  const rower = useFigure("koerier");
  const passenger = useFigure("man", 0.96);
  const jaap = useFigure("koerier", 0.93, "#d9c9b4");
  useMemo(() => {
    part.rower.visible = false;
    part.passenger.visible = false;
  }, [part]);
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  const ringState = useRef(Array.from({ length: RINGS }, () => ({ age: 9, loud: 0 })));
  const ringNext = useRef(0);
  const wake = useRef(0);
  const duck = useRef(0);
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(0, 0, -4.7));

  useFrame((_, delta) => {
    const s = sim.current;
    const dt = Math.min(delta, 0.05);
    const t = s.t;

    // Oars: catch at the bow, pull through the water, lift and swing back.
    let lean = 0;
    let heel = 0;
    for (const side of ["L", "R"] as const) {
      const sign = side === "L" ? -1 : 1;
      const p = (t - fx.current.oar[side]) / STROKE;
      const sweep = p < 1 ? 0.55 * Math.cos(p * Math.PI) : p < 1.8 ? -0.55 * (1 - (p - 1) / 0.8) : 0;
      part[side].rotation.set(0, sign * sweep, sign * (p < 1 ? -0.1 : 0.16));
      if (p < 1.8) lean = sweep * 0.55;
      if (p < 1) heel += sign * Math.sin(p * Math.PI) * 0.045;
    }
    // The rower throws his back into it; both duck when they hide or the light finds them.
    const hiding = s.hidden || s.underBridge || s.lit || s.status === "caught" ? 1 : 0;
    duck.current += (hiding - duck.current) * (1 - Math.exp(-6 * dt));
    const hull = boat.current;
    if (hull) {
      hull.position.set(s.x, Math.sin(t * 1.7) * 0.03, s.z);
      hull.rotation.set(Math.sin(t * 1.3) * 0.02 - s.v * 0.006, -s.heading, -s.yawRate * 0.12 + heel);
      hull.updateMatrixWorld(true);
      const low = duck.current;
      // the rower throws his back into it and holds the oars; all duck when the light is near
      seat(rower, hull, 0.4, 1, 0.12 + lean * 0.9 + low * 0.5);
      for (const side of ["Left", "Right"] as const) {
        const oar = side === "Left" ? part.R : part.L;
        const out = side === "Left" ? 1 : -1;
        rower.reach("Arm", side, oar.localToWorld(HAND.set(-out * 0.36, 0.07, 0)), rower.dir(out, -0.9, -0.2, POLE));
      }
      seat(passenger, hull, -0.95, -1, 0.3 + low * 0.7 + Math.sin(t * 0.9) * 0.02);
      hands(passenger, 0.2);
      jaap.root.visible = s.crew === 3;
      if (jaap.root.visible) {
        seat(jaap, hull, 1.35, 1, 0.12 + lean * 0.75 + low * 0.5);
        hands(jaap, 0.34 - lean * 0.3);
      }
    }

    // Wake: small rings shed from the stern while the boat is under way.
    wake.current += dt;
    if (s.v > 0.9 && wake.current > 0.42) {
      wake.current = 0;
      fx.current.rings.push({ x: s.x - Math.sin(s.heading) * 1.9, z: s.z + Math.cos(s.heading) * 1.9, loud: 0.05 + s.v * 0.035 });
    }
    for (const req of fx.current.rings.splice(0)) {
      const i = ringNext.current++ % RINGS;
      ringState.current[i] = { age: 0, loud: req.loud };
      rings.current[i]?.position.set(req.x, 0.02, req.z);
    }
    ringState.current.forEach((r, i) => {
      r.age += dt;
      const m = rings.current[i];
      if (!m) return;
      const k = Math.min(1, r.age / 2.2);
      m.visible = k < 1;
      m.scale.setScalar(0.4 + k * (1.6 + r.loud * 2.2));
      (m.material as THREE.MeshBasicMaterial).opacity = (1 - k) * (0.18 + r.loud * 0.4);
    });

    // Camera: looks down the canal over the boat, smoothed independent of frame rate.
    const ease = 1 - Math.exp(-3.2 * dt);
    camera.position.x += (s.x * 0.3 - camera.position.x) * ease;
    camera.position.z += (s.z + 13 - camera.position.z) * ease;
    look.current.x += (s.x * 0.3 - look.current.x) * ease;
    look.current.z += (s.z - 4.7 - look.current.z) * ease;
    camera.lookAt(look.current);
  });

  return (
    <>
      <group ref={(g) => (spotCaster(g), void (boat.current = g))}>
        <primitive object={schouw} />
        <primitive object={rower.root} />
        <primitive object={passenger.root} rotation-y={Math.PI} />
        <primitive object={jaap.root} />
      </group>
      {Array.from({ length: RINGS }, (_, i) => (
        <mesh key={i} ref={(m) => void (rings.current[i] = m)} rotation-x={-Math.PI / 2} visible={false}>
          <ringGeometry args={[0.82, 1, 28]} />
          <meshBasicMaterial color="#dde6ea" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

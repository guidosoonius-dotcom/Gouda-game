"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { radialTexture } from "@/components/canal/textures";
import { TUNING } from "@/game/tuning";
import type { BikeSim } from "./sim";

const SLOTS = 3;
const PIECES = 34;
const GRAVITY = 24;
const TONES = ["#7a4a3a", "#5a3a30", "#8a8579", "#4a3028", "#6b5d52"];

interface Piece {
  p: THREE.Vector3;
  v: THREE.Vector3;
  spin: THREE.Vector3;
  rot: THREE.Euler;
  scale: number;
}

/**
 * Where a bomb is about to fall the street is marked first (this is gameplay and always drawn),
 * then comes the flash and a billow of dust, and, if graphics allow, bricks and roof tiles
 * flying through the air.
 */
export function BikeBombs({ sim }: { sim: React.RefObject<BikeSim> }) {
  const tex = useMemo(radialTexture, []);
  const marks = useRef<(THREE.Group | null)[]>([]);
  const dust = useRef<(THREE.Sprite | null)[]>([]);
  const flash = useRef<THREE.PointLight>(null);
  const chunks = useRef<(THREE.InstancedMesh | null)[]>([]);
  const last = useRef(Array.from({ length: SLOTS }, () => ({ x: 0, z: 0, t: -99, fired: true })));
  const pieces = useMemo(
    () =>
      Array.from({ length: SLOTS }, () =>
        Array.from({ length: PIECES }, (): Piece => ({ p: new THREE.Vector3(), v: new THREE.Vector3(), spin: new THREE.Vector3(), rot: new THREE.Euler(), scale: 0.2 })),
      ),
    [],
  );
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const one = useMemo(() => new THREE.Vector3(), []);

  useLayoutEffect(() => {
    chunks.current.forEach((mesh) => {
      if (!mesh) return;
      for (let i = 0; i < PIECES; i++) mesh.setColorAt(i, new THREE.Color(TONES[i % TONES.length]));
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });
  }, []);

  useFrame((_, delta) => {
    const s = sim.current;
    const dt = Math.min(delta, 0.05);
    let flashT = -Infinity;
    if (flash.current) flash.current.intensity = 0;
    for (let i = 0; i < SLOTS; i++) {
      const b = s.bombs[i];
      const g = marks.current[i];
      if (g) g.visible = !!b;
      if (b && g) {
        const k = 1 - (b.at - s.t) / TUNING.bike.bombWarn;
        g.position.set(b.x, 0.05, b.z);
        g.children[0].scale.setScalar(0.25 + 0.75 * k);
        const pulse = 0.5 + 0.5 * Math.sin(s.t * 12);
        ((g.children[1] as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.6 + 0.4 * pulse;
        ((g.children[2] as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.2 + 0.3 * pulse;
        last.current[i] = { x: b.x, z: b.z, t: b.at, fired: false };
      }
      const L = last.current[i];
      const age = s.t - L.t;
      if (age >= 0 && !L.fired) {
        L.fired = true;
        // spray bricks outward and up from the point of impact
        pieces[i].forEach((pc, n) => {
          const a = (n / PIECES) * Math.PI * 2 + n * 0.7;
          const out = 3 + ((n * 37) % 11);
          pc.p.set(L.x, 0.4, L.z);
          pc.v.set(Math.cos(a) * out, 8 + ((n * 53) % 12), Math.sin(a) * out);
          pc.spin.set(((n * 7) % 9) - 4, ((n * 5) % 7) - 3, ((n * 3) % 9) - 4);
          pc.rot.set(n, n * 2, n * 3);
          pc.scale = 0.14 + ((n * 13) % 7) * 0.05;
        });
      }
      const sprite = dust.current[i];
      if (sprite) {
        sprite.visible = age >= 0 && age < 3.2;
        sprite.position.set(L.x, 1.8 + age * 1.6, L.z);
        sprite.scale.setScalar(4 + age * 9);
        const m = sprite.material as THREE.SpriteMaterial;
        m.opacity = Math.max(0, 0.8 - age * 0.28);
        m.color.set(age < 0.1 ? "#fff1c8" : age < 0.5 ? "#c88a50" : "#6a5f55");
      }
      // one flash light for all bombs: the most recent impact takes it
      if (flash.current && age >= 0 && age < 0.6 && L.t >= flashT) {
        flashT = L.t;
        flash.current.position.set(L.x, 3, L.z);
        flash.current.intensity = 900 * Math.pow(1 - age / 0.6, 2);
      }
      const mesh = chunks.current[i];
      if (mesh) {
        mesh.visible = age >= 0 && age < 2.6;
        if (mesh.visible) {
          pieces[i].forEach((pc, n) => {
            pc.v.y -= GRAVITY * dt;
            pc.p.addScaledVector(pc.v, dt);
            if (pc.p.y < 0.1) {
              pc.p.y = 0.1;
              pc.v.set(pc.v.x * 0.4, Math.abs(pc.v.y) * 0.25, pc.v.z * 0.4);
            }
            pc.rot.x += pc.spin.x * dt;
            pc.rot.y += pc.spin.y * dt;
            pc.rot.z += pc.spin.z * dt;
            const sc = pc.scale * (age > 2 ? Math.max(0, 1 - (age - 2) / 0.6) : 1);
            mesh.setMatrixAt(n, m4.compose(pc.p, q.setFromEuler(pc.rot), one.set(sc, sc * 0.6, sc * 1.4)));
          });
          mesh.instanceMatrix.needsUpdate = true;
        }
      }
    }
  });

  return (
    <>
      <pointLight ref={flash} color="#ffd9a0" intensity={0} distance={40} decay={1.6} />
      {Array.from({ length: SLOTS }, (_, i) => (
        <group key={i}>
          <group ref={(g) => void (marks.current[i] = g)} visible={false}>
            <mesh rotation-x={-Math.PI / 2}>
              <circleGeometry args={[TUNING.bike.bombRadius, 36]} />
              <meshBasicMaterial color="#d81c10" transparent opacity={0.42} depthWrite={false} toneMapped={false} />
            </mesh>
            <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
              <ringGeometry args={[TUNING.bike.bombRadius - 0.38, TUNING.bike.bombRadius, 48]} />
              <meshBasicMaterial color="#fff0d8" transparent opacity={0.9} depthWrite={false} toneMapped={false} />
            </mesh>
            <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, 0]}>
              <ringGeometry args={[TUNING.bike.bombRadius * 0.45, TUNING.bike.bombRadius * 0.45 + 0.25, 40]} />
              <meshBasicMaterial color="#fff0d8" transparent opacity={0.4} depthWrite={false} toneMapped={false} />
            </mesh>
          </group>
          <sprite ref={(m) => void (dust.current[i] = m)} visible={false}>
            <spriteMaterial map={tex} transparent depthWrite={false} />
          </sprite>
          {TUNING.gfx.life && (
            <instancedMesh ref={(m) => void (chunks.current[i] = m)} args={[undefined, undefined, PIECES]} frustumCulled={false} visible={false} castShadow>
              <boxGeometry />
              <meshStandardMaterial roughness={0.95} />
            </instancedMesh>
          )}
        </group>
      ))}
    </>
  );
}

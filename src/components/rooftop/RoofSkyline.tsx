"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { TUNING } from "@/game/tuning";

/**
 * The old town beyond the row of roofs: a painted skyline (Sint-Jan, the town hall, the Waag, the
 * roofs in between) hung between the 3D houses and the sky. It rides along with the camera like
 * the sky, at a nearer distance, so the 3D roofs pass in front of it and it fills the dark gap on
 * the left of the screen. One textured plane: no measurable cost.
 */
/** A soft vertical fade (dense at the bottom, clear at the top) for the banks of mist. */
function useMistTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 128;
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, "rgba(255,255,255,0)");
    grad.addColorStop(0.55, "rgba(255,255,255,0.45)");
    grad.addColorStop(1, "rgba(255,255,255,1)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 4, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

/**
 * Banks of mist lying between the rows of houses behind the route: the far rows fade into the
 * night while the row the courier runs on stays sharp. Long flat planes that follow the camera
 * along the row; two draw calls.
 */
export function RoofMist() {
  const { camera } = useThree();
  const map = useMistTexture();
  const rig = useRef<THREE.Group>(null);
  useFrame(() => rig.current?.position.setX(camera.position.x));
  return (
    <group ref={rig}>
      {TUNING.rooftop.mist.map((m) => (
        <mesh key={m.z} position={[0, m.height / 2 - 1, m.z]}>
          <planeGeometry args={[520, m.height]} />
          <meshBasicMaterial map={map} color="#9fb0c4" transparent opacity={m.opacity} depthWrite={false} fog={false} />
        </mesh>
      ))}
    </group>
  );
}

export function RoofSkyline() {
  const { camera } = useThree();
  const map = useTexture("/img/rooftop/skyline.webp");
  const rig = useRef<THREE.Group>(null);
  const S = TUNING.rooftop.skyline;
  const image = map.image as { width: number; height: number };
  useMemo(() => void (map.colorSpace = THREE.SRGBColorSpace), [map]);

  // the camera looks along +X: keep the painting straight ahead, at the same distance
  useFrame(() => rig.current?.position.set(camera.position.x, 0, camera.position.z));

  return (
    <group ref={rig} rotation-y={-Math.PI / 2}>
      <mesh position={[S.side, S.y, -S.dist]} renderOrder={-9}>
        <planeGeometry args={[S.width, S.width * (image.height / image.width)]} />
        <meshBasicMaterial map={map} color={S.tint} transparent fog={false} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

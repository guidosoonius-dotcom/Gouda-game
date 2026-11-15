"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

interface Props {
  /** A generated sky painting in `public/img/<minigame>/`. */
  url: string;
  /** Direction the camera looks, as a rotation about Y: 0 is down -Z, -PI/2 is along +X. */
  yaw?: number;
  /** Distance of the painting from the camera; keep it inside the camera's far plane. */
  dist: number;
  width: number;
  height: number;
  /** Height of the painting's centre above the ground. */
  y: number;
  /** Strength of the painting as environment map (reflections on water, glass, helmets). */
  env?: number;
  /** Multiplies the painting, to sit it in the scene's fog and grade. */
  tint?: string;
  /** How much of the camera's sideways motion the painting follows (1: none of it is seen). */
  follow?: number;
}

/**
 * A generated sky hung far behind the scene. It follows the camera, so it has no parallax and never
 * shows an edge, and the same image becomes the environment map, so water, wet stones and glass
 * reflect the clouds and the moon of the painting rather than a flat colour.
 */
export function Sky({ url, yaw = 0, dist, width, height, y, env = 1, tint = "#ffffff", follow = 1 }: Props) {
  const { gl, scene, camera } = useThree();
  const sky = useTexture(url);
  const rig = useRef<THREE.Group>(null);
  useMemo(() => void (sky.colorSpace = THREE.SRGBColorSpace), [sky]);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const equirect = sky.clone();
    equirect.mapping = THREE.EquirectangularReflectionMapping;
    equirect.needsUpdate = true;
    const map = pmrem.fromEquirectangular(equirect);
    scene.environment = map.texture;
    scene.environmentIntensity = env;
    // The painting looks along the camera; turn the environment so its moon sits in front as well.
    scene.environmentRotation.set(0, yaw, 0);
    return () => {
      scene.environment = null;
      scene.environmentRotation.set(0, 0, 0);
      map.dispose();
      equirect.dispose();
      pmrem.dispose();
    };
  }, [gl, scene, sky, env, yaw]);

  // dev aid: lets scripts read the renderer statistics (draw calls, triangles)
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") Object.assign(window, { __gl: gl, __scene: scene });
  }, [gl, scene]);

  useFrame(() => {
    const g = rig.current;
    if (!g) return;
    // Sideways is perpendicular to the view: x for a camera looking down Z, z for one looking along X.
    const sx = Math.cos(yaw), sz = -Math.sin(yaw);
    const side = camera.position.x * sx + camera.position.z * sz;
    const ahead = camera.position.x * -sz + camera.position.z * sx;
    g.position.set(sx * side * follow - sz * ahead, 0, sz * side * follow + sx * ahead);
  });

  return (
    <group ref={rig} rotation-y={yaw}>
      <mesh position={[0, y, -dist]} renderOrder={-10}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={sky} color={tint} fog={false} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

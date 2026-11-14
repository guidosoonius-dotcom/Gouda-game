"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { STREET } from "./sim";

/**
 * The sky of the raid: a generated painting of a smoke-filled dusk over the railway yard, hung far
 * behind the street (it follows the camera, so it has no parallax), and the same image as the
 * environment map, so wet stones and helmets reflect the burning sky. Beyond the shelter stands the
 * station, dissolving into the haze.
 */
export function BikeSky() {
  const { gl, scene, camera } = useThree();
  const [sky, station] = useTexture(["/img/bike/sky.webp", "/img/bike/station.webp"]);
  const follow = useRef<THREE.Group>(null);
  useMemo(() => {
    sky.colorSpace = THREE.SRGBColorSpace;
    station.colorSpace = THREE.SRGBColorSpace;
  }, [sky, station]);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const equirect = sky.clone();
    equirect.mapping = THREE.EquirectangularReflectionMapping;
    equirect.needsUpdate = true;
    const env = pmrem.fromEquirectangular(equirect);
    scene.environment = env.texture;
    scene.environmentIntensity = 1.1;
    return () => {
      scene.environment = null;
      env.dispose();
      equirect.dispose();
      pmrem.dispose();
    };
  }, [gl, scene, sky]);

  // dev aid: lets scripts read the renderer statistics (draw calls, triangles)
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") Object.assign(window, { __gl: gl, __scene: scene });
  }, [gl, scene]);

  useFrame(() => follow.current?.position.set(camera.position.x * 0.92, 0, camera.position.z));

  return (
    <>
      <group ref={follow}>
        <mesh position={[0, 78, -238]} renderOrder={-10}>
          <planeGeometry args={[580, 248]} />
          <meshBasicMaterial map={sky} fog={false} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
      <mesh position={[0, 31, STREET.shelterZ - 46]} renderOrder={-5}>
        <planeGeometry args={[150, 112]} />
        <meshBasicMaterial map={station} transparent depthWrite={false} color="#e8d4c4" />
      </mesh>
    </>
  );
}

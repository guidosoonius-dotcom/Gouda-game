"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/** GLBs built by `npm run assets` from assets/blender/build_*.py. */
export const MODELS = {
  kade: "/models/kade.glb",
  riet: "/models/riet.glb",
  schouw: "/models/schouw.glb",
  ophaalbrug: "/models/ophaalbrug.glb",
  sluisdeur: "/models/sluisdeur.glb",
  wacht: "/models/wacht.glb",
  lantaarn: "/models/lantaarn.glb",
} as const;

Object.values(MODELS).forEach((url) => useGLTF.preload(url));

/** Lamp glass glows; everything else is lit by the scene (lighting is designed here, not in Blender). */
function tune(root: THREE.Object3D) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    if (mat.name === "Lamp") {
      mat.emissive = new THREE.Color("#ffd27a");
      mat.emissiveIntensity = 2.2;
      mat.toneMapped = false;
    }
  });
  return root;
}

/** A private copy of a kit model (for unique things: boat, bridge, guard, lock). */
export function useModel(url: string) {
  const { scene } = useGLTF(url);
  return useMemo(() => tune(scene.clone(true)), [scene]);
}

export function Model({ url, ...props }: { url: string } & React.ComponentProps<"group">) {
  const object = useModel(url);
  return (
    <group {...props}>
      <primitive object={object} />
    </group>
  );
}

function Part({ mesh, placements }: { mesh: THREE.Mesh; placements: THREE.Matrix4[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    placements.forEach((p, i) => ref.current!.setMatrixAt(i, m.multiplyMatrices(p, mesh.matrixWorld)));
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [mesh, placements]);
  return <instancedMesh ref={ref} args={[mesh.geometry, mesh.material, placements.length]} frustumCulled={false} />;
}

/** Many copies of one kit model in one draw call per material. */
export function Instanced({ url, placements }: { url: string; placements: THREE.Matrix4[] }) {
  const { scene } = useGLTF(url);
  const parts = useMemo(() => {
    tune(scene).updateMatrixWorld(true);
    const out: THREE.Mesh[] = [];
    scene.traverse((o) => (o as THREE.Mesh).isMesh && out.push(o as THREE.Mesh));
    return out;
  }, [scene]);
  return (
    <>
      {parts.map((mesh) => (
        <Part key={mesh.uuid} mesh={mesh} placements={placements} />
      ))}
    </>
  );
}

export function placement(x: number, y: number, z: number, yaw = 0, scale = 1) {
  return new THREE.Matrix4().compose(
    new THREE.Vector3(x, y, z),
    new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw),
    new THREE.Vector3(scale, scale, scale),
  );
}

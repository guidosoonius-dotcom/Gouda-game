"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/** GLBs built by `npm run assets` from assets/blender/build_*.py. */
const NAMES = [
  "kade", "riet", "schouw", "ophaalbrug", "sluisdeur", "soldaat", "zoeklicht", "lantaarn", "boom", "fiets",
  "meerpaal", "wachtpost", "vracht", "gevel_trap", "gevel_klok", "gevel_tuit",
  "dakhuis", "schoorsteen", "koerier", "sintjan", "uitkijk",
] as const;
export type ModelName = (typeof NAMES)[number];
export const url = (name: ModelName) => `/models/${name}.glb`;
/** Fetch the models of one minigame before its scene mounts. */
export const preload = (names: ModelName[]) => names.forEach((n) => useGLTF.preload(url(n)));

/** Shared by every swaying material: one clock, the boat's position, how hard it brushes the reeds. */
export const sway = { uTime: { value: 0 }, uBoat: { value: new THREE.Vector3() }, uRustle: { value: 0 } };

function swayMaterial(strength: number) {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, side: THREE.DoubleSide });
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, sway, { uStrength: { value: strength } });
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uTime;\nuniform vec3 uBoat;\nuniform float uRustle;\nuniform float uStrength;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        #ifdef USE_INSTANCING
          vec3 ipos = instanceMatrix[3].xyz;
        #else
          vec3 ipos = modelMatrix[3].xyz;
        #endif
        float h = max(transformed.y, 0.0);
        float bend = h * h * 0.5;
        float wind = sin(uTime * 1.4 + ipos.x * 0.9 + ipos.z * 0.7) + 0.5 * sin(uTime * 2.3 + ipos.z * 1.3);
        float brush = uRustle * smoothstep(3.2, 0.6, distance(ipos.xz, uBoat.xz)) * sin(uTime * 11.0 + ipos.x * 5.0 + h * 3.0);
        transformed.x += (wind * 0.035 * uStrength + brush * 0.045) * bend;
        transformed.z += cos(uTime * 1.1 + ipos.x) * 0.02 * uStrength * bend;`,
      );
  };
  m.customProgramCacheKey = () => `sway-${strength}`;
  return m;
}

const MATERIALS = {
  flat: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 }),
  reed: swayMaterial(1),
  leaf: swayMaterial(0.07),
  lamp: new THREE.MeshStandardMaterial({ color: "#ffd98a", emissive: "#ffd27a", emissiveIntensity: 2.4, toneMapped: false }),
};
type Kind = keyof typeof MATERIALS;
const kindOf = (name: string): Kind => (name === "Lamp" ? "lamp" : name === "Leaf" ? "leaf" : name.startsWith("Reed") ? "reed" : "flat");

/**
 * Bakes each material's colour into vertex colours and merges the primitives of a node, so a
 * whole model draws in one call. Node names and hierarchy (oars, legs, heads) stay intact.
 */
function flatten(root: THREE.Object3D) {
  if (root.userData.flat) return root;
  root.userData.flat = true;
  const meshes: THREE.Mesh[] = [];
  root.traverse((o) => (o as THREE.Mesh).isMesh && meshes.push(o as THREE.Mesh));
  const bake = (mesh: THREE.Mesh) => {
    // Rebuild as plain float attributes: the loader's accessor types differ per primitive,
    // and geometries can only be merged when their attributes are of the same kind.
    const src = mesh.geometry;
    const count = src.attributes.position.count;
    const g = new THREE.BufferGeometry();
    for (const name of ["position", "normal"] as const) {
      const from = src.attributes[name];
      const data = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) data.set([from.getX(i), from.getY(i), from.getZ(i)], i * 3);
      g.setAttribute(name, new THREE.BufferAttribute(data, 3));
    }
    const c = (mesh.material as THREE.MeshStandardMaterial).color;
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < colors.length; i += 3) colors.set([c.r, c.g, c.b], i);
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    if (src.index) g.setIndex(Array.from(src.index.array));
    return g;
  };
  const merged = new Map<THREE.Object3D, Partial<Record<Kind, THREE.BufferGeometry[]>>>();
  for (const mesh of meshes) {
    const kind = kindOf((mesh.material as THREE.Material).name);
    const parent = mesh.parent!;
    // The loader turns a multi-material node into a group of anonymous primitives: merge those.
    const primitive =
      parent !== root && mesh.children.length === 0 && mesh.position.lengthSq() === 0 && Math.abs(mesh.quaternion.w) > 0.9999 && mesh.scale.x === 1;
    if (primitive) {
      const groups = merged.get(parent) ?? merged.set(parent, {}).get(parent)!;
      (groups[kind] ??= []).push(bake(mesh));
      parent.remove(mesh);
    } else {
      mesh.geometry = bake(mesh);
      mesh.material = MATERIALS[kind];
    }
  }
  for (const [parent, groups] of merged) {
    for (const [kind, geoms] of Object.entries(groups) as [Kind, THREE.BufferGeometry[]][]) {
      parent.add(new THREE.Mesh(mergeGeometries(geoms, false), MATERIALS[kind]));
    }
  }
  return root;
}

/** A private copy of a kit model (for unique, animated things: boat, soldiers, searchlights). */
export function useModel(name: ModelName) {
  const { scene } = useGLTF(url(name));
  return useMemo(() => flatten(scene).clone(true), [scene]);
}

export function Model({ name, ...props }: { name: ModelName } & React.ComponentProps<"group">) {
  const object = useModel(name);
  return (
    <group {...props}>
      <primitive object={object} />
    </group>
  );
}

type Live = (time: number, placements: THREE.Matrix4[]) => void;

function Part({ mesh, placements, tints, live }: { mesh: THREE.Mesh; placements: THREE.Matrix4[]; tints?: THREE.Color[]; live?: Live }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const write = () => {
    const m = new THREE.Matrix4();
    placements.forEach((p, i) => ref.current!.setMatrixAt(i, m.multiplyMatrices(p, mesh.matrixWorld)));
    ref.current!.instanceMatrix.needsUpdate = true;
  };
  useLayoutEffect(() => {
    write();
    tints?.forEach((c, i) => ref.current!.setColorAt(i, c));
    if (ref.current!.instanceColor) ref.current!.instanceColor.needsUpdate = true;
  }, [mesh, placements, tints]); // eslint-disable-line react-hooks/exhaustive-deps
  // `live` may move the instances every frame (bobbing boats, drifting leaves).
  useFrame(({ clock }) => {
    if (!live) return;
    live(clock.elapsedTime, placements);
    write();
  });
  return <instancedMesh ref={ref} args={[mesh.geometry, mesh.material, placements.length]} frustumCulled={false} />;
}

/** Many copies of one kit model: one draw call per material kind. `only` keeps a single named node. */
export function Instanced({ name, placements, tints, only, live }: { name: ModelName; placements: THREE.Matrix4[]; tints?: THREE.Color[]; only?: string; live?: Live }) {
  const { scene } = useGLTF(url(name));
  const parts = useMemo(() => {
    const root = flatten(scene);
    root.updateMatrixWorld(true);
    const out: THREE.Mesh[] = [];
    (only ? root.getObjectByName(only)! : root).traverse((o) => (o as THREE.Mesh).isMesh && out.push(o as THREE.Mesh));
    return out;
  }, [scene, only]);
  if (placements.length === 0) return null;
  return (
    <>
      {parts.map((mesh) => (
        <Part key={mesh.uuid} mesh={mesh} placements={placements} tints={mesh.material === MATERIALS.flat ? tints : undefined} live={live} />
      ))}
    </>
  );
}

const Y = new THREE.Vector3(0, 1, 0);
const Z = new THREE.Vector3(0, 0, 1);
export function place(x: number, y: number, z: number, o: { yaw?: number; roll?: number; s?: number; sy?: number } = {}, into = new THREE.Matrix4()) {
  const q = new THREE.Quaternion().setFromAxisAngle(Y, o.yaw ?? 0);
  if (o.roll) q.multiply(new THREE.Quaternion().setFromAxisAngle(Z, o.roll));
  const s = o.s ?? 1;
  return into.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(s, s * (o.sy ?? 1), s));
}

"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { glow, kindOf, MATERIALS, SURFACE, type Kind } from "./materials";

export { glow, sway } from "./materials";

/** GLBs built by `npm run assets` from assets/blender/build_*.py. */
const NAMES = [
  "kade", "riet", "schouw", "ophaalbrug", "sluisdeur", "soldaat", "zoeklicht", "lantaarn", "boom", "fiets",
  "meerpaal", "wachtpost", "vracht", "gevel_trap", "gevel_klok", "gevel_tuit",
  "dakhuis", "schoorsteen", "koerier", "sintjan", "uitkijk", "man", "vrouw", "puin", "ruine", "schuilkelder",
  "gevel_trap_schade", "gevel_klok_schade", "gevel_tuit_schade", "vliegtuig", "handkar", "eend", "duif", "moves", "dakhuis_steil", "dakhuis_plat", "waag", "zalm",
] as const;
export type ModelName = (typeof NAMES)[number];
export const url = (name: ModelName) => `/models/${name}.glb`;
/** Fetch the models of one minigame before its scene mounts. */
export const preload = (names: ModelName[]) => names.forEach((n) => useGLTF.preload(url(n)));

/**
 * Searchlight shadows only render the objects on this layer (people, boats, reeds, chimneys): the
 * moon's shadow map already draws the whole set, and drawing it again per searchlight doubled the
 * triangles of a frame.
 */
export const SPOT_LAYER = 1;
export const spotCaster = (o: THREE.Object3D | null) => void o?.traverse((c) => c.layers.enable(SPOT_LAYER));
export const spotOnly = (l: THREE.SpotLight | null) => void l?.shadow.camera.layers.set(SPOT_LAYER);

/** Light behind some of the blackout curtains while a scene is mounted (0: all windows dark). */
export function useWindowGlow(value: number) {
  useEffect(() => {
    glow.uWindowGlow.value = value;
    return () => void (glow.uWindowGlow.value = 0);
  }, [value]);
}


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
    g.setAttribute("kind", new THREE.BufferAttribute(new Float32Array(count).fill(SURFACE[(mesh.material as THREE.Material).name] ?? 0), 1));
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
      mesh.castShadow = kind !== "lamp";
      mesh.receiveShadow = kind === "flat";
    }
  }
  for (const [parent, groups] of merged) {
    for (const [kind, geoms] of Object.entries(groups) as [Kind, THREE.BufferGeometry[]][]) {
      const mesh = new THREE.Mesh(mergeGeometries(geoms, false), MATERIALS[kind]);
      mesh.castShadow = kind !== "lamp";
      mesh.receiveShadow = kind === "flat";
      parent.add(mesh);
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

function Part({ mesh, placements, tints, live, spot, cull }: { mesh: THREE.Mesh; placements: THREE.Matrix4[]; tints?: THREE.Color[]; live?: Live; spot?: boolean; cull?: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const write = () => {
    const m = new THREE.Matrix4();
    placements.forEach((p, i) => ref.current!.setMatrixAt(i, m.multiplyMatrices(p, mesh.matrixWorld)));
    ref.current!.instanceMatrix.needsUpdate = true;
  };
  useLayoutEffect(() => {
    write();
    if (spot) ref.current!.layers.enable(SPOT_LAYER);
    if (cull) ref.current!.computeBoundingSphere();
    tints?.forEach((c, i) => ref.current!.setColorAt(i, c));
    if (ref.current!.instanceColor) ref.current!.instanceColor.needsUpdate = true;
  }, [mesh, placements, tints, spot, cull]); // eslint-disable-line react-hooks/exhaustive-deps
  // `live` may move the instances every frame (bobbing boats, drifting leaves).
  useFrame(({ clock }) => {
    if (!live) return;
    live(clock.elapsedTime, placements);
    write();
  });
  return <instancedMesh ref={ref} args={[mesh.geometry, mesh.material, placements.length]} frustumCulled={!!cull} castShadow={mesh.castShadow} receiveShadow={mesh.receiveShadow} />;
}

interface InstancedProps {
  name: ModelName;
  placements: THREE.Matrix4[];
  tints?: THREE.Color[];
  /** Keep a single named node of the model. */
  only?: string;
  live?: Live;
  /** Also casts searchlight shadows. */
  spot?: boolean;
  /**
   * Split a long row into blocks of this many metres along Z, each culled on its own, so the camera
   * and the moon's shadow map only draw the blocks they see. Not with `live`.
   */
  chunk?: number;
}

/** Many copies of one kit model: one draw call per material kind (per block when chunked). */
export function Instanced({ name, placements, tints, only, live, spot, chunk }: InstancedProps) {
  const { scene } = useGLTF(url(name));
  const parts = useMemo(() => {
    const root = flatten(scene);
    root.updateMatrixWorld(true);
    const out: THREE.Mesh[] = [];
    (only ? root.getObjectByName(only)! : root).traverse((o) => (o as THREE.Mesh).isMesh && out.push(o as THREE.Mesh));
    return out;
  }, [scene, only]);
  const blocks = useMemo(() => {
    if (!chunk) return [{ placements, tints }];
    const map = new Map<number, { placements: THREE.Matrix4[]; tints?: THREE.Color[] }>();
    placements.forEach((p, i) => {
      const key = Math.floor(p.elements[14] / chunk);
      const b = map.get(key) ?? { placements: [], tints: tints ? [] : undefined };
      b.placements.push(p);
      if (tints) b.tints!.push(tints[i]);
      map.set(key, b);
    });
    return [...map.values()];
  }, [placements, tints, chunk]);
  if (placements.length === 0) return null;
  return (
    <>
      {blocks.map((b, bi) =>
        parts.map((mesh) => (
          <Part key={`${bi}-${mesh.uuid}`} mesh={mesh} placements={b.placements} tints={mesh.material === MATERIALS.flat ? b.tints : undefined} live={live} spot={spot} cull={!!chunk} />
        )),
      )}
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

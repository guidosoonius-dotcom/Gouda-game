"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { TUNING } from "@/game/tuning";

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

/** Surface families for the procedural detail shader, stored per vertex as `kind`. */
const SURFACE: Record<string, number> = {
  Brick: 1, BrickDark: 1, Roof: 2, Wood: 3, WoodDark: 3, WoodWhite: 3, Bark: 3, Stone: 4, Cobble: 4, Sand: 4,
};

/**
 * Vertex colours carry the base colour; this adds what a texture would: brick courses, roof
 * tiles, wood grain, cobbles and a little weathering, computed from world position so nothing
 * needs UVs or image files. The patterns fade out with distance, so they never shimmer.
 */
function detailMaterial() {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, metalness: 0.02 });
  if (!TUNING.gfx.detail) return m;
  m.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float kind;\nvarying float vKind;\nvarying vec3 vWPos;\nvarying vec3 vWNor;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vKind = kind;
        vec4 wp = vec4(transformed, 1.0);
        vec3 wn = objectNormal;
        #ifdef USE_INSTANCING
          wp = instanceMatrix * wp;
          wn = mat3(instanceMatrix) * wn;
        #endif
        vWPos = (modelMatrix * wp).xyz;
        vWNor = normalize(mat3(modelMatrix) * wn);`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying float vKind;
        varying vec3 vWPos;
        varying vec3 vWNor;
        float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float vnoise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y);
        }`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        {
          vec3 an = abs(vWNor);
          vec2 uv = an.y > 0.6 ? vWPos.xz : (an.x > an.z ? vWPos.zy : vWPos.xy);
          float fade = smoothstep(75.0, 12.0, length(vWPos - cameraPosition));
          float grain = 0.5 * vnoise(uv * 9.0) + 0.5 * vnoise(uv * 2.3);
          float detail = 0.95 + 0.1 * grain;
          if (vKind > 0.5 && vKind < 1.5) {
            vec2 b = uv / vec2(0.44, 0.15);
            b.x += 0.5 * mod(floor(b.y), 2.0);
            vec2 f = fract(b);
            float face = smoothstep(0.0, 0.07, f.x) * smoothstep(0.0, 0.16, f.y);
            detail = mix(0.6, 0.8 + 0.4 * h21(floor(b)), face);
          } else if (vKind > 1.5 && vKind < 2.5) {
            vec2 t = uv / vec2(0.3, 0.36);
            t.x += 0.5 * mod(floor(t.y), 2.0);
            vec2 f = fract(t);
            detail = (0.78 + 0.34 * h21(floor(t))) * (0.7 + 0.3 * smoothstep(0.0, 0.55, f.y)) * (0.86 + 0.14 * smoothstep(0.0, 0.12, f.x));
          } else if (vKind > 2.5 && vKind < 3.5) {
            detail = 0.8 + 0.2 * vnoise(uv * vec2(3.0, 34.0)) + 0.2 * vnoise(uv * vec2(34.0, 3.0));
          } else if (vKind > 3.5 && vKind < 4.5) {
            vec2 c = uv * 3.1;
            vec2 f = abs(fract(c) - 0.5);
            detail = mix(0.58, 0.8 + 0.38 * h21(floor(c)), smoothstep(0.5, 0.38, max(f.x, f.y)));
          }
          detail *= 0.92 + 0.16 * grain;
          diffuseColor.rgb *= mix(1.0, detail, fade);
        }`,
      );
  };
  return m;
}

const MATERIALS = {
  flat: detailMaterial(),
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
  return <instancedMesh ref={ref} args={[mesh.geometry, mesh.material, placements.length]} frustumCulled={false} castShadow={mesh.castShadow} receiveShadow={mesh.receiveShadow} />;
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

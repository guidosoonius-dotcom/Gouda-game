"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { url, type ModelName } from "./Kit";

/**
 * The people of the game: skinned, textured figures (see assets/blender/_figure.py) with real motion
 * clips and a few helpers to pose them by hand (sitting, rowing, cycling, crouching).
 *
 * Every frame a scene builds the pose from scratch: `begin()` returns to the rest pose, `clip()` mixes
 * in a sampled motion clip, `blend()` mixes in a hand-made pose. There is no hidden animation state,
 * so a paused game or a hidden figure costs nothing and nothing drifts.
 */
export type FigureName = Extract<ModelName, "koerier" | "soldaat" | "man" | "vrouw">;
export type Clip = "run" | "walk";
export type Side = "Left" | "Right";
export type Limb = "Arm" | "Leg";

/** The soldier, the man and the woman share one skeleton; their clips live in `moves.glb`. */
const CLIPS_FROM: Record<FigureName, ModelName> = { koerier: "koerier", soldaat: "moves", man: "moves", vrouw: "moves" };
const CHAIN: Record<Limb, [string, string, string]> = { Arm: ["Arm", "ForeArm", "Hand"], Leg: ["UpLeg", "Leg", "Foot"] };

const P = new THREE.Quaternion();
const S = new THREE.Quaternion();
const Q = new THREE.Quaternion();
const A = new THREE.Vector3();
const B = new THREE.Vector3();
const C = new THREE.Vector3();
const D = new THREE.Vector3();
const E = new THREE.Vector3();

interface Sampler {
  bone: THREE.Bone;
  position: boolean;
  interpolant: THREE.Interpolant;
}

export class Figure {
  readonly root: THREE.Object3D;
  readonly bone: Record<string, THREE.Bone> = {};
  private bones: THREE.Bone[] = [];
  private rest: THREE.Quaternion[] = [];
  private held: THREE.Quaternion[] = [];
  private hips: THREE.Bone;
  private restHips = new THREE.Vector3();
  private heldHips = new THREE.Vector3();
  private samplers: Partial<Record<Clip, { duration: number; tracks: Sampler[] }>> = {};

  constructor(source: THREE.Object3D, clips: THREE.AnimationClip[], scale = 1, tint?: string) {
    this.root = clone(source);
    this.root.scale.multiplyScalar(scale);
    this.root.traverse((o) => {
      const bone = o as THREE.Bone;
      if (bone.isBone) {
        this.bone[bone.name] = bone;
        this.bones.push(bone);
        this.rest.push(bone.quaternion.clone());
        this.held.push(new THREE.Quaternion());
      }
      const mesh = o as THREE.SkinnedMesh;
      if (mesh.isSkinnedMesh) {
        mesh.castShadow = true;
        // the bounding sphere is that of the rest pose; a figure lying down would be culled
        mesh.frustumCulled = false;
        if (tint) {
          mesh.material = (mesh.material as THREE.MeshStandardMaterial).clone();
          (mesh.material as THREE.MeshStandardMaterial).color.set(tint);
        }
      }
    });
    this.hips = this.bone.Hips;
    this.restHips.copy(this.hips.position);
    for (const clip of clips) {
      const tracks: Sampler[] = [];
      for (const track of clip.tracks) {
        const [name, property] = track.name.split(".");
        const bone = this.bone[name];
        if (!bone || (property !== "quaternion" && !(property === "position" && name === "Hips"))) continue;
        tracks.push({ bone, position: property === "position", interpolant: (track as unknown as { createInterpolant(): THREE.Interpolant }).createInterpolant() });
      }
      this.samplers[clip.name as Clip] = { duration: clip.duration, tracks };
    }
  }

  duration(clip: Clip) {
    return this.samplers[clip]?.duration ?? 1;
  }

  /** Back to the rest pose (arms a little away from the body). */
  begin() {
    for (let i = 0; i < this.bones.length; i++) this.bones[i].quaternion.copy(this.rest[i]);
    this.hips.position.copy(this.restHips);
  }

  /** Mixes a motion clip, sampled at `time` seconds (it loops), into the pose. */
  clip(name: Clip, time: number, weight = 1) {
    const s = this.samplers[name];
    if (!s || weight <= 0) return;
    const t = ((time % s.duration) + s.duration) % s.duration;
    for (const track of s.tracks) {
      const v = track.interpolant.evaluate(t) as Float32Array;
      if (track.position) this.hips.position.lerp(A.set(v[0], v[1], v[2]), weight);
      else track.bone.quaternion.slerp(Q.set(v[0], v[1], v[2], v[3]), weight);
    }
  }

  /** Mixes a hand-made pose into the current one. `pose` starts from the rest pose. */
  blend(weight: number, pose: (f: Figure) => void) {
    if (weight <= 0) return;
    const partial = weight < 1;
    if (partial) {
      for (let i = 0; i < this.bones.length; i++) this.held[i].copy(this.bones[i].quaternion);
      this.heldHips.copy(this.hips.position);
    }
    this.begin();
    pose(this);
    if (!partial) return;
    for (let i = 0; i < this.bones.length; i++) this.bones[i].quaternion.copy(Q.copy(this.held[i]).slerp(this.bones[i].quaternion, weight));
    this.hips.position.copy(A.copy(this.heldHips).lerp(this.hips.position, weight));
  }

  /** Raises (or lowers) the hips by `metres` in the world. */
  lift(metres: number) {
    this.hips.position.y += metres / this.root.getWorldScale(A).y;
  }

  /** Puts the hips on a point in the world (a saddle, a thwart); the limbs then reach from there. */
  seat(world: THREE.Vector3) {
    const parent = this.hips.parent!;
    parent.updateWorldMatrix(true, false);
    this.hips.position.copy(parent.worldToLocal(A.copy(world)));
  }

  /** Rotates a bone about an axis given in the world. */
  turn(name: string, axis: THREE.Vector3, angle: number) {
    this.swing(this.bone[name], S.setFromAxisAngle(axis, angle));
  }

  /** A direction in the figure's own frame (x: its left, y: up, z: forward) as a world direction. */
  dir(x: number, y: number, z: number, out = new THREE.Vector3()) {
    return out.set(x, y, z).applyQuaternion(this.root.getWorldQuaternion(P)).normalize();
  }

  /** World position of a bone in the current pose. */
  at(name: string, out = new THREE.Vector3()) {
    return this.bone[name].getWorldPosition(out);
  }

  /** Two-bone reach: puts a hand or a foot on `target` (world), the elbow or knee toward `pole`. */
  reach(limb: Limb, side: Side, target: THREE.Vector3, pole: THREE.Vector3) {
    const [u, l, e] = CHAIN[limb];
    const upper = this.bone[side + u];
    const lower = this.bone[side + l];
    const end = this.bone[side + e];
    upper.getWorldPosition(A);
    const scale = upper.getWorldScale(B).y;
    const la = lower.position.length() * scale;
    const lb = end.position.length() * scale;
    D.subVectors(target, A);
    const dist = Math.min(la + lb - 1e-3, Math.max(Math.abs(la - lb) + 1e-3, D.length()));
    D.normalize();
    const cos = (la * la + dist * dist - lb * lb) / (2 * la * dist);
    B.copy(pole).addScaledVector(D, -pole.dot(D)).normalize();
    // the joint in the middle, then the end point as far along as the limb reaches
    C.copy(D).multiplyScalar(la * cos).addScaledVector(B, la * Math.sqrt(Math.max(0, 1 - cos * cos)));
    E.copy(A).addScaledVector(D, dist);
    this.point(upper, lower, C);
    lower.getWorldPosition(A);
    this.point(lower, end, E.sub(A));
  }

  /** Swings `bone` so that its child lies along `direction` (world). */
  private point(bone: THREE.Bone, child: THREE.Bone, direction: THREE.Vector3) {
    bone.getWorldQuaternion(Q);
    B.copy(child.position).normalize().applyQuaternion(Q);
    this.swing(bone, S.setFromUnitVectors(B, direction.normalize()));
  }

  /** Applies a world-space rotation to a bone: local' = parent⁻¹ · rotation · parent · local. */
  private swing(bone: THREE.Bone, rotation: THREE.Quaternion) {
    bone.parent!.getWorldQuaternion(P);
    bone.quaternion.premultiply(P).premultiply(rotation).premultiply(P.invert());
  }
}

/** One figure for this component: its own skeleton, shared geometry, texture and clips. */
export function useFigure(name: FigureName, scale = 1, tint?: string) {
  const model = useGLTF(url(name));
  const moves = useGLTF(url(CLIPS_FROM[name]));
  return useMemo(() => new Figure(model.scene, moves.animations, scale, tint), [model, moves, scale, tint]);
}

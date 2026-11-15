import * as THREE from "three";
import type { Figure, Side } from "./Figure";

/** Hand-made poses shared by the minigames. Each starts from the rest pose (see `Figure.blend`). */
const SIDES: Side[] = ["Left", "Right"];
const FEET = [new THREE.Vector3(), new THREE.Vector3()];
const V = new THREE.Vector3();
const W = new THREE.Vector3();
const AXIS = new THREE.Vector3();
const sign = (side: Side) => (side === "Left" ? 1 : -1);

/** Standing at ease: the arms hang down (the rest pose holds them away from the body). */
export function stand(f: Figure) {
  f.dir(0, 0, 1, AXIS);
  f.turn("LeftArm", AXIS, -0.5);
  f.turn("RightArm", AXIS, 0.5);
  f.turn("LeftForeArm", AXIS, -0.12);
  f.turn("RightForeArm", AXIS, 0.12);
}

/** Squatting: knees up, back bent, hands on the knees, looking up. */
export function crouch(f: Figure) {
  SIDES.forEach((side, i) => f.at(`${side}Foot`, FEET[i]));
  f.lift(-0.46);
  f.dir(1, 0, 0, AXIS);
  f.turn("Spine02", AXIS, 0.5);
  f.turn("Spine", AXIS, 0.25);
  f.turn("Head", AXIS, -0.45);
  SIDES.forEach((side, i) => {
    const out = sign(side);
    f.reach("Leg", side, FEET[i], f.dir(out * 0.35, 0, 1, V));
    f.reach("Arm", side, f.at(`${side}Leg`, W).add(f.dir(0, 1, 0.4, V).multiplyScalar(0.06)), f.dir(out, -0.3, -0.6, V));
  });
}

/** Ducking from a blast: knees bent, back down, arms over the head. */
export function cower(f: Figure) {
  SIDES.forEach((side, i) => f.at(`${side}Foot`, FEET[i]));
  f.lift(-0.3);
  f.dir(1, 0, 0, AXIS);
  f.turn("Spine02", AXIS, 0.55);
  f.turn("Spine", AXIS, 0.35);
  f.turn("neck", AXIS, 0.3);
  SIDES.forEach((side, i) => {
    const out = sign(side);
    f.reach("Leg", side, FEET[i], f.dir(out * 0.3, 0, 1, V));
    f.reach("Arm", side, f.at("Head", W).add(f.dir(out * 0.6, 0.7, 0.3, V).multiplyScalar(0.16)), f.dir(out, 0.2, 0.3, V));
  });
}

/** Flat on the ground (the caller tips the whole figure forward): arms ahead, head raised. */
export function prone(f: Figure) {
  f.dir(1, 0, 0, AXIS);
  f.turn("neck", AXIS, -0.55);
  SIDES.forEach((side) => {
    const out = sign(side);
    const hand = f.at(`${side}Arm`, W).add(f.dir(out * 0.1, 0.42, 0.22, V).multiplyScalar(0.5));
    f.reach("Arm", side, hand, f.dir(out, 0, -0.2, V));
  });
}

/**
 * Sitting: hips on `seat`, feet on `feet` (both in the world), back bent forward by `lean` radians.
 * Call inside a pose; put the hands somewhere with `Figure.reach` afterwards.
 */
export function sit(f: Figure, seat: THREE.Vector3, feet: [THREE.Vector3, THREE.Vector3], lean: number) {
  f.seat(seat);
  f.dir(1, 0, 0, AXIS);
  f.turn("Spine02", AXIS, lean * 0.6);
  f.turn("Spine", AXIS, lean * 0.4);
  f.turn("Head", AXIS, -lean * 0.5);
  SIDES.forEach((side, i) => f.reach("Leg", side, feet[i], f.dir(sign(side) * 0.25, 0.6, 1, V)));
}

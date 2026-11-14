"use client";

import * as THREE from "three";

function canvas(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  return new THREE.CanvasTexture(c);
}

/** Soft white blob fading to nothing: mist, lamp flares. */
export function radialTexture() {
  return canvas(128, 128, (g) => {
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.35, "rgba(255,255,255,.45)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
  });
}

/** White at the left edge fading out to the right: a light's streak on the water. */
export function streakTexture() {
  return canvas(128, 16, (g) => {
    const grad = g.createLinearGradient(0, 0, 128, 0);
    grad.addColorStop(0, "rgba(255,255,255,.9)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 16);
    g.globalCompositeOperation = "destination-in";
    const v = g.createLinearGradient(0, 0, 0, 16);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(0.5, "rgba(0,0,0,1)");
    v.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = v;
    g.fillRect(0, 0, 128, 16);
  });
}

/** Bright at the top, faint at the bottom: a beam is strongest at the lamp. */
export function beamTexture() {
  return canvas(4, 64, (g) => {
    const grad = g.createLinearGradient(0, 0, 0, 64);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.25, "#8a8a8a");
    grad.addColorStop(1, "#3c3c3c");
    g.fillStyle = grad;
    g.fillRect(0, 0, 4, 64);
  });
}

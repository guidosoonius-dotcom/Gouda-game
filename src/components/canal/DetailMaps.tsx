"use client";

import { useLayoutEffect } from "react";
import { preload, suspend } from "suspend-react";
import * as THREE from "three";
import { useGameStore } from "@/store/useGameStore";
import { DETAIL_MAPS, setDetailMaps } from "./materials";

const SIZE = 512;
const KEY = "kit-detail-maps";

/** Loads the six detail maps into one texture array (one sampler for every kit material). */
async function load() {
  const data = new Uint8Array(SIZE * SIZE * 4 * DETAIL_MAPS.length);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const images = await Promise.all(
    DETAIL_MAPS.map(async (url) => createImageBitmap(await (await fetch(url)).blob(), { colorSpaceConversion: "none", premultiplyAlpha: "none" })),
  );
  images.forEach((img, i) => {
    // rows bottom-up, as the texture's v runs (a data texture is never flipped on upload)
    ctx.setTransform(1, 0, 0, -1, 0, SIZE);
    ctx.drawImage(img, 0, 0, SIZE, SIZE);
    data.set(ctx.getImageData(0, 0, SIZE, SIZE).data, i * SIZE * SIZE * 4);
    img.close();
  });
  const tex = new THREE.DataArrayTexture(data, SIZE, SIZE, DETAIL_MAPS.length);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/** Start loading while the dossier is open, so the minigame does not wait for it. */
export function preloadDetailMaps() {
  if (typeof window !== "undefined" && useGameStore.getState().settings.hifi) preload(load, [KEY]);
}

function Maps() {
  const tex = suspend(load, [KEY]);
  useLayoutEffect(() => setDetailMaps(tex), [tex]);
  return null;
}

/**
 * "Hoge beeldkwaliteit": puts the detail maps on the kit before the warm-up compiles the scene
 * (it sits in front of `Warmup` in the canvas' Suspense). Off, the kit draws its own patterns.
 */
export function DetailMaps() {
  const hifi = useGameStore((s) => s.settings.hifi);
  useLayoutEffect(() => {
    if (!hifi) setDetailMaps(null);
  }, [hifi]);
  return hifi ? <Maps /> : null;
}

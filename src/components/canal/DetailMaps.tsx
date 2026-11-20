"use client";

import { useLayoutEffect } from "react";
import { preload, suspend } from "suspend-react";
import * as THREE from "three";
import { useGameStore } from "@/store/useGameStore";
import { DETAIL_MAPS, setDetailMaps, setLeafMap } from "./materials";

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

const LEAVES = "/img/kit/leaves.webp";

/** The leaf atlas of the trees: needed in both picture qualities (it gives the crowns their shape). */
async function loadLeaves() {
  const tex = await new THREE.TextureLoader().loadAsync(LEAVES);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Start loading while the dossier is open, so the minigame does not wait for it. */
export function preloadDetailMaps() {
  if (typeof window === "undefined") return;
  preload(loadLeaves, [LEAVES]);
  if (useGameStore.getState().settings.hifi) preload(load, [KEY]);
}

function Leaves() {
  const tex = suspend(loadLeaves, [LEAVES]);
  useLayoutEffect(() => setLeafMap(tex), [tex]);
  return null;
}

function Maps() {
  const tex = suspend(load, [KEY]);
  useLayoutEffect(() => setDetailMaps(tex), [tex]);
  return null;
}

/**
 * Puts the leaf atlas and, with "Hoge beeldkwaliteit", the detail maps on the kit before the
 * warm-up compiles the scene (it sits in front of `Warmup` in the canvas' Suspense). Without the
 * detail maps the kit draws its own patterns.
 */
export function DetailMaps() {
  const hifi = useGameStore((s) => s.settings.hifi);
  useLayoutEffect(() => {
    if (!hifi) setDetailMaps(null);
  }, [hifi]);
  return (
    <>
      <Leaves />
      {hifi && <Maps />}
    </>
  );
}

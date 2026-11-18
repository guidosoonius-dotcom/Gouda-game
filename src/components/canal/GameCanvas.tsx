"use client";

import { memo, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree, type CanvasProps } from "@react-three/fiber";
import * as THREE from "three";
import { TUNING } from "@/game/tuning";
import { usePaused } from "@/lib/pause";

const G = TUNING.gfx;

/** The film grade of a scene: contrast and saturation (as the CSS filter had them), plus split
 *  toning (warm highlights, cold shadows) for the burning street. */
export interface Grade {
  contrast: number;
  saturate: number;
  split?: number;
}

const BASE = THREE.ShaderChunk.tonemapping_pars_fragment;
const HOOK = "vec3 CustomToneMapping( vec3 color ) { return color; }";
const f = (v: number) => v.toFixed(3);

/**
 * The grade runs inside the tone mapping of every material, so it costs a few instructions per
 * pixel and no extra pass. (As a CSS `filter` on the canvas it made the browser composite the whole
 * screen through an offscreen surface every frame.) Works in display space, like the CSS filter did.
 */
function applyGrade({ contrast, saturate, split = 0 }: Grade) {
  THREE.ShaderChunk.tonemapping_pars_fragment = BASE.replace(
    HOOK,
    `vec3 CustomToneMapping( vec3 color ) {
      color = ACESFilmicToneMapping( color );
      vec3 c = pow( clamp( color, 0.0, 1.0 ), vec3( 1.0 / 2.2 ) );
      float l = dot( c, vec3( 0.2126, 0.7152, 0.0722 ) );
      c = mix( vec3( l ), c, ${f(saturate)} );
      c = ( c - 0.5 ) * ${f(contrast)} + 0.5;
      c += ${f(split)} * mix( vec3( -0.03, 0.0, 0.06 ), vec3( 0.07, 0.025, -0.05 ), smoothstep( 0.08, 0.6, l ) );
      return pow( clamp( c, 0.0, 1.0 ), vec3( 2.2 ) );
    }`,
  );
}

/**
 * Keeps the frame rate up: starts at a modest render resolution, raises it while frames keep coming
 * fast, and lowers it when they come too slowly. A resolution that proved too heavy twice is not tried again, so the
 * picture does not keep jumping between two sizes.
 */
function AdaptiveQuality() {
  const setDpr = useThree((s) => s.setDpr);
  const q = useRef({ dpr: 0, max: 0, sum: 0, n: 0, warm: 0, good: 0, fails: new Map<number, number>() });

  useEffect(() => {
    const device = window.devicePixelRatio || 1;
    q.current.max = Math.min(G.dprMax, device);
    q.current.dpr = Math.min(G.dprStart, device);
  }, []);

  useFrame((_, dt) => {
    const s = q.current;
    if (dt > 0.25 || s.dpr === 0) return; // a background tab or a one-off stall says nothing
    s.warm += dt;
    if (s.warm < G.adaptWarmup) return;
    s.sum += dt;
    s.n++;
    if (s.sum < G.adaptWindow) return;
    const fps = s.n / s.sum;
    s.sum = s.n = 0;
    let next = s.dpr;
    if (fps < G.fpsLow && s.dpr > G.dprMin) {
      s.fails.set(s.dpr, (s.fails.get(s.dpr) ?? 0) + 1);
      next = Math.max(G.dprMin, s.dpr - G.dprStep);
      s.good = 0;
    } else if (fps > G.fpsHigh && s.dpr < s.max) {
      const up = Math.min(s.max, s.dpr + G.dprStep);
      if (++s.good >= G.adaptRise && (s.fails.get(up) ?? 0) < 2) next = up;
    } else s.good = 0;
    if (next !== s.dpr) {
      s.dpr = next;
      s.good = 0;
      s.warm = G.adaptWarmup - G.adaptCooldown;
      setDpr(next);
    }
    if (process.env.NODE_ENV !== "production") Object.assign(window, { __quality: { dpr: s.dpr, fps: Math.round(fps) } });
  });
  return null;
}

/**
 * Compiles every shader the scene will need before play starts, including those of things that are
 * hidden until later (a bomb, a flash, a fallen star), so no material compiles in the middle of the
 * action. Uses parallel compilation where the browser has it.
 */
function Warmup() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    const hidden: THREE.Object3D[] = [];
    scene.traverse((o) => {
      if (!o.visible && !(o as THREE.Light).isLight) {
        hidden.push(o);
        o.visible = true;
      }
    });
    // compile() collects the materials synchronously, so the hidden objects can go away again at once
    const done = gl.compileAsync(scene, camera);
    hidden.forEach((o) => (o.visible = false));
    done.catch(() => undefined);
  }, [gl, scene, camera]);
  return null;
}

/**
 * The canvas of the 3D minigames: one place for resolution, antialiasing, shadows, the grade, the
 * adaptive resolution and the shader warm-up. Memoised: give it memoised children so that the HUD,
 * which updates ten times a second, never re-renders the scene.
 */
export const GameCanvas = memo(function GameCanvas({ camera, grade, children }: { camera: CanvasProps["camera"]; grade: Grade; children: ReactNode }) {
  // the grade must be in place before the first shader compiles
  useState(() => applyGrade(grade));
  // paused: keep the last picture, draw nothing (the clock and the battery both rest)
  const paused = usePaused();
  return (
    <Canvas
      frameloop={paused ? "never" : "always"}
      shadows="percentage"
      dpr={typeof window === "undefined" ? 1 : Math.min(G.dprStart, window.devicePixelRatio || 1)}
      camera={camera}
      gl={{ antialias: true, powerPreference: "high-performance", toneMapping: THREE.CustomToneMapping }}
      // Checking each shader for errors waits for it to finish compiling, which turns parallel
      // compilation back into a stall. Development keeps the check; players do not need it.
      onCreated={({ gl }) => void (gl.debug.checkShaderErrors = process.env.NODE_ENV !== "production")}
    >
      <Suspense fallback={null}>
        {children}
        <Warmup />
      </Suspense>
      <AdaptiveQuality />
    </Canvas>
  );
});

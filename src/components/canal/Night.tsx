"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { TUNING } from "@/game/tuning";
import { Grain } from "@/components/ui/Grain";

const SKY_FRAGMENT = `
  varying vec3 vDir;
  uniform vec3 moon;
  void main() {
    vec3 d = normalize(vDir);
    vec3 col = mix(vec3(0.075, 0.115, 0.19), vec3(0.012, 0.02, 0.045), smoothstep(-0.15, 0.85, d.y));
    float m = max(dot(d, moon), 0.0);
    col += vec3(0.82, 0.9, 1.0) * (pow(m, 700.0) * 40.0 + pow(m, 24.0) * 0.55);
    gl_FragColor = vec4(col, 1.0);
  }`;

/**
 * Night lighting shared by the minigames: a moonlit sky as environment (so water, helmets and wet
 * tiles reflect something), a cool key light from the moon with soft shadows that follow the
 * player, and a faint fill. Warm light only comes from lamps and searchlights.
 */
export function Night({
  moon,
  focus,
  subject,
  extent = 30,
}: {
  moon: [number, number, number];
  /** Centre of the shadowed area. */
  focus: (out: THREE.Vector3) => void;
  /** Where the hero is: a faint cool light keeps them readable in the dark. Not used over
   *  water, where it would mirror as a bright blob. It never makes anyone visible to guards. */
  subject?: (out: THREE.Vector3) => void;
  extent?: number;
}) {
  const { gl, scene } = useThree();
  const key = useRef<THREE.DirectionalLight>(null);
  const rim = useRef<THREE.PointLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const centre = useMemo(() => new THREE.Vector3(), []);
  const offset = useMemo(() => new THREE.Vector3(...moon), [moon]);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const sky = new THREE.Scene();
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(40, 32, 16),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: { moon: { value: offset.clone().normalize() } },
        vertexShader: "varying vec3 vDir; void main() { vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
        fragmentShader: SKY_FRAGMENT,
      }),
    );
    sky.add(dome);
    const env = pmrem.fromScene(sky, 0.03);
    scene.environment = env.texture;
    scene.environmentIntensity = 0.8;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
      dome.geometry.dispose();
      (dome.material as THREE.Material).dispose();
    };
  }, [gl, scene, offset]);

  useFrame(() => {
    focus(centre);
    // Snap to whole metres so the shadow map does not crawl while the player moves.
    centre.set(Math.round(centre.x), Math.round(centre.y), Math.round(centre.z));
    target.position.copy(centre);
    target.updateMatrixWorld();
    key.current?.position.copy(centre).add(offset);
    if (rim.current && subject) {
      subject(rim.current.position);
      rim.current.position.y += 2.4;
    }
  });

  return (
    <>
      <ambientLight color="#5d7399" intensity={0.7} />
      <hemisphereLight args={["#6f8cb8", "#0a0e14", 1.5]} />
      {subject && <pointLight ref={rim} color="#a9c0e8" intensity={9} distance={7} decay={1.6} />}
      <primitive object={target} />
      <directionalLight
        ref={key}
        target={target}
        color="#bfd2f2"
        intensity={3.4}
        castShadow={TUNING.gfx.shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0006}
        shadow-normalBias={0.05}
        shadow-camera-left={-extent}
        shadow-camera-right={extent}
        shadow-camera-top={extent}
        shadow-camera-bottom={-extent}
        shadow-camera-near={1}
        shadow-camera-far={110}
      />
      <directionalLight color="#7f97c4" intensity={0.7} position={[-offset.x, 10, -offset.z]} />
    </>
  );
}

/** Film look laid over the canvas in CSS: a vignette and fine grain cost the GPU almost nothing. */
export function Cinema() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 85% 70% at 50% 46%, rgba(4,6,10,0) 52%, rgba(4,6,10,.62) 100%)" }} />
      <Grain id="cinema-grain" opacity={0.13} />
    </div>
  );
}

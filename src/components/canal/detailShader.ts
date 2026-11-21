/**
 * GLSL of the kit's detail material (see `detailMaterial` in materials.ts). Every surface gets its
 * pattern from world position, projected on its own plane, so no model needs UVs:
 * - always: brick, tile, wood and stone patterns, rising damp and rain streaks on walls, moss on
 *   roofs, a roughness per material (wet tiles and glass catch the light, brick does not), and,
 *   where a scene sets `uWaterLine`, a wet band and algae on walls standing in the water;
 * - HIFI ("Hoge beeldkwaliteit"): the patterns come from detail maps made from generated material
 *   photos (`public/img/kit/*.webp`, a colour ratio to their mean, so the model keeps its colour),
 *   and their brightness becomes relief.
 */

/** Surface families, stored per vertex as `kind` (see SURFACE in materials.ts). */
export const KIND = { brick: 1, roof: 2, wood: 3, stone: 4, window: 5, soot: 6, cobble: 7, plaster: 8, metal: 9, bark: 10 } as const;

export const fragCommon = /* glsl */ `
varying float vKind;
varying vec3 vWPos;
varying vec3 vWNor;
uniform vec3 uFire[4];
uniform float uWindowGlow;
uniform float uTimeW;
uniform float uWaterLine;
float dHeight;
float dRough;
float dWet;
#ifdef HIFI
uniform highp sampler2DArray uDetail;
uniform float uScale[6];
uniform float uBump;
#endif
float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y);
}
// Relief from a height in screen space (as three's bump map does, without a texture of its own).
vec3 reliefNormal(vec3 pos, vec3 n, float h) {
  vec3 sx = dFdx(pos), sy = dFdy(pos);
  vec3 r1 = cross(sy, n), r2 = cross(n, sx);
  float det = dot(sx, r1);
  vec3 grad = sign(det) * (dFdx(h) * r1 + dFdy(h) * r2);
  return normalize(abs(det) * n - grad);
}`;

export const fragColor = /* glsl */ `
dHeight = 0.0;
dRough = -1.0;
dWet = 0.0;
{
  float k = floor(vKind + 0.5);
  vec3 n = normalize(vWNor);
  // each face gets its own plane: u along the face, v up it (up the slope on a roof)
  vec3 t = abs(n.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : normalize(cross(vec3(0.0, 1.0, 0.0), n));
  vec2 uv = vec2(dot(vWPos, t), dot(vWPos, cross(n, t)));
  float dist = length(vWPos - cameraPosition);
  float fade = smoothstep(75.0, 12.0, dist);
  float grain = 0.5 * vnoise(uv * 9.0) + 0.5 * vnoise(uv * 2.3);
  vec3 detail = vec3(0.95 + 0.1 * grain);
  float joint = 0.0;
#ifdef HIFI
  // one fetch for every fragment (outside any branch, so the mip level is always right)
  float layer = k == 1.0 ? 0.0 : k == 2.0 ? 1.0 : k == 3.0 ? 2.0 : k == 4.0 ? 3.0 : k == 7.0 ? 4.0 : k == 8.0 ? 5.0 : -1.0;
  float sc = uScale[int(max(layer, 0.0))];
  vec3 tex = texture(uDetail, vec3(uv / sc, max(layer, 0.0))).rgb * 3.0;
  float lum = dot(tex, vec3(0.2126, 0.7152, 0.0722));
  if (layer >= 0.0) {
    detail = tex;
    // light mortar on brick sits deeper; elsewhere the dark joints and hollows do
    dHeight = k == 1.0 ? -lum : lum;
    joint = clamp(1.0 - lum, 0.0, 1.0);
  }
#else
  if (k == 1.0) {
    vec2 b = uv / vec2(0.44, 0.15);
    b.x += 0.5 * mod(floor(b.y), 2.0);
    vec2 f = fract(b);
    float face = smoothstep(0.0, 0.07, f.x) * smoothstep(0.0, 0.16, f.y);
    // lime mortar: lighter and greyer than the brick
    detail = mix(vec3(1.25, 1.45, 1.6), vec3(0.8 + 0.4 * h21(floor(b))), mix(1.0, face, fade));
    joint = 1.0 - face;
  } else if (k == 2.0) {
    vec2 tt = uv / vec2(0.3, 0.36);
    tt.x += 0.5 * mod(floor(tt.y), 2.0);
    vec2 f = fract(tt);
    detail = vec3((0.78 + 0.34 * h21(floor(tt))) * (0.7 + 0.3 * smoothstep(0.0, 0.55, f.y)) * (0.86 + 0.14 * smoothstep(0.0, 0.12, f.x)));
    joint = 1.0 - smoothstep(0.0, 0.4, f.y);
  } else if (k == 3.0) {
    detail = vec3(0.8 + 0.2 * vnoise(uv * vec2(34.0, 3.0)) + 0.2 * vnoise(uv * vec2(3.0, 34.0)));
  } else if (k == 4.0 || k == 7.0) {
    vec2 c = uv * (k == 7.0 ? 6.0 : 3.1);
    vec2 f = abs(fract(c) - 0.5);
    float face = smoothstep(0.5, 0.38, max(f.x, f.y));
    detail = vec3(mix(0.58, 0.8 + 0.38 * h21(floor(c)), face));
    joint = 1.0 - face;
  }
  detail = mix(vec3(1.0), detail, fade);
#endif
  if (k == 10.0) {
    // bark: long furrows up the trunk and branches, ridges a little lighter
    float f = smoothstep(0.25, 0.75, vnoise(vec2(uv.x * 15.0, uv.y * 1.4)) * 0.75 + vnoise(uv * vec2(40.0, 6.0)) * 0.25);
    detail = vec3(mix(0.5, 1.2, f));
    dHeight = f * 0.8;
    joint = 1.0 - f;
  }
  detail *= 0.92 + 0.16 * grain;
  float wall = 1.0 - smoothstep(0.3, 0.6, abs(n.y));
  if (wall > 0.0 && (k == 1.0 || k == 3.0 || k == 4.0 || k == 8.0)) {
    // rising damp at the foot of walls and quays, rain streaks running down from sills and eaves
    float damp = 1.0 - smoothstep(0.0, 0.8 + 0.7 * vnoise(vec2(uv.x * 1.7, 0.0)), vWPos.y);
    float streak = smoothstep(0.35, 0.75, vnoise(vec2(uv.x * 6.0, vWPos.y * 0.3)) * (0.6 + 0.6 * vnoise(vec2(uv.x * 1.3 + 7.0, vWPos.y * 0.8))));
    detail *= mix(vec3(1.0), vec3(0.62, 0.68, 0.6), damp * wall);
    detail *= 1.0 - 0.2 * streak * wall;
  }
  float wl = vWPos.y - uWaterLine;
  if (wall > 0.0 && wl > -2.0 && wl < 1.2) {
    // where walls stand in the canal: soaked and dark just above the water, a band of green algae
    // at the waterline, the stone below it slimy and shining
    dWet = (1.0 - smoothstep(0.0, 0.55 + 0.35 * vnoise(vec2(uv.x * 2.7, 3.0)), wl)) * wall;
    float algae = (1.0 - smoothstep(0.0, 0.16 + 0.14 * vnoise(vec2(uv.x * 6.0, 1.0)), abs(wl - 0.04))) * wall;
    detail *= mix(vec3(1.0), vec3(0.5, 0.54, 0.48), dWet);
    detail *= mix(vec3(1.0), vec3(0.6, 0.95, 0.45), algae * 0.85);
  }
  if (k == 2.0) {
    // moss gathers where the tiles overlap and in the hollows
    float moss = smoothstep(0.5, 0.8, 0.7 * vnoise(uv * 1.4) + 0.3 * vnoise(uv * 8.0)) * (0.4 + 0.6 * joint);
    detail *= mix(vec3(1.0), vec3(0.78, 1.0, 0.55), moss * 0.7);
  }
  if (k == 6.0) detail *= 0.7 + 0.3 * grain;
  float puddle = 0.0;
  if (k == 9.0) {
    // lead: sheets with raised seams every 0.6 m, dull grey with a white bloom; on a flat roof
    // the rain stands in shallow puddles that mirror the moon and the searchlight
    float seam = smoothstep(0.475, 0.5, abs(fract(uv.x / 0.6) - 0.5));
    detail *= (0.9 + 0.2 * vnoise(uv * vec2(2.0, 0.4))) * mix(1.0, 1.12, seam);
    if (n.y > 0.9) {
      puddle = smoothstep(0.55, 0.68, 0.6 * vnoise(uv * 0.45) + 0.4 * vnoise(uv * 1.6 + 3.0)) * (1.0 - seam);
      detail *= mix(1.0, 0.55, puddle);
    }
  }
  diffuseColor.rgb *= detail;
  // roughness per material: joints stay matt, tiles are damp, glass and lead shine
  if (k == 1.0) dRough = 0.88 + 0.1 * joint;
  else if (k == 2.0) dRough = 0.55 + 0.3 * joint;
  else if (k == 3.0) dRough = 0.78;
  else if (k == 4.0) dRough = 0.8 + 0.12 * joint;
  else if (k == 5.0) dRough = 0.12;
  else if (k == 6.0) dRough = 0.97;
  else if (k == 7.0) dRough = 0.6 + 0.3 * joint;
  else if (k == 8.0) dRough = 0.9;
  else if (k == 9.0) dRough = mix(0.5, 0.04, puddle);
  else if (k == 10.0) dRough = 0.95;
  if (dWet > 0.0) dRough = mix(dRough < 0.0 ? 0.86 : dRough, 0.18, dWet);
#ifdef HIFI
  dHeight *= uBump * smoothstep(40.0, 6.0, dist);
#endif
}`;

export const fragRoughness = /* glsl */ `
if (dRough >= 0.0) roughnessFactor = dRough;`;

export const fragNormal = /* glsl */ `
#ifdef HIFI
normal = reliefNormal(-vViewPosition, normal, dHeight);
#endif`;

export const fragWindows = /* glsl */ `
if (uWindowGlow > 0.0 && vKind > 4.5 && vKind < 5.5) {
  // Each window is its own cell: some hold a dim lamp behind the blackout curtain, all
  // pick up the orange of nearby fires, flickering.
  // x + z: works for streets along Z (chapters 4, 5) and the row of houses along X (chapter 2).
  vec2 wc = vec2(floor((vWPos.x + vWPos.z) / 1.7), floor(vWPos.y / 2.7));
  float hw = h21(wc);
  float fire = 0.0;
  for (int i = 0; i < 4; i++) {
    float d = distance(vWPos.xz, uFire[i].xy);
    fire += uFire[i].z / (1.0 + d * d * 0.03);
  }
  float flick = 0.75 + 0.25 * sin(uTimeW * (6.0 + 5.0 * hw) + hw * 40.0);
  totalEmissiveRadiance += vec3(1.0, 0.44, 0.14) * fire * flick * 0.6 * (0.3 + 0.7 * hw) * uWindowGlow;
  totalEmissiveRadiance += vec3(1.0, 0.68, 0.34) * step(0.86, hw) * 0.55 * flick * uWindowGlow;
}`;

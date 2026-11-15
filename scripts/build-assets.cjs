/* eslint-disable */
// `npm run assets`: runs every assets/blender/build_*.py headless, tidies the GLBs with
// gltf-transform (dedup + prune; node names and hierarchy are kept, no mesh compression so the
// game needs no decoder; characters also get a 512 px WebP texture and quantized attributes) and enforces the size budget from CLAUDE.md.
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "assets", "blender");
const OUT = path.join(ROOT, "public", "models");
const MAX_KB = 250;
// The 1.5 MB budget of CLAUDE.md applies per minigame (the models it loads), not to the whole kit.
const MAX_TOTAL_KB = 3000;

function run(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: ROOT, encoding: "utf8" });
  if (r.status !== 0) {
    console.error((r.stdout || "") + (r.stderr || ""));
    throw new Error(`${cmd} ${args.join(" ")} failed`);
  }
  return r;
}

/** Reads node names, material names and the triangle count straight from the GLB's JSON chunk. */
function inspect(file) {
  const buf = fs.readFileSync(file);
  const json = JSON.parse(buf.subarray(20, 20 + buf.readUInt32LE(12)).toString("utf8"));
  let triangles = 0;
  for (const mesh of json.meshes || []) {
    for (const prim of mesh.primitives) {
      const acc = json.accessors[prim.indices ?? prim.attributes.POSITION];
      triangles += acc.count / 3;
    }
  }
  return {
    triangles,
    nodes: (json.nodes || []).map((n) => n.name),
    materials: (json.materials || []).map((m) => m.name),
  };
}

/** Characters (see assets/blender/_figure.py) carry a texture, a skeleton and motion clips. */
const FIGURES = new Set(["koerier", "soldaat", "man", "vrouw", "moves"]);

/**
 * The exporter samples location, rotation and scale for every bone. Only the rotations matter,
 * plus where the hips travel; dropping the rest cuts a clip to a third. Rewrites the GLB's JSON
 * chunk; `gltf-transform prune` afterwards removes the orphaned data.
 */
function slimAnimations(file) {
  const buf = fs.readFileSync(file);
  const jsonLength = buf.readUInt32LE(12);
  const json = JSON.parse(buf.subarray(20, 20 + jsonLength).toString("utf8"));
  for (const anim of json.animations || []) {
    anim.channels = anim.channels.filter((c) => c.target.path === "rotation" || (c.target.path === "translation" && json.nodes[c.target.node].name === "Hips"));
  }
  let text = Buffer.from(JSON.stringify(json), "utf8");
  text = Buffer.concat([text, Buffer.alloc((4 - (text.length % 4)) % 4, 0x20)]);
  const rest = buf.subarray(20 + jsonLength);
  const head = Buffer.alloc(20);
  buf.copy(head, 0, 0, 12);
  head.writeUInt32LE(20 + text.length + rest.length, 8);
  head.writeUInt32LE(text.length, 12);
  head.writeUInt32LE(0x4e4f534a, 16);
  fs.writeFileSync(file, Buffer.concat([head, text, rest]));
}

// `npm run assets -- koerier man` rebuilds only those.
const only = process.argv.slice(2);
const scripts = fs.readdirSync(SRC).filter((f) => /^build_.*\.py$/.test(f) && (only.length === 0 || only.includes(f.replace(/^build_|\.py$/g, "")))).sort();
const rows = [];
let failed = false;
for (const script of scripts) {
  const name = script.replace(/^build_|\.py$/g, "");
  const glb = path.join(OUT, `${name}.glb`);
  process.stdout.write(`building ${name} ... `);
  run("python3", [path.join(SRC, script)]);
  if (FIGURES.has(name)) {
    slimAnimations(glb);
    run("gltf-transform", ["resize", glb, glb, "--width", "512", "--height", "512"]);
    run("gltf-transform", ["webp", glb, glb, "--quality", "82"]);
    run("gltf-transform", ["resample", glb, glb]);
    // 16-bit positions and 8-bit normals and weights; three.js reads these without a decoder
    run("gltf-transform", ["quantize", glb, glb]);
  }
  run("gltf-transform", ["dedup", glb, glb]);
  run("gltf-transform", ["prune", glb, glb, "--keep-leaves", "true"]);
  const kb = fs.statSync(glb).size / 1024;
  const info = inspect(glb);
  if (kb > MAX_KB) failed = true;
  rows.push({ asset: name, KB: kb.toFixed(1), triangles: info.triangles, nodes: info.nodes.join(" "), materials: info.materials.join(" ") });
  console.log("ok");
}
console.table(rows);
const total = rows.reduce((sum, r) => sum + Number(r.KB), 0);
console.log(`total ${total.toFixed(1)} KB (budget ${MAX_TOTAL_KB} KB, ${MAX_KB} KB per file)`);
if (failed || total > MAX_TOTAL_KB) {
  console.error("Asset budget exceeded.");
  process.exit(1);
}

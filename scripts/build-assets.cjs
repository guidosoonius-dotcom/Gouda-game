/* eslint-disable */
// `npm run assets`: runs every assets/blender/build_*.py headless, tidies the GLBs with
// gltf-transform (dedup + prune; node names and hierarchy are kept, no mesh compression so the
// game needs no decoder) and enforces the size budget from CLAUDE.md.
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "assets", "blender");
const OUT = path.join(ROOT, "public", "models");
const MAX_KB = 250;
const MAX_TOTAL_KB = 1500;

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

const scripts = fs.readdirSync(SRC).filter((f) => /^build_.*\.py$/.test(f)).sort();
const rows = [];
let failed = false;
for (const script of scripts) {
  const name = script.replace(/^build_|\.py$/g, "");
  const glb = path.join(OUT, `${name}.glb`);
  process.stdout.write(`building ${name} ... `);
  run("python3", [path.join(SRC, script)]);
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

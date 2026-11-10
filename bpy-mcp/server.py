"""MCP-server rond Blender's `bpy` module (headless, persistente scène).

Start:  python3 server.py   (stdio-transport)
Env:    BLENDER_MCP_WORKDIR  map voor uitvoerbestanden (default: ./output)
"""
import contextlib
import io
import os
import sys
import traceback
from pathlib import Path

# --- Houd stdout schoon voor het MCP-protocol -------------------------------
# bpy (C-code) schrijft zelf naar fd 1. Bewaar de echte stdout voor MCP en
# stuur fd 1 om naar stderr, voordat bpy wordt geïmporteerd.
_proto_fd = os.dup(1)
os.dup2(2, 1)
sys.stdout = io.TextIOWrapper(os.fdopen(_proto_fd, "wb"), encoding="utf-8", write_through=True)

import bpy  # noqa: E402
from mcp.server.fastmcp import FastMCP, Image  # noqa: E402

WORKDIR = Path(os.environ.get("BLENDER_MCP_WORKDIR", "output")).resolve()
WORKDIR.mkdir(parents=True, exist_ok=True)

mcp = FastMCP("bpy")


def _path(name: str) -> Path:
    """Los een bestandsnaam op binnen WORKDIR (geen ontsnappen via ..)."""
    p = (WORKDIR / name).resolve()
    if WORKDIR not in p.parents and p != WORKDIR:
        raise ValueError(f"Pad valt buiten werkmap: {name}")
    p.parent.mkdir(parents=True, exist_ok=True)
    return p


@mcp.tool()
def run_python(code: str) -> str:
    """Voer Python-code uit in de Blender-scène (`bpy` en `C` zijn al beschikbaar).
    De scène blijft behouden tussen aanroepen. Gebruik print() om waarden terug te krijgen."""
    buf = io.StringIO()
    env = {"bpy": bpy, "C": bpy.context, "D": bpy.data, "WORKDIR": WORKDIR}
    try:
        with contextlib.redirect_stdout(buf), contextlib.redirect_stderr(buf):
            exec(compile(code, "<run_python>", "exec"), env)
    except Exception:
        return buf.getvalue() + "\n" + traceback.format_exc()
    return buf.getvalue() or "OK (geen uitvoer)"


@mcp.tool()
def scene_info() -> dict:
    """Overzicht van de huidige scène: objecten, camera, render-engine."""
    s = bpy.context.scene
    return {
        "blender": bpy.app.version_string,
        "engine": s.render.engine,
        "camera": s.camera.name if s.camera else None,
        "frame": [s.frame_start, s.frame_end],
        "objects": [
            {
                "name": o.name,
                "type": o.type,
                "location": [round(v, 3) for v in o.location],
                "dimensions": [round(v, 3) for v in o.dimensions],
            }
            for o in s.objects
        ],
        "workdir": str(WORKDIR),
    }


@mcp.tool()
def render(
    filename: str = "render.png",
    width: int = 960,
    height: int = 540,
    engine: str = "BLENDER_EEVEE",
    samples: int = 16,
) -> list:
    """Render het huidige frame naar een PNG in de werkmap en toon het beeld.
    engine: BLENDER_EEVEE (snel) of CYCLES (traag op CPU; houd samples laag)."""
    s = bpy.context.scene
    if s.camera is None:
        return ["Geen camera in de scène. Voeg er een toe en zet scene.camera."]
    s.render.engine = engine
    s.render.resolution_x, s.render.resolution_y = width, height
    s.render.resolution_percentage = 100
    if engine == "CYCLES":
        s.cycles.samples = samples
        s.cycles.device = "CPU"
    elif hasattr(s, "eevee"):
        s.eevee.taa_render_samples = samples
    out = _path(filename)
    s.render.filepath = str(out)
    s.render.image_settings.file_format = "PNG"
    bpy.ops.render.render(write_still=True)
    return [f"Opgeslagen: {out}", Image(path=str(out))]


@mcp.tool()
def export_model(filename: str = "model.glb", selected_only: bool = False) -> str:
    """Exporteer de scène als .glb, .gltf, .fbx of .obj (op extensie)."""
    out = _path(filename)
    ext = out.suffix.lower()
    # De glTF/FBX-exporters printen naar Python-stdout (= protocolkanaal): omleiden.
    with contextlib.redirect_stdout(sys.stderr):
        return _export(out, ext, selected_only)


def _export(out: Path, ext: str, selected_only: bool) -> str:
    if ext in (".glb", ".gltf"):
        bpy.ops.export_scene.gltf(
            filepath=str(out),
            export_format="GLB" if ext == ".glb" else "GLTF_SEPARATE",
            use_selection=selected_only,
        )
    elif ext == ".fbx":
        bpy.ops.export_scene.fbx(filepath=str(out), use_selection=selected_only)
    elif ext == ".obj":
        bpy.ops.wm.obj_export(filepath=str(out), export_selected_objects=selected_only)
    else:
        return f"Onbekend formaat: {ext}"
    return f"Geëxporteerd: {out} ({out.stat().st_size} bytes)"


@mcp.tool()
def save_blend(filename: str = "scene.blend") -> str:
    """Sla de scène op als .blend (nodig om werk te bewaren na het einde van de sessie)."""
    out = _path(filename)
    with contextlib.redirect_stdout(sys.stderr):
        bpy.ops.wm.save_as_mainfile(filepath=str(out))
    return f"Opgeslagen: {out}"


@mcp.tool()
def open_blend(filename: str) -> str:
    """Open een bestaand .blend-bestand uit de werkmap."""
    out = _path(filename)
    with contextlib.redirect_stdout(sys.stderr):
        bpy.ops.wm.open_mainfile(filepath=str(out))
    return f"Geopend: {out}"


@mcp.tool()
def reset_scene(with_defaults: bool = True) -> str:
    """Maak de scène leeg. with_defaults=True geeft een lege scène met camera en zon."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if with_defaults:
        import math

        # Lichte achtergrond (anders is de wereld zwart)
        world = bpy.data.worlds.new("World")
        world.use_nodes = True
        world.node_tree.nodes["Background"].inputs[0].default_value = (0.6, 0.7, 0.9, 1)
        bpy.context.scene.world = world
        # Schuine zon, geen loodrechte lichtval
        bpy.ops.object.light_add(
            type="SUN", location=(4, -4, 6),
            rotation=(math.radians(50), 0, math.radians(35)),
        )
        bpy.context.object.data.energy = 4
        # Camera die op het midden (0,0,1) gericht blijft
        bpy.ops.object.empty_add(location=(0, 0, 1))
        target = bpy.context.object
        target.name = "CameraTarget"
        bpy.ops.object.camera_add(location=(0, -7, 2.5))
        cam = bpy.context.object
        con = cam.constraints.new("TRACK_TO")
        con.target, con.track_axis, con.up_axis = target, "TRACK_NEGATIVE_Z", "UP_Y"
        bpy.context.scene.camera = cam
    return "Scène gereset."


if __name__ == "__main__":
    reset_scene()
    mcp.run(transport="stdio")

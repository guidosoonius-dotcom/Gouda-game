"""Shared helpers for the asset kit. Blender is Z-up; the glTF exporter converts to Y-up.

Game convention (glTF): the canal runs along Z and the boat travels toward -Z.
In Blender that is: canal along Y, boat travels toward +Y, X is across the canal, Z is up.
Materials are flat base colours only; lighting is designed in the game, not here.
"""
import math
import os
import sys

import bpy  # must come first: importing bpy makes bmesh and mathutils available

import bmesh  # noqa: E402
from mathutils import Euler, Matrix, Vector  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MODELS = os.path.join(ROOT, "public", "models")
PREVIEWS = os.path.join(ROOT, "assets", "blender", "previews")

# name -> (hex colour, double sided)
MATERIALS = {
    "Brick": ("#7a4a3a", False),
    "BrickDark": ("#4a3028", False),
    "Stone": ("#9a968c", False),
    "Cobble": ("#6e6a63", False),
    "Wood": ("#7a5a3a", False),
    "WoodDark": ("#4a3624", False),
    "WoodWhite": ("#e4e0d2", False),
    "Reed": ("#8f9a55", True),
    "ReedPlume": ("#6a5a3a", True),
    "Coat": ("#2b313a", False),
    "Skin": ("#b89478", False),
    "Metal": ("#3a3d42", False),
    "Lamp": ("#ffd98a", False),
    "Roof": ("#4a3d3a", False),
    "WindowDark": ("#1c2530", False),
    "Shutter": ("#3d4a3a", False),
    "Uniform": ("#5b6257", False),
    "Helmet": ("#3f463d", False),
    "Boot": ("#1d1d1f", False),
    "Sand": ("#8d7f5f", False),
    "Bark": ("#3b2f26", False),
    "Leaf": ("#6a6232", True),
}


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def _srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def material(name):
    mat = bpy.data.materials.get(name)
    if mat:
        return mat
    hexcol, double = MATERIALS[name]
    rgb = [_srgb_to_linear(int(hexcol[i : i + 2], 16) / 255) for i in (1, 3, 5)]
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*rgb, 1)
    bsdf.inputs["Roughness"].default_value = 0.9
    mat.use_backface_culling = not double
    return mat


class Builder:
    """Collects boxes, cylinders and polygons into one flat-shaded mesh object."""

    def __init__(self, name):
        self.name = name
        self.bm = bmesh.new()
        self.mats = []

    def _index(self, mat):
        if mat not in self.mats:
            self.mats.append(mat)
        return self.mats.index(mat)

    def _paint(self, verts, mat):
        idx = self._index(mat)
        for f in {f for v in verts for f in v.link_faces}:
            f.material_index = idx

    def box(self, size, loc, mat, rot=(0, 0, 0)):
        m = Matrix.Translation(loc) @ Euler(rot).to_matrix().to_4x4() @ Matrix.Diagonal((*size, 1))
        self._paint(bmesh.ops.create_cube(self.bm, size=1.0, matrix=m)["verts"], mat)

    def cyl(self, r1, r2, h, loc, mat, segs=8, rot=(0, 0, 0)):
        m = Matrix.Translation(loc) @ Euler(rot).to_matrix().to_4x4()
        geom = bmesh.ops.create_cone(self.bm, cap_ends=True, segments=segs, radius1=r1, radius2=r2, depth=h, matrix=m)
        self._paint(geom["verts"], mat)

    def ico(self, radius, loc, mat, scale=(1, 1, 1), subdiv=2):
        m = Matrix.Translation(loc) @ Matrix.Diagonal((*scale, 1))
        geom = bmesh.ops.create_icosphere(self.bm, subdivisions=subdiv, radius=radius, matrix=m)
        self._paint(geom["verts"], mat)

    def poly(self, pts, mat):
        face = self.bm.faces.new([self.bm.verts.new(p) for p in pts])
        face.material_index = self._index(mat)
        return face

    def loft(self, rings, mat, cap_first=True, cap_last=True):
        """Skin between closed rings of equal length (lists of 3D points)."""
        idx = self._index(mat)
        vs = [[self.bm.verts.new(p) for p in ring] for ring in rings]
        n = len(vs[0])
        for a, b in zip(vs, vs[1:]):
            for i in range(n):
                j = (i + 1) % n
                self.bm.faces.new([a[i], a[j], b[j], b[i]]).material_index = idx
        if cap_first:
            self.bm.faces.new(list(reversed(vs[0]))).material_index = idx
        if cap_last:
            self.bm.faces.new(vs[-1]).material_index = idx

    def build(self, recalc=True, bevel=0.0):
        """`bevel` (metres) rounds every hard edge and shades the object smooth: edges catch the
        light instead of ending in a knife line. Large flat architecture keeps bevel=0."""
        if recalc:
            bmesh.ops.recalc_face_normals(self.bm, faces=self.bm.faces)
        mesh = bpy.data.meshes.new(self.name)
        self.bm.to_mesh(mesh)
        self.bm.free()
        for m in self.mats:
            mesh.materials.append(material(m))
        obj = bpy.data.objects.new(self.name, mesh)
        bpy.context.scene.collection.objects.link(obj)
        if bevel > 0:
            for poly in mesh.polygons:
                poly.use_smooth = True
            mod = obj.modifiers.new("Bevel", "BEVEL")
            mod.width, mod.segments, mod.limit_method, mod.angle_limit = bevel, 2, "ANGLE", math.radians(38)
            # keeps big faces flat while the bevels roll the light around the edge
            normals = obj.modifiers.new("Normals", "WEIGHTED_NORMAL")
            normals.keep_sharp, normals.weight = False, 70
        return obj


def empty(name, loc):
    obj = bpy.data.objects.new(name, None)
    obj.location = loc
    obj.empty_display_size = 0.1
    bpy.context.scene.collection.objects.link(obj)
    return obj


def triangles():
    total = 0
    for o in bpy.context.scene.objects:
        if o.type == "MESH":
            total += sum(len(p.vertices) - 2 for p in o.data.polygons)
    return total


def export(name):
    os.makedirs(MODELS, exist_ok=True)
    path = os.path.join(MODELS, f"{name}.glb")
    bpy.ops.export_scene.gltf(
        filepath=path, export_format="GLB", export_apply=True, export_yup=True, export_cameras=False, export_lights=False
    )
    print(f"ASSET {name}: {triangles()} triangles, {os.path.getsize(path) / 1024:.1f} KB", file=sys.stderr)
    return path


def preview(name, view=(1.0, -1.25, 0.8)):
    """One low-res EEVEE render (480x270, 8 samples) for visual QA. Call after export()."""
    scene = bpy.context.scene
    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    for o in scene.objects:
        if o.type != "MESH":
            continue
        for corner in o.bound_box:
            p = o.matrix_world @ Vector(corner)
            lo = Vector(map(min, lo, p))
            hi = Vector(map(max, hi, p))
    centre = (lo + hi) / 2
    size = max((hi - lo).length, 0.5)

    world = bpy.data.worlds.new("World")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = (0.55, 0.62, 0.72, 1)
    world.node_tree.nodes["Background"].inputs[1].default_value = 0.8
    scene.world = world
    sun = bpy.data.objects.new("Sun", bpy.data.lights.new("Sun", "SUN"))
    sun.data.energy = 3.5
    sun.rotation_euler = (math.radians(52), 0, math.radians(32))
    scene.collection.objects.link(sun)
    target = empty("Target", centre)
    cam = bpy.data.objects.new("Cam", bpy.data.cameras.new("Cam"))
    cam.data.lens = 35
    cam.location = centre + Vector(view).normalized() * size * 2.0
    track = cam.constraints.new("TRACK_TO")
    track.target, track.track_axis, track.up_axis = target, "TRACK_NEGATIVE_Z", "UP_Y"
    scene.collection.objects.link(cam)
    scene.camera = cam
    scene.render.engine = "BLENDER_EEVEE"
    scene.eevee.taa_render_samples = 8
    scene.render.resolution_x, scene.render.resolution_y = 480, 270
    scene.render.image_settings.file_format = "PNG"
    os.makedirs(PREVIEWS, exist_ok=True)
    scene.render.filepath = os.path.join(PREVIEWS, f"{name}.png")
    bpy.ops.render.render(write_still=True)

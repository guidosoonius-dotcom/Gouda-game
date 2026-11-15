"""Characters. Unlike the rest of the kit these are not modelled by hand: each starts from a
character sheet (docs/characters/*.webp), was lifted to a textured mesh with Higgsfield (SAM 3D)
and, for the courier and the soldier, rigged by Higgsfield (Meshy) with one motion clip. The
generated originals live in assets/characters/. This script makes them fit for a phone:

- welds and decimates the mesh, keeps the skin weights and the texture;
- gives the man and the woman the soldier's skeleton (weights copied from his mesh, they wear
  the same kind of long coat), so the three share their clips;
- rewrites the motion clips as rotations only, with the forward travel taken out of the hips,
  and retargets the courier's run onto the soldier's skeleton.

All figures face -Y (game +Z), stand on the origin and are in metres. No one is modelled after a
real person.
"""
import os
import sys

import bpy  # noqa: I001

import bmesh  # noqa: E402
from mathutils import Quaternion, Vector  # noqa: E402

from _lib import MODELS, ROOT, preview, triangles  # noqa: E402

SRC = os.path.join(ROOT, "assets", "characters")
FPS = 30


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.scene.render.fps = FPS


def load(file):
    """Imports a generated GLB; returns (armature or None, mesh). Scale is applied: metres."""
    before = set(bpy.context.scene.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(SRC, file))
    new = [o for o in bpy.context.scene.objects if o not in before]
    for o in new:
        if o.type == "MESH" and o.name.startswith("Icosphere"):  # the rigger's placeholder
            bpy.data.objects.remove(o)
    new = [o for o in bpy.context.scene.objects if o not in before]
    arm = next((o for o in new if o.type == "ARMATURE"), None)
    mesh = next(o for o in new if o.type == "MESH")
    return arm, mesh


def activate(*objs):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[-1]


def capture(arm):
    """The armature's current action as skeleton-independent data: per frame, per bone, the
    world rotation away from the rest pose, plus the hips' travel in metres (forward removed)."""
    scene = bpy.context.scene
    action = arm.animation_data.action
    first, last = (int(round(v)) for v in action.frame_range)
    rest = {b.name: (arm.matrix_world @ b.matrix_local).to_quaternion() for b in arm.data.bones}
    hips_rest = arm.matrix_world @ arm.data.bones["Hips"].head_local
    frames = []
    for f in range(first, last + 1):
        scene.frame_set(f)
        bpy.context.view_layer.update()
        delta = {pb.name: (arm.matrix_world @ pb.matrix).to_quaternion() @ rest[pb.name].inverted() for pb in arm.pose.bones}
        travel = (arm.matrix_world @ arm.pose.bones["Hips"].head) - hips_rest
        frames.append((delta, Vector((travel.x, 0.0, travel.z))))
    scene.frame_set(first)
    return {"frames": frames, "hip_height": hips_rest.z}


def bake(arm, motion, name):
    """Writes captured motion onto `arm` as a new action called `name`, parked on an NLA track."""
    arm.animation_data_create()
    arm.animation_data.action = None
    for pb in arm.pose.bones:
        pb.rotation_mode = "QUATERNION"
        pb.rotation_quaternion = Quaternion()
        pb.location = Vector()
        pb.scale = Vector((1, 1, 1))
    bones = arm.data.bones
    rest = {b.name: b.matrix_local.to_quaternion() for b in bones}
    order = [b for b in bones if b.parent is None]
    for b in order:
        order.extend(b.children)
    ratio = bones["Hips"].head_local.z / motion["hip_height"]
    for i, (delta, travel) in enumerate(motion["frames"]):
        world = {}
        for b in order:
            world[b.name] = delta.get(b.name, Quaternion()) @ rest[b.name]
            pb = arm.pose.bones[b.name]
            if b.parent:
                local_rest = rest[b.parent.name].inverted() @ rest[b.name]
                pb.rotation_quaternion = local_rest.inverted() @ (world[b.parent.name].inverted() @ world[b.name])
            else:
                pb.rotation_quaternion = rest[b.name].inverted() @ world[b.name]
                pb.location = rest[b.name].inverted() @ (travel * ratio)
                pb.keyframe_insert("location", frame=i + 1)
            pb.keyframe_insert("rotation_quaternion", frame=i + 1)
    action = arm.animation_data.action
    action.name = name
    track = arm.animation_data.nla_tracks.new()
    track.name = name
    track.strips.new(name, 1, action)
    arm.animation_data.action = None
    for pb in arm.pose.bones:
        pb.rotation_quaternion = Quaternion()
        pb.location = Vector()


def forget_motion(arm):
    """Drops the generated action so only what `bake` wrote is exported."""
    if arm.animation_data:
        arm.animation_data.action = None
        for t in list(arm.animation_data.nla_tracks):
            arm.animation_data.nla_tracks.remove(t)
    for a in list(bpy.data.actions):
        bpy.data.actions.remove(a)
    # the last evaluated frame would otherwise stay behind as the pose (in the rigger's centimetres)
    for pb in arm.pose.bones:
        pb.rotation_mode = "QUATERNION"
        pb.rotation_quaternion = Quaternion()
        pb.location = Vector()
        pb.scale = Vector((1, 1, 1))


def apply_scale(arm, mesh):
    activate(mesh, arm)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)


def simplify(mesh, target):
    """Welds the split vertices and decimates to about `target` triangles."""
    bm = bmesh.new()
    bm.from_mesh(mesh.data)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0004)
    bm.to_mesh(mesh.data)
    bm.free()
    count = sum(len(p.vertices) - 2 for p in mesh.data.polygons)
    if count > target:
        mod = mesh.modifiers.new("Decimate", "DECIMATE")
        mod.ratio = target / count
        activate(mesh)
        while mesh.modifiers[0].name != "Decimate":
            bpy.ops.object.modifier_move_up(modifier="Decimate")
        bpy.ops.object.modifier_apply(modifier="Decimate")
    for p in mesh.data.polygons:
        p.use_smooth = True
    for m in mesh.data.materials:
        bsdf = m.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Roughness"].default_value = 0.92
            bsdf.inputs["Metallic"].default_value = 0.0


def hands(mesh):
    """Half-width at the hands and their height: the vertices furthest from the body axis."""
    pts = [mesh.matrix_world @ v.co for v in mesh.data.vertices]
    reach = max(abs(p.x) for p in pts)
    tips = [p for p in pts if abs(p.x) > reach * 0.93]
    return reach, sum(p.z for p in tips) / len(tips)


def dress(mesh, arm, donor):
    """Fits an unrigged mesh to the donor's skeleton: stands it on the origin at the donor's
    height, lines the hands up, and copies the skin weights from the donor's mesh."""
    pts = [v.co.copy() for v in mesh.data.vertices]
    lo = min(p.z for p in pts)
    height = max(p.z for p in pts) - lo
    d_pts = [donor.matrix_world @ v.co for v in donor.data.vertices]
    d_height = max(p.z for p in d_pts)
    s = d_height / height
    for v in mesh.data.vertices:
        v.co = Vector((v.co.x * s, v.co.y * s, (v.co.z - lo) * s))
    reach, hand_z = hands(mesh)
    d_reach, d_hand_z = hands(donor)
    # same floor and same hand height: stretch below and above the hands separately
    top = max(v.co.z for v in mesh.data.vertices)
    d_torso = [p.y for p in d_pts if 0.55 * d_height < p.z < 0.75 * d_height]
    torso = [v.co.y for v in mesh.data.vertices if 0.55 * d_height < v.co.z < 0.75 * d_height]
    shift = sum(d_torso) / len(d_torso) - sum(torso) / len(torso)
    for v in mesh.data.vertices:
        z = v.co.z
        z = z * d_hand_z / hand_z if z < hand_z else d_hand_z + (z - hand_z) * (d_height - d_hand_z) / (top - hand_z)
        v.co = Vector((v.co.x * d_reach / reach, v.co.y + shift, z))
    print(f"FIT scale {s:.3f} reach {reach:.3f}->{d_reach:.3f} hand z {hand_z:.3f}->{d_hand_z:.3f}", file=sys.stderr)

    arm.data.pose_position = "REST"
    bpy.context.view_layer.update()
    for g in donor.vertex_groups:
        mesh.vertex_groups.new(name=g.name)
    mod = mesh.modifiers.new("Weights", "DATA_TRANSFER")
    mod.object = donor
    mod.use_vert_data = True
    mod.data_types_verts = {"VGROUP_WEIGHTS"}
    mod.vert_mapping = "POLYINTERP_NEAREST"
    mod.layers_vgroup_select_src = "ALL"
    mod.layers_vgroup_select_dst = "NAME"
    activate(mesh)
    bpy.ops.object.modifier_apply(modifier="Weights")
    bpy.ops.object.mode_set(mode="WEIGHT_PAINT")
    bpy.ops.object.vertex_group_smooth(group_select_mode="ALL", factor=0.5, repeat=2)
    bpy.ops.object.vertex_group_limit_total(group_select_mode="ALL", limit=4)
    bpy.ops.object.vertex_group_normalize_all(lock_active=False)
    bpy.ops.object.mode_set(mode="OBJECT")
    arm.data.pose_position = "POSE"
    mesh.parent = arm
    skin = mesh.modifiers.new("Armature", "ARMATURE")
    skin.object = arm


def export(name, objs, animations):
    os.makedirs(MODELS, exist_ok=True)
    path = os.path.join(MODELS, f"{name}.glb")
    activate(*objs)
    bpy.ops.export_scene.gltf(
        filepath=path, export_format="GLB", use_selection=True, export_yup=True, export_cameras=False, export_lights=False,
        export_animations=animations, export_animation_mode="NLA_TRACKS", export_force_sampling=True, export_frame_step=1,
        export_optimize_animation_size=False, export_skins=True, export_influence_nb=4, export_image_format="AUTO",
        export_def_bones=False, export_rest_position_armature=True,
    )
    print(f"ASSET {name}: {triangles()} triangles, {os.path.getsize(path) / 1024:.1f} KB", file=sys.stderr)


def shot(name, arm=None, clip=None, frame=1):
    """Preview render; with `clip`, in the middle of that motion."""
    if arm and clip:
        arm.animation_data.action = bpy.data.actions[clip]
        bpy.context.scene.frame_set(frame)
    preview(name, view=(0.75, -1.2, 0.3))


def rigged(name, file, target, clip):
    """A character that came with its own skeleton and one clip."""
    reset()
    arm, mesh = load(file)
    motion = capture(arm)
    forget_motion(arm)
    apply_scale(arm, mesh)
    simplify(mesh, target)
    arm.name, mesh.name = name.capitalize(), f"{name.capitalize()}Mesh"
    return arm, mesh, {clip: motion}


def borrowed(name, file, target, height, donor_file="soldaat_rig.glb"):
    """A character without a skeleton of its own: wears the donor's."""
    reset()
    arm, donor = load(donor_file)
    forget_motion(arm)
    apply_scale(arm, donor)
    _, mesh = load(file)
    simplify(mesh, target)
    dress(mesh, arm, donor)
    donor_height = max((donor.matrix_world @ v.co).z for v in donor.data.vertices)
    bpy.data.objects.remove(donor)
    arm.scale = (height / donor_height,) * 3
    arm.name, mesh.name = name.capitalize(), f"{name.capitalize()}Mesh"
    return arm, mesh

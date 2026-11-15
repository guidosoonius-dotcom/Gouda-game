"""Moves: the soldier's skeleton without a mesh, carrying the clips that the soldier, the man and
the woman share: `walk` (his own) and `run` (the courier's, retargeted). See _figure.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
import bpy
from _figure import apply_scale, bake, capture, export, forget_motion, load, reset

reset()
k_arm, k_mesh = load("koerier_rig.glb")
run = capture(k_arm)
reset()
arm, mesh = load("soldaat_rig.glb")
walk = capture(arm)
forget_motion(arm)
apply_scale(arm, mesh)
bpy.data.objects.remove(mesh)
arm.name = "Moves"
bake(arm, walk, "walk")
bake(arm, run, "run")
export("moves", [arm], True)

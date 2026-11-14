"""Vracht: two crates and a barrel left on the quay. Origin on the ground."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset

reset()
b = Builder("Vracht")
b.box((0.8, 0.8, 0.6), (0, 0, 0.3), "Wood")
b.box((0.6, 0.6, 0.5), (0.1, 0.05, 0.85), "WoodDark", rot=(0, 0, 0.3))
for z in (0.12, 0.48):
    b.box((0.84, 0.84, 0.05), (0, 0, z), "WoodDark")
b.cyl(0.3, 0.3, 0.8, (0.2, -0.9, 0.4), "Wood", segs=8)
b.cyl(0.33, 0.33, 0.12, (0.2, -0.9, 0.4), "WoodDark", segs=8)
for z in (0.1, 0.7):
    b.cyl(0.31, 0.31, 0.05, (0.2, -0.9, z), "Metal", segs=8)
b.build()
export("vracht")
preview("vracht")

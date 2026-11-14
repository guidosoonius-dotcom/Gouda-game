"""Koerier: young courier in a wool coat and flat cap with a leather satchel, 1.7 m.
Faces -Y (game +Z). Origin at the feet. Children `LegL` and `LegR` pivot at the hip."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset

HIP = 0.82

reset()
b = Builder("Koerier")
b.loft([[(-0.24, -0.15, 0.62), (0.24, -0.15, 0.62), (0.24, 0.17, 0.62), (-0.24, 0.17, 0.62)],
        [(-0.21, -0.13, 1.0), (0.21, -0.13, 1.0), (0.21, 0.14, 1.0), (-0.21, 0.14, 1.0)],
        [(-0.24, -0.13, 1.38), (0.24, -0.13, 1.38), (0.24, 0.14, 1.38), (-0.24, 0.14, 1.38)]], "Coat")
for s in (-1, 1):
    b.box((0.11, 0.14, 0.58), (s * 0.3, 0.0, 1.08), "Coat")
    b.box((0.09, 0.09, 0.09), (s * 0.3, 0.0, 0.76), "Skin")
b.box((0.18, 0.19, 0.19), (0, 0, 1.49), "Skin")
b.cyl(0.14, 0.13, 0.06, (0, 0.01, 1.61), "WoodDark", segs=8)
b.box((0.2, 0.14, 0.03), (0, -0.14, 1.595), "WoodDark")
# satchel on the left hip, strap across the chest
b.box((0.1, 0.3, 0.24), (-0.29, 0.0, 0.84), "Wood")
b.box((0.05, 0.04, 0.72), (-0.03, -0.15, 1.14), "Wood", rot=(0, -0.72, 0))
body = b.build()
for name, side in (("LegL", -1), ("LegR", 1)):
    leg = Builder(name)
    leg.box((0.16, 0.18, HIP - 0.14), (0, 0, -(HIP - 0.14) / 2), "Metal")
    leg.box((0.17, 0.26, 0.14), (0, -0.04, -HIP + 0.07), "Boot")
    obj = leg.build()
    obj.location = (side * 0.1, 0.01, HIP)
    obj.parent = body
export("koerier")
preview("koerier", view=(0.8, -1.2, 0.45))

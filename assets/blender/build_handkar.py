"""Handkar: wooden handcart with two big wheels, loaded with bundles. Handles toward -Y.
Origin on the ground below the axle."""
import math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset

reset()
b = Builder("Handkar")
b.box((1.2, 1.9, 0.12), (0, 0.2, 0.62), "Wood")
for x in (-0.6, 0.6):
    b.box((0.08, 1.9, 0.3), (x, 0.2, 0.75), "WoodDark")
b.box((1.2, 0.08, 0.3), (0, 1.12, 0.75), "WoodDark")
for s in (-1, 1):
    b.cyl(0.55, 0.55, 0.07, (s * 0.72, 0.2, 0.55), "WoodDark", segs=16, rot=(0, math.pi / 2, 0))
    b.cyl(0.5, 0.5, 0.09, (s * 0.72, 0.2, 0.55), "Metal", segs=16, rot=(0, math.pi / 2, 0))
    b.box((0.05, 1.5, 0.05), (s * 0.45, -1.2, 0.8), "Wood", rot=(0.1, 0, 0))
b.box((0.9, 0.5, 0.35), (-0.1, 0.1, 0.95), "CoatBrown")
b.box((0.55, 0.5, 0.3), (0.3, 0.5, 1.0), "Scarf", rot=(0, 0, 0.3))
b.box((0.6, 0.4, 0.4), (-0.2, 0.7, 1.1), "Wood")
b.build(bevel=0.02)
export("handkar")
preview("handkar")

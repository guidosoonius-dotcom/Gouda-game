"""Vliegtuig: a generic twin-engine fighter-bomber seen as a dark silhouette from below, 11 m
span. No markings. Nose toward +Y (game -Z). Origin at the centre of gravity."""
import math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset

reset()
b = Builder("Vliegtuig")
b.cyl(0.55, 0.28, 8.2, (0, 0, 0), "Metal", segs=12, rot=(math.pi / 2, 0, 0))
b.cyl(0.0, 0.55, 1.4, (0, 4.5, 0), "Metal", segs=12, rot=(-math.pi / 2, 0, 0))
b.ico(0.55, (0, 1.4, 0.35), "Glass", scale=(0.8, 1.6, 0.7))
for s in (-1, 1):
    b.box((5.2, 1.7, 0.16), (s * 2.9, 0.2, 0.0), "Metal", rot=(0, 0, s * 0.06))
    b.box((1.0, 1.2, 0.14), (s * 5.3, -0.1, 0.05), "Metal")
for s in (-1, 1):
    b.cyl(0.4, 0.34, 2.8, (s * 2.3, 0.6, -0.05), "Metal", segs=10, rot=(math.pi / 2, 0, 0))
    b.cyl(0.0, 0.4, 0.6, (s * 2.3, 2.3, -0.05), "Metal", segs=10, rot=(-math.pi / 2, 0, 0))
    b.box((0.08, 1.1, 1.5), (s * 1.0, -4.0, 0.7), "Metal")
b.box((3.6, 0.9, 0.08), (0, -3.9, 0.2), "Metal")
b.build(bevel=0.03)
export("vliegtuig")
preview("vliegtuig", view=(0.8, -1.2, 0.5))

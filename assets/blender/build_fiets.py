"""Fiets: old Dutch bicycle, 1.8 m long along Y. Origin on the ground between the wheels."""
import math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset

R = 0.34
reset()
b = Builder("Fiets")
for y in (-0.55, 0.55):
    b.cyl(R, R, 0.035, (0, y, R), "Boot", segs=12, rot=(0, math.pi / 2, 0))
    b.cyl(R - 0.06, R - 0.06, 0.04, (0, y, R), "Metal", segs=12, rot=(0, math.pi / 2, 0))
b.box((0.035, 0.75, 0.035), (0, -0.1, 0.86), "Metal")
b.box((0.035, 0.8, 0.035), (0, 0.18, 0.6), "Metal", rot=(0.72, 0, 0))
b.box((0.035, 0.035, 0.62), (0, -0.43, 0.6), "Metal", rot=(-0.2, 0, 0))
b.box((0.035, 0.035, 0.75), (0, 0.5, 0.68), "Metal", rot=(0.18, 0, 0))
b.box((0.5, 0.035, 0.035), (0, 0.44, 1.05), "Metal")
b.box((0.17, 0.26, 0.05), (0, -0.48, 0.94), "WoodDark")
b.box((0.2, 0.42, 0.03), (0, -0.62, 0.74), "Metal")
b.build()
export("fiets")
preview("fiets", view=(1.0, -0.6, 0.5))

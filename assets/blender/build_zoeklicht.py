"""Zoeklicht: searchlight on a tripod. Origin at the foot. Child `Head` (pivot at 1.35 m) carries
the drum and lens; the lens looks toward -Y (game +Z) when the head is not rotated."""
import math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset

PIVOT = 1.35

reset()
b = Builder("Zoeklicht")
for i in range(3):
    a = i * math.tau / 3 + 0.5
    b.cyl(0.03, 0.03, 1.15, (math.cos(a) * 0.28, math.sin(a) * 0.28, 0.5), "Metal", segs=5, rot=(math.sin(a) * 0.5, -math.cos(a) * 0.5, 0))
b.cyl(0.05, 0.05, 0.5, (0, 0, PIVOT - 0.3), "Metal", segs=6)
for s in (-1, 1):
    b.box((0.04, 0.06, 0.5), (s * 0.34, 0, PIVOT - 0.02), "Metal")
b.box((0.72, 0.06, 0.04), (0, 0, PIVOT - 0.27), "Metal")
stand = b.build()

h = Builder("Head")
h.cyl(0.3, 0.26, 0.42, (0, 0.02, 0), "Metal", segs=10, rot=(math.pi / 2, 0, 0))
h.cyl(0.27, 0.27, 0.03, (0, -0.2, 0), "Lamp", segs=10, rot=(math.pi / 2, 0, 0))
h.box((0.06, 0.14, 0.2), (0, 0.26, 0.2), "Metal")
head = h.build()
head.location = (0, 0, PIVOT)
head.parent = stand
export("zoeklicht")
preview("zoeklicht", view=(0.8, -1.2, 0.5))

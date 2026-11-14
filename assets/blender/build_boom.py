"""Boom: quay-side tree in autumn, about 7 m. Origin at the foot of the trunk."""
import math, os, random, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset

reset()
random.seed(7)
b = Builder("Boom")
b.cyl(0.22, 0.13, 3.4, (0, 0, 1.7), "Bark", segs=6)
for i in range(4):
    a = i * math.tau / 4 + 0.4
    b.cyl(0.09, 0.04, 2.4, (math.cos(a) * 0.7, math.sin(a) * 0.7, 4.1), "Bark", segs=4, rot=(-math.sin(a) * 0.6, math.cos(a) * 0.6, 0))
    r = 1.0 + random.random() * 0.5
    b.ico(r, (math.cos(a) * 1.3, math.sin(a) * 1.3, 5.0 + random.random() * 0.8), "Leaf", scale=(1, 1, 0.75))
b.ico(1.5, (0, 0, 6.1), "Leaf", scale=(1, 1, 0.7))
b.build()
export("boom")
preview("boom")

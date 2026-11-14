"""Wachtpost: sentry box behind a low sandbag wall. The opening faces -X. Origin on the ground
in the middle of the box."""
import os, random, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset

reset()
random.seed(3)
b = Builder("Wachtpost")
for y in (-0.52, 0.52):
    b.box((1.1, 0.06, 2.1), (0, y, 1.05), "WoodDark")
b.box((0.06, 1.1, 2.1), (0.52, 0, 1.05), "WoodDark")
b.loft([[(x, -0.7, 2.1), (x, 0.7, 2.1), (x, 0, 2.55)] for x in (-0.7, 0.7)], "Wood")
for row, count in enumerate((5, 4, 3)):
    for i in range(count):
        y = (i - (count - 1) / 2) * 0.62
        b.box((0.34, 0.58, 0.2), (-1.5 + random.random() * 0.05, y, 0.1 + row * 0.19), "Sand", rot=(0, 0, (random.random() - 0.5) * 0.12))
b.build(bevel=0.035)
export("wachtpost")
preview("wachtpost", view=(-1.0, -0.8, 0.6))

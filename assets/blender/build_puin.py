"""Puin: a heap of rubble, about 3 m across: bricks, a beam, broken tiles. Origin on the ground."""
import math, os, random, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset

reset()
random.seed(26)
b = Builder("Puin")
b.ico(1.45, (0, 0, -0.25), "BrickDark", scale=(1.0, 0.9, 0.55), subdiv=1)
for i in range(22):
    a = random.random() * math.tau
    d = random.random() ** 0.6 * 1.5
    z = max(0.08, 0.55 - d * 0.3 + random.random() * 0.15)
    size = (0.22 + random.random() * 0.3, 0.12 + random.random() * 0.14, 0.08 + random.random() * 0.1)
    b.box(size, (math.cos(a) * d, math.sin(a) * d, z), random.choice(["Brick", "Brick", "BrickDark", "Stone", "Roof"]),
          rot=(random.random() - 0.5, random.random() - 0.5, random.random() * 3))
b.box((2.6, 0.16, 0.16), (0.2, -0.3, 0.6), "WoodDark", rot=(0.1, 0.22, 0.5))
b.box((1.6, 0.14, 0.14), (-0.5, 0.5, 0.45), "WoodDark", rot=(0.2, -0.3, 2.2))
b.build(bevel=0.02)
export("puin")
preview("puin")

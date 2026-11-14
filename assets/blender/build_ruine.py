"""Ruine: a house hit by a bomb. Facade on x = 0 facing -X like the gevels, 5.6 m wide: broken
walls, a floor hanging loose, rubble spilling onto the street. Origin on the ground."""
import os, random, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset

W = 5.6
reset()
random.seed(44)
b = Builder("Ruine")
b.box((8, 0.4, 7.5), (4, -W / 2 + 0.2, 3.75), "BrickDark")
b.box((8, 0.4, 5.0), (4, W / 2 - 0.2, 2.5), "BrickDark")
b.box((0.4, W, 6.0), (7.8, 0, 3.0), "BrickDark")
# what is left of the facade: jagged stumps
for y, h in ((-2.3, 3.6), (-1.5, 2.2), (-0.6, 1.1), (0.4, 0.7), (1.4, 1.9), (2.3, 4.4)):
    b.box((0.4, 0.95, h), (0.2, y, h / 2), "Brick")
b.box((5.5, W - 0.8, 0.22), (4.6, 0, 3.3), "Wood", rot=(0, 0.22, 0))
for i in range(4):
    b.box((0.16, 0.16, 3.2 + i * 0.3), (2.0 + i * 1.3, -1.6 + i * 0.9, 1.4), "WoodDark", rot=(0.3 - i * 0.2, 0.5, i))
for i in range(26):
    x, y = random.random() * 4.5 - 2.6, (random.random() - 0.5) * (W + 1.5)
    s = 0.25 + random.random() * 0.45
    b.box((s, s * 0.6, s * 0.4), (x, y, 0.12 + random.random() * 0.5), random.choice(["Brick", "BrickDark", "Stone", "Roof"]),
          rot=(random.random(), random.random(), random.random() * 3))
b.build(bevel=0.025)
export("ruine")
preview("ruine", view=(-1.0, -0.8, 0.6))

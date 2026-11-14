"""Schuilkelder: brick building with a sandbagged shelter entrance. Front on x = 0 facing -X,
7 m wide. A white arrow is painted above the door (the game shows the words in the HUD).
Origin on the ground in the middle of the front."""
import os, random, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset

W = 7.0
reset()
random.seed(9)
b = Builder("Schuilkelder")
b.box((8, W, 7.5), (4, 0, 3.75), "Brick")
b.box((8.4, W + 0.4, 0.3), (4, 0, 7.65), "Stone")
b.box((0.5, 1.9, 2.5), (0.0, 0, 1.25), "WindowDark")
b.box((0.2, 2.3, 0.25), (-0.08, 0, 2.62), "Stone")
# painted sign board and arrow pointing down at the door
b.box((0.06, 3.4, 0.7), (-0.04, 0, 3.55), "WoodWhite")
b.box((0.07, 0.22, 0.55), (-0.06, 0, 3.0), "WoodWhite")
b.box((0.07, 0.6, 0.18), (-0.06, 0, 2.86), "WoodWhite")
for y in (-2.5, 2.5):
    b.box((0.06, 0.9, 1.4), (-0.03, y, 4.6), "WindowDark")
for side in (-1, 1):
    for row in range(5):
        for i in range(2):
            b.box((0.36, 0.6, 0.22), (-0.45 - i * 0.38, side * (1.35 + (row % 2) * 0.1), 0.11 + row * 0.2), "Sand",
                  rot=(0, 0, (random.random() - 0.5) * 0.15))
b.build(bevel=0.03)
export("schuilkelder")
preview("schuilkelder", view=(-1.0, -0.9, 0.5))

"""Dakhuis: house seen from the roof side, ridge along X (the courier runs along it).
9 m wide, 9 m deep, ridge at 10.2 m. The front (-Y, game +Z) faces the camera. Origin on the
ground in the middle. The game stretches it in X and Y for variety."""
import math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset

W, D, H, RISE = 9.0, 9.0, 7.0, 3.2

reset()
b = Builder("Dakhuis")
b.box((W, D, H), (0, 0, H / 2), "Brick")
b.loft([[(x, -D / 2 - 0.3, H), (x, D / 2 + 0.3, H), (x, 0, H + RISE)] for x in (-W / 2 - 0.12, W / 2 + 0.12)], "Roof")
b.box((W + 0.3, 0.34, 0.14), (0, 0, H + RISE - 0.02), "Stone")
b.box((W + 0.3, 0.2, 0.16), (0, -D / 2 - 0.34, H - 0.02), "WoodWhite")
slope = math.atan2(RISE, D / 2 + 0.3)
for k in (0.2, 0.4, 0.6, 0.8):
    y = -(D / 2 + 0.3) * (1 - k)
    b.box((W + 0.2, 0.07, 0.05), (0, y, H + RISE * k + 0.04), "BrickDark", rot=(slope, 0, 0))
# dormer on the front slope
dy, dz = -D / 2 * 0.52, H + RISE * 0.42
b.box((1.5, 1.5, 1.25), (W * 0.2, dy + 0.3, dz + 0.3), "WoodWhite")
b.box((1.1, 0.06, 0.85), (W * 0.2, dy - 0.47, dz + 0.3), "WindowDark")
b.box((1.8, 1.8, 0.1), (W * 0.2, dy + 0.25, dz + 0.97), "Roof")
for x in (-W * 0.3, 0, W * 0.3):
    b.box((1.0, 0.06, 1.6), (x, -D / 2 - 0.03, H - 1.6), "WoodWhite")
    b.box((0.86, 0.06, 1.46), (x, -D / 2 - 0.06, H - 1.6), "WindowDark")
b.build()
export("dakhuis")
preview("dakhuis", view=(0.9, -1.1, 0.7))

"""Waag: the weigh house on the Markt of Gouda (Pieter Post, 1667-1668), as a silhouette for the
skyline of "Over de daken". A square classicist block of pale stone: the big relief of the
cheese weighing above the ground floor, pilasters, a pediment with the town arms, a hipped roof.
Simplified from memory; see src/data/sources.ts ("skyline.waag"). Front (-Y, game +Z) faces the
roofs. 14 m wide, 12 m deep, about 17 m high. Origin on the ground in the middle."""
import math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset

W, D, H = 14.0, 12.0, 11.2
FRONT = -D / 2

reset()
b = Builder("Waag")
b.box((W, D, H), (0, 0, H / 2), "StonePale")
b.box((W + 0.4, D + 0.4, 0.5), (0, 0, 0.25), "Stone")
b.box((W + 0.5, D + 0.5, 0.45), (0, 0, H + 0.2), "Stone")
# ground floor: three tall arched openings where the carts drove in
for x in (-4.2, 0, 4.2):
    b.box((2.6, 0.12, 3.0), (x, FRONT - 0.02, 1.9), "WoodDark")
    b.cyl(1.3, 1.3, 0.12, (x, FRONT - 0.02, 3.4), "WoodDark", segs=16, rot=(math.pi / 2, 0, 0))
    b.box((3.1, 0.2, 0.25), (x, FRONT - 0.08, 0.6), "Stone")
# the relief panel over the ground floor, figures roughly blocked in
b.box((10.0, 0.35, 2.4), (0, FRONT - 0.15, 5.6), "Stone")
for i, x in enumerate((-4.0, -2.8, -1.5, -0.2, 1.2, 2.6, 3.9)):
    b.box((0.55, 0.2, 1.5 + 0.2 * (i % 2)), (x, FRONT - 0.38, 5.4), "StonePale")
b.box((1.6, 0.25, 0.9), (0.5, FRONT - 0.4, 6.1), "StonePale")
b.box((10.4, 0.45, 0.2), (0, FRONT - 0.2, 6.9), "Stone")
# pilasters and the upper windows between them
for x in (-6.6, -2.2, 2.2, 6.6):
    b.box((0.7, 0.3, H - 7.0), (x, FRONT - 0.15, 7.0 + (H - 7.0) / 2), "Stone")
for x in (-4.4, 0, 4.4):
    b.box((1.6, 0.1, 2.6), (x, FRONT - 0.05, 8.9), "WoodWhite")
    b.box((1.36, 0.1, 2.36), (x, FRONT - 0.08, 8.9), "WindowDark")
# hipped roof behind the pediment
EAVE, RIDGE = H + 0.4, H + 5.6
b.loft([
    [(-W / 2 - 0.3, -D / 2 - 0.3, EAVE), (W / 2 + 0.3, -D / 2 - 0.3, EAVE), (W / 2 + 0.3, D / 2 + 0.3, EAVE), (-W / 2 - 0.3, D / 2 + 0.3, EAVE)],
    [(-2.0, 0, RIDGE), (2.0, 0, RIDGE), (2.0, 0, RIDGE), (-2.0, 0, RIDGE)],
], "Roof", cap_last=False)
# pediment with the arms of the town
PED = 3.2
for y0, y1 in ((FRONT - 0.5, FRONT + 0.6),):
    b.loft([[(-W / 2 - 0.2, y, EAVE) for y in (y0,)] + [(W / 2 + 0.2, y0, EAVE), (0, y0, EAVE + PED)],
            [(-W / 2 - 0.2, y1, EAVE), (W / 2 + 0.2, y1, EAVE), (0, y1, EAVE + PED)]], "StonePale")
b.cyl(0.9, 0.9, 0.2, (0, FRONT - 0.55, EAVE + 1.25), "Stone", segs=16, rot=(math.pi / 2, 0, 0))
b.box((W + 0.6, 0.6, 0.25), (0, FRONT - 0.2, EAVE + 0.05), "Stone")
# side canopies, and a small roof lantern on the ridge
for s in (-1, 1):
    b.box((0.2, D * 0.7, 0.15), (s * (W / 2 + 0.8), 0, 4.2), "WoodDark", rot=(0, s * 0.25, 0))
b.build()
export("waag")
preview("waag", view=(0.7, -1.2, 0.35))

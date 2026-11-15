"""Waag: the weigh house of Gouda (1668), as seen across the Markt in "Over de daken".
Modelled after a present-day photograph: a tall front of weathered grey-brown sandstone with
brick sides; on the ground floor a big round-arched door between two shuttered windows, the date
stone above it; upstairs the white relief of the cheese weighing between two shuttered windows
and four small coats of arms; a pediment with the town arms between two lions; a hipped slate
roof with a finial at each end; white canopies against both sides. Front (-Y, game +Z).
11.4 m wide, 12 m deep, 17.5 m to the ridge. Origin on the ground in the middle."""
import math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset

W, D = 11.4, 12.0
FRONT = -D / 2
G, U, TOP = 5.6, 10.6, 11.8  # top of ground floor, of upper floor, of the attic band

reset()
b = Builder("Waag")
b.box((W - 0.6, D, TOP), (0, 0.3, TOP / 2), "BrickDark")
b.box((W, 0.6, TOP), (0, FRONT + 0.3, TOP / 2), "Sandstone")
for s in (-1, 1):
    b.box((0.35, 0.65, TOP), (s * (W / 2 - 0.17), FRONT + 0.3, TOP / 2), "BrickDark")
# cornices between the floors
for z, h in ((G, 0.45), (U, 0.35), (TOP, 0.4)):
    b.box((W + 0.3, 0.9, h), (0, FRONT + 0.25, z), "Sandstone")
# ground floor: the big arched door, the date stone, two shuttered windows
b.box((2.4, 0.1, 3.4), (0, FRONT - 0.04, 1.7), "WoodDark")
b.cyl(1.2, 1.2, 0.1, (0, FRONT - 0.04, 3.4), "WindowDark", segs=16, rot=(math.pi / 2, 0, 0))
b.cyl(1.55, 1.55, 0.16, (0, FRONT - 0.01, 3.4), "Sandstone", segs=16, rot=(math.pi / 2, 0, 0))
b.box((0.5, 0.2, 0.7), (0, FRONT - 0.12, 5.0), "Sandstone")
for s in (-1, 1):
    x = s * 3.3
    b.box((1.5, 0.1, 2.6), (x, FRONT - 0.04, 2.6), "WindowDark")
    b.box((0.4, 0.12, 1.4), (x - s * 0.95, FRONT - 0.06, 2.1), "Awning")
# upstairs: the relief, its frame, two windows with shutters and four coats of arms
b.box((3.6, 0.3, 3.4), (0, FRONT - 0.15, 8.0), "Sandstone")
b.box((3.0, 0.2, 2.8), (0, FRONT - 0.25, 8.0), "Relief")
for x, h in ((-0.9, 1.1), (-0.3, 0.8), (0.6, 1.3), (1.0, 1.3)):
    b.box((0.35, 0.12, h), (x, FRONT - 0.36, 7.0 + h / 2), "Relief")
b.box((2.0, 0.08, 0.08), (0, FRONT - 0.36, 9.0), "Relief")
for s in (-1, 1):
    x = s * 3.3
    b.box((1.4, 0.1, 2.7), (x, FRONT - 0.04, 8.1), "WindowDark")
    b.box((0.4, 0.12, 1.3), (x + s * 0.9, FRONT - 0.06, 7.4), "Awning")
    for dx in (-1.25, 1.25):
        b.box((0.55, 0.12, 0.75), (x + dx, FRONT - 0.07, 8.3), "Relief")
# hipped slate roof
EAVE, RIDGE = TOP + 0.2, TOP + 5.7
b.loft([
    [(-W / 2 - 0.3, FRONT - 0.3, EAVE), (W / 2 + 0.3, FRONT - 0.3, EAVE), (W / 2 + 0.3, D / 2 + 0.3, EAVE), (-W / 2 - 0.3, D / 2 + 0.3, EAVE)],
    [(-3.0, 0, RIDGE), (3.0, 0, RIDGE), (3.0, 0, RIDGE), (-3.0, 0, RIDGE)],
], "Slate", cap_last=False)
for s in (-1, 1):
    b.cyl(0.12, 0.2, 0.5, (s * 3.0, 0, RIDGE + 0.25), "Metal", segs=8)
    b.ico(0.22, (s * 3.0, 0, RIDGE + 0.65), "Metal", scale=(1, 1, 1.4), subdiv=1)
# the pediment: town arms (red and white, crowned) between two lions
PED = 3.0
b.loft([[(-W / 2 - 0.3, FRONT - 0.45, EAVE), (W / 2 + 0.3, FRONT - 0.45, EAVE), (0, FRONT - 0.45, EAVE + PED)],
        [(-W / 2 - 0.3, FRONT + 0.6, EAVE), (W / 2 + 0.3, FRONT + 0.6, EAVE), (0, FRONT + 0.6, EAVE + PED)]], "Sandstone")
for i in range(5):
    b.box((0.16, 0.1, 1.0), (-0.32 + i * 0.16, FRONT - 0.5, EAVE + 1.2), "ArmsRed" if i % 2 else "Relief")
b.box((0.9, 0.12, 0.3), (0, FRONT - 0.52, EAVE + 1.9), "Beak")
for s in (-1, 1):
    b.box((1.4, 0.15, 0.7), (s * 1.4, FRONT - 0.5, EAVE + 0.9), "Stone", rot=(0, s * 0.2, 0))
# white canopies against both sides, where the carts were weighed
for s in (-1, 1):
    x = s * (W / 2 + 1.7)
    b.cyl(1.7, 1.7, D * 0.75, (x, 0, 4.2), "Relief", segs=12, rot=(math.pi / 2, 0, 0))
    b.box((3.6, D * 0.75, 0.5), (x, 0, 4.0), "Relief")
    for y in (-D * 0.3, D * 0.3):
        b.box((0.2, 0.2, 4.0), (x + s * 1.5, y, 2.0), "Relief")
b.build()
export("waag")
preview("waag", view=(0.55, -1.2, 0.25))

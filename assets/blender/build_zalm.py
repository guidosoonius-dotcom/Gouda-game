"""Zalm: the old inn De Zalm on the Markt of Gouda, next to the Waag, as a silhouette for the
skyline of "Over de daken". Brick, three storeys, its roof kept lower than the Waag's, a gilded
salmon on top. The shape of the gable is not checked; see src/data/sources.ts ("skyline.zalm").
Front (-Y, game +Z). 8 m wide, 12 m deep. Origin on the ground in the middle."""
import math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset

W, D, H = 8.0, 12.0, 10.0
FRONT = -D / 2

reset()
b = Builder("Zalm")
b.box((W, D, H), (0, 0, H / 2), "Brick")
# saddle roof perpendicular to the Markt, behind a neck gable
b.loft([[(x, -D / 2, H), (x, D / 2, H), (x, D / 2, H), (x, -D / 2, H)] for x in (0,)] +
       [[(-W / 2 - 0.1, -D / 2, H), (-W / 2 - 0.1, D / 2, H), (0, D / 2, H + 4.0), (0, -D / 2, H + 4.0)]], "Roof", cap_first=False, cap_last=False)
b.loft([[(-W / 2 - 0.1, -D / 2 + 0.3, H), (0, -D / 2 + 0.3, H + 4.0), (0, D / 2, H + 4.0), (-W / 2 - 0.1, D / 2, H)],
        [(W / 2 + 0.1, -D / 2 + 0.3, H), (0, -D / 2 + 0.3, H + 4.0), (0, D / 2, H + 4.0), (W / 2 + 0.1, D / 2, H)]], "Roof")
# the front gable: shoulders, a neck and a pediment
b.box((W, 0.4, 1.4), (0, FRONT, H + 0.7), "Brick")
b.box((3.4, 0.4, 3.0), (0, FRONT, H + 2.1), "Brick")
b.loft([[(-2.0, FRONT - 0.25, H + 3.6), (2.0, FRONT - 0.25, H + 3.6), (0, FRONT - 0.25, H + 4.6)],
        [(-2.0, FRONT + 0.25, H + 3.6), (2.0, FRONT + 0.25, H + 3.6), (0, FRONT + 0.25, H + 4.6)]], "StonePale")
for s in (-1, 1):
    b.cyl(0.9, 0.2, 0.3, (s * 2.3, FRONT, H + 1.5), "StonePale", segs=10, rot=(math.pi / 2, 0, 0))
b.box((W + 0.3, 0.5, 0.2), (0, FRONT, H), "StonePale")
# windows on three floors and the door
for z in (2.0, 5.0, 8.0):
    for x in (-2.4, 0, 2.4):
        if z == 2.0 and x == 0:
            continue
        b.box((1.3, 0.1, 1.9), (x, FRONT - 0.05, z), "WoodWhite")
        b.box((1.1, 0.1, 1.7), (x, FRONT - 0.08, z), "WindowDark")
b.box((1.4, 0.12, 2.4), (0, FRONT - 0.05, 1.3), "WoodDark")
b.box((1.2, 0.2, 0.9), (0, FRONT - 0.2, 3.3), "StonePale")
# the gilded salmon on top
b.ico(0.5, (0, FRONT, H + 5.2), "Beak", scale=(1.9, 0.35, 0.55), subdiv=2)
b.loft([[(0.85, FRONT - 0.08, H + 5.2), (1.35, FRONT - 0.08, H + 5.55), (1.35, FRONT - 0.08, H + 4.85)],
        [(0.85, FRONT + 0.08, H + 5.2), (1.35, FRONT + 0.08, H + 5.55), (1.35, FRONT + 0.08, H + 4.85)]], "Beak")
b.box((0.12, 0.12, 0.5), (0, FRONT, H + 4.7), "Metal")
b.build()
export("zalm")
preview("zalm", view=(0.7, -1.2, 0.35))

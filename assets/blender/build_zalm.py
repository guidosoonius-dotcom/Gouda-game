"""Zalm: Hotel De Zalm on the Markt of Gouda, as seen across the Markt in "Over de daken".
Modelled after a present-day photograph: a cream stucco front of five bays and three floors,
tall windows with small iron balconies and hoods on the first floor, round-headed in the middle
on the second, a cornice on brackets, a hipped tile roof with an ornate central dormer around a
round window, and the gilded salmon on a bracket above the entrance. Front (-Y, game +Z).
13 m wide, 12 m deep, 16.5 m to the ridge. Origin on the ground in the middle."""
import math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset

W, D, H = 13.0, 12.0, 12.6
FRONT = -D / 2
BAYS = (-5.0, -2.5, 0.0, 2.5, 5.0)

reset()
b = Builder("Zalm")
b.box((W, D, H), (0, 0, H / 2), "Stucco")
# cornice on brackets, band under the top floor, plinth
b.box((W + 0.5, 0.8, 0.5), (0, FRONT, H), "Stucco")
for x in [-6.2 + i * 1.04 for i in range(13)]:
    b.box((0.22, 0.4, 0.4), (x, FRONT - 0.15, H - 0.45), "StonePale")
for z in (4.6, 8.6):
    b.box((W + 0.2, 0.3, 0.22), (0, FRONT - 0.05, z), "StonePale")
# ground floor: tall windows and the entrance
for x in BAYS:
    b.box((1.7, 0.1, 3.2), (x, FRONT - 0.05, 2.3), "WindowDark" if x else "WoodDark")
# first floor: tall windows with iron balconies and hoods
for x in BAYS:
    b.box((1.5, 0.1, 2.9), (x, FRONT - 0.05, 6.6), "WindowDark")
    b.box((1.9, 0.25, 0.3), (x, FRONT - 0.1, 8.25), "StonePale")
    b.box((1.6, 0.35, 0.55), (x, FRONT - 0.2, 5.3), "Metal")
# second floor: windows, the middle one round-headed
for x in BAYS:
    b.box((1.4, 0.1, 2.4), (x, FRONT - 0.05, 10.4), "WindowDark")
    if x == 0:
        b.cyl(0.7, 0.7, 0.1, (0, FRONT - 0.05, 11.6), "WindowDark", segs=12, rot=(math.pi / 2, 0, 0))
# hipped roof of dark tiles
EAVE, RIDGE = H + 0.25, H + 3.9
b.loft([
    [(-W / 2, FRONT, EAVE), (W / 2, FRONT, EAVE), (W / 2, D / 2, EAVE), (-W / 2, D / 2, EAVE)],
    [(-3.5, 0.5, RIDGE), (3.5, 0.5, RIDGE), (3.5, 0.5, RIDGE), (-3.5, 0.5, RIDGE)],
], "Slate", cap_last=False)
# the ornate dormer with its round window
b.box((3.2, 1.6, 2.6), (0, FRONT + 0.7, EAVE + 1.3), "Stucco")
b.loft([[(-1.8, FRONT - 0.05, EAVE + 2.6), (1.8, FRONT - 0.05, EAVE + 2.6), (0, FRONT - 0.05, EAVE + 3.5)],
        [(-1.8, FRONT + 1.4, EAVE + 2.6), (1.8, FRONT + 1.4, EAVE + 2.6), (0, FRONT + 1.4, EAVE + 3.5)]], "Stucco")
b.cyl(0.5, 0.5, 0.12, (0, FRONT - 0.12, EAVE + 1.4), "WindowDark", segs=14, rot=(math.pi / 2, 0, 0))
b.cyl(0.62, 0.62, 0.1, (0, FRONT - 0.08, EAVE + 1.4), "StonePale", segs=14, rot=(math.pi / 2, 0, 0))
for s in (-1, 1):
    b.cyl(0.55, 0.25, 0.3, (s * 1.85, FRONT, EAVE + 0.5), "StonePale", segs=10, rot=(math.pi / 2, 0, 0))
b.ico(0.25, (0, FRONT, EAVE + 3.7), "StonePale", subdiv=1)
for x in (-4.5, 4.5):
    b.box((0.4, 0.4, 0.9), (x, 1.5, RIDGE - 0.4), "BrickDark")
# the gilded salmon on its bracket above the entrance
b.box((0.1, 0.9, 0.1), (0.4, FRONT - 0.45, 4.95), "Metal")
b.ico(0.4, (0.0, FRONT - 0.85, 4.75), "Beak", scale=(2.0, 0.3, 0.55), subdiv=2)
b.loft([[(0.75, FRONT - 0.89, 4.8), (1.15, FRONT - 0.89, 5.1), (1.15, FRONT - 0.89, 4.5)],
        [(0.75, FRONT - 0.81, 4.8), (1.15, FRONT - 0.81, 5.1), (1.15, FRONT - 0.81, 4.5)]], "Beak")
b.build()
export("zalm")
preview("zalm", view=(0.55, -1.2, 0.25))

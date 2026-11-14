"""Schouw: flat-bottomed Dutch rowboat with `Rower`, `Passenger` and two separately animated oars.
4.2 m long, 1.4 m beam, bow toward +Y (game -Z), origin at the waterline amidships."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset

LENGTH_AFT, LENGTH_FWD = 2.0, 2.2
GUNWALE, BOTTOM, FLOOR = 0.38, -0.12, 0.02
HALF = [(-LENGTH_AFT, 0.52), (-1.2, 0.66), (0.2, 0.70), (1.2, 0.56), (1.85, 0.24), (LENGTH_FWD, 0.0)]


def ring(z, sx=1.0, sy=1.0):
    right = [(x * sx, y * sy, z) for y, x in HALF]
    left = [(-x * sx, y * sy, z) for y, x in reversed(HALF[:-1])]
    return right + left


def figure(b, y, lean, facing):
    """Seated figure in a dark coat and cap; `facing` is +1 toward the bow, -1 toward the stern."""
    b.box((0.44, 0.3, 0.52), (0, y + lean * 0.5, 0.56), "Coat", rot=(lean * facing * -1, 0, 0))
    b.box((0.5, 0.42, 0.2), (0, y - facing * 0.12, 0.3), "Coat")
    b.ico(0.115, (0, y + lean, 0.93), "Skin")
    b.cyl(0.145, 0.13, 0.06, (0, y + lean, 1.04), "WoodDark", segs=14)
    b.box((0.16, 0.12, 0.03), (0, y + lean + facing * 0.14, 1.02), "WoodDark")
    for side in (-1, 1):
        b.box((0.12, 0.42, 0.12), (side * 0.3, y + facing * 0.18, 0.62), "Coat", rot=(-0.5 * facing, 0, 0))


def oar(name, side):
    """Oar with its origin at the oarlock; the shaft runs outboard along local X."""
    b = Builder(name)
    b.cyl(0.03, 0.03, 2.4, (side * 0.75, 0, -0.1), "Wood", segs=6, rot=(0, 1.5708 + side * 0.14, 0))
    b.box((0.55, 0.16, 0.035), (side * 1.9, 0, -0.27), "Wood", rot=(0, side * 0.14, 0))
    obj = b.build(bevel=0.012)
    obj.location = (side * 0.7, -0.15, GUNWALE + 0.04)
    return obj


reset()
hull = Builder("Hull")
hull.loft([ring(BOTTOM, 0.72, 0.97), ring(GUNWALE)], "Wood", cap_last=False)
hull.loft([ring(GUNWALE), ring(GUNWALE, 0.9, 0.975), ring(FLOOR, 0.66, 0.94)], "WoodDark", cap_first=False)
hull.box((1.34, 0.06, 0.05), (0, -0.15, GUNWALE - 0.02), "Wood")
for y in (-1.35, -0.4, 0.95):
    hull.box((1.18, 0.24, 0.04), (0, y, 0.26), "Wood")
hull.build(bevel=0.015)

# Two separate figures so the game can make the rower pull and the passenger duck.
# Each has its origin at the seat, so it can lean from the hips.
for name, seat, lean, facing in (("Rower", -0.4, 0.08, -1), ("Passenger", 0.95, 0.2, 1)):
    fig = Builder(name)
    figure(fig, 0.0, lean, facing)
    obj = fig.build(bevel=0.035)
    obj.location = (0, seat, 0.0)
oar("OarL", -1)
oar("OarR", 1)

export("schouw")
preview("schouw", view=(1.0, -1.0, 0.9))

"""Houses seen from the roof side, ridge along X (the courier runs along it). 9 m wide, 9 m deep.
The front (-Y, game +Z) faces the camera. Origin on the ground in the middle. The game stretches
them in X and Y for variety. Three kinds:

- `dakhuis`: saddle roof of dark tiles, ridge at 10.2 m, one dormer;
- `dakhuis_steil`: steep red pantiles, ridge at 11.0 m, two small dormers and a hoist beam;
- `dakhuis_plat`: flat lead roof at 9.0 m behind a low parapet, with a hatch and a skylight.
"""
import math
from _lib import Builder, export, preview, reset

W, D = 9.0, 9.0


def windows(b, h):
    for x in (-W * 0.3, 0, W * 0.3):
        b.box((1.0, 0.06, 1.6), (x, -D / 2 - 0.03, h - 1.6), "WoodWhite")
        b.box((0.86, 0.06, 1.46), (x, -D / 2 - 0.06, h - 1.6), "WindowDark")


def dormer(b, x, h, rise, k, size=1.0):
    dy, dz = -D / 2 * (1 - k), h + rise * k
    # lead-clad cheeks, a white painted front frame around the window
    b.box((1.5 * size, 1.5, 1.25 * size), (x, dy + 0.3, dz + 0.3 * size), "Lead")
    b.box((1.3 * size, 0.05, 1.05 * size), (x, dy - 0.47, dz + 0.3 * size), "WoodWhite")
    b.box((1.1 * size, 0.06, 0.85 * size), (x, dy - 0.5, dz + 0.3 * size), "Glass")
    b.box((1.8 * size, 1.8, 0.1), (x, dy + 0.25, dz + 0.3 + 0.67 * size), "Roof")


def saddle(name, h, rise, tile, dormers, hoist=False):
    reset()
    b = Builder(name)
    b.box((W, D, h), (0, 0, h / 2), "Brick")
    b.loft([[(x, -D / 2 - 0.3, h), (x, D / 2 + 0.3, h), (x, 0, h + rise)] for x in (-W / 2 - 0.12, W / 2 + 0.12)], tile)
    b.box((W + 0.3, 0.34, 0.14), (0, 0, h + rise - 0.02), "Lead")  # lead-covered ridge: the route catches the moon
    b.box((W + 0.3, 0.2, 0.16), (0, -D / 2 - 0.34, h - 0.02), "WoodWhite")
    slope = math.atan2(rise, D / 2 + 0.3)
    for k in (0.2, 0.4, 0.6, 0.8):
        y = -(D / 2 + 0.3) * (1 - k)
        b.box((W + 0.2, 0.07, 0.05), (0, y, h + rise * k + 0.04), "BrickDark", rot=(slope, 0, 0))
    for x, k, size in dormers:
        dormer(b, x, h, rise, k, size)
    if hoist:
        # a hoist beam sticking out of the attic, as on every warehouse in town
        b.box((0.16, 1.1, 0.16), (-W * 0.3, -D / 2 - 0.2, h + rise * 0.3), "WoodDark")
    windows(b, h)
    b.build()
    export(name)
    preview(name, view=(0.9, -1.1, 0.7))


def flat(name, h):
    reset()
    b = Builder(name)
    b.box((W, D, h), (0, 0, h / 2), "Brick")
    b.box((W - 0.4, D - 0.4, 0.06), (0, 0, h + 0.03), "Lead")
    for x, y, w, d in ((0, -D / 2 + 0.15, W, 0.3), (0, D / 2 - 0.15, W, 0.3), (-W / 2 + 0.15, 0, 0.3, D), (W / 2 - 0.15, 0, 0.3, D)):
        b.box((w, d, 0.5), (x, y, h + 0.25), "Brick")
        b.box((w + 0.06, d + 0.06, 0.08), (x, y, h + 0.54), "Stone")
    b.box((1.2, 1.0, 0.7), (W * 0.28, D * 0.2, h + 0.35), "WoodDark")
    b.box((1.3, 1.1, 0.08), (W * 0.28, D * 0.2, h + 0.74), "Lead")
    b.box((1.4, 1.0, 0.3), (-W * 0.25, -D * 0.12, h + 0.15), "WoodWhite")
    b.box((1.2, 0.8, 0.06), (-W * 0.25, -D * 0.12, h + 0.32), "Glass")
    windows(b, h)
    b.build()
    export(name)
    preview(name, view=(0.9, -1.1, 0.7))

"""Canal house with a Dutch gable. Facade on the plane x = 0 facing -X; the house extends 8 m
toward +X. Origin at ground level, middle of the facade.

Detail: six-pane windows with white frames, stone sills and lintels, brick bands at every floor,
a drainpipe, a shop front with awning on some houses, finials and chimneys. `damage` adds blown-out
windows, soot above them, a broken gable top and a few missing roof tiles (the bomb damage seen in
chapter 5). Windows are dark: the game lights them."""
import random
from _lib import Builder, export, preview, reset

DEPTH = 8.0


def profile(kind, w, h):
    half = w / 2
    if kind == "trap":
        pts, sw, sh = [(-half, h), (-half, h + 0.5)], w * 0.105, 0.62
        for i in range(1, 5):
            pts += [(-half + i * sw, h + 0.5 + (i - 1) * sh), (-half + i * sw, h + 0.5 + i * sh)]
        left, ridge = pts, 2.7
    elif kind == "klok":
        left = [(-half, h), (-half, h + 0.6), (-w * 0.42, h + 1.0), (-w * 0.3, h + 1.2), (-w * 0.24, h + 2.0),
                (-w * 0.2, h + 2.9), (-w * 0.12, h + 3.3), (-0.02, h + 3.55)]
        ridge = 3.1
    else:  # tuit
        left = [(-half, h), (-half, h + 0.4), (-0.35, h + 2.7), (-0.35, h + 3.5)]
        ridge = 2.9
    right = [(-y, z) for y, z in reversed(left)]
    return left + right, ridge


def window(b, y, z, w=0.86, h=1.5, broken=False, shutters=False, rnd=None):
    """Window with frame, mullions, sill and lintel. A broken one has no glass and bent bars."""
    b.box((0.09, w + 0.2, 0.14), (-0.05, y, z + h / 2 + 0.12), "Stone")          # lintel
    b.box((0.16, w + 0.3, 0.1), (-0.08, y, z - h / 2 - 0.08), "Stone")           # sill
    b.box((0.05, w + 0.12, h + 0.1), (-0.03, y, z), "WoodWhite")
    b.box((0.04, w - 0.04, h - 0.04), (-0.07, y, z), "WindowDark" if broken else "Glass")
    if broken:
        b.box((0.09, w + 0.5, h + 0.6), (-0.02, y, z + h * 0.2), "Soot")        # soot streak above
        b.box((0.06, 0.05, h * 0.6), (-0.09, y + 0.1, z - 0.15), "WoodWhite", rot=(0.5, 0, 0.35))
        return
    b.box((0.06, 0.05, h), (-0.09, y, z), "WoodWhite")                           # centre mullion
    for k in (-0.2, 0.2):
        b.box((0.06, w, 0.04), (-0.09, y, z + k * h), "WoodWhite")             # transoms
    if shutters:
        for s in (-1, 1):
            b.box((0.05, 0.34, h + 0.06), (-0.05, y + s * (w / 2 + 0.28), z), "Shutter")


def build(kind, name, width, eaves, brick="Brick", damage=False, shop=False, seed=1):
    reset()
    rnd = random.Random(seed)
    b = Builder("Gevel")
    b.box((DEPTH, width, eaves), (DEPTH / 2, 0, eaves / 2), brick)
    b.box((0.1, width + 0.04, 0.45), (-0.03, 0, 0.22), "Stone")                    # plinth
    prof, ridge = profile(kind, width, eaves)
    if damage:
        # a chunk of the gable is gone: cut the profile off along a jagged line
        prof = [(y, min(z, eaves + 0.5 + 0.9 * abs(y) / (width / 2) + 0.7 * rnd.random())) if z > eaves + 0.5 else (y, z) for y, z in prof]
    b.loft([[(0.0, y, z) for y, z in prof], [(0.4, y, z) for y, z in prof]], brick)
    top = eaves + (1.3 if damage else ridge)
    b.loft([[(x, -width / 2, eaves), (x, width / 2, eaves), (x, 0, top)] for x in (0.4, DEPTH)], "Roof")
    b.box((0.14, width + 0.12, 0.2), (-0.05, 0, eaves - 0.12), "WoodWhite")        # gutter board
    for z in (2.9, 5.7, 8.5):                                                      # brick bands per floor
        if z < eaves - 0.3:
            b.box((0.06, width + 0.02, 0.16), (-0.02, 0, z), "Stone")
    if kind == "trap":
        sw, sh = width * 0.105, 0.62
        for i in range(5):
            for s in (-1, 1):
                b.box((0.5, sw + 0.06, 0.1), (0.2, s * (width / 2 - (i + 0.5) * sw), eaves + 0.5 + i * sh + 0.05), "Stone")
    else:
        b.box((0.5, 0.9, 0.14), (0.2, 0, eaves + (3.55 if kind == "klok" else 3.5) + 0.05), "Stone")
    if not damage:
        b.box((0.3, 0.3, 0.7), (0.2, 0, eaves + (0.5 + 4 * 0.62 + 0.7 if kind == "trap" else 3.9)), "Stone")  # finial
    # chimneys on the back slope
    for x in (DEPTH * 0.55, DEPTH * 0.85):
        b.box((0.9, 0.8, 2.6), (x, width * 0.1, top - 0.4), "BrickDark")
    # ground floor: shop front with awning, or door and stoop
    if shop:
        b.box((0.1, width - 1.2, 2.4), (-0.05, 0.2, 1.4), "WoodDark")
        b.box((0.06, width - 1.6, 2.0), (-0.1, 0.2, 1.5), "Glass")
        for y in range(-2, 3):
            b.box((0.07, 0.06, 2.0), (-0.12, 0.2 + y * (width - 1.8) / 5, 1.5), "WoodDark")
        b.loft([[(-0.05, -width / 2 + 0.4, 3.1), (-0.05, width / 2 - 0.4, 3.1), (-1.0, width / 2 - 0.4, 2.65), (-1.0, -width / 2 + 0.4, 2.65)],
                [(-0.05, -width / 2 + 0.4, 3.1), (-0.05, width / 2 - 0.4, 3.1), (-1.0, width / 2 - 0.4, 2.65), (-1.0, -width / 2 + 0.4, 2.65)]], "Awning")
        b.box((0.9, 0.7, 2.2), (-0.5, -width / 2 + 0.6, 1.2), "WoodDark")  # door
    else:
        b.box((0.08, 1.04, 2.2), (-0.03, -width * 0.27, 1.3), "WoodDark")
        b.box((0.07, 1.2, 0.5), (-0.04, -width * 0.27, 2.75), "Glass")
        b.box((0.7, 1.5, 0.2), (-0.35, -width * 0.27, 0.1), "Stone")
        window(b, width * 0.2, 1.75, w=1.0, h=1.7, shutters=not damage, rnd=rnd)
    # upper floors
    floors = [z for z in (4.5, 7.1) if z + 1.2 < eaves]
    for z in floors:
        for y in (-width * 0.3, 0, width * 0.3):
            window(b, y, z, broken=damage and rnd.random() < 0.55, rnd=rnd)
    window(b, 0, eaves + 1.25, w=0.7, h=1.0, broken=damage and rnd.random() < 0.5, rnd=rnd)
    b.box((0.9, 0.14, 0.14), (-0.3, 0, eaves + 2.15), "WoodDark")                  # hoisting beam
    b.box((0.04, 0.04, eaves), (-0.18, width / 2 - 0.12, eaves / 2), "Metal")      # drainpipe
    if damage:
        for _ in range(6):                                                         # soot patches on the brick
            b.box((0.07, 0.8 + rnd.random() * 0.9, 1.0 + rnd.random() * 1.6), (-0.04, (rnd.random() - 0.5) * (width - 1), 2.5 + rnd.random() * (eaves - 3)), "Soot")
        for _ in range(7):                                                         # rubble on the ledge
            b.box((0.3, 0.25, 0.18), (-0.25, (rnd.random() - 0.5) * width, 0.35), "BrickDark", rot=(0, 0, rnd.random() * 3))
    b.build()
    export(name)
    preview(name, view=(-1.0, -0.9, 0.45))

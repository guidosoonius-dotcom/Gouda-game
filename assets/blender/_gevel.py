"""Canal house with a Dutch gable. Facade on the plane x = 0 facing -X (toward the canal on the
right bank); the house extends 8 m toward +X. Origin at ground level, middle of the facade.
All windows are dark: the game adds the few slivers of light that escape the blackout."""
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


def window(b, y, z, w=0.86, h=1.5, shutters=False):
    b.box((0.06, w + 0.14, h + 0.14), (-0.03, y, z), "WoodWhite")
    b.box((0.04, w, h), (-0.06, y, z), "WindowDark")
    if shutters:
        for s in (-1, 1):
            b.box((0.05, 0.34, h + 0.06), (-0.05, y + s * (w / 2 + 0.26), z), "Shutter")


def build(kind, name, width, eaves, brick="Brick"):
    reset()
    b = Builder("Gevel")
    b.box((DEPTH, width, eaves), (DEPTH / 2, 0, eaves / 2), brick)
    b.box((0.1, width + 0.04, 0.45), (-0.03, 0, 0.22), "Stone")
    prof, ridge = profile(kind, width, eaves)
    b.loft([[(0.0, y, z) for y, z in prof], [(0.4, y, z) for y, z in prof]], brick)
    b.loft([[(x, -width / 2, eaves), (x, width / 2, eaves), (x, 0, eaves + ridge)] for x in (0.4, DEPTH)], "Roof")
    b.box((0.14, width + 0.12, 0.2), (-0.05, 0, eaves - 0.12), "WoodWhite")
    if kind == "trap":
        sw, sh = width * 0.105, 0.62
        for i in range(5):
            for s in (-1, 1):
                b.box((0.5, sw + 0.06, 0.1), (0.2, s * (width / 2 - (i + 0.5) * sw), eaves + 0.5 + i * sh + 0.05), "Stone")
    else:
        b.box((0.5, 0.9, 0.14), (0.2, 0, eaves + (3.55 if kind == "klok" else 3.5) + 0.05), "Stone")
    # door with stoop, ground-floor window with shutters
    b.box((0.08, 1.04, 2.2), (-0.03, -width * 0.27, 1.3), "WoodDark")
    b.box((0.07, 1.2, 0.5), (-0.04, -width * 0.27, 2.75), "WindowDark")
    b.box((0.7, 1.5, 0.2), (-0.35, -width * 0.27, 0.1), "Stone")
    window(b, width * 0.2, 1.75, w=1.0, h=1.7, shutters=True)
    for z in (4.5, 7.1):
        if z + 1.2 > eaves:
            continue
        for y in (-width * 0.3, 0, width * 0.3):
            window(b, y, z)
    window(b, 0, eaves + 1.25, w=0.7, h=1.0)
    # hoisting beam under the top of the gable
    b.box((0.9, 0.14, 0.14), (-0.3, 0, eaves + 2.15), "WoodDark")
    b.build()
    export(name)
    preview(name, view=(-1.0, -0.9, 0.45))

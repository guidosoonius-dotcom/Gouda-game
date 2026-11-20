"""Canal house with a Dutch gable. Facade on the plane x = 0 facing -X; the house extends 8 m
toward +X. Origin at ground level, middle of the facade.

Detail: six-pane windows with white frames, stone sills and lintels, brick bands at every floor,
a drainpipe, a shop front with awning on some houses, finials and chimneys. `damage` adds blown-out
windows, soot above them, a broken gable top and a few missing roof tiles (the bomb damage seen in
chapter 5). Windows are dark: the game lights them."""
import random
from _lib import Builder, export, preview, reset

DEPTH = 8.0
WALL = 0.22    # the front wall: windows and doors sit in openings this deep
INSET = 0.15   # how far a window stack moves back into its opening


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


def opening(w, h):
    """Size of the hole in the front wall for a window of glass size w x h."""
    return w + 0.12, h + 0.1


def window(b, y, z, w=0.86, h=1.5, broken=False, shutters=False, rnd=None, inset=INSET):
    """Window with frame, mullions, sill and lintel, set back `inset` into its opening in the
    front wall (0 on the gable, which has no openings). A broken one has no glass and bent bars."""
    d = inset
    b.box((0.09, w + 0.2, 0.14), (-0.05, y, z + h / 2 + 0.12), "Stone")          # lintel
    b.box((0.16 + d, w + 0.3, 0.1), (-0.08 + d / 2, y, z - h / 2 - 0.08), "Stone")  # sill, into the reveal
    b.box((0.05, w + 0.12, h + 0.1), (-0.03 + d, y, z), "WindowDark" if broken else "WoodWhite")
    b.box((0.04, w - 0.04, h - 0.04), (-0.07 + d, y, z), "WindowDark" if broken else "Glass")
    if broken:
        b.box((0.03, w + 0.5, 0.8), (-0.01, y, z + h / 2 + 0.45), "Soot")       # soot streak above
        b.box((0.06, 0.05, h * 0.6), (-0.09 + d, y + 0.1, z - 0.15), "WoodWhite", rot=(0.5, 0, 0.35))
        return
    # glazing bars: flat strips on the glass (a box each would cost six times the triangles)
    x = -0.1 + d
    bar = lambda y0, y1, z0, z1: b.quad([(x, y0, z0), (x, y0, z1), (x, y1, z1), (x, y1, z0)], "WoodWhite", (-1, 0, 0))
    bar(y - 0.025, y + 0.025, z - h / 2, z + h / 2)                               # centre mullion
    for k in (-0.2, 0.2):
        bar(y - w / 2, y + w / 2, z + k * h - 0.02, z + k * h + 0.02)           # transoms
    if shutters:
        for s in (-1, 1):
            b.box((0.05, 0.34, h + 0.06), (-0.05, y + s * (w / 2 + 0.28), z), "Shutter")


def front_wall(b, width, eaves, holes, mat):
    """The front wall, WALL deep, with rectangular holes (y, z, w, h; centred). Only faces that
    can be seen: the face of the wall (cut on a grid into long strips), the reveals of each hole
    and the two ends. The house box behind closes every hole."""
    ys = sorted({-width / 2, width / 2, *[y + s * w / 2 for y, _, w, _ in holes for s in (-1, 1)]})
    zs = sorted({0.0, eaves, *[z + s * h / 2 for _, z, _, h in holes for s in (-1, 1)]})
    inside = lambda yc, zc: any(abs(yc - y) < w / 2 and abs(zc - z) < h / 2 for y, z, w, h in holes)
    face = lambda y0, y1, z0, z1: b.quad([(0, y0, z0), (0, y0, z1), (0, y1, z1), (0, y1, z0)], mat, (-1, 0, 0))
    for z0, z1 in zip(zs, zs[1:]):
        run = None
        for y0, y1 in list(zip(ys, ys[1:])) + [(None, None)]:
            if y0 is not None and not inside((y0 + y1) / 2, (z0 + z1) / 2):
                run = (run[0] if run else y0, y1)
            elif run:
                face(run[0], run[1], z0, z1)
                run = None
    for y, z, w, h in holes:
        y0, y1, z0, z1 = y - w / 2, y + w / 2, z - h / 2, z + h / 2
        b.quad([(0, y0, z0), (WALL, y0, z0), (WALL, y0, z1), (0, y0, z1)], mat, (0, 1, 0))
        b.quad([(0, y1, z0), (WALL, y1, z0), (WALL, y1, z1), (0, y1, z1)], mat, (0, -1, 0))
        b.quad([(0, y0, z0), (WALL, y0, z0), (WALL, y1, z0), (0, y1, z0)], mat, (0, 0, 1))
        b.quad([(0, y0, z1), (WALL, y0, z1), (WALL, y1, z1), (0, y1, z1)], mat, (0, 0, -1))
    for s in (-1, 1):
        y = s * width / 2
        b.quad([(0, y, 0), (WALL, y, 0), (WALL, y, eaves), (0, y, eaves)], mat, (0, s, 0))


def build(kind, name, width, eaves, brick="Brick", damage=False, shop=False, seed=1):
    reset()
    rnd = random.Random(seed)
    b = Builder("Gevel")
    b.box((DEPTH - WALL, width, eaves), ((DEPTH + WALL) / 2, 0, eaves / 2), brick)
    holes = []
    b.box((0.1, width + 0.04, 0.45), (-0.03, 0, 0.22), "Stone")                    # plinth
    prof, ridge = profile(kind, width, eaves)
    if damage:
        # a chunk of the gable is gone: cut the profile off along a jagged line
        prof = [(y, min(z, eaves + 0.5 + 0.9 * abs(y) / (width / 2) + 0.7 * rnd.random())) if z > eaves + 0.5 else (y, z) for y, z in prof]
    b.loft([[(0.0, y, z) for y, z in prof], [(0.4, y, z) for y, z in prof]], brick)
    top = eaves + (1.3 if damage else ridge)
    b.loft([[(x, -width / 2, eaves), (x, width / 2, eaves), (x, 0, top)] for x in (0.4, DEPTH)], "Roof")
    b.box((0.14, width + 0.12, 0.2), (-0.05, 0, eaves - 0.12), "WoodWhite")        # gutter board
    b.box((0.1, width + 0.06, 0.1), (-0.04, 0, eaves - 0.3), "Stone")              # cornice moulding
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
        holes.append((0.2, 1.4, width - 1.2, 2.4))
        b.box((0.1, width - 1.2, 2.4), (-0.05 + INSET, 0.2, 1.4), "WoodDark")
        b.box((0.06, width - 1.6, 2.0), (-0.1 + INSET, 0.2, 1.5), "Glass")
        for y in range(-2, 3):
            b.box((0.07, 0.06, 2.0), (-0.12 + INSET, 0.2 + y * (width - 1.8) / 5, 1.5), "WoodDark")
        b.loft([[(-0.05, -width / 2 + 0.4, 3.1), (-0.05, width / 2 - 0.4, 3.1), (-1.0, width / 2 - 0.4, 2.65), (-1.0, -width / 2 + 0.4, 2.65)],
                [(-0.05, -width / 2 + 0.4, 3.1), (-0.05, width / 2 - 0.4, 3.1), (-1.0, width / 2 - 0.4, 2.65), (-1.0, -width / 2 + 0.4, 2.65)]], "Awning")
        b.box((0.9, 0.7, 2.2), (-0.5, -width / 2 + 0.6, 1.2), "WoodDark")  # door
    else:
        holes.append((-width * 0.27, 1.65, 1.2, 2.9))                            # door with fanlight
        b.box((0.08, 1.2, 2.9), (0.15, -width * 0.27, 1.65), "WoodDark")
        b.box((0.07, 1.04, 0.45), (0.12, -width * 0.27, 2.8), "Glass")
        b.box((0.7, 1.5, 0.2), (-0.35, -width * 0.27, 0.1), "Stone")
        holes.append((width * 0.2, 1.75, *opening(1.0, 1.7)))
        window(b, width * 0.2, 1.75, w=1.0, h=1.7, shutters=not damage, rnd=rnd)
    # upper floors
    floors = [z for z in (4.5, 7.1) if z + 1.2 < eaves]
    for z in floors:
        for y in (-width * 0.3, 0, width * 0.3):
            holes.append((y, z, *opening(0.86, 1.5)))
            window(b, y, z, broken=damage and rnd.random() < 0.55, rnd=rnd)
    window(b, 0, eaves + 1.25, w=0.7, h=1.0, broken=damage and rnd.random() < 0.5, rnd=rnd, inset=0)
    front_wall(b, width, eaves, holes, brick)
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

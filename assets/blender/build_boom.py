"""Boom: quay-side lime tree in autumn, about 7.5 m. Origin at the foot of the trunk.

A real branching skeleton (trunk, four limbs, twigs) and a crown of leaf cards: square quads that
the game textures with `public/img/kit/leaves.webp` (a 2x2 atlas of autumn lime sprigs, cut out
with alpha), lit as one round crown. Gaps between the clumps show the branches."""
import math, os, random, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset
from mathutils import Vector  # after _lib, which imports bpy first

reset()
rnd = random.Random(7)
b = Builder("Boom")
CROWN = Vector((0, 0, 5.3))


def limb(start, direction, length, r0, r1, segs=6):
    """A branch as a tapered cylinder from `start` along `direction`; returns its tip."""
    d = Vector(direction).normalized()
    mid = Vector(start) + d * (length / 2)
    rot = Vector((0, 0, 1)).rotation_difference(d).to_euler()
    b.cyl(r0, r1, length, mid, "Bark", segs=segs, rot=rot)
    return Vector(start) + d * length


def clump(centre, radius, cards=9):
    """A clump of leaf cards on a rough ball, each facing away from the crown's centre."""
    for i in range(cards):
        # spread the cards evenly over the ball (golden spiral), then jitter
        y = 1 - 2 * (i + 0.5) / cards
        a = i * 2.39996 + rnd.random() * 0.6
        p = Vector((math.cos(a) * math.sqrt(1 - y * y), math.sin(a) * math.sqrt(1 - y * y), y * 0.8))
        pos = Vector(centre) + p * radius * (0.55 + rnd.random() * 0.35)
        out = (pos - CROWN).normalized() * 0.7 + p * 0.3 + Vector((rnd.random() - 0.5, rnd.random() - 0.5, rnd.random() - 0.3)) * 0.6
        b.card(pos, 1.15 + rnd.random() * 0.45, out, rnd.random() * math.tau, rnd.randrange(4), "Leaf")


# trunk with a slight lean, and a root flare
top = limb((0, 0, 0), (0.04, 0.02, 1), 2.9, 0.25, 0.17, segs=9)
b.cyl(0.36, 0.25, 0.35, (0, 0, 0.17), "Bark", segs=9)
tips = []
for i in range(4):
    a = i * math.tau / 4 + 0.5 + rnd.random() * 0.4
    out = Vector((math.cos(a), math.sin(a), 0))
    t = limb(top, out * 0.75 + Vector((0, 0, 1)), 2.5 + rnd.random() * 0.5, 0.13, 0.07)
    tips.append(t)
    for k in (-1, 1):
        side = Vector((math.cos(a + k * 0.9), math.sin(a + k * 0.9), 0))
        start = top + (t - top) * (0.55 + 0.15 * k)
        tips.append(limb(start, side * 0.8 + Vector((0, 0, 0.7)), 1.4 + rnd.random() * 0.5, 0.06, 0.025, segs=5))
tips.append(limb(top, (0.1, -0.05, 1), 2.6, 0.12, 0.05))
for t in tips:
    clump(t + Vector((0, 0, 0.15)), 1.0 + rnd.random() * 0.35)
b.build(smooth=True)
export("boom")
preview("boom")

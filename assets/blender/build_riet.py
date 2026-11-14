"""Riet: one reed clump, about 1.4 m across and 2.2 m tall. Origin at the waterline centre.
The game instances several clumps per hiding place."""
import math, os, random, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset

BLADES, RADIUS, HEIGHT = 34, 0.7, 2.2

reset()
random.seed(1944)
b = Builder("Riet")
for i in range(BLADES):
    a = random.random() * math.tau
    d = math.sqrt(random.random()) * RADIUS
    x, y = math.cos(a) * d, math.sin(a) * d
    h = HEIGHT * (0.6 + random.random() * 0.4)
    yaw = random.random() * math.tau
    wx, wy = math.cos(yaw) * 0.035, math.sin(yaw) * 0.035
    lean = (random.random() - 0.5) * 0.5
    lx, ly = math.cos(a) * lean, math.sin(a) * lean
    mid = (x + lx * 0.4, y + ly * 0.4, h * 0.55)
    tip = (x + lx, y + ly, h)
    b.poly([(x - wx, y - wy, -0.1), (x + wx, y + wy, -0.1), (mid[0] + wx * 0.7, mid[1] + wy * 0.7, mid[2]), (mid[0] - wx * 0.7, mid[1] - wy * 0.7, mid[2])], "Reed")
    b.poly([(mid[0] - wx * 0.7, mid[1] - wy * 0.7, mid[2]), (mid[0] + wx * 0.7, mid[1] + wy * 0.7, mid[2]), tip], "Reed")
    if i % 5 < 3:
        p = 0.05
        b.poly([(tip[0], tip[1], tip[2] - 0.28), (tip[0] + wx / 0.035 * p, tip[1] + wy / 0.035 * p, tip[2] - 0.1), (tip[0], tip[1], tip[2] + 0.12), (tip[0] - wx / 0.035 * p, tip[1] - wy / 0.035 * p, tip[2] - 0.1)], "ReedPlume")
b.build(recalc=False)
export("riet")
preview("riet")

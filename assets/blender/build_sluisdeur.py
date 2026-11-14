"""Sluisdeur: a pair of closed wooden mitre lock gates across X (10.4 m), z from -1 to 2, with white
balance beams and stone lock heads. The mitre points toward +Y (game -Z, away from the boat).
Origin at canal centre, water level."""
import math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset

SPAN, LOW, HIGH, MITRE = 10.4, -1.0, 2.0, 0.3
HALF = SPAN / 2

reset()
b = Builder("Sluisdeur")
leaf = HALF / math.cos(MITRE)
for s in (-1, 1):
    rot = (0, 0, -s * MITRE)
    cx, cy = s * HALF / 2, math.tan(MITRE) * HALF / 2
    b.box((leaf, 0.28, HIGH - LOW), (cx, cy, (HIGH + LOW) / 2), "WoodDark", rot=rot)
    for z in (LOW + 0.3, 0.5, HIGH - 0.25):
        b.box((leaf, 0.36, 0.2), (cx, cy, z), "Wood", rot=rot)
    for k in (-0.4, 0, 0.4):
        b.box((0.2, 0.36, HIGH - LOW), (cx + k * leaf * math.cos(MITRE), cy - s * k * leaf * math.sin(MITRE), (HIGH + LOW) / 2), "Wood", rot=rot)
    # balance beam: lies on top of the leaf and sticks out over the lock head
    b.box((leaf + 3.4, 0.34, 0.34), (cx + s * 1.7 * math.cos(MITRE), cy - 1.7 * math.sin(MITRE), HIGH + 0.2), "WoodWhite", rot=rot)
    # stone lock head with coping
    b.box((2.4, 5.0, HIGH - LOW - 0.6), (s * (HALF + 1.2), 0.6, (HIGH - 0.6 + LOW) / 2), "Stone")
    b.box((2.6, 5.2, 0.2), (s * (HALF + 1.2), 0.6, HIGH - 0.5), "Cobble")
b.build()
export("sluisdeur")
preview("sluisdeur", view=(0.5, -1.3, 0.9))

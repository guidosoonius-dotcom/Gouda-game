"""Wacht: guard, 1.8 m, long coat and helmet, hand lamp at chest height. Faces -Y (game +Z, toward
the approaching boat). Origin at the feet. Child empty `Lamp` at the lamp."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, empty, export, preview, reset

reset()
b = Builder("Wacht")
for x in (-0.11, 0.11):
    b.box((0.16, 0.2, 0.5), (x, 0, 0.25), "Metal")
b.loft([[(-0.3, -0.2, 0.42), (0.3, -0.2, 0.42), (0.3, 0.2, 0.42), (-0.3, 0.2, 0.42)],
        [(-0.24, -0.16, 1.05), (0.24, -0.16, 1.05), (0.24, 0.16, 1.05), (-0.24, 0.16, 1.05)],
        [(-0.27, -0.15, 1.45), (0.27, -0.15, 1.45), (0.27, 0.15, 1.45), (-0.27, 0.15, 1.45)]], "Coat")
b.box((0.5, 0.05, 0.07), (0, -0.17, 1.02), "Metal")
b.box((0.12, 0.14, 0.6), (-0.33, 0, 1.15), "Coat")
b.box((0.12, 0.42, 0.13), (0.33, -0.16, 1.2), "Coat", rot=(0.25, 0, 0))
b.box((0.2, 0.2, 0.22), (0, 0, 1.58), "Skin")
b.cyl(0.19, 0.15, 0.13, (0, 0, 1.72), "Metal", segs=8)
b.cyl(0.21, 0.19, 0.03, (0, 0, 1.655), "Metal", segs=8)
b.box((0.13, 0.13, 0.17), (0.33, -0.42, 1.14), "Lamp")
b.box((0.15, 0.15, 0.04), (0.33, -0.42, 1.245), "Metal")
guard = b.build()
lamp = empty("Lamp", (0.33, -0.5, 1.14))
lamp.parent = guard
export("wacht")
preview("wacht", view=(0.7, -1.2, 0.5))

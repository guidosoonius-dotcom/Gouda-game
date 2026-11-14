"""Sint-Jan: far silhouette of a long Gothic church with a slender tower, for the skyline only.
About 60 m long (X), tower 52 m. Origin on the ground under the middle of the nave."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset

reset()
b = Builder("SintJan")
b.box((46, 14, 15), (2, 0, 7.5), "Stone")
b.loft([[(x, -7.4, 15), (x, 7.4, 15), (x, 0, 25)] for x in (-21, 25)], "Roof")
for x in (-12, -2, 8, 18):
    b.box((6, 20, 10), (x, 0, 5), "Stone")
    b.loft([[(x - 3, y, 10), (x + 3, y, 10), (x, y, 15.5)] for y in (-10, 10)], "Roof")
b.box((8, 8, 34), (-26, 0, 17), "Stone")
b.box((6, 6, 8), (-26, 0, 38), "Stone")
b.cyl(4.2, 0.2, 12, (-26, 0, 48), "Roof", segs=4, rot=(0, 0, 0.785))
b.cyl(1.0, 0.1, 6, (6, 0, 28), "Roof", segs=4)
b.build()
export("sintjan")
preview("sintjan", view=(0.5, -1.3, 0.35))

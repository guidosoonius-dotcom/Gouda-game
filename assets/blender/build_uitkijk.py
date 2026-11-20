"""Uitkijk: brick lookout tower with a railed platform for a searchlight. 3.2 m square,
platform top at 14.3 m. Origin on the ground."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset

H = 14.0
reset()
b = Builder("Uitkijk")
b.box((3.2, 3.2, H), (0, 0, H / 2), "BrickDark")
b.box((4.2, 4.2, 0.3), (0, 0, H + 0.15), "Sandstone")
# a stepped brick cornice under the platform, stone string courses and a plinth: the shaft reads
# as masonry instead of a box
b.box((3.6, 3.6, 0.3), (0, 0, H - 0.15), "BrickDark")
b.box((3.9, 3.9, 0.12), (0, 0, H - 0.02), "Sandstone")
for z in (4.9, 9.4):
    b.box((3.3, 3.3, 0.14), (0, 0, z), "Sandstone")
b.box((3.36, 3.36, 0.8), (0, 0, 0.4), "Sandstone")
for sx in (-1, 1):
    for sy in (-1, 1):
        b.box((0.1, 0.1, 1.0), (sx * 2.0, sy * 2.0, H + 0.8), "Metal")
    b.box((0.06, 4.0, 0.06), (sx * 2.0, 0, H + 1.25), "Metal")
    b.box((4.0, 0.06, 0.06), (0, sx * 2.0, H + 1.25), "Metal")
for z in (3, 7.4, 11.8):
    b.box((0.9, 0.08, 1.4), (0, -1.6, z), "Sandstone")        # stone frame
    b.box((0.7, 0.06, 1.2), (0, -1.64, z), "WindowDark")
b.build()  # architecture stays unbevelled (CLAUDE.md rule 3)
export("uitkijk")
preview("uitkijk")

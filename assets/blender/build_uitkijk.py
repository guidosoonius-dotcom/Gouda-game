"""Uitkijk: brick lookout tower with a railed platform for a searchlight. 3.2 m square,
platform top at 14.3 m. Origin on the ground."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset

H = 14.0
reset()
b = Builder("Uitkijk")
b.box((3.2, 3.2, H), (0, 0, H / 2), "BrickDark")
b.box((4.2, 4.2, 0.3), (0, 0, H + 0.15), "Stone")
for sx in (-1, 1):
    for sy in (-1, 1):
        b.box((0.1, 0.1, 1.0), (sx * 2.0, sy * 2.0, H + 0.8), "Metal")
    b.box((0.06, 4.0, 0.06), (sx * 2.0, 0, H + 1.25), "Metal")
    b.box((4.0, 0.06, 0.06), (0, sx * 2.0, H + 1.25), "Metal")
for z in (4, 8, 12):
    b.box((0.7, 0.06, 1.2), (0, -1.62, z), "WindowDark")
b.build()
export("uitkijk")
preview("uitkijk")

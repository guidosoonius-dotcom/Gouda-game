"""Schoorsteen: brick chimney to hide behind, 2.4 m above the ridge. Origin on the ridge line."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset

reset()
b = Builder("Schoorsteen")
b.box((1.2, 1.0, 3.0), (0, 0, 0.7), "Brick")
b.box((1.4, 1.2, 0.16), (0, 0, 2.26), "Stone")
for x in (-0.3, 0.3):
    b.cyl(0.17, 0.14, 0.5, (x, 0, 2.58), "BrickDark", segs=12)
b.build(bevel=0.03)
export("schoorsteen")
preview("schoorsteen")

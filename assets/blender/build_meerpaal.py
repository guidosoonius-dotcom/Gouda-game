"""Meerpaal: wooden mooring post with a white top, standing in the water. Origin at the waterline."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset

reset()
b = Builder("Meerpaal")
b.cyl(0.15, 0.13, 2.5, (0, 0, 0.1), "WoodDark", segs=12)
b.cyl(0.14, 0.11, 0.32, (0, 0, 1.5), "WoodWhite", segs=12)
b.build(bevel=0.02)
export("meerpaal")
preview("meerpaal")

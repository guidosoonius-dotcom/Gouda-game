"""Eend: a mallard drake floating on the canal, beak toward -Y. Origin at the waterline."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset

reset()
b = Builder("Eend")
b.ico(0.16, (0, 0.02, 0.05), "Feather", scale=(0.85, 1.45, 0.62), subdiv=2)
b.ico(0.1, (0, 0.11, 0.1), "FeatherDark", scale=(0.9, 0.9, 0.6), subdiv=2)
b.ico(0.075, (0, -0.17, 0.2), "DuckGreen", scale=(0.85, 1.1, 0.95), subdiv=2)
b.cyl(0.05, 0.04, 0.12, (0, -0.12, 0.13), "DuckGreen", segs=6, rot=(0.6, 0, 0))
b.box((0.045, 0.09, 0.025), (0, -0.25, 0.185), "Beak")
b.box((0.06, 0.08, 0.04), (0, 0.24, 0.1), "FeatherDark", rot=(-0.5, 0, 0))
b.build(smooth=True)
export("eend")
preview("eend")

"""Duif: a pigeon sitting on a ridge, beak toward -Y. Origin under its feet."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset

reset()
b = Builder("Duif")
b.ico(0.11, (0, 0.0, 0.12), "FeatherGrey", scale=(0.85, 1.35, 0.85), subdiv=2)
b.ico(0.06, (0, -0.12, 0.21), "FeatherGrey", scale=(0.9, 1.0, 1.0), subdiv=2)
b.ico(0.05, (0, -0.08, 0.16), "DuckGreen", scale=(1.0, 0.8, 0.9), subdiv=2)
b.box((0.022, 0.05, 0.018), (0, -0.185, 0.205), "Beak")
for s in (-1, 1):
    b.ico(0.07, (s * 0.075, 0.03, 0.14), "FeatherDark", scale=(0.35, 1.5, 0.6), subdiv=2)
b.box((0.08, 0.12, 0.02), (0, 0.17, 0.11), "FeatherDark", rot=(0.25, 0, 0))
for s in (-1, 1):
    b.cyl(0.008, 0.008, 0.06, (s * 0.03, -0.01, 0.03), "Awning", segs=4)
b.build(smooth=True)
export("duif")
preview("duif")

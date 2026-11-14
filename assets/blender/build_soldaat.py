"""Soldaat: sentry in a greatcoat and steel helmet with a slung rifle, 1.8 m, no insignia.
Faces -Y (game +Z). Origin at the feet. Children `LegL` and `LegR` pivot at the hip for walking."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset

HIP = 0.86

reset()
b = Builder("Soldaat")
b.loft([[(-0.27, -0.17, 0.5), (0.27, -0.17, 0.5), (0.27, 0.19, 0.5), (-0.27, 0.19, 0.5)],
        [(-0.23, -0.15, 1.02), (0.23, -0.15, 1.02), (0.23, 0.16, 1.02), (-0.23, 0.16, 1.02)],
        [(-0.26, -0.14, 1.46), (0.26, -0.14, 1.46), (0.26, 0.15, 1.46), (-0.26, 0.15, 1.46)]], "Uniform")
b.box((0.5, 0.33, 0.07), (0, 0, 1.02), "Boot")
b.box((0.13, 0.1, 0.14), (0.14, -0.19, 0.97), "Boot")
for s in (-1, 1):
    b.box((0.12, 0.15, 0.62), (s * 0.33, 0.0, 1.14), "Uniform")
    b.box((0.1, 0.1, 0.1), (s * 0.33, 0.0, 0.8), "Skin")
b.ico(0.118, (0, 0, 1.585), "Skin", scale=(0.92, 1.0, 1.05))
b.box((0.3, 0.22, 0.08), (0, 0.02, 1.47), "Uniform")
# steel helmet: dome plus the flared skirt over ears and neck
b.ico(0.17, (0, 0.0, 1.69), "Helmet", scale=(1.0, 1.08, 0.72))
b.cyl(0.215, 0.168, 0.07, (0, 0.03, 1.645), "Helmet", segs=14)
# rifle slung diagonally across the back
b.box((0.05, 0.06, 1.15), (0.12, 0.2, 1.22), "Wood", rot=(0, 0.32, 0))
b.box((0.03, 0.03, 0.42), (-0.1, 0.2, 1.86), "Metal", rot=(0, 0.32, 0))
body = b.build(bevel=0.035)

for name, side in (("LegL", -1), ("LegR", 1)):
    leg = Builder(name)
    leg.box((0.17, 0.2, HIP - 0.36), (0, 0, -(HIP - 0.36) / 2), "Uniform")
    leg.box((0.18, 0.22, 0.36), (0, 0, -HIP + 0.18), "Boot")
    leg.box((0.18, 0.12, 0.1), (0, -0.16, -HIP + 0.05), "Boot")
    obj = leg.build(bevel=0.03)
    obj.location = (side * 0.11, 0.01, HIP)
    obj.parent = body

export("soldaat")
preview("soldaat", view=(0.8, -1.2, 0.45))

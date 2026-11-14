"""Kade: quay wall segment, 10 m along Y (game Z). Water-facing wall at x = 0, land toward +x (3 m),
top at z = 1.2, down to z = -1.0. Origin at the waterline in the middle of the segment."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset

LENGTH, TOP, DEPTH, STRIP = 10.0, 1.2, -1.0, 3.0

reset()
b = Builder("Kade")
b.box((STRIP, LENGTH, TOP - 0.35), (STRIP / 2, 0, (TOP + 0.35) / 2 - 0.0), "Brick")
b.box((STRIP + 0.06, LENGTH, 0.35 - DEPTH), (STRIP / 2 - 0.03, 0, (0.35 + DEPTH) / 2), "BrickDark")
b.box((STRIP - 0.5, LENGTH, 0.06), (STRIP / 2 + 0.25, 0, TOP + 0.03), "Cobble")
blocks = 8
for i in range(blocks):
    y = -LENGTH / 2 + (i + 0.5) * LENGTH / blocks
    b.box((0.56, LENGTH / blocks - 0.04, 0.16), (0.24, y, TOP + 0.08), "Stone")
for y in (-LENGTH / 2 + 0.2, 0, LENGTH / 2 - 0.2):
    b.box((0.1, 0.4, TOP - 0.2), (-0.03, y, (TOP + 0.2) / 2), "Brick")
# bollard, mooring ring and a wooden ladder
b.cyl(0.14, 0.11, 0.5, (0.75, -2.6, TOP + 0.31), "Metal", segs=8)
b.cyl(0.17, 0.17, 0.06, (0.75, -2.6, TOP + 0.57), "Metal", segs=8)
b.box((0.04, 0.22, 0.22), (-0.03, 2.2, 0.75), "Metal")
for dy in (-0.22, 0.22):
    b.box((0.06, 0.06, TOP + 0.5), (-0.07, 3.6 + dy, (TOP - 0.5) / 2), "WoodDark")
for k in range(5):
    b.box((0.05, 0.44, 0.05), (-0.07, 3.6, -0.3 + k * 0.33), "WoodDark")
b.build()
export("kade")
preview("kade", view=(-1.0, -1.0, 0.75))

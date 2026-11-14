"""Lantaarn: old street lamp, 3.4 m. Origin at its foot. Child empty `Light` at the lamp."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, empty, export, preview, reset

HEIGHT = 3.0

reset()
b = Builder("Lantaarn")
b.cyl(0.11, 0.07, 0.5, (0, 0, 0.25), "Metal", segs=8)
b.cyl(0.05, 0.04, HEIGHT - 0.5, (0, 0, 0.5 + (HEIGHT - 0.5) / 2), "Metal", segs=6)
b.box((0.5, 0.04, 0.04), (0, 0, HEIGHT - 0.25), "Metal")
b.cyl(0.11, 0.17, 0.34, (0, 0, HEIGHT + 0.17), "WindowDark", segs=4)  # blackout: street lamps are off
b.cyl(0.2, 0.03, 0.14, (0, 0, HEIGHT + 0.41), "Metal", segs=4)
pole = b.build()
light = empty("Light", (0, 0, HEIGHT + 0.17))
light.parent = pole
export("lantaarn")
preview("lantaarn")

"""Man: townsman in a long coat and hat, 1.74 m. Generated from docs/characters/man.webp; wears
the soldier's skeleton, see _figure.py. Clips in `moves.glb`."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _figure import borrowed, export, shot

arm, mesh = borrowed("man", "man_sam.glb", 1150, 1.74)
export("man", [mesh, arm], False)
shot("man")

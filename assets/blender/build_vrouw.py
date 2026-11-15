"""Vrouw: townswoman in a long coat and headscarf, 1.66 m. Generated from
docs/characters/vrouw.webp; wears the soldier's skeleton, see _figure.py. Clips in `moves.glb`."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _figure import borrowed, export, shot

arm, mesh = borrowed("vrouw", "vrouw_sam.glb", 1150, 1.66)
export("vrouw", [mesh, arm], False)
shot("vrouw")

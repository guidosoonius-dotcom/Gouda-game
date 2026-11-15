"""Koerier: the player. Young courier in a wool jacket and flat cap with a leather satchel,
1.75 m. Generated from docs/characters/koerier.webp; see _figure.py. Clip: `run`."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _figure import bake, export, rigged, shot

arm, mesh, clips = rigged("koerier", "koerier_rig.glb", 3000, "run")
bake(arm, clips["run"], "run")
export("koerier", [mesh, arm], True)
shot("koerier", arm, "run", 7)

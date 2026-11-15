"""Soldaat: sentry in a greatcoat and steel helmet, 1.8 m, no insignia. Generated from
docs/characters/soldaat.webp; see _figure.py. His clips are in `moves.glb`."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _figure import export, rigged, shot

arm, mesh, _ = rigged("soldaat", "soldaat_rig.glb", 2000, "walk")
export("soldaat", [mesh, arm], False)
shot("soldaat")

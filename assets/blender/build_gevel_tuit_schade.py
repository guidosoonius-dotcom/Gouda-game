"""Gevel (tuit), bomb-damaged: blown-out windows, soot, a broken gable. See _gevel.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _gevel import build

build("tuit", "gevel_tuit_schade", 5.0, 8.2, "Brick", damage=True, seed=5491)

"""Gevel (trap), bomb-damaged: blown-out windows, soot, a broken gable. See _gevel.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _gevel import build

build("trap", "gevel_trap_schade", 5.6, 8.6, "Brick", damage=True, seed=11078)

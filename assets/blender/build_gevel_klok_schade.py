"""Gevel (klok), bomb-damaged: blown-out windows, soot, a broken gable. See _gevel.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _gevel import build

build("klok", "gevel_klok_schade", 6.2, 9.2, "BrickDark", damage=True, seed=23439)

"""Gevel (trap): canal house, 5.6 m wide, eaves at 8.6 m. See _gevel.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _gevel import build

build("trap", "gevel_trap", 5.6, 8.6, "Brick")

"""Gevel (tuit): canal house, 5.0 m wide, eaves at 8.2 m. See _gevel.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _gevel import build

build("tuit", "gevel_tuit", 5.0, 8.2, "Brick")

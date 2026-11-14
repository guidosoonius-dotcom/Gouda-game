"""Gevel (klok): canal house, 6.2 m wide, eaves at 9.2 m. See _gevel.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _gevel import build

build("klok", "gevel_klok", 6.2, 9.2, "BrickDark")

"""Dakhuis (plat): flat lead roof at 9.0 m behind a low parapet. See _dakhuis.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _dakhuis import flat

flat("dakhuis_plat", 9.0)

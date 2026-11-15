"""Dakhuis (steil): steep red pantiles, ridge at 11.0 m, two small dormers. See _dakhuis.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _dakhuis import W, saddle

saddle("dakhuis_steil", 6.4, 4.6, "RoofRed", [(-W * 0.22, 0.3, 0.8), (W * 0.24, 0.3, 0.8)], hoist=True)

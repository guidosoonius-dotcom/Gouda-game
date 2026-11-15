"""Dakhuis: saddle roof of dark tiles, ridge at 10.2 m, one dormer. See _dakhuis.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _dakhuis import W, saddle

saddle("dakhuis", 7.0, 3.2, "Roof", [(W * 0.2, 0.42, 1.0)])

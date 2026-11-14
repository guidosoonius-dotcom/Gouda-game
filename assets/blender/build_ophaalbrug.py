"""Ophaalbrug: white wooden Dutch drawbridge across X. Clear span 10.4 m, deck 3 m wide (along Y),
deck top at z = 1.3, balance frame (hameipoort) on the +X bank. Origin at canal centre, water level."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _lib import Builder, export, preview, reset

SPAN, WIDTH, DECK = 10.4, 3.0, 1.3
HALF = SPAN / 2
GATE_X, GATE_H = HALF + 0.5, 5.6

reset()
b = Builder("Ophaalbrug")
b.box((SPAN + 2.4, WIDTH, 0.22), (0, 0, DECK - 0.11), "Wood")
for i in range(-7, 8):
    b.box((0.06, WIDTH + 0.02, 0.03), (i * 0.78, 0, DECK + 0.01), "WoodDark")
for y in (-WIDTH / 2 + 0.06, WIDTH / 2 - 0.06):
    b.box((SPAN + 2.4, 0.1, 0.3), (0, y, DECK - 0.28), "WoodDark")
    for x in [i * 1.5 for i in range(-3, 4)]:
        b.box((0.09, 0.09, 0.95), (x, y, DECK + 0.47), "WoodWhite")
    for z in (DECK + 0.5, DECK + 0.92):
        b.box((SPAN - 1.2, 0.07, 0.07), (0, y, z), "WoodWhite")
    # balance frame post, brace and balance beam with chain
    b.box((0.26, 0.26, GATE_H), (GATE_X, y, DECK + GATE_H / 2), "WoodWhite")
    b.box((0.16, 0.16, 3.2), (GATE_X + 1.0, y, DECK + 1.45), "WoodWhite", rot=(0, -0.62, 0))
    b.box((9.6, 0.22, 0.26), (GATE_X - 1.2, y, DECK + GATE_H + 0.2), "WoodWhite", rot=(0, 0.07, 0))
    b.box((0.05, 0.05, GATE_H - 0.1), (GATE_X - 5.85, y, DECK + GATE_H / 2 + 0.2), "Metal")
b.box((0.26, WIDTH, 0.26), (GATE_X, 0, DECK + GATE_H - 0.13), "WoodWhite")
b.box((1.5, WIDTH + 0.3, 0.7), (GATE_X + 3.2, 0, DECK + GATE_H - 0.3), "WoodDark")
# brick abutments on both banks
for s in (-1, 1):
    b.box((1.2, WIDTH + 0.8, DECK + 0.9), (s * (HALF + 0.6), 0, (DECK - 1.0) / 2 - 0.1), "Brick")
b.build()
export("ophaalbrug")
preview("ophaalbrug", view=(-0.7, -1.3, 0.75))

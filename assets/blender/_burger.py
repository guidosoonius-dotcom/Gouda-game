"""Townspeople: a man in a long coat and hat, a woman in a long coat and headscarf.
Face -Y (game +Z). Origin at the feet. Children `LegL` and `LegR` pivot at the hip. No one is
modelled after a real person."""
from _lib import Builder, export, preview, reset

HIP = 0.8


def build(name, woman):
    reset()
    coat = "Scarf" if woman else "CoatBrown"
    b = Builder("Burger")
    hem = 0.34 if woman else 0.56
    b.loft([[(-0.27, -0.17, hem), (0.27, -0.17, hem), (0.27, 0.19, hem), (-0.27, 0.19, hem)],
            [(-0.21, -0.13, 1.0), (0.21, -0.13, 1.0), (0.21, 0.14, 1.0), (-0.21, 0.14, 1.0)],
            [(-0.23, -0.13, 1.36), (0.23, -0.13, 1.36), (0.23, 0.14, 1.36), (-0.23, 0.14, 1.36)]], coat)
    for s in (-1, 1):
        b.box((0.11, 0.14, 0.56), (s * 0.29, 0.0, 1.07), coat)
        b.box((0.09, 0.09, 0.09), (s * 0.29, 0.0, 0.76), "Skin")
    b.ico(0.112, (0, 0, 1.47), "Skin", scale=(0.92, 1.0, 1.05))
    if woman:
        b.ico(0.135, (0, 0.03, 1.5), "WoodWhite", scale=(1.0, 1.0, 0.95))
        b.box((0.18, 0.1, 0.16), (0, 0.1, 1.36), "WoodWhite")
    else:
        b.cyl(0.19, 0.19, 0.025, (0, 0, 1.56), "Boot", segs=14)
        b.cyl(0.125, 0.115, 0.11, (0, 0, 1.62), "Boot", segs=14)
    body = b.build(bevel=0.035)
    for leg_name, side in (("LegL", -1), ("LegR", 1)):
        leg = Builder(leg_name)
        leg.box((0.15, 0.17, HIP - 0.12), (0, 0, -(HIP - 0.12) / 2), "Boot" if woman else "Metal")
        leg.box((0.16, 0.25, 0.12), (0, -0.04, -HIP + 0.06), "Boot")
        obj = leg.build(bevel=0.03)
        obj.location = (side * 0.1, 0.01, HIP)
        obj.parent = body
    export(name)
    preview(name, view=(0.8, -1.2, 0.45))

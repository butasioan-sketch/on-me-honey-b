"""Eigenes Modell SKU 007: Poloshirt mit Kragen, Dreiknopfleiste und Ärmelbündchen
Referenz: public/products/007/front.jpg (Rohling offen)
Maße: Schätzwerte Unisex M (Brust 54 cm halb, Länge 73 cm).

blender -b -t 1 --python blender/007/build_007.py -- public/models/sku/007-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import tee  # noqa: E402

tee.build(dict(
    name="Polo007",
    length=0.73, half_w=0.270, waist_w=0.266, shoulder_x=0.232, armpit_h=0.51,
    neck_w=0.074, front_drop=0.030, back_drop=0.015, neck_d_front=0.060, neck_d_back=0.058,
    body_d=0.152, fabric=0.0024, folds=0.8,
    sleeve_len=0.200, sleeve_angle=38, cuff_rib=0.025,
    placket=dict(length=0.140, width=0.034, buttons=3), collar=dict(stand=0.028, fall=0.060),
))

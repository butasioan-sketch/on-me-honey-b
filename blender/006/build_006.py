"""Eigenes Modell SKU 006: Tanktop, breite Träger, tiefer Armausschnitt
Referenz: public/products/006/front.jpg (Rohling offen)
Maße: Schätzwerte Unisex M (Brust 51 cm halb, Länge 70 cm), Rohling offen.

blender -b --python blender/006/build_006.py -- public/models/sku/006-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import tee  # noqa: E402

tee.build(dict(
    name="Tank006", sleeveless=True,
    length=0.70, half_w=0.255, waist_w=0.248, hem_w=0.255, armpit_h=0.47, armhole_h=0.43,
    shoulder_x=0.150, shoulder_drop=0.030,
    neck_w=0.100, front_drop=0.130, back_drop=0.060, neck_d_front=0.080, neck_d_back=0.070,
    body_d=0.140, armhole_open=0.60,
))

"""Eigenes Modell SKU 002: Damen-T-Shirt, tailliert, kurze Ärmel
Referenz: public/products/002/front.jpg (Rohling offen)
Maße: Schätzwerte Damen M (Brust 47 cm halb, Länge 64 cm), Rohling offen.

blender -b --python blender/002/build_002.py -- public/models/sku/002-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import tee  # noqa: E402

tee.build(dict(
    name="Tee002",
    length=0.64, half_w=0.235, waist_w=0.205, waist_h=0.22, hem_w=0.228,
    shoulder_x=0.192, shoulder_drop=0.040, armpit_h=0.44,
    neck_w=0.090, front_drop=0.075, back_drop=0.020, neck_d_front=0.066, neck_d_back=0.056,
    body_d=0.135,
    sleeve_len=0.135, sleeve_angle=42, sleeve_root=(0.086, 0.078), sleeve_cuff=(0.066, 0.056),
))

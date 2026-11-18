"""Eigenes Modell SKU 010: Basketballtrikot: Tank, tiefe Armausschnitte, verlängertes Rückenteil
Referenz: public/products/010/front.jpg (Rohling offen)
Maße: Schätzwerte Unisex M (Brust 54 cm halb, Länge 76 cm).

blender -b --python blender/010/build_010.py -- public/models/sku/010-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import tee  # noqa: E402

tee.build(dict(
    name="Basket010", sleeveless=True, back_tail=0.045,
    length=0.76, half_w=0.270, waist_w=0.268, hem_w=0.272, armpit_h=0.48, armhole_h=0.42,
    shoulder_x=0.160, shoulder_drop=0.028,
    neck_w=0.105, front_drop=0.120, back_drop=0.050, neck_d_front=0.082, neck_d_back=0.074,
    body_d=0.150, armhole_open=0.65, fabric=0.0016,
))

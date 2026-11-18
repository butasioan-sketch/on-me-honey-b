"""Eigenes Modell SKU 012: Laufshirt, Raglan-Ärmel, schmal, leicht (120 g/m²)
Referenz: public/products/012/front.jpg (Rohling offen)
Maße: Schätzwerte Unisex M (Brust 51 cm halb, Länge 70 cm), Rohling offen.

blender -b --python blender/012/build_012.py -- public/models/sku/012-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import tee  # noqa: E402

tee.build(dict(
    name="Tee012",
    length=0.70, half_w=0.255, waist_w=0.240, waist_h=0.24, hem_w=0.250,
    shoulder_x=0.215, armpit_h=0.49,
    neck_w=0.084, front_drop=0.078, back_drop=0.020,
    body_d=0.140, fabric=0.0016,
    sleeve_len=0.190, sleeve_angle=40, sleeve_root=(0.094, 0.084), sleeve_cuff=(0.070, 0.058),
    raglan=True, side_seam_lines=True, folds=0.8,
))

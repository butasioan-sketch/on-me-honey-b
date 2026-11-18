"""Eigenes Modell SKU 005: Baby-Body, kurze Ärmel, Schritt mit Beinausschnitten
Referenz: public/products/005/front.jpg (Rohling offen)
Maße: Schätzwerte Größe 74/80 (Brust 23 cm halb, Länge 42 cm).

blender -b -t 1 --python blender/005/build_005.py -- public/models/sku/005-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import tee  # noqa: E402

tee.build(dict(
    name="Body005", crotch=dict(leg_h=0.135, crotch_w=0.045, open=0.70, snaps=3), hem_stitch=False,
    length=0.42, half_w=0.125, waist_w=0.122, waist_h=0.16, shoulder_x=0.112, shoulder_drop=0.018,
    armpit_h=0.31, neck_w=0.052, front_drop=0.040, back_drop=0.014, neck_d_front=0.040, neck_d_back=0.034,
    body_d=0.075, fabric=0.0016, folds=0.5,
    sleeve_len=0.075, sleeve_angle=30, sleeve_root=(0.052, 0.046), sleeve_cuff=(0.044, 0.038),
))

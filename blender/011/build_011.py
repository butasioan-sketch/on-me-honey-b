"""Eigenes Modell SKU 011: Fußballtrikot mit kurzer Knopfleiste, kurze Ärmel
Referenz: public/products/011/front.jpg (Rohling offen)
Maße: Schätzwerte Unisex M (Brust 53 cm halb, Länge 72 cm).

blender -b --python blender/011/build_011.py -- public/models/sku/011-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import tee  # noqa: E402

tee.build(dict(
    name="Football011",
    length=0.72, half_w=0.265, waist_w=0.258, shoulder_x=0.226, armpit_h=0.50,
    neck_w=0.078, front_drop=0.050, back_drop=0.018, neck_d_front=0.064, neck_d_back=0.058,
    body_d=0.148, fabric=0.0016, folds=0.8,
    sleeve_len=0.190, sleeve_angle=38,
    placket=dict(length=0.085, width=0.030, buttons=2),
))

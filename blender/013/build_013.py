"""Eigenes Modell SKU 013: Fitness-Top, tailliertes Kurzarm-Damenshirt mit Raglan-Ärmeln
Referenz: public/products/013/front.jpg (Rohling offen)
Maße: Schätzwerte Damen M (Brust 46 cm halb, Länge 63 cm), Rohling offen.

blender -b --python blender/013/build_013.py -- public/models/sku/013-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import tee  # noqa: E402

tee.build(dict(
    name="Tee013",
    length=0.63, half_w=0.230, waist_w=0.198, waist_h=0.22, hem_w=0.222,
    shoulder_x=0.188, shoulder_drop=0.040, armpit_h=0.43,
    neck_w=0.090, front_drop=0.078, back_drop=0.020, neck_d_front=0.066, neck_d_back=0.056,
    body_d=0.132, fabric=0.0016,
    sleeve_len=0.130, sleeve_angle=42, sleeve_root=(0.084, 0.076), sleeve_cuff=(0.064, 0.054),
    raglan=True, folds=0.8,
))

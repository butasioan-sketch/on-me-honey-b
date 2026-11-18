"""Eigenes Modell SKU 018: Leggings: eng anliegend, breiter Bund
Referenz: public/products/018/front.jpg (Rohling offen)
Maße: Schätzwerte Damen M (Hüfte 45 cm halb, Seitenlänge 92 cm).

blender -b --python blender/018/build_018.py -- public/models/sku/018-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import pants  # noqa: E402

pants.build(dict(
    name="Leggings018",
    waist_w=0.160, hip_w=0.220, hip_d=0.115, rise=0.250, inseam=0.660,
    thigh_r=0.085, knee_r=0.058, hem_r=0.040, leg_sep=0.085, waistband=0.070, folds=0.2, fabric=0.0016,
))

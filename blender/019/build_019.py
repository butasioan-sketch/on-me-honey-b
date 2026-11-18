"""Eigenes Modell SKU 019: Radlerhose: eng, mittlere Oberschenkellänge, breiter Bund
Referenz: public/products/019/front.jpg (Rohling offen)
Maße: Schätzwerte Damen M (Hüfte 45 cm halb, Seitenlänge 45 cm).

blender -b --python blender/019/build_019.py -- public/models/sku/019-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import pants  # noqa: E402

pants.build(dict(
    name="Cycling019",
    waist_w=0.165, hip_w=0.225, hip_d=0.118, rise=0.250, inseam=0.200,
    thigh_r=0.100, knee_r=0.092, hem_r=0.088, leg_sep=0.120, waistband=0.065, folds=0.2, fabric=0.0016,
))

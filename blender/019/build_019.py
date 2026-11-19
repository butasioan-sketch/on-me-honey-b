"""Eigenes Modell SKU 019: Radlerhose: eng, mittlere Oberschenkellänge, breiter Bund
Referenz: public/products/019/front.jpg (Rohling offen)
Maße: Schätzwerte Damen M (Hüfte 45 cm halb, Seitenlänge 45 cm).

blender -b -t 1 --python blender/019/build_019.py -- public/models/sku/019-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import pants  # noqa: E402

pants.build(dict(
    name="Cycling019", square_hip=1.0,
    # Referenz: gerade Seiten, flacher Bund. Hüfte breiter als leg_sep + thigh_r, sonst wölben sich die Beinoberkanten unter dem Bund
    waist_w=0.228, hip_w=0.240, hip_d=0.115, rise=0.240, inseam=0.200,
    thigh_r=0.118, knee_r=0.100, hem_r=0.094, leg_sep=0.112, waistband=0.045, folds=0.2, fabric=0.0016,
))

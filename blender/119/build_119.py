"""Eigenes Modell SKU 119: 5-Panel-Cap: glatte Frontbahn ohne Mittelnaht, flacherer Schirm
Referenz: public/products/119/front.jpg (Rohling offen)
Maße: Schätzwerte Kopfumfang 57 cm, Kronenhöhe 10 cm.

blender -b -t 1 --python blender/119/build_119.py -- public/models/sku/119-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import cap  # noqa: E402

cap.build(dict(
    name="FivePanel119", panels=5, height=0.100, brim_curve=0.035,
))

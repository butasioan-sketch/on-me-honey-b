"""Eigenes Modell SKU 118: Trucker-Cap: hohe Front, Netz an Seiten und Rücken
Referenz: public/products/118/front.jpg (Rohling offen)
Maße: Schätzwerte Kopfumfang 58 cm, Kronenhöhe 13 cm.

blender -b -t 1 --python blender/118/build_118.py -- public/models/sku/118-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import cap  # noqa: E402

cap.build(dict(
    name="Trucker118", height=0.125, front_lift=0.12, mesh_back=True, brim_len=0.078,
))

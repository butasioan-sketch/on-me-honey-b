"""Eigenes Modell SKU 120: Sportcap: perforierte Seitenbahnen, eingefasster flexibler Schirm
Referenz: public/products/120/front.jpg (Rohling offen)
Maße: Schätzwerte Kopfumfang 57 cm.

blender -b -t 1 --python blender/120/build_120.py -- public/models/sku/120-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import cap  # noqa: E402

cap.build(dict(
    name="Sport120", height=0.105, perforated=True, brim_binding=True, brim_curve=0.050,
))

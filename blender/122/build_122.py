"""Eigenes Modell SKU 122: Visor: Schirm mit Stirnband und Riemen, ohne Krone
Referenz: public/products/122/front.jpg (Rohling offen)
Maße: Schätzwerte Kopfumfang 57 cm, Schirm 8 cm.
Prüfgeometrie: Visor ohne Krone, offene Oberseite. Gesamthöhe ~7 cm (Stirnband 4 cm + Schirmbiegung)
liegt bewusst unter der Cap-Mindesthöhe; Verifier-Regel für 122 als "visor" statt "cap" führen.

blender -b -t 1 --python blender/122/build_122.py -- public/models/sku/122-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import cap  # noqa: E402

cap.build(dict(
    name="Visor122", visor=True, brim_len=0.080, band_h=0.040,
))

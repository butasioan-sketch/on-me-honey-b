"""Eigenes Modell SKU 023: Unterhemd mit Spaghettiträgern (Camisole)
Referenz: public/products/023/front.jpg (Rohling offen)
Maße: Schätzwerte Damen M (Brust 45 cm halb, Länge 62 cm), Rohling offen.

blender -b -t 1 --python blender/023/build_023.py -- public/models/sku/023-v1.glb [quelle.blend] [render-prefix]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
import tee  # noqa: E402

tee.build(dict(
    name="Cami023", sleeveless=True,
    length=0.62, half_w=0.225, waist_w=0.205, waist_h=0.22, hem_w=0.228, armpit_h=0.40, armhole_h=0.95,  # kein Armausschnitt: Rumpf schließt gerade ab, Träger separat
    shoulder_x=0.160, shoulder_drop=0.010, neck_style="flat",
    # neck_w breiter als der Rumpf: gerader Abschluss über die ganze Breite
    neck_w=0.240, front_drop=0.195, back_drop=0.195, neck_d_front=0.080, neck_d_back=0.072,  # gleich hoch, damit die Seitennaht schließt
    straps=dict(width=0.010, x=0.090, height=0.200),
    body_d=0.125, armhole_open=0.55, fabric=0.0016, folds=0.8,
))

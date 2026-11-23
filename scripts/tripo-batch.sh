#!/usr/bin/env bash
# Foto → Tripo → Shop-GLB-Kandidat → Probe-Render → Kontaktbogen (nichts landet ungeprüft im Shop).
#
#   scripts/tripo-batch.sh <arbeitsordner> <vorlagen-ordner> <sku> [<sku> ...]
#
# Pro SKU im Arbeitsordner:
#   <sku>-tripo.glb   Rohmodell von Tripo (Credits werden nur hier verbraucht; vorhandene werden übersprungen)
#   <sku>-v1.glb      Shop-Kandidat (Draco, auf das bisherige Modell eingepasst, Front nach +Z)
#   <sku>-render.png  Probe-Render (Blender über `schwer`)
#   bogen.jpg         alt (public/products/<sku>/glb.webp) | neu, je SKU eine Zeile
# Umgebung: YAW (Standard -90, Tripo liefert Front nach -X), SAMPLES (Standard 16),
#           YAW_<sku> für einzelne Abweichungen, z. B. YAW_024=0.
set -euo pipefail
cd "$(dirname "$0")/.."
work=$1 src=$2; shift 2
mkdir -p "$work"

todo=()
for s in "$@"; do
  [[ -s "$work/$s-tripo.glb" ]] || todo+=("$s=$src/$s.jpg")
done
if ((${#todo[@]})); then
  node scripts/tripo-image-to-3d.mjs "$work" "${todo[@]}"
fi

for s in "$@"; do
  [[ -s "$work/$s-tripo.glb" ]] || { echo "$s: kein Tripo-Modell – übersprungen"; continue; }
  yv="YAW_$s"; yaw=${!yv:-${YAW:--90}}
  ref=public/models/sku/$s-v1.glb
  YAW=$yaw node scripts/glb-from-photo3d.mjs "$work/$s-tripo.glb" "$work/$s-v1.glb" "$ref"
  YAW=$yaw NODRACO=1 node scripts/glb-from-photo3d.mjs "$work/$s-tripo.glb" "$work/$s-render.glb" "$ref" >/dev/null
done

SCHWER_AGENT=${SCHWER_AGENT:-tripo-batch} schwer bash -c '
  for s in "$@"; do
    [[ -s "'"$work"'/$s-render.glb" ]] || continue
    blender -b -t 2 --python blender/lib/render_studio.py -- "'"$work"'/$s-render.glb" "'"$work"'/$s-render.png" "'"${SAMPLES:-16}"'" >/dev/null 2>&1 \
      || echo "$s: Render fehlgeschlagen"
  done' _ "$@"

python3 - "$work" "$@" <<'EOF'
import sys, os
from PIL import Image, ImageDraw
work, skus = sys.argv[1], sys.argv[2:]
W, H = 300, 400
rows = [s for s in skus if os.path.exists(f"{work}/{s}-render.png")]
sheet = Image.new("RGB", (W * 2, H * max(len(rows), 1)), "white")
d = ImageDraw.Draw(sheet)
for i, s in enumerate(rows):
    old = f"public/products/{s}/glb.webp"
    for j, f in enumerate([old, f"{work}/{s}-render.png"]):
        if os.path.exists(f):
            im = Image.open(f).convert("RGB"); im.thumbnail((W, H)); sheet.paste(im, (j * W, i * H))
    d.text((6, i * H + 6), f"{s} alt", fill="red"); d.text((W + 6, i * H + 6), f"{s} neu", fill="red")
sheet.save(f"{work}/bogen.jpg", quality=82)
print(f"Kontaktbogen: {work}/bogen.jpg ({len(rows)} SKUs)")
EOF

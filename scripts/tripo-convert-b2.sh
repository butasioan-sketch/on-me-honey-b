#!/bin/bash
# Stufe 3: Tripo-Rohmodelle → Shop-Kandidat (public/models/sku/<sku>-v1.glb, Draco).
#   scripts/tripo-convert-b2.sh <rohmodell-ordner> <masken-ordner> [<sku> ...]
# Drehung je Artikel aus dem Kontaktbogen + Maßen (glb-bounds.mjs) bestimmt:
#   YAW   Drehung um die Hochachse (Standard -90: Tripo liefert Front nach -X)
#   PITCH Kippen um die Querachse (liegend modellierte flache Artikel)
#   SM    1 = Logo-Fläche aus der Maske glätten, F = ganze Vorderseite kräftig, 0 = keine Glättung
# Bleiben beim alten Modell (Tripo-Ergebnis schlechter): 040 verdreht, 044 Lasche, 047/048/049 Bruchstücke,
# 120/121 Dellen in der Cap-Front, 132 Sohle verdreht, 038/041/045/046/050 Logo-Abdruck trotz Glättung,
# 042 Formfehler, 039 zerknittert.
set -euo pipefail
cd "$(dirname "$0")/.."
raw=$1 masks=$2; shift 2
#  sku  YAW  PITCH SM
table="
032 0 0 1
033 0 0 1
034 0 0 1
035 0 0 1
036 0 0 1
037 0 0 1
043 0 0 1
062 0 0 1
117 0 0 1
118 -90 0 1
119 -90 0 1
122 -90 0 1
130 90 0 1
131 0 0 1
133 0 0 1
"
want=" $* "
while read -r k yaw pitch sm; do
  [ -z "$k" ] && continue
  [ "$#" -gt 0 ] && [[ "$want" != *" $k "* ]] && continue
  env=(YAW="$yaw" PITCH="$pitch" WHITE=2 ISLANDS=0.05)
  if [ "$sm" = 1 ]; then
    box=$(python3 -I -c "
from PIL import Image
im=Image.open('$masks/$k-mask.png').convert('L'); w,h=im.size; b=im.point(lambda v:255 if v>127 else 0).getbbox()
print(f'{max(b[0]/w-0.06,0):.2f},{min(b[2]/w+0.06,1):.2f},{max(b[1]/h-0.05,0):.2f},{min(b[3]/h+0.09,1):.2f}')")
    env+=(SMOOTH="$box" SMOOTH_ITERS=60)
  elif [ "$sm" = F ]; then
    env+=(SMOOTH="0.06,0.94,0.06,0.94" SMOOTH_ITERS=120)
  fi
  ref=$(mktemp --suffix=.glb)
  git show "origin/main:public/models/sku/$k-v1.glb" > "$ref"
  env "${env[@]}" node scripts/glb-from-photo3d.mjs "$raw/$k-tripo.glb" "public/models/sku/$k-v1.glb" "$ref" \
    | grep -o '"kb[^,]*' | sed "s/^/$k yaw=$yaw pitch=$pitch sm=$sm /"
  rm -f "$ref"
done <<< "$table"

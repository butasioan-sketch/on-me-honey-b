#!/bin/bash
# b2: Tripo-Rohmodelle → Shop-Kandidat (-v1.glb, Draco) + Render-Kopie (-render.glb)
cd ~/Schreibtisch/on-me-honey-b-glbonly
S=/tmp/claude-1000/-home-jonny/d5c81a3b-4923-4937-af5c-ce2138546c5e/scratchpad
for k in 032 033 034 035 036 037 038 039 040 041 042 043 044 045 046 047 048 049 050 062 117 118 119 120 121 122 130 131 132 133; do
  SM=$(python3 -I -c "
from PIL import Image
im=Image.open('$S/masks/$k-mask.png').convert('L'); w,h=im.size; b=im.point(lambda v:255 if v>127 else 0).getbbox()
a,c,bb,d=b[0]/w,b[2]/w,b[1]/h,b[3]/h
print(f'{max(a-0.06,0):.2f},{min(c+0.06,1):.2f},{max(bb-0.05,0):.2f},{min(d+0.09,1):.2f}')")
  E="SMOOTH=$SM SMOOTH_ITERS=60 WHITE=2 YAW=${YAW:--90} ISLANDS=0.05"
  env $E node scripts/glb-from-photo3d.mjs $S/b2/$k-tripo.glb $S/b2/$k-v1.glb public/models/sku/$k-v1.glb 2>&1 | grep -o '"kb[^,]*' | sed "s/^/$k $SM /" || echo "$k FEHLER v1"
  env $E NODRACO=1 node scripts/glb-from-photo3d.mjs $S/b2/$k-tripo.glb $S/b2/$k-render.glb public/models/sku/$k-v1.glb >/dev/null 2>&1 || echo "$k FEHLER render"
done
echo KONV-FERTIG

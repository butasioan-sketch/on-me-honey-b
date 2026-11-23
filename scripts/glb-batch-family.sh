#!/bin/bash
# glb-batch-family.sh "<skus>" — baut, materialisiert und rendert die SKUs nacheinander; jeder Blender-Aufruf über `schwer` (rechnerweite Sperre, ~/SYSTEM.md)
cd ~/Schreibtisch/on-me-honey-b-glbonly
S=${STUDIO_OUT:-/tmp/onme-studio}
mkdir -p $S/studio
for s in $1; do
  if [ -f blender/$s/build_$s.py ] && [ "$2" != "norebuild" ]; then
    SCHWER_AGENT=${SCHWER_AGENT:-claude-onme} schwer blender -b -t 1 --python blender/$s/build_$s.py -- public/models/sku/$s-v1.glb > $S/studio/$s.build.log 2>&1 || { echo "$s BUILD_FAIL"; continue; }
  fi
  node scripts/glb-materials.mjs public/models/sku $s > /dev/null 2>&1 || echo "$s MAT_FAIL"
  mkdir -p $S/studio; SCHWER_AGENT=${SCHWER_AGENT:-claude-onme} schwer blender -b -t 2 --python blender/lib/render_studio.py -- public/models/sku/$s-v1.glb $S/studio/$s.png 32 > $S/studio/$s.render.log 2>&1 && echo "$s ok" || echo "$s RENDER_FAIL"
done
echo BATCH_DONE

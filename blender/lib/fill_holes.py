"""Kleine Löcher in einem Foto-zu-3D-Netz schließen (Halsöffnung und Ärmel bleiben offen).
blender -b --python blender/lib/fill_holes.py -- <in.glb> <out.glb> [max_kanten=40] [glätten=0]"""
import sys
import bpy
import bmesh

argv = sys.argv[sys.argv.index("--") + 1:]
src, dst = argv[0], argv[1]
maxe = int(argv[2]) if len(argv) > 2 else 40
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
total = 0
for o in [o for o in bpy.context.scene.objects if o.type == "MESH"]:
    bm = bmesh.new()
    bm.from_mesh(o.data)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bm.verts.index_update()
    for _ in range(int(argv[3]) if len(argv) > 3 else 0):
        bmesh.ops.smooth_vert(bm, verts=bm.verts, factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
    # lose Kleinteile (Schwebeteile, eingeschlossene Splitter) entfernen, Hauptkörper behalten
    seen, islands = set(), []
    for v in bm.verts:
        if v.index in seen:
            continue
        stack, isl = [v], []
        seen.add(v.index)
        while stack:
            x = stack.pop()
            isl.append(x)
            for e in x.link_edges:
                y = e.other_vert(x)
                if y.index not in seen:
                    seen.add(y.index)
                    stack.append(y)
        islands.append(isl)
    islands.sort(key=len, reverse=True)
    small = [v for isl in islands[1:] if len(isl) < 0.02 * len(islands[0]) for v in isl]
    print("INSELN", len(islands), "entfernt Ecken", len(small))
    bmesh.ops.delete(bm, geom=small, context="VERTS")
    bm.edges.ensure_lookup_table()
    boundary = [e for e in bm.edges if e.is_boundary]
    before = len(boundary)
    res = bmesh.ops.holes_fill(bm, edges=boundary, sides=maxe)
    total += len(res["faces"])
    bm.to_mesh(o.data)
    bm.free()
    print("RAND", o.name, before, "neue Flächen", len(res["faces"]))
bpy.ops.export_scene.gltf(filepath=dst, export_format="GLB")
print("FILL_OK", total)

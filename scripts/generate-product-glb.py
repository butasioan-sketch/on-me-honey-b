#!/usr/bin/env python3
"""
ON ME HONEY B — Automated GLB Generator
Erstellt/optimiert 3D-Modelle für Produkte mit Blender Python API

Verwendung:
    python3 generate-product-glb.py --product tshirt --output public/models/shirt-white-v3.glb
    python3 generate-product-glb.py --product shorts --output public/models/shorts-white-v2.glb

Optional: Mit AI-generierten Mesh als Input:
    python3 generate-product-glb.py --input downloaded-mesh.glb --output optimized.glb
"""

import bpy
import bmesh
import sys
import os
import argparse
import math
from pathlib import Path

def clear_scene():
    """Löscht alle Objekte in der Szene"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

def create_white_material(name="WhiteFabric"):
    """Erstellt weißes Material für Polyester-Look"""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()

    # Output Node
    output = nodes.new(type='ShaderNodeOutputMaterial')
    output.location = (300, 0)

    # Principled BSDF
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    bsdf.location = (0, 0)

    # Weiße Farbe
    bsdf.inputs['Base Color'].default_value = (1.0, 1.0, 1.0, 1.0)  # RGBA white
    bsdf.inputs['Roughness'].default_value = 0.4  # Leicht glänzend (Polyester)
    bsdf.inputs['Metallic'].default_value = 0.0

    # Verbinden
    mat.node_tree.links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])

    return mat

def create_tshirt_mesh():
    """
    Erstellt ein prozedurales T-Shirt Mesh
    HINWEIS: Dies ist ein einfaches Beispiel. Für Production besser:
    - Echtes 3D-Scan verwenden
    - Von Marketplace (Fab.com) herunterladen
    - Mit AI-Tool (Meshy.ai) generieren
    """
    print("Erstelle T-Shirt Mesh (prozedural)...")

    # Basis: Zylinder für Torso
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=32,
        radius=0.5,
        depth=1.5,
        location=(0, 0, 0)
    )
    torso = bpy.context.active_object
    torso.name = "TShirt_Torso"

    # Modifier: Subdivision für smoothness
    mod_subsurf = torso.modifiers.new(name="Subdivision", type='SUBSURF')
    mod_subsurf.levels = 2
    mod_subsurf.render_levels = 2

    # Weißes Material zuweisen
    mat = create_white_material("TShirt_White")
    torso.data.materials.append(mat)

    # In Edit Mode gehen und Shape anpassen
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')

    # TODO: Mehr Details hinzufügen:
    # - Ärmel
    # - Kragen
    # - Saum
    # - Nähte

    bpy.ops.object.mode_set(mode='OBJECT')

    return torso

def create_shorts_mesh():
    """Erstellt ein prozedurales Shorts Mesh"""
    print("Erstelle Shorts Mesh (prozedural)...")

    # Basis: Zylinder für Beinöffnungen
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=24,
        radius=0.6,
        depth=0.8,
        location=(0, 0, 0)
    )
    shorts = bpy.context.active_object
    shorts.name = "Shorts_Main"

    # Subdivision
    mod_subsurf = shorts.modifiers.new(name="Subdivision", type='SUBSURF')
    mod_subsurf.levels = 1

    # Weißes Material
    mat = create_white_material("Shorts_White")
    shorts.data.materials.append(mat)

    bpy.ops.object.mode_set(mode='OBJECT')

    return shorts

def optimize_mesh(obj):
    """Optimiert Mesh für Web (reduziert Polygone, cleaned up)"""
    print(f"Optimiere Mesh: {obj.name}")

    # Select object
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

    # Decimate Modifier (optional, nur wenn zu viele Polygone)
    # mod_decimate = obj.modifiers.new(name="Decimate", type='DECIMATE')
    # mod_decimate.ratio = 0.5  # 50% der Polygone behalten

    # Apply all modifiers
    bpy.ops.object.convert(target='MESH')

    # Cleanup
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.remove_doubles(threshold=0.001)
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode='OBJECT')

def center_and_scale_mesh(obj, target_height=1.0):
    """Zentriert und skaliert Mesh auf einheitliche Größe"""
    print(f"Zentriere und skaliere {obj.name} auf Höhe {target_height}")

    # Berechne Bounding Box
    bbox_corners = [obj.matrix_world @ mathutils.Vector(corner) for corner in obj.bound_box]

    min_z = min(corner.z for corner in bbox_corners)
    max_z = max(corner.z for corner in bbox_corners)
    current_height = max_z - min_z

    # Skalierung berechnen
    if current_height > 0:
        scale_factor = target_height / current_height
        obj.scale = (scale_factor, scale_factor, scale_factor)
        bpy.ops.object.transform_apply(scale=True)

    # Zentrieren
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
    obj.location = (0, 0, 0)

def load_and_process_mesh(input_path):
    """Lädt ein existierendes Mesh und bereitet es vor"""
    print(f"Lade Mesh von: {input_path}")

    if input_path.endswith('.glb') or input_path.endswith('.gltf'):
        bpy.ops.import_scene.gltf(filepath=input_path)
    elif input_path.endswith('.obj'):
        bpy.ops.import_scene.obj(filepath=input_path)
    elif input_path.endswith('.fbx'):
        bpy.ops.import_scene.fbx(filepath=input_path)
    else:
        raise ValueError(f"Unsupported file format: {input_path}")

    # Get imported object (assumes single mesh)
    obj = bpy.context.selected_objects[0]

    # Weißes Material zuweisen
    mat = create_white_material("Product_White")
    obj.data.materials.clear()
    obj.data.materials.append(mat)

    return obj

def export_glb(obj, output_path):
    """Exportiert Mesh als GLB"""
    print(f"Exportiere nach: {output_path}")

    # Nur das Objekt auswählen
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)

    # Export GLB
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        use_selection=True,
        export_materials='EXPORT',
        export_colors=True,
        export_normals=True,
        export_texcoords=False,  # Keine UVs nötig (Decals)
        export_apply=True
    )

    print(f"✅ GLB erstellt: {output_path}")

    # Dateigröße anzeigen
    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"   Größe: {size_mb:.2f} MB")

def main():
    parser = argparse.ArgumentParser(description='Generiere 3D GLB-Modelle für ON ME HONEY B Produkte')
    parser.add_argument('--product', choices=['tshirt', 'shorts'],
                       help='Produkt-Typ (generiert prozedurales Mesh)')
    parser.add_argument('--input', type=str,
                       help='Input Mesh-Datei (.glb, .obj, .fbx) zum Optimieren')
    parser.add_argument('--output', type=str, required=True,
                       help='Output GLB-Pfad')
    parser.add_argument('--height', type=float, default=1.0,
                       help='Ziel-Höhe für Normalisierung (default: 1.0)')

    args = parser.parse_args()

    # Szene aufräumen
    clear_scene()

    # Mesh erstellen oder laden
    if args.input:
        obj = load_and_process_mesh(args.input)
    elif args.product == 'tshirt':
        obj = create_tshirt_mesh()
    elif args.product == 'shorts':
        obj = create_shorts_mesh()
    else:
        print("❌ Fehler: --product oder --input muss angegeben werden")
        sys.exit(1)

    # Optimieren
    optimize_mesh(obj)
    center_and_scale_mesh(obj, target_height=args.height)

    # Exportieren
    output_dir = os.path.dirname(args.output)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)

    export_glb(obj, args.output)

    print("\n✅ Fertig!")

if __name__ == "__main__":
    # Blender headless mode check
    try:
        import mathutils
        main()
    except ImportError:
        print("❌ Dieses Script muss mit Blender ausgeführt werden:")
        print("   blender --background --python generate-product-glb.py -- --product tshirt --output output.glb")

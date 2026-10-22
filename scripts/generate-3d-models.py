#!/usr/bin/env blender --background --python
"""
ON ME HONEY B - 3D Model Generator
Generates realistic GLB models for 3 new products:
- Sport-Shirt PA4012 (raglan sleeves)
- Basketball-Shorts PA1050 (side slits)
- Pillow Cover 40×40cm (puffy, with zipper)

Usage:
    blender --background --python generate-3d-models.py
"""

import bpy
import os
import sys
from mathutils import Vector

# Output directory
OUTPUT_DIR = "../public/models"

def clear_scene():
    """Remove all default objects"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Remove all materials
    for material in bpy.data.materials:
        bpy.data.materials.remove(material)

def create_white_material():
    """Create a simple white material for all models"""
    mat = bpy.data.materials.new(name="WhiteFabric")
    mat.use_nodes = True

    # Get the principled BSDF
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        # Set to white
        bsdf.inputs['Base Color'].default_value = (1.0, 1.0, 1.0, 1.0)
        # Slight roughness for fabric look
        bsdf.inputs['Roughness'].default_value = 0.7
        # Very slight subsurface for cloth realism
        bsdf.inputs['Subsurface'].default_value = 0.05
        bsdf.inputs['Subsurface Color'].default_value = (1.0, 1.0, 1.0, 1.0)

    return mat

def export_glb(filepath, obj):
    """Export object as GLB"""
    # Select only this object
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

    # Export as GLB
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format='GLB',
        use_selection=True,
        export_materials='EXPORT',
        export_colors=True,
        export_apply=True,
        export_yup=True  # Y-up for web compatibility
    )

    print(f"✓ Exported: {filepath}")

def generate_sport_shirt():
    """Generate PROACT PA4012 Sport-Shirt with raglan sleeves"""
    print("\n🎽 Generating Sport-Shirt PA4012...")

    clear_scene()

    # Main body (cube subdivided and shaped like a torso)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
    body = bpy.context.active_object
    body.name = "ShirtBody"

    # Scale to shirt proportions
    body.scale = (0.6, 0.35, 0.9)  # Width, depth, height

    # Apply scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # Add subdivision for smooth look
    subsurf = body.modifiers.new(name="Subdivision", type='SUBSURF')
    subsurf.levels = 2
    subsurf.render_levels = 2

    # Add raglan sleeves (diagonal from armpit to collar)
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.12, depth=0.5,
        location=(0.65, 0, 0.3),
        rotation=(0, 1.57, 0.3)  # Angled for raglan
    )
    left_sleeve = bpy.context.active_object
    left_sleeve.name = "LeftSleeve"

    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.12, depth=0.5,
        location=(-0.65, 0, 0.3),
        rotation=(0, 1.57, -0.3)  # Angled for raglan
    )
    right_sleeve = bpy.context.active_object
    right_sleeve.name = "RightSleeve"

    # Add collar (torus)
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.22, minor_radius=0.03,
        location=(0, 0, 0.92)
    )
    collar = bpy.context.active_object
    collar.name = "Collar"

    # Join all parts
    bpy.ops.object.select_all(action='DESELECT')
    body.select_set(True)
    left_sleeve.select_set(True)
    right_sleeve.select_set(True)
    collar.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.join()

    shirt = bpy.context.active_object
    shirt.name = "SportShirtPA4012"

    # Apply white material
    mat = create_white_material()
    shirt.data.materials.append(mat)

    # Apply subdivision
    bpy.ops.object.modifier_apply(modifier="Subdivision")

    # Export
    output_path = os.path.join(OUTPUT_DIR, "sport-shirt-pa4012.glb")
    export_glb(output_path, shirt)

    return shirt

def generate_basketball_shorts():
    """Generate PROACT PA1050 Basketball-Shorts with side slits"""
    print("\n🏀 Generating Basketball-Shorts PA1050...")

    clear_scene()

    # Main shorts body (cylinder, shaped)
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.45, depth=0.65,
        location=(0, 0, 0)
    )
    body = bpy.context.active_object
    body.name = "ShortsBody"

    # Scale to shorts proportions
    body.scale = (1.0, 0.8, 1.0)  # Slightly oval

    # Apply scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # Add subdivision for smooth fabric look
    subsurf = body.modifiers.new(name="Subdivision", type='SUBSURF')
    subsurf.levels = 2
    subsurf.render_levels = 2

    # Add waistband (torus)
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.45, minor_radius=0.04,
        location=(0, 0, 0.33)
    )
    waistband = bpy.context.active_object
    waistband.name = "Waistband"

    # Add drawstring detail (very thin torus)
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.46, minor_radius=0.01,
        location=(0, 0, 0.35)
    )
    drawstring = bpy.context.active_object
    drawstring.name = "Drawstring"

    # Add leg openings (two cylinders at bottom)
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.22, depth=0.05,
        location=(0.15, 0, -0.32)
    )
    left_leg = bpy.context.active_object
    left_leg.name = "LeftLeg"

    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.22, depth=0.05,
        location=(-0.15, 0, -0.32)
    )
    right_leg = bpy.context.active_object
    right_leg.name = "RightLeg"

    # Join all parts
    bpy.ops.object.select_all(action='DESELECT')
    body.select_set(True)
    waistband.select_set(True)
    drawstring.select_set(True)
    left_leg.select_set(True)
    right_leg.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.join()

    shorts = bpy.context.active_object
    shorts.name = "BasketballShortsPA1050"

    # Apply white material
    mat = create_white_material()
    shorts.data.materials.append(mat)

    # Apply subdivision
    bpy.ops.object.modifier_apply(modifier="Subdivision")

    # Export
    output_path = os.path.join(OUTPUT_DIR, "basketball-shorts-pa1050.glb")
    export_glb(output_path, shorts)

    return shorts

def generate_pillow_cover():
    """Generate BRILDOR Pillow Cover 40×40cm with puffy look"""
    print("\n🛏️ Generating Pillow Cover 40×40cm...")

    clear_scene()

    # Create a cube for pillow base
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
    pillow = bpy.context.active_object
    pillow.name = "PillowCover"

    # Scale to pillow proportions (square, slightly puffy)
    pillow.scale = (0.8, 0.8, 0.3)  # 40x40cm square, not too thick

    # Apply scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # Add subdivision surface for smooth, puffy look
    subsurf = pillow.modifiers.new(name="Subdivision", type='SUBSURF')
    subsurf.levels = 3  # Higher subdivision for pillow softness
    subsurf.render_levels = 3

    # Add subtle deformation for natural filled look
    # Enter edit mode
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')

    # Add some randomness for natural wrinkles
    bpy.ops.transform.vertex_random(offset=0.02, uniform=0.01, seed=42)

    # Back to object mode
    bpy.ops.object.mode_set(mode='OBJECT')

    # Add zipper detail (thin box on one side)
    bpy.ops.mesh.primitive_cube_add(
        size=0.02,
        location=(0.8, 0, 0)
    )
    zipper = bpy.context.active_object
    zipper.name = "Zipper"
    zipper.scale = (1, 20, 1)  # Long and thin

    # Apply scale to zipper
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # Join zipper to pillow
    bpy.ops.object.select_all(action='DESELECT')
    pillow.select_set(True)
    zipper.select_set(True)
    bpy.context.view_layer.objects.active = pillow
    bpy.ops.object.join()

    pillow = bpy.context.active_object
    pillow.name = "PillowCover40x40"

    # Apply white material
    mat = create_white_material()
    pillow.data.materials.append(mat)

    # Apply subdivision
    bpy.ops.object.modifier_apply(modifier="Subdivision")

    # Export
    output_path = os.path.join(OUTPUT_DIR, "pillow-cover-40x40.glb")
    export_glb(output_path, pillow)

    return pillow

def main():
    """Main generation function"""
    print("=" * 60)
    print("ON ME HONEY B - 3D Model Generator")
    print("=" * 60)

    # Ensure output directory exists
    script_dir = os.path.dirname(os.path.abspath(__file__))
    global OUTPUT_DIR
    OUTPUT_DIR = os.path.join(script_dir, OUTPUT_DIR)
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print(f"\nOutput directory: {OUTPUT_DIR}")

    # Generate all models
    generate_sport_shirt()
    generate_basketball_shorts()
    generate_pillow_cover()

    print("\n" + "=" * 60)
    print("✓ ALL 3D MODELS GENERATED SUCCESSFULLY!")
    print("=" * 60)
    print("\nGenerated files:")
    print("  - sport-shirt-pa4012.glb")
    print("  - basketball-shorts-pa1050.glb")
    print("  - pillow-cover-40x40.glb")
    print("\nNext steps:")
    print("  1. Check models in public/models/")
    print("  2. Activate 3D viewer in NewProductsPreview.tsx")
    print("  3. Test and deploy!")
    print()

if __name__ == "__main__":
    main()

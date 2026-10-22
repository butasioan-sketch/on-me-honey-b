#!/usr/bin/env python3
"""
Simple 3D Model Generator for ON ME HONEY B
Creates basic but functional GLB models
"""

import bpy
import os

# Clear scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Create white material
def create_material():
    mat = bpy.data.materials.new(name="White")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs[0].default_value = (1, 1, 1, 1)  # Base Color = White
        bsdf.inputs[9].default_value = 0.7  # Roughness
    return mat

mat = create_material()

print("\\n🎽 Creating Sport-Shirt...")
# Sport Shirt - Simple T-shirt shape
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
shirt = bpy.context.active_object
shirt.scale = (0.6, 0.3, 0.85)
bpy.ops.object.transform_apply(scale=True)
subsurf = shirt.modifiers.new("Subsurf", 'SUBSURF')
subsurf.levels = 2
shirt.data.materials.append(mat)
bpy.ops.object.modifier_apply(modifier="Subsurf")
bpy.ops.export_scene.gltf(
    filepath="../public/models/sport-shirt-pa4012.glb",
    export_format='GLB',
    use_selection=True
)
print("✓ sport-shirt-pa4012.glb created")

# Clear for next model
bpy.ops.object.delete()

print("\\n🏀 Creating Basketball-Shorts...")
# Basketball Shorts - Cylinder shape
bpy.ops.mesh.primitive_cylinder_add(radius=0.4, depth=0.6, location=(0, 0, 0))
shorts = bpy.context.active_object
shorts.scale = (1, 0.85, 1)
bpy.ops.object.transform_apply(scale=True)
subsurf = shorts.modifiers.new("Subsurf", 'SUBSURF')
subsurf.levels = 2
shorts.data.materials.append(mat)
bpy.ops.object.modifier_apply(modifier="Subsurf")
bpy.ops.export_scene.gltf(
    filepath="../public/models/basketball-shorts-pa1050.glb",
    export_format='GLB',
    use_selection=True
)
print("✓ basketball-shorts-pa1050.glb created")

# Clear for next model
bpy.ops.object.delete()

print("\\n🛏️ Creating Pillow Cover...")
# Pillow - Cube with high subdivision
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
pillow = bpy.context.active_object
pillow.scale = (0.75, 0.75, 0.25)
bpy.ops.object.transform_apply(scale=True)
subsurf = pillow.modifiers.new("Subsurf", 'SUBSURF')
subsurf.levels = 3
pillow.data.materials.append(mat)
bpy.ops.object.modifier_apply(modifier="Subsurf")
bpy.ops.export_scene.gltf(
    filepath="../public/models/pillow-cover-40x40.glb",
    export_format='GLB',
    use_selection=True
)
print("✓ pillow-cover-40x40.glb created")

print("\\n✓ ALL 3 MODELS GENERATED!\\n")

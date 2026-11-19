"""Rendert Vorder- und Rückansicht eines SKU-GLB orthografisch (1024×1536, 2:3) und berechnet
eine vorläufige Druckfläche je Seite: DIN A4 hochkant (210×297 mm), mittig auf dem Körper,
nie breiter als 80 % der Kleidungsbreite an dieser Stelle (Seitenverhältnis A4 bleibt).

Die Modelle sind in Metern auf Schätzmaße gebaut (siehe blender/<sku>/build_<sku>.py), daher
sind die Werte VORLÄUFIG – nicht durch Maßblatt oder Testdruck bestätigt.

blender -b -t 1 --python blender/lib/render_print_views.py -- <glb> <out_dir> <sku> <kind>
kind: top (Oberteil) | bottom (Hose)
Schreibt <out_dir>/render-front.png, render-back.png und gibt eine JSON-Zeile "PROFILE {...}" aus.
"""
import json
import math
import sys

import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
glb, out_dir, sku, kind = argv[0], argv[1], argv[2], argv[3]
W_PX, H_PX = 1024, 1536
# Abweichungen je SKU (an den Kontrollbildern festgelegt):
#  top_off: Abstand der Druckflächen-Oberkante von der höchsten Modellstelle je Seite (m)
#  chest_left: Vorderseite nur linke Brust neben dem Reißverschluss
OVERRIDES = {
    "014": {"top_off": {"front": 0.11, "back": 0.17}},          # Sport-BH: unter Ausschnitt
    "020": {"chest_left": True},                                  # Trainingsjacke: Reißverschluss
    "021": {"top_off": {"front": 0.39, "back": 0.40}},          # Hoodie: unter der Kapuze
    "023": {"top_off": {"front": 0.27, "back": 0.27}},          # Unterhemd: unter den Trägern
}
A4_W, A4_H = 0.210, 0.297

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb)
meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
verts = [o.matrix_world @ v.co for o in meshes for v in o.data.vertices]
xs, ys, zs = [v.x for v in verts], [v.y for v in verts], [v.z for v in verts]
minx, maxx, miny, maxy, minz, maxz = min(xs), max(xs), min(ys), max(ys), min(zs), max(zs)
cx, cy = (minx + maxx) / 2, (miny + maxy) / 2
height, width = maxz - minz, maxx - minx


def width_at(z, band=0.02):
    sl = [v.x for v in verts if abs(v.z - z) < band]
    return (max(sl) - min(sl)) if len(sl) > 3 else width


# Bildausschnitt: 2:3, Kleidung mit 8 % Rand
frame_h = max(height, width * 1.5) * 1.08
frame_w = frame_h / 1.5
frame_left, frame_top = cx - frame_w / 2, (minz + maxz) / 2 + frame_h / 2

scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.samples = 16
scene.cycles.use_denoising = False
scene.cycles.device = "CPU"
scene.render.resolution_x, scene.render.resolution_y = W_PX, H_PX
scene.render.film_transparent = True
world = bpy.data.worlds.new("w")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.92, 0.92, 0.92, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 1.0
scene.world = world
cam_data = bpy.data.cameras.new("cam")
cam_data.type = "ORTHO"
cam_data.ortho_scale = frame_h  # bei Hochformat gilt ortho_scale für die längere Seite
cam = bpy.data.objects.new("cam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam
sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN"))
sun.data.energy = 3.0
scene.collection.objects.link(sun)


def place_print(side):
    if kind == "body":
        # Body: Oberkante 7 cm unter dem Kragen, Höhe höchstens 45 % der Körperlänge (endet über dem Schritt)
        top_z = maxz - 0.07
        avail = width_at(top_z - 0.08) * 0.80
        w = min(A4_W, avail, height * 0.45 * A4_W / A4_H)
        h = w * A4_H / A4_W
        return finish(top_z, w, h)
    ov_cfg = OVERRIDES.get(sku, {})
    if kind == "top":
        # Oberkante 9 cm (vorne) bzw. 7 cm (hinten) unter der höchsten Stelle (Schulter/Kragen)
        off = ov_cfg.get("top_off", {}).get(side, 0.09 if side == "front" else 0.07)
        top_z = maxz - off
        if ov_cfg.get("chest_left") and side == "front":
            # Linke Brust (aus Kundensicht rechts im Bild): halbe Körperbreite minus Reißverschluss
            half = width_at(top_z - 0.08) / 2
            w = min(A4_W, (half - 0.03) * 0.75)
            h = w * A4_H / A4_W
            return finish(top_z, w, h, center_x=cx + 0.03 + (half - 0.03) / 2)
        avail = width_at(top_z - A4_H / 2) * 0.80
    else:
        # Hose: auf EINEM Bein (Schritt und Mittelnaht frei). Oberkante 8 cm unter dem Bund.
        top_z = maxz - 0.08
        leg_slice = [v.x for v in verts if abs(v.z - (minz + (top_z - minz) * 0.35)) < 0.02 and v.x > cx]
        leg_w = (max(leg_slice) - min(leg_slice)) if len(leg_slice) > 3 else width / 2
        leg_cx = (max(leg_slice) + min(leg_slice)) / 2 if len(leg_slice) > 3 else cx + width / 4
        w = min(A4_W, leg_w * 0.75)
        h = min(w * A4_H / A4_W, (top_z - minz) * 0.75)
        w = h * A4_W / A4_H
        return finish(top_z, w, h, center_x=leg_cx)
    w = min(A4_W, avail)
    h = w * A4_H / A4_W
    h = min(h, (top_z - minz) * 0.85)
    w = h * A4_W / A4_H
    return finish(top_z, w, h)


def finish(top_z, w, h, center_x=None):
    left_world = (cx if center_x is None else center_x) - w / 2
    return {
        "top": round((frame_top - top_z) / frame_h * 100, 2),
        "left": round((left_world - frame_left) / frame_w * 100, 2),
        "width": round(w / frame_w * 100, 2),
        "height": round(h / frame_h * 100, 2),
        "widthMm": round(w * 1000, 1),
        "heightMm": round(h * 1000, 1),
    }


def placement_for(ov):
    """Verschiebebereich: nie über die Oberkante der Druckfläche (Kragen/Bund), seitlich ±4 %, nach unten +6 %."""
    left = max(0.0, ov["left"] - 4)
    return {"top": ov["top"], "left": round(left, 2),
            "width": round(min(100 - left, ov["width"] + 8), 2),
            "height": round(min(100 - ov["top"], ov["height"] + 6), 2)}


profile = {"sku": sku, "kind": kind, "photoWidth": W_PX, "photoHeight": H_PX,
           "frameHeightMm": round(frame_h * 1000, 1), "overlay": {}, "placement": {}}
for side, sign in (("front", -1), ("back", 1)):
    dist = (maxy - miny) * 3 + 2
    cam.location = Vector((cx, cy + sign * dist, (minz + maxz) / 2))
    cam.rotation_euler = (math.radians(90), 0, 0 if sign < 0 else math.radians(180))
    sun.rotation_euler = cam.rotation_euler
    scene.render.filepath = f"{out_dir}/render-{side}.png"
    bpy.ops.render.render(write_still=True)
    ov = place_print(side)
    profile["overlay"][side] = ov
    # Verschiebebereich: Druckfläche ± 6 % innerhalb des Bildes
    profile["placement"][side] = placement_for(ov)

print("PROFILE " + json.dumps(profile))

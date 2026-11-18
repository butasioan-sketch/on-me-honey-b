"""Original ON ME HONEY B preview geometry for rigid goods.

Sku-specific appearance follows public/products/<sku>/front.jpg. All dimensions
are provisional display dimensions in metres. Print tolerances and reverse
construction require the actual product.
"""
import math
import sys
from pathlib import Path

import bpy

SKUS = [49, *range(64, 75), *range(78, 102), 127, 128, 129]
NAMES = {
    49:"Polyesterschlüsselanhänger",64:"MDF-Untersetzer",65:"Korkuntersetzer",66:"Aluminiumuntersetzer",
    67:"Aluminium-Wandbild",68:"Fotoschild mit Aufsteller",69:"Fotopaneel mit Öse",70:"MDF-Schild mit Kordel",
    71:"Türschild mit Befestigung",72:"Namensschild mit Klammer",73:"Gefaltetes Tischschild",74:"Wanduhr",
    78:"Mauspad mit umgelegter Ecke",79:"Gaming-Mauspad mit gewelltem Rand",80:"Schreibtischunterlage",
    81:"Handyhülle mit Kameraöffnung",82:"Metallschlüsselanhänger",83:"MDF-Schlüsselanhänger",
    84:"Kühlschrankmagnet",85:"Flaschenöffner",86:"Aluminiumlesezeichen",87:"Fotopuzzle",
    88:"Drei runde Untersetzer",89:"Metallvisitenkarte",90:"Ausweisschild mit Schlitz",91:"Namensplakette im Sockel",
    92:"Notizbuch",93:"Gerahmte Fototafel",94:"Runder Weihnachtsanhänger",95:"Christbaumkugel",
    96:"Geschenkanhänger",97:"Hundemarke in Knochenform",98:"Haustierschild in Hausform",99:"Aufstellrahmen",
    100:"Herz-Schmuckanhänger",101:"Keramik-Fotokachel",127:"Kugelschreiber",128:"Werbestift",129:"Schreibgerät",
}


def material(name, rgb, roughness=0.45, metal=0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    shader = m.node_tree.nodes["Principled BSDF"]
    shader.inputs["Base Color"].default_value = (*rgb, 1)
    shader.inputs["Roughness"].default_value = roughness
    shader.inputs["Metallic"].default_value = metal
    return m


def rounded_rect(w, h, r, steps=6):
    vertices = []
    for sx, sy, angle in [(1,1,0),(-1,1,90),(-1,-1,180),(1,-1,270)]:
        for i in range(steps+1):
            a = math.radians(angle + i * 90 / steps)
            vertices.append((sx * (w / 2 - r) + r * math.cos(a),
                             sy * (h / 2 - r) + r * math.sin(a)))
    return vertices


def circle(r, n=64):
    return [(r*math.cos(i*math.tau/n),r*math.sin(i*math.tau/n)) for i in range(n)]


def prism(name, contour, depth, face, side=None, pos=(0,0,0), bevel=0.0):
    n = len(contour)
    verts = [(x,y,z) for z in (-depth/2, depth/2) for x,y in contour]
    faces = [tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]
    faces.extend((i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts,[],faces)
    mesh.update()
    obj = bpy.data.objects.new(name,mesh)
    bpy.context.collection.objects.link(obj)
    obj.location=pos
    mesh.materials.append(face)
    if side is not None:
        mesh.materials.append(side)
        for f in mesh.polygons:
            f.material_index=0 if f.index==1 else 1
    uv=mesh.uv_layers.new(name="Print UV")
    xmin,xmax=min(x for x,y in contour),max(x for x,y in contour)
    ymin,ymax=min(y for x,y in contour),max(y for x,y in contour)
    for loop in mesh.loops:
        x,y,z=mesh.vertices[loop.vertex_index].co
        uv.data[loop.index].uv=((x-xmin)/(xmax-xmin),(y-ymin)/(ymax-ymin))
    if bevel:
        modifier=obj.modifiers.new("Gerundete Materialkante","BEVEL")
        modifier.width=bevel
        modifier.segments=2
        normals=obj.modifiers.new("Flächennormalen","WEIGHTED_NORMAL")
        normals.keep_sharp=True
    return obj


def plate(name,w,h,depth,face,side=None,r=0.002,pos=(0,0,0)):
    return prism(name,rounded_rect(w,h,r),depth,face,side,pos,min(depth*0.18,r*0.35))


def line(name, points, radius, mat, loop=False):
    c=bpy.data.curves.new(name,"CURVE")
    c.dimensions="3D"
    c.bevel_depth=radius
    c.bevel_resolution=1
    s=c.splines.new("POLY")
    s.points.add(len(points)-1)
    for dst,xyz in zip(s.points,points):
        dst.co=(*xyz,1)
    s.use_cyclic_u=loop
    o=bpy.data.objects.new(name,c)
    bpy.context.collection.objects.link(o)
    c.materials.append(mat)
    return o


def ring(name,x,y,z,r,wire,mat,tilt=0):
    return line(name,[(x+u,y+v*math.cos(tilt),z+v*math.sin(tilt)) for u,v in circle(r,40)],wire,mat,True)


def apply(obj, modifier):
    bpy.context.view_layer.objects.active=obj
    bpy.ops.object.modifier_apply(modifier=modifier.name)


def cut(obj, contour, x,y,z=0,depth=0.06):
    cutter=prism("cut",contour,depth,obj.data.materials[0],pos=(x,y,z))
    # Evaluate the cut before edge bevels so hole edges get the same treatment.
    m=obj.modifiers.new("Öffnung","BOOLEAN")
    m.operation="DIFFERENCE"
    m.object=cutter
    while obj.modifiers.find(m.name)>0:
        bpy.context.view_layer.objects.active=obj
        bpy.ops.object.modifier_move_up(modifier=m.name)
    apply(obj,m)
    bpy.data.objects.remove(cutter,do_unlink=True)


def case_shape(obj,w,h,depth,face,side):
    recess=rounded_rect(w-0.010,h-0.010,0.007)
    cut(obj,recess,0,0,-depth/2,depth)
    cut(obj,rounded_rect(0.030,0.032,0.004),-0.018,h/2-0.025)
    # Raised camera lip and tiny side controls follow the rendered case.
    lip=plate("Kamerarahmen",0.035,0.037,0.002,side,r=0.006,pos=(-0.018,h/2-0.025,depth/2))
    cut(lip,rounded_rect(0.030,0.032,0.004),-0.018,h/2-0.025)
    for y in (0.023,0.039):
        plate("Seitentaste",0.002,0.011,0.004,face,r=0.0008,pos=(w/2,y,0))


def frame(w,h,depth,width,white,edge):
    back=plate("Träger",w,h,depth,white,edge,r=0.002)
    outer=plate("Erhöhter Rahmen",w,h,depth,white,edge,r=0.003,pos=(0,0,depth))
    cut(outer,rounded_rect(w-2*width,h-2*width,0.002),0,0,depth)
    plate("Druckeinlage",w-width*2.1,h-width*2.1,0.001,white,r=0.0004,pos=(0,0,depth*0.55))
    return back


def pen(sku,white,metal,dark):
    # Lathe silhouette. Tip, grip, barrel and push button have distinct radii.
    dims={127:(0.143,0.0050,0.027),128:(0.137,0.0058,0.031),129:(0.148,0.0050,0.022)}
    length,r,grip=dims[sku]
    stations=[(0,.0003),(.003,.0014),(.014,r*.78),(grip,r*.98),
              (length-.020,r),(length-.011,r*.88),(length-.006,r*.73),(length,r*.68)]
    n=32
    verts=[(rad*math.cos(i*math.tau/n),(y-length/2),rad*math.sin(i*math.tau/n)) for y,rad in stations for i in range(n)]
    faces=[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(len(stations)-1) for i in range(n)]
    faces.extend([tuple(range(n-1,-1,-1)),tuple(range(len(verts)-n,len(verts)))])
    mesh=bpy.data.meshes.new("Gedrehte Stiftkontur")
    mesh.from_pydata(verts,[],faces)
    mesh.update()
    obj=bpy.data.objects.new(NAMES[sku],mesh)
    bpy.context.collection.objects.link(obj)
    for m in (white,metal,dark):mesh.materials.append(m)
    uv=mesh.uv_layers.new()
    for f in mesh.polygons:
        y=sum(mesh.vertices[i].co.y for i in f.vertices)/len(f.vertices)+length/2
        f.use_smooth=True
        f.material_index=1 if y<0.012 or (sku==129 and y>length-.024) else (2 if sku==127 and y<grip else 0)
        for i in f.loop_indices:
            idx=mesh.loops[i].vertex_index
            uv.data[i].uv=(idx%n/n,stations[idx//n][0]/length)
    bpy.context.view_layer.objects.active=obj
    obj.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode="OBJECT")
    line("Clip",[(0,length/2-0.015,r*.55),(0,length/2-0.018,r*1.55),
                 (0,length/2-0.039,r*1.65),(0,length/2-0.052,r*1.0)],0.0013,metal)


def build(sku, output, source=None):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.scene.unit_settings.system="METRIC"
    white=material("Weiße Druckfläche",(0.94,0.94,0.94))
    metal=material("Silbernes Metall",(0.68,0.70,0.73),0.29,0.8)
    mdf=material("MDF-Kante",(0.38,0.24,0.14),0.75)
    cork=material("Korkkante",(0.46,0.30,0.16),0.88)
    dark=material("Dunkle Details",(0.035,0.035,0.04),0.57)
    cloth=material("Textil und Bänder",(0.87,0.87,0.87),0.84)
    cardboard=material("Papierkante",(0.79,0.78,0.76),0.7)
    name=NAMES[sku]

    if sku in {64,65,88,94,74}:
        r,depth,edge={64:(.047,.004,mdf),65:(.047,.005,cork),88:(.046,.003,white),
                      94:(.038,.003,white),74:(.113,.005,white)}[sku]
        offsets=[(0,0,0)] if sku!=88 else [(-.027,-.018,-.004),(0,.005,0),(.028,.010,.004)]
        for pos in offsets:
            obj=prism(name,circle(r),depth,white,edge,pos,depth*.17)
        if sku==94:
            cut(obj,circle(.0025,20),0,r-.008)
            ring("Textilschlaufe",0,r+.004,.002,.012,.0009,cloth,.65)
        if sku==74:
            for length,angle,width in [(r*.76,math.radians(52),.0038),(r*.50,math.radians(-50),.0054)]:
                line("Uhrzeiger",[(0,0,.005),(length*math.sin(angle),length*math.cos(angle),.005)],width/2,dark)
            prism("Nabe",circle(.008,28),.005,metal,pos=(0,0,.007),bevel=.0005)
            plate("Uhrwerk",.055,.055,.019,dark,r=.005,pos=(0,0,-.012))
    elif sku in {67,68,69,70,71,72,84,86,89,90,91,96,101,66}:
        w,h,depth,edge={
            66:(.090,.090,.002,metal),67:(.120,.170,.002,metal),68:(.110,.150,.008,white),
            69:(.135,.170,.004,white),70:(.160,.115,.004,mdf),71:(.170,.045,.004,metal),
            72:(.076,.034,.003,metal),84:(.058,.058,.004,white),86:(.032,.125,.0015,metal),
            89:(.086,.054,.0013,metal),90:(.055,.086,.0018,white),91:(.102,.052,.003,white),
            96:(.044,.065,.0027,cardboard),101:(.070,.070,.008,white)
        }[sku]
        radius={66:.008,70:.012,72:.006,89:.003,90:.006}.get(sku,.002)
        obj=plate(name,w,h,depth,white,edge,r=radius)
        if sku in {69,96}:
            cut(obj,circle(.0028,20),0,h/2-.010)
        if sku in {70,71}:
            y=h/2-.010 if sku==70 else 0
            for x in (-w/2+.014,w/2-.014):cut(obj,circle(.0028,20),x,y)
            if sku==70:
                line("Aufhängekordel",[(-w/2+.014,y,0),(0,h/2+.066,.004),(w/2-.014,y,0)],.0008,cloth)
        if sku in {66,68}:
            # Rückseitiger Aufsteller (Referenzfoto: Platte steht auf einer Stütze)
            sh=.083 if sku==68 else .060
            stand=plate("Rückseitiger Aufsteller",.024,sh,.004,edge if sku==68 else metal,r=.001,
                        pos=(0,-h/2+sh/2-.004,-.004-sh*.5*math.sin(math.radians(30))))
            stand.rotation_euler.x=math.radians(30)
        if sku==72:
            plate("Klammerbasis",.040,.010,.002,metal,r=.003,pos=(.010,.004,-.0025))
            # Federklammer: über die Oberkante gebogener Bügel (Referenz: Klammer oben rechts)
            line("Federklammer",[(.024,.004,-.0035),(.024,h/2+.004,-.0035),(.024,h/2+.008,-.0010),
                                 (.024,h/2+.004,.0015),(.024,h/2-.006,.0022)],.0016,metal)
        if sku==84:
            plate("Magnetrückseite",.049,.049,.002,dark,r=.002,pos=(0,0,-.0027))
        if sku==90:
            cut(obj,rounded_rect(.017,.004,.0017),0,h/2-.011)
        if sku==91:
            plate("Holzsockel",.085,.016,.040,mdf,r=.002,pos=(0,-h/2-.004,-.013))
        if sku==96:
            ring("Kordelschlaufe",0,h/2+.008,.003,.015,.0007,cloth,.6)
    elif sku in {49,82,83,85,97,98,100}:
        if sku==97:
            outline=[(-.032,-.016),(-.024,-.021),(-.017,-.015),(.017,-.015),(.024,-.021),(.032,-.016),
                     (.034,-.008),(.029,0),(.034,.008),(.032,.016),(.024,.021),(.017,.015),
                     (-.017,.015),(-.024,.021),(-.032,.016),(-.034,.008),(-.029,0),(-.034,-.008)]
            obj=prism(name,outline,.004,white,metal,bevel=.0008)
            cut(obj,circle(.0025,18),-.024,.009)
            ring("Schlüsselring",-.044,.016,.003,.014,.0015,metal,1.0)
        elif sku==98:
            outline=[(-.033,-.030),(.033,-.030),(.033,.006),(.044,.006),(0,.039),(-.044,.006),(-.033,.006)]
            obj=prism(name,outline,.010,white,mdf,bevel=.0006)
            for x in (-.016,.016):cut(obj,circle(.002,18),x,.011)
        elif sku==100:
            outline=[]
            for i in range(80):
                a=i*math.tau/80
                outline.append((.0017*16*math.sin(a)**3,.0017*(13*math.cos(a)-5*math.cos(2*a)-2*math.cos(3*a)-math.cos(4*a))))
            obj=prism(name,list(reversed(outline)),.004,white,metal,bevel=.0007)
            ring("Anhängeröse",0,.023,0,.006,.0011,metal,1.1)
        else:
            if sku==49:
                w,h,d=.024,.090,.0013
                plate("Band vorne",w,h,d,white,cloth,r=.0015,pos=(0,0,.0016))
                plate("Band hinten",w,h-.004,d,cloth,cloth,r=.0015,pos=(0,-.002,-.0016))
                fold=[]
                for i in range(13):
                    a=math.pi*i/12
                    fold.append((0,h/2+.0016*math.sin(a),.0016*math.cos(a)))
                for x in (-w/2+.002,-w/4,0,w/4,w/2-.002):
                    line("Schlaufenbogen",[(x,yy,zz) for _,yy,zz in fold],.00075,cloth)
                plate("Klemmteil",w+.003,.013,.0065,metal,metal,r=.002,pos=(0,-h/2+.004,0))
                ring("Schlüsselring",0,h/2+.016,0,.016,.0014,metal,0.72)
                obj=None
            w,h,d,edge={49:(.024,.095,.003,cloth),82:(.033,.065,.004,metal),
                        83:(.039,.055,.005,mdf),85:(.031,.082,.004,metal)}[sku]
            obj=None if sku==49 else plate(name,w,h,d,white,edge,r=.005)
            if sku==49:
                pass
            elif sku==85:
                cut(obj,rounded_rect(.020,.025,.005),0,-.022)
                cut(obj,circle(.0025,20),0,.032)
                plate("Einleger",.022,.031,.001,white,r=.002,pos=(0,.013,d/2+.0002))
            else:
                cut(obj,circle(.003,20),0,h/2-.006)
                ring("Schlüsselring",0,h/2+.012,.001,.016,.0014,metal,0.72)
    elif sku in {78,79,80}:
        w,h,d={78:(.220,.180,.003),79:(.360,.270,.004),80:(.650,.330,.004)}[sku]
        obj=plate(name,w,h,d,white,dark,r=.011)
        if sku!=80:
            # Physically separate partial curl along one corner of the product photo.
            points=[(w/2-.004,h/2-.061,.001),(w/2-.007,h/2-.039,.003),
                    (w/2-.016,h/2-.015,.007),(w/2-.039,h/2-.004,.011)]
            line("Aufgerollte Randkante",points,.0013,dark)
    elif sku==81:
        obj=plate(name,.079,.159,.009,white,cloth,r=.011)
        case_shape(obj,.079,.159,.009,white,cloth)
    elif sku in {93,99}:
        frame(.150 if sku==93 else .110,.177 if sku==93 else .145,.009,.011,white,white)
        if sku==99:
            stand=plate("Aufstellstütze",.025,.082,.005,white,r=.002,pos=(0,-.021,-.029))
            stand.rotation_euler.x=.58
    elif sku==73:
        obj=prism("Gefaltetes Tischschild", [(-.050,-.084),(.050,-.084),(.050,.084),(-.050,.084)],.002,white)
        back=plate("Rückwand",.100,.172,.0018,white,r=.001,pos=(0,-.001,-.025))
        back.rotation_euler.x=-.30
        base=plate("Standfalz",.100,.048,.0018,white,r=.001,pos=(0,-.082,-.023))
        base.rotation_euler.x=math.pi/2
    elif sku==87:
        w,h=.205,.285
        plate(name,w,h,.0028,white,cardboard,r=.001)
        for i in range(1,9):
            x=w*(i/9-.5)
            pts=[(x+.0025*math.sin(10*math.pi*t/56),h*(t/56-.5),.00155) for t in range(57)]
            line("Puzzle-Schnittlinie senkrecht",pts,.00022,cardboard)
        for i in range(1,13):
            y=h*(i/13-.5)
            pts=[(w*(t/45-.5),y+.0024*math.sin(8*math.pi*t/45),.00158) for t in range(46)]
            line("Puzzle-Schnittlinie quer",pts,.00022,cardboard)
    elif sku==92:
        pages=material("Papierschnitt cremeweiß",(0.90,0.87,0.80),0.8)
        for k in range(6):   # Seitenlagen mit feinen Fugen = sichtbarer Buchblock
            plate("Seitenlage",.114,.164,.0016,pages,pages,r=.0015,pos=(.0015,0,-.0045+k*.0018))
        for depth in (-.0066,.0066):
            plate("Notizbuchumschlag",.120,.170,.0016,white,r=.003,pos=(0,0,depth))
        plate("Buchrücken",.005,.170,.0148,white,r=.001,pos=(-.0585,0,0))
        plate("Verschlussgummi",.007,.172,.0156,dark,dark,r=.001,pos=(.046,0,0))
    elif sku==95:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=40,ring_count=24,radius=.037)
        obj=bpy.context.object; obj.name=name; obj.data.materials.append(white)
        for f in obj.data.polygons:f.use_smooth=True
        cap=prism("Aufhängung",circle(.008,24),.010,metal,pos=(0,.038,0),bevel=.001)
        cap.rotation_euler.x=math.pi/2
        ring("Öse",0,.047,0,.005,.001,metal)
    elif sku in {127,128,129}:
        pen(sku,white,metal,dark)
    else:
        raise ValueError(sku)

    parts=list(bpy.context.scene.objects)
    assert parts and all(part.type in {"MESH","CURVE"} for part in parts)
    root=bpy.data.objects.new(f"SKU {sku:03} · {name}",None)
    bpy.context.collection.objects.link(root)
    for p in parts:p.parent=root
    root.rotation_euler.x=math.pi/2
    output.parent.mkdir(parents=True,exist_ok=True)
    if source:
        bpy.ops.wm.save_as_mainfile(filepath=str(Path(source).resolve()))
    bpy.ops.export_scene.gltf(filepath=str(output),export_format="GLB",export_apply=True,
                              export_draco_mesh_compression_enable=False)


if __name__=="__main__":
    args=sys.argv[sys.argv.index("--")+1:]
    targets=SKUS if args[0]=="all" else [int(args[0])]
    output=Path(args[1]).resolve()
    for sku in targets:
        target=output/f"{sku:03}-v1.glb" if args[0]=="all" else output
        build(sku,target,args[2] if len(args)>2 else None)

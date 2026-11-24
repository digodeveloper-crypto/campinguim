# Campinguim 3D: reabre o GLB num Blender limpo e lista o que chegou (malhas, materiais, ossos, alvos, clipes, medidas).
# Uso: blender -b --factory-startup -P conferir.py -- ../campinguim.glb
import sys, os
sys.dont_write_bytecode = True
import bpy
from mathutils import Vector

glb = sys.argv[sys.argv.index('--') + 1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.render.fps = 30          # o importador converte tempo em quadro pela taxa da cena
bpy.ops.import_scene.gltf(filepath=os.path.abspath(glb))
sc = bpy.context.scene
print('CONF ---- reaberto:', os.path.basename(glb))
arm = next(o for o in sc.objects if o.type == 'ARMATURE')
print('CONF esqueleto', arm.name, 'ossos', len(arm.data.bones))
for b in arm.data.bones:
    print('CONF   osso %-20s pai %-12s cabeça (m) %s' % (b.name, b.parent.name if b.parent else '-', tuple(round(v, 4) for v in b.head_local)))
tri = 0
# (o importador cria uma esfera só para desenhar os ossos; ela não está no GLB e fica fora da conta)
MALHAS = [o for o in sc.objects if o.type == 'MESH' and o.name.startswith('campinguim.')]
for o in sorted(MALHAS, key=lambda o: o.name):
    me = o.data
    t = sum(len(p.vertices) - 2 for p in me.polygons)
    tri += t
    ks = [k.name for k in me.shape_keys.key_blocks][1:] if me.shape_keys else []
    print('CONF malha %-24s vért %5d tri %5d materiais %s alvos %s' % (o.name, len(me.vertices), t, [m.name for m in me.materials], ks))
print('CONF triângulos', tri)
for m in bpy.data.materials:
    print('CONF material', m.name)
for o in sc.objects:
    if o.type == 'EMPTY':
        print('CONF âncora %-28s pai %s / osso %s' % (o.name, o.parent.name if o.parent else '-', o.parent_bone))
for a in sorted(bpy.data.actions, key=lambda a: a.name):
    print('CONF clipe %-34s quadros %s' % (a.name, tuple(round(v, 2) for v in a.frame_range)))
# medidas no repouso
bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get()
pts = []
for o in MALHAS:
    if True:
        ev = o.evaluated_get(dg)
        pts += [o.matrix_world @ v.co for v in ev.data.vertices]
mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
print('CONF caixa (m, Blender Z para cima) min %s max %s' % (tuple(round(v, 4) for v in mn), tuple(round(v, 4) for v in mx)))
print('CONF altura %.4f m; chão (Z mínimo) %.5f; centro dos pés' % (mx.z - mn.z, mn.z))
pes = sc.objects['campinguim.pes'].evaluated_get(dg).data.vertices
pz = [sc.objects['campinguim.pes'].matrix_world @ v.co for v in pes]
chao = [p for p in pz if p.z < 0.001]
cx = sum(p.x for p in chao) / len(chao); cy = sum(p.y for p in chao) / len(chao)
print('CONF meio das solas no chão (x, y) = (%.4f, %.4f) m' % (cx, cy))
pe_ = sc.objects['campinguim.pes'].evaluated_get(dg).data.vertices
esq = [sc.objects['campinguim.pes'].matrix_world @ v.co for v in pe_ if (sc.objects['campinguim.pes'].matrix_world @ v.co).x > 0]
dir_ = [sc.objects['campinguim.pes'].matrix_world @ v.co for v in pe_ if (sc.objects['campinguim.pes'].matrix_world @ v.co).x < 0]
ce = sum(esq, Vector()) / len(esq); cd = sum(dir_, Vector()) / len(dir_)
m = (ce + cd) / 2
print('CONF meio entre os centros dos dois pés (x, y) = (%.4f, %.4f) m  -> é a origem' % (m.x, m.y))
bico = sc.objects['campinguim.bico'].evaluated_get(dg).data.vertices
ponta = min((sc.objects['campinguim.bico'].matrix_world @ v.co for v in bico), key=lambda p: p.y)
print('CONF ponta do bico (m) %s -> de frente para -Y no Blender = +Z no glTF' % (tuple(round(v, 4) for v in ponta),))
print('CONF escala dos objetos', sorted(set(tuple(round(v, 6) for v in o.scale) for o in MALHAS + [arm])))

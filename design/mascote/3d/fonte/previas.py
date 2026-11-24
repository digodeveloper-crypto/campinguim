# Campinguim 3D: renderiza as prévias (giro, expressões, quadros dos clipes e vistas para comparar com o vetor).
# Uso: blender -b ../campinguim.blend -P previas.py -- <pasta de saída> [tudo|rapido]
# Luz feita aqui em código (céu uniforme + sol de cima); nenhum HDRI nem arquivo de terceiros.
import sys, os, math
sys.dont_write_bytecode = True
import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
SAIDA = argv[0] if argv else os.path.join(os.path.dirname(bpy.data.filepath), 'previas', '_render')
MODO = argv[1] if len(argv) > 1 else 'tudo'
os.makedirs(SAIDA, exist_ok=True)

ALTURA_M, CHAO, TOPO = 0.40, 480.0, 47.0
S = ALTURA_M / (CHAO - TOPO)
EIXO_L = 218.0
EXPRESSOES = ['neutro', 'alegre', 'preocupado', 'alerta', 'frio', 'calor', 'surpreso']
sc = bpy.context.scene
arm = bpy.data.objects['campinguim']
malhas = [o for o in sc.objects if o.type == 'MESH']

# ---- luz e mundo
mundo = bpy.data.worlds.new('mundo-previa'); sc.world = mundo
mundo.use_nodes = True if mundo.node_tree is None else True
bg = mundo.node_tree.nodes['Background']
sol_d = bpy.data.lights.new('sol', 'SUN'); sol = bpy.data.objects.new('sol', sol_d); sc.collection.objects.link(sol)
sol_d.angle = math.radians(20)
sol.rotation_euler = (math.radians(35), 0, math.radians(-25))   # de cima, um pouco da frente e da esquerda da imagem
cam_d = bpy.data.cameras.new('cam'); cam = bpy.data.objects.new('cam', cam_d); sc.collection.objects.link(cam)
sc.camera = cam
cam_d.type = 'ORTHO'
sc.render.film_transparent = True
sc.view_settings.view_transform = 'Standard'
sc.view_settings.look = 'None'
sc.render.image_settings.file_format = 'PNG'
sc.render.image_settings.color_mode = 'RGBA'


def luz(modo):
    if modo == 'chapado':        # cor do material sem sombreamento: só para medir forma e cor contra o vetor
        sc.render.engine = 'BLENDER_WORKBENCH'
        sc.display.shading.light = 'FLAT'
        sc.display.shading.color_type = 'MATERIAL'
        sc.display.shading.show_shadows = False
        sc.display.shading.show_cavity = False
        sc.display.render_aa = '16'
    else:
        sc.render.engine = 'BLENDER_EEVEE'
        sc.eevee.taa_render_samples = 24
        bg.inputs['Color'].default_value = (1, 1, 1, 1)
        bg.inputs['Strength'].default_value = 0.8
        sol_d.energy = 0.62
        sol_d.use_shadow = True


def vista(nome, zoom=1.0, alvo=None):
    """Câmera ortográfica enquadrada como a prancha 512 do vetor (mesmo chão, mesmo centro)."""
    cz = (CHAO - 256.0) * S
    cam_d.ortho_scale = 512.0 * S * zoom
    d = 3.0
    az = {'frente': 0.0, 'tres-quartos': 45.0, 'lado': 90.0, 'costas': 180.0}[nome]
    if alvo is None:
        alvo = {'frente': Vector((0, 0, cz)), 'lado': Vector((0, (256.0 - EIXO_L) * S, cz)),
                'tres-quartos': Vector((0, (252.0 - EIXO_L) * S, cz)), 'costas': Vector((0, 0, cz))}[nome]
    a = math.radians(az)
    pos = alvo + Vector((math.sin(a) * d, -math.cos(a) * d, 0))
    cam.location = pos
    cam.rotation_euler = (math.radians(90), 0, a)


OLHOS = bpy.data.objects['campinguim.olhos']
NORMAIS_REPOUSO = [tuple(c.vector) for c in OLHOS.data.corner_normals]   # malha original = repouso (sem alvo)
congelado = []


def expressao(e):
    for o in malhas:
        k = o.data.shape_keys
        if not k:
            continue
        for kb in k.key_blocks:
            if kb.name != 'Basis':
                kb.value = 1.0 if kb.name == e else 0.0
    # Os olhos são mostrados como o GLB funciona no three.js: o alvo move a posição e a normal fica a do repouso
    # (pupilas para a frente). O Blender giraria a normal guardada junto com a superfície. Só em repouso (sem clipe).
    for o in congelado:
        bpy.data.objects.remove(o)
    congelado.clear()
    OLHOS.hide_render = False
    if e != 'neutro':
        bpy.context.view_layer.update()
        me = bpy.data.meshes.new_from_object(OLHOS.evaluated_get(bpy.context.evaluated_depsgraph_get()))
        me.normals_split_custom_set(NORMAIS_REPOUSO)
        ob = bpy.data.objects.new('olhos-repouso', me); sc.collection.objects.link(ob)
        ob.matrix_world = OLHOS.matrix_world
        congelado.append(ob); OLHOS.hide_render = True


def clipe(nome, quadro):
    if nome is None:
        arm.animation_data.action = None
        for pb in arm.pose.bones:
            pb.location = (0, 0, 0); pb.rotation_euler = (0, 0, 0); pb.scale = (1, 1, 1)
    else:
        arm.animation_data.action = bpy.data.actions[nome]
        try:
            if arm.animation_data.action_slot is None:
                arm.animation_data.action_slot = bpy.data.actions[nome].slots[0]
        except AttributeError:
            pass
    sc.frame_set(quadro)


def render(arquivo, res, v='frente', e='neutro', c=None, q=0, modo='luz', zoom=1.0):
    luz(modo); vista(v, zoom); clipe(c, q); expressao(e)
    sc.render.resolution_x = sc.render.resolution_y = res
    sc.render.filepath = os.path.join(SAIDA, arquivo)
    bpy.ops.render.render(write_still=True)
    print('RENDER', arquivo)


CLIPES = [('parado-respirando', 60), ('andar', 30), ('acenar', 60), ('apontar', 48),
          ('olhar-para-cima', 48), ('tremer-de-frio', 30), ('comemorar', 45)]

if MODO in ('rapido', 'tudo'):
    for v in ('frente', 'lado', 'tres-quartos'):
        render(f'cmp-{v}-luz.png', 1024, v)
        render(f'cmp-{v}-chapado.png', 1024, v, modo='chapado')
    render('giro-costas.png', 1024, 'costas')
if MODO in ('expr', 'tudo'):
    for e in EXPRESSOES:
        render(f'expr-{e}.png', 1024, 'frente', e)
        render(f'expr-{e}-chapado.png', 1024, 'frente', e, modo='chapado')
        render(f'expr34-{e}.png', 512, 'tres-quartos', e)
if MODO in ('clipes', 'tudo'):
    for nome, N in CLIPES:
        qs = sorted(set([round(i * (N - 1) / 7) for i in range(8)]))
        v = 'frente' if nome in ('acenar', 'comemorar', 'tremer-de-frio') else 'tres-quartos'
        if nome in ('olhar-para-cima',):
            v = 'lado'
        for q in qs:
            render(f'clip-{nome}-{q:03d}.png', 384, v, c=nome, q=q, zoom=1.25)
        # primeiro e último quadro de cada clipe, em tamanho maior, para comparar
        render(f'borda-{nome}-ini.png', 512, v, c=nome, q=0, zoom=1.25)
        render(f'borda-{nome}-fim.png', 512, v, c=nome, q=N - 1, zoom=1.25)
print('FIM PREVIAS')

# Campinguim 3D: confere o GLB lendo o arquivo direto (Python puro, sem nada instalado).
# Uso: python -I -B conferir_glb.py ../campinguim.glb
import sys, json, struct, math, os

caminho = sys.argv[1]
dados = open(caminho, 'rb').read()
assert dados[:4] == b'glTF', 'não é GLB'
n_json = struct.unpack_from('<I', dados, 12)[0]
g = json.loads(dados[20:20 + n_json])
bin_ = dados[20 + n_json + 8:]
TAM = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}
FMT = {5126: 'f', 5123: 'H', 5125: 'I', 5121: 'B', 5120: 'b', 5122: 'h'}


def acc(i):
    a = g['accessors'][i]; bv = g['bufferViews'][a['bufferView']]
    n = TAM[a['type']]; f = FMT[a['componentType']]; sz = struct.calcsize(f)
    passo = bv.get('byteStride', n * sz)
    base = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    return [struct.unpack_from('<' + f * n, bin_, base + k * passo) for k in range(a['count'])]


def hexa(c):
    def s(v):
        v = v * 12.92 if v <= 0.0031308 else 1.055 * v ** (1 / 2.4) - 0.055
        return round(max(0, min(1, v)) * 255)
    return '#%02X%02X%02X' % tuple(s(v) for v in c[:3])


print('ARQUIVO', os.path.basename(caminho), len(dados), 'bytes')
print('EXTENSOES usadas', g.get('extensionsUsed', []), 'exigidas', g.get('extensionsRequired', []))
print('IMAGENS', len(g.get('images', [])), 'TEXTURAS', len(g.get('textures', [])))
tri = 0
for m in g['meshes']:
    t = sum(g['accessors'][p['indices']]['count'] // 3 for p in m['primitives'])
    nv = sum(g['accessors'][p['attributes']['POSITION']]['count'] for p in m['primitives'])
    tri += t
    attrs = sorted(m['primitives'][0]['attributes'])
    nomes = m.get('extras', {}).get('targetNames')
    ntg = len(m['primitives'][0].get('targets', []))
    mats = [g['materials'][p['material']]['name'] for p in m['primitives']]
    print('MALHA %-24s vert %5d tri %5d mat %s alvos %d %s attrs %s' % (m['name'], nv, t, mats, ntg, nomes, attrs))
print('TRIANGULOS', tri)
for mt in g['materials']:
    pbr = mt.get('pbrMetallicRoughness', {})
    print('MATERIAL %-26s cor %s rug %.2f metal %.2f textura %s' % (
        mt['name'], hexa(pbr.get('baseColorFactor', [1, 1, 1, 1])), pbr.get('roughnessFactor', 1), pbr.get('metallicFactor', 1),
        'baseColorTexture' in pbr))
cena = g['scenes'][g.get('scene', 0)]
for i in cena['nodes']:
    n = g['nodes'][i]
    print('RAIZ %-24s T %s R %s S %s' % (n.get('name'), n.get('translation'), n.get('rotation'), n.get('scale')))
for n in g['nodes']:
    if n.get('name', '').startswith('campinguim.ancora'):
        pai = next(p['name'] for p in g['nodes'] if g['nodes'].index(n) in p.get('children', []))
        print('ANCORA', n['name'], 'filha de', pai)
for s in g.get('skins', []):
    print('ESQUELETO ossos', len(s['joints']), [g['nodes'][j]['name'] for j in s['joints']])
inf_max = 0
for m in g['meshes']:
    for p in m['primitives']:
        assert 'JOINTS_1' not in p['attributes']
        for w in acc(p['attributes']['WEIGHTS_0']):
            inf_max = max(inf_max, sum(1 for x in w if x > 1e-6))
print('INFLUENCIAS por vertice, maximo', inf_max)
# posição: altura, origem
ys = []; zs = []; xs = []
for m in g['meshes']:
    for p in m['primitives']:
        a = g['accessors'][p['attributes']['POSITION']]
        xs += [a['min'][0], a['max'][0]]; ys += [a['min'][1], a['max'][1]]; zs += [a['min'][2], a['max'][2]]
print('CAIXA (m) x %.4f..%.4f  y %.4f..%.4f  z %.4f..%.4f' % (min(xs), max(xs), min(ys), max(ys), min(zs), max(zs)))
bic = next(m for m in g['meshes'] if m['name'] == 'campinguim.bico')
pb = acc(bic['primitives'][0]['attributes']['POSITION'])
ponta = max(pb, key=lambda v: v[2])
print('PONTA DO BICO', tuple(round(v, 4) for v in ponta), '-> frente para +Z' if ponta[2] > 0.1 else '-> ??')

# animações
nos = g['nodes']
repouso = {}
for i, n in enumerate(nos):
    repouso[(i, 'translation')] = tuple(n.get('translation', (0, 0, 0)))
    repouso[(i, 'rotation')] = tuple(n.get('rotation', (0, 0, 0, 1)))
    repouso[(i, 'scale')] = tuple(n.get('scale', (1, 1, 1)))


def dist(a, b, caminho_):
    if caminho_ == 'rotation':   # quatérnios: q e -q são a mesma rotação; ~ ângulo em radianos para giros pequenos
        d1 = math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))
        d2 = math.sqrt(sum((x + y) ** 2 for x, y in zip(a, b)))
        return 2 * min(d1, d2)
    return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))


resp0 = {}
anims = {a['name']: a for a in g['animations']}
for c in anims['parado-respirando']['channels']:
    s = anims['parado-respirando']['samplers'][c['sampler']]
    resp0[(c['target']['node'], c['target']['path'])] = acc(s['output'])[0]
CICLOS = {'parado-respirando', 'andar', 'tremer-de-frio'}
for a in g['animations']:
    tempos = None; pior_emenda = 0.0; passo_medio = []; pior_rep = 0.0; pior_ini = 0.0
    for c in a['channels']:
        s = a['samplers'][c['sampler']]
        t = [v[0] for v in acc(s['input'])]
        v = acc(s['output'])
        tempos = t
        alvo = (c['target']['node'], c['target']['path'])
        caminho_ = c['target']['path']
        passos = [dist(v[k], v[k + 1], caminho_) for k in range(len(v) - 1)]
        if a['name'] in CICLOS:
            emenda = dist(v[-1], v[0], caminho_)
            m = max(passos) if passos else 0
            pior_emenda = max(pior_emenda, emenda - m)        # a emenda não pode ser maior que o maior passo normal
            passo_medio.append(max(passos))
            pior_rep = max(pior_rep, 0 if emenda > 1e-9 or m < 1e-6 else 1)   # 1 = repetiu a pose na emenda
        else:
            pior_ini = max(pior_ini, dist(v[0], resp0[alvo], caminho_), dist(v[-1], resp0[alvo], caminho_))
    n = len(tempos)
    dur = tempos[-1] - tempos[0]
    print('CLIPE %-18s quadros %3d  tempo %.4f..%.4f s  passo %.4f s  interp %s' % (
        a['name'], n, tempos[0], tempos[-1], (tempos[1] - tempos[0]), a['samplers'][0].get('interpolation', 'LINEAR')))
    if a['name'] in CICLOS:
        print('   ciclo: emenda (último->primeiro) excede o maior passo normal em %.6f (<= 0 = sem salto); pose repetida na emenda: %s'
              % (pior_emenda, 'sim' if pior_rep else 'não'))
    else:
        print('   pontual: maior diferença do 1º e do último quadro para o quadro 0 de parado-respirando = %.8f' % pior_ini)

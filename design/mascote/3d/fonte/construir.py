# Campinguim 3D (MSC-10, MSC-11, MSC-12): constrói o modelo do "Filhote de gorro" a partir do vetor aprovado.
# Uso: blender -b --factory-startup -P construir.py  (gera ../campinguim.blend e ../campinguim.glb)
# Tudo é calculado: nenhuma malha, textura, esqueleto ou animação de terceiros, nada aleatório.
import sys, os, math
sys.dont_write_bytecode = True
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import bpy, bmesh
from mathutils import Vector, Matrix
import svgpoly as sp

PASTA_3D = os.path.dirname(AQUI)
_args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
# Variante da máscara: C (meio-termo) é a oficial, escolhida pelo responsável; A e B ficam só para o registro da escolha.
# (fator angular da face e da barriga, fator angular de olhos/bico/boca, quanto a nadadeira vai para o lado 0..1)
VARIANTES = {'A': (1.0, 1.0, 0.0), 'B': (2.2, 1.45, 1.0), 'C': (1.3, 1.1, 0.4)}
VARIANTE = _args[0] if _args else 'C'   # escolhida pelo responsável em 24/11/2026
F_MASCARA, F_OLHOS, E_NADADEIRA = VARIANTES[VARIANTE]
SAIDA = _args[1] if len(_args) > 1 else PASTA_3D
VETOR = os.path.normpath(os.path.join(PASTA_3D, '..', 'final', 'vetor', 'claro'))

# ---------------------------------------------------------------- escala e eixos
ALTURA_M = 0.40                      # aprovada pelo responsável em 24/11/2026 (altura com o gorro, em pé)
CHAO, TOPO = 480.0, 47.0             # chão e topo do gorro no vetor (prancha 512)
S = ALTURA_M / (CHAO - TOPO)         # metros por unidade do desenho
EIXO_F = 256.0                       # x do eixo vertical na vista de frente
EIXO_L = 218.0                       # x do meio dos pés na vista de lado (origem)
EXPRESSOES = ['neutro', 'alegre', 'preocupado', 'alerta', 'frio', 'calor', 'surpreso']
FPS = 30


def P(xf, y, xl):
    """Ponto do desenho -> metros no Blender. xf: x na vista de frente; y: altura no desenho; xl: x na vista de lado.
    Blender: Z para cima, personagem de frente para -Y (vira +Y para cima e frente +Z no GLB)."""
    return Vector(((xf - EIXO_F) * S, (xl - EIXO_L) * S, (CHAO - y) * S))


def y_de_z(z):
    return CHAO - z / S


def faces_estaveis(faces):
    """Ordem canônica das faces (cada uma começa no menor índice, sem mudar o sentido; lista ordenada).
    As esferas do bmesh no Blender 5.3 entregam as faces em ordem diferente a cada execução."""
    out = []
    for f_ in faces:
        k = f_.index(min(f_))
        out.append(tuple(f_[k:]) + tuple(f_[:k]))
    return sorted(out)


def smoothstep(a, b, x):
    t = min(1.0, max(0.0, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)


def lerp(a, b, t):
    return a + (b - a) * t


# ---------------------------------------------------------------- leitura do vetor
def ler(nome):
    txt = open(os.path.join(VETOR, nome), encoding='utf-8').read()
    return [(t, a, sp.shape_polys(t, a)) for t, a in sp.elements(txt)]


class Perfil:
    """Larguras de uma silhueta por altura (passo de 1 unidade), cru e suavizado."""

    def __init__(self, poly, y0, y1, sigma=14.0, borda=(100.0, 420.0)):
        self.y0 = y0
        self.ys = [y0 + i for i in range(int(y1 - y0) + 1)]
        esq, dir_ = [], []
        ult = None
        for y in self.ys:
            sp_ = sp.xspan(poly, y + 0.01) or ult
            ult = sp_
            esq.append(sp_[0]); dir_.append(sp_[1])
        self.esq, self.dir = esq, dir_
        self.esq_s = self._suaviza(esq, sigma, borda)
        self.dir_s = self._suaviza(dir_, sigma, borda)

    def _suaviza(self, v, sigma, borda):
        n = len(v); r = int(3 * sigma)
        k = [math.exp(-0.5 * (i / sigma) ** 2) for i in range(-r, r + 1)]
        out = []
        for i in range(n):
            acc = w = 0.0
            for j in range(-r, r + 1):
                q = min(n - 1, max(0, i + j))
                acc += v[q] * k[j + r]; w += k[j + r]
            out.append(acc / w)
        # perto dos polos o contorno é quase horizontal: usa o cru (sem ondas) para não deformar a calota
        res = []
        for i, y in enumerate(self.ys):
            t = min(smoothstep(borda[0] - 25, borda[0], y), 1 - smoothstep(borda[1], borda[1] + 25, y))
            res.append(lerp(v[i], out[i], t))
        return res

    def at(self, arr, y):
        f = min(len(arr) - 1.0001, max(0.0, y - self.y0))
        i = int(f); t = f - i
        return arr[i] * (1 - t) + arr[i + 1] * t


frente = ler('vista-frente.svg')
lado = ler('vista-lado.svg')
e_frio = ler('expressoes/expressao-frio.svg')
e_calor = ler('expressoes/expressao-calor.svg')

PF = Perfil(frente[0][2][0], 57.5, 462.5)          # silhueta de frente (caminho escuro externo)
PL = Perfil(lado[0][2][0], 57.5, 462.5)            # silhueta de lado
PF_frio = Perfil(e_frio[0][2][0], 53.5, 466.5)     # penugem eriçada
PF_calor = Perfil(e_calor[0][2][0], 59.0, 460.0)   # penugem murcha


def A_suave(y, lado_):   # meia-largura suave (lado_ +1 = esquerda do personagem = direita da imagem)
    return (PF.at(PF.dir_s, y) - EIXO_F) if lado_ > 0 else (EIXO_F - PF.at(PF.esq_s, y))


def A_cru(perf, y, lado_):
    return (perf.at(perf.dir, y) - EIXO_F) if lado_ > 0 else (EIXO_F - perf.at(perf.esq, y))


def c_lado(y):
    return 0.5 * (PL.at(PL.esq_s, y) + PL.at(PL.dir_s, y))


def bF(y):
    return c_lado(y) - PL.at(PL.esq_s, y)


def bB_suave(y):
    return PL.at(PL.dir_s, y) - c_lado(y)


def bB_cru(y):
    return PL.at(PL.dir, y) - c_lado(y)


def rms_onda(perf, ys):
    a = [((perf.at(perf.dir, y) - perf.at(perf.dir_s, y)) ** 2 + (perf.at(perf.esq, y) - perf.at(perf.esq_s, y)) ** 2) for y in ys]
    return math.sqrt(sum(a) / len(a))


_ys_meio = list(range(120, 420))
K_ONDA = {'base': 1.0,
          'frio': rms_onda(PF_frio, _ys_meio) / rms_onda(PF, _ys_meio),
          'calor': rms_onda(PF_calor, _ys_meio) / rms_onda(PF, _ys_meio)}
PERF_VAR = {'base': PF, 'frio': PF_frio, 'calor': PF_calor}


# ---------------------------------------------------------------- corpo
N_ANEIS, N_SEG = 96, 48
Y_TOPO_CORPO, Y_BASE_CORPO = 57.3, 462.6
Y_ANEIS = [58.0 + (462.0 - 58.0) * i / (N_ANEIS - 1) for i in range(N_ANEIS)]
Y_SOMBRA = 432.0   # abaixo daqui, a "sombra de um tom" do fundo do ovo (ardósia-escura)


def corpo_ponto(th, y, var):
    th = th % (2 * math.pi)
    s_, c_ = math.sin(th), math.cos(th)
    lado_ = 1 if s_ >= 0 else -1
    ang = min(th, 2 * math.pi - th)
    m = smoothstep(math.radians(55), math.radians(85), ang)   # ondas só nas laterais e nas costas
    a_s = A_suave(y, lado_)
    if var == 'liso':
        A = a_s
    else:
        A = a_s + m * (A_cru(PERF_VAR[var], y, lado_) - a_s)
    if c_ >= 0:
        B = bF(y)
    else:
        B = bB_suave(y) if var == 'liso' else bB_suave(y) + K_ONDA[var] * (bB_cru(y) - bB_suave(y))
    return P(EIXO_F + A * s_, y, c_lado(y) - B * c_)


def corpo_coords(var):
    v = [P(EIXO_F, Y_TOPO_CORPO, c_lado(Y_TOPO_CORPO + 0.7))]
    for y in Y_ANEIS:
        for j in range(N_SEG):
            v.append(corpo_ponto(2 * math.pi * j / N_SEG, y, var))
    v.append(P(EIXO_F, Y_BASE_CORPO, c_lado(Y_BASE_CORPO - 0.7)))
    return v


def pele(xf, y, h, f=1.0, var='base'):
    """Ponto da pele do corpo que, visto de frente, cai em (xf, y) quando f = 1; com f > 1 o desenho
    'envolve' a cabeça (o ângulo em volta do eixo é multiplicado por f). h: distância para fora, em unidades."""
    dx = xf - EIXO_F
    A = A_suave(y, 1 if dx >= 0 else -1)
    th = math.asin(max(-1.0, min(1.0, dx / A))) * f
    lim = math.radians(88.0)
    th = max(-lim, min(lim, th))
    p = corpo_ponto(th, y, var)
    e = 0.004
    t_ = corpo_ponto(th + e, y, var) - corpo_ponto(th - e, y, var)
    v_ = corpo_ponto(th, y + 0.5, var) - corpo_ponto(th, y - 0.5, var)
    n = t_.cross(v_)
    eixo = P(EIXO_F, y, c_lado(y))
    if n.dot(p - eixo) < 0:
        n = -n
    n.normalize()
    return p + n * (h * S)


def corpo_faces():
    f, mats = [], []
    idx = lambda i, j: 1 + i * N_SEG + (j % N_SEG)
    for j in range(N_SEG):
        f.append((0, idx(0, j + 1), idx(0, j))); mats.append(0)
    for i in range(N_ANEIS - 1):
        ym = 0.5 * (Y_ANEIS[i] + Y_ANEIS[i + 1])
        for j in range(N_SEG):
            f.append((idx(i, j), idx(i, j + 1), idx(i + 1, j + 1), idx(i + 1, j)))
            mats.append(1 if ym > Y_SOMBRA else 0)
    last = 1 + N_ANEIS * N_SEG
    for j in range(N_SEG):
        f.append((idx(N_ANEIS - 1, j), idx(N_ANEIS - 1, j + 1), last)); mats.append(1)
    return f, mats


# ---------------------------------------------------------------- manchas lisas (face e barriga)
def raio_poligono(poly, cx, cy, ang):
    dx, dy = math.cos(ang), math.sin(ang)
    best = 0.0
    n = len(poly)
    for k in range(n):
        (x0, y0), (x1, y1) = poly[k], poly[(k + 1) % n]
        ex, ey = x1 - x0, y1 - y0
        den = dx * ey - dy * ex
        if abs(den) < 1e-12:
            continue
        t = ((x0 - cx) * ey - (y0 - cy) * ex) / den
        u = ((x0 - cx) * dy - (y0 - cy) * dx) / den
        if t > 0 and -1e-9 <= u <= 1 + 1e-9:
            best = max(best, t)
    return best


def mancha(poly, cx, cy, aneis=12, seg=64, alto=1.6, borda=0.6, var='base'):
    """Malha em leque sobre a frente do corpo, com a forma exata do desenho vista de frente.
    O miolo fica 'alto' acima da pele e a borda afunda, como um chanfro."""
    raios = [raio_poligono(poly, cx, cy, 2 * math.pi * j / seg) for j in range(seg)]
    v = [pele(cx, cy, alto, F_MASCARA, var)]
    for k in range(1, aneis + 1):
        t = k / aneis
        off = alto if t <= 0.8 else lerp(alto, borda, smoothstep(0.8, 1.0, t))
        for j in range(seg):
            a = 2 * math.pi * j / seg
            x, y = cx + raios[j] * t * math.cos(a), cy + raios[j] * t * math.sin(a)
            v.append(pele(x, y, off, F_MASCARA, var))
    f = []
    for j in range(seg):
        f.append((0, 1 + (j + 1) % seg, 1 + j))
    for k in range(aneis - 1):
        for j in range(seg):
            a0 = 1 + k * seg; a1 = 1 + (k + 1) * seg
            f.append((a0 + j, a0 + (j + 1) % seg, a1 + (j + 1) % seg, a1 + j))
    return v, f


# ---------------------------------------------------------------- olhos, bico, boca (por expressão)
GIRO_ALERTA = (-10.0, 256.0, 458.0)   # a arte "alerta" está girada 10° em torno de (256, 458); desfeito aqui

OLHOS = {
    'neutro': dict(tr=['M196.1 185.9 A32 32 0 0 1 245.9 185.9', 'M266.1 185.9 A32 32 0 0 1 315.9 185.9']),
    'alegre': dict(tr=['M197.4 131.5 A30 30 0 0 1 244.6 131.5', 'M267.4 131.5 A30 30 0 0 1 314.6 131.5'],
                   pu=[(221, 172, 16), (291, 172, 16)], desl=(0, 30)),
    'preocupado': dict(tr=['M198 184 A40 40 0 0 1 240 157', 'M272 157 A40 40 0 0 1 314 184'],
                       pu=[(224, 198, 15), (288, 198, 15)]),
    'alerta': dict(tr=['M250.3 160.4 A30 30 0 0 1 294.2 168.2', 'M319.2 172.6 A30 30 0 0 1 363.1 180.3'],
                   pu=[(258.1, 198.4, 15), (327, 210.6, 15)], giro=GIRO_ALERTA),
    'frio': dict(tr=['M200.7 208.3 A50 50 0 0 1 241.3 208.3', 'M270.7 208.3 A50 50 0 0 1 311.3 208.3']),
    'calor': dict(tr=['M196 200 L244 192', 'M268 192 L316 200'], pu=[(221, 205, 15), (291, 205, 15)], meia=True),
    'surpreso': dict(tr=['M198 168 A28 28 0 0 1 244 168', 'M268 168 A28 28 0 0 1 314 168'],
                     pu=[(221, 198, 19), (291, 198, 19)]),
}
BICO = {
    'neutro': dict(sup=[(240, 216), (272, 216), (256, 239)]),
    'preocupado': dict(sup=[(243, 222), (269, 222), (256, 240)]),
    'surpreso': dict(sup=[(238, 220), (274, 220), (256, 234)], inf=[(247, 246), (265, 246), (256, 256)],
                     boca=(256, 238, 13, 15)),
}
for _e in EXPRESSOES:
    BICO.setdefault(_e, BICO['neutro'])


def transf(e, x, y):
    d = OLHOS[e]
    if 'giro' in d:
        a, cx, cy = d['giro']
        a = math.radians(a); x0, y0 = x - cx, y - cy
        x, y = cx + x0 * math.cos(a) - y0 * math.sin(a), cy + x0 * math.sin(a) + y0 * math.cos(a)
    dx, dy = d.get('desl', (0, 0))
    return x + dx, y + dy


def reamostra(pts, n):
    L = [0.0]
    for a, b in zip(pts, pts[1:]):
        L.append(L[-1] + math.dist(a, b))
    out = []
    for i in range(n):
        s_ = L[-1] * i / (n - 1)
        k = 1
        while k < len(L) - 1 and L[k] < s_:
            k += 1
        t = (s_ - L[k - 1]) / max(1e-9, L[k] - L[k - 1])
        out.append((lerp(pts[k - 1][0], pts[k][0], t), lerp(pts[k - 1][1], pts[k][1], t)))
    return out


N_TRACO, N_TAMPA, K_TRACO = 28, 8, 11
MEIO_TRACO = 7.0          # metade da espessura do traço do desenho (14)
ALTO_FACE = 1.6           # quanto a face fica acima da pele


def traco(pts2d, alto=2.4, base=0.6):
    """Traço do desenho (olho em arco, sobrancelha, pálpebra) como relevo apoiado na face, com as duas pontas
    em calota redonda inteira (stroke-linecap round do vetor): o contorno de cada ponta é um semicírculo de
    raio 7 e a altura cai em domo até a borda, sem quina."""
    c = reamostra(pts2d, N_TRACO)

    def tang(i):
        a, b = c[max(0, i - 1)], c[min(len(c) - 1, i + 1)]
        L = math.dist(a, b) or 1.0
        return (b[0] - a[0]) / L, (b[1] - a[1]) / L

    t0 = tang(0); t1 = tang(len(c) - 1)
    linhas = []  # (centro x, centro y, tangente, avanço d além da ponta: 0 no corpo do traço)
    for k in range(N_TAMPA, 0, -1):
        d = MEIO_TRACO * math.sin(0.5 * math.pi * k / N_TAMPA) * 0.997
        linhas.append((c[0][0] - t0[0] * d, c[0][1] - t0[1] * d, t0, d))
    for i in range(len(c)):
        linhas.append((c[i][0], c[i][1], tang(i), 0.0))
    for k in range(1, N_TAMPA + 1):
        d = MEIO_TRACO * math.sin(0.5 * math.pi * k / N_TAMPA) * 0.997
        linhas.append((c[-1][0] + t1[0] * d, c[-1][1] + t1[1] * d, t1, d))
    v = []
    for (x, y, (tx, ty), d) in linhas:
        nx, ny = -ty, tx
        w = math.sqrt(max(0.0, MEIO_TRACO ** 2 - d * d))       # meia-largura: semicírculo na ponta
        for q in range(K_TRACO):
            u = -1 + 2 * q / (K_TRACO - 1)
            r2 = (d * d + (u * w) ** 2) / MEIO_TRACO ** 2      # distância ao centro da calota, de 0 a 1
            borda = abs(u) >= 1 or d >= MEIO_TRACO * 0.99
            h = ALTO_FACE - 0.8 if borda else ALTO_FACE + base + alto * math.sqrt(max(0.0, 1 - r2))
            px, py = x + nx * w * u, y + ny * w * u
            v.append(pele(px, py, h, F_OLHOS))
    return v


def traco_faces(off):
    f = []
    n = N_TRACO + 2 * N_TAMPA
    for i in range(n - 1):
        for q in range(K_TRACO - 1):
            a = off + i * K_TRACO + q; b = off + (i + 1) * K_TRACO + q
            f.append((a, a + 1, b + 1, b))
    return f


N_PU_ANEL, N_PU_SEG = 5, 40


def pupila(cx, cy, r, meia=False, escondida=False):
    """Pupila redonda (disco levemente abaulado). 'meia': só a metade de baixo (olho caído do calor).
    'escondida': encolhida e enterrada atrás da face (não aparece)."""
    v = []
    def ponto(u, w, k):
        if meia:
            w = max(w, 0.0)
        px, py = cx + r * u, cy + r * w
        h = ALTO_FACE + 0.6 + 2.0 * (1 - k * k)
        if k >= 1.0:
            h = ALTO_FACE - 0.8
        if escondida:
            px, py = cx + 0.02 * u, cy + 0.02 * w
            h = -4.0
        return pele(px, py, h, F_OLHOS)
    v.append(ponto(0, 0, 0))
    for k in range(1, N_PU_ANEL + 1):
        t = k / N_PU_ANEL
        for j in range(N_PU_SEG):
            a = 2 * math.pi * j / N_PU_SEG
            v.append(ponto(t * math.cos(a), t * math.sin(a), t))
    return v


def pupila_faces(off):
    f = []
    for j in range(N_PU_SEG):
        f.append((off, off + 1 + (j + 1) % N_PU_SEG, off + 1 + j))
    for k in range(N_PU_ANEL - 1):
        a0 = off + 1 + k * N_PU_SEG; a1 = a0 + N_PU_SEG
        for j in range(N_PU_SEG):
            f.append((a0 + j, a0 + (j + 1) % N_PU_SEG, a1 + (j + 1) % N_PU_SEG, a1 + j))
    return f


def pupilas_para_frente(ob):
    """Normais das duas pupilas todas para a frente (-Y no Blender, +Z no glTF), iguais nos dois olhos e em toda
    expressão (o GLB não leva normal nos alvos, então vale a do repouso). O disco continua no lugar, colado na face;
    só a luz passa a lê-lo como a cor chapada do desenho, no mesmo tom nos dois olhos, venha a luz de onde vier.
    Traços (arcos, sobrancelhas, pálpebras) mantêm as normais do relevo."""
    me = ob.data
    ini = 2 * (N_TRACO + 2 * N_TAMPA) * K_TRACO          # as pupilas vêm depois dos dois traços
    ns = [tuple(v.normal) for v in me.vertices]
    for i in range(ini, len(ns)):
        ns[i] = (0.0, -1.0, 0.0)
    me.normals_split_custom_set_from_vertices(ns)
    me.update()


def olhos_coords(e):
    d = OLHOS[e]
    v = []
    for tr in d['tr']:
        pts = [transf(e, x, y) for x, y in sp.path_to_polys(tr, nseg=8)[0]]
        v += traco(pts)
    pus = d.get('pu')
    for i in range(2):
        if pus:
            cx, cy = transf(e, pus[i][0], pus[i][1])
            v += pupila(cx, cy, pus[i][2], meia=d.get('meia', False))
        else:
            v += pupila((221, 291)[i], 196, 15, escondida=True)
    return v


def olhos_faces():
    n_tr = (N_TRACO + 2 * N_TAMPA) * K_TRACO
    n_pu = 1 + N_PU_ANEL * N_PU_SEG
    f = traco_faces(0) + traco_faces(n_tr)
    f += pupila_faces(2 * n_tr) + pupila_faces(2 * n_tr + n_pu)
    return f


def triangulo_arredondado(tri, r=3.0, n=8):
    cx = sum(p[0] for p in tri) / 3; cy = sum(p[1] for p in tri) / 3
    out = []
    for i in range(3):
        p = tri[i]; a = tri[i - 1]; b = tri[(i + 1) % 3]
        def nrm(u, w):
            L = math.dist(u, w); return ((w[1] - u[1]) / L, -(w[0] - u[0]) / L)
        n1 = nrm(a, p); n2 = nrm(p, b)
        # orienta as normais para fora do centro
        if (p[0] + n1[0] - cx) ** 2 + (p[1] + n1[1] - cy) ** 2 < (p[0] - cx) ** 2 + (p[1] - cy) ** 2:
            n1 = (-n1[0], -n1[1]); n2 = (-n2[0], -n2[1])
        a1 = math.atan2(n1[1], n1[0]); a2 = math.atan2(n2[1], n2[0])
        d = (a2 - a1 + math.pi) % (2 * math.pi) - math.pi
        for k in range(n):
            ang = a1 + d * k / (n - 1)
            out.append((p[0] + r * math.cos(ang), p[1] + r * math.sin(ang)))
    return out, (cx, cy)


T_BICO = [0.0, 0.12, 0.3, 0.5, 0.68, 0.84, 0.95]
N_BICO = 24


def piramide(tri, ponta_dy, prot, escondida_em=None):
    """Bico: pirâmide de cantos arredondados que sai da face. Vista de frente = o triângulo do desenho."""
    base, (cx, cy) = triangulo_arredondado(tri, n=N_BICO // 3)
    tx, ty = cx, cy + ponta_dy
    v = []
    for t in T_BICO + [1.0]:
        esc = 1 - 0.93 * t ** 1.15
        for (x, y) in (base if t < 1.0 else base[:1]):
            px = lerp(cx, tx, t) + (x - cx) * esc
            py = lerp(cy, ty, t) + (y - cy) * esc
            h = ALTO_FACE + 0.6 + lerp(-2.0, prot, t)     # a base afunda na face; o 1º anel já fica 1 acima dela
            if escondida_em is not None:
                ex, ey = escondida_em
                px, py = ex + (px - cx) * 0.02, ey + (py - cy) * 0.02
                h = -5.0
            if t == 1.0:
                px, py = (tx, ty) if escondida_em is None else escondida_em
            v.append(pele(px, py, h, F_OLHOS))
    return v


def piramide_faces(off):
    f = []
    n = N_BICO
    for r in range(len(T_BICO) - 1):
        a0 = off + r * n; a1 = a0 + n
        for j in range(n):
            f.append((a0 + j, a0 + (j + 1) % n, a1 + (j + 1) % n, a1 + j))
    a0 = off + (len(T_BICO) - 1) * n; tip = a0 + n
    for j in range(n):
        f.append((a0 + j, a0 + (j + 1) % n, tip))
    return f


def bico_coords(e):
    d = BICO[e]
    sup = d['sup']
    cx = sum(p[0] for p in sup) / 3; cy = sum(p[1] for p in sup) / 3
    v = piramide(sup, 5.3, 20.0)
    if 'inf' in d:
        v += piramide(d['inf'], 0.0, 9.0)
    else:
        v += piramide([(247, 246), (265, 246), (256, 256)], 3.0, 12.0, escondida_em=(cx, cy))
    return v


def bico_faces():
    n = len(T_BICO) * N_BICO + 1
    return piramide_faces(0) + piramide_faces(n)


def boca_coords(e):
    d = BICO[e]
    cx, cy, rx, ry = d.get('boca', (256, 236, 13, 15))
    esc = 1.0 if 'boca' in d else 0.02
    v = []
    aneis, seg = 3, 40
    def pt(u, w, k):
        px, py = cx + rx * u * esc, cy + ry * w * esc
        h = (ALTO_FACE + 0.7 if k < 1 else ALTO_FACE - 0.6) if esc == 1.0 else -5.0
        return pele(px, py, h, F_OLHOS)
    v.append(pt(0, 0, 0))
    for k in range(1, aneis + 1):
        t = k / aneis
        for j in range(seg):
            a = 2 * math.pi * j / seg
            v.append(pt(t * math.cos(a), t * math.sin(a), t))
    return v


def boca_faces():
    aneis, seg = 3, 40
    f = [(0, 1 + (j + 1) % seg, 1 + j) for j in range(seg)]
    for k in range(aneis - 1):
        a0 = 1 + k * seg; a1 = a0 + seg
        for j in range(seg):
            f.append((a0 + j, a0 + (j + 1) % seg, a1 + (j + 1) % seg, a1 + j))
    return f


# ---------------------------------------------------------------- gotas do calor
GOTAS = [  # (caminho do desenho, centro da esfera de baixo)
    ('M84 142 C84 142 68 164 68 176 A16 16 0 0 0 100 176 C100 164 84 142 84 142 Z', (84, 176)),
    ('M52 206 C52 206 42 220 42 228 A10 10 0 0 0 62 228 C62 220 52 206 52 206 Z', (52, 228)),
    ('M436 150 C436 150 424 166 424 175 A12 12 0 0 0 448 175 C448 166 436 150 436 150 Z', (436, 175)),
]
N_GOTA_ANEL, N_GOTA_SEG = 12, 16


def gotas_coords(visivel):
    v = []
    for caminho, (cx, cy) in GOTAS:
        poly = sp.path_to_polys(caminho, nseg=10)[0]
        ys = [p[1] for p in poly]; ytop, ybot = min(ys), max(ys)
        xl = c_lado(cy)
        esc = 1.0 if visivel else 0.01
        def pt(x, y, z_):
            return P(cx + (x - cx) * esc, cy + (y - cy) * esc, xl + (z_) * esc)
        v.append(pt(cx, ytop, 0))
        for k in range(1, N_GOTA_ANEL + 1):
            t = k / (N_GOTA_ANEL + 1)
            y = lerp(ytop, ybot, t)
            spn = sp.xspan(poly, y)
            r = (spn[1] - spn[0]) / 2 if spn else 0.1
            xm = (spn[0] + spn[1]) / 2 if spn else cx
            for j in range(N_GOTA_SEG):
                a = 2 * math.pi * j / N_GOTA_SEG
                v.append(pt(xm + r * math.cos(a), y, r * math.sin(a)))
        v.append(pt(cx, ybot, 0))
    return v


def gotas_faces():
    f = []
    n = 2 + N_GOTA_ANEL * N_GOTA_SEG
    for g in range(3):
        o = g * n
        for j in range(N_GOTA_SEG):
            f.append((o, o + 1 + j, o + 1 + (j + 1) % N_GOTA_SEG))
        for k in range(N_GOTA_ANEL - 1):
            a0 = o + 1 + k * N_GOTA_SEG; a1 = a0 + N_GOTA_SEG
            for j in range(N_GOTA_SEG):
                f.append((a0 + j, a1 + j, a1 + (j + 1) % N_GOTA_SEG, a0 + (j + 1) % N_GOTA_SEG))
        last = o + n - 1; a0 = o + 1 + (N_GOTA_ANEL - 1) * N_GOTA_SEG
        for j in range(N_GOTA_SEG):
            f.append((a0 + j, last, a0 + (j + 1) % N_GOTA_SEG))
    return f


# ---------------------------------------------------------------- gorro (copa, aba e pompom)
COPA_F = 'M120 120 C116 70 176 44 252 47 C302 49 334 64 348 94 C356 110 380 96 394 120 Z'
COPA_L = 'M126 120 C122 70 176 44 252 47 C302 49 334 64 348 94 C356 110 370 96 384 120 Z'
EIXO_GORRO = 256.0        # eixo do gorro: x 256 na frente e x 256 no lado
ABA_Y, ABA_R, ABA_TUBO = 130.0, 130.0, 20.0
POMPOM_C = (256 + 106, 83.0, 256 + 102)  # (x frente, y, x lado)
POMPOM_R = 35.0
COPA_ANEIS, COPA_SEG = 26, 48
ABA_SEG, ABA_TUBO_SEG = 48, 14
COPA_Y0, COPA_Y1 = 47.6, 126.0
EXP_DOBRA = 2.8           # o quarto de trás-esquerda é mais cheio: a ponta da copa cai para lá

def corpo_raios_no_gorro(y, folga):
    """Raios do corpo (liso) numa altura, medidos a partir do eixo do gorro: +X, -X, frente, trás."""
    return (A_suave(y, 1) + folga, A_suave(y, -1) + folga,
            EIXO_GORRO - (c_lado(y) - bF(y)) + folga, (c_lado(y) + bB_suave(y)) - EIXO_GORRO + folga)


_cf = sp.path_to_polys(COPA_F, nseg=12)[0]
_cl = sp.path_to_polys(COPA_L, nseg=12)[0]


def _ext(poly, y):
    spn = sp.xspan(poly, min(119.5, max(47.2, y)))
    return spn


def copa_raios(y):
    f = _ext(_cf, y); l = _ext(_cl, y)
    r = (f[1] - EIXO_GORRO, EIXO_GORRO - f[0], EIXO_GORRO - l[0], l[1] - EIXO_GORRO)  # +X, -X, frente, trás
    if y < Y_TOPO_CORPO:
        return r
    c = corpo_raios_no_gorro(y, 7.0)       # a copa nunca fica por dentro da cabeça
    return tuple(max(a, b) for a, b in zip(r, c))


def supelipse(th, ax_p, ax_n, b_f, b_t):
    s_, c_ = math.sin(th), math.cos(th)
    A = ax_p if s_ >= 0 else ax_n
    B = b_f if c_ >= 0 else b_t
    # o canto de trás-esquerda é mais cheio (a ponta da copa cai para lá); o expoente cresce e volta a 2 de
    # forma suave entre 90° e 180°, para não fazer quina no meridiano de trás nem no do lado
    t = th % (2 * math.pi)
    w = math.sin(2 * (t - math.pi / 2)) ** 2 if math.pi / 2 <= t <= math.pi else 0.0
    n = 2.0 + (EXP_DOBRA - 2.0) * w
    e = 2.0 / n
    return A * math.copysign(abs(s_) ** e, s_), -B * math.copysign(abs(c_) ** e, c_)   # dx (frente), dz (lado, frente negativa)


def gorro_pontos_base():
    """Pontos do gorro no espaço do desenho: lista de (xf, y, xl) e as faces."""
    pts, faces = [], []
    # copa
    pts.append((EIXO_GORRO - 4, 47.0, EIXO_GORRO - 4))
    for i in range(COPA_ANEIS):
        y = COPA_Y0 + (COPA_Y1 - COPA_Y0) * (i / (COPA_ANEIS - 1)) ** 0.8
        r = copa_raios(y)
        for j in range(COPA_SEG):
            dx, dz = supelipse(2 * math.pi * j / COPA_SEG, *r)
            pts.append((EIXO_GORRO + dx, y, EIXO_GORRO + dz))
    pts.append((EIXO_GORRO, COPA_Y1 + 0.5, EIXO_GORRO))
    idx = lambda i, j: 1 + i * COPA_SEG + j % COPA_SEG
    for j in range(COPA_SEG):
        faces.append((0, idx(0, j + 1), idx(0, j)))
    for i in range(COPA_ANEIS - 1):
        for j in range(COPA_SEG):
            faces.append((idx(i, j), idx(i, j + 1), idx(i + 1, j + 1), idx(i + 1, j)))
    last = len(pts) - 1
    for j in range(COPA_SEG):
        faces.append((idx(COPA_ANEIS - 1, j), idx(COPA_ANEIS - 1, j + 1), last))
    n_copa = len(pts)
    # aba: tubo redondo em volta da cabeça
    o = len(pts)
    for j in range(ABA_SEG):
        th = 2 * math.pi * j / ABA_SEG
        for q in range(ABA_TUBO_SEG):
            ph = 2 * math.pi * q / ABA_TUBO_SEG
            rr = ABA_R + ABA_TUBO * math.cos(ph)
            pts.append((EIXO_GORRO + rr * math.sin(th), ABA_Y - ABA_TUBO * math.sin(ph), EIXO_GORRO - rr * math.cos(th)))
    for j in range(ABA_SEG):
        for q in range(ABA_TUBO_SEG):
            a = o + j * ABA_TUBO_SEG + q; b = o + ((j + 1) % ABA_SEG) * ABA_TUBO_SEG + q
            a2 = o + j * ABA_TUBO_SEG + (q + 1) % ABA_TUBO_SEG; b2 = o + ((j + 1) % ABA_SEG) * ABA_TUBO_SEG + (q + 1) % ABA_TUBO_SEG
            faces.append((a, b, b2, a2))
    n_aba = len(pts)
    # pompom: esfera com tufos regulares (direções de Fibonacci, sem nada aleatório)
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=3, radius=1.0)
    bm.verts.index_update(); bm.faces.index_update()     # índices estáveis
    bm.verts.ensure_lookup_table(); bm.faces.ensure_lookup_table()
    dirs = []
    N_TUFO = 18
    for k in range(N_TUFO):
        zz = 1 - 2 * (k + 0.5) / N_TUFO; rr = math.sqrt(1 - zz * zz); a = k * math.pi * (3 - math.sqrt(5))
        dirs.append(Vector((rr * math.cos(a), rr * math.sin(a), zz)))
    o = len(pts)
    cx, cy, cz = POMPOM_C
    for vv in bm.verts:
        n = vv.co.normalized()
        bump = max(max(0.0, n.dot(d)) ** 22 for d in dirs)
        r = POMPOM_R * (0.86 + 0.2 * bump)
        pts.append((cx + n.x * r, cy - n.z * r, cz + n.y * r))
    faces += faces_estaveis([tuple(o + vv.index for vv in ff.verts) for ff in bm.faces])
    bm.free()
    return pts, faces, (n_copa, n_aba, len(pts))


GORRO_PTS, GORRO_FACES, GORRO_FAIXAS = gorro_pontos_base()


def fora_da_cabeca(pts, n_copa, var, folga=6.0):
    """Empurra para fora os pontos da copa que ficariam dentro da cabeça (gorro esticado ou inclinado),
    medindo a pele da mesma expressão (com a penugem eriçada ou murcha)."""
    out = []
    for i, (x, y, z) in enumerate(pts):
        if i < n_copa and y >= Y_TOPO_CORPO - 1.0:
            eixo = P(EIXO_F, y, c_lado(y))
            q = P(x, y, z) - eixo
            th = math.atan2(q.x, -q.y)
            pele_ = corpo_ponto(th, y, var) - eixo
            rp = math.hypot(pele_.x, pele_.y) / S + folga
            rq = math.hypot(q.x, q.y) / S
            if 1e-6 < rq < rp:
                k = rp / rq
                x, z = EIXO_F + (x - EIXO_F) * k, c_lado(y) + (z - c_lado(y)) * k
        out.append((x, y, z))
    return out


def pompom_encostado(pts, encaixe=0.55):
    """Se o pompom se afastar da copa (gorro esticado), puxa-o até afundar 'encaixe' do raio nela."""
    n_copa, n_aba, n_tot = GORRO_FAIXAS
    pom = [Vector(p) for p in pts[n_aba:]]
    c = sum(pom, Vector()) / len(pom)
    copa = [Vector(p) for p in pts[:n_copa]]
    perto = min(copa, key=lambda q: (q - c).length)
    d = (perto - c).length
    alvo = POMPOM_R * encaixe
    if d <= alvo:
        return pts
    desl = (perto - c).normalized() * (d - alvo)
    return pts[:n_aba] + [tuple(Vector(p) + desl) for p in pts[n_aba:]]


def gorro_var(e):
    n_copa = GORRO_FAIXAS[0]
    pts = fora_da_cabeca(_gorro_var(e), n_copa, e if e in ('frio', 'calor') else 'base')
    if e == 'frio':
        tubo = ABA_TUBO * 0.85
        pts = dentro_da_aba(pts, n_copa, ABA_Y + 44, tubo, raio_aba_frio(ABA_Y + 44, tubo))
    return pompom_encostado(pts)


def raio_aba_frio(ny, tubo, folga=-2.0):
    """Raio do meio do tubo da aba, por ângulo em volta do eixo do gorro, medido na pele do 'frio' (penugem
    eriçada) em toda a altura que a aba cobre: a aba abraça a cabeça inteira, sem vão."""
    eixo = Vector((EIXO_GORRO, EIXO_GORRO))
    out = []
    for j in range(ABA_SEG):
        th = 2 * math.pi * j / ABA_SEG
        r = 0.0
        for k in range(7):
            y = ny - tubo + 2 * tubo * k / 6
            for dth in (-0.04, 0.0, 0.04):
                p = corpo_ponto(th + dth, y, 'frio')
                xf, xl = p.x / S + EIXO_F, p.y / S + EIXO_L
                r = max(r, (Vector((xf, xl)) - eixo).length)
        out.append(r + folga)
    return out


def raio_no_angulo(raios, th):
    n = len(raios); f = (th % (2 * math.pi)) / (2 * math.pi) * n
    i = int(f) % n; t = f - int(f)
    return raios[i] * (1 - t) + raios[(i + 1) % n] * t


def dentro_da_aba(pts, n_copa, ny, tubo, R_aba, folga=3.0):
    """A copa não pode sair por fora da aba na faixa que a aba cobre."""
    out = []
    for i, (x, y, z) in enumerate(pts):
        if i < n_copa and abs(y - ny) < tubo:
            dx, dz = x - EIXO_GORRO, z - EIXO_GORRO
            th = math.atan2(dx, -dz)
            rmax = raio_no_angulo(R_aba, th) + math.sqrt(tubo * tubo - (y - ny) ** 2) - folga
            r = math.hypot(dx, dz)
            if r > rmax > 0:
                x, z = EIXO_GORRO + dx * rmax / r, EIXO_GORRO + dz * rmax / r
        out.append((x, y, z))
    return out


def _gorro_var(e):
    n_copa, n_aba, n_tot = GORRO_FAIXAS
    out = []
    if e == 'frio':
        # gorro puxado até os olhos: aba desce 44 (como no desenho), copa estica com o topo no lugar,
        # e a aba abre o necessário para continuar abraçando a cabeça.
        ny = ABA_Y + 44
        rc = corpo_raios_no_gorro(ny, -4.0)
        tubo = ABA_TUBO * 0.85
        R_aba = raio_aba_frio(ny, tubo)
        for i, (x, y, z) in enumerate(GORRO_PTS):
            dx, dz = x - EIXO_GORRO, z - EIXO_GORRO
            if i < n_copa:
                t = (y - 47.0) / (120.0 - 47.0)
                y2 = 47.0 + (y - 47.0) * (164.0 - 47.0) / (120.0 - 47.0)
                fx = lerp(1.0, (rc[0] if dx > 0 else rc[1]) / ABA_R, max(0.0, t) ** 1.3)
                fz = lerp(1.0, (rc[3] if dz > 0 else rc[2]) / ABA_R, max(0.0, t) ** 1.3)
                out.append((EIXO_GORRO + dx * fx, y2, EIXO_GORRO + dz * fz))
            elif i < n_aba:
                k = i - n_copa; j, q = divmod(k, ABA_TUBO_SEG)
                th = 2 * math.pi * j / ABA_SEG; ph = 2 * math.pi * q / ABA_TUBO_SEG
                rr = R_aba[j]
                out.append((EIXO_GORRO + (rr + tubo * math.cos(ph)) * math.sin(th), ny - tubo * math.sin(ph),
                            EIXO_GORRO - (rr + tubo * math.cos(ph)) * math.cos(th)))
            else:
                t = (POMPOM_C[1] - 47.0) / (120.0 - 47.0)
                fx = lerp(1.0, rc[0] / ABA_R, t ** 1.3); fz = lerp(1.0, rc[3] / ABA_R, t ** 1.3)
                pcx = EIXO_GORRO + (POMPOM_C[0] - EIXO_GORRO) * fx; pcz = EIXO_GORRO + (POMPOM_C[2] - EIXO_GORRO) * fz
                out.append((x + pcx - POMPOM_C[0], y + 14.0, z + pcz - POMPOM_C[2]))
        return out
    if e == 'calor':
        # gorro empurrado para trás: inclina 9° (frente sobe, topo vai para trás) e sobe 12
        a = math.radians(9.0)
        for (x, y, z) in GORRO_PTS:
            yy, zz = y - ABA_Y, z - EIXO_GORRO          # yy: para baixo; zz: para trás
            y2 = yy * math.cos(a) + zz * math.sin(a)
            z2 = zz * math.cos(a) - yy * math.sin(a)
            out.append((x, ABA_Y + y2 - 12.0, EIXO_GORRO + z2))
        return out
    if e == 'surpreso':
        return [(x, y - 22.0, z) for (x, y, z) in GORRO_PTS]   # o gorro pula 22, como no desenho
    return list(GORRO_PTS)


# ---------------------------------------------------------------- nadadeiras e pés
NAD_TH = math.radians(60.0 + 25.0 * E_NADADEIRA)   # posição em volta do corpo (0 = frente, 90 = lado)
NAD_Y0, NAD_Y1 = 274.0, 392.0
NAD_R, NAD_ESP = 32.0, 0.8      # meia-largura e achatamento do toco
NAD_SAI = 0.6                   # quanto do toco fica para fora da pele
NAD_ANEIS, NAD_SEG = 16, 20


def nadadeira(lado_):
    v, f = [], []
    pontos_eixo = []
    for k in range(NAD_ANEIS + 2):
        t = k / (NAD_ANEIS + 1)
        y = lerp(NAD_Y0, NAD_Y1, t)
        th = NAD_TH + math.radians(10.0) * t
        A = A_suave(y, lado_); B = bF(y)
        sx = A * math.sin(th) * lado_; sz = c_lado(y) - B * math.cos(th)
        n = Vector((math.sin(th) / A * lado_, 0.0, -math.cos(th) / B)); n.normalize()     # (frente x, -, lado x)
        u = Vector((A * math.cos(th) * lado_, 0.0, B * math.sin(th))); u.normalize()
        r = NAD_R * math.sin(math.pi * t) ** 0.75 * (0.7 + 0.3 * t)
        rt = r * NAD_ESP
        cx, cz = sx + EIXO_F + n.x * rt * NAD_SAI, sz + n.z * rt * NAD_SAI
        pontos_eixo.append((cx, y, cz))
        if k == 0 or k == NAD_ANEIS + 1:
            v.append(P(cx, y, cz))
            continue
        for j in range(NAD_SEG):
            a = 2 * math.pi * j / NAD_SEG
            px = cx + u.x * r * math.cos(a) + n.x * rt * math.sin(a)
            pz = cz + u.z * r * math.cos(a) + n.z * rt * math.sin(a)
            v.append(P(px, y, pz))
    top = 0; bot = len(v) - 1
    idx = lambda i, j: 1 + i * NAD_SEG + j % NAD_SEG
    for j in range(NAD_SEG):
        f.append((top, idx(0, j), idx(0, j + 1)))
    for i in range(NAD_ANEIS - 1):
        for j in range(NAD_SEG):
            f.append((idx(i, j), idx(i + 1, j), idx(i + 1, j + 1), idx(i, j + 1)))
    for j in range(NAD_SEG):
        f.append((idx(NAD_ANEIS - 1, j), bot, idx(NAD_ANEIS - 1, j + 1)))
    return v, f, pontos_eixo


PE_COMP, PE_LARG, PE_ALT = 56.0, 25.0, 21.0
PE_ABRE, PE_INCL = math.radians(55.0), math.radians(14.0)
PE_X = 80.0


def pe(lado_):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=20, v_segments=14, radius=1.0)
    bm.verts.index_update(); bm.faces.index_update()     # índices estáveis (sem isso a ordem das faces varia)
    rot = Matrix.Rotation(PE_ABRE * lado_, 4, 'Z') @ Matrix.Rotation(PE_INCL, 4, 'X')   # ponta para fora e para baixo
    pts = []
    for vv in bm.verts:
        p = Vector((vv.co.x * PE_LARG, vv.co.y * PE_COMP, vv.co.z * PE_ALT))
        pts.append(rot @ p)
    zmin = min(p.z for p in pts)
    v = []
    for p in pts:
        z = max(0.0, p.z - zmin - 2.0)          # sola achatada no chão
        v.append(Vector(((p.x + PE_X * lado_) * S, p.y * S, z * S)))
    f = faces_estaveis([tuple(vv.index for vv in ff.verts) for ff in bm.faces])
    bm.free()
    calcanhar = rot @ Vector((0, PE_COMP * 0.75, 0))
    calc = Vector(((calcanhar.x + PE_X * lado_) * S, calcanhar.y * S, max(0.0, calcanhar.z - zmin - 2.0) * S))
    return v, f, calc


# ---------------------------------------------------------------- cena, materiais e malhas
def limpa():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.unit_settings.system = 'METRIC'; sc.unit_settings.scale_length = 1.0
    sc.render.fps = FPS; sc.render.fps_base = 1.0
    sc.frame_start = 0; sc.frame_end = 59


def srgb_lin(h):
    h = h.lstrip('#'); out = []
    for i in (0, 2, 4):
        c = int(h[i:i + 2], 16) / 255.0
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return out


PALETA = {  # material: (hex oficial, rugosidade)
    'campinguim-penugem': ('#4A5560', 0.9),
    'campinguim-penugem-sombra': ('#333C45', 0.9),
    'campinguim-face': ('#FBF3E4', 0.8),
    'campinguim-barriga': ('#FBF3E4', 0.8),
    'campinguim-olhos': ('#333C45', 1.0),     # fosco: pupila, traço e boca leem o tom chapado do desenho
    'campinguim-bico': ('#E4A33A', 0.6),
    'campinguim-nadadeiras': ('#333C45', 0.85),
    'campinguim-pes': ('#E4A33A', 0.65),
    'campinguim-gorro': ('#3EA8AE', 0.95),
    'campinguim-gotas': ('#3EA8AE', 0.35),
}


def material(nome):
    if nome in bpy.data.materials:
        return bpy.data.materials[nome]
    hx, rough = PALETA[nome]
    m = bpy.data.materials.new(nome)
    if m.node_tree is None:
        m.use_nodes = True
    lin = srgb_lin(hx)
    bsdf = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    bsdf.inputs['Base Color'].default_value = (*lin, 1.0)
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Metallic'].default_value = 0.0
    m.diffuse_color = (*lin, 1.0)
    m.roughness = rough
    m.metallic = 0.0
    m['hex'] = hx
    return m


def orienta(verts, faces, fechada):
    """Faces viradas para fora: malha fechada pelo bmesh; aberta (presa na frente) virada para a frente (-Y)."""
    bm = bmesh.new()
    vs = [bm.verts.new(tuple(v)) for v in verts]
    for f_ in faces:
        bm.faces.new([vs[i] for i in f_])
    bm.verts.index_update()
    if fechada is None:          # a malha já nasce com as faces para fora (esfera do bmesh)
        out = [tuple(f_) for f_ in faces]
    elif fechada:
        bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
        out = [tuple(v.index for v in f_.verts) for f_ in bm.faces]
    else:
        bm.normal_update()
        soma = sum((f_.normal * f_.calc_area() for f_ in bm.faces), Vector())
        out = [tuple(v.index for v in f_.verts) for f_ in bm.faces]
        if soma.y > 0:
            out = [tuple(reversed(f_)) for f_ in out]
    bm.free()
    return out


def malha(nome, verts, faces, mats, mat_idx=None, normais_lisas=None, fechada=True):
    me = bpy.data.meshes.new(nome)
    faces = orienta(verts, faces, fechada)
    me.from_pydata([tuple(v) for v in verts], [], faces)
    me.validate(clean_customdata=False)
    for mn in mats:
        me.materials.append(material(mn))
    if mat_idx:
        me.polygons.foreach_set('material_index', mat_idx)
    me.shade_smooth()
    if normais_lisas:
        me.normals_split_custom_set_from_vertices([tuple(n) for n in normais_lisas])
    me.update()
    ob = bpy.data.objects.new(nome, me)
    bpy.context.scene.collection.objects.link(ob)
    return ob


def alvos(ob, coords_por_expressao):
    ob.shape_key_add(name='Basis', from_mix=False)
    for e in EXPRESSOES:
        k = ob.shape_key_add(name=e, from_mix=False)
        flat = [c for v in coords_por_expressao[e] for c in tuple(v)]
        k.data.foreach_set('co', flat)
        k.value = 0.0
    ob.data.shape_keys.use_relative = True


def muda(coords, tol=1e-6):
    base = coords['neutro']
    return any((a - b).length > tol for e in EXPRESSOES for a, b in zip(coords[e], base))


def mesmos_vertices(listas):
    n = len(listas[0])
    assert all(len(l) == n for l in listas), [len(l) for l in listas]


# ---------------------------------------------------------------- esqueleto
def esqueleto(pos):
    arm = bpy.data.armatures.new('campinguim')
    ob = bpy.data.objects.new('campinguim', arm)
    bpy.context.scene.collection.objects.link(ob)
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    pais = {'raiz': None, 'corpo': 'raiz', 'cabeca': 'corpo', 'gorro': 'cabeca', 'pompom': 'gorro',
            'nadadeira-esquerda': 'corpo', 'nadadeira-direita': 'corpo', 'pe-esquerdo': 'raiz', 'pe-direito': 'raiz'}
    for nome in ['raiz', 'corpo', 'cabeca', 'gorro', 'pompom', 'nadadeira-esquerda', 'nadadeira-direita', 'pe-esquerdo', 'pe-direito']:
        b = arm.edit_bones.new(nome)
        b.head = pos[nome]
        b.tail = pos[nome] + Vector((0, 0, 0.03))
        b.roll = 0.0
        b.use_deform = True
        if pais[nome]:
            b.parent = arm.edit_bones[pais[nome]]
            b.use_connect = False
    bpy.ops.object.mode_set(mode='OBJECT')
    for pb in ob.pose.bones:
        pb.rotation_mode = 'XYZ'
    return ob


def pesos(ob_malha, arm, func):
    """func(i, co) -> lista de (osso, peso)."""
    grupos = {}
    for i, v in enumerate(ob_malha.data.vertices):
        for osso, w in func(i, v.co):
            if w <= 1e-4:
                continue
            if osso not in grupos:
                grupos[osso] = ob_malha.vertex_groups.new(name=osso)
            grupos[osso].add([i], w, 'REPLACE')
    # a malha fica na raiz da cena (sem pai): no glTF, malha com esqueleto ignora o pai de qualquer jeito
    mod = ob_malha.modifiers.new('esqueleto', 'ARMATURE')
    mod.object = arm


def peso_cabeca(co):
    y = y_de_z(co.z)
    w = 1 - smoothstep(235.0, 325.0, y)
    return [('cabeca', w), ('corpo', 1 - w)]


# ---------------------------------------------------------------- animações (tudo função do número do quadro)
def ease(t):
    t = min(1.0, max(0.0, t)); return t * t * (3 - 2 * t)


def janela(f, a, b, c, d):
    """0 antes de a, sobe até b, fica em 1 até c, desce até d."""
    return ease((f - a) / (b - a)) * (1 - ease((f - c) / (d - c)))


def pose_zero():
    return {}


def pose_respirar(k, N=60):
    p = 0.5 * (1 - math.cos(2 * math.pi * k / N))
    return {
        'corpo': dict(esc=(1 + 0.010 * p, 1 + 0.018 * p, 1 + 0.010 * p)),
        'cabeca': dict(rot=(-0.025 * p, 0, 0)),
        'nadadeira-esquerda': dict(rot=(0, 0, 0.05 * p)),
        'nadadeira-direita': dict(rot=(0, 0, -0.05 * p)),
        'pompom': dict(rot=(0.05 * p, 0, 0)),
    }


A_PASSO = 0.022   # metros de avanço de cada pé para a frente e para trás


def pose_andar(k, N=30):
    ph = 2 * math.pi * k / N
    s_ = math.sin(ph)
    lev_e = 0.010 * max(0.0, s_) ** 1.5
    lev_d = 0.010 * max(0.0, -s_) ** 1.5
    return {
        'corpo': dict(rot=(0.04, 0, 0.11 * s_), loc=(0, 0.004 * (0.5 - 0.5 * math.cos(2 * ph)), 0)),
        'cabeca': dict(rot=(0, 0, -0.05 * s_)),
        'gorro': dict(rot=(0, 0, -0.03 * math.sin(ph - 0.5))),
        'pompom': dict(rot=(0, 0, -0.18 * math.sin(ph - 0.9))),
        'nadadeira-esquerda': dict(rot=(0, 0, 0.22 + 0.08 * s_)),
        'nadadeira-direita': dict(rot=(0, 0, -0.22 + 0.08 * s_)),
        'pe-esquerdo': dict(loc=(0, lev_e, -A_PASSO * math.cos(ph))),
        'pe-direito': dict(loc=(0, lev_d, A_PASSO * math.cos(ph))),
    }


def pose_acenar(k, N=60):
    sobe = janela(k, 0, 12, 46, N - 1)
    onda = math.sin(2 * math.pi * (k - 12) / 11.0) if 12 <= k <= 45 else 0.0
    return {
        'corpo': dict(rot=(0, 0, 0.05 * sobe)),
        'cabeca': dict(rot=(-0.04 * sobe, 0, -0.06 * sobe)),
        'nadadeira-esquerda': dict(rot=(0, 0, (2.35 + 0.32 * onda) * sobe)),
        'pompom': dict(rot=(0, 0, 0.06 * onda * sobe)),
    }


def pose_apontar(k, N=48):
    a = janela(k, 0, 12, 34, N - 1)
    return {
        'corpo': dict(rot=(0.10 * a, -0.12 * a, 0)),
        'cabeca': dict(rot=(-0.05 * a, -0.20 * a, 0)),
        'nadadeira-direita': dict(rot=(-1.45 * a, 0, -0.45 * a)),
        'nadadeira-esquerda': dict(rot=(0, 0, 0.06 * a)),
        'pompom': dict(rot=(0.1 * math.sin(math.pi * a) , 0, 0)),
    }


def pose_olhar_cima(k, N=48):
    a = janela(k, 0, 14, 32, N - 1)
    return {
        'corpo': dict(rot=(-0.04 * a, 0, 0)),
        'cabeca': dict(rot=(-0.22 * a, 0, 0)),
        'pompom': dict(rot=(0.12 * a, 0, 0)),
        'nadadeira-esquerda': dict(rot=(0, 0, 0.05 * a)),
        'nadadeira-direita': dict(rot=(0, 0, -0.05 * a)),
    }


def pose_tremer(k, N=30):
    ph = 2 * math.pi * 5 * k / N          # 5 tremidas por segundo, número inteiro de voltas no ciclo
    return {
        'corpo': dict(rot=(0.03, 0, 0.035 * math.sin(ph)), loc=(0.0016 * math.sin(ph + 0.6), 0, 0),
                      esc=(1.0, 0.975, 1.0)),
        'cabeca': dict(rot=(0.05, 0, -0.025 * math.sin(ph + 1.0)), loc=(0, -0.004, 0)),
        'nadadeira-esquerda': dict(rot=(0, 0, -0.10 + 0.02 * math.sin(ph))),
        'nadadeira-direita': dict(rot=(0, 0, 0.10 - 0.02 * math.sin(ph))),
        'gorro': dict(rot=(0, 0, 0.012 * math.sin(ph + 2.0))),
        'pompom': dict(rot=(0, 0, 0.06 * math.sin(ph + 2.4))),
        'pe-esquerdo': dict(loc=(-0.004, 0, 0)),
        'pe-direito': dict(loc=(0.004, 0, 0)),
    }


def pose_comemorar(k, N=45):
    agacha = janela(k, 0, 7, 8, 11) + janela(k, 26, 29, 30, 36)
    # salto: sobe de 9 a 18, desce de 18 a 27 (parábola)
    h = 0.0
    if 9 <= k <= 27:
        t = (k - 9) / 18.0; h = 4 * t * (1 - t)
    alto = 0.055 * h
    bracos = janela(k, 6, 13, 26, 36)
    return {
        'corpo': dict(loc=(0, alto - 0.008 * agacha, 0), esc=(1 + 0.03 * agacha, 1 - 0.06 * agacha + 0.03 * h, 1 + 0.03 * agacha)),
        'cabeca': dict(rot=(-0.10 * bracos, 0, 0)),
        'nadadeira-esquerda': dict(rot=(0, 0, 2.5 * bracos)),
        'nadadeira-direita': dict(rot=(0, 0, -2.5 * bracos)),
        'pe-esquerdo': dict(loc=(0, alto, 0)),
        'pe-direito': dict(loc=(0, alto, 0)),
        'pompom': dict(rot=(0.35 * math.sin(math.pi * h) * (1 if k < 18 else -1), 0, 0)),
        'gorro': dict(loc=(0, 0.004 * h, 0)),
    }


CLIPES = [  # nome, função, quadros, é ciclo
    ('parado-respirando', pose_respirar, 60, True),
    ('andar', pose_andar, 30, True),
    ('acenar', pose_acenar, 60, False),
    ('apontar', pose_apontar, 48, False),
    ('olhar-para-cima', pose_olhar_cima, 48, False),
    ('tremer-de-frio', pose_tremer, 30, True),
    ('comemorar', pose_comemorar, 45, False),
]


def aplica_pose(arm, pose):
    for pb in arm.pose.bones:
        d = pose.get(pb.name, {})
        pb.location = d.get('loc', (0, 0, 0))
        pb.rotation_euler = d.get('rot', (0, 0, 0))
        pb.scale = d.get('esc', (1, 1, 1))


def grava_clipes(arm):
    arm.animation_data_create()
    for nome, fn, N, ciclo in CLIPES:
        act = bpy.data.actions.new(nome)
        act.use_fake_user = True
        arm.animation_data.action = act
        # ciclo: quadros 0..N-1 (o quadro N seria igual ao 0 e não é gravado);
        # pontual: quadros 0..N-1 com o último igual ao quadro 0 de parado-respirando (pose de repouso)
        for k in range(N):
            aplica_pose(arm, fn(k, N))
            for pb in arm.pose.bones:
                pb.keyframe_insert('location', frame=k)
                pb.keyframe_insert('rotation_euler', frame=k)
                pb.keyframe_insert('scale', frame=k)
        try:
            for fc in act.fcurves:
                for kp in fc.keyframe_points:
                    kp.interpolation = 'LINEAR'
        except AttributeError:
            for layer in act.layers:
                for strip in layer.strips:
                    for cb in strip.channelbags:
                        for fc in cb.fcurves:
                            for kp in fc.keyframe_points:
                                kp.interpolation = 'LINEAR'
        act.frame_range = (0, N - 1)
        act.use_frame_range = True
    arm.animation_data.action = None
    aplica_pose(arm, {})


# ---------------------------------------------------------------- montagem
def construir():
    limpa()
    # corpo
    base = corpo_coords('base'); liso = corpo_coords('liso')
    cf, cm = corpo_faces()
    me_tmp = bpy.data.meshes.new('tmp'); me_tmp.from_pydata([tuple(v) for v in liso], [], orienta(liso, cf, True)); me_tmp.update()
    normais = [tuple(v.normal) for v in me_tmp.vertices]
    bpy.data.meshes.remove(me_tmp)
    corpo = malha('campinguim.corpo', base, cf, ['campinguim-penugem', 'campinguim-penugem-sombra'], cm, normais)
    coords = {e: base for e in EXPRESSOES}
    coords['frio'] = corpo_coords('frio'); coords['calor'] = corpo_coords('calor')
    alvos(corpo, coords)

    face_poly = frente[5][2][0]; barriga_poly = frente[4][2][0]
    def var_corpo(e):
        return e if e in ('frio', 'calor') else 'base'
    fc = {e: mancha(face_poly, 256.0, 172.0, var=var_corpo(e))[0] for e in EXPRESSOES}
    ff = mancha(face_poly, 256.0, 172.0)[1]
    face = malha('campinguim.face', fc['neutro'], ff, ['campinguim-face'], fechada=False)
    if muda(fc):
        alvos(face, fc)
    bc_ = {e: mancha(barriga_poly, 256.0, 374.0, alto=2.6, borda=1.4, var=var_corpo(e))[0] for e in EXPRESSOES}
    bf = mancha(barriga_poly, 256.0, 374.0)[1]
    barriga = malha('campinguim.barriga', bc_['neutro'], bf, ['campinguim-barriga'], fechada=False)
    if muda(bc_):
        alvos(barriga, bc_)

    oc = {e: olhos_coords(e) for e in EXPRESSOES}; mesmos_vertices(list(oc.values()))
    olhos = malha('campinguim.olhos', oc['neutro'], olhos_faces(), ['campinguim-olhos'], fechada=False)
    pupilas_para_frente(olhos)
    alvos(olhos, oc)

    bc = {e: bico_coords(e) for e in EXPRESSOES}; mesmos_vertices(list(bc.values()))
    bico = malha('campinguim.bico', bc['neutro'], bico_faces(), ['campinguim-bico'], fechada=False)
    alvos(bico, bc)

    mc = {e: boca_coords(e) for e in EXPRESSOES}
    boca = malha('campinguim.boca', mc['neutro'], boca_faces(), ['campinguim-olhos'], fechada=False)
    alvos(boca, mc)

    gc = {e: gotas_coords(e == 'calor') for e in EXPRESSOES}
    gotas = malha('campinguim.gotas', gc['neutro'], gotas_faces(), ['campinguim-gotas'])
    alvos(gotas, gc)

    gv = {e: [P(*p) for p in gorro_var(e)] for e in EXPRESSOES}; mesmos_vertices(list(gv.values()))
    gorro = malha('campinguim.gorro', gv['neutro'], GORRO_FACES, ['campinguim-gorro'])
    alvos(gorro, gv)

    ve, fe, eixo_e = nadadeira(1); vd, fd, eixo_d = nadadeira(-1)
    nad = malha('campinguim.nadadeiras', ve + vd, fe + [tuple(i + len(ve) for i in f_) for f_ in fd], ['campinguim-nadadeiras'])
    n_nad_e = len(ve)

    pve, pfe, calc_e = pe(1); pvd, pfd, calc_d = pe(-1)
    pes = malha('campinguim.pes', pve + pvd, pfe + [tuple(i + len(pve) for i in f_) for f_ in pfd], ['campinguim-pes'], fechada=None)
    n_pe_e = len(pve)

    # esqueleto
    pos = {
        'raiz': Vector((0, 0, 0)),
        'corpo': P(EIXO_F, 430.0, c_lado(430.0)),
        'cabeca': P(EIXO_F, 290.0, c_lado(290.0)),
        'gorro': P(EIXO_GORRO, ABA_Y, EIXO_GORRO),
        'pompom': P(EIXO_GORRO + 70, 92.0, EIXO_GORRO + 64),
        'nadadeira-esquerda': P(*eixo_e[1]),
        'nadadeira-direita': P(*eixo_d[1]),
        'pe-esquerdo': calc_e,
        'pe-direito': calc_d,
    }
    arm = esqueleto(pos)
    for ob in (corpo, face, barriga, olhos, bico, boca):
        pesos(ob, arm, lambda i, co: peso_cabeca(co))
    pesos(gotas, arm, lambda i, co: [('cabeca', 1.0)])
    n_copa, n_aba, n_tot = GORRO_FAIXAS
    pesos(gorro, arm, lambda i, co: [('pompom', 1.0)] if i >= n_aba else [('gorro', 1.0)])
    pesos(nad, arm, lambda i, co: [('nadadeira-esquerda' if i < n_nad_e else 'nadadeira-direita', 1.0)])
    pesos(pes, arm, lambda i, co: [('pe-esquerdo' if i < n_pe_e else 'pe-direito', 1.0)])

    # âncoras
    bpy.context.view_layer.update()
    def ancora(nome, osso, pos_mundo):
        e = bpy.data.objects.new(nome, None)
        e.empty_display_type = 'SPHERE'; e.empty_display_size = 0.01
        bpy.context.scene.collection.objects.link(e)
        e.parent = arm; e.parent_type = 'BONE'; e.parent_bone = osso
        bpy.context.view_layer.update()
        e.matrix_world = Matrix.Translation(pos_mundo)
        return e
    ancora('campinguim.ancora-rotulo', 'cabeca', P(EIXO_GORRO, 15.0, EIXO_GORRO))
    ancora('campinguim.ancora-mao', 'nadadeira-direita', P(*eixo_d[-2]))

    grava_clipes(arm)
    bpy.context.scene.frame_set(0)
    return arm


def exportar():
    os.makedirs(SAIDA, exist_ok=True)
    blend = os.path.join(SAIDA, 'campinguim.blend')
    glb = os.path.join(SAIDA, 'campinguim.glb')
    bpy.context.preferences.filepaths.save_version = 0     # sem cópia .blend1
    bpy.ops.wm.save_as_mainfile(filepath=blend, compress=True)
    bpy.ops.export_scene.gltf(
        filepath=glb, export_format='GLB', export_yup=True, export_apply=False,
        export_texcoords=False, export_normals=True, export_tangents=False,
        export_materials='EXPORT', export_image_format='NONE', export_vertex_color='NONE',
        export_cameras=False, export_lights=False, export_extras=False,
        export_skins=True, export_def_bones=False, export_leaf_bone=False,
        export_morph=True, export_morph_normal=False, export_morph_animation=False,
        export_animations=True, export_animation_mode='ACTIONS', export_force_sampling=True,
        export_frame_step=1, export_optimize_animation_size=False, export_anim_slide_to_zero=False,
        export_reset_pose_bones=True, export_rest_position_armature=True,
        export_draco_mesh_compression_enable=False, export_meshopt_compression_enable=False,
    )
    print('GLB', glb, os.path.getsize(glb))


if __name__ == '__main__':
    construir()
    exportar()

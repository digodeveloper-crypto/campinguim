# Campinguim 3D: monta as folhas de prévia a partir dos renders (Python com Pillow).
# Uso: python -I -B folhas.py <pasta dos renders> <pasta previas>
import sys, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

R, OUT = sys.argv[1], sys.argv[2]
PREFIXO = sys.argv[3] if len(sys.argv) > 3 else ''      # 'A-', 'B-', 'C-' nas variantes da máscara
VARIANTES_DIRS = sys.argv[4:]                            # modo variantes: pastas de render de A, B e C
VET = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'final', 'png', 'claro'))
os.makedirs(OUT, exist_ok=True)
BRANCO = (255, 255, 255, 255)
VERM = (220, 30, 60, 255)


def fonte(t):
    for f in ('C:/Windows/Fonts/segoeui.ttf', 'C:/Windows/Fonts/arial.ttf'):
        if os.path.exists(f):
            return ImageFont.truetype(f, t)
    return ImageFont.load_default()


def sobre_branco(im):
    fundo = Image.new('RGBA', im.size, BRANCO)
    fundo.alpha_composite(im.convert('RGBA'))
    return fundo


def contorno(alpha, cor, esp=3):
    m = alpha.point(lambda a: 255 if a > 127 else 0)
    borda = ImageChops.subtract(m.filter(ImageFilter.MaxFilter(esp)), m.filter(ImageFilter.MinFilter(esp)))
    camada = Image.new('RGBA', m.size, cor)
    out = Image.new('RGBA', m.size, (0, 0, 0, 0))
    out.paste(camada, (0, 0), borda)
    return out


def folha(celulas, colunas, titulo, arquivo, lado=512, legenda_h=40):
    linhas = (len(celulas) + colunas - 1) // colunas
    W = colunas * lado; H = 60 + linhas * (lado + legenda_h)
    f = Image.new('RGBA', (W, H), BRANCO)
    d = ImageDraw.Draw(f)
    d.text((16, 14), titulo, fill=(30, 30, 30, 255), font=fonte(26))
    for i, (im, leg) in enumerate(celulas):
        x = (i % colunas) * lado; y = 60 + (i // colunas) * (lado + legenda_h)
        f.alpha_composite(sobre_branco(im).resize((lado, lado), Image.LANCZOS), (x, y))
        d.text((x + 12, y + lado + 6), leg, fill=(40, 40, 40, 255), font=fonte(20))
        d.rectangle([x, y, x + lado - 1, y + lado - 1], outline=(220, 220, 220, 255))
    f.convert('RGB').save(os.path.join(OUT, arquivo), optimize=True)
    print('FOLHA', arquivo)


def abre(n):
    return Image.open(os.path.join(R, n)).convert('RGBA')


def comparar(v, vet_nome, rend_luz, rend_chapado, arquivo, titulo):
    vet = Image.open(os.path.join(VET, vet_nome)).convert('RGBA')
    luz = abre(rend_luz); ch = abre(rend_chapado)
    sob = sobre_branco(ch)
    sob.alpha_composite(contorno(vet.getchannel('A'), VERM, 5))
    meio = Image.blend(sobre_branco(vet), sobre_branco(ch), 0.5)
    folha([(vet, 'vetor aprovado'), (luz, 'modelo 3D, com luz'),
           (sob, 'modelo 3D chapado + contorno do vetor (vermelho)'), (meio, 'vetor e modelo chapado, 50% cada')],
          4, titulo, arquivo)


cmp = [('frente', 'vista-frente-1024.png'), ('lado', 'vista-lado-1024.png'), ('tres-quartos', 'vista-tres-quartos-1024.png')]
for v, vn in cmp:
    if os.path.exists(os.path.join(R, f'cmp-{v}-luz.png')):
        nome = f'{PREFIXO}{v}.png' if PREFIXO else f'comparar-{v}.png'
        rot = f'variante {PREFIXO[:-1]} · ' if PREFIXO else ''
        comparar(v, vn, f'cmp-{v}-luz.png', f'cmp-{v}-chapado.png', nome,
                 f'Campinguim 3D x vetor aprovado · {rot}vista {v.replace("-", " ")} (mesma prancha, mesmo chão)')

if os.path.exists(os.path.join(R, 'giro-costas.png')):
    folha([(abre('cmp-frente-luz.png'), 'frente'), (abre('cmp-tres-quartos-luz.png'), 'três quartos (45°)'),
           (abre('cmp-lado-luz.png'), 'lado'), (abre('giro-costas.png'), 'costas')], 4,
          'Campinguim 3D · giro do modelo (neutro, pose de repouso)', 'giro.png')

EXP = ['neutro', 'alegre', 'preocupado', 'alerta', 'frio', 'calor', 'surpreso']
if os.path.exists(os.path.join(R, 'expr-neutro.png')):
    os.makedirs(os.path.join(OUT, 'expressoes'), exist_ok=True)
    cel = []
    for e in EXP:
        vet = Image.open(os.path.join(VET, 'expressoes', f'expressao-{e}-1024.png')).convert('RGBA')
        im = abre(f'expr-{e}.png')
        sobre_branco(im).convert('RGB').save(os.path.join(OUT, 'expressoes', f'{e}.png'), optimize=True)
        cel += [(vet, f'{e} · vetor'), (im, f'{e} · 3D'), (abre(f'expr34-{e}.png'), f'{e} · 3D três quartos')]
    folha(cel, 6, 'Campinguim 3D · as 7 expressões (alvo de forma com o mesmo nome em todas as malhas que mudam)',
          'expressoes.png', lado=384)

CLIPES = [('parado-respirando', 60), ('andar', 30), ('acenar', 60), ('apontar', 48),
          ('olhar-para-cima', 48), ('tremer-de-frio', 30), ('comemorar', 45)]
CICLO = {'parado-respirando', 'andar', 'tremer-de-frio'}
if os.path.exists(os.path.join(R, 'borda-andar-ini.png')):
    os.makedirs(os.path.join(OUT, 'clipes'), exist_ok=True)
    for nome, N in CLIPES:
        qs = sorted(set([round(i * (N - 1) / 7) for i in range(8)]))
        cel = [(abre(f'clip-{nome}-{q:03d}.png'), f'quadro {q}') for q in qs]
        tipo = 'ciclo' if nome in CICLO else 'pontual'
        folha(cel, 4, f'{nome} · {N} quadros a 30 qps ({tipo}) · quadros 0 a {N - 1}', f'clipes/{nome}.png', lado=384)

if VARIANTES_DIRS:
    NOMES = {'A': ['frente exata', '(como o desenho', 'de frente)'], 'B': ['máscara envolvente', '(como o desenho', 'de lado)'],
             'C': ['meio-termo', '(envolve 1,3×)']}
    cel = []
    for letra, pasta in zip('ABC', VARIANTES_DIRS):
        for v, rot in (('frente', 'frente'), ('tres-quartos', 'três quartos'), ('lado', 'lado')):
            cel.append((Image.open(os.path.join(pasta, f'cmp-{v}-luz.png')).convert('RGBA'), f'{letra} · {rot}'))
    lado = 440; leg = 40; W = 3 * lado + 330; H = 70 + 3 * (lado + leg)
    f = Image.new('RGBA', (W, H), BRANCO); d = ImageDraw.Draw(f)
    d.text((16, 16), 'Campinguim 3D · variantes da máscara da face e da barriga (com luz, sem o vetor por cima)',
           fill=(30, 30, 30, 255), font=fonte(26))
    for i, (im, legenda) in enumerate(cel):
        r, c = divmod(i, 3); x = 330 + c * lado; y = 70 + r * (lado + leg)
        f.alpha_composite(sobre_branco(im).resize((lado, lado), Image.LANCZOS), (x, y))
        d.text((x + 10, y + lado + 6), legenda, fill=(40, 40, 40, 255), font=fonte(20))
        if c == 0:
            letra = 'ABC'[r]
            d.text((40, y + lado // 2 - 90), letra, fill=(20, 20, 20, 255), font=fonte(120))
            for k, linha in enumerate(NOMES[letra]):
                d.text((24, y + lado // 2 + 60 + 26 * k), linha, fill=(60, 60, 60, 255), font=fonte(21))
    f.convert('RGB').save(os.path.join(OUT, 'variantes.png'), optimize=True)
    print('FOLHA variantes.png')

if os.path.exists(os.path.join(R, 'borda-andar-ini.png')):
    cel = []
    for nome, N in CLIPES:
        if nome in CICLO:
            cel += [(abre(f'borda-{nome}-fim.png'), f'{nome}: último ({N - 1})'),
                    (abre(f'borda-{nome}-ini.png'), f'{nome}: 0 (vem depois)')]
        else:
            cel += [(abre(f'borda-{nome}-ini.png'), f'{nome}: quadro 0'),
                    (abre(f'borda-{nome}-fim.png'), f'{nome}: último ({N - 1})')]
    folha(cel, 4, 'Emendas dos clipes: ciclos (último quadro -> primeiro) e pontuais (começam e terminam no repouso)',
          'clipes/emendas.png', lado=384)

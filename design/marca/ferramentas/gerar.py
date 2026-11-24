r"""Gera as 10 opções de logo de perfil (DSG-07) e o letreiro horizontal, em SVG e PNG.

Uso (de qualquer pasta, Windows, Python 3.12 + Pillow + fontTools + uharfbuzz; usa o Chrome ou o Edge instalado):
  python -I design\marca\ferramentas\gerar.py

Tudo é derivado de material oficial, só com posição e escala:
  - mascote: design\mascote\final\vetor\{claro,escuro}\icone.svg e icone\fonte\icone-uma-cor.svg (cópia das formas);
  - letreiro: Archivo variável (largura 125, peso 800, +0,08 em), convertido em contorno com HarfBuzz;
  - cores: os 10 papéis da paleta Eucalipto (docs\DESIGN.md, seção 3.1) e as tintas da uma cor do guia do mascote;
  - curvas de nível: a mesma função de design\prototipos\rumo\icones.js (curvas), reescrita aqui;
  - selo: o retângulo de canto cortado do Rumo (DESIGN.md, seção 5). Selo redondo é proibido (seção 13).
Saída: design\marca\opcoes\, design\marca\letreiro-horizontal\ e design\marca\medidas.json.
"""
import importlib.util, json, math, pathlib, random, re, shutil, subprocess, tempfile

from PIL import Image
import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

RAIZ = pathlib.Path(__file__).resolve().parents[3]
MARCA = RAIZ / "design" / "marca"
FINAL = RAIZ / "design" / "mascote" / "final"
FONTE = RAIZ / "design" / "prototipos" / "_compartilhado" / "fontes" / "archivo" / "Archivo-variavel.ttf"

# Tamanhos dos PNG da foto de perfil (ver LEIA-ME, seção 5): a ajuda oficial do Instagram não dá tamanho
# e a do TikTok só pede "at least 20x20 pixels" (consulta de 24/11/2026). O 1024 pedido pela tarefa atende às duas.
TAMANHOS = [1024]
LADO = 1024  # prancha das opções, em unidades do SVG
R = LADO / 2

# --- cores (DESIGN.md 3.1 e 3.4; guia do mascote, seção 2) ---
EUC = {
    "claro": {"fundo": "#DCE8E2", "superficie": "#F4F9F6", "texto": "#10201C", "linha": "#66847A",
              "acento": "#1F4B4D", "sobre-acento": "#F4F9F6", "carro": "#24507F"},
    "escuro": {"fundo": "#0C1615", "superficie": "#14211F", "texto": "#E2EEEA", "linha": "#5F7A73",
               "acento": "#B8D5C8", "sobre-acento": "#0C1615", "carro": "#A3C8F2"},
}
TINTA, BRANCO = "#111111", "#FFFFFF"
ARDOSIA, CREME = "#4A5560", "#FBF3E4"

# --- utilidades ---------------------------------------------------------------------------------

def lum(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def contraste(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return round((la + 0.05) / (lb + 0.05), 2)


def n(x):
    return f"{x:.2f}".rstrip("0").rstrip(".")


def miolo(svg_texto):
    """Conteúdo de um SVG oficial sem o elemento <svg> e sem os comentários."""
    s = re.sub(r"<!--.*?-->", "", svg_texto, flags=re.S)
    s = re.sub(r"^\s*<svg[^>]*>", "", s.strip())
    s = re.sub(r"</svg>\s*$", "", s)
    return "\n".join(l for l in s.splitlines() if l.strip())


MASCOTE = {
    "claro": miolo((FINAL / "vetor" / "claro" / "icone.svg").read_text(encoding="utf-8")),
    "escuro": miolo((FINAL / "vetor" / "escuro" / "icone.svg").read_text(encoding="utf-8")),
    "uma": miolo((FINAL / "icone" / "fonte" / "icone-uma-cor.svg").read_text(encoding="utf-8")),
}


def mascote(tipo, tinta=None):
    m = MASCOTE[tipo]
    if tipo == "uma" and tinta:
        m = m.replace(TINTA, tinta)  # única troca de cor permitida (guia, seção 3)
    return m


def carregar_render():
    spec = importlib.util.spec_from_file_location("render", RAIZ / "design" / "mascote" / "ferramentas" / "render.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


RENDER = carregar_render()
NAVEGADOR = RENDER.achar_navegador()


def png(svg_arquivo, lado, destino, tmp):
    html = RENDER.html_arte(svg_arquivo, lado, "transparent")
    RENDER.capturar(NAVEGADOR, html, lado, destino, tmp)
    im = Image.open(destino).convert("RGBA")
    assert im.size == (lado, lado), im.size
    return im


# --- círculo mínimo que contém a figura do mascote (medido no desenho renderizado) ---------------

def circulo_minimo(pts):
    pts = pts[:]
    random.Random(7).shuffle(pts)

    def de2(a, b):
        cx, cy = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
        return cx, cy, math.dist(a, (cx, cy))

    def de3(a, b, c):
        d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]))
        if abs(d) < 1e-12:
            return max((de2(a, b), de2(a, c), de2(b, c)), key=lambda t: t[2])
        ux = ((a[0] ** 2 + a[1] ** 2) * (b[1] - c[1]) + (b[0] ** 2 + b[1] ** 2) * (c[1] - a[1]) + (c[0] ** 2 + c[1] ** 2) * (a[1] - b[1])) / d
        uy = ((a[0] ** 2 + a[1] ** 2) * (c[0] - b[0]) + (b[0] ** 2 + b[1] ** 2) * (a[0] - c[0]) + (c[0] ** 2 + c[1] ** 2) * (b[0] - a[0])) / d
        return ux, uy, math.dist(a, (ux, uy))

    def dentro(c, p):
        return math.dist((c[0], c[1]), p) <= c[2] + 1e-7

    c = (pts[0][0], pts[0][1], 0)
    for i, p in enumerate(pts):
        if not dentro(c, p):
            c = (p[0], p[1], 0)
            for j in range(i):
                q = pts[j]
                if not dentro(c, q):
                    c = de2(p, q)
                    for k in range(j):
                        if not dentro(c, pts[k]):
                            c = de3(p, q, pts[k])
    return c


def medir_figura(tipo, tmp):
    """Renderiza a arte em 1024 sem fundo e devolve (cx, cy, raio, caixa) em unidades da prancha 512."""
    arq = tmp / f"medir-{tipo}.svg"
    arq.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">{mascote(tipo)}</svg>', encoding="utf-8")
    im = png(arq, 1024, tmp / f"medir-{tipo}.png", tmp)
    a = im.getchannel("A")
    caixa = a.getbbox()
    px = a.load()
    borda = []
    w, h = a.size
    for y in range(h):  # só os pixels de borda de cada linha bastam para o círculo
        xs = [x for x in range(w) if px[x, y] > 0]
        if xs:
            borda += [(xs[0], y), (xs[-1] + 1, y), (xs[0], y + 1), (xs[-1] + 1, y + 1)]
    cx, cy, r = circulo_minimo(borda)
    return {"cx": cx / 2, "cy": cy / 2, "r": r / 2, "caixa": [v / 2 for v in caixa]}


# --- letreiro em contorno (HarfBuzz + Archivo variável) ------------------------------------------

BLOB = hb.Blob.from_file_path(str(FONTE))
FACE = hb.Face(BLOB)


def fonte_hb():
    f = hb.Font(FACE)
    f.set_variations({"wdth": 125, "wght": 800})
    return f


def texto(t, tamanho, espaco_em=0.08):
    """Contorno de `t` com altura de corpo `tamanho`. Devolve (d, largura, altura_maiuscula, topo_tinta, base_tinta)
    com a origem na linha de base, x = 0 no início da primeira letra; o espaço extra depois da última letra não conta."""
    f = fonte_hb()
    upem = FACE.upem
    buf = hb.Buffer()
    buf.add_str(t)
    buf.guess_segment_properties()
    hb.shape(f, buf, {"kern": True, "liga": True})
    k = tamanho / upem
    trilha = espaco_em * upem
    caneta = SVGPathPen(None)
    x = 0
    topo, base = 0, 0
    for i, (info, pos) in enumerate(zip(buf.glyph_infos, buf.glyph_positions)):
        tp = TransformPen(caneta, (k, 0, 0, -k, (x + pos.x_offset) * k, -pos.y_offset * k))
        f.draw_glyph_with_pen(info.codepoint, tp)
        ext = f.get_glyph_extents(info.codepoint)
        topo = max(topo, ext.y_bearing)
        base = min(base, ext.y_bearing + ext.height)
        x += pos.x_advance + (trilha if i < len(buf.glyph_infos) - 1 else 0)
    gid_h = f.get_nominal_glyph(ord("H"))
    cap = f.get_glyph_extents(gid_h).y_bearing * k
    return caneta.getCommands(), x * k, cap, topo * k, base * k


def tinta_do_c(tamanho):
    """Caixa de tinta do "C" (para centrar o monograma pela forma, não pela caixa da letra)."""
    f = fonte_hb()
    g = f.get_nominal_glyph(ord("C"))
    e = f.get_glyph_extents(g)
    k = tamanho / FACE.upem
    return e.x_bearing * k, (e.x_bearing + e.width) * k, e.y_bearing * k, (e.y_bearing + e.height) * k


# --- peças de desenho ------------------------------------------------------------------------------

def curvas(cor, opacidade, cx, cy, escala=LADO / 360, aneis=14, largura=4, fase=0.0):
    """Mesma construção de rumo/icones.js, função curvas (anéis irregulares concêntricos), na escala da prancha."""
    r0, passo, sx, sy = 14 * escala, 19 * escala, 1.55, 1

    def caminho_fechado(p):
        q = len(p)
        d = f"M{n(p[0][0])} {n(p[0][1])}"
        for i in range(q):
            p0, p1, p2, p3 = p[(i - 1) % q], p[i], p[(i + 1) % q], p[(i + 2) % q]
            d += (f"C{n(p1[0] + (p2[0] - p0[0]) / 6)} {n(p1[1] + (p2[1] - p0[1]) / 6)} "
                  f"{n(p2[0] - (p3[0] - p1[0]) / 6)} {n(p2[1] - (p3[1] - p1[1]) / 6)} {n(p2[0])} {n(p2[1])}")
        return d + "Z"

    cam = []
    for k in range(aneis):
        r = r0 + k * passo
        pts = []
        for i in range(40):
            t = i / 40 * math.pi * 2
            a = (1 + 0.11 * math.sin(2 * t + 0.7 + k * 0.22 + fase) + 0.06 * math.sin(3 * t + 1.9 - k * 0.17 + fase * 2)
                 + 0.035 * math.sin(5 * t + 0.3 + k * 0.41))
            pts.append((cx + math.cos(t) * r * a * sx, cy + math.sin(t) * r * a * sy))
        cam.append(f'<path d="{caminho_fechado(pts)}"/>')
    return (f'<g fill="none" stroke="{cor}" stroke-opacity="{opacidade}" stroke-width="{largura}">'
            + "".join(cam) + "</g>")


def octogono(cx, cy, meio, corte):
    """Retângulo de canto cortado (forma do selo e do apoio do Rumo), quadrado de lado 2*meio."""
    x0, x1, y0, y1 = cx - meio, cx + meio, cy - meio, cy + meio
    p = [(x0 + corte, y0), (x1 - corte, y0), (x1, y0 + corte), (x1, y1 - corte),
         (x1 - corte, y1), (x0 + corte, y1), (x0, y1 - corte), (x0, y0 + corte)]
    return "M" + " L".join(f"{n(a)} {n(b)}" for a, b in p) + " Z"


def meio_octogono_no_circulo(raio, fracao_corte):
    """Maior octógono (corte = fracao_corte do lado) cujos vértices ficam dentro do círculo `raio`."""
    c = 2 * fracao_corte  # corte em relação ao meio-lado
    return raio / math.sqrt(1 + (1 - c) ** 2)


def g_mascote(tipo, s, x, y, tinta=None):
    return f'<g transform="translate({n(x)} {n(y)}) scale({s:.5f})">\n{mascote(tipo, tinta)}\n</g>'


def svg(corpo, titulo, largura=LADO, altura=LADO):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {largura} {altura}" width="{largura}" height="{altura}">\n'
            f'  <!-- Campinguim · {titulo} · DSG-07 · gerado por design/marca/ferramentas/gerar.py a partir do pacote oficial -->\n'
            f'  <title>Campinguim</title>\n{corpo}\n</svg>\n')


def fundo(cor, largura=LADO, altura=LADO):
    return f'<rect x="0" y="0" width="{largura}" height="{altura}" fill="{cor}"/>'


# --- composições ---------------------------------------------------------------------------------

RESPIRO = 32  # 1/16 da prancha de 512 (guia, seção 5)
MARGEM_TEXTO = 0.5  # margem do letreiro até a borda do círculo, em alturas de maiúscula


def mascote_no_circulo(tipo, fig, raio=R, cx=R, cy=R):
    """Maior escala em que a figura + o respiro de 1/16 cabem no círculo; a figura fica centrada pelo seu círculo mínimo."""
    s = raio / (fig["r"] + RESPIRO)
    return s, cx - s * fig["cx"], cy - s * fig["cy"]


def cabe(pts, raio):
    return all(math.dist(p, (R, R)) <= raio + 1e-6 for p in pts)


def mascote_com_letreiro(fig, lado, prop):
    """Mascote + "CAMPINGUIM" (abaixo ou ao lado), fora do quadrado da prancha (guia, seção 5).
    `prop` = altura da maiúscula / lado da prancha. Busca a maior escala que cabe no círculo."""
    melhor = None
    lo, hi = 0.05, 2.0
    for _ in range(50):
        s = (lo + hi) / 2
        P = 512 * s
        cap_alvo = prop * P
        d, larg, cap, topo, base = texto("CAMPINGUIM", cap_alvo / 0.686)
        if lado == "abaixo":
            fig_topo = fig["caixa"][1] * s
            altura = P - fig_topo + cap
            px = R - P / 2
            py = R - altura / 2 - fig_topo
            tx, ty = R - larg / 2, py + P + cap  # linha de base
        else:
            largura = P + larg
            px = R - largura / 2
            py = R - P / 2 - (fig["cy"] - 256) * s * 0  # prancha centrada na vertical
            tx, ty = px + P, R + cap / 2
        fc = (px + fig["cx"] * s, py + fig["cy"] * s)
        ok_fig = math.dist(fc, (R, R)) + (fig["r"] + RESPIRO) * s <= R
        m = MARGEM_TEXTO * cap
        ok_txt = cabe([(tx - m, ty - cap - m), (tx + larg + m, ty - cap - m), (tx - m, ty + m), (tx + larg + m, ty + m)], R)
        if ok_fig and ok_txt:
            lo = s
            melhor = dict(s=s, px=px, py=py, d=d, tx=tx, ty=ty, cap=cap, larg=larg)
        else:
            hi = s
    return melhor


def letreiro_centrado(cap_max_prop, raio=R):
    """"CAMPINGUIM" sozinho, o maior que cabe no círculo com margem de meia maiúscula."""
    lo, hi = 10.0, 600.0
    melhor = None
    for _ in range(50):
        corpo = (lo + hi) / 2
        d, larg, cap, topo, base = texto("CAMPINGUIM", corpo)
        tx, ty = R - larg / 2, R + cap / 2
        m = MARGEM_TEXTO * cap
        if cabe([(tx - m, ty - cap - m), (tx + larg + m, ty - cap - m), (tx - m, ty + m), (tx + larg + m, ty + m)], raio) and cap <= cap_max_prop * LADO:
            lo, melhor = corpo, dict(d=d, tx=tx, ty=ty, cap=cap, larg=larg)
        else:
            hi = corpo
    return melhor


def monograma(cap_alvo, cx=R, cy=R):
    corpo = cap_alvo / 0.686
    d, larg, cap, topo, base = texto("C", corpo, espaco_em=0)
    x0, x1, yt, yb = tinta_do_c(corpo)  # yt = topo (positivo, para cima), yb = base (negativo)
    tx = cx - (x0 + x1) / 2
    ty = cy + (yt + yb) / 2
    return d, tx, ty, cap, (x1 - x0), (yt - yb)


# --- as 10 opções ------------------------------------------------------------------------------------

VARIANTES = ["claro", "escuro", "uma-cor"]


def cores(v):
    """Cores de cada variante. A uma cor usa a tinta única #111111 sobre branco (guia, seção 2)."""
    if v == "uma-cor":
        return {"fundo": BRANCO, "superficie": BRANCO, "texto": TINTA, "linha": TINTA, "acento": TINTA,
                "sobre-acento": BRANCO, "carro": TINTA}
    return EUC[v]


def tipo_mascote(v):
    return {"claro": "claro", "escuro": "escuro", "uma-cor": "uma"}[v]


def compor(num, v, F, med):
    c = cores(v)
    tm = tipo_mascote(v)
    partes, info = [], {}

    def registrar_mascote(tipo, s, fundo_cor, nome="mascote"):
        info[nome] = {"arte": {"claro": "icone claro", "escuro": "icone escuro", "uma": "icone uma cor"}[tipo],
                      "prancha_unidades": round(512 * s, 1)}
        if tipo == "uma":
            info[nome]["contraste_tinta"] = contraste(TINTA, fundo_cor)
        if tipo == "claro":
            info[nome]["contraste_corpo"] = contraste(ARDOSIA, fundo_cor)
        elif tipo == "escuro":
            info[nome]["contraste_contorno_creme"] = contraste(CREME, fundo_cor)
            info[nome]["contraste_corpo_contorno"] = contraste(ARDOSIA, CREME)

    if num == 1:  # mascote sozinho, fundo liso
        partes.append(fundo(c["fundo"]))
        s, x, y = mascote_no_circulo(tm, F[tm])
        partes.append(g_mascote(tm, s, x, y))
        registrar_mascote(tm, s, c["fundo"])
        if tm == "uma":
            info["mascote"]["contraste_tinta"] = contraste(TINTA, BRANCO)

    elif num == 2:  # mascote no apoio de canto cortado (selo do Rumo)
        partes.append(fundo(c["fundo"]))
        traco = 20
        meio = meio_octogono_no_circulo(R - traco - 8, 0.10)
        corte = 0.10 * 2 * meio
        apoio = {"claro": c["superficie"], "escuro": EUC["escuro"]["texto"], "uma-cor": BRANCO}[v]
        partes.append(f'<path d="{octogono(R, R, meio, corte)}" fill="{apoio}" stroke="{c["carro"]}" stroke-width="{traco}" stroke-linejoin="miter"/>')
        tipo = "claro" if v != "uma-cor" else "uma"  # no escuro, a versão colorida vai sobre o papel `texto` (DESIGN.md 8)
        folga = 0.06 * 2 * meio
        P = 2 * meio - 2 * folga
        s = P / 512
        # a figura fica centrada pelo seu círculo mínimo dentro do apoio
        partes.append(g_mascote(tipo, s, R - s * F[tipo]["cx"], R - s * F[tipo]["cy"]))
        registrar_mascote(tipo, s, apoio)
        info["selo"] = {"forma": "canto cortado", "corte_fracao_lado": 0.10, "traco": traco,
                        "contraste_traco_fundo": contraste(c["carro"], c["fundo"]),
                        "contraste_apoio_fundo": contraste(apoio, c["fundo"])}
        if tipo == "uma":
            info["mascote"]["contraste_tinta"] = contraste(TINTA, BRANCO)

    elif num == 3:  # mascote sozinho + curvas de nível
        partes.append(fundo(c["fundo"]))
        s, x, y = mascote_no_circulo(tm, F[tm])
        cy_fig = y + s * F[tm]["cy"]
        op = 0.6 if v != "uma-cor" else 0.35
        partes.append(curvas(c["linha"], op, R, cy_fig))
        partes.append(g_mascote(tm, s, x, y))
        registrar_mascote(tm, s, c["fundo"])
        info["curvas"] = {"cor": "linha", "opacidade": op, "contraste_linha_cheia_fundo": contraste(c["linha"], c["fundo"])}

    elif num in (4, 6):  # mascote + letreiro abaixo (6: sobre o acento)
        if num == 6:
            fundo_cor = {"claro": EUC["claro"]["acento"], "escuro": EUC["escuro"]["acento"], "uma-cor": TINTA}[v]
            letra = {"claro": EUC["claro"]["sobre-acento"], "escuro": EUC["escuro"]["sobre-acento"], "uma-cor": BRANCO}[v]
            # acento claro é escuro → versão escura do mascote; acento escuro é claro → versão clara; uma cor → negativo
            tipo = {"claro": "escuro", "escuro": "claro", "uma-cor": "uma"}[v]
            tinta = BRANCO if v == "uma-cor" else None
        else:
            fundo_cor, letra, tipo, tinta = c["fundo"], c["texto"], tm, None
        partes.append(fundo(fundo_cor))
        L = mascote_com_letreiro(F[tipo], "abaixo", 0.13)
        partes.append(g_mascote(tipo, L["s"], L["px"], L["py"], tinta))
        partes.append(f'<path transform="translate({n(L["tx"])} {n(L["ty"])})" fill="{letra}" d="{L["d"]}"/>')
        registrar_mascote(tipo, L["s"], fundo_cor)
        if tipo == "uma":
            info["mascote"]["contraste_tinta"] = contraste(tinta or TINTA, fundo_cor)
        info["letreiro"] = {"altura_maiuscula": round(L["cap"], 1), "largura": round(L["larg"], 1),
                            "contraste": contraste(letra, fundo_cor)}

    elif num == 5:  # mascote + letreiro ao lado
        partes.append(fundo(c["fundo"]))
        L = mascote_com_letreiro(F[tm], "lado", 0.13)
        partes.append(g_mascote(tm, L["s"], L["px"], L["py"]))
        partes.append(f'<path transform="translate({n(L["tx"])} {n(L["ty"])})" fill="{c["texto"]}" d="{L["d"]}"/>')
        registrar_mascote(tm, L["s"], c["fundo"])
        info["letreiro"] = {"altura_maiuscula": round(L["cap"], 1), "largura": round(L["larg"], 1),
                            "contraste": contraste(c["texto"], c["fundo"])}

    elif num == 7:  # monograma "C" liso
        partes.append(fundo(c["fundo"]))
        d, tx, ty, cap, lw, lh = monograma(0.52 * LADO)
        partes.append(f'<path transform="translate({n(tx)} {n(ty)})" fill="{c["acento"]}" d="{d}"/>')
        info["monograma"] = {"altura_maiuscula": round(cap, 1), "contraste": contraste(c["acento"], c["fundo"]), "cor": "acento"}

    elif num == 8:  # monograma "C" no selo de canto cortado
        partes.append(fundo(c["fundo"]))
        traco = 24
        meio = meio_octogono_no_circulo(R - traco - 8, 0.10)
        corte = 0.10 * 2 * meio
        partes.append(f'<path d="{octogono(R, R, meio, corte)}" fill="none" stroke="{c["carro"]}" stroke-width="{traco}" stroke-linejoin="miter"/>')
        d, tx, ty, cap, lw, lh = monograma(0.40 * LADO)
        partes.append(f'<path transform="translate({n(tx)} {n(ty)})" fill="{c["carro"]}" d="{d}"/>')
        info["monograma"] = {"altura_maiuscula": round(cap, 1), "contraste": contraste(c["carro"], c["fundo"]), "cor": "carro"}
        info["selo"] = {"forma": "canto cortado", "corte_fracao_lado": 0.10, "traco": traco,
                        "contraste_traco_fundo": contraste(c["carro"], c["fundo"])}

    elif num == 9:  # letreiro só + curvas de nível
        partes.append(fundo(c["fundo"]))
        op = 0.6 if v != "uma-cor" else 0.35
        partes.append(curvas(c["linha"], op, R, R))
        L = letreiro_centrado(1.0)
        partes.append(f'<path transform="translate({n(L["tx"])} {n(L["ty"])})" fill="{c["texto"]}" d="{L["d"]}"/>')
        info["letreiro"] = {"altura_maiuscula": round(L["cap"], 1), "largura": round(L["larg"], 1),
                            "contraste": contraste(c["texto"], c["fundo"])}
        info["curvas"] = {"cor": "linha", "opacidade": op, "contraste_linha_cheia_fundo": contraste(c["linha"], c["fundo"])}

    elif num == 10:  # uma cor sobre o acento
        fundo_cor = {"claro": EUC["claro"]["acento"], "escuro": EUC["escuro"]["acento"], "uma-cor": TINTA}[v]
        tinta = {"claro": EUC["claro"]["sobre-acento"], "escuro": EUC["escuro"]["sobre-acento"], "uma-cor": BRANCO}[v]
        partes.append(fundo(fundo_cor))
        s, x, y = mascote_no_circulo("uma", F["uma"])
        partes.append(g_mascote("uma", s, x, y, tinta))
        registrar_mascote("uma", s, fundo_cor)
        info["mascote"]["contraste_tinta"] = contraste(tinta, fundo_cor)

    return "\n".join(partes), info


OPCOES = {
    1: "mascote",
    2: "mascote-no-selo",
    3: "mascote-curvas",
    4: "mascote-letreiro-abaixo",
    5: "mascote-letreiro-ao-lado",
    6: "acento-mascote-letreiro",
    7: "monograma",
    8: "monograma-no-selo",
    9: "letreiro-curvas",
    10: "uma-cor-sobre-acento",
}


# --- letreiro horizontal (derivado da opção recomendada, a 01: mascote + fundo liso) -----------------

def letreiro_horizontal(v, F):
    c = cores(v)
    tm = tipo_mascote(v)
    W, H = 2048, 512
    P = H  # a prancha do mascote ocupa a altura toda; o respiro já está dentro dela
    s = P / 512
    # o letreiro ocupa a largura que sobra, com a margem da direita igual à da figura até a borda da prancha (64 de 512)
    margem = 64 * s
    _, larg1, cap1, _, _ = texto("CAMPINGUIM", 100)
    corpo_txt = 100 * (W - P - margem) / larg1
    d, larg, capm, topo, base = texto("CAMPINGUIM", corpo_txt)
    x_txt = P  # o letreiro começa onde a prancha termina (guia, seção 5)
    x0 = 0
    y_txt = H / 2 + capm / 2
    corpo = "\n".join([fundo(c["fundo"], W, H), g_mascote(tm, s, x0, 0),
                       f'<path transform="translate({n(x0 + x_txt)} {n(y_txt)})" fill="{c["texto"]}" d="{d}"/>'])
    return svg(corpo, f"letreiro horizontal {v}", W, H), {"altura_maiuscula": round(capm, 1), "largura_letreiro": round(larg, 1),
                                                           "contraste_letreiro": contraste(c["texto"], c["fundo"])}


def main():
    tmp = pathlib.Path(tempfile.mkdtemp(prefix="campinguim-marca-"))
    try:
        F = {t: medir_figura(t, tmp) for t in ("claro", "escuro", "uma")}
        medidas = {"figura": F, "tamanhos_png": TAMANHOS, "opcoes": {}, "letreiro_horizontal": {}}
        destino = MARCA / "opcoes"
        if destino.exists():
            shutil.rmtree(destino)
        for num, nome in OPCOES.items():
            pasta = destino / f"{num:02d}-{nome}"
            (pasta / "png").mkdir(parents=True)
            medidas["opcoes"][f"{num:02d}"] = {"nome": nome, "variantes": {}}
            for v in VARIANTES:
                corpo, info = compor(num, v, F, medidas)
                arq = pasta / f"{num:02d}-{v}.svg"
                arq.write_text(svg(corpo, f"opção {num:02d} {nome} {v}"), encoding="utf-8")
                for t in TAMANHOS:
                    alvo = pasta / "png" / f"{num:02d}-{v}-{t}.png"
                    im = png(arq, t, alvo, tmp)
                    im.convert("RGB").save(alvo, optimize=True)
                medidas["opcoes"][f"{num:02d}"]["variantes"][v] = info
                print(f"{num:02d} {v}: ok")
        lh = MARCA / "letreiro-horizontal"
        if lh.exists():
            shutil.rmtree(lh)
        (lh / "png").mkdir(parents=True)
        for v in VARIANTES:
            conteudo, info = letreiro_horizontal(v, F)
            arq = lh / f"letreiro-horizontal-{v}.svg"
            arq.write_text(conteudo, encoding="utf-8")
            for larg in (2048, 1024):
                alvo = lh / "png" / f"letreiro-horizontal-{v}-{larg}x{larg // 4}.png"
                html = (f"<!doctype html><html><body style='margin:0;overflow:hidden'>"
                        f"<img src='{arq.resolve().as_uri()}' style='display:block;width:{larg}px;height:{larg // 4}px'></body></html>")
                pagina = tmp / f"lh-{v}-{larg}.html"
                pagina.write_text(html, encoding="utf-8")
                subprocess.run([NAVEGADOR, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
                                "--disable-extensions", f"--window-size={larg},{larg // 4}", f"--screenshot={alvo.resolve()}",
                                pagina.resolve().as_uri()], capture_output=True)
                im = Image.open(alvo)
                assert im.size == (larg, larg // 4), im.size
                im.convert("RGB").save(alvo, optimize=True)
            medidas["letreiro_horizontal"][v] = info
            print(f"letreiro horizontal {v}: ok")
        (MARCA / "medidas.json").write_text(json.dumps(medidas, ensure_ascii=False, indent=1), encoding="utf-8")
        print("exit=0")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()

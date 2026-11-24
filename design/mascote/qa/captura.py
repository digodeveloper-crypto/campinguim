"""Capturas do QA do mascote (Windows, Python 3.12 + Playwright + Pillow, usando o Google Chrome instalado).

Uso:
  python -I captura.py pagina <arquivo.html|http://...> <pasta_saida> [--rotulo NOME] [--auditar]
      Abre a página no Chrome e salva a página inteira em celular (390x844, densidade 3)
      e computador (1440x900, densidade 1), com a arte em fundo claro e escuro (clica no
      botão .btn-fundo da página; sem botão, usa o tema do sistema). --auditar mede alvos
      de toque < 44 px, textos abaixo do contraste AA e o tamanho real dos ícones de 48 px.
  python -I captura.py arte <imagem.svg|png> <pasta_saida> [--rotulo NOME]
      Renderiza a arte isolada sobre fundo claro (#FFFFFF) e escuro (#121212):
      grande (512 px), 48 px reais (densidade 1, sem reamostragem do navegador)
      e derivados para o olho do QA: 48 px ampliado 8x sem suavizar, cinza,
      silhueta em 1 cor (canal de transparência), máscara redonda do Android, "sol forte" (contraste achatado + brilho) e
      a mesma arte ao lado de 47 ícones neutros para ver se destaca.
  python -I captura.py conferir <opcoes/NN> <pasta_saida>
      Confere o contrato da pasta arte/ (arquivos que faltam ou sobram) e as regras de arquivo de
      padrao-producao.md (viewBox 512, tags proibidas, degradê, uma tinta #111111 no uma-cor);
      mede a caixa da figura renderizada (largura, altura, chão y=480, margem); roda `arte` em
      cada arquivo e `pagina --auditar` na página da opção.
  python -I captura.py mosaico <opcoes/NN> <pasta_saida> <opcoes/MM> ...
      Silhuetas, versões em uma cor e ícones de 48 px reais das opções dadas, lado a lado (MSC-01).
Saídas em PNG, nomes estáveis, prontas para citar no relatório.
"""
import sys, pathlib, base64, mimetypes, argparse
from playwright.sync_api import sync_playwright
from PIL import Image, ImageOps, ImageEnhance

CLARO, ESCURO = "#FFFFFF", "#121212"

AUDITORIA_JS = r"""() => {
  const lum = c => { const m = c.match(/[\d.]+/g); if (!m) return null;
    const [r,g,b] = m.slice(0,3).map(v => { v = v/255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); });
    return 0.2126*r + 0.7152*g + 0.0722*b; };
  const alfa = c => { const m = c.match(/[\d.]+/g); return m && m.length > 3 ? +m[3] : 1; };
  const fundo = el => { for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor;
      if (alfa(c) > 0.5) return c; } return "rgb(255,255,255)"; };
  const visivel = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none" && !e.closest("dialog:not([open])"); };
  const toque = [...document.querySelectorAll("a[href], button, input, select, textarea, summary, [role=button]")]
    .filter(visivel).map(e => { const r = e.getBoundingClientRect(); return {t: (e.innerText || e.getAttribute("aria-label") || e.tagName).trim().slice(0,40), w: Math.round(r.width), h: Math.round(r.height)}; })
    .filter(o => o.w < 44 || o.h < 44);
  const contraste = []; const vistos = new Set();
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = w.nextNode()); ) { const e = n.parentElement; if (!e || !n.textContent.trim() || !visivel(e)) continue;
    if (e.closest("[aria-hidden=true]")) continue;
    const cs = getComputedStyle(e); const L1 = lum(cs.color), L2 = lum(fundo(e)); if (L1 === null || L2 === null) continue;
    const k = (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05); const px = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700;
    const grande = px >= 24 || (bold && px >= 18.66); const min = grande ? 3 : 4.5;
    if (k < min) { const t = n.textContent.trim().slice(0,50); const ch = t + "|" + k.toFixed(2);
      if (!vistos.has(ch)) { vistos.add(ch); contraste.push({t, k: +k.toFixed(2), px, min, cor: cs.color, fundo: fundo(e)}); } } }
  const icones48 = [...document.querySelectorAll("img.icone-48, .icone-48, .chip-48 img, .caixa-48 img")].filter(visivel)
    .map(e => { const r = e.getBoundingClientRect(); return Math.round(r.width*100)/100 + "x" + Math.round(r.height*100)/100; });
  return {toque, contraste, icones48};
}"""

def pagina(html, saida, rotulo="pagina", auditar=False):
    url = html if html.startswith(("http:", "https:")) else pathlib.Path(html).resolve().as_uri()
    origem = url.split("/", 3)[:3]
    alvos = [("celular", {"width": 390, "height": 844}, 3, True),
             ("computador", {"width": 1440, "height": 900}, 1, False)]
    with sync_playwright() as p:
        b = p.chromium.launch(channel="chrome")  # Google Chrome instalado; sem baixar navegador
        for nome, vp, dsf, mobile in alvos:
            for fundo in ("claro", "escuro"):
                ctx = b.new_context(viewport=vp, device_scale_factor=dsf, is_mobile=mobile, has_touch=mobile,
                                    color_scheme="dark" if fundo == "escuro" else "light")
                pg = ctx.new_page()
                erros, externos = [], []
                pg.on("console", lambda m: erros.append(m.text) if m.type in ("error", "warning") else None)
                pg.on("pageerror", lambda e: erros.append("excecao: " + str(e)))
                pg.on("request", lambda r: externos.append(r.url)
                      if not r.url.startswith(("file:", "data:", "blob:")) and r.url.split("/", 3)[:3] != origem else None)
                pg.on("requestfailed", lambda r: erros.append("falhou: " + r.url))
                # páginas com várias molduras (iframes) podem nunca ficar "networkidle": espera o load e um respiro
                pg.goto(url, wait_until="load"); pg.wait_for_timeout(1500)
                botao = ""
                # o fundo escuro da arte vem de um botão da página (.btn-fundo); sem botão, vale o tema do sistema
                if fundo == "escuro" and pg.locator(".btn-fundo").count():
                    pg.locator(".btn-fundo").first.click(); pg.wait_for_timeout(300)
                    botao = " botao_fundo=" + pg.locator(".btn-fundo").first.inner_text().replace(chr(10), " ")
                largura = pg.evaluate("document.documentElement.scrollWidth")
                f = saida / f"{rotulo}-{nome}-{fundo}.png"
                altura = pg.evaluate("document.documentElement.scrollHeight")
                if altura * dsf <= 15000:
                    pg.screenshot(path=str(f), full_page=True)
                else:
                    # o Chrome repete o conteúdo acima de ~16384 px de captura: fotografa em faixas e cola
                    faixa = 15000 // dsf; partes = []
                    for y in range(0, altura, faixa):
                        tmp = saida / f"_faixa-{y}.png"
                        pg.screenshot(path=str(tmp), full_page=True,
                                      clip={"x": 0, "y": y, "width": vp["width"], "height": min(faixa, altura - y)})
                        partes.append(Image.open(tmp).convert("RGB")); tmp.unlink()
                    tela = Image.new("RGB", (partes[0].width, sum(i.height for i in partes)))
                    yy = 0
                    for i in partes: tela.paste(i, (0, yy)); yy += i.height
                    tela.save(f)
                print(f"{f.name}  rolagem_horizontal={'SIM' if largura > vp['width'] else 'nao'} ({largura}px)  erros={len(erros)}  pedidos_externos={len(externos)}{botao}")
                for e in erros: print("    erro:", e)
                for e in sorted(set(externos)): print("    externo:", e)
                if auditar:
                    a = pg.evaluate(AUDITORIA_JS)
                    print(f"    icones_48: {a['icones48'] or 'nenhum'}")
                    print(f"    alvos_menores_que_44: {len(a['toque'])}")
                    for o in a["toque"]: print(f"      {o['w']}x{o['h']}  {o['t']!r}")
                    print(f"    textos_abaixo_de_AA: {len(a['contraste'])}")
                    for o in a["contraste"]: print(f"      {o['k']}:1 (min {o['min']}, {o['px']}px) {o['t']!r} cor={o['cor']} fundo={o['fundo']}")
                ctx.close()
        b.close()

def html_arte(src, lado, fundo):
    return (f"<!doctype html><html><body style='margin:0;background:{fundo}'>"
            f"<div id=a style='width:{lado}px;height:{lado}px;display:flex;align-items:center;justify-content:center'>"
            f"<img src='{src}' style='max-width:100%;max-height:100%'></div></body></html>")

def arte(img, saida, rotulo):
    mime = mimetypes.guess_type(img)[0] or "image/png"
    src = f"data:{mime};base64," + base64.b64encode(pathlib.Path(img).read_bytes()).decode()
    with sync_playwright() as p:
        b = p.chromium.launch(channel="chrome")  # Google Chrome instalado; sem baixar navegador
        ctx = b.new_context(viewport={"width": 600, "height": 600}, device_scale_factor=1)
        pg = ctx.new_page()
        for fnome, fundo in (("claro", CLARO), ("escuro", ESCURO)):
            for lado in (512, 48):
                pg.set_content(html_arte(src, lado, fundo))
                pg.wait_for_load_state("networkidle")
                f = saida / f"{rotulo}-{lado}-{fnome}.png"
                pg.locator("#a").screenshot(path=str(f))
        # versão sem fundo, para a silhueta sair do canal de transparência
        pg.set_content(html_arte(src, 512, "transparent"))
        pg.wait_for_load_state("networkidle")
        pg.locator("#a").screenshot(path=str(saida / f"{rotulo}-512-transparente.png"), omit_background=True)
        b.close()
    for fnome in ("claro", "escuro"):
        p48 = Image.open(saida / f"{rotulo}-48-{fnome}.png").convert("RGB")
        p512 = Image.open(saida / f"{rotulo}-512-{fnome}.png").convert("RGB")
        assert p48.size == (48, 48), p48.size
        p48.resize((384, 384), Image.NEAREST).save(saida / f"{rotulo}-48x8-{fnome}.png")
        ImageOps.grayscale(p512).save(saida / f"{rotulo}-cinza-{fnome}.png")
        ImageOps.grayscale(p48).resize((384, 384), Image.NEAREST).save(saida / f"{rotulo}-48-cinza-{fnome}.png")
        sol = ImageEnhance.Contrast(p48).enhance(0.45)
        sol = ImageEnhance.Brightness(sol).enhance(1.35)
        sol.resize((384, 384), Image.NEAREST).save(saida / f"{rotulo}-48-sol-{fnome}.png")
        # vizinhança: a arte de 48 px no meio de uma grade 8x6 de quadrados neutros
        grade = Image.new("RGB", (8 * 60, 6 * 60), "#DDDDDD" if fnome == "claro" else "#2A2A2A")
        from PIL import ImageDraw
        d = ImageDraw.Draw(grade)
        tons = ["#3D7BD9", "#E2483D", "#2E9E5B", "#F2B233", "#7A4FD1", "#1A1A1A", "#FF7A00", "#00A3A3"]
        for i in range(8):
            for j in range(6):
                d.rounded_rectangle([i*60+6, j*60+6, i*60+54, j*60+54], 10, fill=tons[(i+j) % 8])
        grade.paste(p48, (3*60+6, 2*60+6))
        grade.save(saida / f"{rotulo}-48-entre-apps-{fnome}.png")
        # máscara redonda do ícone adaptável do Android (corta tudo fora do círculo)
        from PIL import ImageDraw as _D
        m = Image.new("L", (48, 48), 0); _D.Draw(m).ellipse([0, 0, 47, 47], fill=255)
        r = Image.new("RGB", (48, 48), "#DDDDDD" if fnome == "claro" else "#2A2A2A"); r.paste(p48, (0, 0), m)
        r.resize((384, 384), Image.NEAREST).save(saida / f"{rotulo}-48-redondo-{fnome}.png")
    # silhueta: tudo o que tem tinta (alfa > 0) vira preto, em 512 e em 48 px
    alfa = Image.open(saida / f"{rotulo}-512-transparente.png").convert("RGBA").getchannel("A")
    sil = alfa.point(lambda v: 0 if v > 16 else 255)
    sil.save(saida / f"{rotulo}-silhueta.png")
    sil.resize((48, 48), Image.LANCZOS).resize((384, 384), Image.NEAREST).save(saida / f"{rotulo}-48-silhueta.png")
    print("\n".join(sorted(x.name for x in saida.glob(f"{rotulo}-*.png"))))

# ---------------------------------------------------------------- conferência de uma opção
CONTRATO = ["principal", "vista-frente", "vista-lado", "vista-tres-quartos", "pose-neutro",
            "pose-comemorando", "pose-alerta", "pose-camping", "icone", "uma-cor"]
OPCIONAIS = ["sem-acessorio", "pose-extra-frio", "pose-extra-calor", "pose-extra-chuva"]
EM_PE = ["principal", "vista-frente", "vista-lado", "vista-tres-quartos", "pose-neutro", "sem-acessorio"]

def lint_svg(f, nome):
    """Regras de padrao-producao.md que só o arquivo mostra. Devolve (avisos, usa_degrade)."""
    import re, xml.etree.ElementTree as ET
    av, txt = [], f.read_text(encoding="utf-8", errors="replace")
    try:
        raiz = ET.fromstring(txt)
    except ET.ParseError as e:
        return [f"SVG inválido: {e}"], False
    tag = lambda e: e.tag.split("}")[-1]
    if raiz.get("viewBox", "").split() != ["0", "0", "512", "512"]: av.append(f"viewBox {raiz.get('viewBox')!r} (esperado 0 0 512 512)")
    if raiz.get("width") != "512" or raiz.get("height") != "512": av.append(f"width/height {raiz.get('width')}x{raiz.get('height')} (esperado 512x512)")
    tags = [tag(e) for e in raiz.iter()]
    for proibida in ("text", "image", "filter", "foreignObject", "script", "style"):
        if proibida in tags: av.append(f"tag proibida: <{proibida}>")
    if re.search(r"(?:href|url)\s*[=(]\s*[\"']?\s*(?:https?:|file:|//)", txt): av.append("referência externa")
    if "<!--" not in txt[:400]: av.append("sem comentário de uma linha no topo")
    degrade = any(t in tags for t in ("linearGradient", "radialGradient"))
    if degrade and nome in ("icone", "uma-cor"): av.append("degradê proibido neste arquivo")
    for e in raiz.iter():
        if tag(e) == "rect":
            try:
                if float(e.get("width", "0").rstrip("%")) >= 500 and float(e.get("height", "0").rstrip("%")) >= 500: av.append("rect do tamanho da prancha (fundo?)")
            except ValueError: pass
    if nome == "uma-cor":
        cores = set()
        for e in raiz.iter():
            estilo = dict(x.split(":", 1) for x in e.get("style", "").replace(" ", "").split(";") if ":" in x)
            for k in ("fill", "stroke"):
                v = (e.get(k) or estilo.get(k) or "").lower()
                if v and v not in ("none", "transparent"): cores.add((k, v))
            for k in ("opacity", "fill-opacity", "stroke-opacity"):
                v = e.get(k) or estilo.get(k)
                try:
                    if v and float(v) < 1: av.append(f"uma-cor com {k}={v}")
                except ValueError: pass
        fora = sorted(c for c in cores if c not in (("fill", "#111111"), ("fill", "#111")))
        if fora: av.append(f"uma-cor com outras tintas/linhas: {fora}")
    return av, degrade

def caixa_alfa(f):
    """Caixa da figura (alfa > 16) na prancha de 512, renderizada pelo Chrome."""
    import io
    with sync_playwright() as p:
        b = p.chromium.launch(channel="chrome")
        pg = b.new_page(viewport={"width": 600, "height": 600})
        mime = mimetypes.guess_type(str(f))[0] or "image/png"
        pg.set_content(html_arte(f"data:{mime};base64," + base64.b64encode(f.read_bytes()).decode(), 512, "transparent"))
        pg.wait_for_load_state("networkidle")
        png = pg.locator("#a").screenshot(omit_background=True)
        b.close()
    return Image.open(io.BytesIO(png)).convert("RGBA").getchannel("A").point(lambda v: 255 if v > 16 else 0).getbbox()

def conferir(pasta, saida):
    pasta = pathlib.Path(pasta); arte_dir = pasta / "arte"
    print(f"== opção {pasta.name}")
    existentes = {x.stem: x for x in arte_dir.iterdir() if x.is_file()} if arte_dir.exists() else {}
    faltam = [n for n in CONTRATO if n not in existentes]
    sobram = sorted(n for n in existentes if n not in CONTRATO + OPCIONAIS)
    print(f"arquivos: {len(existentes)}  faltam: {faltam or 'nenhum'}  fora do contrato: {sobram or 'nenhum'}")
    if (arte_dir / "_render").exists(): print("AVISO: arte/_render ainda existe (deveria ser apagada)")
    alturas = {}
    print("arquivo                caixa(x0,y0,x1,y1)     larg  alt   chao  margem  avisos")
    for nome in [n for n in CONTRATO + OPCIONAIS if n in existentes]:
        f = existentes[nome]
        av, deg = lint_svg(f, nome) if f.suffix.lower() == ".svg" else ([], False)
        cx = caixa_alfa(f)
        if not cx: print(f"{nome:22} VAZIO"); continue
        x0, y0, x1, y1 = cx; larg, alt = x1 - x0, y1 - y0
        lim = 16 if nome.startswith("pose") and nome != "pose-neutro" else 32
        margem = "ok" if min(x0, y0, 512 - x1, 512 - y1) >= lim - 1 else f"<{lim}"
        if nome in EM_PE:
            alturas[nome] = alt
            if abs(y1 - 480) > 3: av.append(f"chão em y={y1} (esperado 480)")
        if deg: av.append("usa degradê")
        print(f"{nome:22} {str(cx):22} {larg:4}  {alt:4}  {y1:4}  {margem:6}  {'; '.join(av) if av else '-'}")
    if alturas:
        ref = alturas.get("principal") or next(iter(alturas.values()))
        dif = {k: v for k, v in alturas.items() if abs(v - ref) > 4}
        print(f"altura em pé (principal={ref}): {'iguais' if not dif else 'DIFERENTES ' + str(dif)}")
    for nome in [n for n in CONTRATO + OPCIONAIS if n in existentes]:
        arte(str(existentes[nome]), saida, nome)
    if (pasta / "index.html").exists():
        pagina(str(pasta / "index.html"), saida, "pagina", True)

def mosaico(saida, pastas):
    """Silhuetas, versões em uma cor e ícones em 48 px reais, lado a lado, por opção (MSC-01)."""
    import shutil
    from PIL import ImageDraw
    linhas = []
    for pasta in pastas:
        pasta = pathlib.Path(pasta)
        uc = next(iter(sorted((pasta / "arte").glob("uma-cor.*"))), None)
        ic = next(iter(sorted((pasta / "arte").glob("icone.*"))), None)
        if not uc or not ic: print(f"{pasta.name}: sem uma-cor ou icone, fora do mosaico"); continue
        tmp = saida / f"_mos-{pasta.name}"; tmp.mkdir(exist_ok=True)
        arte(str(uc), tmp, "uc"); arte(str(ic), tmp, "ic")
        linhas.append((pasta.name, Image.open(tmp / "uc-silhueta.png").convert("RGB").resize((160, 160)),
                       Image.open(tmp / "uc-512-claro.png").convert("RGB").resize((160, 160)),
                       Image.open(tmp / "ic-48-claro.png").convert("RGB"), Image.open(tmp / "ic-48-escuro.png").convert("RGB")))
        shutil.rmtree(tmp)
    if not linhas: return
    m = Image.new("RGB", (len(linhas) * 180 + 20, 2 * 180 + 120), "#FFFFFF"); d = ImageDraw.Draw(m)
    for i, (n, sil, uc, i48c, i48e) in enumerate(linhas):
        x = 20 + i * 180
        d.text((x, 4), n, fill="#000000")
        m.paste(sil, (x, 20)); m.paste(uc, (x, 200))
        m.paste(i48c, (x, 380))
        fundo = Image.new("RGB", (60, 60), ESCURO); fundo.paste(i48e, (6, 6)); m.paste(fundo, (x + 70, 374))
    f = saida / "mosaico-opcoes.png"; m.save(f); print(f.name, "com", [l[0] for l in linhas])

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("modo", choices=["pagina", "arte", "conferir", "mosaico"])
    ap.add_argument("entrada"); ap.add_argument("saida"); ap.add_argument("mais", nargs="*")
    ap.add_argument("--rotulo", default=None)
    ap.add_argument("--auditar", action="store_true", help="pagina: lista alvos de toque < 44 px, textos abaixo de AA e tamanho real dos ícones de 48 px")
    a = ap.parse_args()
    out = pathlib.Path(a.saida); out.mkdir(parents=True, exist_ok=True)
    if a.modo == "pagina": pagina(a.entrada, out, a.rotulo or "pagina", a.auditar)
    elif a.modo == "arte": arte(a.entrada, out, a.rotulo or "arte")
    elif a.modo == "conferir": conferir(a.entrada, out)
    else: mosaico(out, [a.entrada] + a.mais)   # mosaico <opcoes/NN> <saida> <opcoes/MM> ...

"""Medição das telas de um protótipo do Campinguim (QA, roteiro seção 1).

Uso (de dentro de design/prototipos/qa/):
  python -I prototipo.py <pasta da direção> <pasta de saída> [--telas 1,4,6] [--fontes 100,130,200] [--extra "paleta=x"] [--http]

Para cada tela (01 a 15 e identidade), em cada tema (claro, escuro) e fonte (100, 130, 200 %):
- abre na moldura (janela 1280 x 900, densidade 2, ?avaliador=0) e tira a captura da tela do app (.cg-tela, 390 x 844);
- registra erros de console, exceções e pedidos externos;
- conta <h1>, mascotes (.cg-mascote) e textos "[chave]" visíveis;
- mede todo elemento tocável dentro de .cg-tela: área menor que 44 x 44 e vão menor que 8 px entre vizinhos;
- lista os botões com 48 px ou mais de altura e a posição do topo (a ação principal deve ficar abaixo de 506 px);
- acusa texto cortado (scrollWidth > clientWidth sem rolagem própria), reticências, palavra partida entre linhas e rolagem horizontal da tela;
- mede o contraste de todo texto visível (mínimo 4,5:1, ou 3:1 para texto grande) e marca o que fica abaixo de 7:1;
- na tela 4, salva também a captura em tons de cinza.
Saída: PNG por combinação e um resumo em <saída>/medicao.txt. Usa o Google Chrome instalado.
"""
import sys, pathlib, argparse, subprocess, time
from playwright.sync_api import sync_playwright
from PIL import Image, ImageOps

TELAS = ["01-abertura", "02-criar-viagem", "03-alertas", "04-lista", "05-item", "06-aviso-de-saida", "07-estadia",
         "08-volta", "09-em-casa", "10-fato", "11-grupo", "12-gastos", "13-camping-sem-dados", "14-convidado",
         "15-site", "identidade"]

MEDIR = r"""() => {
  const tela = document.querySelector('.cg-tela') || document.body;
  const T = tela.getBoundingClientRect();
  const vis = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && !e.closest('[inert],[aria-hidden=true]'); };
  const rel = r => ({x: Math.round(r.x - T.x), y: Math.round(r.y - T.y), w: Math.round(r.width), h: Math.round(r.height)});
  const nome = e => (e.getAttribute('aria-label') || e.innerText || e.value || e.tagName).trim().replace(/\s+/g, ' ').slice(0, 40);
  // alvos de toque: a área conta com pseudoelementos (::before/::after posicionados), medidos pela caixa maior
  const area = e => { let r = e.getBoundingClientRect(); let x0 = r.left, y0 = r.top, x1 = r.right, y1 = r.bottom;
    for (const ps of ['::before', '::after']) { const c = getComputedStyle(e, ps);
      if (c.content && c.content !== 'none' && c.position === 'absolute') {
        const t = parseFloat(c.top), l = parseFloat(c.left), b = parseFloat(c.bottom), rr = parseFloat(c.right);
        if (!isNaN(t)) y0 = Math.min(y0, r.top + t); if (!isNaN(l)) x0 = Math.min(x0, r.left + l);
        if (!isNaN(b)) y1 = Math.max(y1, r.bottom - b); if (!isNaN(rr)) x1 = Math.max(x1, r.right - rr); } }
    return {left: x0, top: y0, right: x1, bottom: y1, width: x1 - x0, height: y1 - y0, x: x0, y: y0}; };
  const toc = [...tela.querySelectorAll('a[href],button,input,select,textarea,summary,[role=button],[tabindex]:not([tabindex="-1"])')].filter(vis);
  const pequenos = toc.map(e => [e, area(e)]).filter(([e, a]) => a.width < 44 || a.height < 44).map(([e, a]) => ({n: nome(e), ...rel(a)}));
  const caixas = toc.map(e => area(e)); const vaos = [];
  for (let i = 0; i < caixas.length; i++) for (let j = i + 1; j < caixas.length; j++) {
    const a = caixas[i], b = caixas[j];
    const sobH = a.left < b.right && b.left < a.right, sobV = a.top < b.bottom && b.top < a.bottom;
    if (sobH && sobV) continue;  // um dentro do outro ou sobrepostos: não é vão
    const gx = Math.max(b.left - a.right, a.left - b.right), gy = Math.max(b.top - a.bottom, a.top - b.bottom);
    const g = sobV ? gx : (sobH ? gy : Math.max(gx, gy));
    if (g >= 0 && g < 8) vaos.push({a: nome(toc[i]), b: nome(toc[j]), vao: Math.round(g)}); }
  const principais = [...tela.querySelectorAll('button,a[href],[role=button]')].filter(vis).map(e => [e, e.getBoundingClientRect()])
    .filter(([e, r]) => r.height >= 48).map(([e, r]) => ({n: nome(e), topo: Math.round(r.top - T.y), h: Math.round(r.height)}));
  const cortados = [...tela.querySelectorAll('*')].filter(vis).filter(e => {
    const cs = getComputedStyle(e); if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
    return (cs.textOverflow === 'ellipsis') || (e.scrollWidth > e.clientWidth + 1 && !['auto', 'scroll'].includes(cs.overflowX) && cs.overflowX !== 'visible'); })
    .map(e => nome(e));
  const rol = document.querySelector('.cg-rolagem') || document.scrollingElement;
  const rolH = rol.scrollWidth > rol.clientWidth + 1;
  const lum = c => { const m = c.match(/[\d.]+/g); if (!m) return null; const [r, g, b] = m.slice(0, 3).map(v => { v = v / 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const alfa = c => { const m = c.match(/[\d.]+/g); return m && m.length > 3 ? +m[3] : 1; };
  const fundo = el => { for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (alfa(c) > 0.5) return c; } return 'rgb(255,255,255)'; };
  const contraste = [], abaixo7 = [];
  const w = document.createTreeWalker(tela, NodeFilter.SHOW_TEXT);
  for (let n; (n = w.nextNode());) { const e = n.parentElement; if (!e || !n.textContent.trim() || !vis(e)) continue;
    const cs = getComputedStyle(e); const L1 = lum(cs.color), L2 = lum(fundo(e)); if (L1 === null || L2 === null) continue;
    const k = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05); const px = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700;
    const min = (px >= 24 || (bold && px >= 18.66)) ? 3 : 4.5; const t = n.textContent.trim().slice(0, 40);
    if (k < min) contraste.push({t, k: +k.toFixed(2), px, peso: cs.fontWeight}); else if (k < 7) abaixo7.push({t, k: +k.toFixed(2)});
    if (px < 15) contraste.push({t, k: 'fonte', px}); if (+cs.fontWeight < 400) contraste.push({t, k: 'peso', peso: cs.fontWeight}); }
  const partidas = [];  // palavra quebrada no meio (uma palavra em mais de uma linha)
  const wp = document.createTreeWalker(tela, NodeFilter.SHOW_TEXT);
  for (let n; (n = wp.nextNode());) { const e = n.parentElement; if (!e || !vis(e)) continue;
    const re = /[^\s\-‐\/·]{2,}/g; let m;
    while ((m = re.exec(n.textContent))) { const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length);
      const ys = new Set([...r.getClientRects()].filter(q => q.width > 0.5).map(q => Math.round(q.top)));
      if (ys.size > 1) partidas.push(m[0]); } }
  const chaves = [...tela.querySelectorAll('*')].filter(e => e.children.length === 0 && /^\[[\w.\-]+\]$/.test((e.textContent || '').trim())).map(e => e.textContent.trim());
  return {partidas: [...new Set(partidas)].slice(0, 20), h1: document.querySelectorAll('h1').length, mascotes: tela.querySelectorAll('.cg-mascote').length, chaves, pequenos, vaos: vaos.slice(0, 20),
          principais, cortados: [...new Set(cortados)].slice(0, 20), rolagemHorizontal: rolH, contraste: contraste.slice(0, 30), abaixo7: abaixo7.slice(0, 15),
          lang: document.documentElement.lang, titulo: document.title};
}"""


def capturar(pg, png):
    """Captura a tela do app como aparece e, se .cg-rolagem rola, também a rolagem inteira em faixas coladas (-inteira)."""
    alvo = pg.locator(".cg-tela").first if pg.locator(".cg-tela").count() else pg.locator("body")
    info = pg.evaluate("() => { const r = document.querySelector('.cg-rolagem'); return r ? [r.scrollHeight, r.clientHeight] : [0, 0]; }")
    total, vis = info
    alvo.screenshot(path=str(png))  # a tela como aparece, sem rolar
    if not total or total <= vis + 1:
        return
    png = png.with_name(png.stem + "-inteira.png")  # a rolagem inteira colada (as partes fixas se repetem em cada faixa)
    partes, y = [], 0
    while True:
        pg.evaluate(f"document.querySelector('.cg-rolagem').scrollTop = {y}"); pg.wait_for_timeout(120)
        tmp = png.with_name(png.stem + f"-faixa{y}.png"); alvo.screenshot(path=str(tmp))
        partes.append((y, Image.open(tmp).convert("RGB"))); tmp.unlink()
        if y + vis >= total: break
        y = min(y + vis, total - vis)
    esc = partes[0][1].height / vis
    tela = Image.new("RGB", (partes[0][1].width, round(total * esc)), "white")
    for y, im in partes: tela.paste(im, (0, round(y * esc)))
    tela.save(png)
    pg.evaluate("document.querySelector('.cg-rolagem').scrollTop = 0")


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("direcao"); ap.add_argument("saida")
    ap.add_argument("--telas", default="")
    ap.add_argument("--fontes", default="100,130,200")
    ap.add_argument("--temas", default="claro,escuro")
    ap.add_argument("--extra", default="", help='parâmetros a mais no endereço de cada tela, por exemplo "paleta=mar"')
    ap.add_argument("--http", action="store_true", help="serve a pasta dos protótipos por http://127.0.0.1:8766 em vez de file://")
    a = ap.parse_args()
    pasta = pathlib.Path(a.direcao).resolve(); raiz = pasta.parent
    out = pathlib.Path(a.saida); out.mkdir(parents=True, exist_ok=True)
    telas = [t for t in TELAS if not a.telas or t.split("-")[0] in a.telas.split(",") or t in a.telas.split(",")]
    srv = None
    if a.http:
        srv = subprocess.Popen([sys.executable, "-m", "http.server", "8766", "--bind", "127.0.0.1", "-d", str(raiz)],
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1.5)
        base = f"http://127.0.0.1:8766/{pasta.name}/"
    else:
        base = pasta.as_uri() + "/"
    linhas = []
    try:
        with sync_playwright() as p:
            b = p.chromium.launch(channel="chrome")
            for t in telas:
                arq = pasta / f"{t}.html"
                if not arq.exists():
                    linhas.append(f"{t}: ARQUIVO AUSENTE"); continue
                for tema in a.temas.split(","):
                    for fonte in a.fontes.split(","):
                        ctx = b.new_context(viewport={"width": 1280, "height": 900}, device_scale_factor=2)
                        pg = ctx.new_page(); erros, externos = [], []
                        pg.on("console", lambda m: erros.append(f"{m.type}: {m.text}") if m.type in ("error", "warning") else None)
                        pg.on("pageerror", lambda e: erros.append("exceção: " + str(e)))
                        origem = base.split("/", 3)[:3]
                        pg.on("request", lambda r: externos.append(r.url) if not r.url.startswith(("file:", "data:", "blob:")) and r.url.split("/", 3)[:3] != origem else None)
                        pg.on("requestfailed", lambda r: erros.append("falhou: " + r.url))
                        pg.goto(f"{base}{t}.html?novo=1&avaliador=0&tema={tema}&fonte={fonte}" + (f"&{a.extra}" if a.extra else ""), wait_until="networkidle")
                        pg.wait_for_timeout(300)
                        m = pg.evaluate(MEDIR)
                        rot = f"{t}-{tema}-{fonte}"
                        png = out / f"{rot}.png"
                        capturar(pg, png)
                        if t.startswith("04") and fonte in ("100", "200"):
                            ImageOps.grayscale(Image.open(png)).save(out / f"{rot}-cinza.png")
                        linhas.append(f"== {rot}  h1={m['h1']}  mascotes={m['mascotes']}  lang={m['lang']}  titulo={m['titulo']!r}  "
                                      f"rolagem_horizontal={'SIM' if m['rolagemHorizontal'] else 'nao'}  erros={len(erros)}  externos={len(externos)}")
                        for k in ("chaves", "partidas", "pequenos", "vaos", "cortados", "contraste"):
                            if m[k]: linhas.append(f"   {k}: {m[k]}")
                        if m["principais"]: linhas.append(f"   botoes>=48 (topo; ação principal abaixo de 506): {m['principais']}")
                        if m["abaixo7"]: linhas.append(f"   texto entre 4,5 e 7:1 (conferir se é texto principal): {m['abaixo7']}")
                        for e in erros: linhas.append(f"   erro: {e}")
                        for e in sorted(set(externos)): linhas.append(f"   externo: {e}")
                        ctx.close()
            b.close()
    finally:
        if srv: srv.terminate()
    (out / "medicao.txt").write_text("\n".join(linhas), encoding="utf-8")
    print("\n".join(linhas))


if __name__ == "__main__":
    main()

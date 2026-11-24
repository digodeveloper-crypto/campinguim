"""Lista os controles de cada tela de uma direção (nome acessível, destino) e segue cliques pedidos.
Uso: python -I navegar.py <pasta da direção> listar
     python -I navegar.py <pasta da direção> seguir "<tela>|<regex do nome>[|<regex do nome>...]" ...
Cada caminho começa na tela pedida (?novo=1&avaliador=0), clica no controle cujo nome acessível casa com cada regex,
em ordem, só dentro de .cg-tela, e informa a tela de chegada (data-tela) e o endereço."""
import sys, re, pathlib
from playwright.sync_api import sync_playwright
sys.stdout.reconfigure(encoding="utf-8")
pasta = pathlib.Path(sys.argv[1]).resolve(); modo = sys.argv[2]
TELAS = sorted(p.name for p in pasta.glob("[01]*.html")) + ["identidade.html"]
NOMES = r"""(el) => { const t = el.getAttribute('aria-label') || el.innerText || ''; return t.trim().replace(/\s+/g, ' '); }"""
with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome"); pg = b.new_page(viewport={"width": 1280, "height": 900}); err = []
    pg.on("pageerror", lambda e: err.append(str(e)))
    def abrir(t): pg.goto(pasta.as_uri() + "/" + t + "?novo=1&avaliador=0", wait_until="networkidle"); pg.wait_for_timeout(200)
    if modo == "listar":
        for t in TELAS:
            abrir(t)
            cs = pg.evaluate(r"""() => [...document.querySelectorAll('.cg-tela a[href], .cg-tela button, .cg-tela [role=button], .cg-tela summary')]
              .filter(e => e.getClientRects().length && !e.closest('[hidden],[inert]'))
              .map(e => (e.tagName[0] + ':' + (e.getAttribute('aria-label') || e.innerText || '').trim().replace(/\s+/g,' ').slice(0,50) + (e.getAttribute('href') ? ' -> ' + e.getAttribute('href') : '') + (e.hasAttribute('aria-pressed') ? ' [pressed=' + e.getAttribute('aria-pressed') + ']' : '') + (e.hasAttribute('aria-expanded') ? ' [expanded=' + e.getAttribute('aria-expanded') + ']' : '')))""")
            print("##", t, "|", " ; ".join(dict.fromkeys(cs)))
    else:
        for caminho in sys.argv[3:]:
            partes = caminho.split("|"); abrir(partes[0]); ok = True
            for rx in partes[1:]:
                alvos = pg.locator(".cg-tela a[href], .cg-tela button, .cg-tela [role=button], .cg-tela summary")
                achou = None
                for i in range(alvos.count()):
                    e = alvos.nth(i)
                    if not e.is_visible(): continue
                    nome = e.evaluate(NOMES)
                    if re.search(rx, nome, re.I): achou = e; break
                if not achou: print(f"FALHOU {caminho}: nada casa com /{rx}/ em {pg.url.split('/')[-1]}"); ok = False; break
                achou.click(); pg.wait_for_timeout(350)
            if ok:
                tela = pg.evaluate("document.body.dataset.tela"); foco = pg.evaluate("document.activeElement && (document.activeElement.getAttribute('aria-label')||document.activeElement.innerText||document.activeElement.tagName).slice(0,40)")
                dlg = pg.evaluate("[...document.querySelectorAll('[role=dialog]')].filter(d=>d.getClientRects().length).map(d=>d.getAttribute('aria-labelledby')||'sem-rotulo')")
                print(f"{caminho}  =>  tela {tela}  ({pg.url.split('/')[-1]})  dialogo={dlg} foco={foco!r}")
    if err: print("exceções:", err)
    b.close()

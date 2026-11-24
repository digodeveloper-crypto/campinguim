"""Lê a tela 4 de uma direção (todas as categorias abertas) e compara cada item com dados.js;
mostra também o texto principal das telas 10, 11, 12 e 13.
Uso: python -I conferir_lista.py <pasta da direção> [seletor dos links de item, padrão: a[href^="05-item"]]"""
import sys, pathlib, subprocess, json
from playwright.sync_api import sync_playwright
sys.stdout.reconfigure(encoding="utf-8")
pasta = pathlib.Path(sys.argv[1]).resolve(); sel = sys.argv[2] if len(sys.argv) > 2 else 'a[href^="05-item"]'
js = ("global.window={};require('./_compartilhado/dados.js');const L=window.CAMPINGUIM_DADOS.lista;const o=[];"
      "for(const c of L.categorias)for(const i of c.itens)o.push(i.nome+', '+i.quantidadeTexto+', '+(i.estado==='carro'?'está no carro':'separei, fora do carro'));"
      "console.log(JSON.stringify(o))")
esperado = json.loads(subprocess.run(["node", "-e", js], capture_output=True, text=True, encoding="utf-8", cwd=str(pasta.parent)).stdout)
with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome"); pg = b.new_page(viewport={"width": 1280, "height": 900}); u = pasta.as_uri() + "/"
    pg.goto(u + "04-lista.html?novo=1&avaliador=0"); pg.wait_for_timeout(300)
    n = pg.locator(".cg-tela [aria-expanded]").count()
    for i in range(n):
        e = pg.locator(".cg-tela [aria-expanded]").nth(i)
        if e.get_attribute("aria-expanded") == "false" and e.is_visible(): e.click(); pg.wait_for_timeout(60)
    nomes = pg.evaluate("s => [...document.querySelectorAll('.cg-tela ' + s)].map(a => a.getAttribute('aria-label') || a.innerText)", sel)
    print("itens na tela:", len(nomes), "| iguais a dados.js:", nomes == esperado)
    for a, e in zip(nomes, esperado):
        if a != e: print("  difere:", repr(a), "esperado", repr(e))
    print("categorias:", pg.evaluate(r"[...document.querySelectorAll('.cg-tela [aria-expanded]')].map(b => (b.getAttribute('aria-label') || b.innerText).replace(/\s+/g, ' '))"))
    for t in ["10-fato.html", "11-grupo.html", "12-gastos.html", "13-camping-sem-dados.html"]:
        pg.goto(u + t + "?novo=1&avaliador=0"); pg.wait_for_timeout(250)
        print("##", t, pg.locator(".cg-tela").inner_text().replace("\n", " | ")[:900])
    b.close()

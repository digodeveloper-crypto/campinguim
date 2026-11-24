r"""Renderiza arte do mascote (SVG ou PNG) em PNG para o olho ver de verdade.

Uso (de qualquer pasta, Windows, Python 3.12 + Pillow; usa o Google Chrome ou o Edge instalado):
  python -I design\mascote\ferramentas\render.py <arquivo.svg|arquivo.png|pasta> [--saida PASTA] [--fundo transparente|claro|escuro]

Para cada arquivo de arte gera, na pasta de saída (padrão: <pasta da arte>\_render\):
  <nome>-grande.png   1024 x 1024, a arte inteira encaixada com margem zero (a margem de segurança é da própria prancha)
  <nome>-48.png       48 x 48 REAIS: o navegador desenha a arte em 48 px (nada de reduzir depois)
  <nome>-48x8.png     os mesmos 48 px ampliados 8x sem suavizar, para ver cada pixel
  <nome>-cinza.png    a versão grande em tons de cinza (teste de não depender de cor)
Quando recebe uma pasta, gera também prancha.png: todos os arquivos lado a lado (256 px + 48 px reais), para comparar.

Fundo: transparente (padrão) para conferir a arte isolada; claro (#FFFFFF) e escuro (#121212) para ver contraste.
A bateria completa do QA (sol forte, silhueta, máscara redonda, grade entre apps, claro e escuro) é a de
design\mascote\qa\captura.py; este script é o ciclo rápido do designer: desenhar, renderizar, olhar, corrigir.
"""
import sys, os, argparse, base64, mimetypes, pathlib, subprocess, tempfile, shutil
from PIL import Image, ImageOps

FUNDOS = {"transparente": "transparent", "claro": "#FFFFFF", "escuro": "#121212"}
EXTENSOES = {".svg", ".png"}


def achar_navegador():
    candidatos = [
        os.environ.get("CAMPINGUIM_CHROME", ""),
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    ]
    for c in candidatos:
        if c and os.path.isfile(c):
            return c
    sys.exit("Nenhum Chrome ou Edge encontrado. Defina CAMPINGUIM_CHROME com o caminho do chrome.exe.")


def html_arte(arquivo: pathlib.Path, lado: int, fundo: str) -> str:
    mime = mimetypes.guess_type(str(arquivo))[0] or "image/png"
    src = f"data:{mime};base64," + base64.b64encode(arquivo.read_bytes()).decode()
    return (f"<!doctype html><html><head><meta charset='utf-8'></head>"
            f"<body style='margin:0;background:{fundo};overflow:hidden'>"
            f"<img src='{src}' style='display:block;width:{lado}px;height:{lado}px;object-fit:contain'>"
            f"</body></html>")


def capturar(navegador: str, html: str, lado: int, destino: pathlib.Path, pasta_tmp: pathlib.Path):
    pagina = pasta_tmp / f"{destino.stem}-{lado}.html"
    pagina.write_text(html, encoding="utf-8")
    cmd = [navegador, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
           "--disable-extensions", "--default-background-color=00000000",
           f"--window-size={lado},{lado}", f"--screenshot={destino.resolve()}", pagina.resolve().as_uri()]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if not destino.exists():
        sys.exit(f"Falha ao renderizar {destino.name}:\n{r.stderr[-800:]}")


def renderizar(arquivo: pathlib.Path, saida: pathlib.Path, fundo: str, navegador: str, pasta_tmp: pathlib.Path):
    nome = arquivo.stem
    cor = FUNDOS[fundo]
    grande = saida / f"{nome}-grande.png"
    p48 = saida / f"{nome}-48.png"
    capturar(navegador, html_arte(arquivo, 1024, cor), 1024, grande, pasta_tmp)
    capturar(navegador, html_arte(arquivo, 48, cor), 48, p48, pasta_tmp)
    im48 = Image.open(p48).convert("RGBA")
    assert im48.size == (48, 48), im48.size
    im48.resize((384, 384), Image.NEAREST).save(saida / f"{nome}-48x8.png")
    img = Image.open(grande).convert("RGBA")
    cinza = ImageOps.grayscale(img).convert("RGBA")
    cinza.putalpha(img.getchannel("A"))
    cinza.save(saida / f"{nome}-cinza.png")
    return grande, p48


def prancha(itens, saida: pathlib.Path, fundo: str):
    """Contact sheet: miniatura de 256 px e o 48 px real de cada arquivo, com o nome embaixo."""
    from PIL import ImageDraw
    larg, alt = 300, 360
    cor = (255, 255, 255, 255) if fundo != "escuro" else (18, 18, 18, 255)
    texto = (20, 20, 20, 255) if fundo != "escuro" else (235, 235, 235, 255)
    folha = Image.new("RGBA", (larg * max(1, len(itens)), alt), cor)
    d = ImageDraw.Draw(folha)
    for i, (nome, grande, p48) in enumerate(itens):
        g = Image.open(grande).convert("RGBA").resize((256, 256), Image.LANCZOS)
        folha.alpha_composite(g, (i * larg + 22, 16))
        s = Image.open(p48).convert("RGBA")
        folha.alpha_composite(s, (i * larg + 22, 290))
        d.text((i * larg + 80, 300), nome, fill=texto)
    folha.save(saida / "prancha.png")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("alvo", help="arquivo .svg/.png ou pasta com arquivos de arte")
    ap.add_argument("--saida", help="pasta de saída (padrão: <pasta da arte>\\_render)")
    ap.add_argument("--fundo", choices=list(FUNDOS), default="transparente")
    a = ap.parse_args()
    alvo = pathlib.Path(a.alvo)
    if not alvo.exists():
        sys.exit(f"Não existe: {alvo}")
    arquivos = sorted(p for p in alvo.iterdir() if p.suffix.lower() in EXTENSOES) if alvo.is_dir() else [alvo]
    if not arquivos:
        sys.exit("Nenhum .svg ou .png na pasta.")
    saida = pathlib.Path(a.saida) if a.saida else (alvo if alvo.is_dir() else alvo.parent) / "_render"
    saida.mkdir(parents=True, exist_ok=True)
    navegador = achar_navegador()
    pasta_tmp = pathlib.Path(tempfile.mkdtemp(prefix="campinguim-render-"))
    try:
        itens = []
        for arq in arquivos:
            g, p = renderizar(arq, saida, a.fundo, navegador, pasta_tmp)
            itens.append((arq.stem, g, p))
            print(f"{arq.name}: {g.name} (1024), {p.name} (48 reais), {arq.stem}-48x8.png, {arq.stem}-cinza.png")
        if alvo.is_dir():
            prancha(itens, saida, a.fundo)
            print(f"prancha.png com {len(itens)} arquivo(s)")
        print(f"saida: {saida.resolve()}  exit=0")
    finally:
        shutil.rmtree(pasta_tmp, ignore_errors=True)


if __name__ == "__main__":
    main()

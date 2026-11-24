"""uso: python fidelidade.py <pasta dos PNG do vetor (design/mascote/final/png/claro)> <pasta dos quadros> <saida.png>
Folha de fidelidade do MSC-14: em cima o desenho aprovado, embaixo o quadro 3D; todas as células com 540 x 540 px.
Pares: 0 (neutro, três quartos) | 60 (alegre, acenando) | 105 (alegre, durante o "por dentro") | 149 (alegre, fim, cores originais)."""
import sys

from PIL import Image

vet, quad, saida = sys.argv[1], sys.argv[2], sys.argv[3]
pares = [("vista-tres-quartos-1024.png", "q000.png"), ("expressoes/expressao-alegre-1024.png", "q060.png"),
         ("expressoes/expressao-alegre-1024.png", "q105.png"), ("expressoes/expressao-alegre-1024.png", "q149.png")]
C = 540
fundo = (17, 24, 39)
folha = Image.new("RGB", (C * len(pares), C * 2), fundo)
for i, (v, q) in enumerate(pares):
    a = Image.open(f"{vet}/{v}").convert("RGBA")
    base = Image.new("RGBA", a.size, fundo + (255,))
    base.alpha_composite(a)
    folha.paste(base.convert("RGB").resize((C, C)), (i * C, 0))
    b = Image.open(f"{quad}/{q}").convert("RGB").crop((0, 450, 1080, 1530))  # quadrado 1080 x 1080 em volta do mascote
    folha.paste(b.resize((C, C)), (i * C, C))
folha.save(saida)
print(saida, folha.size)

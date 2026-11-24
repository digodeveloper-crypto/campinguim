"""uso: python checa_quadros.py <pasta> [folha.png]
Média e desvio-padrão de brilho de cada PNG da pasta; sai com erro se algum quadro for vazio/branco/preto.
Se receber um segundo argumento, também monta a folha de conferência (todos os quadros lado a lado)."""
import glob
import os
import sys

import numpy as np
from PIL import Image

pasta = sys.argv[1]
arqs = sorted(glob.glob(os.path.join(pasta, "*.png")))
ruim = 0
imgs = []
for a in arqs:
    im = Image.open(a).convert("RGB")
    imgs.append(im)
    x = np.asarray(im.convert("L"), dtype=np.float32)
    m, d = x.mean(), x.std()
    ok = 8 < m < 245 and d > 12
    ruim += not ok
    print(f"{os.path.basename(a):10s} media={m:6.1f} desvio={d:5.1f} {'ok' if ok else 'VAZIO'}")
tamanhos = {im.size for im in imgs}
if len(tamanhos) > 1:
    print("ERRO: imagens de tamanhos diferentes na pasta:", sorted(tamanhos), "- nenhuma folha gerada")
    sys.exit(2)
if len(sys.argv) > 2 and imgs:
    w = 300
    h = int(imgs[0].height * w / imgs[0].width)
    folha = Image.new("RGB", (w * len(imgs), h))
    for i, im in enumerate(imgs):
        folha.paste(im.resize((w, h)), (i * w, 0))
    folha.save(sys.argv[2])
print("quadros:", len(arqs), "vazios:", ruim)
sys.exit(1 if ruim else 0)

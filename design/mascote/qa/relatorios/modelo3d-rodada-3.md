# Modelo 3D do mascote 03 (MSC-10) · rodada 3, correção das pupilas · APROVADO

Data: 2026-11-24 · Entregue por: pane-620 · Base: adendo de `modelo3d-rodada-2.md`; `videos/qa/relatorios/VID-01-etapa2-rodada-1.md`, item 3.

**Resumo:** as duas pupilas agora leem o mesmo tom escuro sob luz da esquerda, da direita e de frente. Antes, com luz lateral, a diferença era de 30 em 255; agora é 0. A comparação campo a campo com o GLB aprovado mostra só as duas mudanças declaradas. O modelo regerado do zero sai com o mesmo SHA-256 do entregue.

**Evidência:** `qa/relatorios/modelo3d-r3/olhos-tres-luzes.png`, render do QA no three.js 0.170. Em cima, o GLB anterior (`dd9a7820…`); embaixo, o novo (`a51fb8af…`). Alegre e surpreso, com luz da esquerda, de frente e da direita.

| Item | Resultado | Como conferi |
| --- | --- | --- |
| Pupilas iguais | ok: diferença máxima por canal entre as duas pupilas (centro de cada pupila, amostra de 10 × 10 px) **0/255** nas 6 combinações (alegre e surpreso × luz esquerda, frente e direita). No GLB anterior era 30/255 com luz lateral | render e medição do QA |
| Só o declarado mudou | ok: comparei o GLB novo com o aprovado (commit `bc62220`) acessor por acessor e campo por campo do JSON. Mudaram **apenas** (1) as **402 normais** das pupilas em `campinguim.olhos.NORMAL`, agora todas `(0, 0, 1)`, para a frente; e (2) o material `campinguim-olhos`, que perdeu `roughnessFactor: 0.55` e passa ao padrão do glTF, 1,0 (fosco). Cor `#333C45` e metálico 0 iguais. Posições, índices, pesos, alvos de forma, nós, nomes, esqueleto, matrizes de ligação, as 7 animações e as âncoras são **idênticos byte a byte**. Logo, a altura (0,40 m), as 7 expressões, os 7 clipes e as âncoras não mudaram | script do QA |
| Regerável | ok: `construir.py -- C <pasta temporária>` no Blender 5.3.0 gerou o SHA-256 `a51fb8af333b4658e43691eda5000944dcb39945d9dc8db4c4ad3ec090ec4597`, igual ao entregue e ao do `LEIA-ME.md` | execução do QA |
| Documentação | ok: `LEIA-ME.md`, seção 6.2, explica o defeito, a causa, as duas mudanças e o que não mudou, e registra o SHA anterior. As prévias foram refeitas, com `previas/olhos-luz-lateral.png` nova | leitura |

**Efeito colateral aceito:** o material é compartilhado pelas pupilas, pelos traços (arcos, sobrancelhas, pálpebras) e pela boca. Tudo o que é escuro no rosto fica igualmente fosco, mais perto da cor chapada do vetor. Os traços mantêm o relevo das normais.

**Para o vídeo:** `videos/public/modelos/campinguim.glb` precisa ser o novo (`a51fb8af…`). O piloto informou que o render passa a copiar o GLB de `design/mascote/3d/` a cada execução; o QA confere o SHA na rodada 2 do vídeo.

# VID-01 · prova de vídeo 3D de 5 segundos (objeto em código) · rodada 2 · APROVADO

Data: 2026-11-24 · Entregue por: pane-585 (piloto pane-584), repassado pelo pane-547 · Base: `VID-01-rodada-1.md` (2 itens)

**Resumo:** os dois pontos foram corrigidos, e os cinco itens da seção 13 de `docs/TECNICA-3D.md` passam.
- A legenda tem espaço normal entre as palavras e a pontuação colada.
- A luz agora vem de um ambiente de estúdio gerado em código (RoomEnvironment com PMREM, do three já instalado, nada baixado), mais a direcional para a sombra.
- A repetibilidade foi **remedida pelo QA**. As diferenças entre renders são de rasterização e invisíveis: no pior caso, 2 pixels num cruzamento de linha de 1 pixel com a borda de uma gota. A causa não é de tempo nem de ordem de carga (detalhes abaixo).

Evidências: `videos/qa/relatorios/VID-01-r2/leg36.png` (legenda no MP4 final, 3,6 s) e `VID-01-r2/diff149.png` (quadro 149: render a, render c e diferença ampliada 10 vezes).

## Itens da rodada 1

| # | Item | Resultado | Evidência |
| --- | --- | --- | --- |
| 1 | Espaçamento da legenda | ok: "a condensação." com espaço comum e o ponto colado, no quadro do MP4 final em 3,6 s; o espaçamento ficou uniforme nos quadros de 30 a 135 da folha; o destaque só troca a cor | `VID-01-r2/leg36.png`, `renders/folha.png` |
| 2 | Luz por HDRI | ok: `src/Prova.tsx`, linhas 18 a 47. `RoomEnvironment` do three, por `PMREMGenerator`, como `scene.environment` com intensidade 0,3, mais a direcional principal (2,4) e a contra-luz (0,6). Nenhum arquivo baixado nem de terceiros. A barraca não lava: a folha mostra materiais com leitura de volume | código, `renders/folha.png` |

## Repetibilidade (item 1 da seção 13), medida pelo QA

Os quadros 75 e 149 foram renderizados 4 vezes (a, b, c, d) com `renderizar.mjs`, e cada par foi comparado (2.073.600 pixels por quadro):

| Quadro | Pior par | Pixels diferentes | Diferença máxima por canal |
| --- | --- | --- | --- |
| 75 | a × d | 5 | 1/255 |
| 149 | b × c e c × d | 51 | 26/255 |

**Onde está a diferença de 26/255.** Acima de 2/255 há só **2 pixels**, em (1070, 837) e (1070, 838 a 839). Ficam exatamente onde uma aresta da casca translúcida (`lineBasicMaterial` transparente, linha de 1 pixel) cruza a borda de uma gota na lateral direita. Os outros 49 pixels são de 1/255.

**Causa.** No código não há nada que dependa de tempo ou de sorteio (busca por `Math.random`, `Date`, `performance.now`, `useFrame`, `clock`, `setTimeout`, `requestAnimationFrame`: nada). Tudo é função do quadro. A variação vem da rasterização da GPU (ANGLE) numa linha fina semitransparente sobre a borda antisserrilhada de outro objeto. Ela aparece em 1 de cada 4 renders e não muda a imagem a olho (`diff149.png`).

**Decisão do QA:** aceito como "render igual duas vezes" para esta prova.
- Para o episódio, há uma recomendação que **não reprova**: se as arestas da casca precisarem de render bit a bit, desenhá-las com espessura maior que 1 pixel ou como malha, e não como `line` de 1 pixel, ou dar `renderOrder` fixo às linhas.
- A `NOTAS.md` já registra a medição honesta (seção "Repetibilidade"), sem a afirmação de "0 pixels".

## Os 5 itens da seção 13

| Item | Resultado |
| --- | --- |
| 1. Objeto em código, luz de estúdio (o papel do HDRI) e sombra de contato, render igual duas vezes | ok (acima) |
| 2. Raio-x com destaque e brilho só na peça certa | ok: o emissivo só nas gotas; o resto perde saturação e escurece. Sem mudança desde a rodada 1 |
| 3. Rótulo HTML acompanha a peça | ok: projeção com a mesma `camera(frame)`. Sem mudança |
| 4. Frase narrada com tempos por palavra e legenda que acompanha | ok: espaçamento corrigido; a voz e os tempos não mudaram; a pronúncia foi verificada na rodada 1 por transcrição local, com texto idêntico ao roteiro |
| 5. Final em 1080 × 1920, com áudio, sem quadro em branco | ok: `ffprobe` H.264 1080 × 1920, 30 fps, 150 quadros, 5,000 s; AAC 48 kHz, 5,013 s; volume médio −20,3 dB, pico −4,5 dB. Os 150 quadros extraídos: nenhum liso (menor desvio de luminância 53,8; o último quadro 63,8) |

## Regras do CLAUDE.md e limpeza

- Terceiros: só a Inter (`@fontsource/inter`, OFL, local) e as dependências em `node_modules`. Nenhum modelo, textura, HDRI baixado, música nem imagem.
- Nada fora de `videos/` alterado (`git status` sem mudança em `docs/` nem fora de `design/` e `videos/`).
- Nenhum segredo nos arquivos.
- Os textos de tela estão em pt-BR.
- `ferramentas/__pycache__/` foi apagado.
- Ordem da seção 11 seguida: quadros, folha, baixa, final.

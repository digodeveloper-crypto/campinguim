# VID-01 · prova de vídeo 3D de 5 segundos (objeto em código) · rodada 1 · REPROVADO

Data: 2026-11-24 · Entregue por: pane-585 (missão "Provar vídeo 3D de 5 segundos", piloto pane-584), repassado pelo pane-547.
Critério: os 5 itens da seção 13 de `docs/TECNICA-3D.md` e a ordem da seção 11, mais o CLAUDE.md (nada de terceiros, pt-BR, nenhum segredo). Nesta etapa, o objeto é feito em código e não há mascote.

**Resumo:**
- A base da prova funciona.
  - O raio-x põe destaque e brilho só nas gotas de condensação.
  - O rótulo usa a mesma função de câmera da cena.
  - A voz está certa: a transcrição feita nesta máquina bate palavra por palavra com o roteiro.
  - O vídeo final está em 1080 × 1920 com áudio, sem quadro em branco.
  - Não há terceiros nem rede, e nada foi alterado fora de `videos/`.
- Reprova por **dois pontos**:
  1. na legenda, "a condensação." aparece como "acondensação" com um espaço solto antes do ponto;
  2. o item 1 da seção 13 pede **luz por HDRI**, e a prova não tem HDRI. A divergência foi declarada, mas existe uma saída sem baixar nada.

Evidências: `videos/qa/relatorios/VID-01-r1/legendas.png`; medições abaixo.

## O que precisa mudar

1. **Espaçamento da legenda (item 4).**
   - **Evidência:** `VID-01-r1/legendas.png`, quadro em 3,6 s do MP4 final, e `renders/folha_final.png`, quadros de 105 a 149.
   - **O que se vê:**
     - entre "a" e "condensação" quase não há espaço, e se lê "acondensação";
     - entre "condensação" e o ponto há um espaço;
     - o espaço entre "Sua" e "barraca" é maior que os outros.
   - A palavra em destaque provavelmente muda o espaçamento (margem ou escala do elemento destacado) e come o espaço.
   - **Mudar:**
     - espaço entre palavras igual e fixo, independente do destaque;
     - pontuação colada à palavra;
     - conferir em quadros com e sem destaque.
2. **Luz por HDRI (item 1).**
   - A `NOTAS.md` diz "sem HDRI (proibido baixar)". O three.js já instalado no projeto traz `three/examples/jsm/environments/RoomEnvironment.js`, um ambiente de estúdio **gerado em código** (com PMREM), sem baixar arquivo e sem terceiros novos.
   - **Mudar:**
     - usar o RoomEnvironment como mapa de ambiente da cena, mais a direcional para a sombra, como a seção 7 pede;
     - renderizar de novo os quadros parados;
     - refazer a prova de repetibilidade.
   - Se o responsável preferir manter a luz atual, a decisão é dele. Neste caso, a divergência precisa estar aceita por escrito antes de passar adiante.

## Os 5 itens da seção 13

| Item | Resultado | Evidência |
| --- | --- | --- |
| 1. Objeto em código, luz por HDRI e sombra de contato, render igual duas vezes | **parcial**. Barraca em código ok; sombra de contato por textura radial em código ok; **sem HDRI** (item 2 acima). Repetibilidade **refeita pelo QA**: quadros 75 e 149 renderizados 3 vezes (a, b, c). Diferenças de até 10 pixels, de no máximo 1/255 por canal, numa linha diagonal fina (rasterização), e a contra c deu 0 no quadro 75. É invisível e não há aleatoriedade na cena, então aceito como "igual". A declaração "0 pixels diferentes" não se repetiu sempre | render do QA com `renderizar.mjs` (3 rodadas) |
| 2. Raio-x com destaque e brilho só na peça certa | ok. O `raioX` (0 a 1) controla a transição inteira; cor emissiva `#4FD1FF` só nas gotas (`barraca.condensacao`); sobreteto e quarto perdem saturação e escurecem (`Barraca.tsx`, linhas 94 a 139). Visto nos quadros de 45 a 149 | `renders/folha.png`, `src/Barraca.tsx` |
| 3. Rótulo HTML acompanha a peça | ok. `projetar()` usa a mesma `camera(frame)` da cena (`camera.ts`) e prende o rótulo à posição 3D da condensação, já com o sobreteto erguido. Nos quadros de 60 a 149 o rótulo acompanha as gotas enquanto a câmera gira e aproxima | `src/camera.ts`, `src/Prova.tsx` linha 113, `renders/folha_final.png` |
| 4. Frase narrada com tempos por palavra e legenda que acompanha | **falha** no espaçamento (item 1 acima). Tempos ok: `palavras.json` tem 11 palavras (WordBoundary do edge-tts), e a legenda e o áudio usam o mesmo atraso de 0,2 s (`ATRASO_VOZ`). **Pronúncia verificada:** transcrição local do áudio do MP4 final com faster-whisper `medium` e `large-v3` (modelos já instalados, sem download, sem rede): os dois devolveram exatamente "Sua barraca molha por dentro, mesmo sem chuva. É a condensação.". Os tempos da transcrição ficam a até ~0,2 s dos da legenda | transcrição do QA, `audio/palavras.json` |
| 5. Final em 1080 × 1920, com áudio, sem quadro em branco | ok. `ffprobe`: H.264 1080 × 1920, 30 fps, 150 quadros, 5,000 s; AAC 48 kHz estéreo, 5,013 s; volume médio −20,3 dB, pico −4,5 dB. Os 150 quadros extraídos do MP4: nenhum liso (menor desvio-padrão de luminância 45,4; último quadro, 4,97 s, com desvio 55,1). Silêncio no fim de 4,15 s a 5,01 s, para não cortar a sílaba. A versão em baixa (540 × 960, 150 quadros) existe | medições do QA |

## Pontos fracos apontados pelo piloto do vídeo

| Ponto | Resultado |
| --- | --- |
| a) último quadro | conferido: não está em branco (desvio 55,1), mostra a cena completa; a legenda já saiu, depois da fala |
| b) pronúncia | verificada por transcrição local, dois modelos, texto idêntico ao roteiro |
| c) "a condensação." sem espaço | confirmado: é o item 1 |
| d) terceiros e rede | ok. `public/` só tem `audio/voz.wav` (gerado); nenhum modelo, textura, HDRI, música ou imagem. Fonte Inter por `@fontsource/inter` 5.2.8 (OFL), local. Nenhum `http`, `fetch(`, `XMLHttpRequest` ou `import(` em `src/`, `remotion.config.ts` e `renderizar.mjs`; só a geração da voz usa a rede. Termo de uso comercial do edge-tts a conferir antes de publicar, como a `NOTAS.md` registra |
| e) nada fora de `videos/`; segredos | ok. `git status` sem mudança fora de `design/` e `videos/` (nada em `docs/`); nenhuma chave, senha ou token nos arquivos do projeto do vídeo (fora `node_modules`) |

## Observações (não reprovam)

- O título fixo ("Não é chuva. É condensação.") repete a narração com outras palavras e está em pt-BR. Ok.
- Ordem da seção 11 seguida: quadros, folha, baixa, final.
- `videos/ferramentas/__pycache__/` está na pasta. É temporário e deve sair antes da entrega final.

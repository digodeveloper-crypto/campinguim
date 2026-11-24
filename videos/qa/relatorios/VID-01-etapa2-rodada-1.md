# VID-01 · etapa 2 = MSC-14 · teste de 5 s com o mascote (cena B) · rodada 1 · REPROVADO (3 itens)

Data: 2026-11-24 · Entregue pela missão do vídeo (piloto pane-584), repassado pelo pane-547
Base: `docs/TECNICA-3D.md`, seção 13 (5 itens); MSC-14 (fidelidade ao desenho escolhido: opção 03, variante C aceita); `CLAUDE.md`; `design/mascote/qa/relatorios/modelo3d-rodada-2.md`.

**Resumo:**
- **O que está certo:**
  - tamanho: o mascote ocupa de 38 a 40,5 % da altura do quadro, como pedido;
  - expressões neutro e alegre, iguais às do vetor;
  - a fala exata, com legenda por palavra;
  - o "por dentro" só no gorro, com o rótulo "Gorro de lã" preso à âncora;
  - 1080 × 1920, 30 fps, 150 quadros, com áudio.
- **O que trava:**
  1. no **quadro 3 do vídeo final o mascote some**: só aparecem o fundo e a sombra. A versão de baixa resolução não tem o problema;
  2. depois do "por dentro" (de 2,1 s até o fim, 58 % do vídeo), o mascote fica quase preto, com pés bege e bico cinza, e **termina longe do desenho aprovado**;
  3. **uma pupila sai cinza-clara e a outra escura** em todos os quadros. No desenho, as duas são do mesmo `#333C45`.

**Evidências** em `videos/qa/relatorios/VID-01-e2-r1/`:
- `quadro3.png`: quadro 3 do MP4 final, sem o mascote;
- `olhos.png`: olhos nos quadros 0, 45, 60 e 149, ampliados;
- `q060-q149.png`: antes e depois do "por dentro", lado a lado.

## Itens que reprovam

| # | Item | Onde e como medi | O que fazer |
| --- | --- | --- | --- |
| 1 | **Quadro sem o mascote (seção 13, itens 1 e 5)** | Extraí os 150 quadros do `final/mascote3d.mp4`. O quadro 3 (0,10 s) tem desvio de luminância 7,0, contra 48 dos vizinhos: só fundo, sombra de contato e rodapé, sem o mascote (`quadro3.png`). Os 150 quadros do `baixa/mascote_baixa.mp4` estão todos certos. É uma falha intermitente de carga ou de montagem no render paralelo. A amostra de repetibilidade (quadros 0, 75 e 149) não a pegava | Achar a causa: por exemplo, `continueRender` chamado antes de a cena com o GLB estar montada e desenhada numa das abas do render paralelo. A espera tem de cobrir o GLB carregado, adicionado à cena e com um quadro desenhado. Depois, renderizar de novo e conferir **todos** os 150 quadros, não só uma amostra (por exemplo, desvio mínimo por quadro, ou o mascote presente em cada um) |
| 2 | **Fim do vídeo longe do desenho (MSC-14)** | Do quadro 63 ao 149, o "resto" perde 60 % da saturação e escurece 35 %: o corpo `#4A5560` vira quase preto, os pés `#E4A33A` viram bege e o bico perde o laranja (`q060-q149.png`). O destaque do gorro funciona, mas o mascote fica assim por 2,9 s e é assim que o vídeo termina. A seção 13, item 2, pede o destaque na peça certa, e não um mascote sem cor por mais da metade do teste de fidelidade | Escurecer e dessaturar bem menos durante o destaque (por exemplo, no máximo 25 % de saturação e 15 % de brilho), **e devolver as cores originais** antes do fim (por exemplo, de 3,8 a 4,3 s), para o vídeo terminar com o mascote igual ao desenho, de gorro de volta ao normal ou ainda translúcido com o rótulo. A folha de fidelidade precisa ter um quadro do fim com as cores originais |
| 3 | **Pupilas de tons diferentes (MSC-14)** | Em todos os quadros (0, 45, 60, 149), a pupila à direita da tela (esquerda do personagem) sai cinza-média e a outra quase preta (`olhos.png`). No vetor, as duas são `#333C45`. **Causa:** as normais das pupilas no GLB são simétricas (conferi: ±0,2 em X, 0,76 em Z). As pupilas são discos planos, um pouco virados para fora, com material `campinguim-olhos` de rugosidade 0,55. A luz principal vem de um lado, então a pupila virada para ela reflete e clareia. **O mesmo efeito já aparecia nos renders do QA na aprovação do modelo 3D, e eu não o apontei: falha minha na rodada 2 do modelo** | Duas saídas, a escolher pelo piloto: (a) **no modelo** (melhor para todos os usos): material dos olhos fosco (rugosidade 1, sem reflexo do ambiente) e/ou pupilas viradas para a frente; ou (b) **só no vídeo**: sobrescrever o material dos olhos na cena. Nos dois casos, as duas pupilas têm de ler o mesmo tom escuro em todos os quadros. Com (a), o modelo volta ao QA para uma conferência curta (SHA novo, olhos iguais) |

## O que passou

| Item | Resultado | Como conferi |
| --- | --- | --- |
| Arquivo final | ok: H.264 1080 × 1920, 30 fps, 150 quadros, 5,000 s; AAC 48 kHz, 5,013 s; volume médio −20,9 dB, pico −4,6 dB | `ffprobe`, `volumedetect` |
| Tamanho (pedido do responsável) | ok: do topo do gorro à base dos pés, 731 px no quadro 0, 758 no 45 e 777 no 60, de 1920: **38,1 %, 39,5 % e 40,5 %** | medição por cor nos quadros |
| Expressões | ok: no quadro 0, neutro (arcos fechados, igual ao vetor `neutro`); nos quadros 45 e 60, alegre (olhos abertos com o arco por cima, igual ao vetor `alegre`), com as sobrancelhas no lugar. No quadro 149 continua alegre | `olhos.png`, `fidelidade.png` |
| Raio-x na peça certa (item 2) | ok quanto à peça: só o gorro fica translúcido, com contorno de Fresnel e o rótulo "Gorro de lã". O problema está no resto (item 2 acima) | `folha_final.png` |
| Rótulo acompanha (item 3) | ok: o rótulo segue a âncora `campinguim.ancora-rotulo` com a respiração (quadros 90 a 149) | `folha_final.png` |
| Fala e legenda (item 4) | ok: o texto é exatamente "Este é o Campinguim. Ele mostra o camping por dentro."; a legenda destaca palavra por palavra; a voz vai de 0 a 3,10 s, com pausa de 0,32 s entre as frases | `silencedetect`, folha |
| GLB | ok: `public/modelos/campinguim.glb` com o SHA-256 aprovado (conferido pelo piloto); o GLB entra sem `gltf-transform`, divergência (b) anotada e aceita | — |
| Regras do CLAUDE.md | ok: textos em pt-BR; nenhum material de terceiros novo (a voz é sintetizada localmente, como na etapa 1) | `NOTAS.md` |

## Pontos pedidos pelo piloto

1. **Cor depois do "por dentro":** é o item 2. Sim, a cor deve voltar antes do fim, e o resto deve escurecer bem menos.
2. **Olho mais claro:** é o item 3. A causa é luz sobre a pupila plana e reflexiva, e não a dessaturação. Já aparecia no modelo, e eu não apontei na aprovação dele.
3. **Silêncio de 1,9 s no fim, sem legenda:** não reprova. O rótulo "Gorro de lã" precisa de tempo de leitura, e um respiro no fim é aceitável. Sugestão: começar o "por dentro" junto com a palavra "dentro" (como já é) e encurtar o fim para cerca de 1 s, ou usar esse tempo para a volta das cores do item 2.
4. **Expressões:** batem (ver "O que passou"). A folha de fidelidade compara o quadro 149 (alegre) com o vetor **neutro**. Troque a referência para o vetor `alegre`.
5. **Tamanho:** 38 a 40,5 % da altura, dentro do pedido.

## Observação

- A amostra de repetibilidade 3 × 3 (quadros 0, 75 e 149) não pega falhas intermitentes como a do item 1. Para a rodada 2, confira os 150 quadros do MP4 final por script.

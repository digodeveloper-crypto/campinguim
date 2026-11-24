# VID-01 · Prova de 5 segundos (objeto em código)

Cena: barraca em código, efeito "por dentro", rótulo preso à peça, voz edge-tts, legenda palavra por palavra, 1080 × 1920, 30 fps.

## Como rodar

```
cd videos && npm install
python ferramentas/voz_edge.py audio pt-BR-ThalitaMultilingualNeural +15%   # lê audio/roteiro.json (cópia de textos/roteiro.json)
cp audio/voz.wav public/audio/voz.wav; cp audio/palavras.json audio/falas.json src/
node renderizar.mjs quadros renders/quadros 0 30 45 60 75 90 105 120 149
python ferramentas/checa_quadros.py renders/quadros renders/folha.png
node renderizar.mjs video renders/baixa/prova_baixa.mp4 0.5
node renderizar.mjs video renders/final/prova3d.mp4 1
```

## Divergências da TECNICA-3D.md

- Seção 9: voz e tempos vêm do edge-tts (voz_edge.py copiado e adaptado da fábrica), não de Kokoro/Whisper.cpp. O tempo de cada palavra é o WordBoundary da própria Microsoft. O texto da legenda é o do roteiro.
- Pacotes: Remotion 4.0.546 (a doc cita "4"). `@remotion/three` 4.0.546 com three 0.170.0 e @react-three/fiber 8.18.0 (fixados, sem `^`).
- Seção 3: `npx remotion skills add` não foi rodado (sem instalar nada além das dependências do projeto).
- Seção 7 (rodada 2): luz por ambiente de estúdio gerado em código, `RoomEnvironment` de `three/examples/jsm/environments` passado por PMREM como `scene.environment` (intensidade 0,3), no lugar do HDRI (nada baixado); mais uma direcional principal (sombra/modelagem) e uma de contra-luz. Sombra de contato por textura radial gerada em código; ACES + sRGB no canvas. Sem brilho pós-processado nem profundidade de campo nesta prova: o "brilho" do destaque é emissivo no material.
- Seção 11: a prova renderiza o quadro parado, a folha, o vídeo em baixa e o final, nesta ordem, com um script (`renderizar.mjs`) que empacota uma vez só.
- Duração: o piso é 5 s; cresce se a voz + 0,2 s de respiro + 0,5 s de cauda passar disso.

## Repetibilidade (medida, rodada 2)

Quadros 0, 75 e 149 renderizados 3 vezes (a, b, c) com o mesmo comando; diferença entre pares, em pixels diferentes de 2.073.600 e diferença máxima por canal (0–255):

| Quadro | a×b | a×c | b×c |
| --- | --- | --- | --- |
| 0 | 9 px, máx 1 | 0 px, máx 0 | 9 px, máx 1 |
| 75 | 4 px, máx 1 | 1 px, máx 1 | 5 px, máx 1 |
| 149 | 51 px, máx 26 | 51 px, máx 26 | 0 px, máx 0 |

No quadro 149 a diferença fica numa caixa de 38×48 px na borda direita (x 1040–1077, y 796–843), em torno de uma gota; só 2 pixels passam de 20/255. Não é igualdade bit a bit: é igual a olho, com ruído de rasterização do renderizador.

## Fonte e licenças

- Inter 800/700 latina, pacote `@fontsource/inter` 5.2.8 (SIL OFL 1.1), embutida localmente via npm.
- Modelo, textura, HDRI, música e efeitos: nenhum. Tudo é geometria e cor em código.
- Voz: edge-tts (serviço neural da Microsoft; voz pt-BR-ThalitaMultilingualNeural). Conferir o termo de uso comercial do serviço antes de publicar.

## Pastas que devem ficar FORA do git

`node_modules/`, `renders/` (baixa, final, quadros, folha: a evidência final pode ser copiada para um lugar versionado se o responsável quiser), `audio/` (voz_bruta.wav, voz.wav gerados), `public/audio/`.

---

# VID-01 etapa 2 · o mesmo plano com o mascote (MSC-14)

Composição nova `ProvaMascote` (a `Prova` da barraca continua igual: quadros 45 e 105 renderizados de novo diferem dos aprovados em 16 e 3 pixels, máx. 1/255). Decisão do responsável: opção B, só o mascote, grande no quadro.

- Modelo: `public/modelos/campinguim.glb`, cópia de `design/mascote/3d/campinguim.glb`. **O `renderizar.mjs` copia a fonte para lá no início de TODO render** (quadros ou vídeo, qualquer composição), confere que a cópia tem o mesmo SHA-256 da fonte e imprime `GLB do mascote: ... SHA-256 <hash>`. `public/modelos/` não é versionado, e assim uma cópia velha nunca entra no vídeo. `design/` continua só leitura. Sem Draco, nada da rede.
- Carga (rodada 2 do QA): `GLTFLoader.loadAsync(staticFile())` dentro de um `delayRender` que **só é liberado por `<MascoteDesenhado/>`, dentro do `<ThreeCanvas>`, depois que o mascote está na cena com a pose do quadro e o quadro foi desenhado (`advance`)** (`src/Mascote.tsx`). Na rodada 1 o `continueRender` vinha logo na carga: o `@remotion/three` só redesenha quando o número do quadro muda, então a primeira foto de uma aba do render paralelo podia sair sem o mascote (quadro 3 do final da rodada 1).
- Peças pela `peca()` da seção 8 do PARTES.md (`userData.name`); o osso `gorro` por `getObjectByName('gorro')` (ossos não perdem nome).
- Animação: um `AnimationMixer`, `AnimationClip.findByName`, uma ação só, `mixer.setTime(t)` com `t` calculado do quadro. Ações em `LoopOnce` + `clampWhenFinished`: com o `LoopRepeat` padrão, o último quadro de um ciclo (tempo = duração do clipe) voltaria ao quadro 0.
- Linha do tempo (`src/cameraMascote.ts`, `LINHA`): quadros 0–5 repouso (quadro 0 de `acenar` = repouso); 6–65 `acenar` (60 quadros); 66–149 `parado-respirando` a partir do quadro 1 do ciclo (`(k − 65) % 60`). Expressão `neutro` → `alegre` nos quadros 4–16 e `alegre` até o fim, por `morphTargetDictionary`.
- "Por dentro" (`raioX` sobe de 2,1 s a 3,0 s, na fala "o camping por dentro", e volta a 0 de 3,8 s a 4,3 s, no silêncio do fim; do quadro 129 ao 149 o mascote está com as cores originais e o gorro opaco e no lugar): o gorro sobe 2,5 cm (o osso `gorro`, depois do `setTime`), vira casca translúcida (opacidade 1 → 0,3) com destaque emissivo `#4FD1FF` e contorno com espessura feito no próprio material (borda por Fresnel: a beirada do gorro fica opaca e na cor do destaque). Não há linha de 1 px; o gorro tem `renderOrder` fixo 10. O resto do mascote perde no máximo 25% da saturação e 15% do brilho (na rodada 1 eram 60% e 35%: o corpo ficava quase preto; QA rodada 1, item 2). Durante a transparência, `boca` e `gotas` ficam `visible = false`.
- Rótulo "Gorro de lã": preso à âncora `campinguim.ancora-rotulo` (filha do osso `cabeca`), lida com `getWorldPosition` depois do `setTime` e projetada com a mesma `cameraMascote(frame)` da cena. Entra de 2,7 s a 3,1 s.
- Narração: "Este é o Campinguim. Ele mostra o camping por dentro." (`textos/roteiro_mascote.json`; rótulo e marca em `textos/textos_mascote.json`). Legenda em grupos de 4, 4 e 2 palavras ("Este é o Campinguim." / "Ele mostra o camping" / "por dentro."), com o mesmo componente da barraca (`Legenda` ganhou a opção `grupos`; sem ela, o padrão continua de 3 em 3).

## Como rodar (etapa 2)

```
cp textos/roteiro_mascote.json audio/mascote/roteiro.json
python ferramentas/voz_edge.py audio/mascote pt-BR-ThalitaMultilingualNeural +15%
cp audio/mascote/voz.wav public/audio/mascote/voz.wav; cp audio/mascote/palavras.json audio/mascote/falas.json src/mascote/
COMP=ProvaMascote node renderizar.mjs quadros renders/mascote/quadros 0 15 30 45 60 75 90 105 120 149
python ferramentas/checa_quadros.py renders/mascote/quadros renders/mascote/folha.png
COMP=ProvaMascote node renderizar.mjs video renders/mascote/baixa/mascote_baixa.mp4 0.5
COMP=ProvaMascote node renderizar.mjs video renders/mascote/final/mascote3d.mp4 1
python ferramentas/checa_mascote.py renders/mascote/final/mascote3d.mp4 150   # os 150 quadros, mascote presente em cada um
python ferramentas/fidelidade.py ../design/mascote/final/png/claro renders/mascote/quadros renders/mascote/fidelidade.png
```

`checa_mascote.py` mede, numa região fixa do corpo, a fração de pixels claros em **cada** quadro do vídeo e acusa quadro abaixo de 3% ou abaixo da metade da mediana dos vizinhos (no final da rodada 1 ele acusa o quadro 3 com 0,000). A amostra 3 × 3 de repetibilidade não pega falha intermitente de carga.

`renderizar.mjs` escolhe a composição pela variável `COMP` (padrão `Prova`).

## Repetibilidade e conferência (medidas, etapa 2, rodada 2 do QA)

GLB usado: 1.080.632 bytes, SHA-256 `a51fb8af333b4658e43691eda5000944dcb39945d9dc8db4c4ad3ec090ec4597` (pupilas com normais para a frente e olhos foscos; aprovado pelo QA), impresso pelo `renderizar.mjs` em todos os renders e igual ao de `public/modelos/campinguim.glb`.

Quadros 0, 75 e 149 renderizados 3 vezes (a, b, c); pixels diferentes de 2.073.600 e diferença máxima por canal:

| Quadro | a×b | a×c | b×c |
| --- | --- | --- | --- |
| 0 | 0 px, máx 0 | 0 px, máx 0 | 0 px, máx 0 |
| 75 | 0 px, máx 0 | 41 px, máx 1 | 41 px, máx 1 |
| 149 | 0 px, máx 0 | 0 px, máx 0 | 0 px, máx 0 |

`checa_mascote.py` nos 150 quadros do final: mínimo 0,431 (quadro 15, mascote de três quartos no começo), mediana 0,540, nenhum suspeito. Com o GLB anterior, três finais de teste depois da correção da carga deram 150/150 também (mínimo 0,432). Pupilas no quadro 149: luminância média 43,3 e 43,2 (RGB 38, 44, 50 nas duas).

Rodada 1 (GLB anterior, `dd9a7820…`), para registro: 0 | 9–113 px máx 1 | 29–62 px máx 2.

## Divergências (etapa 2)

- Seção 8 do PARTES.md manda esconder `olhos`, `bico`, `boca` e `gotas` "se o corpo ou a face ficarem translúcidos". Aqui só o gorro fica translúcido, e no `alegre` os olhos (pupilas) e o bico estão em uso: escondê-los apagaria o rosto. Só `boca` e `gotas` (as malhas que no `alegre` estão inteiras escondidas) ficam `visible = false`.
- Pupilas de tons diferentes (QA rodada 1, item 3): corrigidas no modelo pela missão do mascote (GLB `a51fb8af…`). O vídeo não sobrescreve o material dos olhos.
- Seção 8 da TECNICA-3D.md (`gltf-transform`/`gltfjsx`): não usados. O GLB aprovado entra como está (não alterar o modelo), lido em tempo de render pelo `GLTFLoader`.
- O contorno grosso do gorro é borda por Fresnel no shader do material (`onBeforeCompile`), e não linhas de arestas: segue a recomendação do QA da rodada 2 (nada de linha de 1 px semitransparente).
- `ferramentas/qa_voz.py` não roda nesta máquina (falta o pacote `soundfile`, não instalado para não mexer no ambiente). A conferência da pronúncia foi feita com a mesma lógica, decodificando por ffmpeg, com faster-whisper `medium` e `large-v3` locais (sem rede): os dois ouviram exatamente o roteiro, tanto no `voz.wav` quanto no áudio do MP4 final.
- Sem título de gancho no alto da tela: nenhum texto foi definido para isso neste plano; ficam a legenda, o rótulo e a marca.

## Pastas que devem ficar FORA do git (etapa 2)

Além das de cima: `public/modelos/` (cópia do GLB refeita a cada render; a fonte versionada é `design/mascote/3d/`), `renders/mascote/`, `audio/mascote/`, `public/audio/mascote/` (os dois últimos já cobertos pelo `.gitignore`).

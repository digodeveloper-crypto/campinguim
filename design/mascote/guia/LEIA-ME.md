# Campinguim · guia de uso do mascote · MSC-13

- **Requisito:** MSC-13 do PRD ("A entrega inclui um guia de uso do mascote: cores oficiais, proporções, tamanhos mínimos e o que o mascote nunca faz").
- **Data:** 24/11/2026.
- **Mascote:** opção 03, Filhote de gorro (`design/mascote/ESCOLHA.md`).
- **Base:** o pacote final aprovado pelo QA (`design/mascote/final/`, MSC-08, `qa/relatorios/final-rodada-2`).
- **Como abrir:** `guia.html` abre com dois cliques. Funciona no celular e no computador, em tema claro e escuro (automático pelo sistema, ou pelo botão "Tema" no topo), e não usa nada da internet.
- **Escopo:** o guia cobre o mascote em **2D** (seções 1 a 11) e em **3D e vídeo** (seção 12, complemento do MSC-13 depois da aprovação do modelo 3D, rodada 3, e do teste em vídeo, rodada 2).

## 1. Arquivos

| Caminho | O que é |
| --- | --- |
| `guia.html` | o guia: 13 seções (arquivos, cores, versões e contraste, proporções, respiro, tamanhos mínimos, poses, 7 expressões, vistas, ícone, o que nunca faz, 3D e vídeo, decisões provisórias). As imagens da seção 12 vêm de `../3d/previas/` por caminho relativo; não foram copiadas |
| `LEIA-ME.md` | este arquivo |
| `arte/claro/` (11 SVG) e `arte/claro/expressoes/` (7) | cópias byte a byte de `final/vetor/claro/` |
| `arte/escuro/` (11 SVG) e `arte/escuro/expressoes/` (7) | cópias byte a byte de `final/vetor/escuro/` |
| `arte/icone/play/icone-play-512.png`, `arte/icone/ios/icone-app-store-1024.png`, `arte/icone/android/expo-1024/ic_launcher_{foreground,background,monochrome}.png` | cópias byte a byte de `final/icone/` |
| `errado/errado-{cor-trocada,gorro-vermelho,disco-azul,balao,texto}.svg` | **exemplos de erro, nunca usar.** Cada um é o `principal` do pacote final com uma única mudança: troca de cor, gorro vermelho, disco azul atrás, balão de fala, faixa com letreiro. O comentário do topo de cada arquivo diz "EXEMPLO DE ERRO, NUNCA USAR". |
| `medidas/tamanhos-{claro,escuro}-real.png` e `medidas/tamanhos-{claro,escuro}-x4.png` | as capturas que justificam os tamanhos mínimos (seção 3 abaixo) |

As 41 cópias foram conferidas por SHA-256 contra a origem no momento da cópia: 41 de 41 iguais. Na pasta `arte/` nada foi redesenhado.

Outros 4 erros (esticar, girar, espelhar, recortar) e mais 2 (versão clara no escuro sem apoio; transparência) aparecem no guia aplicados por CSS sobre a cópia aprovada, sem criar arquivo.

## 2. De onde vem cada número

| Dado do guia | Origem |
| --- | --- |
| Cores e papéis | `final/LEIA-ME.md` §3; as cinco cores da versão colorida, idem em `prototipos/direcao/direcoes.md` (bloco "O mascote (DSG-13)") |
| Gorro fixo em `#3EA8AE` | P-20 em `prototipos/direcao/telas.md` ("Fixa"); marcado no guia como **decisão provisória**, porque é pergunta em aberto do responsável |
| Contrastes da figura contra branco, creme e `#121212`, do contorno e da uma cor | `final/LEIA-ME.md` §4, recalculados pela fórmula da WCAG |
| Contrastes novos, calculados para este guia: corpo × `#808080` = 1,93:1; fundo mais escuro que dá 3:1 contra o corpo = `#A4A4A4` (3,05:1); uma cor positiva passa em fundo de `#606060` para cima; negativa, de `#949494` para baixo; gorro × creme 2,57:1; pés × creme 1,98:1 | fórmula de contraste da WCAG 2.2 a partir dos hex |
| Limite de 3:1 entre o corpo e o que está atrás | `prototipos/direcao/padrao-producao.md` §6 (apoio ≥ 3:1) e WCAG 2.2, critério 1.4.11 (elementos gráficos) |
| Apoio claro no escuro, 5,59:1 a 6,12:1 | `prototipos/direcao/direcoes.md` e `padrao-producao.md` §6 |
| Proporções (figura 384 × 434; gorro 104 de altura e aba de 300; face 180; olhos 50, a 70 um do outro, traço 14; bico 32 × 23; barriga 220 × 140; nadadeiras 61 × 112; pés 98 × 48; chão em y = 480) | medidas nas coordenadas do `final/vetor/claro/principal.svg` (caixa de cada forma) e na caixa renderizada pelo `captura.py conferir` do QA (64, 46, 448, 480). A caixa por coordenadas usa os pontos de controle das curvas, e por isso pode passar até 2 unidades da curva real. |
| Respiro mínimo 32/512 (1/16) e 16/512 nas poses com parte para fora | `direcao/padrao-producao.md` §3 ("Margem de segurança") |
| Respiro medido na principal: 64 · 46 · 32 | caixa do `captura.py conferir` |
| Contorno da versão escura ocupa 8 do respiro | `final/LEIA-ME.md` §2.2 |
| Tamanhos mínimos | medição feita para este guia (seção 3 abaixo) |
| Impressão: 6,4 / 12,7 / 16,9 mm | conversão dos mínimos de tela de 24 / 48 / 64 px com 1 px CSS = 1/96 de polegada. **Não testado em papel**, marcado como provisório. A única peça impressa citada no PRD é o cartaz do camping, guardado para depois (seção 21). |
| Poses e onde usar | padrão de partida de `prototipos/direcao/direcoes.md`; regras "uma vez por tela" e "nunca em linha de lista, tabela de gastos ou formulário", idem |
| As 7 expressões | `final/LEIA-ME.md` §2.1 (MSC-11) |
| Uso em tela de preocupado, com calor e surpreso | **não definido** em nenhum documento; o guia diz isso e só aponta o paralelo com o clima da viagem (PRD E1-01), sem criar regra |
| Vistas fora dos protótipos | `prototipos/direcao/padrao-producao.md` §6 |
| Sem acessório: existe para provar que o personagem não depende do gorro | `direcao/padrao-producao.md` (regra do piloto); nenhum uso em tela previsto |
| Ícone: arquivos, tamanhos, regras das lojas | `final/LEIA-ME.md` §2.3 e §6 (fontes oficiais citadas lá) |
| O que nunca faz | `prototipos/direcao/direcoes.md` (bloco DSG-13), `prototipos/direcao/padrao-producao.md` §6, `direcao/originalidade.md` (disco azul, laranja-avermelhado, azul-royal com laranja) e `CLAUDE.md` (sem marcas de terceiros) |
| 3D: arquivo oficial, SHA-256 `a51fb8af…4597`, 1.080.632 bytes, 23.056 triângulos, 10 malhas, 10 materiais, 9 ossos | `3d/LEIA-ME.md` §4 e §6; `qa/relatorios/modelo3d-rodada-3.md`; SHA conferido por `sha256sum` no arquivo atual |
| 3D: altura 0,40 m, largura 0,388 m, profundidade 0,368 m, +Y para cima, frente +Z, metros, origem no chão | `3d/PARTES.md` §7 e início; `3d/LEIA-ME.md` §2 e §3 (altura aprovada pelo responsável em 24/11/2026) |
| 3D: desvio da variante C (face +24%, barriga +23%, olhos +12%) | `3d/LEIA-ME.md` §5.1 |
| 3D: 7 expressões, 7 clipes (quadros, duração, tipo, expressão que combina), 0,088 m/s do `andar`, 2 âncoras, nomes no three.js | `3d/PARTES.md` §4, §5, §6 e §8 |
| 3D: não editar o GLB à mão; corrigir só em `fonte/construir.py` e regerar; novo SHA e conferência do QA | `3d/LEIA-ME.md` §1, §3 e §6.2; `qa/relatorios/modelo3d-rodada-3.md` (caso das pupilas) |
| Vídeo: copia o GLB da fonte e confere o SHA a cada render | `videos/NOTAS.md` (etapa 2, "Modelo"); QA `VID-01-etapa2-rodada-2.md`, "GLB" |
| Vídeo: nenhum material sobrescrito fora do destaque; olhos nunca | QA `VID-01-etapa2-rodada-2.md`, "Nenhum material sobrescrito"; `videos/NOTAS.md`, "Divergências (etapa 2)" |
| Vídeo: destaque só no gorro, resto com no máximo 25% de saturação e 15% de brilho, cores originais do quadro 129 ao 149, subida de 2,1 a 3,0 s e volta de 3,8 a 4,3 s | `videos/NOTAS.md` (etapa 2, "Por dentro"); QA `VID-01-etapa2-rodada-1.md` e `rodada-2.md`, item 2 |
| Vídeo: mascote com 38,1% a 40,5% da altura do quadro (731, 758 e 777 px de 1920) | QA `VID-01-etapa2-rodada-1.md`, item "Tamanho" |
| Vídeo: luz (RoomEnvironment 0,3, direcional principal e contra-luz, sombra de contato, ACES e sRGB, sem HDRI) | `videos/NOTAS.md`, "Divergências da TECNICA-3D.md", seção 7 |
| Vídeo: animação por mixer e `setTime`, sem `useFrame`, relógio nem `Math.random`; texto em HTML por cima; uma peça em destaque por plano | `videos/NOTAS.md` (etapa 2); `docs/TECNICA-3D.md` §4, §5 e §6 |
| Vídeo: conferência de todos os quadros (`checa_mascote.py`: 150 de 150, mínimo 0,431, mediana 0,540) e folha de fidelidade (`fidelidade.py`) | `videos/NOTAS.md`, "Como rodar (etapa 2)" e "Repetibilidade"; QA `VID-01-etapa2-rodada-2.md` |
| Pupilas: ΔE 0,00 a 0,14 depois da correção, 14,8 antes sob luz lateral | `3d/LEIA-ME.md` §6.2 |

## 3. Medição dos tamanhos mínimos

Um script descartável, na pasta temporária do designer e já apagado, desenhou cada arte no Google Chrome desta máquina pelo Playwright (`channel="chrome"`, o mesmo método do `captura.py`):
- em 16, 20, 24, 32, 40, 48, 64 e 96 px reais, com densidade 1 e sem reduzir depois;
- sobre `#FFFFFF` (versão clara) e `#121212` (versão escura).

Ordem nas pranchas de `medidas/`:
- **Linhas, de cima para baixo:** `principal`, `icone`, `uma-cor`, `pose-alerta`, `expressao-preocupado`, `expressao-calor` e o ícone da loja (PNG de 512).
- **Colunas, da esquerda para a direita:** 16, 20, 24, 32, 40, 48, 64 e 96 px.
- `-real` está em tamanho real; `-x4` está ampliada 4 vezes sem suavizar.

| Uso | Mínimo | Leitura nas capturas |
| --- | --- | --- |
| `icone`, versão clara | 24 px | gorro, corpo, barriga e pés legíveis; o rosto aparece a partir de 32 px; em 16 e 20 px vira mancha |
| `icone`, versão escura | 32 px | abaixo disso, o contorno creme (24 na prancha, com a figura a 90%) fica com menos de 1 px |
| `uma-cor` | 24 px | os recortes da face e da barriga ainda abrem; em 16 px fecham |
| figura inteira (`principal`, poses), nas duas versões | 48 px | lê bem; o contorno de 8 da versão escura vira cerca de 1 px e ainda separa a figura; em 32 px some |
| expressão como mensagem | 64 px | sobrancelhas, pupilas, pálpebras e gotas leem; em 48 px sobra só a postura |

O resultado em 48 px bate com as capturas do QA em `qa/relatorios/03-r2/` e `final-r1/`. O mínimo de 24 px do ícone é coerente com o uso que a direção Mapa já faz do `icone` em 24 px (`prototipos/direcao/direcoes.md`).

## 4. Conferências

- `python -I captura.py pagina ../guia/guia.html <temporária> --auditar`, rodado de `design/mascote/qa/`:
  - celular (390 px) e computador (1440 px), tema claro e escuro (o botão `.btn-fundo` troca o tema);
  - sem rolagem horizontal, 0 erros, 0 pedidos externos;
  - 0 alvos de toque menores que 44 px e 0 textos abaixo de AA.
- `render.py` nos 5 exemplos de erro: exit 0. Cada um mostra só o erro que nomeia.
- As capturas da página foram olhadas no computador, claro e escuro, e no celular.

## 5. Decisões provisórias e perguntas em aberto (também na seção 13 do guia)

1. **O gorro pode mudar de cor?** Provisório: não, fixo em `#3EA8AE` (P-20). Quem decide é o responsável.
2. **Em que telas entram preocupado, com calor e surpreso?** Não definido. Hoje são referência para 3D e vídeo.
3. **Tamanhos mínimos para impressão:** convertidos, sem prova em papel.
4. **O 3D entra no app? Em que telas?** Não definido; o PRD só pede o mascote como personagem dos vídeos 3D.
5. **Tamanho no quadro, luz e destaque em outros planos de vídeo:** o guia só traz o que foi medido no teste de 5 segundos.
6. **Quais clipes e expressões entram nos vídeos?** O teste usou só `neutro` e `alegre`, com `acenar` e `parado-respirando`.
7. **Cor do destaque (`#4FD1FF`):** valor do teste; a definitiva sai da identidade escolhida.

`design/mascote/3d/` só foi lido, não foi tocado.

## 6. Limites respeitados

- Escrita só em `design/mascote/guia/`.
- Nenhuma alteração em `design/mascote/final/` nem em `design/mascote/3d/`.
- Nenhum material de terceiros, nenhuma arte enviada a serviço externo.
- Sem commit e sem troca de ramo.
- A pasta temporária fora do projeto foi apagada pelo caminho completo antes da entrega.

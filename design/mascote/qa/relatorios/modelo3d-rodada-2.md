# Modelo 3D do mascote 03 (MSC-10, MSC-11, MSC-12) · rodada 2 · APROVADO

Data: 2026-11-24 · Entregue por: pane-588 · Base: `modelo3d-rodada-1.md` (3 itens) · Decisão aplicada: variante C, escolhida pelo responsável.

**Resumo:** os três itens foram corrigidos, e o resto continua como na rodada 1.
- A aba do gorro no `frio` fecha em volta toda.
- As pontas dos traços dos olhos são calotas redondas, sem dente.
- O `PARTES.md` ensina a achar cada peça no three.js.

O desvio da variante C continua exato (face 0,2062 m, ou +24%; barriga 0,2500 m, ou +23%). O GLB regerado do zero pelo QA tem o mesmo SHA-256 do entregue.

**Evidências** em `qa/relatorios/modelo3d-r2/`. Foram renderizadas pelo QA com o three.js 0.170 da pasta `videos/`, numa cópia temporária já apagada:
- `detalhes.png`: frio a 90°, 135°, 180°, 225° e de frente; pontas dos traços a 14×; surpreso, calor, preocupado, alegre e alerta de perto;
- `tremer-de-frio.png`: 4 quadros a 150°;
- `copa-frio.png`: copa e pompom do frio;
- `expressoes-threejs.png`: as 7 expressões a 0°, 45°, 90° e 180°.

| # | Item da rodada 1 | Resultado | Evidência |
| --- | --- | --- | --- |
| 1 | Aba rasgada no `frio` | ok: a aba é contínua a 90°, 135°, 180° e 225°, sem vão nem degrau, também nos quadros 0, 7, 15 e 22 do `tremer-de-frio`. A aba do frio ficou 2,5 cm mais larga de cada lado que a desenhada (antes eram 2 cm), o que está declarado no LEIA-ME, item 5.2.3. Lê como gorro puxado até os olhos | `detalhes.png`, `tremer-de-frio.png` |
| 2 | Pontas dos traços | ok: as duas pontas de cada arco, sobrancelha e pálpebra terminam em calota redonda inteira, sem dente e sem facetas visíveis a 14×, no `neutro`, `alegre`, `preocupado`, `alerta`, `calor` e `surpreso`. As pupilas e a boca estão mais lisas | `detalhes.png` |
| 3 | Nomes no three.js | ok: a seção 8 do `PARTES.md` tem a tabela GLB → three.js, a função `peca()` por `userData.name` e a alternativa com `sanitizeNodeName`. Conferido: `campinguim.ancora-rotulo` é achada por `userData.name` (vira `campinguimancora-rotulo`, filha de `cabeca`), e `campinguim.ancora-mao` também (filha de `nadadeira-direita`). Os nomes com ponto continuam no GLB | teste no three.js |

## Reconferido nesta rodada

| Item | Resultado |
| --- | --- |
| GLB | 1.080.668 bytes, SHA-256 `dd9a7820…1a2a`, igual ao do LEIA-ME. Sem `extensionsUsed`, 0 imagens, 0 texturas, 1 buffer embutido. 23.056 triângulos (teto de 25.000), 10 malhas, 10 materiais só com cor lisa, 9 ossos |
| Regerar | `construir.py -- C <pasta temporária>` no Blender 5.3.0 deu o mesmo SHA-256 |
| Expressões e clipes | os 7 nomes exatos; `extras.targetNames` nas 6 malhas que mudam; os 7 clipes tocam no three.js, e nada passa do chão em nenhum quadro (menor Y 0,0000) |
| Fidelidade | de frente, face 0,2062 m e barriga 0,2500 m, iguais à rodada 1. Contorno, cores e alturas do vetor sem mudança (`expressoes-threejs.png`) |

## Observações (não reprovam)

- **Altura de 0,40 m:** continua como proposta, à espera do responsável. Trocar a altura é um número em `construir.py`, e a mudança exige regerar e reconferir o SHA-256.
- **`surpreso`:** o vinco escuro pequeno na ponta da metade de baixo do bico continua. Só aparece em plano muito fechado do rosto.
- **Pompom:** no `frio`, o pompom encosta na copa com um vinco côncavo, como no `neutro`. É natural para tecido e não é rasgo (`copa-frio.png`).
- **MSC-14:** este relatório fecha MSC-10 a MSC-12. O plano de teste de 5 segundos com o mascote, renderizado e conferido contra o desenho, ainda falta para dar o pacote como entregue.

## Adendo (2026-11-24, depois do teste em vídeo do MSC-14)

O QA deixou passar um ponto nesta rodada. As duas pupilas não leem o mesmo tom: com luz lateral, a pupila virada para a luz clareia para um cinza-médio, porque é um disco plano um pouco virado para fora, com material `campinguim-olhos` de rugosidade 0,55. Já aparecia nos renders do QA (`modelo3d-r2/detalhes.png`, alegre e surpreso) e não foi apontado. As normais estão simétricas; não é erro de geometria. A correção e a escolha entre corrigir no modelo ou só no vídeo estão em `videos/qa/relatorios/VID-01-etapa2-rodada-1.md`, item 3.

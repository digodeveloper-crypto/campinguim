# Guia de uso do mascote 03 (MSC-13), complemento 3D e vídeo · rodada 2 · APROVADO

Data: 2026-11-24 · Alvo: `design/mascote/guia/guia.html` (seção 12 nova e frases ligadas a ela) e `design/mascote/guia/LEIA-ME.md` · Base: `guia-rodada-1.md`; as fontes citadas pelo entregador.

**Resumo:**
- A seção 12 sai de "pendente" para as regras de 3D e vídeo, cada uma com a origem:
  - 12.1: arquivo oficial, SHA, medidas e eixos;
  - 12.2: as 7 expressões, os 7 clipes e as 2 âncoras;
  - 12.3: regras de vídeo;
  - 12.4: o que o modelo nunca faz;
  - 12.5: como corrigir.
- O QA conferiu os números contra as fontes. Todos batem, inclusive a ressalva de que nenhum material é sobrescrito **fora da janela do destaque** e de que os olhos nunca são mexidos pela cena.
- Só os dois arquivos mudaram. As 41 artes do guia continuam iguais.
- A página passa no `captura.py --auditar`.

| Item | Resultado | Como conferi |
| --- | --- | --- |
| Escopo | ok: `git diff --stat` mostra só `guia/guia.html` e `guia/LEIA-ME.md` (138 inserções e 12 remoções nos dois); nenhuma arte alterada; `3d/` só lido | git |
| 12.1 Arquivo e medidas | ok: SHA `a51fb8af…4597` igual ao aprovado (`modelo3d-rodada-3.md`); **1.080.632 bytes**, confirmado com `stat` no GLB atual; 23.056 triângulos; altura 0,40 m (aprovada pelo responsável), largura 0,388 m, profundidade 0,368 m; +Y para cima, de frente para +Z, metros; origem no chão; 10 malhas, 10 materiais, 9 ossos; desvio da variante C (+24 %, +23 %, +12 %) | `3d/LEIA-ME.md` §2–6, `3d/PARTES.md` §1–7, relatórios do QA |
| 12.2 Expressões, clipes e âncoras | ok: os 7 nomes exatos das expressões; tabela dos 7 clipes com os quadros (60, 30, 60, 48, 48, 30, 45), o tipo e a expressão que combina; 0,088 m/s no `andar`; pulo de 5,5 cm; âncoras e o aviso sobre o nome sem ponto no three.js | `3d/PARTES.md` §4–6 e §8 |
| 12.3 Regras de vídeo | ok, com os números iguais às fontes: cópia do GLB com SHA conferido; nenhum material sobrescrito fora da janela do destaque e olhos nunca; destaque de 2,1–3,0 s e 3,8–4,3 s, opacidade de 1 a 0,3, subida de 2,5 cm, `#4FD1FF`; resto no máximo −25 % de saturação e −15 % de brilho; cores originais do q129 ao q149; boca e gotas escondidas; tamanho de 38,1 a 40,5 % (731, 758 e 777 px); luz `RoomEnvironment` 0,3, ACES e sRGB; animação como função do quadro; texto em HTML por cima; conferir os 150 quadros (`checa_mascote.py`: abaixo de 3 % ou de metade da mediana dos vizinhos); folha de fidelidade; ΔE das pupilas 0,00–0,14 depois (14,8 antes) | `videos/NOTAS.md` (linhas 22, 59, 77), `checa_mascote.py`, `3d/LEIA-ME.md` §6.2, `VID-01-etapa2-rodada-1.md` e `-rodada-2.md` |
| 12.4 O que nunca faz | ok: cada regra tem fonte (`3d/LEIA-ME.md` §5.1, §5.2 item 13 e §8; `PARTES.md` §5; `TECNICA-3D.md` §4 e §6; `CLAUDE.md` regra 6). O gorro sempre `#3EA8AE`, com a exceção do destaque, que volta antes do fim | leitura |
| 12.5 Como corrigir | ok: só pelo `construir.py`, regerando com o Blender 5.3.0, com reconferência e SHA novo, como foi na correção das pupilas | `3d/LEIA-ME.md` §1 e §6.2 |
| Perguntas abertas (seção 13) | ok: as 4 novas são decisões que nenhuma fonte fixa (3D no app; tamanho, luz e destaque em outros planos; quais clipes e expressões; cor definitiva do destaque, pela `TECNICA-3D.md` §15). Saiu a linha "Regras de 3D e vídeo pendentes" | leitura |
| Imagens novas | ok: as 5 de `../3d/previas/` existem e têm `alt`, `width` e `height`; nenhum `src` ou `href` local quebrado | script |
| Página | ok: 0 erro, 0 pedido externo, 0 alvo menor que 44, 0 texto abaixo do AA e sem rolagem lateral, em 390 e 1440, claro e escuro | `qa/relatorios/guia-r2/saida.txt` |

**Observação (não reprova):** o guia agora mostra imagens de `design/mascote/3d/previas/` por caminho relativo (`../3d/previas/`). Se a pasta `3d/` for movida ou as prévias forem regeradas com outro nome, o guia quebra. A conferência de links da página pega isso.

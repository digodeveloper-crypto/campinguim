# VID-01 · etapa 2 = MSC-14 · teste de 5 s com o mascote (cena B) · rodada 2 · APROVADO

Data: 2026-11-24 · Entregue pela missão do vídeo (piloto pane-584), repassado pelo pane-547 · Base: `VID-01-etapa2-rodada-1.md` (3 itens)

**Resumo:** os três itens da rodada 1 foram corrigidos.
- O mascote está presente nos **150 quadros** do MP4 final, pela medição do próprio QA.
- O destaque do gorro agora só recua o resto de leve e devolve as cores: o vídeo termina com o mascote nas cores do desenho e o gorro opaco.
- Com o GLB corrigido (`a51fb8af…`), as duas pupilas saem idênticas.

O resto continua como na rodada 1: fala, legenda, tamanho, expressões e formato. Com isso, o MSC-14 fica atendido, e o pacote 3D do mascote (MSC-10 a MSC-14) está completo.

**Evidências** em `videos/qa/relatorios/VID-01-e2-r2/`: `q003.png` (o quadro que faltava na rodada 1, agora com o mascote) e `q149.png` (último quadro). A folha do entregador, `renders/mascote/fidelidade.png`, também foi conferida.

## Itens da rodada 1

| # | Item | Resultado | Como conferi |
| --- | --- | --- | --- |
| 1 | Quadro sem o mascote | ok: extraí os 150 quadros do `final/mascote3d.mp4` e medi cada um com script próprio, sem usar o `checa_mascote.py`. Todos têm o rosto e a barriga claros (mínimo de 73.420 px no quadro 13, mediana 113.422; nenhum abaixo de 50 % da mediana) e o gorro presente (nenhum quadro sem o verde-azulado ou o azul do destaque). Desvio de luminância mínimo 48,0. O quadro 3 agora tem o mascote (`q003.png`). Causa tratada no código: a espera do render só libera depois que o mascote entrou na cena e o quadro foi desenhado (`<MascoteDesenhado/>`, `src/Mascote.tsx`, linhas 32 a 50) | medição do QA |
| 2 | Fim longe do desenho | ok: no destaque, o resto perde no máximo 25 % de saturação e 15 % de brilho (`m.color.copy(c0).lerp(cinza, 0.25 * r).multiplyScalar(1 - 0.15 * r)`). O laranja de pés e bico, medido em pixels, cai de cerca de 9.400 (q60) para 3.200 (q90) no destaque e volta a 13.100 no q129 e a 13.200 no q149. No q149 o gorro está opaco e as cores são as originais (tabela abaixo). O rótulo "Gorro de lã" fica até o fim, o que é aceitável | código, medição por quadro, `q149.png` |
| 3 | Pupilas de tons diferentes | ok: no q149, as duas pupilas medem `#262B32`, idênticas. Corrigido no modelo (`modelo3d-rodada-3.md`), sem sobrescrever material na cena | medição, código |

## Pedidos do piloto

- **Cor do corpo no q149 contra o desenho**, medida em amostras de 12 × 12 px:

  | Peça | Render (q149) | Desenho | Leitura |
  | --- | --- | --- | --- |
  | Penugem, lado iluminado | `#505862` (V 38, S 18) | `#4A5560` (V 38, S 23) | igual ao desenho |
  | Penugem, meio-tom | `#474F59` (V 35) | `#4A5560` | igual, com leve sombra |
  | Penugem, lado em sombra | `#1A2230` (V 19) | `#4A5560` | é a sombra da luz principal, não perda de cor |
  | Gorro | `#60B7B8` (S 48) | `#3EA8AE` (S 64) | mais claro pelo reflexo da luz no tecido; mesmo tom (matiz 181 contra 183) |
  | Bico | `#E7BF69` (S 54) | `#E4A33A` (S 75) | mesmo matiz, clareado pelo brilho |
  | Pé | `#DDB054` (S 62) | `#E4A33A` | igual, com luz |
  | Barriga | `#C0BAB0` (V 75) | `#FBF3E4` | creme em sombra suave de baixo |
  | Pupilas | `#262B32` e `#262B32` | `#333C45` | iguais entre si; um pouco mais escuras que o desenho |

  **Conclusão:** o corpo mais escuro na folha é **luz e sombra**, e não perda de cor. No lado iluminado, a penugem tem o mesmo brilho do desenho (V 38) e o mesmo matiz. Fora do destaque, nenhuma cor é alterada (ver o próximo item). O q149 até tem cores um pouco mais vivas que o q0.
- **Nenhum material sobrescrito fora da janela do destaque:** confirmado no código (`src/Mascote.tsx`, `useMascotePosado`).
  - A cada quadro, a cor de cada material é recalculada a partir da cor original guardada; com o efeito em 0, a fórmula devolve a cor original sem mudança.
  - O gorro usa um clone do próprio material do GLB. Com o efeito em 0, ele fica opaco, com emissivo 0 e a borda de Fresnel multiplicada por 0, e boca e gotas voltam ao normal.
  - A única outra coisa é `renderOrder` do gorro, que não muda a cor.
  - As pupilas não recebem nada da cena.
- **Fala e legenda:** a frase continua exatamente "Este é o Campinguim. Ele mostra o camping por dentro." (`textos/roteiro_mascote.json`). O áudio tem os mesmos tempos da rodada 1 (voz de 0 a 3,10 s, com pausa de 0,32 s entre as frases), e a legenda aparece palavra por palavra na folha.
- **GLB:** `public/modelos/campinguim.glb` tem o SHA-256 `a51fb8af…4597`, igual ao aprovado. O `renderizar.mjs` copia o GLB da fonte, compara o SHA e para se forem diferentes (linhas 12 a 20).
- **Regras do CLAUDE.md:**
  - nenhum material de terceiros novo;
  - nenhum segredo nos arquivos de `videos/src`, `ferramentas` e `renderizar.mjs`;
  - `git status` sem mudança fora de `videos/` atribuível a esta entrega (as outras mudanças no disco são do Rumo e do QA);
  - textos em pt-BR.

## O resto, sem mudança

| Item | Resultado |
| --- | --- |
| Arquivo final | H.264 1080 × 1920, 30 fps, 150 quadros, 5,000 s; AAC 5,013 s |
| Tamanho | como na rodada 1 (38 a 40,5 % da altura); câmera e clipes sem mudança declarada, e a folha confirma |
| Expressões | q0 neutro, q60, q105 e q149 alegre, iguais ao vetor (folha `fidelidade.png`, agora com a referência certa, alegre, para o q149) |
| Raio-x e rótulo | só no gorro, de 2,1 a 4,3 s; o rótulo segue a âncora |

## Observação (não reprova)

- `renders/mascote/extraidos_baixa/` (1,5 MB) e `extraidos_final/` (3,6 MB, 11 quadros) são quadros intermediários das folhas. Ficam fora do git (`renders/` está no `.gitignore`), mas, pela regra "apague seus temporários", podem ser apagados se as folhas não precisarem ser refeitas a partir deles.

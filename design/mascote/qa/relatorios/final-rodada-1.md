# Pacote final do mascote 03 (MSC-08, referência do MSC-11) · rodada 1 · REPROVADO

Data: 2026-11-24 · Entregue por: pane-579 · Alvo: `design/mascote/final/`
Base: `design/mascote/ESCOLHA.md`, `03-rodada-2.md`, `design/mascote/direcao/padrao-producao.md` e `conceitos.md` (ficha 03), roteiro do QA do mascote.

**Resumo:**
- O pacote está quase todo pronto e bem feito.
- **Arte aprovada:** as 11 artes da opção 03 foram copiadas **byte a byte** (SHA-256 igual, 11 de 11), e as 4 expressões que reaproveitam poses também (neutro, alegre, alerta, frio).
- **Escuro:** as versões mantêm cores e formas, com um contorno creme de separação. A versão em uma cor tem positivo e negativo.
- **Ícones:** estão nos tamanhos e formatos das lojas. A página de conferência abre com 0 erro.
- **Expressões novas:** das três, **preocupado** e **surpreso** estão boas.
- Reprova por **um ponto**: na expressão **com calor**, o gorro na nadadeira não se lê. Aparece como uma forma verde-azulada solta ao lado da cabeça, que lembra manga, bandeira ou peixe. A nadadeira que deveria estar erguida segurando o gorro continua caída no flanco.

Capturas: `qa/relatorios/final-r1/`:
- `zoom-novas.png`: preocupado, calor e surpreso em 512, e calor em 48 px ampliado;
- `prancha.png`: as 7 expressões e amostras escuras;
- `icones.png`: Play, App Store, frente e monocromático do Android;
- `saida-index.txt`.

## O que precisa mudar

1. **Expressão com calor: o gesto de abanar com o gorro não se lê.** Evidência: `zoom-novas.png` (2ª e 4ª figuras).
   - A forma verde-azulada fica horizontal, à direita da cabeça, longe da nadadeira escura, que continua quase vertical no flanco. O gorro a 46% perdeu a silhueta de gorro (aba e copa) e lê como uma tira com tufos. Em 48 px vira uma mancha.
   - Pinguim segurando algo comprido ao lado da cabeça ainda puxa a leitura de "pinguim com peixe", um clichê a evitar.
   - **Mudar**, escolhendo uma das duas saídas:
     - **(a)** a nadadeira claramente erguida acima do ombro, como a de `pose-alerta`, e o gorro inteiro e reconhecível na ponta dela, com aba e pompom, num tamanho em que a silhueta de gorro leia. Algumas linhas curtas de abano ajudam, se couberem nos mínimos;
     - **(b)** mais simples e mais útil como referência de expressão para o 3D: o gorro na cabeça, empurrado para trás (mostrando a testa), mais as gotas, as pálpebras caídas e a penugem murcha. O calor fica no rosto e na postura, sem objeto fora do corpo.
   - Em qualquer saída: conferir em 48 px reais e no fundo escuro, e declarar o desvio da ficha (que diz "gorro na asa").

## Conferido e ok

| Item | Resultado | Evidência |
| --- | --- | --- |
| Arte aprovada sem redesenho | ok: 11 de 11 SVG idênticos à origem `opcoes/03/arte/` (SHA-256); `expressao-neutro`, `-alegre`, `-alerta` e `-frio` idênticos a `pose-neutro`, `pose-comemorando`, `pose-alerta` e `pose-camping` | verificação por script |
| Versões clara e escura | ok: a escura não muda cor nem forma; acrescenta contorno creme `#FBF3E4` de 8 (24 no ícone, com a figura a 90%), na mesma posição da clara; os tremores do frio ficam em creme; nada cortado | `prancha.png` |
| Versão em uma cor | ok: positivo em `#111111` (a cópia aprovada) e negativo em `#FFFFFF`, com os recortes transparentes | `prancha.png` |
| Expressão preocupado (nova) | ok: sobrancelhas com as pontas de dentro erguidas, olhos abertos, bico menor. Lê "preocupado" sem rótulo e é a mesma figura | `zoom-novas.png` (1ª) |
| Expressão surpreso (nova) | ok: olhos grandes, arcos altos e curvos, bico entreaberto, gorro "pulando". Lê "surpreso" sem rótulo | `zoom-novas.png` (3ª) |
| As 7 do MSC-11 | presentes: neutro, alegre, preocupado, alerta, frio, calor, surpreso. Calor no item 1 | `prancha.png` |
| Ícone da Google Play | ok: 512 × 512, PNG RGBA totalmente opaco (alfa 255), quadrado cheio sem cantos nem sombra | verificação por script, `icones.png` |
| Ícone da App Store | ok: 1024 × 1024, PNG RGB sem canal alfa, opaco | verificação por script |
| Ícone adaptativo do Android | ok: frente, fundo e monocromático em mdpi 108, hdpi 162, xhdpi 216, xxhdpi 324 e xxxhdpi 432, mais 1024 para o Expo; frente e monocromático transparentes, fundo opaco; a figura cabe no círculo seguro de 66 dp | verificação por script, `icones.png` |
| Página de conferência | ok: `index.html` com 0 erro, 0 pedido externo, sem rolagem horizontal, 0 alvo menor que 44 px, 0 texto abaixo de AA, em 390 e 1440, claro e escuro | `saida-index.txt` |
| Originalidade | ok: as expressões novas não trazem traço novo de personagem conhecido; nada da marca Pinguin. Checagem por descrição, sem busca reversa de imagem | — |
| Escopo | o guia de uso completo (MSC-13), o modelo 3D (MSC-10 a 12) e o plano de teste (MSC-14) não fazem parte desta entrega, como o `LEIA-ME.md` declara | `final/LEIA-ME.md` |

## Para a reentrega

Corrigir só a `expressao-calor` (claro, escuro e os PNG derivados) e atualizar a página de conferência. Dizer qual saída foi escolhida, (a) ou (b), e o desvio declarado.

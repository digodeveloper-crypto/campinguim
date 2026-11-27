# B2 · componentes visuais · rodada 1 · REPROVADO (3 itens: palavra partida em 200 %, evidências velhas, uma frase errada no catálogo)

- Data: 2026-11-26.
- Entregue por: pane-699. Conferido por: QA (pane-689).
- Base:
  - o cartão da B2;
  - `docs/DESIGN.md` inteiro, em especial as §§ 3 a 10 e a 13;
  - a SPEC §7;
  - o protótipo `design/prototipos/rumo/`;
  - as decisões provisórias do orquestrador: D-2, D-5, D-7, gorro fixo, só as 5 artes e sem 3D;
  - os critérios de aceite de DSG-06, NF-07 e NF-08.
- Alvo: worktree `C:\campinguim-wt\B2`, ramo `feature/B2-componentes-visuais`, ponta `b3f5cfb`, com 8 commits sobre o main `46a0346` (B4). A árvore está limpa e o rebase está em dia.
- Ambiente: emulador e Docker livres para a B2, por ordem do orquestrador.
  - Liguei o `campinguim-a` (emulator-5554) e ao fim o desliguei, com tema, letra e tela de volta ao padrão: `night no`, `font_scale 1.0`, `wm size/density reset`.
  - Rodei `ambiente:zerar` antes da suíte e `ambiente:parar` ao fim: 0 contêineres no ar.

## Testes rodados pelo QA

| Comando (Node 24.19.0, no worktree da B2) | Resultado |
| --- | --- |
| `npm run app:gerar` (APK gerado pelo QA a partir da ponta `b3f5cfb`) | BUILD SUCCESSFUL (6 min 28 s), exit 0 |
| `npm run ambiente:zerar` | exit 0, Supabase local e PowerSync no ar |
| `npm run testar -- --exigir-completa` (1ª) | **SUÍTE COMPLETA, 7 de 7 etapas**, exit 0: unitários **698/698**, servidor **109/109**, web **2/2**; a etapa do manifesto rodou (3 testes), nenhum pulo |
| `npm run testar -- --exigir-completa` (2ª) | **7 de 7**, exit 0; mesmos números |
| `npm run testar:jornadas -- fumaca`, letra 100 % | **3 de 3**: tela provisória, galeria (149 s) e banco cifrado |
| `npm run testar:jornadas -- fumaca`, letra 200 % (`font_scale 2.0`) | **3 de 3** (o roteiro passa, mas as capturas mostram o item 1) |
| Defeito plantado: `linha` clara `#66847A` → `#8FA89F` em `tokens.json` | **pego**: 5 testes falham (2 pares de forma, o par mais apertado, igualdade com o `estilo.css` e o bloco da web). O arquivo foi devolvido ao original e a árvore está limpa |

## O que está certo

| Ponto | Resultado |
| --- | --- |
| Rebase sobre `46a0346` | ok. `_layout.tsx` mantém o `ProvedorDoBanco` da B4 por fora e acrescenta só fontes e tema. `pt-BR.json` tem a estrutura da B6, **nenhuma chave removida** (comparação de chaves com o main) e 97 chaves novas. `package.json` só ganhou `expo-font 58.0.12` e `react-native-svg 15.16.0`; o bloco `op-sqlite` da B4 continua |
| Tema (DESIGN 3.1 a 3.4) | ok. Os 10 papéis, claro e escuro, com os hex da tabela. As 5 cores do mascote, com o gorro `#3EA8AE`. Nenhum hex solto em componente, ícone ou galeria (só nas artes geradas do mascote) |
| Contraste (D-2) | ok. O teste **calcula** os 14 pares nos dois temas, com piso de 4,5 em texto e de 3 em forma, confere o valor publicado com tolerância de 0,006, e também os usos fora da tabela e o mascote (6,05 e 6,40). Cada estado de toque (normal, pressão, desativado, ligado) também tem contraste conferido |
| Uma fonte de verdade | ok. `tokens.json` gera o bloco de cores de `apps/web/src/estilos.css` e `artes.ts`, e um teste falha se algum derivado ficar velho (comprovado pelo defeito plantado) |
| Tipografia (4.1 a 4.3) | ok. Archivo em 12 arquivos fixos cortados da variável com `fontTools`, com o `OFL.txt` **idêntico** (cmp) e um LEIA-ME. Nada abaixo de 15 e nenhum peso abaixo de 400 (teste). A caixa alta é só de estilo e o leitor recebe a frase normal. Números tabulares. Nenhum `allowFontScaling` ou `maxFontSizeMultiplier`: a letra do sistema é respeitada |
| Letra 130 % | ok, pelas capturas da entrega: rota só com números, nada partido |
| Componentes 7.1 a 7.10 | ok na forma. Propriedades tipadas, papéis e estados acessíveis (`togglebutton`/`checked`, `tab`/`selected`, `radio`, `checkbox`, `expanded`). Raio `tokens.raio` em tudo (círculo só no ponto da rota e na bolinha da opção). Nenhuma sombra, elevação ou degradê. Textos só do arquivo de textos |
| Estado nunca só por cor | ok. Os 8 estados de 3.3 levam ícone, texto e cor, e a faixa `separei` fica fora do carro |
| Erro (D-5) | ok. Folha com faixa `atencao`, ícone cheio, frase em `texto` e botão "Tentar de novo", numa região anunciada, com o nome "Erro: …". O erro de campo tem borda de 2 `atencao`, ícone e frase |
| Legenda (7.7) | ok. Modal com `accessibilityViewIsModal`, fecha com o voltar e com toque fora, anuncia ao abrir e não tem animação |
| Ícones (§6) | ok. São os 30 do protótipo, e um teste compara com `rumo/icones.js`. Nenhuma biblioteca |
| Mascote (§8) | ok. As 5 artes têm **SHA-256 igual** a `design/mascote/final/vetor/claro/*`. No escuro, a arte fica sobre o papel `texto`. Na galeria há um mascote por tela: o da rota some nas seções que mostram outro |
| Tema escuro no aparelho | ok (captura do QA, `cmd uimode night yes`): os papéis do escuro e os ícones da barra de status claros |
| Barra de status | ok no APK do QA: a rolagem começa abaixo dela. Conferi em 3 aberturas a frio (uma depois de `pm clear`) e nas duas rodadas do roteiro, em 100 % e 200 % |
| Leitor de tela (amostra do QA, escuro, 100 %, 6 telas roladas) | ok: 42 clicáveis distintos, **0 sem nome**, **0 abaixo de 44 dp** entre os inteiros na tela. A entrega mediu 332, com 0 sem nome e 0 abaixo de 44 |
| Comparação com o Rumo (DSG-06) | ok na forma: 11 pares lado a lado, fiéis em cor, letra, medida e estado. As divergências conscientes estão listadas (ver o item 2 sobre as imagens) |
| Galeria só em desenvolvimento | ok no código: `config.ambiente !== 'local'` mostra "indisponível". **Depende** do padrão de `config.ambiente`, hoje aberto (`?? 'local'`), que já está na fila da B1-FIX-2. Quando a B1-FIX-2 trocar o padrão para fechado, a galeria herda. Não é falha da B2 |
| Escopo | ok. Nada em `packages/`, `supabase/`, `scripts/`, `prova/`, `design/` nem `vitest.config.ts`. Em `e2e/` só o roteiro `fumaca/galeria.yaml` |
| Checagem G | ok. Nenhum segredo, e-mail, nome real, usuário do Windows, `C:\Users` nem domínio de serviço fora do único valor de configuração (a única ocorrência é o texto da própria checagem na saída da suíte). A fonte é OFL sem nome reservado. As capturas mostram só o app (sem tela inicial nem apps de terceiros) e o protótipo próprio |

## Itens para corrigir

| # | Onde | Problema | Como reproduzir e evidência | O que fazer |
| --- | --- | --- | --- | --- |
| 1 | `src/componentes/Lista.tsx` (`Categoria`, nome em `subtitulo` com `flexBasis 144 × fator` e `flexShrink 1`); `src/componentes/Selo.tsx` (texto grande do selo); a grade de ícones da galeria | **Palavra partida no meio com a letra do sistema em 200 %**, no APK final. Fere a DESIGN 4.4 ("nenhuma palavra partida no meio"; exceções: só o e-mail do Pix e caminhos de arquivo) e o aceite de NF-08 ("nada quebra com fonte ampliada"). A entrega diz que isso foi corrigido (commit "palavra nunca parte em 200 %"), mas continua. Casos: **"Co / zin / ha"** (categoria, 7.4); **"6 CONFIRMAÇ / ÕES"** e **"6 CONFIRMA / ÇÕES"** no selo (7.6), nas três variantes (sobre o fundo, na folha e largo); na galeria, os nomes de ícone **"conferid / o"**, **"sem_do / no"** e **"compart / ilhar"** | `adb -s emulator-5554 shell settings put system font_scale 2.0` → `am start -S -a android.intent.action.VIEW -d campinguim://galeria` → seções 7.4, 7.6 e Ícones (ou `npm run testar:jornadas -- fumaca` com a letra em 200 %). As capturas da própria entrega mostram o mesmo: `docs/evidencias/B2/fonte200/galeria-item-1.jpg` ("Co/zin/ha") e `fonte200/galeria-selo-1.jpg`/`-2.jpg`. Em 130 % não acontece | Em 200 %, nenhuma palavra pode partir. Na categoria: o nome ocupa a linha inteira e a régua com o "x de y" desce, em vez de o nome encolher. No selo: a adaptação de 200 % do letreiro (largura 100 e menos espaço entre letras, como `tituloTela` e `rotulo` na 4.4) e quebra só entre palavras. Na galeria: o nome do ícone sem partir (coluna mais larga ou letra menor só ali). Confira **todas** as seções em 200 % na tela padrão **e** na de 5 polegadas (`wm size 720x1280`, `wm density 320`), onde há menos espaço |
| 2 | `docs/evidencias/B2/` (`claro/`, `escuro/`, `fonte130/`, `fonte200/`, `tela5/`, `tela67/`, `comparacao/`, `LEIA-ME.md`) | As evidências não mostram o app entregue. (a) Cinco das seis condições foram capturadas com o APK de antes do rebase, e `fonte200/` mostra o defeito do item 1. (b) Em `claro/` (APK final) e em `comparacao/01` e `03`, o conteúdo rolado passa **por baixo** da barra de status ("Cozinha" e "7.2 Cabeçalho…" sob o relógio). Isso contradiz a divergência nº 1 da comparação ("a rolagem começa abaixo da barra de status"). O QA não reproduziu isso com o APK gerado da mesma ponta | Abrir `claro/galeria-item-1.jpg`, `claro/galeria-botoes-2.jpg` e `comparacao/03-item-da-lista.png`. Contraprova do QA: em 100 % e 200 %, 3 aberturas a frio e 2 rodadas do roteiro, sempre abaixo da barra | Depois do item 1, gere o APK final e refaça as **seis** condições e as comparações com ele, devolvendo tema, letra e tela ao padrão. Se o conteúdo voltar a aparecer sob a barra de status, **não** grave a imagem: investigue (por exemplo, a área segura chegando zerada na abertura a frio) e corrija em `Tela`. O `LEIA-ME.md` deve dizer o APK e a ponta usados em cada pasta |
| 3 | `docs/componentes.md` §7.2, última linha ("Testes do tema no Vitest") | Diz que a B2 acrescentou "uma linha em `vitest.config.ts`", mas o ramo não muda esse arquivo (o main já inclui `apps/*/src/**/*.test.ts`, como a própria entrega diz) | `git diff main...HEAD -- vitest.config.ts` não devolve nada | Corrigir a frase: os testes rodam no projeto `core`, que já inclui `apps/*/src` desde o main |

## Observações (não reprovam)

- `app/index.tsx`, a tela provisória da B1, fica fora da lista da B2: só tema claro e `borderRadius: 16`. Ela deve ser trocada pela primeira tela de produto, que já usa os componentes.
- Link com o app aberto não troca de tela (só a frio). Registrado em `docs/componentes.md` para a feature de links.
- "Um mascote por tela" não tem trava em código; o QA confere nas capturas de cada tela.
- O cartão pedia o rodapé "Fable 5.1" nos commits. O ajudante usou "Opus 5.5", que é quem fez. Fica para o orquestrador decidir na integração (o commit final é squash).
- As imagens somam cerca de 18 MB. Ao refazer, mantenha JPEG reduzido nas condições e PNG só nas comparações.

## Para a rodada 2

- Rebase, se o main mudar.
- `npm run app:gerar` e `--exigir-completa` com tudo verde.
- As seis condições refeitas com o APK final.
- Lista de cada seção conferida em 200 % nas duas telas.
- O QA vai refazer a conferência em 200 % (tela padrão e de 5 polegadas), a barra de status e uma amostra do leitor de tela.

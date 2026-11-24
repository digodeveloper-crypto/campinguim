# Padrão de produção dos 5 protótipos

DSG-01 · Cinema, etapa 2 · 24/11/2026.

Contrato de quem constrói e de quem confere. Vale para os cinco construtores, para quem monta a base compartilhada e para o QA. A direção de cada protótipo está em `direcoes.md`; o conteúdo das telas, em `telas.md`; a checagem de concorrentes, em `concorrentes.md`.

## 1. Etapas e quem mexe em quê

| Etapa | Quem | Pasta que pode escrever | Entrega |
| --- | --- | --- | --- |
| 0 · Base | um painel | `design/prototipos/_compartilhado/`, `index.html`, `comparacao.html`, `avaliacao.html`, `recomendacao.html`, `recomendacao-dados.js`, `LEIA-ME.md` | dados, textos comuns, mascote, fontes, moldura, páginas de apresentação vazias que já leem as fichas |
| 1 · Protótipos | cinco painéis em paralelo, um por direção | só a pasta da própria direção (`brasa/`, `clareira/`, `oficina/`, `rumo/`, `roda/`) | as 15 telas, a página de identidade e a ficha |
| 2 · QA | QA | `design/prototipos/qa/` (relatórios e capturas) | aprovação por protótipo |
| 3 · Recomendação | Cinema | `recomendacao-dados.js` | recomendação, depois dos cinco aprovados |

Nenhum construtor de direção escreve em `_compartilhado/` nem na pasta de outra direção. Se faltar algo na base (um texto comum, um dado), ele pede à base pelo orquestrador; não cria cópia local. A etapa 1 só começa depois que a etapa 0 for aprovada pelo QA (são 6 painéis no máximo: a base fecha antes dos cinco abrirem).

## 2. Pastas e arquivos

```
design/prototipos/
  index.html              página inicial: as 5 lado a lado
  comparacao.html         a lista nas 5, claro e escuro
  avaliacao.html          folha de avaliação do pedido
  recomendacao.html       recomendação da Cinema
  recomendacao-dados.js   conteúdo da recomendação (vazio até a etapa 3)
  LEIA-ME.md              como abrir e como preencher
  direcao/                estes quatro documentos
  _compartilhado/
    dados.js              ÚNICO arquivo de dados (telas.md)
    textos.js             textos comuns, pt-BR
    mascote.js            arte da opção 03, copiada sem alteração
    mascote-origem.md     de onde veio cada arte, com o resumo SHA-256
    base.js               aplica textos, tema, fonte, moldura e barra do avaliador
    base.css              moldura, barra do avaliador, regras de acessibilidade comuns
    fontes/<familia>/     arquivos .ttf e OFL.txt
  brasa/ clareira/ oficina/ rumo/ roda/
    01-abertura.html
    02-criar-viagem.html
    03-alertas.html
    04-lista.html
    05-item.html
    06-aviso-de-saida.html
    07-estadia.html
    08-volta.html
    09-em-casa.html
    10-fato.html
    11-grupo.html
    12-gastos.html
    13-camping-sem-dados.html
    14-convidado.html
    15-site.html
    identidade.html       página de identidade da direção
    estilo.css            variáveis de cor (os 10 papéis), tipografia, componentes
    textos.js             textos com o tom de voz da direção, pt-BR
    icones.js             ícones desenhados para a direção
    ficha.js              o que a apresentação lê da direção (seção 10)
```

Nenhum outro arquivo nas pastas das direções. Os nomes são exatamente esses, em minúsculas, sem acento. Cada tela é um arquivo; passos dentro de uma tela (os três passos da tela 9, a entrada do convidado na tela 14) são estados do mesmo arquivo.

## 3. Tudo local

- Abre com duplo clique (`file://`) e também por qualquer servidor estático, no navegador do celular e do computador, sem instalar nada.
- **Proibido:** qualquer endereço `http://` ou `https://` em HTML, CSS ou JS; serviço de fontes; CDN; biblioteca externa; `fetch`, `XMLHttpRequest`, `import()`, `<script type="module">` (falham em `file://`); etapa de build; gerador de site; framework.
- **Permitido:** HTML, CSS e JavaScript escritos à mão; scripts clássicos (`<script src>`), que publicam em `window.CAMPINGUIM_*`.
- Navegador guardando escolhas (tema, fonte, lado das abas da Oficina, estados marcados durante o teste): só com `try/catch`, e a tela funciona igual sem ele. O estado inicial de toda tela vem sempre de `dados.js`, nunca do que ficou guardado: recarregar com `?novo=1` limpa o guardado.
- Nenhuma imagem de terceiros, nenhuma foto, nenhum ícone de biblioteca. Ícones e ornamentos (linha de copas, curva de nível, costura, halo, emblema) são SVG desenhado para o projeto.

## 4. Dados e textos

**Dados.** `_compartilhado/dados.js` publica `window.CAMPINGUIM_DADOS`, escrito a partir de `telas.md` e só dele: família, faixas, viagem, camping, alertas, ajustes, regras, a lista inteira (categoria, nome, quantidade, unidade, estado inicial, motivo), aviso de saída, estadia, volta, perguntas, fato, grupo, gastos (valores em centavos), camping sem dados, convidado e site. Cada proposta provisória de `telas.md` (P-nn) leva `provisorio: "P-nn"` no próprio registro. Nenhum número, nome ou valor do cenário aparece em outro arquivo: o QA procura "420", "Recanto", "Lucas" e afins fora de `dados.js` e reprova se achar (exceto em `telas.md` e nos relatórios).

Os valores em reais são calculados por `base.js` a partir dos centavos, com formatação brasileira (`R$ 180,00`). A divisão da carne vem dos dados (cotas por família e valor por meia cota), não é recalculada em cada direção.

**Textos (CLAUDE.md, regra 5; NF-09).** Nenhum texto visível escrito no HTML ou no código. Todo texto vem de:
- `_compartilhado/textos.js` (`window.CAMPINGUIM_TEXTOS`): o que é igual nas cinco: nomes dos estados ("separei", "está no carro", "preciso comprar", "faltou", "sobrou", "ciente", "conferido", "secar ou lavar em casa", "vou sair"), nomes das categorias, rótulos de campos, nomes das áreas, textos da barra do avaliador e das páginas de apresentação, textos alternativos do mascote.
- `<direcao>/textos.js` (`window.CAMPINGUIM_TEXTOS_DIRECAO`): só o que muda com o tom de voz (títulos de tela, frases curtas, rótulos de botões que a direção escreve do seu jeito). Uma direção não renomeia os estados nem as categorias.

O HTML marca onde o texto entra (`data-texto="chave"`, `data-texto-aria="chave"`) e `base.js` preenche. Toda página tem `lang="pt-BR"`, `<title>` vindo do arquivo de textos, um único `<h1>`. Chave sem texto aparece na tela como `[chave]` em vermelho e no console como erro: o QA reprova.

Textos legais não entram (P-18). Texto provisório de `telas.md` entra como está, marcado no arquivo de textos com `/* P-nn */`.

## 5. Fontes

Na etapa 0, a base baixa uma única vez, do repositório oficial `github.com/google/fonts` (P-21), os arquivos abaixo, para `_compartilhado/fontes/<familia>/`, junto com o `OFL.txt` de cada família. Depois disso, nada mais sai para a rede.

| Família | Arquivos (pasta `ofl/` do repositório) | Direção |
| --- | --- | --- |
| Fraunces | `fraunces/Fraunces[SOFT,WONK,opsz,wght].ttf` | Brasa |
| Atkinson Hyperlegible | `atkinsonhyperlegible/AtkinsonHyperlegible-Regular.ttf`, `-Bold.ttf` | Brasa |
| Figtree | `figtree/Figtree[wght].ttf`, `Figtree-Italic[wght].ttf` | Clareira |
| IBM Plex Sans Condensed | `ibmplexsanscondensed/IBMPlexSansCondensed-Regular.ttf`, `-Medium.ttf`, `-SemiBold.ttf` | Oficina |
| IBM Plex Mono | `ibmplexmono/IBMPlexMono-Regular.ttf`, `-Medium.ttf` | Oficina |
| Archivo | `archivo/Archivo[wdth,wght].ttf` | Rumo |
| Bricolage Grotesque | `bricolagegrotesque/BricolageGrotesque[opsz,wdth,wght].ttf` | Roda |
| Lexend | `lexend/Lexend[wght].ttf` | Roda |

Nome do arquivo no projeto: o original, sem colchetes (`Fraunces-variavel.ttf`). `@font-face` com `font-display: swap` e pilha de reserva do sistema. A página de identidade de cada direção diz a família, a licença (SIL OFL 1.1) e o caminho do `OFL.txt`.

## 6. O mascote

- `_compartilhado/mascote.js` publica `window.CAMPINGUIM_MASCOTE` com o conteúdo, **byte a byte**, dos arquivos de `design/mascote/apresentacao/opcoes/03/arte/`: `principal`, `pose-neutro`, `pose-comemorando`, `pose-alerta`, `pose-camping`, `icone`, `uma-cor`, `sem-acessorio`. As vistas não entram nos protótipos.
- `_compartilhado/mascote-origem.md` lista, para cada arte, o arquivo de origem e o SHA-256. O QA recalcula. Quando o pacote final do mascote (MSC-08) sair, a base troca as cópias e atualiza a origem (D-06).
- O mascote entra na página como SVG em linha, por `base.js`, com `role="img"` e texto alternativo do arquivo de textos quando informa algo, ou `aria-hidden="true"` quando é enfeite.
- O CSS da direção **só pode** mexer, no SVG do mascote, em: tamanho (proporcional, `width` com `height: auto`) e, **só na arte `uma-cor`**, a cor de preenchimento (`fill`) para uma cor da paleta da direção. Proibido: `transform` (girar, espelhar, inclinar), recorte (`clip-path`, `overflow` que corte a figura), filtro, opacidade abaixo de 1, animação de partes, troca de cor da versão colorida (P-20).
- Apoio em tema escuro: obrigatório para a versão colorida, na cor de apoio da direção (`direcoes.md`), com contraste de pelo menos 3:1 contra o corpo `#4A5560` (os cinco apoios propostos dão de 5,59 a 6,12).
- Onde aparece: a tabela de poses por tela da direção. Nunca dentro de linha de lista, tabela de gastos ou campo de formulário; no máximo uma vez por tela.

## 7. Moldura de celular e barra do avaliador

`base.css` e `base.js` fazem isso igual para as cinco; a direção não mexe.

- **No computador** (janela com pelo menos 700 px de largura e 760 px de altura): a tela do app aparece numa moldura de celular de **390 × 844 px** (área útil), cantos de 44 px, borda de 12 px em `#1A1A1A`, centrada, sobre fundo neutro `#E6E6E6` (claro) ou `#0C0C0C` (escuro). Sem barra de status falsa, sem entalhe desenhado, sem marca de aparelho.
- **No celular** (abaixo disso): sem moldura; o app ocupa a tela inteira (`100dvh`), respeitando as áreas seguras (`env(safe-area-inset-*)`).
- A moldura é desligada com `?moldura=0` (usado pela página inicial e pela comparação).
- **Barra do avaliador**, fora do app: no computador, uma coluna à esquerda da moldura; no celular, uma faixa de 44 px no topo, recolhível, acima da área do app (nunca por cima). Contém: nome da direção, "Tela 4 de 15" e nome da tela, anterior e próxima (na ordem de `telas.md`), tema claro ou escuro, fonte 100 % · 130 % · 200 %, "Identidade", "Todas as direções" (`../index.html`). Desligada com `?avaliador=0`.
- Parâmetros de endereço, lidos por `base.js`: `tema=claro|escuro`, `fonte=100|130|200`, `moldura=0`, `avaliador=0`, `novo=1`. Sem parâmetro, o tema segue o do aparelho (`prefers-color-scheme`).

## 8. Regras de tela (acessibilidade e uso ao ar livre)

| Regra | Como se cumpre | Requisito |
| --- | --- | --- |
| Tema claro e escuro | Os 10 papéis de cor em `:root` (claro) e em `[data-tema="escuro"]`, com os valores exatos de `direcoes.md`. Nenhuma cor fora das variáveis, exceto a arte do mascote e as cores de emblema da Roda declaradas em `direcoes.md`. | NF-07 |
| Contraste | Pares e mínimos de `direcoes.md`. Texto principal ≥ 7:1. | NF-07, DSG-04 |
| Alvo de toque | Todo elemento tocável tem pelo menos **44 × 44 px** de área (a área pode ser maior que o desenho, com `padding` ou pseudoelemento); entre dois alvos vizinhos, pelo menos 8 px. Ações principais com 48 px de altura. | NF-07 |
| Uma mão | A ação principal de cada tela fica na **faixa de baixo**: na moldura de 844 px, com o topo do botão abaixo de 506 px (os 40 % de baixo). Telas 14 e 15 (web) estão livres desta regra, menos o "eu levo" e o envio da lista de espera. | NF-07 |
| Fonte ampliada | Tamanhos em `rem`; `base.js` muda a raiz para 100 %, 130 % e 200 %. Em 200 %: nada cortado, nada sobreposto, nenhum texto com reticências, nenhuma rolagem horizontal; colunas viram linhas. | NF-08 |
| Mínimos de texto | Corpo 17 px, nada abaixo de 15 px, peso de texto ≥ 400. | DSG-10 |
| Estados sem depender de cor | "Separei", "está no carro", "preciso comprar", "faltou", "conferido" e "atenção" com ícone **e** texto visíveis na lista, a qualquer tamanho de fonte. Em captura em tons de cinza, os estados continuam distinguíveis. | DSG-10 |
| Marcação acessível | Botões são `<button>`, ligações são `<a href>`; alternâncias com `aria-pressed`; cada estado tem nome falado ("Travesseiro da Bia, separei, fora do carro"). Foco visível de 3 px em `texto`. Folhas e painéis prendem o foco e anunciam a abertura. Nenhum caminho só por gesto. | NF-08 |
| Movimento | Até 200 ms; tudo desligado com `prefers-reduced-motion: reduce`. | NF-08 |
| Sem rede no texto | Nenhuma tela diz "carregando" nem depende de conexão; a tela 13 pode dizer que buscar camping exige internet (spec seção 7). | E1-07 |
| Sem marca de terceiros | Nenhum selo de loja, logotipo de serviço (Pix inclusive: a palavra "Pix" aparece em texto, sem o símbolo), bandeira ou personagem. | CLAUDE.md, DSG-12 |

## 9. Página de identidade de cada direção

`<direcao>/identidade.html`, curta (DSG-07), na mesma moldura e com o mesmo estilo da direção:

1. Nome, território e a frase.
2. Paleta: os 10 papéis, em claro e escuro, com o valor e a razão de contraste de cada par (tirados de `direcoes.md`).
3. Tipografia: as famílias, a escala, a licença (SIL OFL 1.1) e o caminho do `OFL.txt`.
4. Ícones: o conjunto inteiro da direção, com o nome de cada um; os de estado em repouso e ativos.
5. Navegação: o modelo, em uma frase e um esquema simples desenhado em HTML e CSS.
6. Mascote: as poses usadas e onde, o apoio do tema escuro, a versão `uma-cor` na cor da direção.
7. Tom de voz: três frases da própria direção.
8. Origem da inspiração e riscos, em poucas linhas.

## 10. O que a apresentação recebe de cada direção

`<direcao>/ficha.js` publica `window.CAMPINGUIM_DIRECOES["<pasta>"]` com:

| Campo | Conteúdo |
| --- | --- |
| `pronta` | `true` só depois da aprovação do QA; antes disso a página inicial mostra "em produção" |
| `numero` | 1 a 5, a ordem de `direcoes.md` |
| `nome`, `territorio`, `frase` | de `direcoes.md`, mas o texto mostrado vem do arquivo de textos da direção (`ficha.js` guarda as chaves) |
| `navegacao` | chave do texto que descreve o modelo em uma linha |
| `inicio` | `"01-abertura.html"` |
| `amostra` | `"04-lista.html"` |
| `identidade` | `"identidade.html"` |
| `cores` | `{ claro: { fundo, acento }, escuro: { fundo, acento } }`, só para a moldura dos cartões da página inicial |

As páginas de apresentação (feitas na etapa 0, em `design/prototipos/`):
- **`index.html`**: as 5 lado a lado (uma coluna no celular), cada uma com nome, território, frase e a amostra da lista em `<iframe src="<pasta>/04-lista.html?moldura=0&avaliador=0&tema=claro">` em tamanho reduzido, com ligações para "Abrir o protótipo" (`01-abertura.html`) e "Identidade". Ligação para comparação, avaliação e, no fim, discreta, para a recomendação.
- **`comparacao.html`**: a tela 4 das cinco em claro e em escuro (10 quadros), mesma escala, mesma altura.
- **`avaliacao.html`**: a folha de avaliação do pedido (8 critérios, de 1 a 5, para cada direção), guardada no navegador com `try/catch`, com "Copiar como texto".
- **`recomendacao.html`**: lê `recomendacao-dados.js`; até a etapa 3, mostra "A recomendação sai depois que os cinco protótipos forem aprovados."

## 11. O que o QA confere

Por protótipo, nesta ordem; cada item reprovado volta com o critério e como reproduzir.

1. **Arquivos.** As 15 telas com os nomes da seção 2, `identidade.html`, `estilo.css`, `textos.js`, `icones.js`, `ficha.js`, e nada mais na pasta.
2. **Abre sem rede.** Cada página abre por `file://` sem erro no console; busca por `http`, `fetch(`, `XMLHttpRequest`, `type="module"`, `import(` e `@import` não acha nada nas pastas dos protótipos e em `_compartilhado/` (fora `OFL.txt`).
3. **Navegação.** As ligações obrigatórias de `telas.md`, seção 5, funcionam **pelo modelo de navegação da direção** (não pela barra do avaliador). O modelo é o descrito em `direcoes.md`.
4. **Dados.** Cada tela contra `telas.md`, valor por valor: família, camping, alertas (chuveiro e churrasco em Atenção, D-01 e P-23), ajustes, regras, a lista inteira (68 itens, quantidades, estados, progresso 65 de 68 e por categoria), aviso de saída, grupo, gastos (R$ 420,00; 7 cotas de R$ 60,00; R$ 180,00; R$ 120,00; R$ 120,00 já pago; Bruno recebe R$ 300,00). Nenhum dado do cenário fora de `dados.js`. Propostas provisórias iguais às de `telas.md`.
5. **Textos.** Nenhum texto visível solto no HTML ou no JS (o `<body>` sem `base.js` fica sem texto); nenhuma chave sem texto (`[chave]`); português do Brasil; estados e categorias com os nomes comuns.
6. **Mascote.** As artes em `mascote.js` iguais às de origem (SHA-256 de `mascote-origem.md`); nenhum `transform`, recorte, filtro ou troca de cor na versão colorida; apoio no tema escuro com contraste ≥ 3:1; no máximo uma vez por tela; nunca em linha de lista, gastos ou formulário; poses conforme a direção.
7. **Cores e contraste.** As variáveis de `estilo.css` iguais às de `direcoes.md`; o QA recalcula os 14 pares de cada tema por script.
8. **Alvos de toque.** Script na moldura de 390 × 844 mede todo elemento tocável (`a`, `button`, `input`, `[role=button]`, `[tabindex]`): pelo menos 44 × 44 px de área de toque. Ação principal na faixa de baixo.
9. **Fonte ampliada.** Capturas em 100 %, 130 % e 200 %, nas telas 4, 6, 11 e 12: nada cortado, sobreposto, com reticências ou rolagem horizontal.
10. **Tema.** Capturas das 15 telas em claro e escuro.
11. **Sem depender de cor.** Captura da tela 4 em tons de cinza: "separei" e "está no carro" distinguíveis por ícone e texto.
12. **Leitor de tela.** Na tela 4, cada item lê nome, quantidade e estado; folhas e painéis prendem o foco.
13. **Fontes.** Os arquivos em `_compartilhado/fontes/` com `OFL.txt`; a página de identidade declara a licença.
14. **Identidade.** `identidade.html` com os 8 blocos da seção 9.
15. **Distinção e originalidade.** Comparação com os outros protótipos já entregues, contra a matriz de `direcoes.md`; nenhum traço da lista de `concorrentes.md` (cores, combinações e formas proibidas por direção).
16. **Premium.** Leitura de olho, com as capturas: poucos elementos, espaço generoso, tipografia cuidada, nada com cara de modelo pronto (DSG-09). O QA descreve o que achou genérico, se achar.
17. **Limpeza.** Nada temporário na pasta; nenhuma imagem de terceiros em lugar nenhum.

Na etapa 0, o QA confere: `dados.js` contra `telas.md` (inclusive as contas), `mascote.js` contra a origem, fontes e licenças, moldura e barra do avaliador nas larguras 390 e 1280, parâmetros de endereço, e as quatro páginas de apresentação com fichas de teste.

## 12. Entrega ao QA

Cada construtor entrega com `handoff_submit` ao QA, informando: ID da feature (DSG-01), IDs do PRD cobertos (DSG-01 a DSG-04, DSG-07 a DSG-13, NF-07, NF-08), a pasta, o que foi feito, os testes que rodou na própria máquina (abrir as 15 telas sem erro no console, script de alvos de toque, capturas em 390 × 844 nos dois temas e em 200 %), as capturas como evidência e, numa reentrega, o que mudou desde a rodada anterior. Pasta temporária própria, fora do projeto, apagada pelo caminho completo antes da entrega. Sem commit.

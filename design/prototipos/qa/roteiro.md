# Roteiro de validação dos protótipos do Campinguim

Roteiro do QA para validar a **base** (etapa 0) e **cada um dos 5 protótipos** (etapa 1) antes de entrarem na apresentação.

Base:
- `docs/brief-cinema-2-prototipos.md` (o pedido);
- `docs/PRD.md` (DSG-01 a DSG-13, NF-07, NF-08, seções 7 a 10);
- `docs/SPEC.md` (seções 5 a 7 e 9);
- `CLAUDE.md`;
- os quatro documentos de `design/prototipos/direcao/`: `telas.md` é o contrato dos dados, `direcoes.md` o de cada direção, `padrao-producao.md` o de arquivos e regras de tela, e `concorrentes.md` o da originalidade.

A seção 11 do padrão de produção lista o que o QA confere; este roteiro diz **como** conferir cada item e **o que reprova**.

O QA julga a tela renderizada e medida, não a intenção. Toda conclusão sai de uma captura ou de uma medição guardada em `design/prototipos/qa/relatorios/<pasta>-rR/`, citada no relatório `design/prototipos/qa/relatorios/<pasta>-rodada-R.md` (pasta = `base`, `brasa`, `clareira`, `oficina`, `rumo`, `roda`). APROVADO ou REPROVADO vai no topo. Reprovação volta direto a quem entregou; aprovação vai ao piloto. Na terceira reprovação seguida do mesmo protótipo, aviso ao piloto.

---

## 1. Ferramentas nesta máquina

- **`design/mascote/qa/captura.py`** (Python 3.12, Playwright, Pillow, Google Chrome instalado), já em uso no mascote:
  - `pagina` com `--auditar` dá rolagem horizontal, erros de console, pedidos externos, alvos menores que 44 px e textos abaixo de AA;
  - aceita endereço com parâmetros (`…/04-lista.html?tema=escuro&fonte=200`) e `http://`.
- **`design/prototipos/qa/prototipo.py`**: escrito pelo QA quando a base chegar, porque depende do DOM da base. Para cada uma das 15 telas, em 390 × 844 (densidade 3) e 1280 × 900, nos dois temas e nas fontes 100, 130 e 200 %, ele faz:
  - captura de tela;
  - console e pedidos;
  - contagem de `<h1>`;
  - texto `[chave]` visível;
  - alvos de toque menores que 44 × 44 e vãos menores que 8 px entre alvos vizinhos;
  - posição da ação principal (topo abaixo de 506 px na moldura);
  - quantidade de mascotes por tela;
  - texto com reticências ou cortado (`scrollWidth > clientWidth`);
  - rolagem horizontal;
  - contraste de todo texto visível (AA, e 7:1 para o texto principal);
  - uma versão em tons de cinza da tela 4.
- **Busca em arquivo** (Grep do Claude Code) para as proibições de código e de dados.
- **SHA-256** por Python (`hashlib`) para o mascote.
- **Navegação:** script que clica nos controles do próprio app (não na barra do avaliador), segue as ligações obrigatórias de `telas.md` (seção 5) e registra a tela de chegada.
- Limite: não há motor WebKit (Safari) nesta máquina. O teste no iPhone fica para o responsável.

Temporários do QA ficam na pasta temporária da sessão e são apagados pelo caminho completo ao fim de cada rodada.

---

## 2. Etapa 0 · a base

| O que | Como | Reprova se |
| --- | --- | --- |
| `dados.js` contra `telas.md` | leitura do objeto `window.CAMPINGUIM_DADOS` por script e comparação campo a campo com as tabelas de `telas.md` | qualquer nome, número, quantidade, estado, valor ou texto diferente; proposta provisória sem `provisorio: "P-nn"` ou diferente da de `telas.md`; dado do cenário inventado |
| Contas | recalcular por script, a partir de `dados.js`: 68 itens (por categoria), 65 no carro, 3 "separei", 0 "a separar"; fórmulas da spec (gás, gelo, água, lixo, papel, cadeiras, lanterna, mudas, manta, agasalho, muda por criança, carvão, ração, refeições); gastos em centavos (H = 14, meia cota 3000, 18000 + 12000 + 12000 = 42000, Bruno recebe 30000) | qualquer conta que não feche |
| Textos comuns | `textos.js` com os nomes dos estados e das categorias, em pt-BR | texto visível fora dos arquivos de texto; estado ou categoria com outro nome |
| Mascote | SHA-256 de cada arte em `mascote.js` contra o arquivo de origem em `design/mascote/apresentacao/opcoes/03/arte/` e contra `mascote-origem.md` | um byte diferente; arte que não seja da opção 03 aprovada |
| Fontes | arquivos em `_compartilhado/fontes/<familia>/` com o `OFL.txt` de cada família; `@font-face` local | fonte por serviço; família sem `OFL.txt`; fonte fora da lista do padrão |
| Tudo local | busca por `http://`, `https://`, `fetch(`, `XMLHttpRequest`, `type="module"`, `import(`, `@import` em `design/prototipos/` (fora `OFL.txt` e documentos `.md`); `captura.py` com zero pedido externo | qualquer achado |
| Moldura e barra do avaliador | capturas em 390 × 844 (sem moldura, faixa de 44 px no topo) e 1280 × 900 (moldura de 390 × 844 com borda de 12 px e cantos de 44 px, fundo neutro, barra à esquerda); parâmetros `tema`, `fonte`, `moldura=0`, `avaliador=0`, `novo=1` testados um por um | moldura com marca de aparelho, entalhe ou barra de status falsa; barra por cima do app; parâmetro que não funciona |
| Páginas de apresentação | `index.html`, `comparacao.html`, `avaliacao.html` (8 critérios do pedido, notas guardadas com `try/catch`, "Copiar como texto") e `recomendacao.html`, com fichas de teste | parte do formato do pedido faltando; recomendação alcançável antes do fim; erro de console |
| Estrutura | árvore de pastas e nomes iguais à seção 2 do padrão | arquivo a mais, nome diferente, temporário |

---

## 3. Etapa 1 · cada protótipo

Na ordem da seção 11 do padrão. Cada item reprovado volta com o critério, a captura e como reproduzir.

### 3.1 Arquivos e limpeza

- **Como:** listar a pasta da direção.
- **Reprova se:** faltar uma das 15 telas, `identidade.html`, `estilo.css`, `textos.js`, `icones.js` ou `ficha.js`, ou houver arquivo a mais (imagem, temporário, cópia).

### 3.2 Abre sem rede

- **Como:** `prototipo.py` nas 15 telas por `file://` e por servidor estático local; busca das proibições de código na pasta.
- **Reprova se:** houver um erro de console, um pedido externo ou um achado na busca.

### 3.3 As 15 telas

- **Como:** captura de cada tela em 390 × 844 e na moldura de 1280 × 900, nos dois temas; leitura do conteúdo contra a tabela da tela em `telas.md`.
- **Reprova se:** faltar tela ou bloco que `telas.md` manda mostrar; houver bloco que `telas.md` manda deixar de fora (por exemplo, progresso por família na tela 11, link de política na tela 15); a tela estiver fora da ordem.

### 3.4 Navegação pelo modelo da direção

- **Como:** script que percorre as ligações obrigatórias de `telas.md` (seção 5) **pelos controles do app**, sem a barra do avaliador. Ele registra a tela de chegada de cada ligação e confere que o modelo é o de `direcoes.md`:
  - Brasa: folhas, no máximo duas empilhadas, fechar volta à anterior, seletor de 4 áreas dentro da folha;
  - Clareira: 4 abas fixas com ícone e texto;
  - Oficina: 5 divisórias na borda e "trocar lado";
  - Rumo: 5 paradas tocáveis e a legenda com rótulo de texto;
  - Roda: mural de 6 blocos e "Mural" no rodapé.
- **Reprova se:**
  - uma ligação obrigatória não funciona ou leva a outra tela;
  - o único caminho for gesto (arrastar ou deslizar);
  - o modelo for diferente do declarado;
  - uma folha ou painel não prende o foco;
  - não houver como voltar.

### 3.5 Dados idênticos

- **Como:** texto visível de cada tela lido por script e comparado com `telas.md`, valor por valor:
  - família e camping;
  - alertas, com o nível decidido para o churrasco;
  - ajustes e regras;
  - os 68 itens da lista (nome, quantidade, unidade, estado) e o progresso, total e por categoria;
  - aviso de saída;
  - estadia, volta e em casa;
  - fato e histórico;
  - grupo;
  - gastos (R$ 420,00; 7 cotas de R$ 60,00; R$ 180,00; R$ 120,00; R$ 120,00 já pago; Bruno recebe R$ 300,00);
  - camping sem dados e texto de perguntas;
  - convidado e site.

  Também, por busca, nenhum dado do cenário ("420", "Recanto", "Lucas", "Bia", "Bruno", "Pedra Lisa", "220 V", e afins) fora de `_compartilhado/dados.js` nos arquivos da direção.
- **Reprova se:** um dado divergir, aparecer texto de preenchimento, o cenário estiver escrito fora de `dados.js`, ou a direção recalcular a divisão em vez de ler os dados.

### 3.6 Textos

- **Como:** carregar cada tela sem `base.js` (o `<body>` deve ficar sem texto); busca por `[` + chave visível; leitura do português.
- **Reprova se:** houver texto solto no HTML ou no JS, chave sem texto, texto fora do pt-BR, estado ou categoria com outro nome, texto legal inventado, a palavra "carregando", ou o símbolo do Pix (só a palavra "Pix" é permitida).

### 3.7 Mascote

- **Como:**
  - SHA-256 do que a página injeta contra a origem;
  - CSS da direção conferido (nada de `transform`, `clip-path`, `filter`, `opacity` menor que 1 ou animação no SVG do mascote; `fill` só na `uma-cor`);
  - contagem por tela (no máximo 1);
  - posição (nunca em linha de lista, em gastos ou em formulário);
  - poses contra a tabela da direção;
  - no escuro, contraste do apoio contra o corpo `#4A5560` (pelo menos 3:1) e a forma do apoio (nunca disco azul);
  - no Rumo, o ícone de 24 px na rota continua legível.
- **Reprova se:** qualquer desses falhar, ou se o mascote estiver redesenhado, espelhado, cortado, com balão, com texto ou com a cor trocada.

### 3.8 Cores e contraste

- **Como:**
  - variáveis de `estilo.css` comparadas com as tabelas de `direcoes.md`;
  - os 14 pares de cada tema recalculados por script;
  - `prototipo.py` mede o contraste de **todo texto visível renderizado** nos dois temas;
  - texto principal com pelo menos 7:1, secundário com pelo menos 4,5:1, ícone e borda com significado com pelo menos 3:1.
- **Reprova se:** uma variável for diferente da tabela, uma cor ficar fora das variáveis (exceto o mascote e os emblemas da Roda) ou um texto ficar abaixo do mínimo na tela de verdade.

### 3.9 Alvos de toque e uma mão

- **Como:** `prototipo.py` mede todo elemento tocável (`a`, `button`, `input`, `select`, `textarea`, `summary`, `[role=button]`, `[tabindex]`) na moldura de 390 × 844, inclusive a área ampliada por `padding` ou pseudoelemento, e o vão entre alvos vizinhos.
- **Reprova se:**
  - um alvo tiver menos de 44 × 44 px de área;
  - dois alvos vizinhos tiverem menos de 8 px de vão;
  - a ação principal tiver menos de 48 px de altura;
  - o topo da ação principal ficar acima de 506 px nas telas do app (as telas 14 e 15 são livres, menos o "eu levo" e o envio da lista de espera).

### 3.10 Fonte ampliada

- **Como:** capturas em 100, 130 e 200 % nas telas 4, 6, 11 e 12 (e em qualquer outra em que o script acuse corte), mais a medição de corte, reticência e rolagem horizontal.
- **Reprova se:** algo ficar cortado, sobreposto, com reticências ou com rolagem horizontal, ou se uma coluna não descer para linha quando não couber.

### 3.11 Tema claro e escuro

- **Como:** capturas das 15 telas nos dois temas, com `?tema=` e com o tema do sistema.
- **Reprova se:** um elemento sumir, ficar ilegível ou mudar de lugar entre os temas, ou se o tema do sistema não for respeitado sem parâmetro.

### 3.12 Sem depender de cor

- **Como:** tela 4 em tons de cinza (Pillow) e com simulação de daltonismo vermelho-verde; os estados "separei", "está no carro", "preciso comprar", "faltou", "conferido" e "atenção" lidos na lista, nos dois temas e em 200 %.
- **Reprova se:** dois estados ficarem iguais sem cor, ou se ícone ou texto do estado sumirem em algum tamanho.

### 3.13 Leitor de tela e marcação

- **Como:** árvore de acessibilidade do Chrome (Playwright `accessibility.snapshot`) na tela 4 e nas folhas e painéis.
- **Reprova se:**
  - um item não ler nome, quantidade e estado ("Travesseiro da Bia, separei, fora do carro");
  - houver alternância sem `aria-pressed`;
  - um botão não for `<button>` ou um link não for `<a href>`;
  - o foco visível tiver menos de 3 px;
  - folha ou painel não prender o foco nem anunciar a abertura;
  - um caminho existir só por gesto;
  - houver movimento acima de 200 ms ou que não desliga com `prefers-reduced-motion`.

### 3.14 Fontes e licença

- **Como:** família e arquivo usados pela direção, contra o padrão (seção 5) e a página de identidade.
- **Reprova se:** a fonte for diferente da declarada, faltar a licença na página de identidade ou houver fonte do sistema no lugar da declarada (sem o arquivo local carregado).

### 3.15 Página de identidade

- **Como:** leitura de `identidade.html` contra os 8 blocos da seção 9 do padrão e os dados de `direcoes.md`.
- **Reprova se:** faltar bloco, ou se a paleta, os contrastes, a tipografia, os ícones, o modelo de navegação ou o uso do mascote divergirem de `direcoes.md` ou do protótipo.

### 3.16 Distinção e originalidade (DSG-01, DSG-08, DSG-12)

- **Como:** capturas da tela 4 e de uma tela de grupo ou gastos lado a lado com as dos protótipos já entregues, contra a matriz de `direcoes.md`; proibições por direção de `concorrentes.md` conferidas na tela. Exemplos: bússola e rosa dos ventos no Rumo; flor-de-lis, corda e nó na Roda; chama desenhada na Brasa; verde lima ou vivo na Clareira; faixa zebrada na Oficina; caixa redonda azul, visto vermelho e envelope em todas. Feito por descrição e busca em texto, sem busca reversa de imagem.
- **Reprova se:** duas direções se confundirem (mesma linguagem, só cor trocada) ou se aparecer traço proibido ou reconhecível de concorrente.

### 3.17 Barra premium (DSG-09)

- **Como:** leitura de olho com as capturas, com as perguntas da seção 5a do roteiro do mascote adaptadas a tela:
  - poucos elementos;
  - hierarquia clara;
  - espaço generoso (16 px nas bordas, 24 px entre blocos);
  - tipografia cuidada (escala da direção, nada abaixo de 15 px, peso de pelo menos 400);
  - paleta contida;
  - um elemento-assinatura usado com parcimônia;
  - nenhum enfeite que não informe.
- **Reprova se:** a tela tiver cara de modelo pronto ou de app genérico de lista (risco declarado da Clareira); a assinatura aparecer em excesso; houver sombra pesada, degradê pronto, ilustração de banco, emoji ou foto. O QA descreve o que achou genérico e o que mudar.

---

## 4. Etapa 3 · recomendação e apresentação

Depois dos cinco aprovados:
- a recomendação da Cinema em página separada, alcançável só no fim;
- a página inicial com as 5 lado a lado (nome, frase e amostra da lista);
- a comparação com a tela 4 das cinco em claro e escuro, mesma escala;
- a folha de avaliação com os 8 critérios do pedido.

Mesmos critérios de console, rede, toque, contraste e textos da seção 2.

---

## 5. Relatório

```markdown
# <Direção> · rodada R · APROVADO | REPROVADO

Data · Entregue por · Pasta · IDs cobertos

## O que precisa mudar (se reprovado)
1. <critério> · <captura ou medição> · <como reproduzir> · <o que mudar>

## Resultado por item (3.1 a 3.17)
| Item | Resultado | Evidência |

## Saída das ferramentas
<resumo de prototipo.py, contas e buscas>
```

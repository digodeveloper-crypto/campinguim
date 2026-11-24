# DSG-05 (registro da escolha) e DSG-06 (referência visual) · rodada 1 · REPROVADO (1 item)

Data: 2026-11-24 · Entregue por: pane-618 · Alvo: `docs/DESIGN.md` (novo); em `design/prototipos/`: `rumo/paleta.js`, `rumo/estilo.css`, `rumo/paletas.html`, `rumo/textos.js`, `rumo/identidade.html`, `rumo/ficha.js` e `LEIA-ME.md`
Base: commit `eba53ce`; relatórios `rumo-rodada-3.md` e `rumo-paletas-rodada-1.md`; escolha do responsável (Rumo, Eucalipto, mascote 03, 24/11/2026).

**Resumo:**
- **A troca de padrão está correta.** Sem parâmetro, as 15 telas do Rumo são idênticas, pixel a pixel, às da Eucalipto aprovada. Com `?paleta=original`, são idênticas às do Rumo aprovado na rodada 3. Só a identidade mudou, como declarado.
- A página de cores, a página inicial e a comparação passam na auditoria. A marca "Escolhida" está na Eucalipto, e a paleta segue de tela em tela.
- O `DESIGN.md` é sólido:
  - os 28 valores de contraste, os do mascote, os matizes e os da proposta de destaque do vídeo batem com o cálculo do QA;
  - as medidas, a escala de tipo, os 30 ícones, os textos do tom de voz e os riscos batem com o protótipo;
  - as citações conferidas existem, com uma exceção.
- **Uma citação não existe:** a divergência D-5 atribui ao brief 2 a expressão "vazios e erros", que não está lá nem em nenhum outro documento do projeto. O próprio arquivo diz que "cada valor daqui vem do protótipo aprovado ou de um documento do projeto, e a origem está citada", então a origem precisa ser verdadeira.

**Evidências** em `qa/relatorios/dsg05-r1/`:
- `padrao/` e `original/`: `prototipo.py` sem parâmetro e com `--extra paleta=original` (16 páginas × 2 temas × 3 fontes), cada uma com `medicao.txt`;
- `pagina/`: auditoria de `rumo/paletas.html`, `index.html` e `comparacao.html`.

## Item que reprova

| # | Onde | O que diz | O que existe | O que fazer |
| --- | --- | --- | --- | --- |
| 1 | `docs/DESIGN.md`, seção 15, D-5 | "brief 2, telas · O pedido fala em 'vazios e erros'." | A expressão não aparece em `docs/brief-cinema-2-prototipos.md` (a tela 13 é "Estado vazio"; não há "erro" no brief), nem em `docs/PRD.md`, `docs/SPEC.md` ou `design/prototipos/direcao/`. Busca: `grep -rniE "vazios? e (de )?erros?\|estados? de erro" docs/ design/prototipos/direcao/` só acha o próprio `DESIGN.md` | Tirar a citação falsa. Na coluna "Onde", pôr a origem verdadeira, ou escrever que nenhum documento define a forma do erro. O conteúdo pode ficar: o protótipo não tem estilo próprio de erro (a `.mensagem` é texto em peso 600, sem cor nem ícone), e a forma do erro no app fica em aberto. Se a seção 7.10 tiver a mesma origem, ajustar lá também |

## O que passou

| Item | Resultado | Como conferi |
| --- | --- | --- |
| Escopo | ok. `git status` mostra só os 6 arquivos de `rumo/`, o `LEIA-ME.md` e o `docs/DESIGN.md` novo; nenhum arquivo da raiz nem de outra direção; nenhum arquivo solto | `git status`, `git diff --stat eba53ce` |
| Sem parâmetro = Eucalipto aprovada | ok: **180 de 180** capturas das 15 telas (2 temas × 3 fontes, com as rolagens inteiras) são iguais, pixel a pixel, às de `rumo-paletas-r1/eucalipto/`. Só a identidade difere, pelo parágrafo novo | comparação, tolerância 2/255 |
| `?paleta=original` = Rumo aprovado | ok: **179 de 180** iguais às de `rumo-r3/medicao/`. A diferente é a abertura em claro e 100 %, com 1 pixel de 44/255, a mesma rasterização já registrada. A identidade difere pela ligação "opções de cor" (rodada das paletas) e pelo parágrafo novo | comparação |
| Medição nos dois casos (96 combinações cada) | ok: 0 erro, 0 pedido externo, 0 rolagem lateral, h1 = 1 em todas, 0 alvo pequeno, 0 texto cortado, 0 texto abaixo do contraste. Só as marcas já aceitas: as palavras partidas `bruno@example.com` e "fontes" (caminho OFL) em 200 %, e os 10 vãos contra a legenda fixa | `medicao.txt` |
| `paleta.js` | ok. Sem parâmetro, com `eucalipto` ou com `xyz`: `data-paleta="eucalipto"`, `--fundo #DCE8E2`. Com `original`: sem `data-paleta`, `--fundo #F3EEE2` | teste no navegador |
| Paleta ao navegar | ok. Saí de cada botão de `paletas.html` e cliquei por 01 → Começar → parada Carregar → Legenda → Grupo: a Original e a Geleira e a Jabuticaba levam `?paleta=` em todas as telas; a Eucalipto segue sem parâmetro. 0 erro de console | teste de clique |
| Identidade | ok. Sem parâmetro: "Paleta oficial: Eucalipto, escolhida pelo responsável em 24/11/2026…", com a tabela em `#DCE8E2`/`#0C1615`. Com Original ou Pitanga: "Esta página mostra a paleta {nome}, só para comparar. A oficial é a Eucalipto." | teste no navegador |
| `paletas.html` | ok. A Eucalipto tem a marca em texto ("ESCOLHIDA" e a nota), o anel por fora e a mesma largura das outras (358 px nas cinco a 390). O botão dela abre `01-abertura.html`, e o da Original abre `?paleta=original`. Em 390 e 1440, claro e escuro: 0 rolagem, 0 erro, 0 pedido externo, 0 alvo menor que 44, 0 texto abaixo do AA | `captura.py --auditar`; capturas olhadas |
| Página inicial e comparação | ok. O cartão do Rumo mostra a Eucalipto e as ligações abrem o Rumo sem parâmetro. Auditoria limpa nas 4 combinações de cada página | `captura.py --auditar` |
| Miniaturas (`rumo/paletas/`) | ok, continuam válidas: as telas 1, 3 e 4 não mudaram (comparação acima), então a condição do relatório das paletas não se aplica. A receita do `LEIA-ME` foi atualizada | comparação |
| `DESIGN.md` §3: cores e contraste | ok. Os 10 papéis batem com `estilo.css` §1b. Os 14 pares nos 2 temas, recalculados pelo QA, batem todos na segunda casa. Também batem o botão alternado ligado (13,40 e 15,47); o mascote (corpo 6,05, 7,15 e 6,40; gorro 2,25, 2,66, 2,83 e 2,57); e os matizes (acento e gorro 183°; fundo 150° com saturação 0,21; gorro 0,47) | script do QA |
| §4 e §5: tipo e medidas | ok nas amostras conferidas em `estilo.css`: letreiro 36/40, 125, 800, +0,08 em; título 26/30, 125, 700; botão 17/22, 112,5, mínimo de 56 px; rota 15/18, 85, 500; alvo da rota 64 × 48; item 64; linha 56; selo 10/16; legenda 15/20, 125, 700; chanfros 4, 7, 8, 10 e 14 px | `grep` em `estilo.css` |
| §6: ícones | ok: `ORDEM` em `icones.js` tem os 30 nomes, na ordem da tabela | leitura |
| §8: mascote | ok: larguras de 176, 136, 96, 32, 24 e 88 px no CSS; regras iguais às de `padrao-producao.md` §6 | `grep`, leitura |
| §10: tom de voz | ok: os 13 textos citados existem, literalmente, em `rumo/textos.js` ou em `_compartilhado/textos.js` | busca literal |
| §11: proposta de destaque do vídeo | ok e bem marcada como **proposta, não decisão**: `#A3C8F2` contra `#111827` 10,22 (o de teste dá 10,05), contra `#0C1615` 10,60, com letra `#06202b` 9,69, contra o gorro 1,63 (o de teste dá 1,60); matiz 212° contra 196°. As citações da TECNICA-3D (§6 "a mesma do selo", §7 item 5 vinheta, §15 `marca/tokens.json`) existem | script do QA, `grep` |
| §12: riscos | ok: são os 4 de `recomendacao-dados.js`, sem resolver nenhum | leitura |
| Outras citações | ok: guia §2, §3 (3:1 e "mesma família de cor do gorro"), §6 e §13; P-20 em `telas.md`; NF-07, NF-08, NF-09, DSG-10, DSG-11, DSG-12 no PRD; SPEC §13 ("Leitura sob sol e uso com uma mão"); `direcoes.md` (≥ 4,5 para sobre-acento/acento; apoio `#EDE6D6`; "Ao ar livre"; "o mapa lido com lanterna"); brief 2 ("44 pontos"); "Filhote de gorro" nos documentos do mascote | `grep` |
| Regras do CLAUDE.md | ok: nenhum segredo; nenhuma marca ou imagem de terceiros (o Google Fonts aparece só como origem da fonte OFL); textos novos em `textos.js`; nada de commit | leitura |

## Para o piloto (não reprova)

- **D-4 precisa de resposta do responsável.** O guia do mascote (seção 3) diz para não pôr o mascote "sobre um fundo da mesma família de cor do gorro ou dos pés". O fundo claro da Eucalipto (verde-cinza, 150°) fica a 2,25:1 do gorro. O QA aprovou o mascote nessa paleta pelo corpo (6,05:1, mínimo 3:1), mas não julgou a regra de família de cor, que é do dono do guia. O `DESIGN.md` deixa a questão aberta, corretamente.
- As outras perguntas abertas (§14, 9 itens) e as divergências D-1, D-2, D-3, D-6 e D-7 estão registradas sem decisão, como pede o CLAUDE.md.

---

# Rodada 2 · 2026-11-24 · pane-618 · REPROVADA (1 item, a mesma divergência)

- **Escopo:** ok. Depois da rodada 1, só `docs/DESIGN.md` mudou: nenhum arquivo de `design/prototipos/` tem data posterior ao relatório. A citação falsa do brief saiu da §15 e da §7.10.
- **O texto novo afirma algo que não é verdade.** O D-5 agora diz que nem o brief, "nem o PRD, nem a SPEC, nem `design/prototipos/direcao/` falam em erro". Mas a SPEC fala, e é justamente a fonte que faltava:
  - `docs/SPEC.md` §7, "Estados que toda tela trata" (linhas 573 a 579): "**Vazio:** com uma ação clara, nunca uma tela em branco" e "**Erro:** mensagem em português simples, com o que a pessoa pode fazer". É a origem provável do "vazios e erros" do pedido;
  - a SPEC também fala em erro na linha 210 ("Nenhuma tela de erro por falta de rede…") e na linha 588 (códigos de erro do servidor).

| # | Onde | O que fazer |
| --- | --- | --- |
| 1 | `docs/DESIGN.md` §15, D-5 (e a frase nova da §7.10) | Citar a origem real: SPEC §7, "Estados que toda tela trata". A SPEC define o **conteúdo** do erro (português simples, com o que a pessoa pode fazer) e o vazio (uma ação clara), mas não a **forma visual** do erro. Tirar "nem a SPEC fala em erro" e "nenhum documento do projeto". O resto pode ficar: o protótipo não tem estilo próprio de erro (`.mensagem` em peso 600, sem cor nem ícone), e a forma visual segue em aberto. Na §7.10, trocar "nenhum documento do projeto define a forma do erro" por "a SPEC (§7) define o texto do erro, não a forma visual" ou equivalente |

Conferido com: `grep -niE "\berros?\b" docs/PRD.md docs/SPEC.md docs/brief-cinema-2-prototipos.md design/prototipos/direcao/` e leitura da SPEC §7. Brief e PRD não falam em erro; `direcao/` só fala em erro de console, o que não conta.

---

# Rodada 3 · 2026-11-24 · pane-618 · APROVADA

- **D-5:** "Onde" agora é `docs/SPEC.md` §7, "Estados que toda tela trata". As duas frases citadas ("com uma ação clara, nunca uma tela em branco" e "mensagem em português simples, com o que a pessoa pode fazer") estão na SPEC, palavra por palavra (bloco a partir da linha 572). A afirmação é verdadeira: a SPEC define o conteúdo do vazio e do erro, não a forma visual. Saíram "nenhum documento do projeto" e "nem a SPEC fala em erro".
- **§7.10:** "A SPEC (§7) define o texto do erro, não a forma visual." Está correto.
- **Escopo:** depois da rodada 2, só `docs/DESIGN.md` mudou. Os arquivos do protótipo continuam como foram medidos na rodada 1, então as medições valem.
- **Resultado:** DSG-05 (escolha registrada: Rumo, Eucalipto, mascote 03, 24/11/2026) e DSG-06 (referência visual em `docs/DESIGN.md` e no Rumo sem parâmetro) aprovados.
- **Continua para o piloto:** a D-4 (o gorro sobre o fundo verde-cinza claro da Eucalipto, a 2,25:1, contra a regra "mesma família de cor" do guia) pede resposta do responsável.

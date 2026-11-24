# Protótipo 3 · Oficina (DSG-01 a DSG-13) · rodada 1 · REPROVADO (1 item)

Data: 2026-11-24 · Entregue por: pane-598 · Alvo: `design/prototipos/oficina/`
Base: `qa/roteiro.md`, seção 3; `direcao/direcoes.md`, seção 3; `direcao/telas.md`; `direcao/padrao-producao.md`.

**Resumo:**
- **O que passou:**
  - os dados são idênticos aos de `telas.md`;
  - todos os caminhos obrigatórios funcionam pelos controles do próprio app;
  - paleta, fontes, ícones, mascote e página de identidade seguem a direção;
  - não há nenhum erro, nenhum pedido à rede, nenhum alvo de toque pequeno e nenhum texto abaixo do contraste mínimo, nas 16 páginas, nos 2 temas e nos 3 tamanhos de letra.
- **O que trava:** nomes de item e de categoria se **partem no meio da palavra** ("Rem / édio / do / Luca / s", "Carregad / or"). Acontece já na letra normal, no aviso de saída, e piora em 130 % e 200 %. A coluna do nome fica espremida entre a quantidade em fonte mono, o botão de estado e as divisórias, e a quebra é forçada dentro da palavra em vez de a quantidade descer de linha.

**Evidências** em `qa/relatorios/oficina-r1/`:
- `medicao/`: `prototipo.py` nas 16 páginas × 2 temas × 3 fontes. Para cada combinação há a tela como aparece (`<tela>-<tema>-<fonte>.png`), a rolagem inteira (`-inteira.png`, em que as partes fixas se repetem em cada faixa), os tons de cinza da tela 4 e `medicao.txt`;
- `telas-claro-100.png`, `telas-escuro-100.png`, `telas-claro-200.png`: as 15 telas lado a lado;
- `06-concluido.png`: aviso de saída depois de pôr os 3 itens no carro.

**Ferramenta:** a partir desta rodada, `prototipo.py` também acusa a **palavra partida entre linhas**. Antes, a medição de corte e reticências não pegava esse caso.

## Item que reprova

| # | Item (roteiro) | Onde | O que fazer |
| --- | --- | --- | --- |
| 1 | **Palavra partida no meio (3.10)** | **100 %:** tela 6 ("Rem/édio/do/Luca/s", "Carregad/or", em `06-aviso-de-saida-claro-100.png`); tela 8 ("Documentos"). **130 %:** tela 4 ("Remédio", "Lucas", "Extensão", "elétrica", "Carregador"); tela 6 ("Travesseiro", "Carregador"); tela 8 (quase todos os itens: "Espeques", "frigideira", "talheres", "potável", "Agasalho"...). **200 %:** tela 4 (os nomes das 12 categorias e "Conferir os aparelhos") e tela 8 ("Desmontagem", "Primeiros socorros e segurança", "Ferramentas", "Documentos"). Iguais nos dois temas; lista completa em `medicao.txt`, linhas `partidas` | Nunca partir uma palavra: tirar a quebra forçada (`overflow-wrap: anywhere` ou `word-break`) dos nomes. Quando nome, quantidade e estado não couberem lado a lado, a **quantidade desce para a linha de baixo**, como manda o padrão ("coluna desce para linha quando não couber"). Vale para as linhas da lista, do aviso de saída e da volta, e para os cabeçalhos de categoria. Conferir em 100, 130 e 200 % e com as divisórias dos dois lados |

Não reprovam: o e-mail do Pix em 200 % na tela 12 e os caminhos de arquivo na página de identidade (`ibmplexsanscondensed/OFL.txt`) também quebram. São cadeias longas sem espaço, e quebrar é o certo.

## O que passou

| Item (roteiro) | Resultado | Como conferi |
| --- | --- | --- |
| 3.1 Arquivos | ok: 15 telas, `identidade.html`, `estilo.css`, `textos.js`, `icones.js`, `ficha.js`; nada a mais | lista da pasta |
| 3.2 Sem rede | ok: 0 erro de console, 0 exceção e 0 pedido externo nas 96 combinações; nenhum `http`, `fetch`, `XMLHttpRequest`, módulo, `import(` ou `@import`; nada guardado no navegador fora de `CAMPINGUIM.guardado` | `medicao.txt`, busca |
| 3.3 As 15 telas | ok: todas presentes, na ordem, com os blocos de `telas.md`; sem progresso por família na tela 11 | capturas |
| 3.4 Navegação | ok: as 16 ligações obrigatórias de `telas.md` (seção 5), testadas clicando **só nos controles do app**, chegam à tela certa. Exemplos: 1→2→3→4; item→5; voltar→4; Vou sair→6; Sair assim mesmo→7; depois dos 3 no carro aparece "Confirmar saída"; Som até 22h→10; aba Volta→8; Concluir a volta→9; fato a partir da 3 com voltar→3; aba Grupo→11; Gastos e "Carne"→12; Pedra Lisa→13; convidado→14; Ver o site→15. São 5 divisórias na borda direita (Lista, Camping, Grupo, Gastos, Volta), com ícone e rótulo na horizontal, mais "Trocar o lado das divisórias" (`aria-pressed`, guardado com proteção). As telas 14 e 15 não têm divisórias. "Faltou algo" abre um diálogo com o foco em "fechar" | `qa/navegar.py` |
| 3.5 Dados | ok: os 68 itens lidos na tela 4 (com todas as categorias abertas) têm nome, quantidade e estado iguais aos de `dados.js`; "65 de 68 no carro", "3 fora do carro" e o progresso por categoria conferem; gastos R$ 420,00, 7 cotas de R$ 60,00, R$ 180,00, R$ 120,00 já pago e R$ 120,00; nenhum dado do cenário escrito nos arquivos da direção | leitura da tela, busca |
| 3.6 Textos | ok: nenhum texto solto no HTML nem no JS da direção; nenhuma `[chave]` visível; sem "carregando"; Pix só como palavra | busca, `medicao.txt` |
| 3.7 Mascote | ok: no máximo 1 por tela do app (a identidade mostra 5, como pede o padrão); `principal` na etiqueta da abertura e do site; `pose-alerta` na atenção; `pose-camping` na estadia; `pose-comemorando` no aviso de saída concluído; `uma-cor` em `texto-suave` no cabeçalho, a 40 px. O CSS só tem `width` e `fill` na `uma-cor`. Apoio `#E7E0D1` nos dois temas | CSS, capturas |
| 3.8 Cores | ok: as 10 variáveis dos dois temas são iguais às de `direcoes.md`, e o apoio do mascote também; não há cor fora das variáveis (os degradês são só o tracejado da costura); nenhum texto renderizado abaixo do mínimo; texto principal acima de 7:1 (o secundário fica em 6,57 e o estado "separei" em 5,98, acima de 4,5) | `estilo.css`, `medicao.txt` |
| 3.9 Toque e uma mão | ok: nenhum alvo menor que 44 × 44; ação principal de 48 px com o topo em 784 (abaixo de 506). Os dois "vãos" acusados (desfazer/Ver a lista na 3; eu levo/Lembrar quem falta na 11, em 130 %) são de conteúdo que rola por baixo do rodapé fixo, e não de alvos vizinhos | `medicao.txt` |
| 3.11 Temas | ok: as 15 telas iguais nos dois temas, sem elemento sumido | `telas-*-100.png` |
| 3.12 Sem cor | ok: os estados sempre com ícone e texto ("está no carro", "separei · fora do carro", "não conferido"); tela 4 em cinza legível | `04-lista-*-cinza.png` |
| 3.13 Marcação | ok na amostra: o item lê "Travesseiro da Bia, 1, separei, fora do carro"; as alternâncias têm `aria-pressed`; os botões são `<button>` e os links são `<a href>`; o diálogo prende o foco. Movimento só na seta da categoria (150 ms) | navegação, CSS |
| 3.14 Fontes | ok: IBM Plex Sans Condensed (400, 500, 600) e IBM Plex Mono (500), carregadas dos arquivos locais; a licença aparece na identidade | `document.fonts` |
| 3.15 Identidade | ok: os 8 blocos do padrão (Território, Paleta, Tipografia, Ícones, Navegação, Mascote, Tom de voz, Origem e riscos) | leitura |
| 3.16 Distinção | ok por ora: costura tracejada, cantos de 6 px, divisórias na borda e mono nas quantidades, sem faixa zebrada. A comparação lado a lado com as outras direções é refeita quando as cinco estiverem aprovadas | capturas |
| 3.17 Premium | ok: densa e precisa, como pedido; a costura só nos cartões que agrupam; ilhós no botão principal; sem sombra, foto nem emoji | capturas |

## Observações (não reprovam)

- **Rótulo "Camping" nas divisórias:** o texto ocupa 53 px numa aba de 56 px e fica a **1 px da borda da tela** (336..389 numa tela de 390), dos dois lados e em todos os tamanhos. Num celular de cantos curvos, a última letra pode encostar na curva. Vale dar 4 px de respiro, nem que seja reduzindo o espaço entre letras ou a margem interna da aba.
- **Letra em 200 %:** as divisórias passam a ocupar 112 px dos 390, e a coluna do conteúdo cai para uns 260 px. Ao corrigir o item 1, conferir que a dica da tela 4 e os cartões continuam legíveis nessa largura.
- **Tela 13:** usa `pose-alerta`, que a tabela da direção não lista ("pouco e preciso"). Faz sentido para um camping sem dados, mas registre na identidade se for ficar.

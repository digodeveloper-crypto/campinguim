# Protótipo 5 · Roda (DSG-01 a DSG-13) · rodada 1 · REPROVADO (2 itens)

Data: 2026-11-24 · Entregue por: pane-604 · Alvo: `design/prototipos/roda/`
Base: `qa/roteiro.md`, seção 3; `direcao/direcoes.md`, seção 5; `direcao/telas.md`; `direcao/padrao-producao.md`.

**Resumo:**
- **O que passou:**
  - os dados são idênticos (68 de 68 itens iguais a `dados.js`; gastos, grupo e fato conferem);
  - o mural de 6 blocos abre pelo botão "Mural" em todas as telas internas. É um diálogo que prende o foco, fecha com Esc e já mostra o essencial em cada bloco;
  - a paleta é exata, e Bricolage e Lexend vêm dos arquivos locais;
  - os monogramas passam de 7:1 sobre as três cores de emblema;
  - o emblema só "acende" com dado real (a lista da família no carro; quem já pagou). Não há progresso inventado por família na tela 11 (P-10);
  - nas 96 combinações: 0 erro, 0 pedido à rede, 0 alvo pequeno, 0 texto abaixo do contraste, 0 palavra partida e 0 rolagem lateral.
- **O que trava:**
  1. não há como voltar da criação da viagem (tela 2) para a abertura, nem do camping sem dados (tela 13) para a criação da viagem;
  2. com letra em 200 %, as iniciais dos emblemas da abertura passam por cima do contorno bordado.

**Evidências** em `qa/relatorios/roda-r1/`:
- `medicao/`: `prototipo.py` nas 16 páginas × 2 temas × 3 fontes; `medicao.txt`;
- `telas-claro-100.png`, `telas-escuro-100.png`, `telas-claro-200.png`: as 15 telas;
- `mural.png`: o mural aberto;
- `01-200.png`: a abertura em 200 %.

## Itens que reprovam

| # | Item (roteiro) | Onde | O que fazer |
| --- | --- | --- | --- |
| 1 | **Sem como voltar (3.4)** | Tela 2 (criar viagem): os únicos controles de navegação são "Sítio Pedra Lisa" e "Gerar lista"; não há "Voltar" para a abertura. Tela 13 (camping sem dados, aberta a partir da 2): só há "Mural", que não leva de volta à criação da viagem. Quem toca no exemplo do Sítio Pedra Lisa perde o formulário. As outras quatro direções têm voltar nesses dois pontos | Pôr "Voltar" na tela 2 (para a 1) e, na 13 aberta a partir da 2, um "Voltar" para a 2, sem tirar o "Mural" do modelo |
| 2 | **Sobreposição em 200 % (3.10)** | Abertura, letra em 200 %, nos dois temas: o emblema fica com 59 px e o monograma ("C&R", "B&P", "D&L") com 57 px. As letras passam por cima do contorno duplo bordado (`01-200.png`). Em 100 e 130 % cabe (32 e 37 px num emblema de 56 e 59 px) | O emblema cresce com a letra (tamanho em `rem`), ou o monograma fica num tamanho que sempre cabe dentro do contorno interno. Conferir também os emblemas pequenos das outras telas em 200 % |

## O que passou

| Item (roteiro) | Resultado | Como conferi |
| --- | --- | --- |
| 3.1 Arquivos | ok: os 20 arquivos, nada a mais | lista |
| 3.2 Sem rede | ok: 0 erro e 0 pedido externo nas 96 combinações; nenhuma proibição de código | `medicao.txt`, busca |
| 3.3 Telas | ok: as 15 telas; nenhum progresso por família na 11; o site usa os blocos como seções | capturas |
| 3.4 Navegação | ok, menos o item 1. O mural (diálogo `r-mural-titulo`) tem os 6 blocos com o essencial: Nossa lista (65 de 68 no carro), Quem leva o quê (2 itens sem dono), Gastos (Vocês devem R$ 180,00), O camping (2 pontos de atenção), A volta (0 de 68 conferidos), Em casa. Prende o foco e fecha com Esc. Ligações por clique: 1→2→3→4; item→5, e "Voltar à lista"→4; Vou sair→6; Sair assim mesmo→7; Som até 22h→10 (da 7 e da 3), e "Ver o camping"→3; Mural→A volta→8; Concluir→9; Mural→Quem leva o quê→11; Mural→Gastos→12; "Carne"→12; Pedra Lisa→13; convidado→14; Ver o site→15; "Faltou algo" abre uma folha | `qa/navegar.py`, teste do mural |
| 3.5 Dados | ok: 68 de 68 itens iguais a `dados.js`; progresso por categoria certo; R$ 420,00; 7 cotas de R$ 60,00; R$ 180,00; Bruno recebe R$ 300,00; fato com 6 confirmações | `qa/conferir_lista.py` |
| 3.7 Mascote | ok: no máximo 1 por tela do app; nenhum no mural; `principal` na abertura, com os três emblemas ao redor sem tocar a figura; `pose-alerta`, `pose-camping` e `pose-comemorando` conforme a direção; no escuro, apoio `#F4E2C6` em forma de emblema (5,99:1). O CSS do mascote só tem `width` e `fill` | capturas, `estilo.css` |
| 3.8 Cores | ok: os 10 papéis dos dois temas idênticos a `direcoes.md`; cores dos emblemas iguais (`#F2B53A`, `#9FD3D0`, `#E8B7C8`); monograma `#241B2F` sobre elas com 8,99, 9,98 e 9,46:1 | `estilo.css`, cálculo |
| 3.9 Toque | ok: 0 alvo menor que 44; "Mural" à esquerda e ação principal à direita. Os vãos acusados são de conteúdo que passa por baixo do rodapé fixo | `medicao.txt` |
| 3.11, 3.12 | ok: temas sem perda; estados com ícone e texto | capturas |
| 3.13 | ok: botões com o item no nome ("eu levo: Isqueiro", "desfazer: Extensão de 20 m", "Som até 22h: ciente"); alternâncias com `aria-pressed` | DOM |
| 3.16 | ok: emblema de escudo com topo em arco, sem corda, nó nem flor-de-lis; sem ranking nem medalha | capturas |
| 3.17 Premium | ok: calorosa, de cartaz de encontro, com densidade baixa | capturas |

## Observações (não reprovam)

- **Nome dos cabeçalhos de categoria:** o leitor de tela recebe "Abrigo6 de 6 no carro", sem espaço entre o nome e a contagem (o nome sai do `innerText` de dois `span` colados). Vale dar um `aria-label` ou separar com espaço ou vírgula, como "Abrigo, 6 de 6 no carro".
- **Letra em 200 %:** o rodapé fixo ("Mural" numa linha e a ação na outra) ocupa cerca de 40 % da altura. Vale pôr os dois lado a lado enquanto couberem.
- **"Lembrar quem falta"** é ação de um toque, mas tem `aria-pressed`. Se ele não alterna, o `aria-pressed` engana o leitor de tela; use só o anúncio de "Lembrete enviado".

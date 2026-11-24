# Protótipo 2 · Clareira (DSG-01 a DSG-13) · rodada 1 · REPROVADO (1 item)

Data: 2026-11-24 · Entregue por: pane-597 · Alvo: `design/prototipos/clareira/`
Base: `qa/roteiro.md`, seção 3; `direcao/direcoes.md`, seção 2; `direcao/telas.md`; `direcao/padrao-producao.md`.

**Resumo:**
- **O que passou:**
  - os dados são idênticos (os 68 itens batem um a um com `dados.js`; grupo, gastos, fato e camping sem dados conferem);
  - todos os caminhos obrigatórios funcionam pelas 4 abas e pelos controles do app;
  - a paleta é exata;
  - a Figtree vem dos arquivos locais;
  - nas 96 combinações: 0 erro, 0 pedido à rede, 0 alvo pequeno e 0 texto abaixo do contraste mínimo;
  - o tema e a fonte escolhidos seguem pelas ligações do app.
- **O que trava:** com letra em 200 %, duas palavras grandes se partem no meio. Na abertura, o nome "**Campingu / im**". Na tela 10, "**6 confirmaçõ / es**". É o mesmo critério que reprovou a Oficina, e na Clareira só ocorre em 200 %.

**Evidências** em `qa/relatorios/clareira-r1/`:
- `medicao/`: `prototipo.py` nas 16 páginas × 2 temas × 3 fontes, com a checagem de palavra partida; `medicao.txt`, linhas `partidas`;
- `telas-claro-100.png`, `telas-escuro-100.png`, `telas-claro-130.png`, `telas-claro-200.png`: as 15 telas;
- `06-concluido.png`: aviso de saída com os 3 itens no carro.

## Item que reprova

| # | Item (roteiro) | Onde | O que fazer |
| --- | --- | --- | --- |
| 1 | **Palavra partida no meio (3.10)** | Em 200 %, nos dois temas: `01-abertura-claro-200.png` (título "Campingu/im") e `10-fato-claro-200-inteira.png` (número do cartão: "6 confirmaçõ/es") | Nunca partir uma palavra, ainda mais o nome do app. Limite o tamanho do título grande à largura da tela (por exemplo, com `min()` entre o tamanho da escala e o que cabe na largura), ou deixe a palavra descer inteira. O "6" pode ficar grande e "confirmações" ir para a linha de baixo num tamanho que caiba. Conferir em 100, 130 e 200 % |

Não reprovam: o e-mail do Pix (tela 12) e "figtree" num caminho de arquivo (identidade) também quebram em 200 %. São cadeias longas sem espaço.

## Os três pontos levados ao QA

1. **Vãos menores que 8 px entre a rolagem e a barra fixa: aceito.** É conteúdo que passa por baixo da barra na rolagem 0, e não dois controles vizinhos. Entre controles do conteúdo e entre as abas, o vão é de pelo menos 8 px. É o mesmo entendimento dado à Oficina.
2. **Rótulo das abas limitado a 19 px: aceito.** O resto da tela cresce inteiro; o rótulo fica acima de 15 px e ao lado de ícone. É o comportamento das barras de abas do sistema, e evita "Campin/g" na aba.
3. **Dois mascotes na identidade: aceito.** O bloco 6 do padrão pede para mostrar as poses usadas e a `uma-cor`. A regra de 1 por tela vale para as 15 telas do app.

## O que passou

| Item (roteiro) | Resultado | Como conferi |
| --- | --- | --- |
| 3.1 Arquivos | ok: os 20 arquivos, nada a mais | lista |
| 3.2 Sem rede | ok: 0 erro e 0 pedido externo nas 96 combinações; nenhuma das proibições de código na busca | `medicao.txt`, busca |
| 3.3 Telas | ok: as 15, na ordem, com os blocos de `telas.md`; sem progresso por família na 11; site sem link de política (P-18) | capturas |
| 3.4 Navegação | ok: 4 abas fixas com ícone e texto (Lista, Camping, Grupo, Gastos) e `aria-current`. Ligações por clique só no app: 1→2→3→4; item→5 e Voltar→4; Vou sair→6; Sair assim mesmo→7; com os 3 no carro, "68 de 68", mascote por 2 s e "Confirmar saída"→7; Som até 22h→10 (a partir da 7 e da 3, com Voltar para a de origem); "Hora de desmontar?"→8; Concluir a volta→9; Grupo→11; Gastos e "Ver os gastos: Carne"→12; Pedra Lisa→13; convidado→14; Ver o site→15. "Faltou algo" abre uma folha com o foco em "fechar". Tema e fonte seguem na ligação (escuro e 130 % mantidos da 1 para a 2) | `qa/navegar.py`, teste à parte |
| 3.5 Dados | ok: 68 de 68 itens iguais a `dados.js` (nome, quantidade, estado); progresso por categoria certo; R$ 420,00; 7 cotas de R$ 60,00; R$ 180,00 a pagar; R$ 120,00 já pago (comprador); R$ 120,00 a pagar; Bruno recebe R$ 300,00; fato com 6 confirmações e Carla R., nov/2026; as 7 perguntas da tela 13 | `qa/conferir_lista.py` |
| 3.6 Textos | ok: 0 `[chave]`; nenhum texto no HTML (confirmado também pelo construtor, com o corpo sem `base.js`) | `medicao.txt` |
| 3.7 Mascote | ok: no máximo 1 por tela do app; poses como descritas na entrega; no escuro, apoio `#DDE7D6` (5,97:1 contra o corpo); `uma-cor` em `acento` | CSS, capturas |
| 3.8 Cores | ok: os 10 papéis dos dois temas idênticos a `direcoes.md`; o único hexadecimal fora deles é `#4A5560`, num comentário | `estilo.css` |
| 3.9 Toque | ok: 0 alvo menor que 44; ação principal com topo entre 683 e 724 px | `medicao.txt` |
| 3.11 Temas | ok | capturas |
| 3.12 Sem cor | ok: estados com ícone e texto | capturas e tons de cinza |
| 3.13 Marcação | ok na amostra: o item lê nome, quantidade e estado; as alternâncias têm `aria-pressed`; a folha prende o foco. Movimentos de 150 e 180 ms, desligados pela base com `prefers-reduced-motion` | navegação, CSS |
| 3.15 Identidade | ok: os 8 blocos | leitura |
| 3.17 Premium | ok: calma, com bastante respiro; marca de trilha usada com parcimônia (progresso e categorias); sem cara de modelo pronto | capturas |

## Observações (não reprovam)

- `.cl-pose .cg-mascote { position: relative; }`: o contrato permite só `width` no mascote. Não altera a arte, mas é melhor tirar, ou pôr a posição no invólucro `.cl-pose`.
- Tela 6, depois dos 3 no carro: "Trilha completa. Tudo no carro." aparece duas vezes, no subtítulo e ao lado do mascote. Uma basta.

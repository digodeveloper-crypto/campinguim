# Protótipo 4 · Rumo (DSG-01 a DSG-13) · rodada 1 · REPROVADO (3 itens)

Data: 2026-11-24 · Entregue por: pane-599 · Alvo: `design/prototipos/rumo/`
Base: `qa/roteiro.md`, seção 3; `direcao/direcoes.md`, seção 4; `direcao/telas.md`; `direcao/padrao-producao.md`.

**Resumo:**
- **O que passou:**
  - os dados são idênticos (68 de 68 itens iguais a `dados.js`; grupo, gastos, fato e camping sem dados conferem);
  - a rota de 5 paradas e a legenda funcionam pelos controles do app. A legenda tem rótulo de texto, prende o foco e fecha com Esc;
  - a paleta é exata, e a Archivo vem dos arquivos locais;
  - o ícone do mascote na rota é legível a 24 px, nos dois temas;
  - nas 96 combinações: 0 erro, 0 pedido à rede, 0 alvo pequeno e 0 texto abaixo do contraste.
- **O que trava, três pontos pequenos:**
  1. palavras partidas no meio com letra em 200 %;
  2. "1 itens" no site;
  3. o "Voltar" do fato aberto a partir dos alertas leva à estadia.

**Evidências** em `qa/relatorios/rumo-r1/`:
- `medicao/`: `prototipo.py` nas 16 páginas × 2 temas × 3 fontes; `medicao.txt`;
- `telas-claro-100.png`, `telas-escuro-100.png`, `telas-claro-200.png`: as 15 telas;
- `legenda.png`: a legenda aberta;
- `rota-icone.png`: a rota com o ícone a 24 px, claro e escuro.

## Itens que reprovam

| # | Item (roteiro) | Onde | O que fazer |
| --- | --- | --- | --- |
| 1 | **Palavra partida no meio (3.10)** | Em 200 %, nos dois temas: tela 3 ("Extensão", "Churrasco", "aparelhos", nos ajustes e alertas) e tela 6 ("Travesseiro", "Remédio", "Lucas", "Carregador"). Linhas `partidas` de `medicao.txt` | Nunca partir uma palavra; quando nome, quantidade e botão não couberem lado a lado, a quantidade ou o botão descem de linha. Conferir em 100, 130 e 200 %. O e-mail do Pix e o caminho do `OFL.txt` não contam |
| 2 | **Texto errado (3.6): "1 itens"** | Tela 15, categoria Lazer: "Lazer 1 itens". A chave `rumo.t15.itens` é "{n} itens" para todo n | Singular para 1 ("1 item"), com uma chave para cada forma, como as outras direções já fazem |
| 3 | **"Voltar" leva a outra tela (3.4)** | Tela 3 → "Som até 22h" → tela 10 → "Voltar" chega à **tela 7**, e não à 3 de onde se veio. O link é fixo em `07-estadia.html` | O "Voltar" do fato volta à tela de origem (3, 7 ou a entrada da legenda), por exemplo com um parâmetro de origem, como fazem Clareira e Oficina |

## O que passou

| Item (roteiro) | Resultado | Como conferi |
| --- | --- | --- |
| 3.1 Arquivos | ok: os 20 arquivos, nada a mais | lista |
| 3.2 Sem rede | ok: 0 erro e 0 pedido externo nas 96 combinações; nenhuma proibição de código | `medicao.txt`, busca |
| 3.3 Telas | ok: as 15 telas, na ordem e com os blocos de `telas.md` | capturas |
| 3.4 Navegação | ok, menos o item 3. Rota com 5 paradas tocáveis (Preparar, Carregar, No camping, Volta, Em casa), com "Você está aqui" no nome acessível. Legenda no canto de baixo, com rótulo "Legenda: camping, grupo, gastos", que abre um diálogo (Alertas do camping, Fato, Grupo, Gastos), prende o foco e fecha com Esc. As ligações obrigatórias funcionam por clique: 1→2→3→4; item→5 e Voltar→4; Vou sair→6; Sair assim mesmo→7; Som até 22h→10; parada Volta→8; Concluir→9; 3→10; legenda→11 e →12; "Carne"→12; Pedra Lisa→13; convidado→14; Ver o site→15; "Faltou algo" abre um painel com o foco em "Fechar". Nas telas 14 e 15, uma régua de seções | `qa/navegar.py`, teste da legenda |
| 3.5 Dados | ok: 68 de 68 itens iguais a `dados.js` (o nome acessível acrescenta ". Abrir o item"); progresso por categoria certo; R$ 420,00; 7 cotas de R$ 60,00; R$ 180,00, R$ 120,00 já pago e R$ 120,00; Bruno recebe R$ 300,00; fato e as 7 perguntas da tela 13 certos | `qa/conferir_lista.py` |
| 3.7 Mascote | ok: no máximo 1 por tela do app (a identidade mostra 6, permitido); o ícone a 24 px na parada atual fica legível, e no escuro sobre papel `#EDE6D6` de canto cortado; poses conforme a direção; `uma-cor` em `texto` | `rota-icone.png`, capturas |
| 3.8 Cores | ok: os 10 papéis dos dois temas idênticos a `direcoes.md`; nenhum hexadecimal fora deles | `estilo.css` |
| 3.9 Toque | ok: 0 alvo menor que 44. Os vãos acusados são entre o conteúdo e a legenda fixa (conteúdo que passa por baixo), e não entre vizinhos | `medicao.txt` |
| 3.11, 3.12 | ok: temas sem perda; estados com ícone e texto | capturas |
| 3.16 | ok: sem bússola, rosa dos ventos, pino de mapa ou mapa de verdade; as curvas de nível ficam só no fundo do topo; o selo é retangular de canto cortado | capturas |
| 3.17 Premium | ok: caderneta de expedição coerente, com régua e tipografia larga em caixa alta; assinatura contida | capturas |

## Observações (não reprovam)

- **Letra em 200 %:** a área fixa de baixo (ação principal mais a legenda em 3 linhas) ocupa cerca de 40 % da altura da tela, e sobra pouco para o conteúdo (tela 6 e tela 9). Vale deixar a legenda numa linha só ou só com o rótulo curto quando a letra cresce.
- `.apoio > .cg-mascote { position: relative; }`: o contrato só permite `width` no mascote. Passe a posição para o `.apoio`.

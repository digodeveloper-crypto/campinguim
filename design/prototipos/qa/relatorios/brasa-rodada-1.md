# Protótipo 1 · Brasa (DSG-01 a DSG-13) · rodada 1 · REPROVADO (2 itens)

Data: 2026-11-24 · Entregue por: pane-596 · Alvo: `design/prototipos/brasa/`
Base: `qa/roteiro.md`, seção 3; `direcao/direcoes.md`, seção 1; `direcao/telas.md`; `direcao/padrao-producao.md`.

**Resumo:**
- **O que passou:**
  - os dados são idênticos (68 de 68 itens iguais a `dados.js`; grupo, gastos e fato conferem);
  - as folhas que sobem funcionam pelos controles do app. Cada uma é um diálogo com título, "fechar" volta à anterior, e o seletor das 4 áreas fica dentro da folha principal;
  - a paleta é exata, e Fraunces e Atkinson vêm dos arquivos locais;
  - o mascote troca de `pose-alerta` para `pose-comemorando` quando os 3 itens entram no carro;
  - nas 96 combinações: 0 erro, 0 pedido à rede, 0 alvo pequeno, 0 texto abaixo do contraste e **0 palavra partida**.
- **O que trava:**
  1. com letra em 200 %, o traço da alça da folha atravessa o botão "fechar";
  2. botões repetidos com o mesmo nome para o leitor de tela ("desfazer" ×3, "ciente" ×2, "eu levo" ×2), sem dizer a que item se referem.

**Evidências** em `qa/relatorios/brasa-r1/`:
- `medicao/`: `prototipo.py` nas 16 páginas × 2 temas × 3 fontes; `medicao.txt`;
- `telas-escuro-100.png`, `telas-claro-100.png`, `telas-escuro-200.png`: as 15 telas;
- `06-200-escuro.png`, `05-200-escuro.png`, `04-200-escuro.png`, `01-200-escuro.png`: as folhas em 200 %;
- `05-item.png`, `05-remover.png`, `06-concluido.png`.

## Itens que reprovam

| # | Item (roteiro) | Onde | O que fazer |
| --- | --- | --- | --- |
| 1 | **Sobreposição em 200 % (3.10)** | Em todas as folhas com "fechar" (telas 2, 5, 6, 8, 10 e 13, nos dois temas), com letra em 200 %, o traço da alça (`.br-alca-traco`, x 163..243) passa **por dentro** do botão "fechar" (x 182..366, na mesma altura). Ver `06-200-escuro.png`. Em 100 % não acontece (traço 179..219; botão a partir de 286) | O traço da alça não pode cruzar o botão. Por exemplo: quando a letra cresce, o "fechar" desce para uma linha própria abaixo da alça, ou o traço fica acima do botão. Conferir em 130 e 200 % |
| 2 | **Nomes iguais para o leitor de tela (3.13)** | Tela 3: três botões "desfazer" (um por ajuste) e dois "ciente" (um por regra). Tela 11: dois botões "eu levo" (Isqueiro e Saco de lixo). O nome acessível não diz o item; quem usa leitor de tela ouve "eu levo, eu levo". As outras direções dizem "eu levo: Isqueiro", "Som até 22h: ciente" | Pôr o item no nome acessível (`aria-label` com chave de texto e valores, ou `aria-describedby` apontando para o nome do item). Conferir também a tela 14 depois de "Entrar" (os "eu levo" do convidado) e qualquer outra lista de botões iguais |

## O que passou

| Item (roteiro) | Resultado | Como conferi |
| --- | --- | --- |
| 3.1 Arquivos | ok: os 20 arquivos, nada a mais | lista |
| 3.2 Sem rede | ok: 0 erro e 0 pedido externo nas 96 combinações; nenhuma proibição de código | `medicao.txt`, busca |
| 3.3 Telas | ok: as 15, na ordem e com os blocos de `telas.md`. A metade de cima diz onde a viagem está ("Antes de sair", "65 de 68 no carro") | capturas |
| 3.4 Navegação | ok: cada ação abre uma folha (`role=dialog` com título): 1→2 (folha); Gerar lista→3; Ver a lista→4; item→5 (folha) e fechar→4; Vou sair→6 (folha); Sair assim mesmo→7; com os 3 no carro aparece "Confirmar saída"; Som até 22h→10 (folha), e fechar volta à origem (7 ou 3); Arrumar a volta→8; Concluir→9; seletor de áreas Grupo→11 e Gastos→12; "Carne · Ver a divisão"→12; Pedra Lisa→13; convidado→14; Ver o site→15; "Faltou algo" abre uma folha. Não há caminho só por gesto | `qa/navegar.py` |
| 3.5 Dados | ok: 68 de 68 itens iguais a `dados.js`; progresso por categoria certo; R$ 420,00; 7 cotas de R$ 60,00; R$ 180,00 a pagar; R$ 120,00 já pago (comprador); R$ 120,00 a pagar; Bruno recebe R$ 300,00; fato com 6 confirmações e Carla R., nov/2026 | `qa/conferir_lista.py` |
| 3.7 Mascote | ok: no máximo 1 por tela do app (a identidade mostra 7, permitido); `principal` na abertura sobre o halo; `pose-alerta` → `pose-comemorando` no aviso de saída; `pose-camping` na estadia; `uma-cor` em `texto-suave` na alça; no escuro, halo `#F3D9B8` esfumado (não é disco sólido) | DOM, capturas |
| 3.8 Cores | ok: os 10 papéis dos dois temas idênticos a `direcoes.md`; o único hexadecimal fora deles é `#4A5560`, num comentário; halo de brasa a 12 % do acento | `estilo.css` |
| 3.9 Toque | ok: 0 alvo menor que 44. Os vãos acusados são entre o conteúdo e o botão fixo da folha | `medicao.txt` |
| 3.10 Fonte | ok, menos o item 1: 0 palavra partida, 0 corte, 0 rolagem lateral | `medicao.txt` |
| 3.11, 3.12 | ok: o escuro é o principal e o claro também passa; estados com ícone e texto | capturas |
| 3.13 | ok, menos o item 2: os itens da lista leem nome, quantidade e estado; as alternâncias têm `aria-pressed`; as folhas são diálogos; movimento de 160 ms | navegação, CSS |
| 3.16 | ok: sem chama desenhada (o fogo é só o halo); acento âmbar, não laranja vivo | capturas |
| 3.17 Premium | ok: a direção mais calma e acabada até aqui, com densidade baixa e uma ideia por bloco | capturas |

## Observações (não reprovam)

- **Letra em 200 %:** a metade de cima ocupa quase dois terços da tela, e a folha começa perto do rodapé. Na tela 6, o título da folha nem aparece sem rolar. Vale encolher a metade de cima quando a letra cresce.
- **Sombra da folha:** `box-shadow: 0 -6px 18px` com o fundo a 70 %. É suave e aceita, mas não deve crescer: a direção pede "nada de sombra pesada".
- `.br-apoio > .cg-mascote { position: relative; }`: o contrato só permite `width` no mascote. Passe a posição para o `.br-apoio`.

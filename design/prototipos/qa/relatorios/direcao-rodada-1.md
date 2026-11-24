# Direção de arte dos protótipos (DSG-01) · rodada 1 · REPROVADA

Data: 2026-11-24 · Entregue por: pane-580 · Alvo: `design/prototipos/direcao/` (`telas.md`, `direcoes.md`, `padrao-producao.md`, `concorrentes.md`)
Base: `docs/brief-cinema-2-prototipos.md` (o pedido), `docs/PRD.md` (DSG-01 a DSG-13, NF-07, NF-08, seções 7 a 10), `docs/SPEC.md` (seções 5 a 7 e 9), `CLAUDE.md`.

**Resumo:** o trabalho é muito bom e quase todo correto.
- **Contas:** batem.
  - Lista: 68 itens; 65 no carro; progresso por categoria; fórmulas da spec conferidas com o caso L1.
  - Gastos: H = 14; meia cota R$ 30,00; 180 + 120 + 120 = 420; Bruno recebe 300; caso C1.
- **Contraste:** recalculei por script os 140 pares declarados (14 por tema × 2 temas × 5 direções). Zero falhas, e todos os valores batem com as tabelas. Os apoios do mascote dão de 5,59 a 6,12 contra o corpo `#4A5560`.
- **Diferença entre as direções:** as 5 diferem em linguagem visual e em navegação, como pede DSG-01.
- **Telas:** as 15 estão cobertas.

Reprova por **dois pontos nos dados**, porque o pedido diz "use exatamente estes" e o critério do QA (pedido, "Como trabalhar") é "os dados idênticos aos deste pedido". As duas correções são de poucas linhas em `telas.md`.

## O que precisa mudar

1. **D-01: o churrasco tem de ficar como "Atenção", como no pedido, até o responsável decidir.**
   - O pedido lista "Atenção: churrasco só no quiosque comum". `telas.md` rebaixou o aviso para **Informação**, seguindo o PRD (seção 10).
   - Na D-02, a mesma `telas.md` decidiu o contrário: vale o pedido ("use exatamente estes"), contra o PRD e a spec. As duas divergências são do mesmo tipo e precisam da mesma regra.
   - Pelo CLAUDE.md, divergência entre documentos vai ao orquestrador, e o protótipo não escolhe sozinho.
   - **Mudar:** na tela 3, o churrasco em **Atenção**, com o texto do pedido. A D-01 continua registrada como pergunta ao responsável (por exemplo, P-23), com a proposta de mudar só o campo `nivel` se ele preferir o PRD.

2. **A tarefa de 220 V tem dois textos diferentes.**
   - O pedido diz "Tarefa: conferir os aparelhos (220 V)". A tela 3 de `telas.md` usa "Conferir os aparelhos", com motivo "220 V", e está certa.
   - A faixa de tarefas da tela 4 (P-06) usa **"Confira seus aparelhos (220 V)"**, outra frase.
   - **Mudar:** na tela 4, "Conferir os aparelhos (220 V)", o mesmo texto da tela 3 e do pedido. O tom de voz de cada direção pode emoldurar a tarefa, mas o texto da tarefa é dado e vem igual de `dados.js`.

## Conferido e ok

| Item | Resultado |
| --- | --- |
| A família | ok: Carla e Rafael; Lucas, 9; Bia, 5; Mel (pet contado, sem nome, P-03); 2 noites; barraca com carro; frio à noite |
| O camping | ok: Recanto das Águas; confirmado por 7 campistas; chuveiro 1 para cerca de 25 barracas; aceita pet; som até 22h; piscina às 10h; 220 V e tomada longe; fato "Som até 22h: cumprida · 6 confirmações · última: Carla R., nov/2026" (tela 10, idêntico). Churrasco: item 1 |
| Ajustes | ok: entrou extensão de 20 m (tomada longe); saiu grelha portátil (churrasco só no quiosque); tarefa de 220 V na tela 3. Tela 4: item 2 |
| Aviso de saída | ok: travesseiro da Bia, remédio do Lucas, carregador (P-05 explica os nomes na lista) |
| O grupo | ok: as três famílias como no pedido; sem dono: isqueiro e saco de lixo; duplicado: 3 fogareiros |
| Os gastos | ok: carne R$ 420,00 (Bruno); 7 cotas de R$ 60,00; Carla e Rafael 3 cotas R$ 180,00; Diego e Lívia 2 cotas R$ 120,00; Bruno e Paula 2 cotas R$ 120,00, já pago; Bruno recebe R$ 300,00. Conta refeita: meias cotas 6 + 4 + 4 = 14; R$ 420,00 / 14 = R$ 30,00; prova 180 + 120 + 120 = 420 |
| Lista (tela 4) | ok: 68 itens contados linha a linha (6 + 5 + 15 + 5 + 6 + 6 + 7 + 6 + 1 + 3 + 2 + 6); conferidos contra o catálogo da spec (seção 5), cada item com a condição de entrada e a quantidade: gás 2, gelo 2 sacos, água 36 L em 8 galões, sacos de lixo 6, papel 2, cadeiras 4, lanternas 2, mudas 12, mantas 4, agasalho 8, muda por criança 2, carvão 1, ração para 4 dias, pratos 4 jogos, lanches 4, calçado e chinelo 4 pares |
| As 15 telas | ok: as 13 do app e as 2 da web do pedido, na mesma ordem, com as ligações obrigatórias (seção 5 de `telas.md`) |
| Divergências e perguntas | ok como registro: D-02 a D-06 e P-01 a P-22 marcados como provisórios no arquivo de dados. Ficam para o piloto e o responsável. Observação: P-04 (roupa de banho e boia) também tem apoio na spec, porque o camping tem piscina ("camping com piscina" é condição de entrada de `roupa_banho` e `boia`); vale reforçar na pergunta |
| Contraste AA declarado | ok: 140 pares recalculados, zero falhas, valores iguais aos das tabelas; emblemas da Roda com monograma `#241B2F` entre 8,99 e 9,98 |
| 5 direções distintas | ok: tema principal, assinatura, família tipográfica, estilo de ícone e modelo de navegação diferentes em todos os pares (folhas que sobem; abas no rodapé; fichário na borda; rota de etapas; mural). Os pares mais próximos foram tratados na matriz. Risco de "app genérico" assumido na Clareira, que o QA vai medir |
| Concorrentes | ok: 16 concorrentes do PRD e linguagens vizinhas comparados por descrição e busca em texto; proibições por direção registradas. Os limites da checagem estão declarados (11 concorrentes sem descrição visual) |
| Mascote | ok: opção 03 sem redesenho; cores oficiais do vetor aprovado; apoio no escuro; no máximo uma vez por tela; nada de disco azul |
| Formato da apresentação | ok: página inicial com as 5 e a amostra da lista; identidade por direção (paleta, tipografia, ícones, mascote, inspiração); comparação da lista em claro e escuro; recomendação separada no fim |

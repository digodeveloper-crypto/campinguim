# Rumo · opções de cor (pedido do responsável) · rodada 1 · APROVADO

Data: 2026-11-24 · Entregue por: pane-618 · Alvo: `design/prototipos/rumo/` (`paleta.js`, `paletas.html`, `paletas/`, seção 1b de `estilo.css`, `textos.js`, `identidade.html`, uma linha `<script src="paleta.js">` em cada tela, uma linha em `icones.js`)
Base: pedido do piloto (sem parâmetro, igual ao aprovado em `1c074c4`; em cada paleta, os critérios da seção 3 que dependem de cor; quatro paletas de fato diferentes; `paletas.html` com os critérios das páginas de apresentação).

**Resumo:**
- **Sem parâmetro, o Rumo é o aprovado:** 66 capturas de 6 telas × 2 temas × 3 fontes são iguais pixel a pixel às da rodada 3. Só a identidade mudou, porque ganhou a ligação "opções de cor".
- **As quatro paletas, cada uma em 96 combinações:** os 14 pares de contraste passam em todas. Também 0 erro, 0 pedido externo, 0 alvo pequeno, 0 texto abaixo do contraste, 0 rolagem lateral e 0 palavra partida (só o e-mail do Pix e o caminho de arquivo, já aceitos).
- **As cores são bem diferentes entre si:** azul de gelo, coral e vermelho, verde de eucalipto e roxo.
- **A paleta segue de tela em tela** por todos os caminhos testados.
- **`paletas.html`** passa nos critérios das páginas de apresentação, em todas as fontes.

**Evidências** em `qa/relatorios/rumo-paletas-r1/`:
- `geleira/`, `pitanga/`, `eucalipto/`, `jabuticaba/`: `prototipo.py --extra paleta=<nome>` nas 16 páginas × 2 temas × 3 fontes, com `medicao.txt` e a tela 4 em tons de cinza;
- `pagina/`: auditoria de `paletas.html`.

| Item | Resultado | Como conferi |
| --- | --- | --- |
| (1) Sem parâmetro, igual ao aprovado | ok. As telas 1, 4, 7, 11 e 12 em claro e escuro, em 100, 130 e 200 %, são idênticas às capturas da rodada 3, incluindo as rolagens inteiras; só 1 pixel de 44/255 na abertura em claro e 100 %, que é de rasterização. A identidade ficou um pouco mais alta (+96 a +208 px) pela ligação nova. `paleta.js` não faz nada quando não há paleta, e a única mudança em `icones.js` passa a paleta ao trocar de parada | comparação pixel a pixel; `git diff 1c074c4` |
| (2) Contraste por paleta e tema | ok. Recalculados de `estilo.css`, nenhum dos 14 pares abaixo do mínimo nas 8 combinações (4 paletas × 2 temas). Os mais apertados são `linha`/`fundo`, de 3,24 (Eucalipto claro) a 3,39 (Geleira claro), e `linha`/`superficie` no escuro, de 3,31 a 3,62: todos acima de 3. Na tela de verdade, `prototipo.py` mede 0 texto abaixo do mínimo nas 384 combinações | script de contraste; `medicao.txt` |
| (2) Estados sem depender de cor | ok: a estrutura não mudou; os estados continuam com ícone e texto; a tela 4 em cinza foi gerada para cada paleta | `*/04-lista-*-cinza.png` |
| (2) Mascote | ok: a arte não muda; só a `uma-cor` troca de tinta para `--texto` da paleta, o que é permitido. Contra o corpo `#4A5560`: no claro, o fundo dá de 5,91 a 6,24:1; no escuro, o apoio (papel em `--texto`) dá de 6,39 a 6,54:1 (mínimo 3:1). O ícone de 24 px da rota continua legível | cálculo, capturas |
| (2) Nada parecido com concorrentes nem com as outras direções | ok. A estrutura do Rumo (rota, letreiro largo em caixa alta, legenda, selo de canto cortado) continua inconfundível. Eucalipto é verde acinzentado e azul-petróleo (`#1F4B4D`), sem o musgo da Clareira (`#2E5A45`) nem verde lima. Jabuticaba é índigo-violeta (`#3D2766`), distinto da ameixa magenta da Roda (`#7A2E5C`). Pitanga é carmim (`#A3142F`), não o laranja da Brasa. Geleira é azul-marinho, sem a caixa redonda azul proibida | `paletas.html`, capturas |
| (2) 0 erro e paleta mantida ao navegar | ok: 0 erro em 384 combinações. Pitanga e Jabuticaba seguiram por 1→2→3→4→5→4→6→7→8→9→2 (paradas, Voltar, Vou sair, Sair assim mesmo, Concluir), pela legenda (4→11→14 e 4→12→11), por 1→15 e por 3→10→3: a paleta ficou em todas as telas | teste de clique |
| (3) Quatro paletas de fato diferentes | ok, sem variações tímidas: matizes do acento claro a cerca de 218° (Geleira), 348° (Pitanga), 182° (Eucalipto) e 263° (Jabuticaba), mais o grafite da Original. O fundo também muda de família (gelo, rosado, verde-cinza, lilás) | `paletas.html`, hexadecimais |
| (4) `paletas.html` | ok: as 5 lado a lado, cada uma com nome, caminho, frase, amostras em claro e escuro, miniaturas das telas 1, 4 e 3 nos dois temas e "Abrir o protótipo com esta paleta" (`01-abertura.html?paleta=<nome>`), mais a volta para a identidade. Em 390 e 1440 × 100, 130 e 200 % × claro e escuro: 0 rolagem, 0 palavra partida, 0 erro, 0 imagem quebrada, 0 alvo menor que 44, 0 texto abaixo do AA, 0 pedido externo | `captura.py`; teste nas 12 combinações |

## Decisão sobre as miniaturas (`rumo/paletas/`, 30 PNG, 1,5 MB)

O roteiro (3.1) reprova imagem a mais na pasta de uma direção. Aqui ela vem justificada no código ("abre na hora, também no celular, e aparece inteira em qualquer captura") e serve só a uma página de apresentação, não às 15 telas. O QA conferiu que as miniaturas são as telas atuais: comparadas com as capturas do QA na mesma paleta e tema, a diferença média é de 1,4 a 2,9 em 255, contra 21,4 entre paletas diferentes.

**Aceito, com uma condição:** se qualquer tela 1, 3 ou 4 do Rumo mudar, as 30 miniaturas precisam ser refeitas. Vale registrar no `LEIA-ME` ou na identidade como foram geradas.

## Observações (não reprovam)

- **Tema e fonte com `?avaliador=0`:** com a barra do avaliador escondida, o tema e a fonte pedidos no endereço não passam para a próxima tela, mas a paleta passa. Com a barra visível, que é o uso normal, os três passam. O Rumo aprovado se comporta igual, porque é comportamento da base, não das paletas. Só importa se alguém compartilhar um endereço com `avaliador=0`.
- O comentário da seção 1b de `estilo.css` diz que o contraste foi conferido; o QA confirma os números.

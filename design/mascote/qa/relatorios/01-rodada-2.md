# Opção 01 · Corpo de barraca · rodada 2 · APROVADA

Data: 2026-11-24 · Entregue por: pane-555 · Página: `design/mascote/apresentacao/opcoes/01/`
Base: `01-rodada-1.md` (3 itens), roteiro completo refeito sobre os arquivos novos.

**Resumo:** os três itens da rodada 1 foram corrigidos sem estragar o resto.
- A chuva agora se lê de longe e em 48 px.
- O alerta diz "olha ali".
- A dobra das abas virou forma intencional.

Com isso, a opção passa em todos os critérios e na barra premium. A ideia é uma das mais fortes do conjunto: a silhueta de barraca é única em 512, em 48 px e em uma cor.

Capturas: `qa/relatorios/01-r2/`, com `zoom-4.png` (principal, alerta, chuva e três quartos), `prancha-claro.png`, `prancha-escuro.png`, `prancha-48.png` (chuva em claro e escuro, alerta e ícone em 48 px reais ampliados) e `saida-conferir.txt`.

## Itens da rodada 1

| # | Item | Resultado | Evidência |
| --- | --- | --- | --- |
| 1 | Chuva não se lia | ok: lona encolhida e topo mais baixo; gotas inteiras em forma de gota dentro da silhueta; dez traços de chuva em volta; abas fechadas; olhos semicerrados; barriga seca. Em 48 px real lê "pinguim na chuva" nos dois fundos | `zoom-4.png` (3ª), `prancha-48.png` |
| 2 | Alerta com cara de entediado | ok: olhos abertos, pupilas menores viradas para o lado da asa que aponta; distingue-se da chuva sem rótulo | `zoom-4.png` (2ª), `prancha-48.png` |
| 3 | Degrau da aba | ok: dobra com raio nos dois cantos, aplicada em todos os arquivos, inclusive no ícone e na versão em uma cor; lê como dobra de lona, não como sobra de vetor | `zoom-4.png` (1ª), `prancha-claro.png` |
| obs. | Porta encostando na borda nos três quartos | ok: há faixa de lona entre a porta e a borda | `zoom-4.png` (4ª) |

## Desvios

- Os 11 aceitos na rodada 1 continuam valendo.
- **8 (revisto):** alerta com olhos abertos e pupila deslocada, no lugar da pálpebra na metade. Aceito: é o pedido do relatório e preserva a ideia.
- **13 (novo):** a chuva tem 436 de altura, com o topo baixado para a postura encolhida. Aceito: é a postura do desconforto; o chão é o mesmo. A ferramenta mede 459 porque os traços de chuva saem acima da figura, dentro da margem de 16.
- **14 (novo):** dobra com raio 14 e degrau 28. Aceito.

## Resultado por critério

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Contrato de arquivos e regras de arquivo | ok: 12 arquivos; altura 448 igual em pé; chão em y = 480; margens ok; sem tag proibida; `uma-cor` só em `#111111` | `saida-conferir.txt` |
| Desvios declarados | aceitos (ver acima) | — |
| MSC-01 distinto e fiel à ficha | ok: triângulo de lona com porta, abas e pés; único das dez até aqui | `prancha-claro.png` |
| MSC-03 usos reais | ok: nada corta ou estica; lê no ícone da tela inicial, na abertura, no avatar, no cabeçalho e em uma cor | `pagina-*.png` |
| MSC-04 poses | ok: neutro, comemorando, alerta e chuva (a `pose-camping`, conforme a ficha), mais frio e calor; todas leem sem rótulo | `prancha-claro.png` |
| MSC-05 48 px | ok: "pinguim que é barraca" em 48 px reais, dentro do círculo, entre os apps e com sol | `prancha-48.png`, `icone-48-*` |
| MSC-06 originalidade | ok: checagem da rodada 1 mantida (nada mudou na silhueta, nas cores nem nos traços); por descrição e busca em texto, sem busca reversa de imagem | `01-rodada-1.md` |
| MSC-09 vistas 3D | ok | `vista-*-512-claro.png` |
| Sol forte e tela pequena | ok | `icone-48-sol-claro.png` |
| Não depender de cor | ok: a versão em uma cor é a mais forte da opção | `uma-cor-512-claro.png` |
| Fora do Brasil | ok | — |
| Acessório não essencial | não se aplica (sem acessório em nenhum arquivo) | — |
| Evitar: detalhe fino | ok | `icone-48x8-claro.png` |
| Evitar: modelo pronto | ok | — |
| Barra premium (5a) | ok: curvas resolvidas, uma forma-mãe clara, cor contida, expressão por pálpebra e pupila, mesma construção em todos os arquivos | `prancha-claro.png` |

## Pendência que não é da opção (estrutura)

Com o botão "Fundo da arte: Escuro", a versão em uma cor (tinta `#111111`) fica quase invisível sobre o palco `#1f1f23`, no bloco "Versão em uma cor" e no uso real "Versão em uma cor só" (`01-r1/pagina-uma-cor-escuro.png`). O padrão de produção prevê a versão em uma cor "invertida" no escuro, e os recortes da 01 são transparentes, então a inversão funciona quando a página fizer. Vale para as dez opções. É ajuste de `_compartilhado/`, avisado ao piloto.

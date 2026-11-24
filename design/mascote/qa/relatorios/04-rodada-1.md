# Opção 04 · Pictograma de trilha · rodada 1 · REPROVADA

Data: 2026-11-24 · Entregue por: pane-557 · Página: `design/mascote/apresentacao/opcoes/04/`
Eixos: traço geométrico de pictograma · idade adulto · proporção definida e reta · acabamento chapado sem linha · camping em acessório (mochila). Bate com a ficha.

**Resumo:**
- Passou: a linguagem de placa está coerente e limpa em todos os arquivos, e a pose de calor lê muito bem (sol, gotas, mochila no chão).
- Passou: regras de arquivo, alturas, chão, página e contraste.
- Reprova por três pontos:
  1. a combinação azul e laranja das duas cores principais aproxima a opção da marca Pinguin;
  2. o ícone de 48 px lê como coruja;
  3. na vista de lado, a mochila flutua solta das costas.

Capturas: `qa/relatorios/04-r1/`. Comece por `zoom-4.png` (lado, três quartos, ícone e alerta em 512), depois `prancha-claro.png`, `prancha-escuro.png` e `prancha-48.png`. A saída completa está em `saida-conferir.txt`.

## O que precisa mudar

1. **Corpo azul com mochila laranja: semelhança de cor com a marca Pinguin (MSC-06).** Evidência: `prancha-claro.png`.
   - O desvio 1 trocou o preto-azulado da ficha (`#15202B`, que lê como "escuro") por `#2F4C6B`, que lê claramente como **azul**.
   - Com o laranja de sinalização na mochila, bico e pés, o mascote passa a ser "azul e laranja", e é numa mochila de camping. `originalidade.md` manda evitar azul com laranja como as duas cores do mascote, porque é a combinação dos produtos da Pinguin. A regra para a Pinguin é a mais rígida: semelhança perceptível, mesmo parcial, em cor reprova. Na busca do QA, os sacos de dormir da Pinguin aparecem sobretudo em azul ([outdoorweb](https://www.outdoorweb.eu/Camping/sleeping-bags/men-s/Safari-PFM-Blue), [outdoorweb](https://www.outdoorweb.eu/Mistral-PFM-Blue-10064563)).
   - O motivo do desvio (contraste no fundo escuro) é bom, mas a solução escolhida custa a distância da marca.
   - **Mudar:** um escuro que **não leia como azul**, por exemplo um grafite-ardósia neutro ou um azul tão fechado que leia como quase preto. Sem baixar do mínimo de leitura no escuro: a figura continua visível pelo branco da barriga, dos olhos e pelo laranja. O laranja de sinalização fica, porque é a ideia da opção (placa de trilha). Declarar o novo desvio com o motivo.

2. **Ícone em 48 px: lê como coruja (MSC-05).** Evidência: `zoom-4.png` (3ª figura), `prancha-48.png`.
   - Cabeça redonda grande, dois olhos brancos redondos e grandes (r = 22) próximos e um bico triangular pequeno entre eles: é a face clássica de coruja.
   - A mochila aparece só como dois blocos laranja com uma faixa branca atrás dos ombros e lê como "asas laranja" ou ombreiras, não como mochila.
   - A barriga, o sinal mais forte de pinguim, ficou um quadrado pequeno.
   - **Mudar** (o mínimo de 43 obriga os olhos grandes, então o resto precisa compensar):
     - olhos mais afastados e mais altos na cabeça, não um par central;
     - bico maior e mais baixo, saindo da cabeça como no principal;
     - barriga clara maior, ocupando o tronco como no principal;
     - a mochila com volume de caixa legível: a aba no topo e as laterais aparecendo dos dois lados como uma peça só atrás do corpo, não dois blocos soltos.
   - Conferir no `icone-48` real, sem a versão grande ao lado, se diz "pinguim com mochila".

3. **Vista de lado: a mochila está solta das costas (MSC-09).** Evidência: `zoom-4.png` (1ª figura).
   - De perfil, há um vão claro entre o tronco e a mochila. A caixa flutua no ar, sem onde se apoiar em volume (o roteiro reprova "partes que não teriam onde se apoiar").
   - De frente e a três quartos ela está encostada, então as vistas se contradizem.
   - **Mudar:** a mochila encostada nas costas no perfil, com a mesma altura e posição da frente.

## Observação (não reprova)

- **Versão em uma cor:** as duas "orelhas" da mochila acima dos ombros deixam a silhueta perto de ursinho ou de figura de ombreiras (`uma-cor-48x8-claro.png`). O vão de 24 está certo pelo padrão. Ao refazer o item 2, veja se uma mochila com a parte de cima mais larga e contínua atrás da cabeça lê melhor como mochila também aqui.

## Desvios declarados

| # | Desvio | Decisão |
| --- | --- | --- |
| 1 | Corpo `#2F4C6B` em vez de `#15202B` | **recusado** (item 1): o motivo é bom, mas a cor aproxima da marca Pinguin; refazer com escuro que não leia como azul |
| 2 | Mochila 280 × 90 × 170, sobrando 50 de cada lado | aceito: a ficha pedia as duas coisas, e a leitura de "campista" é a que vale |
| 3 | Olhos em ponto claro, em negativo | aceito no principal e nas poses (lê bem); no ícone, veja o item 2 |
| 4 | Ícone com olhos r = 22 e figura em 400 | medida aceita (mínimo do padrão); **a composição do ícone falha** (item 2) |
| 5 | Aba da mochila fora do recorte da versão em uma cor | aceito, com a observação acima |
| 6 | Asas saindo do flanco | aceito |
| 7 | Lado com tronco de 170 de fundo e faixa clara de 74 | aceito |
| 8 | Pivôs das asas nos três quartos | aceito |
| 9 | Alerta inclinado 10° e deslocado | aceito: lê como "olha ali" (olhos em traço vertical, asa reta) |
| 10 | Gotas e sol separados na pose de calor | aceito |
| 11 | Pernas com 42 visíveis | aceito |
| — | Checagem fora de `direcao/` | aceito: a tarefa proíbe `direcao/`; o registro está na entrega (pane-557) e no `dados.js` |

## Resultado por critério

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Contrato de arquivos e regras de arquivo | ok: 11 arquivos; altura 448 igual; chão em y = 480; margens ok; sem tag proibida; `uma-cor` só em `#111111` | `saida-conferir.txt` |
| MSC-01 distinto e fiel à ficha | ok: placa de trilha, primitivas, mochila em caixa. Distinto da 10 (a vizinha geométrica de acessório), que é filhote de cabeça grande | `prancha-claro.png` |
| MSC-03 usos reais | ok na montagem; o laranja como acento da página reforça o item 1 | `pagina-*.png` |
| MSC-04 poses | ok: neutro, comemorando (braços a 45°, olhos em traço), alerta (aponta, olhos verticais) e calor; leem sem rótulo | `prancha-claro.png` |
| MSC-05 48 px | **falha** (item 2) | `prancha-48.png` |
| MSC-06 originalidade (checagem refeita) | **falha** na cor (item 1); silhueta, olhos, bico, barriga, pose e acessório ok, ver abaixo | — |
| MSC-09 vistas 3D | **falha** na vista de lado (item 3); três quartos ok | `zoom-4.png` |
| Sol forte e tela pequena | ok | `icone-48-sol-claro.png` |
| Não depender de cor | ok, com a observação da versão em uma cor | `uma-cor-48x8-claro.png`, `icone-48-cinza-escuro.png` |
| Fora do Brasil | ok: pictograma de placa é linguagem internacional | — |
| Acessório não essencial | ok: sem a mochila continua a figura de placa com bico e barriga | `sem-acessorio-512-claro.png` |
| Evitar: detalhe fino | ok | `icone-48x8-claro.png` |
| Evitar: modelo pronto | ok: não é intercambiável com os pinguins de banco de imagens | — |
| Barra premium (5a) | ok: formas desenhadas, hierarquia clara, cor contida, coerência entre arquivos. O item 1 é de originalidade, não de acabamento | `prancha-claro.png` |

## Originalidade (MSC-06), checagem refeita pelo QA

Checagem por descrição e busca em texto, sem busca reversa de imagem.

- **Silhueta e construção:** figura de placa com pescoço, membros em barra e caixa nas costas. Não lembra Tux, Pingu, Club Penguin, Pudgy, Penguin Books nem Suica.
- **Olhos e bico:** ponto claro e triângulo curto. Só coincidem com a Suica e o Gunter no tamanho pequeno dos olhos, mas a construção é outra.
- **Pose e acessório:** parado em pé, mochila em caixa. Nenhuma referência usa mochila em caixa.
- **Cor:** falha (item 1). A busca do QA "Pinguin tent sleeping bag colors blue orange Czech brand Pinguin products" mostrou a linha de sacos de dormir da marca em azul ([e-catalog](https://e-catalog.com/PINGUIN-SAFARI-190.htm), [sportano](https://sportano.pl/marki/Pinguin)), e `originalidade.md` registra a dupla azul com laranja. Num app de camping com nome quase igual ao da marca, um mascote azul e laranja de mochila é a semelhança a evitar.

## Para a reentrega

Corrigir os itens 1 a 3 em todos os arquivos afetados: a cor em todos; o ícone; a vista de lado. Rodar de novo o `render.py` e o `captura.py` e dizer o que mudou e quais desvios novos foram feitos.

# Opção 07 · Veterano da caneca · rodada 1 · REPROVADA

Data: 2026-11-24 · Entregue por: pane-565 · Página: `design/mascote/apresentacao/opcoes/07/`
Eixos: traço orgânico, linha de marcador · idade adulto maduro · proporção definida e curta · acabamento chapado com uma sombra · camping em acessório (caneca). Bate com a ficha.

**Resumo:**
- Passou: o personagem tem muita personalidade. As sobrancelhas grisalhas, a pálpebra pesada e a caneca contam "já viu de tudo" com bom humor. A chuva com a caneca transbordando é ótima. As vistas são coerentes, a linha de marcador tem peso real, e as regras de arquivo e a página passaram.
- Reprova por **dois pontos ligados à leitura de pinguim**, que hoje puxa para **pato** (o roteiro cita pato explicitamente no MSC-05):
  1. o bico de frente é uma espátula larga de ponta arredondada;
  2. o ícone, só com o rosto e a caneca, perde os sinais de pinguim.

Capturas: `qa/relatorios/07-r1/`. Comece por `zoom-4.png` (principal, alerta, chuva e lado em 512) e `prancha-48.png`, depois `prancha-claro.png` e `saida-conferir.txt`.

## O que precisa mudar

1. **O bico de frente lê como bico de pato.** Evidência: `zoom-4.png` (1ª a 3ª figuras).
   - De frente, o bico é uma placa larga e chata, de ponta arredondada, com a linha divisória no meio: é a forma do bico de pato.
   - Com o corpo marrom (cor comum em patos), o principal oscila entre "pinguim" e "pato marrom de caneca".
   - A ficha pede bico "largo e grosso, 120 × 50, cantos arredondados", e isso pode continuar. O que falta é a **ponta**: no bico de pinguim, os lados convergem para uma ponta.
   - A sua versão em uma cor já resolve isso (a "cunha que afina para a ponta", desvio 9) e lê como bico de pinguim, e a vista de lado também.
   - **Mudar:**
     - de frente, o bico em cunha larga na base que converge para uma ponta (arredondada, não aguda), com a linha divisória acompanhando a cunha;
     - nos três quartos e no ícone, o mesmo;
     - manter a largura e a grossura, que dão a idade.

2. **O ícone em 48 px lê como coruja ou pato de caneca, não como pinguim (MSC-05).** Evidência: `prancha-48.png` e `icone-48-silhueta.png`.
   - O enquadramento do peito para cima, escalado 1,7×, mostra só a cabeça marrom, as sobrancelhas claras, os olhos e o bico de pato. O topo da barriga aparece como uma faixa clara reta, e a caneca fica embaixo.
   - Não aparecem as nadadeiras, nem o contraste escuro em volta e claro na frente que define pinguim.
   - A silhueta em 48 px é um busto arredondado sem sinal de ave marinha.
   - **Mudar:**
     - enquadrar um pouco mais aberto, para entrarem os ombros caídos e o início das duas nadadeiras;
     - o peito claro mais alto e mais largo, com a forma de escudo da ficha e não uma faixa;
     - o bico em cunha do item 1;
     - a caneca pode ficar, menor, à frente do peito.
   - Conferir no `icone-48` real, sem a versão grande ao lado.

## Observação (não reprova)

- **A barriga de topo reto** (o "escudo largo com topo reto na linha do pescoço" da ficha), com a faixa de sombra logo abaixo, às vezes lê como avental ou toalha no peito. Não reprova, porque é a ficha. Ao refazer o ícone, vale arredondar levemente os cantos de cima do escudo, para ele ler como plumagem.

## Desvios declarados

| # | Desvio | Decisão |
| --- | --- | --- |
| 1 | Corpo `#4E3D33` em vez de `#2E2420` (fundo escuro) | aceito: continua marrom-café; o contraste de pinguim se resolve nos itens 1 e 2 |
| 2 | Sobrancelhas grisalhas | aceito: dá a idade e afasta a leitura de bravo e de Angry Birds |
| 3 | Medidas verticais ajustadas para 448 | aceito |
| 4 | Uma reentrância por lado na barriga | aceito |
| 5 | Alerta com olhos abertos e uma sobrancelha erguida | aceito: lê "olha ali" |
| 6 | Caneca na têmpora no calor | aceito |
| 7 | Alça em escorço na vista de lado | aceito |
| 8 | Ícone com caneca no peito e sem bolsa sob o olho | medida aceita; **a composição falha** (item 2) |
| 9 | Versão em uma cor com bico em cunha e olhos sem pupila | aceito; a cunha é a referência do item 1 |
| 10 | Paleta com 6 cores | aceito |
| — | Checagem fora de `direcao/` | aceito; o registro está na entrega (pane-565) e no `dados.js` |

## Resultado por critério

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Contrato de arquivos e regras de arquivo | ok: 13 arquivos; altura 448 igual; chão em y = 480; poses dentro da margem de 16; o ícone sai pelos lados de propósito (busto), com o que identifica dentro do círculo; `uma-cor` só em `#111111`; página com 0 erro | `saida-conferir.txt` |
| MSC-01 distinto e fiel à ficha | ok na ideia, nos eixos e na silhueta de barril; distinto da 02 (alta e esguia). Bico no item 1 | `prancha-claro.png` |
| MSC-03 usos reais | ok | `pagina-*.png` |
| MSC-04 poses | ok: neutro, brinde, alerta, chuva, frio com vapor e calor leem sem rótulo | `prancha-claro.png` |
| MSC-05 48 px | **falha** (item 2) | `prancha-48.png` |
| MSC-06 originalidade (checagem refeita) | ok: ver abaixo | — |
| MSC-09 vistas 3D | ok: mesma altura, chão e linha dos olhos; perfil com bico projetado, barriga saliente, cauda e caneca à frente; três quartos com a sobrancelha fazendo sombra no olho | `zoom-4.png` (4ª) |
| Sol forte e tela pequena | ok | `icone-48-sol-claro.png` |
| Não depender de cor | ok: a versão em uma cor lê pinguim de caneca, com o bico em cunha | `uma-cor-48x8-claro.png` |
| Fora do Brasil | ok | — |
| Acessório não essencial | ok: sem a caneca, continua o barril de cabeça achatada e sobrancelha grisalha | `sem-acessorio-512-claro.png` |
| Evitar: detalhe fino | ok | `icone-48x8-claro.png` |
| Evitar: modelo pronto | ok | — |
| Barra premium (5a) | ok: linha com intenção, cor contida, expressão de personagem maduro, coerência entre arquivos. A leitura de espécie entra nos itens 1 e 2 | `prancha-claro.png` |

## Originalidade (MSC-06), checagem refeita pelo QA

Checagem por descrição e busca em texto, sem busca reversa de imagem.

- **Skipper** (*Madagascar*): cabeça chata e sobrancelha marcada, mas preto e branco, de postura militar e olhos azuis. A 07 é marrom, de ombros caídos, sobrancelha grisalha e caneca. Combinação diferente.
- **Angry Birds:** sobrancelha preta e pesada em V, zangada. As sobrancelhas grisalhas, retas e caídas para fora da 07 afastam.
- **Hóquei** (sem taco nem camisa), **Tux** (não é sentado nem tem bico amarelo) e **marca Pinguin** (nada de laranja-avermelhado, azul com laranja, disco ou letreiro): ok.
- **Referência nova** sugerida pelo designer: o pinguim de *Super Mario Galaxy* com sobrancelhas amarelas longas. Vai para `qa/referencias-novas.md`. Sem semelhança com a 07.

## Para a reentrega

Corrigir os itens 1 e 2: o bico em todos os arquivos de frente e de três quartos, e o ícone. Rodar de novo o `render.py` e o `captura.py` e dizer o que mudou.

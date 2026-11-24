# Opção 06 · Saco de dormir · rodada 1 · REPROVADA

Data: 2026-11-24 · Entregue por: pane-561 · Página: `design/mascote/apresentacao/opcoes/06/`
Eixos: traço geométrico arredondado, linha grossa uniforme · idade adulto · proporção compacta, uma forma só · acabamento chapado com linha · camping no desenho (capuz de saco de dormir). Bate com a ficha.

**Resumo:**
- Passou: a ideia do casulo funciona e o acabamento é cuidado (linha uniforme, costuras de acolchoado, borda do capuz). A pose de frio, com a abertura franzida fechando sobre o rosto, é excelente. As regras de arquivo, a página e os 48 px também passaram.
- Reprova por **um ponto, a forma do rosto**:
  - o recorte claro ganhou um bico no alto, entre os olhos, e virou a "máscara em coração" do pinguim genérico de desenho (Tux, emojis, Club Penguin, banco de imagens), em vez da abertura oval de capuz que a ficha pede;
  - isso apaga justamente o que distingue a opção: o rosto deixa de ser "alguém espiando pela abertura do saco" e vira "rosto de pinguim comum";
  - na versão em uma cor, onde a borda do capuz não aparece, sobra um pinguim genérico.

Capturas: `qa/relatorios/06-r1/`. Comece por `zoom-face.png` (principal, ícone, uma cor e frio em 512), depois `prancha-claro.png` e `prancha-48.png`. A saída completa está em `saida-conferir.txt`.

## O que precisa mudar

1. **A abertura do rosto: oval de capuz, não máscara em coração (MSC-01, MSC-06, modelo pronto).** Evidência: `zoom-face.png`.
   - A ficha pede "recorte claro **oval** 180 × 200: é a face, e a borda escura ao redor é o capuz".
   - O desenho entregue tem um entalhe no topo do recorte que forma dois lóbulos sobre os olhos. Esse é o traço mais típico do pinguim de desenho genérico, presente no Tux, nos emojis e no rosto em coração dos avatares do Club Penguin, além de ser o padrão dos bancos de imagens.
   - Com ele, o principal lê "pinguim de rosto branco dentro de um casaco". O ícone fica perto de um avatar do Club Penguin (corpo de cor lisa sem pescoço, rosto branco em coração, olhos ovais, bico laranja pequeno, pés laranja). A versão em uma cor, sem a borda do capuz, é um pinguim genérico.
   - Não foi declarado como desvio, e muda a leitura da opção.
   - **Mudar:**
     - o rosto é **a abertura do capuz**: um oval limpo e contínuo, sem entalhe, com a borda do capuz em volta, como na sua pose de frio (`pose-camping`), que já mostra a ideia perfeitamente com a abertura franzida;
     - no neutro, a abertura pode ser lisa ou levemente franzida, mas oval;
     - na versão em uma cor, faça o capuz aparecer: por exemplo, um vão transparente de 24 ou mais entre a borda do capuz e o corpo, ou a borda do capuz como anel que se lê pela silhueta. Assim a versão em uma cor diz "saco de dormir", não só "pinguim";
     - aplicar em todos os arquivos (frente, três quartos, poses, ícone, versão em uma cor).

## Observação (não reprova)

- **Versão em uma cor no fundo escuro da página:** é pendência da estrutura, já registrada pelo piloto. Não conta para esta opção.

## Resultado por critério

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Contrato de arquivos e regras de arquivo | ok: 11 arquivos; altura 448 igual; chão em y = 480; margens ok; sem tag proibida; `uma-cor` só em `#111111` | `saida-conferir.txt` |
| MSC-01 distinto e fiel à ficha | **falha** (item 1): o rosto não é o oval da ficha, e a distinção "face dentro de um capuz" se perde no ícone e na versão em uma cor. A cápsula e as costuras continuam distintas da 01 (triângulo) e da 08 | `zoom-face.png` |
| MSC-03 usos reais | ok | `pagina-*.png` |
| MSC-04 poses | ok: comemorando (braços para fora, pulo), alerta (sobrancelha, asa aponta), frio (abertura fecha, tremor, flocos) e calor (abertura até o peito, sol, gota); leem sem rótulo | `prancha-claro.png` |
| MSC-05 48 px | ok na leitura de pinguim; a distinção entra no item 1 | `prancha-48.png` |
| MSC-06 originalidade (checagem refeita) | **falha** parcial (item 1): o rosto em coração é traço do pinguim genérico e do avatar do Club Penguin; o resto (cápsula, capuz, costuras, coral) é original | — |
| MSC-09 vistas 3D | ok: mesma altura, chão e linha dos olhos; o lado mostra o capuz como cavidade, e a borda tem espessura | `vista-*-512-claro.png` |
| Sol forte e tela pequena | ok | `icone-48-sol-claro.png` |
| Não depender de cor | ok na leitura de pinguim; **perde a ideia do capuz** (item 1) | `uma-cor-48x8-claro.png` |
| Fora do Brasil | ok | — |
| Acessório não essencial | não se aplica (sem acessório) | — |
| Evitar: detalhe fino | ok: o contorno do ícone foi trocado por contraste de massa, como a ficha permite | `icone-48x8-claro.png` |
| Evitar: modelo pronto | **atenção**: o rosto em coração é o elemento de banco de imagens (item 1) | — |
| Barra premium (5a) | ok: linha com intenção, cor contida em tons de petróleo e gelo com acento coral, coerência entre arquivos | `prancha-claro.png` |

## Originalidade (MSC-06), checagem refeita pelo QA

Checagem por descrição e busca em texto, sem busca reversa de imagem.

- **Club Penguin:** os avatares têm corpo redondo de cor lisa, rosto e barriga brancos, olhos ovais com pupila e bico pequeno ([TV Tropes](https://www.tvtropes.org/pmwiki/pmwiki.php/VideoGame/ClubPenguin), [tutorial de desenho](https://dragoart.com/tut/how-to-draw-club-penguin-2329), [80.lv](https://80.lv/articles/developer-explains-how-club-penguin-s-legendary-avatar-was-made/)). O ícone da 06 compartilha boa parte dessa combinação, e o rosto em coração é o que mais aproxima.
- **Tux e emojis:** o rosto branco em coração, com os olhos dentro dos lóbulos, é o rosto padrão deles e do "pinguim de desenho" em geral.
- **Shy Guy** (máscara branca em capuz), apontado pelo designer: a cor e a máscara são diferentes; sem risco.
- **Marca Pinguin:** nada de laranja-avermelhado no corpo, azul-royal com laranja, disco ou letreiro. Petróleo com coral passa.
- Com o rosto oval de capuz, a combinação fica própria: casulo de linha grossa, costuras e abertura de saco de dormir. Nenhuma referência tem isso.

## Para a reentrega

Corrigir o item 1 em todos os arquivos, sem mudar o resto. Rodar de novo o `render.py` e o `captura.py`, mandar a lista de desvios (esta entrega veio sem ela) e dizer o que mudou.

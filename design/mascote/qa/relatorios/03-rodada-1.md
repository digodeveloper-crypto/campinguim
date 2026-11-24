# Opção 03 · Filhote de gorro · rodada 1 · REPROVADA

Data: 2026-11-24 · Entregue por: pane-558 · Página: `design/mascote/apresentacao/opcoes/03/`
Eixos: traço orgânico (penugem) · idade filhote · proporção compacta · acabamento com volume (sombra de um tom) · camping em acessório (gorro). Bate com a ficha.

**Resumo:**
- Passou: a melhor leitura de conjunto até aqui. O ícone é o mais forte das opções avaliadas, a paleta é contida, as poses leem sem rótulo, as vistas são coerentes e o `sem-acessorio` funciona.
- A troca do gorro para verde-azulado por causa do Chilly Willy foi uma boa decisão.
- Reprova por **um único ponto de acabamento** (barra premium): o contorno "de penugem" saiu como uma borda irregular e facetada, que lê como vetor tremido e não como pelo macio. Junto vai um detalhe menor na vista de lado.
- É a opção mais perto de aprovar.

Capturas: `qa/relatorios/03-r1/`. Comece por `zoom-4.png` (principal, lado, frio e uma cor em 512), depois `prancha-claro.png`, `prancha-escuro.png` e `prancha-48.png`. A saída completa está em `saida-conferir.txt`.

## O que precisa mudar

1. **O contorno de penugem lê como borda tremida, não como pelo (seção 5a do roteiro, pergunta "As curvas são desenhadas?").** Evidência: `zoom-4.png`, as quatro figuras em 512, e `principal-512-claro.png`.
   - Nas bordas do corpo, da máscara da face, da barriga e das nadadeiras, as "ondas" saíram como **pequenas facetas de tamanho e ritmo irregulares**: trechos quase retos alternando com quinas e calombos.
   - Em tamanho de uso (tela de abertura, cabeçalho do site, página) isso lê como contorno de batata ou recorte mal feito. Não lê como a "massa felpuda" da ficha. É o que separa a opção de um mascote de marca premium.
   - **Mudar:**
     - penugem **intencional e rítmica** só no contorno externo do corpo, com os 12 a 16 tufos da ficha, de tamanho parecido, cada um uma curva suave e tangente (bossa redonda, vale macio), e não ruído de amplitude variável;
     - máscara da face, barriga e nadadeiras com borda **lisa** ou com poucos tufos grandes e regulares, para a hierarquia ficar clara: a penugem é do contorno, o interior é limpo;
     - na pose de frio, a penugem eriçada continua sendo mais tufos e maiores, mas no mesmo desenho rítmico;
     - aplicar em todos os arquivos. O ícone, que já é liso, fica como está.

2. **Vista de lado: a sombra do fundo do ovo aparece como uma lâmina solta.** Evidência: `zoom-4.png` (2ª figura, canto de baixo à direita).
   - A faixa de sombra de um tom sai do contorno como uma tira mais escura desalinhada, que parece uma camada deslocada.
   - **Mudar:** a sombra fica dentro da silhueta, acompanhando a curva do ovo, como na vista de frente.

## Desvios declarados

| # | Desvio | Decisão |
| --- | --- | --- |
| 1 | Gorro verde-azulado `#3EA8AE` em vez de vermelho-tijolo (Chilly Willy; separação em cinza; distância da Pinguin) | aceito: motivo de originalidade e de leitura; preserva a ideia |
| 2 | Face com 188 e barriga 220 × 140 | aceito: as medidas da ficha se sobrepunham |
| 3 | Ovo com 398 | aceito |
| 4 | Olhos que abrem por baixo do arco | aceito: mantém o arco como identidade |
| 5 | Nadadeiras na ardósia escura; paleta com 5 cores | aceito |
| 6 | Pés em pá | aceito |
| 7 | Tremor com 4 traços | aceito |
| 8 | Arcos com 22 e bico 38 × 27 na versão em uma cor | aceito |
| 9 | `sem-acessorio` com 421 de altura (só falta a copa do gorro) | aceito: a ferramenta aponta "DIFERENTES", mas o ovo, os pés e o chão são os mesmos |
| 10 | Só a sombra de um tom, sem luz de cima | aceito; a correção do item 1 é o que garante o acabamento |
| — | Checagem fora de `direcao/` | aceito: a tarefa proíbe `direcao/`; o registro está na entrega (pane-558) e no `dados.js` |

## Resultado por critério

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Contrato de arquivos e regras de arquivo | ok: 11 arquivos; chão em y = 480; margens ok; sem tag proibida; `uma-cor` só em `#111111`; a altura diferente do `sem-acessorio` foi declarada | `saida-conferir.txt` |
| MSC-01 distinto e fiel à ficha | ok: ovo de filhote, olhos em arco, máscara de face, pés grandes, gorro com pompom. Distinto da 05 (a vizinha orgânica e compacta, pera de topete) | `prancha-claro.png` |
| MSC-03 usos reais | ok: lê muito bem no avatar e no ícone da tela inicial | `pagina-*.png` |
| MSC-04 poses | ok: neutro; comemorando (pulo com sombra, olhos abertos); alerta ("achei", nadadeira aponta); frio (gorro nos olhos, tremor, penugem eriçada, pés para dentro). Leem sem rótulo | `prancha-claro.png` |
| MSC-05 48 px | ok: "pinguim de gorro" sozinho, nos dois fundos, no círculo, entre os 47 ícones e com sol | `prancha-48.png` |
| MSC-06 originalidade (checagem refeita) | ok: ver abaixo | — |
| MSC-09 vistas 3D | ok: mesma altura, chão e linha dos olhos; perfil com bico projetado e barriga saliente; três quartos com a máscara envolvendo a frente. Item 2 à parte | `vista-*-512-claro.png` |
| Sol forte e tela pequena | ok | `icone-48-sol-claro.png` |
| Não depender de cor | ok: a versão em uma cor lê "filhote de gorro" (aba, pompom, máscara com arcos e bico, barriga) | `uma-cor-48x8-claro.png` |
| Fora do Brasil | ok | — |
| Acessório não essencial | ok: sem o gorro continua o mesmo filhote (olhos em arco, máscara, pés grandes) | `sem-acessorio-512-claro.png` |
| Evitar: detalhe fino | ok: o ícone é liso e sem detalhe abaixo do mínimo | `icone-48x8-claro.png` |
| Evitar: modelo pronto | ok com atenção: "pinguim fofo de gorro de pompom" é um tema comum de banco de imagens de inverno. O que afasta é a ausência de contorno, brilho e bochecha, os olhos em arco, a máscara de filhote e a paleta. O item 1 é o que falta para não parecer figurinha | — |
| Barra premium (5a) | **falha** em "As curvas são desenhadas?" (item 1). Cor, hierarquia, coerência e expressão estão bons | `zoom-4.png` |

## Originalidade (MSC-06), checagem refeita pelo QA

Checagem por descrição e busca em texto, sem busca reversa de imagem.

- **Chilly Willy** (filhote de gorro vermelho que passa frio): evitado pelo gorro verde-azulado e pelos olhos em arco calmos; a combinação ficou diferente. Desvio aceito.
- **Pudgy Penguins:** sem olhos grandes, sem bochecha rosa.
- **Pororo:** sem capacete nem óculos; não é azul e branco.
- **Pinga** (filhote da série Pingu): não é massa de modelar, não tem bico cônico.
- **Club Penguin:** tem pescoço de gorro e máscara de face; não é avatar redondo de cor lisa.
- **Marca Pinguin:** nada de laranja-avermelhado, azul-royal com laranja, disco ou letreiro.
- **Busca do QA:** "cute baby penguin wearing beanie pompom clipart flat vector". Trouxe bancos de imagens genéricos ([template.net](https://www.template.net/edit-online/571433/baby-penguin-clipart), [Adobe Stock](https://stock.adobe.com/618736433), [Depositphotos](https://depositphotos.com/vectors/penguin.html), [Magnific](https://www.magnific.com/vectors/friendly-pinguin)) e moldes de tricô ([Ravelry](https://www.ravelry.com/patterns/library/pompom-hat-penguin)). Nenhum personagem de marca com essa combinação. O risco é o de figurinha genérica, tratado no item 1, não o de cópia.

## Para a reentrega

Corrigir os itens 1 e 2 em todos os arquivos com penugem. O resto não precisa mudar. Rodar de novo o `render.py` e o `captura.py` e dizer o que mudou.

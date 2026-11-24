# Opção 01 · Corpo de barraca · rodada 1 · REPROVADA

Data: 2026-11-24 · Entregue por: pane-555 · Página: `design/mascote/apresentacao/opcoes/01/`
Eixos: traço geométrico (extremo) · idade adulto · proporção compacta, uma forma só · acabamento chapado sem linha · camping no desenho (forma de barraca). Bate com a ficha.

**Resumo:** a ideia está forte e muito bem resolvida no principal, no ícone e na versão em uma cor. De longe é uma barraca, de perto é um pinguim, e a silhueta não se confunde com nada. Todas as regras de arquivo passaram. Reprova por **três pontos de desenho nas poses e nas junções**, que deixam a opção abaixo da barra premium e do MSC-04. São correções localizadas, não de conceito.

Capturas: `qa/relatorios/01-r1/`. Comece por `zoom-4.png` (principal, alerta, chuva e três quartos em 512), `prancha-claro.png`, `prancha-escuro.png` e `prancha-48.png`. A saída completa está em `saida-conferir.txt`.

## O que precisa mudar

1. **Chuva (`pose-camping`): a chuva não se lê.** Evidência: `zoom-4.png` (3ª figura), `pose-camping-512-claro.png`.
   - As seis "gotas" em areia, com o topo cortado em diagonal, parecem lascas ou recortes na lona, não água.
   - A de baixo à direita sai pela borda da silhueta e parece um defeito do contorno.
   - A postura é quase a do neutro (só as abas mudam), então o desconforto fica todo nesses detalhes. O roteiro pede que o desconforto se leia pela postura e pela expressão, não por detalhe pequeno.

   **Mudar:**
   - gotas com forma de gota inequívoca (base redonda, ponta para cima), inteiras e dentro da silhueta, ou caindo de fora sobre a lona;
   - algumas gotas ou traços de chuva também acima e ao lado da figura, para "está chovendo" se ler de longe;
   - postura de quem aguenta a chuva: a lona "encolhe" um pouco, o topo baixa e as abas se fecham sobre o corpo;
   - manter os olhos semicerrados e a barriga seca, como pede a ficha.

2. **Alerta: a expressão lê como "desconfiado" ou "entediado", não como "atenção".** Evidência: `zoom-4.png` (2ª figura).
   - A pálpebra reta a 42% deixa o olhar pesado.
   - O rosto ficou quase igual ao da chuva (pálpebra a 50%): sem o rótulo, as duas se confundem.
   - A ficha pede "pálpebra desce metade". Foi seguida, mas o resultado não passa na pergunta "que emoção é esta?" (MSC-04) nem no "olhar atento, nunca bobo" da direção.

   **Mudar:** olhos abertos e atentos, por exemplo cápsulas inteiras, com pupila menor e deslocada para onde a asa aponta, ou um leve estreitamento só na horizontal. Junto com o corpo inclinado e a asa apontando, isso diz "olha ali". Declare como desvio da ficha, com este motivo.

3. **Degrau no encontro da aba com a lona.** Evidência: `zoom-4.png` (1ª figura, à altura do ombro), visível também no cabeçalho do site e na tela de abertura (`pagina-usos-claro.png`).
   - O degrau horizontal de 18 aparece como uma prateleirinha de cantos vivos.
   - Lê como sobra de construção do vetor, não como dobra de lona.
   - É o único canto vivo e "acidental" numa figura em que todo o resto é limpo (pergunta "As curvas são desenhadas?" da seção 5a).

   **Mudar:** resolver a junção como forma intencional:
   - ou a aba nasce da lona numa diagonal contínua;
   - ou o degrau vira uma dobra assumida, com raio nos dois cantos e tamanho que se leia como dobra (≥ 24);
   - aplicar o mesmo nas poses, no ícone e na versão em uma cor.

## Desvios declarados

| # | Desvio | Decisão |
| --- | --- | --- |
| 1 | Triângulo com 412 de altura, para a figura caber em 448 com os pés | aceito: mantém o ângulo da lona e a ideia |
| 2 | Cantos arredondados pelos extremos | aceito |
| 3 | Corpo `#2F6B4F` em vez de `#1F3D2E` (contraste no fundo escuro: 3,0:1 contra 1,6:1) | aceito: é motivo de leitura e continua sendo verde de mata, sem azul nem laranja |
| 4 | Porta com 172 de altura em vez de 300; olhos e bico deslocados | aceito: com 300 a porta encostaria nos olhos e os recortes se fundiriam na versão em uma cor. A porta continua lendo como porta (`uma-cor-48x8-claro.png`) |
| 5 | Bico em pipa | aceito |
| 6 | Abas com degrau e ponta dentro da margem | aceito na proporção; **a execução do degrau é o item 3** |
| 7 | Aba saindo pelo dorso na vista de lado | aceito: coerente com a frente e com os três quartos |
| 8 | Alerta a 10°, pálpebra a 42% | inclinação aceita; **pálpebra recusada** (item 2) |
| 9 | Comemorando com as asas a 14° | aceito |
| 10 | Tremor em cápsulas fechadas | aceito |
| 11 | Branco do olho em areia | aceito |
| 12 | Checagem não escrita em `direcao/checagens/01.md` | aceito: a tarefa do designer proíbe `direcao/`. Os 10 passos estão na entrega (pane-555), e a declaração está no `dados.js`. O registro está apontado aqui; o piloto decide se libera o arquivo. |

## Resultado por critério

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Contrato de arquivos e regras de arquivo | ok: 12 arquivos, nenhum faltando ou sobrando; viewBox 512; sem tag proibida; altura 448 igual em todos os arquivos em pé; chão em y = 480; margens ok; `uma-cor` só em `#111111` | `saida-conferir.txt` |
| MSC-01 distinto e fiel à ficha | ok: silhueta triangular única; ideia, eixos e "o que o distingue" preservados | `principal-silhueta.png`, `uma-cor-512-claro.png` |
| MSC-03 usos reais | ok: lê bem no ícone da tela inicial, na abertura, no avatar da tela do app, no cabeçalho do site e na versão em uma cor | `pagina-usos-claro.png`, `pagina-*.png` |
| MSC-04 poses | **falha** (itens 1 e 2). Neutro, comemorando, frio e calor ok: o frio lê pelo corpo encolhido e pelo tremor; o calor, pelo topo "derretido" e pela gota | `prancha-claro.png` |
| MSC-05 48 px | ok: pinguim e barraca em 48 px reais; cabe no círculo do Android; destaca entre os 47 ícones nos dois fundos; resiste ao "sol forte"; arte própria, não redução | `prancha-48.png`, `icone-48-entre-apps-*.png` |
| MSC-06 originalidade (checagem refeita) | ok: ver abaixo | — |
| MSC-09 vistas 3D | ok: mesma altura, chão e linha dos olhos; lado em perfil para a esquerda; três quartos com os dois olhos. Observação: nos três quartos, o canto de baixo à esquerda da porta encosta no contorno da figura e abre um "dente" na silhueta. Vale deixar uma faixa de lona entre a porta e a borda | `vista-*-512-claro.png` |
| Sol forte e tela pequena | ok: corpo, porta e olhos se mantêm com contraste achatado | `icone-48-sol-claro.png` |
| Não depender de cor | ok: em cinza, corpo e barriga separam; a versão em uma cor é a mais forte | `icone-48-cinza-escuro.png`, `uma-cor-48x8-claro.png` |
| Fora do Brasil | ok: sem texto, bandeira, objeto local ou gesto | — |
| Acessório não essencial | não se aplica: não há acessório em nenhum arquivo | — |
| Evitar: detalhe fino | ok no ícone: olhos com 6 px e pupila com 3 px em 48; nada abaixo do mínimo | `icone-48x8-claro.png` |
| Evitar: modelo pronto | ok: não é intercambiável com os pinguins redondos de banco de imagens | — |
| Barra premium (5a) | **falha** em "As curvas são desenhadas?" (item 3) e em "A expressão é de personagem?" (item 2). Hierarquia, cor contida e coerência entre os arquivos estão bons | `zoom-4.png` |

## Originalidade (MSC-06), checagem refeita pelo QA

Checagem por descrição e busca em texto, sem busca reversa de imagem.

- **Pinguin:** o corpo não é laranja-avermelhado; não há azul-royal com laranja; não há disco nem círculo; não há letreiro. Verde com areia e âmbar, triangular. O emblema antigo (pinguim abstrato preto e branco em disco azul de aro preto) foi confirmado por busca ([1000logos](https://1000logos.net/most-famous-logos-with-a-penguin/amp/)) e não tem nada em comum com a opção.
- **Pittsburgh Penguins:** é o único pinguim conhecido ligado a triângulo, mas o triângulo é uma moldura amarela atrás de um pinguim de patins com taco ([logos-world](https://logos-world.net/pittsburgh-penguins-logo/)). Na 01 o triângulo é o próprio corpo, verde, sem moldura e sem esporte. Combinação diferente.
- **Demais referências:** Tux, Pingu, Club Penguin, Pudgy, Pororo, QQ, Penguin Books, Badtz-Maru, Piplup, Suica e emojis. Nenhuma tem silhueta triangular, olhos em cápsula vertical ou barriga em arco de porta.
- **Buscas do QA:** "triangular penguin mascot logo green geometric", "penguin shaped like a tent logo camping brand" e "Pinguin outdoor brand logo Activent 365 penguin emblem description". Não apareceu pinguim em forma de barraca nem pinguim triangular verde. Os resultados são galerias genéricas ([design.com](https://www.design.com/maker/logo/geometric-penguin-bird-186947/details), [Vistaprint](https://www.vistaprint.com/logomaker/ideas/penguin-logos), [99designs](https://99designs.com/inspiration/logos/tent)).
- **Modelo pronto:** os pinguins de banco de imagens são redondos ou gordinhos, com acessórios de festa. A 01 não é intercambiável com eles.
- **Referência nova:** a marca de freeride "Penguin" (edu-penguin-design.odoo.com), trazida pelo designer, vai para `qa/referencias-novas.md`. Não há descrição do logotipo, e não pesa contra a opção.

## Para a reentrega

Corrigir os itens 1 a 3, refazer `pose-camping`, `pose-alerta` e as junções das abas em todos os arquivos, rodar de novo o `render.py` e o `captura.py`, e dizer o que mudou. O resto não precisa ser mexido.

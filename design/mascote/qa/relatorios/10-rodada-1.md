# Opção 10 · Boneco de lanterna · rodada 1 · REPROVADA

Data: 2026-11-24 · Entregue por: pane-572 · Página: `design/mascote/apresentacao/opcoes/10/`
Eixos: traço geométrico · idade filhote · proporção definida e curta · acabamento com volume (vinil, luz dura) · camping em acessório (lanterna). Bate com a ficha.

**Resumo:**
- Passou: a construção de brinquedo articulado está muito bem resolvida (cabeça-esfera maior que o corpo, braços e pernas cilíndricos, olhos quadrados, bico em losango), e a lanterna é ótima: chapada, de alça grossa, legível em 48 px. As poses leem bem, as vistas são coerentes e as regras de arquivo e a página passaram.
- Reprova por **um ponto, o mesmo que reprovou a 06 na rodada 1**: o rosto branco ganhou o bico no alto entre os olhos, a **máscara em coração** do pinguim de desenho genérico.
- Na 10, isso pesa mais. Um filhote pequeno **azul e branco**, de rosto branco em coração e cabeça redonda grande, é a descrição-base do Pororo ("small, blue-and-white penguin", sem o capacete). Também é a do emoji e a do avatar do Club Penguin.
- A ficha não pede máscara no rosto. Ela pede a cabeça-esfera com "dois quadrados" de olho. O branco foi acrescentado, com razão, para os olhos escuros aparecerem, mas a forma escolhida é a genérica.

Capturas: `qa/relatorios/10-r1/`. Comece por `zoom-4.png` (principal, alerta, lado e chuva em 512), depois `prancha-claro.png`, `prancha-48.png` e `saida-conferir.txt`.

## O que precisa mudar

1. **O rosto: trocar a máscara em coração por uma placa de rosto geométrica, na linguagem de brinquedo da opção (MSC-06 e MSC-01).** Evidência: `zoom-4.png`, `uma-cor-512-claro.png`.
   - **Hoje:** recorte branco com dois lóbulos sobre os olhos e um bico no meio da testa, igual ao rosto padrão de Tux, dos emojis, do Club Penguin e do Pororo. Na versão em uma cor, sobra exatamente esse rosto genérico.
   - **Mudar:**
     - o rosto claro como uma **forma geométrica própria do brinquedo**: por exemplo, um círculo ou um quadrado de cantos bem arredondados (ecoando os olhos quadrados), encaixado na esfera como uma peça;
     - ou, se o designer preferir, a esfera inteira em azul com os olhos quadrados ganhando um aro claro, sem máscara;
     - **sem** o entalhe e os lóbulos;
     - aplicar na frente, nos três quartos, no perfil, nas poses, no ícone e na versão em uma cor. A placa de rosto pode virar o traço mais reconhecível da opção.
   - Declarar como desvio da ficha, com o motivo.

## Observação (não reprova)

- **Paleta azul e branco com laranja no bico:** por si só é do bicho e passa. Com o item 1 resolvido, o filhote azul de rosto geométrico e lanterna se afasta do Pororo, que é azul e branco de capacete de aviador e óculos, e a combinação fica própria. Não clareie o azul-ardósia.

## Resultado por critério

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Contrato de arquivos e regras de arquivo | ok: 13 arquivos; altura 448 igual; chão em y = 480; margens ok; sem tag proibida; `uma-cor` só em `#111111`; página com 0 erro | `saida-conferir.txt` |
| MSC-01 distinto e fiel à ficha | **falha** no rosto (item 1). Construção, eixos e lanterna fiéis; distinto da 04 (a vizinha geométrica de acessório) | `zoom-4.png` |
| MSC-03 usos reais | ok | `pagina-*.png` |
| MSC-04 poses | ok: neutro, comemorando (lanterna erguida, pulo), alerta (lanterna apontada), chuva (`pose-camping`), frio (lanterna abraçada) e calor | `prancha-claro.png` |
| MSC-05 48 px | ok: pinguim com lanterna, a lanterna legível | `prancha-48.png` |
| MSC-06 originalidade (checagem refeita) | **falha**: o rosto em coração com azul e branco de filhote aproxima do Pororo, do emoji e do Club Penguin | — |
| MSC-09 vistas 3D | ok: primitivas giram; o perfil mostra o bico em pirâmide e a calota da barriga | `zoom-4.png` (3ª) |
| Sol forte e tela pequena | ok | `icone-48-sol-claro.png` |
| Não depender de cor | ok na leitura; o rosto no item 1 | `uma-cor-48x8-claro.png` |
| Fora do Brasil | ok | — |
| Acessório não essencial | ok: sem a lanterna continua o boneco de cabeça grande e olhos quadrados | `sem-acessorio-512-claro.png` |
| Evitar: detalhe fino | ok: a alça da lanterna ≥ 24 e o vão da alça abertos em 48 px | `icone-48x8-claro.png` |
| Evitar: modelo pronto | atenção pelo rosto genérico (item 1) | — |
| Barra premium (5a) | ok: volume de vinil com luz dura, formas limpas, coerência entre arquivos | `prancha-claro.png` |

## Originalidade (MSC-06), checagem refeita pelo QA

Checagem por descrição e busca em texto, sem busca reversa de imagem.

- **Pororo:** "a small, blue-and-white penguin" de capacete de aviador e óculos ([Korea Times](https://www.koreatimes.co.kr/www/news/nation/2012/02/334_105217.html), [Wikipedia](https://en.wikipedia.org/wiki/Pororo_the_Little_Penguin)). A 10 não tem capacete nem óculos, mas filhote + azul e branco + rosto branco em coração + cabeça redonda grande é a base dele.
- **Emojis, Club Penguin e Tux:** o rosto em coração é o elemento comum. Ver a 06, rodada 1.
- **QQ:** sem lenço vermelho, sem piscadela. Ok.
- **Marca Pinguin:** nada de laranja-avermelhado, azul-royal vivo com laranja (o azul é ardósia escura e o laranja é só bico e pés), disco ou letreiro.
- Com uma placa de rosto geométrica, a combinação (boneco articulado + olhos quadrados + placa de rosto + lanterna) fica própria.

## Para a reentrega

Corrigir o item 1 em todos os arquivos, rodar de novo o `render.py` e o `captura.py`, declarar o desvio do rosto e dizer o que mudou.

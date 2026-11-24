# Opção 05 · Topete de chama · rodada 1 · REPROVADA

Data: 2026-11-24 · Entregue por: pane-559 · Página: `design/mascote/apresentacao/opcoes/05/`
Eixos: traço orgânico · idade jovem · proporção compacta · acabamento com volume (vinil, luz de cima) · camping no desenho (topete-chama). Bate com a ficha.

**Resumo:** passou nas regras de arquivo, nas alturas, no chão, na página e no contraste. O ícone lê "pinguim com chama" muito bem, e a chuva e o comemorando leem sem rótulo. Reprova por dois pontos ligados entre si, que juntos fazem o personagem cair no risco que a direção apontou para a 05: **topete com cara de cabelo espetado + rosto de bravo = Badtz-Maru**. Os dois ainda puxam o personagem para "mal-humorado", o contrário de "simpático, o amigo que avisa".

Capturas: `qa/relatorios/05-r1/`. Comece por `rosto.png` (rosto do alerta e do neutro, ampliados) e `zoom-4.png` (principal, lado, alerta e chuva em 512), depois `prancha-claro.png` e `prancha-48.png`. A saída completa está em `saida-conferir.txt`.

## O que precisa mudar

1. **O topete lê como cabelo espetado, não como chama macia (MSC-06 e MSC-01).** Evidência: `zoom-4.png` (1ª e 3ª figuras), `uma-cor-48x8-claro.png`, `icone-48-silhueta.png`.
   - A ficha pede **três línguas inclinadas para o mesmo lado, com pontas arredondadas**, formando uma chama, e lista o risco: "05 não tem cabelo espetado (Badtz-Maru)".
   - No principal e nas poses, as três pontas saem em ângulos diferentes: a da esquerda para a esquerda, a do meio para a direita, a da direita para cima. Vales fundos as separam. O resultado são três espetos, um moicano.
   - Na versão em uma cor, a coroa de pontas é exatamente a silhueta de "cabelo espetado".
   - **Mudar:**
     - as três línguas nascem de uma base comum, como uma chama só, e **inclinam todas para o mesmo lado**, a do meio maior;
     - vales rasos e arredondados entre elas;
     - pontas macias.
   - O ícone, que já está assimétrico e lê como chama, é a referência: leve essa leitura para o principal, as vistas, as poses e a versão em uma cor.

2. **O rosto neutro lê como bravo (MSC-04 e "Quem ele é").** Evidência: `rosto.png` (à direita).
   - No neutro, a pálpebra cai reta sobre a metade de cima do olho, e a sobrancelha grossa fica logo acima, quase encostada. É a expressão de desconfiado ou mal-humorado.
   - Somada ao topete espetado, completa o "surly" do Badtz-Maru.
   - O desvio 4 tentou resolver com o tom de luz na sobrancelha, mas a forma ainda franze.
   - **Mudar:**
     - no neutro, olhos abertos e redondos, sem a pálpebra reta (ou com ela bem mais alta);
     - sobrancelha mais alta e afastada do olho, com a ponta de dentro levemente erguida: atenção e simpatia, não carranca;
     - manter a sobrancelha espessa da ficha, que é a personalidade, mas a direção dela diz "atento", não "bravo".

   O alerta (`rosto.png`, à esquerda) está bom: olhos abertos, pupilas pequenas e sobrancelha erguida. Só confira que as duas pupilas olham para o mesmo lado e na mesma altura; hoje a da direita está mais alta.

## Observações (não reprovam)

- **Forma do corpo:** a "pera invertida, cabeça mais larga que o corpo" ficou perto de uma caixa de cantos arredondados. A diferença de largura entre a linha dos olhos e o quadril quase não se vê de frente (`uma-cor-512-claro.png`). Ao refazer, vale acentuar o estreitamento para o quadril; é "o que o distingue" na ficha.
- **Cor:** azul-noite com laranja-brasa é a paleta da ficha. O azul está escuro o bastante para ler como azul-noite, não como o azul-royal da Pinguin, e o laranja fica só no bico, nos pés e na ponta do topete. Aceito. Não clareie o corpo (é o ponto que reprovou a 04).
- **Versão em uma cor:** o anel de ~18 em volta da pupila (desvio 8) ficou abaixo do vão de 24, mas em 48 px o olho com ponto lê melhor. Aceito.

## Desvios declarados

| # | Desvio | Decisão |
| --- | --- | --- |
| 1 | Corpo com 378 de altura | aceito |
| 2 | Linha do bico com 8 | aceito (mínimo do padrão) |
| 3 | Quinta cor, a "luz" `#384F7E` | aceito |
| 4 | Sobrancelha no tom de luz com contorno | aceito como cor; **a forma da expressão falha** (item 2) |
| 5 | Pálpebra leve no neutro | **recusado** (item 2): no resultado, a pálpebra é o que dá a cara de bravo |
| 6 | Sombra discreta sob o bico | aceito |
| 7 | Línguas do ícone assimétricas | aceito: é a leitura certa de chama; levar para os outros arquivos (item 1) |
| 8 | Recortes da versão em uma cor (bico 84 × 32, anel da pupila ~18) | aceito |
| 9 | Sombra de contato no pulo | aceito |
| 10 | Alerta deslocado e inclinado 5°, asa em escorço | aceito |
| 11 | Topete murcho da chuva como forma separada | aceito: a chuva lê bem |
| 12 | Barriga em faixa no perfil | aceito |

## Resultado por critério

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Contrato de arquivos e regras de arquivo | ok: 10 arquivos; altura 447 igual; chão em y = 480; margens ok; `uma-cor` só em `#111111` | `saida-conferir.txt` |
| MSC-01 distinto e fiel à ficha | **falha** no topete (item 1); a forma do corpo está em observação. Distinto da 03 (a vizinha orgânica e compacta) | `zoom-4.png` |
| MSC-03 usos reais | ok | `pagina-*.png` |
| MSC-04 poses | **falha** no neutro (item 2); comemorando, alerta e chuva leem sem rótulo | `prancha-claro.png`, `rosto.png` |
| MSC-05 48 px | ok: "pinguim com chama" no ícone; destaca entre os apps, dentro do círculo e com sol | `prancha-48.png` |
| MSC-06 originalidade (checagem refeita) | **falha**: semelhança de combinação com o Badtz-Maru (cabelo espetado + expressão surly), risco já listado na ficha | — |
| MSC-09 vistas 3D | ok: mesma altura, chão e linha dos olhos; perfil com bico projetado e barriga saliente | `vista-*-512-claro.png` |
| Sol forte e tela pequena | ok | `icone-48-sol-claro.png` |
| Não depender de cor | ok na leitura; a silhueta da coroa espetada entra no item 1 | `uma-cor-48x8-claro.png` |
| Fora do Brasil | ok | — |
| Acessório não essencial | não se aplica (sem acessório) | — |
| Evitar: detalhe fino | ok | `icone-48x8-claro.png` |
| Evitar: modelo pronto | ok | — |
| Barra premium (5a) | **falha** em "A expressão é de personagem?" (item 2). Linha, cor e coerência estão bons | `rosto.png` |

## Originalidade (MSC-06), checagem refeita pelo QA

Checagem por descrição e busca em texto, sem busca reversa de imagem.

- **Badtz-Maru** (Sanrio): pinguim escuro de **cabelo espetado** e expressão **surly**, com língua de fora ([lista Sanrio](https://en.wikipedia.org/wiki/List_of_Sanrio_characters), `originalidade.md`). A 05 não tem língua de fora, mas tem a combinação coroa de pontas + rosto fechado + corpo escuro. É a semelhança que a direção mandou evitar. Reprova (item 1 + item 2).
- **Pen Pen** (topete vermelho eriçado e garras) e os **rockhoppers** de *Tá Dando Onda* (penas amarelas laterais): a chama central de ponta laranja já afasta. Corrigir o item 1 também afasta deles.
- **Marca Pinguin:** o corpo não é laranja-avermelhado, o azul não é royal vivo, e não há disco nem letreiro.
- **Tux, Pingu, Club Penguin, Pudgy, Pororo, QQ, Penguin Books e emojis:** nenhum traço em comum.
- **Referências novas** trazidas pelo designer (Pengu de Teamfight Tactics; Penguru e Coach de Mario): vão para `qa/referencias-novas.md`.

## Para a reentrega

Corrigir os itens 1 e 2 em todos os arquivos: o topete em todos; o rosto neutro em `principal`, `vista-frente`, `pose-neutro`, nas vistas e no `uma-cor`. Rodar de novo o `render.py` e o `captura.py` e dizer o que mudou.

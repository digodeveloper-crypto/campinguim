# Opção 02 · Guia de lenço · rodada 2 · APROVADA

Data: 2026-11-24 · Entregue por: pane-556 · Página: `design/mascote/apresentacao/opcoes/02/`
Base: `02-rodada-1.md` (4 itens), roteiro completo refeito sobre os arquivos novos.

**Resumo:**
- Agora é pinguim na primeira olhada. A barriga clara domina a frente, do queixo até entre as pernas, e as asas foram para o flanco.
- O bico de frente ficou curto, apontando para quem olha.
- A linha ganhou peso real embaixo e uma sombra de um tom.
- As pernas têm coxa.
- O alerta abre o olho e olha para onde aponta.
- O ícone e a versão em uma cor passaram a ler como pinguim.
- A opção ficou distinta da 07 (baixa e parruda) e da 09, e preserva a ideia do guia alto de lenço.

Capturas: `qa/relatorios/02-r2/` (`zoom-4.png` com principal, alerta, lado e uma cor em 512; `prancha-claro.png`; `prancha-48.png`; `saida-conferir.txt`).

## Itens da rodada 1

| # | Item | Resultado | Evidência |
| --- | --- | --- | --- |
| 1 | Leitura de pinguim | ok: barriga clara dominante; asas no flanco; em 48 px o ícone mostra o peito claro, o lenço e o bico, e lê "pinguim de lenço"; a versão em uma cor lê pinguim pela barriga em V e pela silhueta | `zoom-4.png`, `prancha-48.png` |
| 2 | Bico de frente | ok: triângulo curto em perspectiva de frente; o bico longo fica no lado e nos três quartos | `zoom-4.png` (1ª e 3ª) |
| 3 | Acabamento | ok: a linha engrossa embaixo, há sombra de um tom, as pernas têm coxa e tornozelo. As asas seguem longas, com cotovelo e ponta arredondada, exatamente como a ficha pede ("longas, 200, cotovelo sugerido, ponta arredondada"); aceito como linguagem da opção | `prancha-claro.png` |
| 4 | Alerta entediado | ok: olho aberto, pupila e cabeça viradas para o lado que a asa aponta | `zoom-4.png` (2ª) |

## Observações (não reprovam)

- **Rosto da versão em uma cor:** os olhos em amêndoa sem pupila e o bico em triângulo, todos recortados na cabeça escura, ainda lembram de leve uma máscara (`zoom-4.png`, 4ª). Melhorou muito, e o corpo leva a leitura. Se houver ajuste futuro, uma pupila como ilha de tinta (com o vão mínimo) deixaria o rosto mais vivo.
- **Erro de console na página:** a página tenta carregar `opcoes/02/estudo/estudo-ilustrado.png`, que não existe (`saida-conferir.txt`). Isso vem do bloco "Estudo ilustrado" que o pane-567 está pondo na estrutura agora, não da opção. Vou conferir na validação da estrutura que a página não gere erro quando o estudo não existe.

## Resultado por critério

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Contrato de arquivos e regras de arquivo | ok: 11 arquivos; altura 447 igual; chão em y = 480; margens ok; sem tag proibida; `uma-cor` só em `#111111` | `saida-conferir.txt` |
| Desvios | os 10 da rodada 1 continuam aceitos. Desvio 2 (bico de frente curto) aceito como parte da correção pedida | — |
| MSC-01 distinto e fiel à ficha | ok | `prancha-claro.png` |
| MSC-03 usos reais | ok (o erro de console é da estrutura, ver acima) | `pagina-*.png` |
| MSC-04 poses | ok: neutro, comemorando, alerta e calor leem sem rótulo | `prancha-claro.png` |
| MSC-05 48 px | ok | `prancha-48.png` |
| MSC-06 originalidade | ok: a checagem da rodada 1 vale. Com a barriga dominante, conferi também Tux (gordo, sentado, bico e pés amarelos) e o imperador realista de *Happy Feet*: a 02 é alta, articulada, de lenço ocre e traço de pincel, combinação diferente. Feita por descrição e busca em texto, sem busca reversa de imagem | — |
| MSC-09 vistas 3D | ok | `zoom-4.png` (3ª) |
| Sol forte e tela pequena | ok | `icone-48-sol-claro.png` |
| Não depender de cor | ok, com a observação do rosto | `uma-cor-48x8-claro.png` |
| Fora do Brasil | ok | — |
| Acessório não essencial | ok: sem o lenço, a barriga em V aparece inteira e o personagem continua o mesmo | `sem-acessorio-512-claro.png` |
| Evitar: detalhe fino | ok | `icone-48x8-claro.png` |
| Evitar: modelo pronto | ok | — |
| Barra premium (5a) | ok: hierarquia clara, linha com peso, cor contida (grafite, marfim, ocre, âmbar), expressão de adulto atento, coerência entre arquivos | `prancha-claro.png` |

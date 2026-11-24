# Guia de uso do mascote 03 (MSC-13, parte 2D) · rodada 1 · APROVADO

Data: 2026-11-24 · Entregue por: pane-579 · Alvo: `design/mascote/guia/` (`guia.html`, `LEIA-ME.md`, `arte/`, `errado/`, `medidas/`)
Base: MSC-13 do PRD ("cores oficiais, proporções, tamanhos mínimos e o que o mascote nunca faz"), pacote final aprovado (`final-rodada-2.md`), `prototipos/direcao/direcoes.md` e `padrao-producao.md` §6, `direcao/originalidade.md`, `CLAUDE.md`.

**Resumo:** o guia cobre os quatro pontos do MSC-13 e vai além, com:
- qual versão usar em fundo claro e escuro, com os contrastes;
- respiro;
- poses e onde usar;
- as 7 expressões;
- as vistas;
- o ícone;
- as decisões provisórias marcadas.

As 41 artes são cópias byte a byte do pacote aprovado. Os números conferem. A página abre sem erro, e os exemplos de erro estão rotulados e separados. O uso em 3D e em vídeo fica declaradamente para depois do modelo 3D.

Capturas: `qa/relatorios/guia-r1/` (`saida.txt`; `nunca.png` com a página inteira; `nunca-sec11.png` com a seção 11).

| Item | Resultado | Evidência |
| --- | --- | --- |
| Artes sem redesenho | ok: 41 de 41 arquivos de `guia/arte/` idênticos a `final/` (SHA-256 recalculado pelo QA) | verificação por script |
| Cores oficiais | ok: ardósia `#4A5560`, ardósia-escura `#333C45`, creme `#FBF3E4`, âmbar `#E4A33A`, verde-azulado `#3EA8AE`, tinta `#111111`, branco `#FFFFFF`, iguais ao pacote e a `direcoes.md`. Gorro fixo marcado como **provisório** (P-20) | seção 2 do guia |
| Contrastes declarados | ok, recalculados pela fórmula da WCAG: corpo × `#808080` 1,93; × `#A4A4A4` 3,05; corpo × `#121212` 2,46; creme × `#121212` 16,99; uma cor positiva no limiar `#606060` (3,00); negativa no limiar `#949494` (3,03); gorro × creme 2,57; pés × creme 1,98 | cálculo do QA |
| Proporções e respiro | ok: medidas tiradas das coordenadas do `principal` e da caixa do `captura.py conferir` (64, 46, 448, 480); respiro mínimo 1/16 da prancha (32/512), como no padrão de produção. A ressalva de até 2 unidades pelos pontos de controle das curvas está declarada | seções 4 e 5 do guia |
| Tamanhos mínimos | ok: as pranchas de `medidas/` (16 a 96 px reais, claro e escuro) confirmam ícone claro em 24 px, ícone escuro em 32, uma cor em 24, figura inteira em 48 e expressão como mensagem em 64. A conversão para impressão está marcada como **não testada em papel** | `medidas/tamanhos-claro-x4.png` |
| O que nunca faz | ok: 11 exemplos lado a lado, cada um com uma única mudança e o motivo: esticar; girar; espelhar; recortar; trocar cores; gorro de outra cor (com a razão Chilly Willy); disco azul (marca Pinguin); balão; texto ou letreiro; versão clara no escuro sem apoio; transparência ou filtro. Mais a lista sem desenho. Os arquivos de erro estão em `errado/`, com o comentário "EXEMPLO DE ERRO, NUNCA USAR" | `nunca-sec11.png` |
| Coerência com os protótipos | ok: "só a uma cor muda de tinta", "uma vez por tela, nunca em lista, gastos ou formulário" e apoio de pelo menos 3:1 no escuro são as regras de `padrao-producao.md` §6 | seções 3, 7 e 11 do guia |
| Página | ok: 0 erro, 0 pedido externo, 0 alvo menor que 44 px, 0 texto abaixo de AA, sem rolagem horizontal, em 390 e 1440, nos dois temas | `saida.txt` |
| Escopo e perguntas | ok: o 3D e o vídeo ficam para depois do modelo (seção 12). A seção 13 lista as perguntas para o responsável: cor do gorro, uso em tela de preocupado, calor e surpreso, e impressão | seções 12 e 13 do guia |

Observação (não reprova): `guia/arte/` duplica arquivos de `final/`. Se o pacote final mudar, a cópia do guia precisa ser refeita e reconferida por SHA-256. Vale lembrar disso no LEIA-ME do pacote final.

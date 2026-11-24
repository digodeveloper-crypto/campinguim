# Estrutura da apresentação · rodada 2 · APROVADA

Data: 2026-11-24 · Validado pelo QA (pane-551) · Entregue por: pane-554
Alvo: `design/mascote/apresentacao/` (páginas, `_compartilhado/`, `opcoes/00-exemplo`, `opcoes/01` a `10` vazias, `LEIA-ME.md`)
Base: relatório da rodada 1 (`estrutura-rodada-1.md`), decisões do piloto (sem slogan na abertura; "Entrar na lista de espera" fica; sem abas na tela do app; recomendação ignora repetida) e `qa/roteiro.md`, seção 5.

**Resumo:** os 8 itens da rodada 1 foram corrigidos e as 4 decisões do piloto foram aplicadas. Refiz a bateria inteira com a minha ferramenta, nas páginas originais e numa cópia temporária preenchida pelo LEIA-ME com erros de propósito. Nenhuma falha de contraste, toque, rolagem, erro ou pedido externo.

Capturas e saídas: `qa/relatorios/estrutura-r2/` (`file-*` = páginas originais; `teste-*` = cópia preenchida; `r2-usos-*` = blocos dos usos reais; `r2-pendencias-*` = avisos ao designer; `saida-file.txt`, `saida-teste-leiame.txt`, `saida-interacao.txt`).

## Itens da rodada 1

| # | Item | Resultado | Evidência |
| --- | --- | --- | --- |
| 1a | Informação de camping sem data e autor (princípio 6) | ok: os dois "Atenção" trazem "última: Carla R., nov/2026", e entrou a linha de regras do brief 2: "Som até 22h: cumprida · 6 confirmações · última: Carla R., nov/2026" | `r2-usos-08-1440.png`, `r2-usos-05-390-mosaico.png` |
| 1b | Navegação "Listas · Campings · Grupos" no site | ok: saiu; o cabeçalho tem logo, nome e "Entrar na lista de espera" (tela 15 da SPEC e do brief 2, decisão do piloto) | idem |
| 1c | Abertura com barra e "Preparando a lista" | ok: mascote, nome e botão "Começar" (tela 1 da SPEC); o slogan saiu (decisão do piloto) | idem |
| 1+ | Abas da tela do app | ok: saíram (decisão do piloto) | idem |
| 2 | Contraste com acento de cor média | ok: testei verde `#3f8f5a`, laranja `#e07a2f`, cinza `#8a8a90` e amarelo `#f0b429` como primeira cor da paleta; o texto escolhe a cor certa (escuro sobre laranja e amarelo). Zero texto abaixo de AA nas 72 capturas, inclusive o "em produção" com fundo escuro | `saida-file.txt`, `saida-teste-leiame.txt` |
| 3 | Cabeçalho do site ilegível no celular | ok: em 390 px vira versão de celular (logo e nome, botão embaixo, chamada em 2 linhas). Medido: nome 20 px, botão 14 px, chamada 34 px, subtítulo 17 px | `r2-usos-05-390-mosaico.png` |
| 4 | Alvos de toque < 44 px | ok: zero em todas as páginas e larguras, inclusive avaliação e recomendação preenchida | `saida-*.txt` |
| 5 | Textos fora do arquivo de textos | ok: "Páginas" e as mensagens de pendência foram para `textos.js` (`topo.navRotulo`, bloco `pendencias`); nenhum texto de interface no código | `textos.js` |
| 6 | Aviso de pendências calado | ok, testado de verdade: chave esquecida `["00"]` na pasta 07 mostra o aviso com a instrução (e não "em produção"); `numero` "40" na pasta 04 é avisado; arquivo faltando e 8 poses extras são listados no aviso da 09 | `r2-pendencias-04.png`, `-07.png`, `-09.png` |
| 7 | Nota "À esquerda… À direita" | ok: "Primeiro a versão grande; depois o ícone…" | `textos.js` |
| 8 | Frase da página inicial | ok: "A folha de avaliação fica no menu do topo." | `textos.js` |
| + | Recomendação com opção repetida | ok: "05, 3, 03, 08" vira 05, 03, 08 (ignora a repetida e completa com a seguinte) | `saida-interacao.txt` |

## O que continua valendo da rodada 1

48 px CSS reais (página e comparação); abre por `file://` e por servidor nas 6 páginas; zero pedido externo; sem rolagem horizontal em 390 e 1440; botão de fundo funciona e se mantém entre páginas; 7 critérios iguais ao brief; notas guardadas depois de recarregar; "Copiar como texto" funciona; recomendação só pelo botão discreto com aviso; bloco "Sem o acessório"; 4 a 7 poses; cores neutras. Nas páginas originais, todas as 28 capturas saíram com 0 erro de console.

Os erros de console da cópia de teste são todos dos erros plantados de propósito: o arquivo apagado da 09 e o `numero` "40" da 04.

## Observação (não reprova)

- Com `numero` errado (teste 04: "40"), a inicial, a comparação e a avaliação montam o caminho da arte pelo `numero` e mostram "arte ausente". A página da própria opção avisa o erro, então o designer o vê antes de entregar. Para ficar mais robusto, as páginas de conjunto poderiam montar o caminho pela pasta, não pelo `numero`. Fica a critério do autor; não muda a aprovação.

## Como foi testado

```
python -I captura.py pagina <7 páginas originais> relatorios/estrutura-r2 --rotulo file-<nome> --auditar      exit 0 (7/7)
python -I captura.py pagina <cópia preenchida: 11 páginas> relatorios/estrutura-r2 --rotulo teste-<nome> --auditar  exit 0 (11/11)
python -I interacao.py <cópia> relatorios/estrutura-r2   (file:// e http://127.0.0.1:8765)                        exit 0
```

A cópia, o montador de teste e o script de interação ficaram na pasta temporária do QA e foram apagados. O servidor de teste foi encerrado.

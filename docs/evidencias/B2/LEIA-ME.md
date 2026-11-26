# Evidências da B2 · Componentes visuais

Feature B2 (DSG-06, NF-07, NF-08). Catálogo e decisões: `docs/componentes.md`. Ramo rebaseado sobre o `main` em `46a0346` (B4).

| Arquivo ou pasta | O que mostra |
| --- | --- |
| `testar-exigir-completa.txt` | `npm run testar -- --exigir-completa`: 7 de 7 etapas, 698 testes unitários (77 da B2), 109 do servidor, 2 da página web; com o APK gerado depois do último rebase |
| `app-gerar.txt` | `npm run app:gerar` do APK final (depois do rebase sobre a B4) |
| `jornadas-fumaca-apk-final.txt` | `npm run testar:jornadas -- fumaca` com o APK final: tela provisória, galeria e banco cifrado (B4), 3 de 3 |
| `claro/`, `escuro/` | Galeria no `campinguim-a` (1080 × 2340, densidade 440), tema do aparelho claro e escuro (`cmd uimode night yes`) |
| `fonte130/`, `fonte200/` | Letra do sistema em 130 % e 200 % (`settings put system font_scale 1.3` e `2.0`) |
| `tela5/`, `tela67/` | Tela pequena de 5 polegadas (`wm size 720x1280`, `wm density 320`: 360 dp de largura) e de 6,7 (`wm size 1080x2400`, `wm density 390`) |
| `prototipo/` | Telas do protótipo Rumo (Chromium, 390 × 844, `moldura=0&avaliador=0`), claro e escuro |
| `comparacao.md` e `comparacao/` | Lado a lado protótipo × app de 9 componentes, claro e escuro, com as divergências conscientes |
| `leitor-de-tela.md` | O nome que o TalkBack lê de cada controle tocável da galeria (332, nenhum sem nome) e o tamanho de cada alvo (nenhum abaixo de 44 dp) |

Como as capturas foram feitas: o roteiro `e2e/jornadas/fumaca/galeria.yaml` abre a galeria a frio pelo link `campinguim://galeria`, entra em cada seção e captura duas telas (`-1` e `-2`), mais a legenda aberta e um item marcado. Rodou uma vez em cada condição do sistema, sempre no `emulator-5554`, voltando tema, letra e tela ao padrão no fim. As capturas mostram só o app. As imagens foram reduzidas à metade e gravadas em JPEG de qualidade 90 para não pesar o repositório; as comparações seguem em PNG.

As capturas das seis condições foram feitas com o APK de antes do rebase sobre a B4 (mesmo código da B2; a B4 só acrescenta o provedor do banco por fora do tema). A pasta `claro/` foi refeita com o APK final, e o roteiro passou nele (`jornadas-fumaca-apk-final.txt`).

# Evidências da B2 · Componentes visuais

Feature B2 (DSG-06, NF-07, NF-08). Catálogo e decisões: `docs/componentes.md`. Relatórios do QA: `docs/qa/B2-rodada-*.md`.

**Rodada 2 (depois da reprovação da rodada 1).** Ramo `feature/B2-componentes-visuais` sobre o `main` em `46a0346` (B4). Todo o código do app que aparece aqui é o da ponta **`44056f4`**: o APK de todas as pastas foi gerado dela (`npm run app:gerar`, `app-gerar.txt`) e instalado uma vez antes das capturas. Os commits depois de `44056f4` só mudam `docs/`.

| Arquivo ou pasta | O que mostra | APK e ponta | Rodada do roteiro (`test-results/jornadas/`, fora do git) |
| --- | --- | --- | --- |
| `testar-exigir-completa.txt` | `npm run testar -- --exigir-completa`: 7 de 7 etapas; unitários 703/703 (82 da B2), servidor 109/109, web 2/2 | APK de `44056f4` | — |
| `app-gerar.txt` | `npm run app:gerar` | ponta `44056f4` | — |
| `jornadas.txt` | `npm run testar:jornadas -- fumaca` em cada condição: tela provisória, galeria e banco cifrado (B4), 3 de 3 nas sete | APK de `44056f4` | as sete abaixo |
| `claro/` | Galeria no `campinguim-a` (1080 × 2340, densidade 440), tema claro, letra 100 % | APK de `44056f4` | `2026-11-27T00-49-26-319Z` |
| `escuro/` | Tema escuro do aparelho (`cmd uimode night yes`) | APK de `44056f4` | `2026-11-27T00-54-48-276Z` |
| `fonte130/` | Letra do sistema em 130 % (`settings put system font_scale 1.3`) | APK de `44056f4` | `2026-11-27T00-58-40-292Z` |
| `fonte200/` | Letra do sistema em 200 % (`font_scale 2.0`) | APK de `44056f4` | `2026-11-27T01-02-37-150Z` |
| `tela5/` | Tela de 5 polegadas (`wm size 720x1280`, `wm density 320`: 360 dp de largura), letra 100 % | APK de `44056f4` | `2026-11-27T01-06-58-840Z` |
| `tela5-fonte200/` | Tela de 5 polegadas com a letra em 200 % (a combinação mais apertada) | APK de `44056f4` | `2026-11-27T01-10-41-292Z` |
| `tela67/` | Tela de 6,7 polegadas (`wm size 1080x2400`, `wm density 390`) | APK de `44056f4` | `2026-11-27T01-15-47-994Z` |
| `prototipo/` | Telas do protótipo Rumo (Chromium, 390 × 844, `moldura=0&avaliador=0`), claro e escuro | protótipo em `design/prototipos/rumo/` (sem mudança) | — |
| `comparacao.md` e `comparacao/` | Lado a lado protótipo × app (de `claro/` e `escuro/`) de 9 componentes, com as divergências conscientes | APK de `44056f4` | as de `claro/` e `escuro/` |
| `leitor-de-tela.md` | O nome que o TalkBack lê de cada controle tocável da galeria (319, nenhum sem nome) e o tamanho de cada alvo (nenhum abaixo de 44 dp) | APK de `44056f4` | leitura feita à parte, com `uiautomator dump` |
| `conferencia-200.md` | Cada seção conferida em 200 % na tela padrão e na de 5 polegadas | APK de `44056f4` | `fonte200/` e `tela5-fonte200/` |

Como as capturas foram feitas: o roteiro `e2e/jornadas/fumaca/galeria.yaml` abre a galeria a frio pelo link `campinguim://galeria`, entra em cada seção e captura duas telas (`-1` e `-2`), mais a legenda aberta e um item marcado. Rodou uma vez em cada condição, sempre no `emulator-5554`, voltando tema, letra e tela ao padrão no fim (`night no`, `font_scale 1.0`, `wm size reset`, `wm density reset`). As capturas mostram só o app. As imagens foram reduzidas à metade e gravadas em JPEG de qualidade 90; as comparações ficam em PNG. Nenhuma captura mostra conteúdo sob a barra de status.

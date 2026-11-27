# Mascote no app

Cópias byte a byte do pacote final do mascote (opção 03, Filhote de gorro; MSC-08), pasta `design/mascote/final/vetor/claro/`. Nada foi redesenhado: um teste do tema (`apps/mobile/src/tema/mascote.test.ts`) confere que cada arquivo daqui é igual ao do pacote final e que o app desenha exatamente estes bytes.

Só entram as artes que o Rumo usa (decisão provisória do orquestrador sobre a pergunta 2 do DESIGN.md, seção 14): `principal`, `icone`, `pose-alerta`, `pose-camping` e `pose-comemorando`. O 3D não entra no app nesta fase (pergunta 4).

Só a versão clara entra. No tema escuro, o app põe a arte colorida sobre o papel de canto cortado na cor `texto` (DESIGN.md, seção 8), como o protótipo faz; a versão de contorno creme do pacote (`vetor/escuro/`) não é usada no app.

| Arquivo | SHA-256 (início) |
| --- | --- |
| `principal.svg` | `247c31dae26f55df` |
| `icone.svg` | `744a11d799cef8cf` |
| `pose-alerta.svg` | `b9fb6e070fb2690a` |
| `pose-camping.svg` | `d1da492fbc9b828a` |
| `pose-comemorando.svg` | `78e430659c160db2` |

O componente lê as artes de `src/componentes/mascote/artes.ts`, gerado destes arquivos por `node apps/mobile/src/tema/gerar.mjs`.

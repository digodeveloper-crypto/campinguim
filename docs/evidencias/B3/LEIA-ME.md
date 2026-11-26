# Evidências da B3 (motor de regras e catálogo)

Saídas dos comandos rodados no worktree da B3 em 26/11/2026, com Node 24.19.0, sem cor (códigos de terminal removidos).

| Arquivo | Comando | Resultado |
| --- | --- | --- |
| `unitarios-core-por-caso.txt` | `npx vitest run --project core --reporter=verbose` | 298 de 298 testes do motor passaram, um por linha, com o código do caso (C1, L1, A1, F1, D1...) no título |
| `cobertura.txt` | `npm run cobertura --workspace packages/core` | Linhas 99,75 %, comandos 98,53 %, ramos 96,16 %, funções 100 % (mínimo exigido: 90 % de linhas) |
| `unitarios.txt` | `npm run unitarios` | 379 passaram, 7 falharam, 3 pulados. As 7 falhas são todas do projeto `servidor` (`supabase/testes/`), que precisa do ambiente Docker no ar; os 3 pulados são o manifesto do APK (J9). Nenhuma falha no `core` nem no `scripts` |
| `testar-exigir-completa.txt` | `npm run testar -- --exigir-completa` | Saída 1. Segredos, endereços, tipos, lint e página web passaram. Unitários: 1 falha fora da B3 (abaixo). Servidor: sem `.env.local`, porque o cartão da B3 proíbe Docker |
| `testar-exigir-completa-versao-yml-lf.txt` | O mesmo, depois de repor `.github/workflows/versao.yml` no worktree com o fim de linha do repositório (LF) | Saída 1 só pelo servidor (sem Docker). Unitários: PULADO, 378 de 381 passaram; os 3 pulados são o manifesto do APK (J9), "APK ausente" |

**Falha fora da B3, achada aqui.** `scripts/testes/repositorio.test.ts`, teste "dispara só com etiqueta v*" (GIT-05), lê `.github/workflows/versao.yml` com uma expressão que supõe fim de linha `\n`. Num worktree novo no Windows com `core.autocrlf=true` o arquivo sai com `\r\n` e o teste falha. O conteúdo no git é o mesmo (LF); repondo o arquivo com LF (`rm` e `git -c core.autocrlf=false checkout -- .github/workflows/versao.yml`, sem nenhuma mudança para o git) o teste passa. A B3 não mexe em `scripts/` nem em `.github/`; o conserto (normalizar `\r\n` no teste, ou `*.yml text eol=lf` no `.gitattributes`) fica para quem cuida da B1.

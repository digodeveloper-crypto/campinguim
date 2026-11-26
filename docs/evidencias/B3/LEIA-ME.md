# Evidências da B3 (motor de regras e catálogo)

Saídas dos comandos rodados no worktree da B3 em 26/11/2026, com Node 24.19.0, sem cor (códigos de terminal removidos). Rodada 3: ramo rebaseado sobre o `main` com a B1-FIX (`87d5c1b`), `.github/workflows/versao.yml` renormalizado (`git ls-files --eol` = `i/lf w/lf`), comprimento da extensão de volta (QA, rodada 2) e regra final das sobras (decidida em 26/11/2026).

| Arquivo | Comando | Resultado |
| --- | --- | --- |
| `unitarios-core-por-caso.txt` | `npx vitest run --project core --reporter=verbose` | 307 de 307 testes do motor passaram, um por linha, com o código do caso (C1, L1, A1, F1, D1...) no título |
| `cobertura.txt` | `npm run cobertura --workspace packages/core` | Linhas 99,75 %, comandos 98,54 %, ramos 96,21 %, funções 100 % (mínimo exigido: 90 % de linhas) |
| `unitarios.txt` | `npm run unitarios` | 388 passaram, 7 falharam, 3 pulados. As 7 falhas são todas do projeto `servidor` (`supabase/testes/`), que precisa do ambiente Docker no ar; os 3 pulados são o manifesto do APK (J9). Nenhuma falha no `core` nem no `scripts` |
| `testar-exigir-completa.txt` | `npm run testar -- --exigir-completa` | Saída 1 só pelo servidor (sem `.env.local`: o cartão da B3 proíbe Docker). Segredos, endereços, tipos, lint e página web passaram. Unitários: PULADO, 387 de 390 passaram; os 3 pulados são o manifesto do APK (J9), "APK ausente" |

Observação: numa primeira execução de `npm run unitarios`, com a máquina carregada, o teste `scripts/testes/enderecos.test.ts` ("a árvore do repositório está limpa") passou do limite de 5 s. Na mesma rodada ele passou dentro do `npm run testar` e na segunda execução de `npm run unitarios`, que é a saída guardada aqui.

O teste da esteira (GIT-05), que falhava em worktree novo no Windows na rodada 1, passa desde a B1-FIX.

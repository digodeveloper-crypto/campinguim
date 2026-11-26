# Evidências da B1-FIX

`antes.txt`: `npm run testar -- --sem-servidor` antes da correção; só o teste "esteira do GitHub só em marca de versão > dispara só com etiqueta v*" falha (84 passam, 1 falha, 3 pulados por APK ausente).
`depois.txt`: a mesma suíte depois da correção (`.github/** text eol=lf` no `.gitattributes` e leitura tolerante a `\r?\n` no teste); nada falha (85 passam, 3 pulados por APK ausente; etapa do servidor pulada por `--sem-servidor`).
Conferência do fim de linha: `git ls-files --eol -- .github/workflows/versao.yml` passa de `i/lf w/crlf` para `i/lf w/lf`.

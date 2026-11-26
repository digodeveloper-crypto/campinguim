# Evidências da B6 (arquivo de textos e eventos de medição)

Rodadas em 26/11/2026, no worktree da B6, com o Node 24 do sistema.

| Arquivo | O que mostra |
| --- | --- |
| `testar-exigir-completa.txt` | Saída inteira de `npm run testar -- --exigir-completa` |
| `app-gerar.txt` | Resultado de `npm run app:gerar` (log do Gradle resumido, sem caminhos da máquina) |
| `chaves-faltantes-falha.txt` | O teste de chaves de texto **falhando** com uma chave plantada (`textos.abertura.chavePlantada` num arquivo do app) |
| `chaves-faltantes-passa.txt` | O mesmo teste **passando** depois de tirar a chave plantada |

A lista de textos pendentes de conteúdo está em `docs/textos-e-eventos.md`, seção 8 (55 chaves do app e 6 da página).

## Resultado da suíte completa

| Etapa | Resultado |
| --- | --- |
| Trava de segredos | passou |
| Endereços só no arquivo de configuração | passou |
| Tipos (5 de 5 projetos) | passou |
| Lint, sem aviso | passou |
| Testes unitários (regras puras, textos, medição e travas) | passou, 255 de 255 (172 do projeto `core`, com os 133 de `packages/core` e os 39 de `apps/*/src`) |
| Página web (Chromium e WebKit) | passou, 2 de 2 |
| Testes do servidor | **FALHOU, 7 de 8**: ver abaixo |

A suíte não pulou nenhuma etapa (o teste do manifesto, J9, rodou contra o APK gerado nesta rodada).

### A única falha: não vem da B6

`supabase/testes/ambiente.test.ts > o banco tem todas as migrações do repositório, na ordem` espera a migração da B1 e acha mais cinco (`20261126190000` a `20261126190400`). O banco do Docker é um só na máquina (mesmas portas e mesmo banco para todos os worktrees), e a **B5** já aplicou as migrações dela nele. A B6 não toca em `supabase/`. O teste volta a passar quando a B5 entrar no `main` e o banco for recriado (`npm run ambiente:zerar`), o que a B6 não faz por não ser dona do banco compartilhado. Os outros 7 testes do servidor passaram.

### Dois contornos locais, sem mudança no repositório

- `.env.local` copiado do worktree da B5 (arquivo ignorado pelo git; só tem as chaves do ambiente local; o conteúdo nunca foi lido nem impresso).
- `.github/workflows/versao.yml` está no repositório com fim de linha LF, mas a máquina usa `core.autocrlf=true`, que o transforma em CRLF ao baixar; o teste `repositorio.test.ts > dispara só com etiqueta v*` lê o arquivo com `\n` e falha com CRLF. Na rodada, o arquivo do worktree foi convertido para LF só no disco (o repositório não mudou). **Para o orquestrador:** o mesmo teste falha em qualquer checkout novo nesta máquina; a correção definitiva (um `.gitattributes` com `eol=lf` para `.github/`, ou o teste aceitar `\r?\n`) é de `scripts/` e da B1, fora da B6.
- Uma execução anterior da mesma suíte falhou em `enderecos.test.ts > a árvore do repositório está limpa` por tempo esgotado (5 s) com a máquina cheia (outros agentes gerando o app ao mesmo tempo); o mesmo teste passa sozinho em 3 s e passou na rodada registrada aqui.

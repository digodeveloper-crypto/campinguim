# B1-FIX · fim de linha do teste da esteira · rodada 1 · APROVADO

Data: 2026-11-26 · Entregue por: pane-706 · Conferido por: QA (pane-689)
Base: defeito da B1 apontado pelo QA na revisão da B6 (h-16i); decisão do piloto (sem exceção para o teste, revisão no clone novo com `--sem-servidor`); GIT-05, GIT-10.
Alvo: worktree `C:\campinguim-wt\B1-fix`, ramo `feature/B1-fix-crlf`, ponta `fe55b0a`, sobre o main `9138aa1`. 1 commit, só local; autor e quem gravou: noreply do GitHub.

**Resumo:** o teste da esteira falhava em todo checkout novo neste computador (`core.autocrlf=true`), porque o `versao.yml` virava CRLF e a regex exigia `\n`. A correção fixa `.github/**` em LF no `.gitattributes` e torna a regex tolerante a `\r?\n`. O QA provou o antes e o depois num clone novo de verdade.

## Suíte local (GIT-10)

| Execução | Comando | Resultado |
| --- | --- | --- |
| Clone novo do ramo (`git -c core.autocrlf=true clone --no-local`, `npm ci`, Node 24.19.0) | `npm run testar -- --sem-servidor` | **exit 0, nenhuma falha.** Segredos, endereços, tipos (5 de 5), lint e web (2 de 2): passou. Unitários: 85 de 88, com 3 PULADOS, que são só o manifesto do APK (o clone não tem app gerado; a B1-FIX não toca `apps/mobile`). Servidor: PULADO |

**Etapa do servidor pulada por decisão do piloto:** a B1-FIX não muda nada de servidor (o diff não toca `supabase/`). A vez do Docker fica para as features com servidor.

## Aceite

| Critério | Resultado do QA |
| --- | --- |
| Diff mínimo | ok. Mudam 7 arquivos: `.gitattributes` (+`.github/** text eol=lf`, com comentário), a regex de `scripts/testes/repositorio.test.ts` (1 linha), `docs/MUDANCAS.md` (+1 linha), `docs/desenvolvimento.md` (+1 parágrafo, com a regra para testes novos) e as evidências antes/depois. Nada mais |
| Clone novo sai LF | ok. No clone novo do ramo, `git ls-files --eol` mostra `i/lf w/lf attr/text eol=lf` para o `versao.yml`. Controle: num clone novo do main, o arquivo sai CRLF |
| Antes e depois no mesmo clone | ok. **Rodado pelo QA**, projeto `scripts`. Com o `.gitattributes`, o teste e o `versao.yml` do main (CRLF): **1 falha** ("dispara só com etiqueta v*"), 79 passam e 3 são pulados. Com os da correção (LF): **80 passam**, 0 falhas e 3 pulados |
| Checkouts que já existem | ok. Um checkout do main atualizado por fast-forward até `fe55b0a` continua com o arquivo CRLF no disco (o blob não mudou), sem "modificado" no `git status`. O teste passa, porque a regex tolera. B2 a B6 passam depois do rebase, sem renormalizar |
| O teste ainda pega erro | ok. Defeitos plantados no worktree: CRLF forçado no disco dá 25 de 25 (tolerante); gatilho `pull_request:` plantado falha em LF e em CRLF; `branches: [main]` plantado falha. Tudo desfeito, com `git status` limpo |
| Checagem G | ok. 0 chave, JWT, usuário do Windows, caminho de máquina ou e-mail pessoal no diff e na mensagem. Evidências sem códigos de cor |

## Observações (não reprovam; para o piloto)

1. A primeira rodada das features que voltarem depois do rebase já pode exigir o teste da esteira passando, sem exceção.
2. A regra nova em `docs/desenvolvimento.md` (testes que leem texto usam `\r?\n`, ou o arquivo vai para o `.gitattributes`) passa a valer na revisão do QA para todo teste novo que leia arquivo.

## Limpeza

O clone de conferência, com o `npm ci`, ficou só na pasta temporária do sistema e foi apagado. O Docker e o emulador não foram usados. O worktree da B1-FIX não mudou, só ganhou este relatório.

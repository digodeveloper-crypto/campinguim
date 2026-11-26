# F0-5 · verificação do aparelho, parte local · rodada 1 · APROVADO

Data: 2026-11-24 · Entregue por: pane-662 · Conferido por: QA (pane-646)
Base: `docs/prova-tecnica/plano.md`, D, F0-5 (testes exigidos, aceite e evidência); SPEC, seções 2, 8 e 11 ("Verificação do aparelho"); `CLAUDE.md`.
Alvo: worktree `C:\campinguim-wt\F0-5`, ramo `feature/F0-5-verificacao`, commit `01fa6de` (sobre `fb54ca9`), 26 arquivos. Só local.

## Aceite do plano

| Critério | Resultado do QA |
| --- | --- |
| Todos os testes exigidos passam | ok. **Rodados pelo QA:** unidade e app, 54 de 54, sem pilha; **suíte inteira, 89 de 89**, com a pilha isolada `campinguim-f0-5` (inclui os 19 da F0-1). Cada item da lista do plano tem teste: sem prova; prova inválida ou de outro app; `UNRECOGNIZED_VERSION`, `UNEVALUATED`, `UNLICENSED`, aparelho vazio, pacote diferente, resumo do pedido diferente, token repetido; veredito bom **de exemplo** aceito; prova de desenvolvimento desligada → recusa; ligada só no local → aceita; marca do aparelho vencida → recusa; configuração de produção com desenvolvimento e dublê desligados |
| Os testes pegam regra quebrada | ok. **Mutações feitas pelo QA, uma de cada vez, desfeitas com `git checkout`:** (M1) aceitar `MEETS_BASIC_INTEGRITY` → 2 falhas; (M2) aceitar prova de desenvolvimento sem `AMBIENTE=local` → 2 falhas; (M3) tirar a proteção contra repetição → 1 falha; (M4) não conferir o `requestHash` → 3 falhas. O original volta a 51 de 51 e o worktree fica limpo |
| O app no emulador recebe `integrity_required` e mostra mensagem | ok. A captura mostra a tela "Verificação do aparelho", a prova "de desenvolvimento (falsa, só para teste local)", a mensagem "Este aparelho não passou na verificação…" e "Código: integrity_required". **Chamada HTTP direta do QA à função:** sem prova, desenvolvimento qualquer, token da Play inválido e dublê forjado dão **403** com `{"code":"integrity_required","message":"Verificação do aparelho necessária."}`, todos iguais. O registro interno guarda motivos diferentes: `sem_prova`, `prova_desenvolvimento_desligada`, `token_invalido`, `assinatura_invalida` |
| O resto do app não importa a biblioteca direto | ok. Só `src/verificacao/expo.ts` importa `@expo/app-integrity`, e só `src/verificacao/index.ts` carrega `./expo`. `chamadaProtegida.ts` usa só a interface (`../verificacao`). Busca repetida pelo QA |

## Segurança

- **Falha fechado:** sem `AMBIENTE=local`, a prova de desenvolvimento e o dublê ficam desligados, mesmo com as chaves ligadas por engano (teste e mutação M2). Sem pacote ou certificado configurados, toda prova da Play é recusada. O decodificador do Google recusa tudo até a F0-6.
- **Veredito:** confere primeiro o pedido (pacote, `requestHash` ligado à função, instalação, pedido e dados; idade de 5 min). Depois exige `PLAY_RECOGNIZED`, o nosso pacote, **todos** os certificados do token entre os aceitos, `LICENSED` e `MEETS_DEVICE_INTEGRITY` ou `MEETS_STRONG_INTEGRITY` (`BASIC` e `VIRTUAL` não bastam, por DEF-04). Cada token vale uma vez: o resumo dele é gravado antes de o token ser aberto.
- **Migração `20261124210000_f0_5_verificacao.sql`:** `device`, `integrity_token_used` e `integrity_attempt` com RLS na mesma migração, 0 políticas, `revoke` de `anon` e `authenticated`. Guarda só o resumo SHA-256 do token. O QA conferiu: `anon` lendo `integrity_attempt` recebe `42501`.
- **Segredos:** o segredo do dublê é aleatório, gerado pelo script em `functions/.env` (ignorado pelo git); nos testes de unidade há só um valor de teste. O modelo de produção não tem segredo, e a chave da conta de serviço vai para o cofre. Checagem de G no commit: usuário do Windows, caminho, nome real, e-mail pessoal e `run.app`: 0. Autor e quem gravou: noreply.
- **Pilha isolada:** sobe nas portas +1000 sem tocar no `config.jsonc` versionado. O `derrubar` (rodado pelo QA) deixa 0 contêineres e 0 volumes e apaga a pasta temporária e o `.env.local`. A pilha da F0-2 (portas padrão) seguiu rodando sem interferência.

## Observações (não reprovam; para o orquestrador e para a B1)

1. **A "marca de aparelho verificado" funciona como senha do portador.** Na prova, a função não exige login (`verify_jwt=false`), e a marca fica presa só ao `install_id`, que o próprio app manda em todo pedido. Quem souber o `install_id` de um aparelho verificado chama sem prova por 24 h. A entrega registra isso ("install_id por sessão, não ligado a conta"). A SPEC (§11) diz "marca o aparelho como verificado por tempo limitado", e em produção `trip_set_camping` e `submit_fact_reports` exigem login. **Na B1, ligar a marca ao login (`profile_id` + `install_id`) e não copiar esta função como está.** Vale registrar como ponto J no `resultado.md`.
2. **As premissas de tempo** (token com 5 min, tolerância de 1 min no futuro, marca de 24 h) são da prova. A SPEC diz só "tempo limitado", e a decisão é do responsável. Elas estão marcadas como PREMISSAS no código e no LEIA-ME.
3. **O aviso `MODULE_TYPELESS_PACKAGE_JSON`** do Node sobre o `package.json` do app é do orquestrador, dono desse arquivo.
4. **O item 4 continua PENDENTE (F0-6).** A F0-5 prova a lógica de recusa e o isolamento da biblioteca, não um token real do Google. O controle positivo ("aceita") existe só com o dublê e a prova de desenvolvimento, e a entrega diz isso com todas as letras.

# F0-1 · base da prova · rodada 1 · APROVADO

Data: 2026-11-24 · Entregue por: pane-657 · Conferido por: QA (pane-646)
Base: `docs/prova-tecnica/plano.md`, D, F0-1 (aceite e evidência), G (segurança); `CLAUDE.md`.
Alvo: ramo local `feature/F0-1-base`, com os commits `59c051c` (no ramo da prova), `2a4e952` e `fb54ca9`. Nada foi enviado.

O QA subiu tudo com o script único, rodou os testes, consultou a API sozinho, abriu o app nos dois emuladores e derrubou tudo no fim.

## Aceite do plano

| Critério | Resultado do QA |
| --- | --- |
| `supabase start` sobe sem erro | ok. `prova.mjs subir`: exit 0, 7 contêineres (Supabase e PowerSync `healthy`), 2 emuladores prontos, usuários e viagens semeados |
| Teste de RLS passa | ok. `npm run testar`: **19 de 19**, exit 0 |
| …e falha de propósito numa tabela sem RLS | ok. Com `PROVA_RLS_FALHA_DE_PROPOSITO=1`: exit 1, "tabelas sem RLS: public.tabela_sem_rls_de_proposito". A tabela é criada numa transação desfeita, então o banco não muda |
| App abre nos dois emuladores | ok. `am start -W` com `Status: ok` (992 ms e 575 ms). A tela inicial mostra o banco do aparelho pronto (PowerSync 0.5.4), o servidor `10.0.2.2:54321` e "sem login: nada sincroniza". O link `campinguim://viagem/teste-qa` abre a tela "Viagem" com o identificador e a mensagem "O link não traz uma viagem válida." |
| A não lê nada da viagem de C pela API | ok. **Conferência independente do QA**, por HTTP direto: A vê só "Viagem de grupo A e B" (3 itens, 2 membros, 0 linhas de outras viagens); A pedindo os itens da viagem de C pelo id recebe 0; C pedindo os da viagem AB recebe 0; sem login, `42501` (sem permissão) |
| Evidência: `supabase status` sem chaves | ok. DB_URL, PUBLISHABLE_KEY, SECRET_KEY, JWT_SECRET, ANON_KEY e SERVICE_ROLE_KEY mascarados com `***` |
| Evidência: nenhum segredo rastreado | ok. O teste "nenhum arquivo de credencial local está rastreado" passa; `prova/.env.local` é ignorado pelo `.gitignore` (`.env.*`); nenhum `.env`, `.jks`, `.keystore`, `.pem` ou `.key` nos commits |

## Segurança (`CLAUDE.md` e plano, G)

| Regra | Resultado |
| --- | --- |
| RLS na mesma migração | ok. `20261124200000_f0_base.sql` cria `trip`, `trip_member` e `trip_item` e liga o RLS logo depois de cada `create table`. As políticas são por membro (organizador para os dados da viagem e os membros), sem DELETE (exclusão lógica), sem nada para `anon` (`revoke all`). As funções de apoio são `security definer` com `search_path = ''`, num esquema não exposto. A publicação `powersync` é criada pela migração |
| Segredos fora do git | ok. As senhas de teste são geradas ao acaso pelo script, só em `prova/.env.local` (ignorado). A configuração do PowerSync lê a conexão de variável de ambiente. **APK varrido pelo QA:** chave de serviço 0, senhas de teste 0, URL do banco 0, `.map` 0; só a chave pública (1) |
| `run.app` | ok. 0 nos arquivos da prova e 0 no APK. Há teste automático para isso |
| Endereço único | ok. `prova/config/enderecos.json`, com testes que falham se o endereço do servidor ou do site aparecer em outro arquivo |
| Sem localização | ok. O manifesto compilado não tem `ACCESS_FINE_LOCATION` nem `ACCESS_COARSE_LOCATION`, nem `USE_EXACT_ALARM` (teste automático e lista do `aapt2`) |
| Textos em pt-BR no arquivo de textos | ok. `src/textos.ts`. Nenhum texto de interface solto nas telas (busca nos `.tsx`) |
| Checagem de G nos 3 commits | ok. Autor e quem gravou só com o noreply. 0 e-mail pessoal, 0 nome real, 0 usuário do Windows, 0 nome do computador. Os resultados de "AppData" e "C:\Users" são só `%LOCALAPPDATA%` e os textos dos relatórios que descrevem as buscas. 0 padrões de segredo (só o prefixo `sb_secret_` citado em texto na evidência) |
| Script único sobe e derruba | ok. `derrubar`: exit 0; depois de 25 s, 0 contêineres, 0 `qemu`, 0 `emulator.exe`, adb parado |

Memória livre com tudo ligado, medida pelo QA: **7.982 MB**. A entrega registrou leituras de 5,6 e 3,7 GB com a missão de vídeos rodando junto.

## Observações (não reprovam; para o orquestrador)

1. **Permissões que o modelo do Expo e as bibliotecas trazem.** `SYSTEM_ALERT_WINDOW`, `READ/WRITE_EXTERNAL_STORAGE` (maxSdk 32), `com.google.android.c2dm.permission.RECEIVE`, a do install referrer e 14 permissões de selo de ícone de fabricantes. Nenhuma é de localização. O app não precisa delas, e o PRD pede o mínimo de dados (seção 11). O orquestrador decide se a F0-1 tira agora (só `package.json` e `app.config.ts` mudam, e os dois são dele) ou se fica para a B1.
2. **Arquivos apagados fora da pasta da tarefa.** A entrega apagou as cópias não rastreadas de `design/marca/qa/` e `design/marca/perfil/` e descartou 3 mudanças locais em `design/marca/` antes do checkout. Não houve perda: eram idênticas ao `main`, e o QA conferiu que os dois relatórios do DSG-07 no disco são iguais aos do `main`. Mas a regra 1 do `CLAUDE.md` é mexer só nas pastas da tarefa. Num caso assim, o certo é avisar e pedir ao dono.
3. **JWT_SECRET no terminal:** é o valor padrão público do Supabase local, igual em toda instalação, e não foi para nenhum arquivo. Nas próximas tarefas, o `supabase start` deve rodar com a saída filtrada, como o script já faz.
**Decisões do piloto (24/11/2026):** a observação 1 fica para a B1, registrada como ponto J no `resultado.md` da F0-7. Na observação 2, a remoção estava no cartão da F0-1, pedida pelo piloto para permitir o checkout, então não houve desvio do agente. A observação 4 é tratada no começo da F0-2.

4. **Maestro instável no emulador A** (4 de 6, "device offline" na primeira execução de cada série). Não é critério da F0-1, mas a F0-2 exige no máximo 10 % de execuções refeitas. Vale tratar no começo da F0-2.
5. **Pendências registradas, sem relação com o aceite:** banco local não cifrado (DEF-11, a F0-2 só registra); nome do pacote provisório `com.campinguim.prova` (H6 aberta); `docs/infra.md` com a seção da Cloudflare ainda não commitada (é de outra tarefa, INF-01).

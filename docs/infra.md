# Infraestrutura do Campinguim

Registro dos serviços externos configurados pelos agentes. Sem senha, token, chave nem e-mail pessoal.

## GitHub

- **Data:** 24/11/2026 (tarefa F0-G, autorizada pelo responsável no gate H4c).
- **Conta:** `digodeveloper-crypto` (plano Free).
- **Repositório:** https://github.com/digodeveloper-crypto/campinguim
- **Visibilidade:** pública. Sem licença (todos os direitos reservados, decisão D5/H4b). Wiki desligada.
- **Ramos no GitHub:** só `main` (6 commits, de `000fdbc` a `33ba082`). Os ramos `feature/MSC-01-opcoes-de-mascote`, `reserva/main-antigo` e `reserva/design-antigo` existem só na máquina e nunca são enviados.
- **Etiquetas:** nenhuma. **Workflows (Actions):** nenhum (GIT-05: só em etiqueta `v*`, entra na B1).

### O que foi configurado

| Item | Valor |
| --- | --- |
| E-mail privado na conta (Settings › Emails) | "Keep my email addresses private" ligado; "Block command line pushes that expose my email" ligado (H4a). Commits feitos pelo site usam o e-mail `…@users.noreply.github.com` |
| E-mail dos commits deste repositório | `user.email` e `user.name` só no `.git/config` local: e-mail `…@users.noreply.github.com` e o nome da conta. A configuração global do git não foi mexida |
| Proteção do `main` (regra de proteção de ramo, não ruleset) | pull request obrigatório; 0 aprovações exigidas; vale também para administrador (sem push direto de ninguém); force push bloqueado; exclusão do ramo bloqueada |
| Forma de integração | só squash (merge commit e rebase desligados); ramo apagado depois da integração |

Como funciona daqui em diante: cada feature aprovada entra por pull request com o ID no título, integrado em squash (PROPOSTA 2 de `docs/prova-tecnica/plano.md`, seção F).

**Estado acima conferido em 24/11/2026** (tarefa F0-G, aprovada pelo QA). Depois disso nada foi enviado ao GitHub: o trabalho da prova técnica (F0-1 a F0-5) está em ramos locais `feature/F0-*` e entra no `main` por um único pull request em squash, com o commit `F0: prova técnica`. Os ramos locais nunca são enviados commit a commit, porque o histórico local da F0-3 guarda um vídeo e imagens antigas com ícones de terceiros. Antes de cada envio vale a checagem de segurança da seção G do plano (autores dos commits novos, padrões de segredo e caminhos locais nos arquivos alterados). A junção dos ramos está registrada em `docs/prova-tecnica/resultado.md`, seção "Junção dos trabalhos".

**Envio da prova técnica (26/11/2026, tarefa F0-ENVIO, aprovada pelo QA):** commit `4b08f5a` "F0: prova técnica" no `main`, integrado por squash pelo pedido de integração https://github.com/digodeveloper-crypto/campinguim/pull/1. O ramo do envio foi apagado no GitHub depois da integração; o `main` segue sendo o único ramo lá.

### Como conferir

```bash
R=repos/digodeveloper-crypto/campinguim

# visibilidade e endereço
gh repo view digodeveloper-crypto/campinguim --json visibility,url --jq '.'

# só o main no GitHub
gh api $R/branches --jq '[.[].name]'          # ["main"]
git ls-remote origin                           # HEAD e refs/heads/main

# 6 commits, autor e quem gravou com e-mail noreply
gh api $R/commits --jq 'length'                # 6
gh api $R/commits --jq '.[] | .commit.author.email + "|" + .commit.committer.email' | sort -u
                                               # 1 linha, ambos terminando em @users.noreply.github.com

# proteção do main
gh api $R/branches/main/protection --jq '{pr:(.required_pull_request_reviews!=null), aprovacoes:.required_pull_request_reviews.required_approving_review_count, admin:.enforce_admins.enabled, force_push:.allow_force_pushes.enabled, exclusao:.allow_deletions.enabled}'
                                               # pr=true, aprovacoes=0, admin=true, force_push=false, exclusao=false

# só squash
gh api $R --jq '{squash:.allow_squash_merge, merge:.allow_merge_commit, rebase:.allow_rebase_merge, apaga_ramo:.delete_branch_on_merge}'
                                               # squash=true, merge=false, rebase=false, apaga_ramo=true

# sem workflows nem etiquetas
gh api $R/actions/workflows --jq '.total_count'   # 0
gh api $R/tags --jq 'length'                      # 0
```

O e-mail privado da conta (H4a) não tem API com o token atual do `gh`: confere-se em github.com/settings/emails, onde as duas opções aparecem como "On".

## Cloudflare

- **Data:** 24/11/2026 (tarefa INF-01). **Situação: concluída, sem pendência.** O responsável entrou na conta no Chrome do conector; o agente não digitou senha nem código.
- **Endereço provisório reservado:** https://campinguim.pages.dev (projeto Pages `campinguim`, envio direto, uma página em branco; HTTP 200 conferido).
- **Escopo pedido pelo responsável:** "Só preparar a conta" (não registrar domínio, não comprar, não criar zona de DNS, não contratar plano) e, depois, "vamos por no cloudflare provisoriamente dominio gratis deles".

### Divergência com a SPEC (decisão do responsável, 24/11/2026)

- **O que a SPEC (seção 14) previa:** site/página do convidado no endereço provisório `run.app` do Cloud Run, até o domínio próprio na 1.0.0.
- **O que muda:** só o endereço provisório do site, que passa a ser o endereço gratuito da Cloudflare (`*.pages.dev` ou `*.workers.dev`). O servidor de dados continua como na SPEC. A SPEC não foi alterada.
- **PROPOSTA ao orquestrador (não decidida):** pela regra do CLAUDE.md, esse endereço entra no código em UM único valor de configuração, e o teste "`run.app` não aparece em lugar nenhum" passa a valer também para `pages.dev` e `workers.dev`.

### O que é gratuito (documentação oficial, lida em 24/11/2026)

Fontes: `developers.cloudflare.com/pages/platform/limits/`, `…/pages/functions/pricing/`, `…/pages/get-started/direct-upload/`, `…/workers/platform/limits/`, `…/workers/platform/pricing/`, `…/workers/configuration/routing/workers-dev/`.

| Tema | Plano Free |
| --- | --- |
| Pedidos a arquivos estáticos (Pages) | grátis e ilimitados, nos planos grátis e pago |
| Pedidos que rodam código (Pages Functions / Workers) | 100.000 por dia (zera à meia-noite UTC); passou disso, erro 1027 |
| Builds do Pages (ligado a Git) | 500 por mês, 1 por vez, 20 min cada. Não valem para envio direto |
| Arquivos por site / tamanho de cada arquivo | 20.000 arquivos / 25 MiB cada. Envio pelo painel (arrastar): 1.000 arquivos |
| Projetos Pages por conta | 100 (nas primeiras 48 h da conta há limite extra de criação de projetos, contra abuso) |
| Workers por conta | 100 |
| Domínios próprios por projeto Pages (Free) | 100 |
| Custo do subdomínio `*.pages.dev` / `*.workers.dev` | a documentação não cita cobrança; o `workers.dev` é tratado como "site Free" para projeto pessoal ou hobby, "não crítico para o negócio" |
| Cartão | a documentação consultada não pede cartão para o plano Free (padrão da conta); só o plano Workers Paid custa (mínimo US$ 5/mês). Conferido na criação do projeto (24/11/2026): o painel não pediu cartão |

Observações da documentação que afetam o Campinguim:

1. **Envio direto não vira GitHub depois.** "Se você escolher Direct Upload, não pode trocar para integração com Git depois"; seria preciso criar outro projeto. Reservar o nome por envio direto, como pedido, vai exigir recriar o projeto quando o site for ligado ao repositório. Alerta ao orquestrador; ver "Decisão do orquestrador sobre a reserva" abaixo.
2. **Formato do endereço.** Pages: `<nome-do-projeto>.pages.dev` (se o nome já existir, a Cloudflare acrescenta caracteres aleatórios). Workers: `<nome-do-worker>.<subdomínio-da-conta>.workers.dev`; para ser `campinguim.workers.dev` o subdomínio da CONTA teria de ser `campinguim`.
3. **workers.dev** passa por verificação anti-robô (Browser Integrity Check) que não dá para desligar; clientes automáticos com identificação genérica recebem erro 1010. Atenção se o app (não o navegador) chamar esse endereço.
4. Os preços podem mudar; esta tabela vale pela data acima.

### Decisão do orquestrador sobre a reserva (24/11/2026)

- **Decidido:** reservar o nome por ENVIO DIRETO (uma página em branco), só para segurar `campinguim.pages.dev`. Não conectar o GitHub: isso daria à Cloudflare permissões sobre a conta do GitHub, e o site ainda não existe.
- **Ressalva:** na etapa 1, se o site for publicado a partir do repositório, o projeto de envio direto terá de ser apagado e recriado com Git (a documentação diz que não há troca entre os dois modos). Apagar o projeto é ação sem volta e exige aval do responsável.
- **Apagar o projeto libera o mesmo nome para a própria conta?** NÃO CONFIRMADO. Fonte oficial lida em 24/11/2026 (`developers.cloudflare.com/pages/platform/known-issues/`): "`*.pages.dev` subdomains currently cannot be changed. If you need to change your `*.pages.dev` subdomain, delete your project and create a new one." Isso não afirma que o nome antigo volta a ficar livre. Há relato de usuários na comunidade da Cloudflare ("Deleted Pages project name cannot be recreated – error 8000000", `community.cloudflare.com/t/933029`) de que o nome de um projeto apagado não pôde ser recriado, e de que a equipe da Cloudflare precisou intervir; é relato, não documentação. Risco para o plano: se o nome não voltar, a reserva por envio direto pode custar o endereço `campinguim.pages.dev` na hora de ligar ao GitHub. Mitigação a considerar pelo orquestrador: decidir antes da etapa 1 se o endereço do site vai ser de envio direto (com publicação por linha de comando/esteira, que não exige conectar o GitHub) ou ligado ao Git; a documentação oficial (Direct Upload) prevê publicar por `wrangler pages deploy` em integração contínua, sem recriar o projeto.

### Verificação em duas etapas (2FA): ativa

**Verificação em duas etapas ATIVA**, ligada pelo próprio responsável, conferida em 24/11/2026 pela leitura do painel (etiqueta "Active"). Atende à SPEC (seção 14, "Configuração dos serviços externos", regra 4), que exige a verificação em duas etapas ativa em todas as contas. A regra cita Supabase, GitHub, Google e, no lançamento, o registrador do domínio, e não cita a Cloudflare pelo nome; por decisão do orquestrador em 24/11/2026, ela vale para a Cloudflare, porque o site provisório fica nela e o domínio poderá ficar.

Pela regra 7 da mesma lista, o QA cobra a evidência da verificação em duas etapas ativa antes de liberar a feature que publicar o site na Cloudflare. A evidência desta conferência é a leitura do painel em 24/11/2026; nenhuma captura de tela foi guardada, porque a tela mostra dados pessoais.

- **Recomendação:** preferir aplicativo autenticador ou chave física.
- **O que é, numa frase:** a conta passa a pedir um código além da senha, e quem descobrir a senha sozinho não entra.
- **Caminho (referência):** dash.cloudflare.com › ícone da pessoa (canto superior direito) › *Profile* (Perfil) › *Authentication* (Autenticação) › bloco *Two-Factor Authentication* › *Mobile App Authentication* › *Set up*; ler o código QR com um aplicativo autenticador (por exemplo, Google Authenticator), digitar o código de 6 dígitos e **guardar os códigos de recuperação** fora do computador. Endereço direto: `dash.cloudflare.com/profile/authentication`.
- **Se o acesso à conta passar por outro serviço:** a verificação em duas etapas desse serviço também vale; conferir as duas.

### Registro da conta

Conferidos em 24/11/2026: o plano é o gratuito (Workers Free), o e-mail da conta é o do responsável (não copiado aqui) e o painel não pediu aceite de termos, cartão nem verificação para criar o projeto abaixo. Nenhum domínio foi registrado e nenhuma zona de DNS foi criada. Nenhum token de API foi criado pelo agente. O registro não lista outros itens da conta (domínios, projetos, chaves, cobrança): este arquivo é público.

### Reserva do nome (feita em 24/11/2026)

- Passos: Workers e Pages › criar › Pages › enviar arquivos (arrastar) › nome `campinguim` (o painel mostrou "será implantado em campinguim.pages.dev", sem sufixo aleatório, ou seja, o nome estava livre) › um único `index.html` em branco (220 bytes: sem texto, sem logo, sem marca; título vazio; `noindex`) › implantar.
- Resultado: projeto `campinguim`, ambiente Production, domínio `campinguim.pages.dev`, uma implantação. Conferido de fora por `curl` com DNS público: HTTP 200 e a página em branco.
- Não foi feito: conexão com GitHub, domínio próprio, Worker com código, token de API, plano pago.
- Nota técnica: o DNS do computador local demorou a enxergar o nome novo (cache de "nome inexistente"); pelo DNS público (dns.google) respondeu na hora. Se o navegador local não abrir, esperar alguns minutos.
- O projeto tem 1 produção; a tela de implantação mostra a ramificação `main` por padrão do envio direto; não é ligação com o repositório.

### PROPOSTA ao orquestrador: o que a Cloudflare pode fazer pelo Campinguim na 1.0.0 (não decidida)

1. **Agora (provisório):** hospedar a página do convidado e o site em `campinguim.pages.dev`, no lugar do `run.app` do Cloud Run (divergência acima). Arquivos estáticos: grátis e sem limite de pedidos.
2. **1.0.0, domínio próprio:** quando o responsável registrar o domínio (hoje a SPEC prevê só na 1.0.0), a Cloudflare pode ser o registro e o DNS dele, e apontar o domínio ou para o projeto Pages ou para a frente do Cloud Run. Isso exige zona de DNS e eventual compra, ambos fora do que foi autorizado agora.
3. **Proteção do site:** com o domínio na Cloudflare, certificado HTTPS, proteção contra ataques de volume e regras de bloqueio ficam disponíveis no plano Free.
4. **Cuidado:** nomear tudo do Campinguim na Cloudflare com o prefixo `campinguim`; qualquer token de API novo só com permissão mínima, criado pelo próprio responsável, e nunca reaproveitando credenciais de outros usos.
5. **Cuidado técnico:** o endereço `pages.dev` passa por verificação anti-robô que não dá para desligar; chamadas do app a esse endereço precisam de identificação própria (ver observação 3 acima). O servidor de dados continua fora da Cloudflare, como na SPEC.

## Prova técnica F0: serviços locais e serviços ainda não criados

- **Data:** 25/11/2026 (tarefa F0-7, primeira vez). Resultado da prova: `docs/prova-tecnica/resultado.md`. Versões e passo a passo da máquina: `docs/prova-tecnica/ambiente.md`.
- **Regra da prova:** tudo roda **local**, em Docker e em emuladores. **Nenhum serviço externo foi criado para a prova**: sem conta, login, token, domínio ou plano pago novos. As credenciais locais (senhas dos usuários de teste, chaves do Supabase local, ligação do PowerSync com o banco) são geradas ao acaso pelo script da prova em `prova/.env.local`, que fica fora do git (`.gitignore`); o app leva só a chave pública do Supabase local.

### O que roda na máquina (não é serviço externo)

| Peça | Versão | Observação |
| --- | --- | --- |
| Supabase local (Postgres, login, API, portão e funções, em Docker) | CLI 3.4.0, Postgres 17 | Subido e derrubado pelo script único `prova/prova.mjs`. Cadastro aberto desligado: os usuários de teste são criados pelo script. Serviços não usados desligados (imgproxy, logflare, vector, studio, realtime, mailpit, postgres-meta, storage-api, supavisor) |
| PowerSync (serviço de sincronização, auto-hospedado) | `journeyapps/powersync-service:1.29.1` | Licença Apache 2.0 desde 03/11/2026. Telemetria desligada. Armazenamento interno em MongoDB 7.0, sem porta aberta no computador |
| Pilha paralela do Supabase da F0-5 | outro `project_id`, portas +1000 | Só para rodar junto da F0-2 sem conflito; apagada no fim de cada uso |
| Emuladores Android | AVDs `campinguim-a` (tela pequena) e `campinguim-b` (tela grande); imagem Android 16 (API 36) "Google APIs" x86_64 | Os AVDs temporários da F0-3 (`campinguim-c`) e da F0-4 (`campinguim-d`) foram apagados, conferido pelo QA. A F0-5 usou a pilha isolada do Supabase, derrubada e conferida pelo QA, e um AVD de captura que a entrega diz ter apagado (não conferido pelo QA) |
| Ferramentas instaladas fora do repositório | Docker Desktop 4.94.0, JDK Temurin 17.0.21.1, ferramentas de linha de comando do Android SDK, Maestro 2.12.1 | Sem login em nenhuma delas. Aceites de licença (SDK e Docker) feitos pelo responsável em 24/11/2026 (H3) |

O endereço do servidor e o do site de teste vêm de um único valor de configuração (`prova/config/enderecos.json`). O site de teste é `campinguim.test`, domínio reservado para teste que não existe nem é publicado. Há teste automático que falha se o endereço do servidor ou do site aparecer em outro arquivo, ou se `run.app` aparecer em qualquer arquivo da prova.

### O que fica pendente (nenhum destes serviços foi criado)

| Serviço | Para quê | Pendência |
| --- | --- | --- |
| Conta de desenvolvedor do Google Play | Faixa de teste interno e Play Integrity (F0-6, item 4 da prova) | Responsável (H11): login, taxa, contrato, identidade e celular físico. Decisão de 24/11/2026: fica para depois |
| Projeto no Google Cloud, Play Integrity e conta de serviço | O servidor conferir a prova do aparelho com o Google | Responsável (H12); possível exigência de faturamento: não confirmado |
| Conta de testador na faixa de teste interno | Instalar a versão pela Play | Responsável (H13) |
| Servidor alcançável pelo celular físico | Controle positivo do item 4 | Decisão (H14, J4); proposta do plano: Cloud Run |
| Supabase hospedado, PowerSync hospedado | Produção | Fora da prova; decisão depois da prova, com os números na mão (SPEC, seção 15) |
| Expo, EAS | Builds | Não usado: o build é local, sem conta Expo (`eas build --local` não funciona no Windows) |
| Domínio próprio | Link `https` verificado (`assetlinks.json`) | Só na 1.0.0; o endereço provisório do site é o da Cloudflare (seção acima) |

### Encerramento

Emuladores e contêineres da prova continuam ligados até a junção dos ramos. O encerramento é do piloto, depois da junção, e a lista de processos sem emulador nem contêiner entra em `docs/prova-tecnica/resultado.md` (SQD-09). `prova.mjs derrubar` roda `adb kill-server` e encerra todo emulador da máquina: usar só com mais nenhuma tarefa com emulador ligado.

## Ambiente local (B1)

- **Data:** 26/11/2026 (feature B1, GIT-11). Passo a passo e comandos: `docs/desenvolvimento.md`.
- **Nenhum serviço externo foi criado na B1.** O ambiente de desenvolvimento e teste roda inteiro na máquina, em Docker, sem conta, login, token ou plano pago novos.

| Peça | Versão | Observação |
| --- | --- | --- |
| Supabase local (Postgres 17, login, API, portão e funções) | CLI 3.4.0 (dependência do projeto, `node_modules`) | `project_id` `campinguim` (contêineres `supabase_*_campinguim`). Cadastro aberto desligado. Mesmos serviços desligados da prova. Configuração: `supabase/config.jsonc` |
| PowerSync auto-hospedado (decisão E1) | `journeyapps/powersync-service:1.29.1`, armazenamento MongoDB 7.0 | Projeto Docker `campinguim-sincronizacao`. Telemetria desligada; MongoDB sem porta no computador. Lê o Postgres pela publicação `powersync` (criada vazia por migração na B1) |

- **Subir, parar, zerar:** `npm run ambiente:subir`, `ambiente:parar`, `ambiente:zerar`, `ambiente:estado`.
- **Portas** (de `config/enderecos.json`, o único valor de configuração de endereço): API 54321, banco 54322, sincronização 8080, página web local 5173.
- **Credenciais locais:** geradas pelo Supabase local e gravadas pelo script em `.env.local` na raiz, fora do git (`.gitignore`: `.env.*`). Modelo sem valores versionado: `.env.local.exemplo`. O script nunca imprime os valores.
- **Convivência com a prova técnica:** a pilha da prova (`campinguim-prova`) usa as mesmas portas. As duas não sobem juntas; o script da base avisa e não derruba nada de outra pilha.
- **Produção:** sem endereço definido. `config/enderecos.json` tem a seção `producao` vazia até o orquestrador decidir o endereço provisório do site (proposta da seção Cloudflare acima) e o servidor hospedado (SPEC, seção 15).
- **Esteira do GitHub:** arquivo `.github/workflows/versao.yml`, disparado só por etiqueta `v*` (GIT-05). Ainda não rodou: nenhuma etiqueta foi criada.

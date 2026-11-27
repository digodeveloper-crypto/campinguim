# Base (B1 a B6) · conferência final do QA · APROVADA para a validação humana

- Data: 2026-11-27. Conferido por: QA (pane-689), a pedido do orquestrador (pane-547), no passo 14 do plano.
- Alvo: `origin/main` em `675bcbe`. O origin só tem o ramo `main`.
- Como: clone novo do GitHub em `C:\campinguim-wt\_base-final` (fora de `C:\campinguim`), feito do zero:
  - `npm install`;
  - `ambiente:subir`, que criou o `.env.local`;
  - `app:gerar` com build nativo do zero;
  - a suíte completa duas vezes e a fumaça.
- O clone foi apagado ao fim.

## 1. Testes no clone novo

| Comando (Node 24.19.0) | Resultado |
| --- | --- |
| `npm install` | exit 0. 794 pacotes; o gancho de pré-commit foi ligado no clone. O `npm audit` aponta **9 moderadas** (ver pendência T1) |
| `npm run ambiente:subir` | exit 0, Supabase local e PowerSync no ar, `.env.local` criado |
| `npm run app:gerar` | exit 0, BUILD SUCCESSFUL em 14 min 28 s (build nativo do zero) |
| `npm run testar -- --exigir-completa` (1ª) | **SUÍTE COMPLETA, 7 de 7**, exit 0 |
| `npm run testar -- --exigir-completa` (2ª) | **7 de 7**, exit 0, os mesmos números |
| `npm run testar:jornadas -- fumaca` (`campinguim-a`, emulator-5554, no padrão: letra 1.0, sem modo escuro, 1080x2340) | **3 de 3**: tela provisória (42 s), galeria (152 s), banco cifrado (23 s) |

Números das duas rodadas da suíte:
- trava de segredos, ok;
- endereços, ok;
- tipos, 5 de 5;
- lint sem aviso;
- unitários **712/712**;
- servidor **109/109**;
- web **2/2**, em Chromium e WebKit;
- manifesto do APK com 3 testes, sem pulo.

## 2. As features da SPEC §14 (Base) no main

| SPEC §14 | Commit no main | Relatório final em `docs/qa/` | Evidências em `docs/evidencias/` | Linha em `MUDANCAS.md` |
| --- | --- | --- | --- | --- |
| B1 · repositório, testes locais, Docker (GIT-10, GIT-11) | `9138aa1` (#3) | `B1-rodada-2.md` APROVADO (a rodada 1 foi reprovada) | `B1/` | sim |
| B1-FIX · fim de linha | `87d5c1b` (#4) | `B1-FIX-rodada-1.md` APROVADO | `B1-fix/` | sim |
| B6 · textos e eventos de medição (NF-09, §12) | `8b97d5f` (#5) | `B6-rodada-1.md` APROVADO | `B6/` | sim |
| B3 · motor de regras e catálogo (§5 e §9) | `23599a7` (#6) | `B3-rodada-3.md` APROVADO (a rodada 2 foi reprovada) | `B3/` | sim |
| B5 · esquema do servidor e autorização (§3 e §11) | `730cdc4` (#7) | `B5-rodada-1.md` APROVADO | `B5/` | sim |
| B4 · banco local cifrado e migrações (§3, DEF-11) | `46a0346` (#8) | `B4-rodada-1.md` APROVADO | `B4/` | sim |
| B2 · componentes visuais (DSG-06, NF-07, NF-08) | `18b4ea1` (#9) | `B2-rodada-2.md` APROVADO (a rodada 1 foi reprovada) | `B2/` | sim |
| B1-FIX-2 · ajustes da esteira | `675bcbe` (#10) | `B1-FIX-2-rodada-1.md` APROVADO | `B1-FIX-2/` | sim |

- `MUDANCAS.md` lista as oito.
- Há um commit squash por feature, com o ID e o número do PR.
- Não existe `B3-rodada-1.md` no main. O relatório da rodada 1 da B3 nunca foi gravado no ramo; as rodadas 2 e 3 estão lá. Não impede nada, fica só registrado.
- Segurança do servidor: as **27** tabelas criadas nas migrações de `supabase/migrations/` ativam o RLS na mesma migração.

## 3. Checagem G na árvore inteira do main

| O que | Resultado |
| --- | --- |
| Segredos (JWT, chaves `sk_`, `AKIA`, `ghp_`, `AIza`, chave privada, `service_role` com valor) | 0. A trava de segredos da suíte também passou |
| Arquivos sensíveis (`.env*`, keystore, `.jks`, `.p12`, `.pem`, google-services) | só `.env.local.exemplo`, com as 6 variáveis **sem valor** |
| E-mail pessoal | 0. Só o exemplo comentado `admin@email.com` do modelo do Supabase, em `supabase/config.jsonc` e na prova |
| Nome real, usuário do Windows, `C:\Users`, `AppData` | 0. Só aparecem `%LOCALAPPDATA%`/`process.env.LOCALAPPDATA`, que são variáveis, e as linhas dos relatórios que descrevem essa mesma checagem |
| `run.app`, `pages.dev`, `workers.dev` fora da configuração | 0 no código (fora de `docs/` e `.md`) |
| Fontes | só OFL, e cada pasta tem a licença ao lado. No app, só a Archivo (12 arquivos); as do protótipo ficam em `design/` |
| Imagens | Em `docs/evidencias/` são só capturas do app e do protótipo, conferidas em cada rodada; nenhuma mostra a tela inicial do emulador. `SOC-01` (perfis do Instagram e do TikTok, da F0) mostra só o recorte do perfil com o pinguim, sem logotipo de terceiros. As artes de `design/` são próprias (mascote, marca e protótipos) |

## 4. Veredito

**APROVADA.** A Base está completa no main, os testes passam num clone novo, e a checagem G está limpa. Pode ir para a validação humana.

## 5. Pendências que a Base deixa

### 5.1 Para o responsável decidir ou fazer

| # | Pendência | Origem | O que destrava |
| --- | --- | --- | --- |
| R1 | **Conta de desenvolvedor do Google Play** (taxa, contrato, identidade). Com ela vem o **nome definitivo do pacote** (D1, hoje `com.campinguim.prova`; deve sair do domínio registrado e ser fixado antes de criar o app na loja) | resultado.md D1 e item 4 | O item 4 da prova (F0-6, verificação do aparelho pela faixa de teste), que hoje está **INCOMPLETO**, e a primeira versão na loja |
| R2 | **Celular Android físico**: P8 (D4) e a F0-6. Até a feature 1.6 (E2) não há celular | B1 obs. 8, resultado.md | Provas que o emulador não dá |
| R3 | **Decisões visuais provisórias da B2**: D-2 (piso de contraste 4,5 em todo texto), D-5 (forma do erro com ícone, texto e ação), D-7 (alvo de 44 dp), gorro fixo `#3EA8AE`, só 5 expressões do mascote, sem 3D no app. Também as decisões da própria feature (`docs/componentes.md` §7.2), por exemplo o texto que diminui quando a palavra não cabe | B2, `componentes.md` §7.1 e 7.2 | Confirmar ou trocar antes das telas de produto |
| R4 | **61 textos `[PENDENTE]`** (55 no app e 6 na página), entre eles os **textos legais (PRV-04)** e o **rótulo do botão de login com Google** | B6 obs. 2 | As telas que usam esses textos e a publicação |
| R5 | **Medição (B6)**: faixas de `amount_band`, canais de `install_attributed`, limites de sanidade, tamanho da fila e códigos em inglês das listas | B6 obs. 1 | Eventos de medição definitivos |
| R6 | **Regra de sobras**: confirmar a regra final (a partir da 2ª viagem seguida com sobra, `teto(qty × 0,75)`; se não muda, `max(1, qty − 1)`; aviso em toda redução). **Atenção:** o `docs/regras.md` diz "Decidido pelo responsável em 26/11/2026" também para a conciliação, mas o relatório B3-rodada-3 registra que a regra final foi decidida pelo orquestrador ao conciliar as decisões 2 e 3. Se o responsável não decidiu essa conciliação, a frase do `regras.md` precisa ser corrigida depois da validação | B3-rodada-3, `regras.md` §6 | Fidelidade do registro de decisões |
| R7 | **D3, tempos da verificação do aparelho**: os três valores da prova são suposições, não decisões | resultado.md D3 | A feature de antifraude e verificação (3.7) |
| R8 | **Decisões do orquestrador que ficaram registradas** e valem até a validação: histórico do item do grupo adiado para a 2.2; valores fechados que a SPEC não dá em código (tipos de chave Pix, `camping.status`, `merge_candidate.status`, opções dos fatos, `occasion`, `trip_kind`), que as features 2.9, 3.1 e 3.2 fecham; pontos 8 a 13 da B3 aceitos como implementados | `servidor.md` §12, `regras.md` | Conferir que o responsável concorda |

### 5.2 Para as features seguintes ou a manutenção (técnicas, já registradas)

| # | Pendência | Origem | Quando |
| --- | --- | --- | --- |
| T0 | **`app.config.ts` grava `ambiente: 'local'` em todo build, inclusive no da esteira de etiqueta.** A 0.1.0 sairia com a galeria, o gancho de verificação do banco e os endereços locais. O ambiente `producao` ainda tem `null` em `enderecos.json` | B1-FIX-2 obs. 1 | **Antes da primeira etiqueta de versão** |
| T1 | `npm audit`: **9 moderadas** (eram 3 na B1). Todas vêm de `minimatch` (negação de serviço em padrão de glob), por `typescript-eslint` e `expo`/`@expo/fingerprint`, ferramentas de build e lint, não do app em execução. `eslint@9.39.5` aparece como descontinuado | `npm install` no clone | Rodada de manutenção de dependências |
| T2 | `undone_adjustment_ids` fora do `sync-config` | B4 obs. 3 | Feature 3.3 |
| T3 | `invite_token_hash` é SHA-256 sem sal: o código do convite precisa ter entropia alta | B6 obs. 3 | Feature 2.4 |
| T4 | Caso "chave perdida" do banco cifrado sem prova no aparelho | B4 obs. 2 | Antes do lançamento |
| T5 | FRD-02 usa a hora de chegada no servidor, não a hora da mudança no aparelho; a data de criação da viagem vem do relógio do aparelho | `servidor.md` §11.9 e §12.3 | Feature 3.7 |
| T6 | Build Android em Linux (esteira) só provado na primeira etiqueta; as actions estão por etiqueta, não por hash | B1 rodada 2 obs. 1 e 2; B1 rodada 1 obs. 5 | Primeira etiqueta / lançamento |
| T7 | Nome do pacote em dois lugares (`app.config.ts` e `scripts/android.mjs`), sem teste que compare os dois | B1 obs. 6 | Quando vier o nome definitivo (R1) |
| T8 | `VIBRATE` na lista fechada de permissões até a 1.6 confirmar | B1 obs. 2 | Feature 1.6 |
| T9 | Tela provisória da B1: só tema claro, `borderRadius 16`; um link aberto com o app já aberto não troca de tela (só a frio); "um mascote por tela" sem trava em código | B2 | Primeira tela de produto / feature de links |
| T10 | Docker e emulador por vez entre ajudantes (houve rodada invalidada na B4); volumes anônimos do Docker se acumulam a cada `zerar` (76 soltos) | B4 obs. 4, B5 obs. 3, B1-FIX-2 obs. 2 | Regra de trabalho do orquestrador / manutenção |
| T11 | A trava de segredos vale também nos commits dos reels, pelo `core.hooksPath` compartilhado | B1 obs. 1 | Avisar a missão dos reels |
| T12 | Coautoria dos commits: os ajudantes assinaram com o modelo que fez o trabalho; o squash de cada feature é do orquestrador | todas | Cada integração |
| T13 | Evidências da B2 ocupam cerca de 19 MB | B2 | Se o repositório pesar |

## 6. Limpeza

- O clone temporário `C:\campinguim-wt\_base-final` foi apagado, junto com o `.env.local` e o APK.
- Os temporários na pasta do sistema foram apagados.
- O emulador está desligado e no padrão (`font_scale 1.0`, `night no`, `wm` resetado).
- O ambiente local está parado, com 0 contêineres. O Docker Desktop segue ligado, como estava.
- Este relatório fica fora do git até a validação humana.

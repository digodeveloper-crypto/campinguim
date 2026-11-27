# Validação da Base e decisões do responsável (27/11/2026)

Registro da validação humana ao fim da Base (SPEC, seção 14; CLAUDE.md: "ao fim de cada etapa, o trabalho para e aguarda validação humana") e das decisões que o responsável tomou nela. Feature **BASE-VAL**; IDs do PRD tocados: DSG-06 (identidade visual confirmada), NF-09 (medição) e PRV-04 (só como registro: textos legais).

## 1. O que foi validado

| Item | Valor |
| --- | --- |
| Data da validação | 27/11/2026 |
| Quem validou | o responsável |
| Código validado | `main` em `675bcbe` |
| Features | oito: B1, B1-FIX, B6, B3, B5, B4, B2 e B1-FIX-2 |
| Integrações | PRs #3 a #10, um commit squash por feature, com o ID da feature |
| Conferência do QA | `docs/qa/BASE-conferencia-final.md` (APROVADA em 27/11/2026, em clone novo do GitHub: suíte completa 7 de 7 duas vezes, fumaça 3 de 3, checagem G limpa) |
| Relatórios por feature | `docs/qa/` (B1, B1-FIX, B1-FIX-2, B2, B3, B4, B5, B6) e evidências em `docs/evidencias/` |

A validação libera as features da etapa 1 (1.1 em diante). A lista de versões e o que entra em cada uma estão em `docs/MUDANCAS.md`.

## 2. Decisões

Todas **decididas pelo responsável em 27/11/2026**.

### V1. Regra de sobras

Decidido pelo responsável em 27/11/2026: confirmada a regra conciliada. A partir da 2ª viagem seguida com sobra, `nova = teto(qty × 0,75)`; se o teto não muda a quantidade, `nova = max(1, qty − 1)`; toda redução é sinalizada ("sobrou da última vez").

A frase de `docs/regras.md` (e a de `docs/SPEC.md`, seção 9, "Sobras") que dizia "Decidido pelo responsável em 26/11/2026" sobre a conciliação passou a dizer que a conciliação foi **proposta pelo orquestrador em 26/11/2026 e confirmada pelo responsável em 27/11/2026**. As decisões 2 e 3 do responsável de 26/11/2026 (arredondamento e acúmulo) continuam como estavam.

### V2. Visual (sete escolhas da B2)

Decidido pelo responsável em 27/11/2026: confirmadas as sete escolhas provisórias da B2.

1. Piso de contraste 4,5 em todo texto, botões inclusive (D-2).
2. Erro sempre com ícone, texto e ação, nunca só cor (D-5).
3. Alvo de toque de 44 dp (D-7).
4. Gorro do mascote fixo em `#3EA8AE`.
5. Só as 5 expressões do mascote (`principal`, `icone`, `pose-alerta`, `pose-camping`, `pose-comemorando`).
6. Sem 3D no app.
7. O texto encolhe até a palavra mais longa caber (DESIGN.md 4.4).

Marcado como "confirmado pelo responsável em 27/11/2026" em `docs/DESIGN.md` (seções 3.4, 4.4, 14 e 15) e em `docs/componentes.md` (seções 7.1 e 7.2), sem reescrever o resto.

### V3. Medição: faixas de `amount_band`

Decidido pelo responsável em 27/11/2026: as faixas definitivas, em reais, são **0–50, 50–150, 150–500, 500–1500 e acima de 1500** (`0-50`, `50-150`, `150-500`, `500-1500`, `1500+`). A configuração continua sendo o lugar do valor: `FAIXAS_PADRAO`, em `packages/core/src/eventos/faixas.ts` (a constante antes se chamava `FAIXAS_PADRAO_PENDENTE`; os limites já eram esses). Marca de pendente retirada do código e de `docs/textos-e-eventos.md`.

### V4. Medição: canais de `install_attributed.channel`

Decidido pelo responsável em 27/11/2026: lista fechada **`store`, `invite`, `site`, `social`, `unknown`** (códigos em inglês). A lista vive em `CANAIS_PADRAO`, em `packages/core/src/eventos/catalogo.ts` (antes `CANAIS_PADRAO_PENDENTE`, com outros oito valores, descartados). A validação aceita outra lista por configuração (`canais`). Marca de pendente retirada do código e de `docs/textos-e-eventos.md`.

Os **limites de sanidade** (`nights` até 365, `people` até 999, contagens até 9999, `asked` e `answered` até 4) e o **tamanho da fila** de eventos ficam como estão: são decisão técnica da B6, registrados como tal em `docs/textos-e-eventos.md`, seção 7. Os códigos em inglês das outras listas (`origin`, `level`, `feature`, tipos de aviso) seguem como a B6 deixou.

### V5. Textos comuns `[PENDENTE]`

Decidido pelo responsável em 27/11/2026: cada feature escreve os seus textos; o responsável revisa na validação da etapa. Eram 55 no app e 6 na página; com a V10, restam 54 no app e 6 na página (lista em `docs/textos-e-eventos.md`, seção 8). **Os textos não foram escritos nesta feature**: só a decisão foi registrada.

### V6. Textos legais (PRV-04, pessoa habilitada, termos)

Decidido pelo responsável em 27/11/2026: um ajudante prepara um **rascunho, marcado como rascunho**, e o responsável revisa com quem de direito. Prazo: até a etapa 3. **Não foi escrito nesta feature.** Até lá as chaves legais continuam `[PENDENTE]` (a trava do teste de textos segue valendo: nenhum texto legal é preenchido sem a marca).

### V7. Conta de desenvolvedor do Google Play

Decidido pelo responsável em 27/11/2026: a conta só será aberta perto do lançamento 1.0.0. Consequência: o **item 4 da prova (F0-6)** e o **nome definitivo do pacote (D1)** ficam adiados até lá; `com.campinguim.prova` segue como nome provisório. Registrado em `docs/prova-tecnica/resultado.md`, junto de D1 e no item 4, sem alterar o conteúdo histórico.

### V8. Decisões de rotina do orquestrador em B3 e B5

Decidido pelo responsável em 27/11/2026: de acordo com as decisões de rotina do orquestrador:

- o histórico do item do grupo fica para a 2.2;
- as listas fechadas de tipos de chave Pix, `camping.status`, `merge_candidate.status`, opções dos fatos, `occasion` e `trip_kind` são fechadas nas features 2.9, 3.1 e 3.2;
- os pontos 8 a 13 da B3 ficam aceitos como implementados.

Registrado em `docs/servidor.md`, seção 12, e em `docs/regras.md`, seção 4.

### V9. Celular Android físico

Decidido pelo responsável em 27/11/2026: o responsável terá um celular e **avisa quando estiver disponível**. Será pedido na feature **1.6** (cabo e depuração USB). Até lá valem as provas do emulador, com o limite já registrado (P8 e F0-6 em aparelho real).

### V10. Rótulo do botão de login com Google

Decidido pelo responsável em 27/11/2026: **"Continuar com o Google"**. Aplicado em `apps/mobile/src/textos/pt-BR.json` (`entrar.comGoogle`), com a marca de pendente retirada só dessa chave, e retirada da lista de `docs/textos-e-eventos.md`, seção 8. A página web não tem chave de login com Google.

### V11. Tempos da verificação do aparelho (D3)

Decidido pelo responsável em 27/11/2026: os tempos são decididos na **feature 3.7**, com proposta do ajudante. Até lá valem os três valores da prova (5 minutos, 1 minuto, 24 horas) como premissas. Registrado em `docs/prova-tecnica/resultado.md`, junto de D3.

## 3. Pendências técnicas do relatório do QA e onde cada uma será tratada

Do relatório `docs/qa/BASE-conferencia-final.md`, seção 5.2. O orquestrador cria cada tarefa; a coluna diz em que feature ou momento a pendência entra.

| # | Pendência | Quando será tratada |
| --- | --- | --- |
| T0 | `app.config.ts` grava `ambiente: 'local'` em todo build, inclusive no da esteira de etiqueta; o ambiente `producao` ainda tem `null` em `enderecos.json` | **Antes da primeira etiqueta de versão** (0.1.0), em tarefa própria da esteira |
| T1 | `npm audit` com 9 moderadas (`minimatch`, por `typescript-eslint` e `expo`/`@expo/fingerprint`; `eslint@9.39.5` descontinuado) | Rodada de manutenção de dependências, antes da 0.1.0 |
| T2 | `undone_adjustment_ids` fora do `sync-config` | Feature 3.3 |
| T3 | `invite_token_hash` é SHA-256 sem sal: o código do convite precisa ter entropia alta | Feature 2.4 |
| T4 | Caso "chave perdida" do banco cifrado sem prova no aparelho | Antes do lançamento 1.0.0, com o celular físico (V9) |
| T5 | FRD-02 usa a hora de chegada no servidor, não a hora da mudança no aparelho; a data de criação da viagem vem do relógio do aparelho | Feature 3.7 |
| T6 | Build Android em Linux (esteira) só provado na primeira etiqueta; as actions estão por etiqueta, não por hash | Primeira etiqueta de versão e lançamento 1.0.0 |
| T7 | Nome do pacote em dois lugares (`app.config.ts` e `scripts/android.mjs`), sem teste que compare os dois | Quando vier o nome definitivo do pacote (D1, V7), perto do 1.0.0 |
| T8 | `VIBRATE` na lista fechada de permissões até a 1.6 confirmar | Feature 1.6 |
| T9 | Tela provisória: só tema claro, `borderRadius 16`; link aberto com o app já aberto não troca de tela; "um mascote por tela" sem trava em código | Primeira tela de produto (feature 1.1) para tema, raio e a trava do mascote; o link com o app aberto, na feature 2.4 |
| T10 | Docker e emulador por vez entre ajudantes; volumes anônimos do Docker se acumulam a cada `zerar` | Regra de trabalho do orquestrador (já vale) e manutenção da esteira |
| T11 | A trava de segredos vale também nos commits dos reels, pelo `core.hooksPath` compartilhado | Avisar a missão dos reels (orquestrador) |
| T12 | Coautoria dos commits: os ajudantes assinam com o modelo que fez o trabalho; o squash de cada feature é do orquestrador | Cada integração (rotina do orquestrador) |
| T13 | Evidências da B2 ocupam cerca de 19 MB | Só se o repositório pesar; revisar na etapa 2 |

## 4. Onde cada decisão foi registrada

| Decisão | Arquivos |
| --- | --- |
| V1 | `docs/regras.md` (seções 3 e 4), `docs/SPEC.md` (seção 9, "Sobras") |
| V2 | `docs/DESIGN.md`, `docs/componentes.md` (7.1 e 7.2) |
| V3, V4, V5, V6, V10 | `docs/textos-e-eventos.md` (seções 3, 7 e 8), `packages/core/src/eventos/` (`faixas.ts`, `catalogo.ts`, `validacao.ts`, `index.ts`, `eventos.test.ts`), `apps/mobile/src/medicao/registrador.ts` (só comentários e o nome da constante), `apps/mobile/src/textos/pt-BR.json` (`entrar.comGoogle`) |
| V7, V11 | `docs/prova-tecnica/resultado.md` (D1, D3 e item 4) |
| V8 | `docs/servidor.md` (seção 12), `docs/regras.md` (seção 4) |
| V9 | este arquivo (pedido na feature 1.6) |
| Pendências T0 a T13 | este arquivo, seção 3 |

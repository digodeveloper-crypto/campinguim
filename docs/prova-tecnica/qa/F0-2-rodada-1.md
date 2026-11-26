# F0-2 · sincronização offline · rodada 1 · REPROVADO

Data: 2026-11-25 · Entregue por: pane-661 · Conferido por: QA (pane-646)
Base: `docs/prova-tecnica/plano.md`, D, F0-2 (cenários, "sem perda", "estável", aceite e evidência), H7 e G; SPEC, seções 4 e 11; `CLAUDE.md`; critério do piloto de 25/11: nenhuma marca de terceiro em imagem ou vídeo.
Alvo: worktree `C:\campinguim-wt\F0-2`, ramo `feature/F0-2-sincronizacao`, 5 commits sobre `fb54ca9` (`0e511f7`, `3fe99d7`, `3f558a7`, `eb35b36`, `1403756`). Só local. Autor e quem gravou: noreply. A base é `fb54ca9`, e nenhum commit do ramo tem imagem ou vídeo além das 3 capturas do P1.

**Resumo:** o resultado técnico se sustenta. O QA recalculou as 93 de 93 e rodou os 37 testes do servidor. A reprovação é por três coisas: falta evidência exigida pelo plano, o limite de tempo do P8 não é o do plano, e as falhas do ensaio não têm explicação.

## Aceite do plano

| Critério | Resultado do QA |
| --- | --- |
| 93 de 93 sem perda, sem duplicação, A e B iguais ao servidor | ok. **Recalculado pelo QA a partir de `execucoes.jsonl`**, rodada r3. Válidas: P1 10, P2 10, P3 10, P4 10, P5 10, P6 10, P7 3, P8 10, P9 10, P10 10, com os números 1 a N sem buraco. Todas têm `problemas` vazio e `iguais` A e B verdadeiros. Casos do verificador: P3 e P3b com 10 vencidas pela regra; P6 com 20 vencidas e 10 aplicadas; P9 com 50 recusadas e avisadas; P7 com 600 alterações; P8 com 2000 |
| P3b (relógios ±2 h) | ok. 10/10 |
| Refeitas ≤ 10 % | ok. 4 de 107 (3,7 %) na r3. A r1 (19,4 %) e a r2 (15,6 %) foram interrompidas, como o plano manda |
| Convergência ≤ 30 s (P7: 2 min) | **ver item 2.** Medida a partir de quando o app volta a alcançar o servidor, o pior é 7,7 s nos cenários curtos, 13,0 s no P7 e 20,8 s no P8. Medida a partir do comando que desliga o modo avião, o **P8 passa de 30 s em 5 das 10** execuções (29,3 a 34,5 s) |
| Online: alteração no outro aparelho em até 5 s, 20 medidas | ok. 20/20, mediana de 0,14 s e pior de 1,2 s. As duas pontas usam o relógio do computador, na hora em que a linha do registro chega, então não dependem do relógio dos emuladores |
| Segunda barreira | ok. **Rodado pelo QA**, com o banco recriado do zero: `supabase db reset` aplicou as 2 migrações, depois `semear` e o reinício do PowerSync. `npm run testar` deu **37 de 37**, exit 0. O teste lê o canal de sincronização como C e exige receber exatamente a viagem de C, o que serve de controle positivo. O controle de A recebe as 5 tabelas |
| Evidência: tabela das 93, saída do verificador, **vídeo curto de P1 e de P9 lado a lado**, capturas do estado final | **falta (item 1).** A tabela e o verificador estão completos. Há 3 capturas do P1 e nenhum vídeo. Do P9 não há nada visual |

## Conferências do QA

- **tsc do app:** exit 0.
- **Migração (`20261125000000_f0_2_sincronizacao.sql`):** `item_claim`, `trip_item_history`, `private.sync_change` e `private.prova_ajuste` nascem com RLS na mesma migração. Os privilégios das tabelas `private` foram revogados. `sync_apply` é `security definer`, com `search_path = ''`, recusa a chamada sem `auth.uid()`, limita o lote a 500 alterações e tem execução revogada de `anon`. A escrita direta em `trip_item`, `item_claim` e `trip_item_history` foi revogada de `authenticated`. A hora vem sempre do servidor. A família em `item_claim` é a de quem chama.
- **Regras de sincronização:** as 5 tabelas são filtradas por quem é membro ativo. Nada de catálogo nem de outra viagem vai ao aparelho.
- **Verificador (`verificador.mjs`):** lido inteiro. Os três casos do plano estão lá, além de fantasma, duplicação pelo histórico e comparação campo a campo entre o servidor, A e B. P3 com resultado errado cairia em PERDA, porque não haveria regra que explicasse.
- **Imagens (critério do piloto):** o QA abriu as 3 imagens. São só telas do Campinguim, com as barras do Android cortadas e sem marca, ícone ou nome de terceiro.
- **Checagem de G no diff dos 5 commits:** 0 ocorrências de usuário do Windows, e-mail, `C:\Users`, `AppData` literal, caminho do worktree, `sb_secret_`/`sb_publishable_` com valor, JWT, `service_role` e chave privada. Também nenhum token nas evidências (`execucoes.jsonl`, `rodada-*.txt`): o link `entrar?t=` aparece só como texto explicativo. As senhas de D e E são geradas em `prova/.env.local`, que fica fora do git.
- **Limpeza:** 0 contêineres e 0 emuladores. O worktree está limpo. O QA subiu a pilha para os testes e a derrubou sem usar `prova.mjs derrubar` (ver observação 5).

## Itens para corrigir

1. **Falta evidência visual exigida pelo plano** (D, F0-2, "Evidência ao QA"). O plano pede "vídeo curto de P1 e de P9 com os dois emuladores lado a lado; capturas do estado final". A entrega tem só as 3 capturas do P1. Falta:
   - o vídeo do P1;
   - o vídeo do P9;
   - qualquer captura do P9: B com o aviso das 5 recusadas e a viagem fora do aparelho, ao lado de A.

   O código do vídeo existia no `0e511f7` e foi retirado sem registro. Grave só a tela do app, cortando a barra de status e a de navegação como nas capturas, e confira quadro a quadro que não há tela inicial, ícone nem nome de app de terceiro. Se não for possível gravar sem marca de terceiro, registre o motivo no LEIA-ME e avise o piloto: a troca do vídeo por capturas é decisão dele, não da tarefa.
2. **O limite de tempo do P8 não é o do plano.** O plano dá 2 min **só ao P7**, e os outros cenários, o P8 incluído, têm 30 s. Mesmo assim:
   - `resumo.mjs:39` e `rodar.mjs:332` usam 120 s no P8;
   - o cabeçalho de `tabelas-r*.md` e o `resultado-F0-2.md` dizem "P8 ... (limite 2 min)".

   Corrija o limite para 30 s, gere de novo as tabelas e ajuste os textos. No resultado, diga com todas as letras que, medido desde o comando que desliga o modo avião, o P8 passou de 30 s em **5 das 10** execuções da r3 (29,3 a 34,5 s), e explique a causa. Diga também se o atraso artificial de 4 s do P8 (`private.prova_ajuste`) continuou ligado durante o reenvio, porque isso entra no tempo. Pela medida da tarefa, a partir de quando o app alcança o servidor, o pior é 20,8 s e o P8 continua dentro de 30 s. O que muda é o texto, para o responsável decidir com o número certo.
3. **As falhas do ensaio não têm explicação.** `execucoes.jsonl` tem 9 execuções do ensaio com resultado `falha`. Entre elas:
   - P2 com **10 alterações "FANTASMA"** (`trip_item PATCH` no servidor sem registro em aparelho);
   - dois P8 sem convergir, com diferenças (`historico: 109 x 0 linhas`, `qty 2 x 4`);
   - P4 com `qty 2 x 1`;
   - P1 e P3 com fila parada.

   O resultado diz só "nenhuma em execução medida" e manda ver "Correções feitas no app", mas a tabela de correções não cita fantasma nem diferença de histórico. Acrescente ao `resultado-F0-2.md` uma linha por falha do ensaio, com a causa e a correção que a fechou. Exemplo: as 10 do P2 parecem ser as 10 do P1 anterior, que ficaram na fila e chegaram durante o P2, antes do filtro por viagem do verificador. Confirme isso e escreva. O critério de troca de tecnologia (seção I) depende de perda ou duplicação, e fantasma ou diferença sem explicação no registro bruto é exatamente o que o responsável precisa ver explicado.

## Observações (não reprovam; vão ao orquestrador na aprovação)

1. **Um dado inválido trava a fila inteira do aparelho.** Erro de dado dentro de `sync_apply` aborta o lote todo, e o `uploadData` lança o erro sem descartar nada. Os exemplos são o `check` de `kind`, `name` com mais de 120 caracteres e um uuid inválido. A fila fica parada para sempre. Isso confirma o risco das viagens de teste da F0-4 (`kind = 'camping'`). Na B1, a função deve devolver "recusada (inválida)" por alteração, e o app deve tirá-la da fila e avisar, como já faz com `not_member`.
2. **Como `sync_apply` é `security definer`, o RLS não vale nas escritas:** toda autorização está dentro da função. Hoje:
   - o `family_id` de um item novo vem do aparelho, sem conferência, igual à política da migração base (é uma simplificação da prova);
   - qualquer membro edita item de outra família;
   - qualquer membro apaga marcação de outra família.

   Na B1, as regras por família da SPEC precisam ser escritas na função, com teste.
3. **A sessão fica no SQLite do aparelho sem cifra** (`sessao_local`, com o token de renovação). Na B1, ela vai para armazenamento seguro ou para o banco cifrado. O DEF-11 está "suportado pela biblioteca, não confirmado".
4. **O login por link `campinguim://entrar?t=<token de renovação>`** faz o token passar pelo `am start` e pelo registro do emulador. É aceitável só na prova local, e a entrega já diz que não vai para a base.
5. **`prova.mjs derrubar` (código da F0-1)** roda `adb kill-server` e encerra à força **todo** processo de emulador da máquina, não só A e B. O `ambiente.md` registra um `adb kill-server` no dia 24/11, durante a tentativa de reproduzir o Maestro. Não usar `derrubar` enquanto outra tarefa tiver emulador ligado. Corrigir na base.
6. **A convergência foi medida a partir de quando o app alcança o servidor.** O emulador leva de 11 a 24 s para devolver a rede depois do modo avião. No aparelho real, não confirmado.
7. **A pausa da tela no P7** é medida no processo do JavaScript, com 0 pausas acima de 250 ms. Não mede travamento da camada nativa.
8. Integrar **só por squash** (PROPOSTA 3), como nas outras tarefas.

---

# F0-2 · rodada 2 · APROVADO

Data: 2026-11-25 · Commit novo: `7f78a41`, sobre `1403756`. Só local. Autor e quem gravou: noreply.

| Item da rodada 1 | Resultado do QA |
| --- | --- |
| 1. Vídeos do P1 e do P9 e capturas do estado final | ok. `p1-dois-emuladores.mp4` tem 73,9 s e 1108 quadros, e `p9-dois-emuladores.mp4` tem 52,8 s e 792 quadros, os dois em 1248×1100. Os metadados têm só o codificador. O QA fez uma folha de quadros a cada 2 s de cada vídeo e mediu o brilho de **todos** os quadros: a média fica entre 167 e 179 no P1 e entre 168 e 179 no P9, na faixa clara das telas do app, sem nenhum quadro escuro. Em todos os quadros da folha só aparecem telas do Campinguim. No P1, A marca offline com a fila subindo até 10, e depois os dois aparecem com os 10 "no carro". No P9, B fica com "Esta viagem não está neste aparelho." e com o aviso das 5 recusadas, e A segue com a lista. O QA abriu a `p9-estado-final.png` e as 3 `p1-*.png` refeitas: estão limpas |
| 2. Limite do P8 em 30 s | ok. `resumo.mjs` dá 2 min só ao P7, e `rodar.mjs:332` usa 30 s no P8. O QA rodou de novo `resumo.mjs` para r1, r2 e r3: a saída é igual à versionada, menos a linha da hora em que foi gerada. O QA restaurou os arquivos depois. A coluna nova "acima do limite desde o modo avião" mostra 5 no P8 da r3, o que bate com a conta do QA na rodada 1. O resultado traz os 5 tempos e a causa. O atraso de 4 s é desligado no `finally`, logo depois do corte e antes do `reconectar` (`rodar.mjs:336-356`): **conferido no código** |
| 3. Falhas do ensaio explicadas | ok. A tabela tem as 9 falhas, cada uma com a hora, o que o registro mostra, a causa e o commit que a fechou. A explicação do fantasma do P2 bate com o registro bruto: as 10 chegadas são `trip_item PATCH` e o P2 só gera `item_claim PUT` |

- **Checagem de G no diff de `7f78a41`:** 0 ocorrências. As 2 linhas com `LOCALAPPDATA` leem a variável de ambiente e não trazem caminho escrito.
- **Limpeza:** 0 contêineres e 0 emuladores. O worktree está limpo. O QA apagou a folha de quadros do seu espaço temporário.
- **Observação nova (menor):** o resultado do verificador nas execuções filmadas está só no texto do LEIA-ME, e não no `execucoes.jsonl`.

As observações 1 a 8 da rodada 1 continuam valendo e vão ao orquestrador.

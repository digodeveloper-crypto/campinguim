# F0-4 · abrir o app na viagem por link · rodada 1 · APROVADO

Data: 2026-11-25 · Entregue por: pane-673 · Conferido por: QA (pane-646)
Base: `docs/prova-tecnica/plano.md`, D, F0-4 (casos, aceite e evidência), B6 e G; SPEC, seções 2 e 14; `CLAUDE.md`; critério do piloto de 25/11: nenhuma marca de terceiro em imagem ou vídeo.
Alvo: worktree `C:\campinguim-wt\F0-4`, ramo `feature/F0-4-link`. Os commits próprios são `65c6f36` (código) e `88015ad` (evidências), mais o merge `4d262e5` da ponta da F0-3 (`39aef77`). O ramo saiu de `2dfa308`, da F0-3, e não de `fb54ca9`. Só local. Autor e quem gravou: noreply.

## Aceite do plano

| Critério | Resultado do QA |
| --- | --- |
| (a), (b) e (d) abrem a viagem certa em 10 de 10 | ok. **Recalculado pelo QA execução por execução**, com o id e o nome na tela comparados com o id do link e o nome da viagem de teste, sem usar o campo `certo`: (a) 10/10 COLD; (b) 10/10 com o app aberto em outra tela (início, links e lembretes, em rodízio); (b-fundo) 10/10 HOT; (d) 10/10, 5 com o app fechado e 5 aberto. Nos casos (a), (b) e (d), `resolvido_para` é `com.campinguim.prova/.MainActivity` nas 30 execuções. O campo `certo` bate com a conta do QA em todas. 0 quebras, 0 erros do `am` |
| (c) mensagem clara, sem quebrar | ok. 10/10 com "Esta viagem não está neste aparelho.", com o link próprio e o https, com o app fechado e aberto. O id inválido mostra "O link não traz uma viagem válida." O QA viu as duas capturas |
| Tempo do toque até a tela medido em (a) | ok. Mediana de 721 ms e pior de 988 ms. É medido no próprio aparelho, da linha do `am start` até o registro `VIAGEM_TELA` que a tela da viagem escreve quando fica pronta. O `TotalTime` do `am start` fica entre 384 e 741 ms. É tempo de emulador com carga, e a entrega diz isso |
| (e) registrado | ok. Sem vínculo, o link https foi ao navegador do emulador em 5 de 5, e o app não ficou na frente. Sem imagem, por causa da marca. A árvore de tela em texto mostra só a tela de primeira abertura do navegador, sem conta nem e-mail |
| Evidência: `am start` com a saída e o tempo; captura; `pm get-app-links` em (d) | ok. Estão em `am-start-1.txt` de cada caso, nas capturas e em `caso-d/pm-get-app-links.txt`: `1024` depois de instalar e `approved` depois de forçar. O manifesto tem o filtro `https` para `campinguim.test`, com `/viagem` e `autoVerify`, e o host vem de `enderecos.json` |

## Conferências do QA

- **Testes rodados pelo QA** (Node do sistema): `tsc --noEmit` exit 0; `configuracao.test.mjs` 5 de 5, exit 0. O `resumo.mjs` gera exatamente o `resumo.md` versionado.
- **O APK é o do código:** foi gerado às 02:15. Os fontes da F0-4 mudaram às 02:00 e 02:01 e não mudaram depois. O merge da F0-3 não toca em `prova/app` (`git diff 65c6f36 HEAD -- prova/app` vazio).
- **Endereço único:** a tela de links monta o https com `config.site`. O `campinguim.test` aparece só na configuração (teste 3). `run.app` aparece só no texto de `testes.txt`, que descreve a busca.
- **Imagens (critério do piloto):** o QA abriu as 13 imagens versionadas. São 8 telas da viagem, a de id inválido, a de links e as telas da fumaça (2 barras de avisos e 2 telas da viagem). Nenhuma mostra tela inicial, ícone ou nome de app de terceiro. As barras de avisos mostram só o aviso do Campinguim e avisos do sistema Android. Não há vídeo.
- **Checagem de G nos arquivos da F0-4:** 0 de cada: usuário do Windows, e-mail, `C:\Users`, `AppData`, caminho do worktree, chave `sb_secret_`/`sb_publishable_`, JWT, `service_role` e chave privada. Os "digo" encontrados são de "código". A impressão digital no manifesto é do certificado público de assinatura de teste, e não é segredo.
- **Limpeza:** o AVD `campinguim-d` foi apagado. `adb devices` mostra só 5554 e 5556, da F0-2. O worktree está limpo. O `prova/.env.local` copiado continua no worktree, ignorado pelo git (`.gitignore:21`), como na F0-3.
- **Fumaça do lembrete:** (a) 5/5 e (b) 5/5. Aviso com o avião e toque abrindo a tela da viagem. No encontro entre aviso e link, o link prevalece: 3/3 a frio e 3/3 com o app vivo.

## Observações (não reprovam; para o orquestrador)

1. **As viagens de teste entram na fila de envio da sincronização.** `semearViagens` grava em `trip`, que é tabela sincronizada, e não só local. Cada `insert` e `delete` entra na fila de envio do PowerSync. Hoje não sai do aparelho, porque não há sessão. Mas num aparelho que depois fizer login, o envio dessas linhas falha sempre:
   - `kind = 'camping'` viola o `check` da migração, que aceita só `tent_car`, `backpack` e `motorhome`;
   - `owner_profile_id` vazio é barrado pela política de inserção;
   - e o `uploadData` lança o erro sem descartar a operação.

   Com isso, **a fila daquele aparelho trava**, e nenhuma outra alteração dele chega ao servidor. A frase do LEIA-ME "não passam pela sincronização" vale só para esta rodada, sem login.

   **Na integração no ramo da prova:** nunca abrir `campinguim://links?semear=1` em `campinguim-a`/`-b` nem em aparelho com login. Na B1, não copiar esse jeito de semear: dados de teste do aparelho vão em tabela só local ou passam pelo servidor.
2. **Base e merge.** O ramo saiu da F0-3 e trouxe a ponta dela por merge, com o histórico do `2dfa308`, que ainda tem o vídeo e as imagens com ícones de terceiros. Ele também mudou `prova/lembretes/aparelho.mjs`, da F0-3: o serial agora vem de `CAMPINGUIM_SERIAL`, e o padrão `emulator-5558` não mudou. A mudança é pequena e compatível, mas é fora da subpasta de links. Integrar **só por squash**.
3. **"Fechado" = remoção da tarefa** (`cmd activity stack remove`), não o deslize, como nas rodadas finais da F0-3. Com `pidof` vazio e `COLD` em todas as execuções fechadas, a abertura a frio está provada. O deslize real fica para o celular físico.
4. **A consulta e o comportamento de (d) divergem.** `resolve-activity` devolve o `ResolverActivity`, mas o `am start` real abriu o app direto nas 10 execuções. Registrado e não investigado, e vale o comportamento real. O significado do estado `1024` está como "leitura minha", sem confirmação em documento.
5. **Para o responsável (já está na entrega):** sem o `assetlinks.json` publicado e verificado, o link https da viagem abre no navegador, não no app. O site precisa tratar esse caso (página do convidado, feature 2.4). A verificação automática do domínio e o link depois de instalar pela loja (RET-01, J3) ficam fora da prova.
6. **Menor:** os `dumpsys-notification.txt` da fumaça têm a lista inteira de avisos do sistema, cerca de 850 linhas, e não só o bloco do app. Não há dado pessoal (emulador sem conta).

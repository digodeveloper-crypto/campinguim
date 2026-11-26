# F0 · plano da prova técnica · rodada 1 · REPROVADO (2 itens)

Data: 2026-11-24 · Entregue por: pane-634 · Alvo: `docs/prova-tecnica/plano.md` (568 linhas)
Base: os 7 pontos do piloto (pane-547); `docs/SPEC.md` seção 2 (fim), seção 4, seção 10, seção 11 e seção 14; `CLAUDE.md`.

**Resumo:**
- O plano é cuidadoso e quase todo verificável:
  - as afirmações sobre a máquina batem com o que o QA leu;
  - as afirmações de versão e licença conferidas por amostragem batem com as páginas oficiais;
  - os quatro itens da prova têm aceite em número e evidência que o QA consegue conferir;
  - as regras de segurança estão aplicadas;
  - as decisões do responsável aparecem como PROPOSTA ou na lista H;
  - não há segredo no arquivo;
  - só esse arquivo foi criado.
- **Dois problemas, os dois nos cenários de sincronização (F0-2):**
  1. O resultado esperado de dois cenários exige um "registro do valor vencido" que a SPEC não pede. Isso entra no critério de "sem perda" como se fosse regra.
  2. Dois cenários tiram, sem avisar, uma parte do resultado que a SPEC espera. O mesmo plano marca como PROPOSTA os cortes em S6 e S7, mas não estes.

## Itens que reprovam

| # | Ponto do piloto | Onde | O que diz | O que a SPEC diz | O que fazer |
| --- | --- | --- | --- | --- | --- |
| 1 | (3) nada inventado | D, F0-2: P4 ("a edição de B fica no registro"); "O que conta como sem perda", 2º caso ("vencida por uma regra da seção 4 (P3, P4, P6) e o valor vencido está no registro do servidor") | Em P3 (`pack_state`) e P4 (remoção × edição), o valor que perde precisa estar num registro do servidor | SPEC §4 só guarda o valor perdido em dois casos: "Quantidade, nome e nota do item… **em item do grupo**, o valor perdido aparece no histórico do item" e gastos (`expense_audit`). Para `pack_state`, "vence o estado mais avançado". Para remoção × edição, "vence a remoção; o item pode ser restaurado". O S4 espera só "removido nos dois e pode ser restaurado". Nenhum dos dois pede registro do valor vencido | Escolher um caminho e escrever no plano: (a) o verificador de "sem perda" usa um **registro técnico da prova**, que não é regra do app e fica marcado como tal (ou como PROPOSTA); ou (b) P3 e P4 contam como sem perda quando o estado final é o que a regra da §4 manda, sem exigir registro. Em P6, deixar explícito que o item é **do grupo**, porque só aí a SPEC guarda o valor perdido |
| 2 | (5) decisões como PROPOSTA | D, F0-2: P2 e P5 | P2 espera "duas linhas em `item_claim`; os dois aparelhos mostram as duas famílias". P5 espera "dois itens na lista, com identificadores diferentes" | S2 espera também "**e o aviso de duplicado**"; S5 espera também "**e a sugestão de juntar**" | Ou incluir as duas partes no esperado, ou marcar a retirada como PROPOSTA (por exemplo: "aviso e sugestão são tela, ficam para a feature X") e acrescentar isso a H7, junto com S6 e S7 |

## O que passou

| Ponto | Resultado | Como conferi |
| --- | --- | --- |
| (1) Fonte e data | ok: toda afirmação de versão, licença ou custo tem fonte oficial, com data de consulta de 24/11/2026, ou está na lista única de 20 "não confirmado". **Amostragem do QA nas páginas oficiais, hoje:** <ul><li>PowerSync passou de FSL para Apache 2.0 em post de 2026-11-03;</li><li>Expo SDK 58 é de 15/10/2026;</li><li>`eas build --local` "do not support Windows";</li><li>o build local com `npx expo run:android` diz "No Expo account needed";</li><li>Docker Desktop é grátis para menos de 250 funcionários e menos de US$ 10 milhões;</li><li>o AEHD sai em 31/12/2026 e o recomendado é o WHPX;</li><li>a proteção de ramo existe em privado só com Pro, Team ou Enterprise. A frase está no texto de disponibilidade da documentação do GitHub, que a página renderizada nem sempre mostra.</li></ul> | página oficial de cada um |
| Máquina (A) | ok: "Virtualização Habilitada no Firmware: Não"; Ryzen 7 5700X; Node 24.19.0 do sistema; Git 2.55.0; `gh` 2.102.0; Docker 29.8.2. O `git log` está certo: `main` em `f1ed7d7`, 18 commits acima, e a exceção da recomendação (`a032cc5` mexe em `design/mascote`) é real | `systeminfo`, `--version`, `git` |
| (2) Os quatro itens | ok. Os quatro da SPEC §2 têm tarefa, aceite em número e evidência que o QA confere: <ul><li>item 1: F0-2, 93 de 93, verificador, convergência medida;</li><li>item 2: F0-3, 10 de 10 por caso, `dumpsys notification` e modo avião;</li><li>item 3: F0-4, 10 de 10, `am start` e `pm get-app-links`;</li><li>item 4: F0-5 local, mais F0-6 "pela faixa de teste", como a SPEC pede. Tem controle positivo em aparelho real, sem o qual um servidor que recusa tudo passaria.</li></ul>A decisão de deixar o item 4 pendente e a prova incompleta está registrada (C, F0-7) | leitura contra SPEC §2 |
| (3) Divergências | ok. Listadas: J3 (RET-01 × item 3), J7 (E1-08 × SPEC §10, 18h, alarme exato), J8 e J9 (GIT × situação). Também as diferenças com a documentação oficial: J5 (alfa), J6 (licença) e J14. P3b segue o princípio 4 da §4. A §10 diz "18h" e "tocar no aviso abre a tela correspondente", como o plano cita | leitura da SPEC |
| (4) Segurança | ok, a seção G cobre cada regra do `CLAUDE.md`, com teste: <ul><li>RLS na mesma migração, com teste que falha;</li><li>a segunda barreira (SPEC §11: "um membro da viagem A não recebe nada da viagem B");</li><li>segredos fora do repositório, com `.env.example`;</li><li>migração versionada com `db reset`;</li><li>`run.app` só no arquivo de configuração, com teste;</li><li>sem localização no manifesto;</li><li>a chave de serviço fora do pacote;</li><li>a prova de desenvolvimento desligada por padrão.</li></ul> | leitura |
| (5) PROPOSTA | ok, fora o item 2: build sem EAS, AVD "Google APIs", serviços desligados, S6 e S7, opção 2 de E, PROPOSTAS 1 a 3 de F, GitHub Pro, J3 e J4. Os aceites de termos, o pagamento, a BIOS e o nome do pacote estão em H, com o que trava | leitura |
| (6) Segredos | ok: nenhum e-mail, token, chave ou senha (busca por padrões). Aparece só o nome da conta do GitHub logada, que não é segredo nem e-mail | `grep` |
| (7) Só o arquivo | ok: `docs/prova-tecnica/` tinha só `plano.md` (a pasta `qa/` é do QA). Nada mais mudou no `git status` | `git status`, `ls` |

## Observações (não reprovam)

- **B9, "O mesmo vale para rulesets":** a página "About rulesets" não traz a frase sobre Free e Pro, só sobre Team e Enterprise. Vale citar o texto de disponibilidade ou marcar como "não confirmado". Não muda a decisão H4.
- **Os números de aceite são do plano, não da SPEC:** convergência em 30 s (2 min em P7); "sem travar mais de 1 s" para o "sem travar a tela" do S7; aviso em até 60 s; 10 de 10; mais de 6 GB livres. São razoáveis e mensuráveis. O orquestrador pode querer registrar que foi ele quem fixou esses números.
- A citação do Expo é "No Expo account needed"; o plano escreveu "No Expo account is needed". A página também tem "No Expo account is required". Só a forma muda.

---

# Rodada 2 · 2026-11-24 · pane-634 · APROVADO

- **Item 1:** resolvido pelo caminho (b).
  - "Sem perda" agora conta a alteração vencida quando o estado final é o que a §4 manda: P3 em `in_car`; P4 removido e restaurável; P6 com o último valor, e o valor perdido no histórico porque o item é do grupo.
  - O P4 espera só "Removido nos dois e restaurável", como o S4.
  - O P6 diz "item do grupo".
  - O "Faz" de F0-2 ficou alinhado à §4.
  - O "registro técnico da prova" (ordem de chegada) está marcado como "não é regra do app", não vai para a base e é PROPOSTA.
  - Não sobrou "fica no registro" nem "registro do servidor".
- **Item 2:** resolvido.
  - P2 e P5 conferem a condição nos dados.
  - A retirada das telas (aviso de duplicado e sugestão de juntar) é PROPOSTA e está no H7, junto com S6 e S7.
  - As features citadas existem na SPEC §14: 2.5 ("Assumir item, 'ninguém pegou' e duplicados") e 2.12 ("Cenários S1 a S10"), onde o S5 inteiro é testado.
- **Observação B9:** resolvida. Os rulesets citam a tabela de github.com/pricing, e o trecho da página "About rulesets" ficou "não confirmado". A seção F remete a B9.
- **Escopo:** só `plano.md` mudou. `docs/prova-tecnica/` tem só o plano e a pasta `qa/` do QA. Nada aparece fora dela no `git status`.
- **Os 7 pontos do piloto estão atendidos.** As decisões abertas para o responsável estão em H (H1 a H7 agora; H8 a H14 depois).

---

# Rodada 3 · 2026-11-24 · pane-634 · APROVADO (conferência curta: decisões H4 e H5 e tarefa F0-P)

**O que mudou e passou:**
- **H4 e H5 como decisões:** H4 (público e gratuito) e H5 (`prova/`) aparecem como decididas, com data, no Resumo (6 e 7), em E, F, H e J8 (resolvida). Não sobrou PROPOSTA (a) nem "opção 2" pendentes. As consequências estão ligadas: F0-P antes do primeiro envio, H4a, H4b, H4c, linha nova em G e risco novo em I.
- **F0-P:** traz as 6 categorias, cada uma com comando, aceite em número (0 achado nas categorias 1 a 3 em todos os commits do `main`; autores só com o e-mail do GitHub; envio só do `main`) e evidência que o QA consegue repetir. O modelo é Opus 5.5 alto, e o motivo está escrito. A tarefa não envia nada e não escolhe licença (H4b).
- **Achados de leitura, conferidos pelo QA no repositório, sem alterar nada:**
  - os 19 commits dos 2 ramos têm autor e quem gravou com o mesmo e-mail do Gmail (mascarado aqui); o `main` tem 1 commit; não há etiquetas;
  - o e-mail pessoal não aparece em nenhum arquivo nem em nenhuma mensagem do histórico;
  - o nome de usuário do Windows aparece em exatamente 3 arquivos, no histórico inteiro, os mesmos que o plano cita. O único outro resultado da busca por caminho é `render.py`, que usa `%LOCALAPPDATA%` genérico, sem usuário;
  - 8 pastas de fonte e 8 `OFL.txt`; 1 `.blend`; 5 pacotes Remotion 4.0.546 em `videos/package.json`; nenhum arquivo de licença na raiz.
- **PROPOSTA do e-mail e ordem do envio:** as 9 afirmações sobre o GitHub foram conferidas hoje nas páginas oficiais e batem com o texto, entre elas:
  - o formato `ID+USERNAME@users.noreply.github.com` para contas depois de 18/07/2017;
  - "Any commits you made prior to changing your commit email address are still associated with your previous email address";
  - "we'll check the most recent commit";
  - a frase sobre repositório sem licença;
  - "existing forks or local copies created by other users will still exist", que está na mesma página de licença citada.

  A montagem do zero, com reserva local nunca enviada, e o envio só do `main` (sem `--all`, `--mirror` nem `--tags`) seguem disso. A reescrita do histórico fica condicionada ao "pode" (H4a), e o envio ao "pode" final (H4c).
- **Dependências:**
  - F0-1 passa a depender do repositório protegido, coerente com a SPEC §14;
  - F0-P roda junto com F0-0, e o pico de 4 tarefas continua valendo;
  - H4a vem antes de F0-P, coerente com "Depende de: PROPOSTA 1 montada".
- **Pontos (1) e (6):**
  - os novos não confirmados 19 (Actions em repositório público) e 20 (Remotion) estão na lista;
  - o plano não traz o e-mail pessoal, "gmail" nem o nome de usuário do Windows. O único endereço é o modelo `ID+USUÁRIO@users.noreply.github.com`, e não há padrão de token.
- **Ponto (7):** só `plano.md` mudou. `git status` mostra só `docs/prova-tecnica/`.

## Observações (não reprovam)

1. **A lista "Não confirmado" tem números repetidos.** Os itens novos entraram como 19 e 20, e os antigos 19 (JDK do Studio) e 20 (memória do PowerSync e do MongoDB) não foram renumerados. São 22 itens numerados até 20. Nenhum texto do plano cita item por número, então nada se perde, mas vale renumerar de 1 a 22.
2. **O `.blend` está comprimido** (cabeçalho zstd). Busca de texto ou `git grep` não enxerga o que há dentro: o "0 resultado" do QA nesse arquivo não prova nada. Na F0-P, as categorias 2 e 3 precisam olhar o `.blend` descomprimido. Por exemplo, abrir no Blender já instalado, em modo sem janela e só leitura, e listar os caminhos de imagens e bibliotecas. Senão o aceite "0 achado" pode ser falso nesse arquivo. O QA vai cobrar isso na evidência da F0-P.
3. **Remotion:** "não é de código aberto" está certo pelo `LICENSE.md` do próprio pacote, que diz "allowing the source code to be available". Vale citar esse arquivo como fonte. O mesmo texto traz um ponto de **custo** que o plano não registra: o uso é grátis para pessoa física e empresa com até 3 funcionários, e acima disso exige "Company License". Isso é do responsável e pode entrar como registro na F0-P ou em J.
4. **Frequência da busca de autores:** o passo 4 da PROPOSTA do e-mail diz "no histórico inteiro antes de cada envio". A linha de G diz "lista de autores dos commits novos". Os dois funcionam, porque o histórico já enviado não muda, mas o plano deve dizer uma coisa só.
5. **Ordem visual:** H4a a H4c estão depois de H5, e J16 está entre J8 e J9. É só arrumação.
6. As páginas do GitHub usam ora "Keep my email addresses private", ora "address" no singular. O plano usa a forma da página de configuração, e está certo.

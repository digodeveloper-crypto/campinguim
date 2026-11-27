# B1-FIX-2 · ajustes da esteira · rodada 1 · APROVADO

- Data: 2026-11-26.
- Entregue por: pane-726. A entrega chegou ao piloto, que a repassou. Conferido por: QA (pane-689).
- Base: os três ajustes combinados nos relatórios B3-rodada-3 (obs. 1 e 2), B4-rodada-1 (obs. 1), B5-rodada-1 (obs. 1 e 2) e B2-rodada-2 (galeria); IDs GIT-10, GIT-11 e DEF-11; `docs/desenvolvimento.md`.
- Alvo: worktree `C:\campinguim-wt\B1-FIX-2`, ramo `feature/B1-FIX-2-ajustes-da-esteira`, ponta `8d4d570`, 5 commits sobre o main `18b4ea1` (B2), sem push. A árvore está limpa e o rebase em dia.
- Escopo: o ramo muda só `scripts/ambiente/ambiente.mjs`, `scripts/seguranca/verificar-enderecos.mjs`, `scripts/testes/enderecos.test.ts`, `apps/mobile/src/config.ts` com dois testes novos, `docs/desenvolvimento.md`, `docs/MUDANCAS.md` e `docs/evidencias/B1-FIX-2/`.
- Ambiente: o piloto liberou Docker e emulador. Liguei o `campinguim-a` (emulator-5554) e, ao fim, o desliguei no padrão (`font_scale 1.0`, `night no`, `wm` resetado). Usei `ambiente:zerar` e, no fim, `ambiente:parar`, ficando com 0 contêineres.

## Testes rodados pelo QA

| Comando (Node 24, no worktree) | Resultado |
| --- | --- |
| `npm run app:gerar` | exit 0 |
| `npm run testar -- --exigir-completa` (1ª, máquina livre) | **7 de 7**, exit 0: unitários **712/712**, servidor **109/109**, web **2/2**; "a árvore do repositório está limpa" em 0,6 s |
| `npm run testar -- --exigir-completa` (2ª, **com carga**: 10 processos ocupando a CPU por 150 s e o emulador ligando ao mesmo tempo) | **7 de 7**, exit 0, mesmos números. A suíte levou 102 s (contra 28 s livre), e a árvore limpa **3,0 s** |
| `npm run testar:jornadas -- fumaca` (APK do QA) | **3 de 3**: tela provisória, galeria e banco cifrado. O build local continua com `ambiente: 'local'` |

## Item 1 · teste da árvore limpa sob carga · resolvido

- A varredura ficou mais barata. Em vez de um `existsSync` por arquivo, faz duas chamadas `git ls-files` (`--deleted` para tirar os apagados) e não abre arquivos de mídia por extensão. Os demais continuam passando pelo critério de conteúdo.
- O teste ganhou limite próprio de 60 s, só para ele e com comentário.
- **O que ele trava não afrouxou:**
  - `https://algo.run.app` plantado num `.ts` novo em `scripts/` → o teste falha e aponta o arquivo;
  - `pages.dev` dentro de um `.svg` novo, que é texto e não está na lista de mídia → falha também.
  - Os dois plantios foram apagados.
- Avaliação do ponto que o ajudante pediu: o tempo continua dependendo da máquina. Na carga do QA, deu 3 s; na carga sintética extrema do ajudante, 48 s. O limite de 60 s é proporcional, porque um teste de varredura do repositório inteiro não tem como ser instantâneo. Basta para a Base. Se voltar a cair, o próximo passo é varrer só o que `git ls-files` lista como texto, ou deixar essa checagem só na etapa "Endereços" da suíte, que já faz a mesma varredura.

## Item 2 · `ambiente:parar` sem `.env.local` · resolvido

- Reproduzi o cenário da B3:
  - `ambiente:zerar` subiu 7 contêineres;
  - tirei o `.env.local` e rodei `ambiente:parar` → exit 0, **0 contêineres**;
  - um segundo `parar` → exit 0, 0 contêineres (idempotente).
- `ambiente:zerar` **sem** `.env.local` → exit 0. O arquivo foi regerado e os 7 contêineres ficaram de pé.
- **O valor fictício não chega a contêiner:**
  - ele só entra no `down` e só quando o arquivo falta (`paraParar`); o `up` não recebe nada;
  - procurei o texto nas variáveis de cada um dos 7 contêineres de pé (`docker inspect`): 0 ocorrências;
  - também não aparece na saída do script.
- Volumes: nenhum volume que já existia foi apagado. As rodadas de `zerar` deixaram volumes anônimos soltos (são 76 hoje, a maioria de antes desta feature). Fica como observação.

## Item 3 · ambiente fechado por padrão · resolvido

- `config.ts`: `extra.ambiente ?? 'producao'`. O tipo `Ambiente` é `'local' | 'producao'`, e o nome do ambiente fechado é uma chave de `config/enderecos.json` (testado).
- `config.test.ts` (5 testes) cobre: sem `expoConfig`; com `extra` sem `ambiente`; com `'local'`; com `'producao'`.
- `ferramentasDeDesenvolvimento.test.ts` (4 testes) usa o `config` verdadeiro e a árvore que o `ProvedorDoBanco` e o layout da galeria devolvem. O gancho (`VerificacaoPorLink`) e a galeria (`Slot`) só aparecem em `'local'`; fora dele, a galeria mostra só o aviso.
- **Defeitos plantados, todos pegos e desfeitos:**
  - padrão de volta para `?? 'local'` → 4 testes falham;
  - condição da galeria trocada por `if (false)` → 3 falham;
  - `AMBIENTE_LOCAL = true` no provedor → 3 falham.
- Ponto do ajudante, "o app.config.ts mantém 'local' para a suíte?": **sim**. `app.config.ts` grava `ambiente: 'local'` de forma fixa, e a fumaça 3 de 3 prova isso.

## Observação importante (não reprova; é para o piloto antes da primeira etiqueta de versão)

1. **`app.config.ts` grava `ambiente: 'local'` em todo build**, inclusive no APK que a esteira gera numa etiqueta de versão (`.github/workflows`, GIT-05). O padrão fechado de `config.ts` só vale se o build não informar o ambiente. Hoje todo build informa `local`. Então, do jeito que está, a 0.1.0 gerada pela esteira teria a galeria e o gancho de verificação do banco ligados, e apontaria para os endereços locais.
   - Isso não estava no pedido desta correção, e o ambiente `producao` ainda não existe (`enderecos.json` com `null`).
   - Precisa ficar resolvido antes da primeira etiqueta. Por exemplo, o `app.config.ts` escolhe o ambiente por uma variável do build (o padrão sendo o fechado, e `local` só para `app:gerar` e jornadas), e um teste confere que o build da esteira não sai `local`.
   - Sugiro que entre na lista de pendências da validação da Base.

## Outras observações (não reprovam)

2. Volumes anônimos do Docker se acumulam a cada `zerar` (76 soltos). Uma limpeza, `docker volume prune` só com o filtro do projeto, pode ficar para uma rodada de manutenção. Não apaguei nada.
3. O `.env.local` deste worktree foi regerado pelo `zerar` do QA. Ele é ignorado pelo git e corresponde ao ambiente que está parado.
4. A evidência `suite-completa.txt` contém a frase da própria trava ("run.app, pages.dev, workers.dev...") dentro de `docs/`, que é a pasta permitida. Não é endereço.
5. Coautoria dos commits: o squash é do orquestrador.

## Checagem G

Nenhum segredo, chave, `.env` com valor, e-mail pessoal, usuário do Windows nem caminho `C:\Users\...` no diff ou na árvore. Os domínios só aparecem no valor de configuração e na frase da trava citada acima. As evidências são só texto.

## Limpeza

Apaguei os temporários do QA na pasta temporária do sistema. As saídas das jornadas e da suíte ficaram em `test-results/`, que o git ignora. O emulador está desligado e no padrão. O ambiente local está parado, com 0 contêineres.

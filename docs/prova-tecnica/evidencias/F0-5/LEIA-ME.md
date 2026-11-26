# F0-5 · Verificação do aparelho, parte local (item 4 da prova)

24/11/2026 · ramo `feature/F0-5-verificacao` (a partir de `fb54ca9`) · plano: `docs/prova-tecnica/plano.md`, D, F0-5

**O item 4 continua PENDENTE.** Esta tarefa prova só a parte local: a recusa no servidor e a separação da biblioteca no app. Ela **não** prova que um token real do Google chega e é conferido. Isso é a F0-6, que espera a conta do Google Play (decisão do responsável, 24/11/2026).

IDs cobertos (parte local): DEF-04, FRD-04 (recusa sem atestado válido); DEF-05 (a regra roda no servidor); SPEC seção 2 (biblioteca atrás de interface própria), seção 8 (`integrity_required`, erros com `code` e `message` em português), seção 11 (verificação do aparelho; prova de desenvolvimento desligada por configuração, com teste). NF-03 não muda: nada da lista depende desta verificação.

## O que foi feito

| Peça | Onde |
| --- | --- |
| Função de servidor de teste `prova-chamada-protegida` (Supabase Edge Function). Sem verificação válida devolve **403 `{ code: "integrity_required", message: "Verificação do aparelho necessária." }`**. A resposta é sempre a mesma: o motivo fica só no registro interno. | `prova/servidor/supabase/functions/prova-chamada-protegida/index.ts` |
| Regra da chamada protegida, sem rede nem banco (testável) | `…/functions/_verificacao/servico.ts` |
| Avaliação do veredito no formato oficial da Play Integrity (pedido padrão). Aceita só com `PLAY_RECOGNIZED`, nosso pacote, nosso certificado, `LICENSED` e `MEETS_DEVICE_INTEGRITY` ou `MEETS_STRONG_INTEGRITY`; confere antes pacote, resumo do pedido e idade do token | `…/_verificacao/veredito.ts` |
| Interface do servidor para abrir o token. A real (`decodeIntegrityToken` do Google) **recusa todo token até a F0-6**. O dublê de teste existe só no local | `…/_verificacao/decodificador.ts` |
| Configuração que falha fechado: sem variável, vale produção; prova de desenvolvimento e dublê só com `AMBIENTE=local` **e** a chave ligada | `…/_verificacao/configuracao.ts`; modelo de produção em `prova/servidor/config/verificacao-producao.env.example` |
| Repetição (replay): cada token vale uma vez; o banco guarda só o SHA-256 do token | `…/_verificacao/repositorio-rest.ts` |
| Migração nova com 3 tabelas (`device`, `integrity_token_used`, `integrity_attempt`), **RLS ativo na mesma migração**, nenhuma política e nenhuma permissão para `anon` e `authenticated` | `prova/servidor/supabase/migrations/20261124210000_f0_5_verificacao.sql` |
| Função sem login (`verify_jwt: false`): o app da prova não tem login; a proteção é a prova de integridade | `prova/servidor/supabase/config.jsonc`, seção `functions` |
| No app: resumo do pedido (SHA-256, igual ao do servidor), chamada à função só pela interface própria, tela que mostra a recusa. Textos em `src/textos.ts` | `prova/app/src/verificacao/resumo.ts`, `prova/app/src/servidor/chamadaProtegida.ts`, `prova/app/app/verificacao.tsx` (abre por `campinguim://verificacao`) |
| Pilha paralela do Supabase (outra `project_id`, outras portas) para rodar junto da F0-2 | `prova/servidor/scripts/pilha-paralela.mjs` |

Nada foi mudado em `package.json`, `app.config.ts` nem na migração base.

## Ambiente usado (sem chaves)

- Pilha própria: `project_id` **`campinguim-f0-5`**, portas **+1000** sobre as padrão: API 55321, banco 55322, banco-sombra 55320, pooler 55329, Studio 55323, Mailpit 55324, analytics 55327, inspetor das funções 9083. Só 5 contêineres (banco, auth, REST, Kong e funções); os mesmos serviços desligados que o `prova.mjs` desliga.
- O `config.jsonc` versionado não muda: o script copia `prova/servidor/supabase` para uma pasta temporária do sistema, troca `project_id` e portas, e sobe dali. Credenciais em `prova/.env.local` do checkout (fora do git); a configuração da verificação em `functions/.env` da cópia temporária (fora do git). O segredo do dublê é gerado ao acaso a cada subida e nunca exibido.
- Configuração da função na pilha local: `AMBIENTE=local`, `VERIFICACAO_ACEITAR_DESENVOLVIMENTO=nao` (padrão desligado), dublê ligado, pacote provisório `com.campinguim.prova` (H6), certificado de teste que só o dublê usa.
- Emulador de captura `campinguim-c` (imagem API 36 Google APIs x86_64, 2 GB de RAM), criado só para a captura e apagado depois. Os emuladores `campinguim-a` e `campinguim-b` não foram tocados.

## Como repetir

Sempre com o Node do sistema (`"C:\Program Files\nodejs\node.exe"`, abaixo `node`), em `prova/servidor`:

```
node scripts/pilha-paralela.mjs subir      # pilha campinguim-f0-5, usuários de teste e dublê
node --test --test-reporter=spec "testes/*.test.mjs"
node scripts/pilha-paralela.mjs derrubar   # apaga contêineres, volumes, pasta temporária e .env.local
```

`testes/verificacao.test.mjs` e `testes/verificacao-app.test.mjs` rodam sem pilha nenhuma. Na pilha padrão (`prova.mjs`, sem dublê), `verificacao-servidor.test.mjs` pula os casos que precisam de token e roda o resto.

## Resultados

Saídas completas em `testes.txt`. Resumo:

| Conjunto | Resultado |
| --- | --- |
| Regra, veredito e configuração, sem rede (`verificacao.test.mjs`) | **51 de 51** |
| Servidor de verdade, por HTTP, com o banco conferido (`verificacao-servidor.test.mjs`) | **16 de 16** |
| Lado do app: isolamento da biblioteca e resumo igual ao do servidor (`verificacao-app.test.mjs`) | **3 de 3** |
| Suíte inteira da prova na pilha da F0-5 (inclui os 19 da F0-1: RLS, acesso entre viagens, configuração) | **89 de 89** |
| Conferência dos testes ao contrário: 5 regras quebradas de propósito, uma por vez | **5 de 5 pegas** (cada uma derruba de 1 a 5 testes); o código voltou ao original e passa 51 de 51 |

Casos negativos pedidos, todos com `integrity_required` e o motivo conferido no registro interno:

| Caso | Motivo registrado | Sem rede | Servidor |
| --- | --- | --- | --- |
| Sem token | `sem_prova` | ok | ok |
| Token inválido | `token_invalido` | ok | ok |
| Token vencido | `token_vencido` | ok | ok |
| Pacote errado | `pacote_do_pedido_diferente` (e `pacote_do_app_diferente`) | ok | ok |
| Assinatura errada: token assinado com outra chave, ou adulterado | `assinatura_invalida` | ok | ok |
| Assinatura do app errada (outro certificado) | `certificado_diferente` | ok | ok |
| Repetição (replay) | `token_repetido` | ok | ok |
| Prova de outro pedido | `resumo_do_pedido_diferente` | ok | ok |
| `UNRECOGNIZED_VERSION`, `UNEVALUATED`, `UNLICENSED`, aparelho vazio, só `MEETS_BASIC_INTEGRITY`, `MEETS_VIRTUAL_INTEGRITY`, veredito limpo pelo Google | um motivo para cada | ok | ok (amostra: `UNRECOGNIZED_VERSION`, `UNLICENSED`, aparelho vazio) |
| Prova de desenvolvimento com a aceitação desligada (padrão) | `prova_desenvolvimento_desligada` | ok | ok |
| Prova de desenvolvimento em produção, mesmo com a chave ligada | `prova_desenvolvimento_desligada` | ok | — |
| Produção hoje, sem a conta do Google Play | `decodificador_indisponivel` | ok | — |
| Aparelho verificado com o prazo vencido | `marca_do_aparelho_vencida` | ok | ok |

**Sobre o que é aceito nos testes.** Para mostrar que o servidor não recusa tudo, há casos aceitos: (1) o **DUBLÊ DE TESTE** com um veredito bom **de exemplo**, montado pelos testes no formato oficial e assinado com um segredo local; (2) a prova de desenvolvimento com a aceitação ligada, só no local; (3) a marca de aparelho verificado dentro do prazo. **Nenhum deles é um token da Play nem prova nada sobre o Google.** O dublê só existe com `AMBIENTE=local` e a chave ligada; em produção a configuração força o decodificador do Google (teste automático). O controle positivo de verdade é o caso (d) da F0-6, em celular real instalado pela Play.

## Captura do app recebendo a recusa

`captura-recusa.png`: tela "Verificação do aparelho" no emulador `campinguim-c`, depois de tocar em "Chamar com a prova deste aparelho". O app manda a prova de desenvolvimento (marcada como falsa), o servidor local a recusa porque a aceitação está desligada, e a tela mostra a mensagem e o código `integrity_required`. Detalhes da captura em `captura.txt`.

## Busca pelo nome da biblioteca

`busca-biblioteca.txt`. Só `prova/app/src/verificacao/expo.ts` importa `@expo/app-integrity` (além da declaração em `package.json`). Só `src/verificacao/index.ts` carrega `./expo`. O resto do app (`src/servidor/chamadaProtegida.ts`) usa só a interface (`../verificacao`). O mesmo é conferido por teste automático (`verificacao-app.test.mjs`).

## O que fica para a F0-6 (com a conta do Google Play)

1. Escrever a chamada real no `DecodificadorGooglePendente`: `playintegrity.googleapis.com/v1/<pacote>:decodeIntegrityToken` com `{ integrity_token }`, acesso da conta de serviço com o escopo da Play Integrity. Hoje ele recusa tudo.
2. Ligar no app a implementação real (`src/verificacao/expo.ts`): `criarVerificacao(numeroDoProjetoCloud)` com `verificacaoDesenvolvimento: false` no `app.config.ts` (arquivo do orquestrador) e o número do projeto Cloud.
3. Preencher a configuração de produção (`verificacao-producao.env.example`): pacote definitivo e o resumo SHA-256 do certificado de assinatura de apps da Play (a função aceita o formato da Play Console, `AB:CD:…`).
4. Conferir num token real o formato de `certificateSha256Digest`: a página oficial diz "base64-encoded URL-safe", mas o exemplo da mesma página tem só caracteres hexadecimais. A comparação aqui usa base64 URL sem preenchimento.
5. Servidor alcançável pelo celular físico para o controle positivo (J4).
6. Casos (a) a (d) da F0-6 e, opcional, (e) respostas de teste do Play Console.

## Pendências do responsável (registradas, sem decisão)

- **H11:** conta de desenvolvedor do Google Play (taxa, contrato, identidade, celular físico).
- **H12:** projeto no Google Cloud vinculado à Play Integrity pelo Play Console, e **conta de serviço** para o servidor conferir o token (a chave vai para o cofre de segredos do serviço, nunca para o git); faturamento no Google Cloud não confirmado.
- **H6:** nome definitivo do pacote Android (hoje `com.campinguim.prova`, provisório).
- **H14 / J4:** como o celular físico alcança o servidor no controle positivo.
- **Premissas a decidir** (a SPEC diz só "tempo limitado"; os valores estão em configuração): validade da marca de aparelho verificado, **24 horas**; idade máxima do token, **5 minutos** (a documentação recomenda conferir a idade, mas não dá valor); tolerância de relógio para o futuro, **1 minuto**.

## Limites e observações

- O `install_id` da prova é gerado a cada abertura do app e não é ligado a uma conta. Quem souber o `install_id` de um aparelho verificado passa pela marca até ela vencer. Guardar o identificador no aparelho, usar gerador seguro e ligar a marca à conta fica para a feature 3.7 (SPEC, seção 14).
- O SHA-256 do app foi escrito em TypeScript (sem biblioteca nativa nova, porque `package.json` é do orquestrador); um teste confere com o SHA-256 do Node e com o do servidor, inclusive com acentos e emoji.
- O teste que importa `prova/app/src/verificacao/resumo.ts` mostra um aviso do Node (`MODULE_TYPELESS_PACKAGE_JSON`): o `package.json` do app não declara `"type"`. Não afeta o resultado; mudar é do orquestrador.
- Para o build da captura, `prova/config/enderecos.json` teve `portaApi` trocada para 55321 **só no disco, durante o build**, e voltou a 54321 antes do commit (o app precisa apontar para a pilha da F0-5). Nenhuma outra configuração foi alterada.

# Campinguim

App de checklist para camping (com "m": camping + pinguim). Android durante o desenvolvimento; iPhone só na versão 1.0.0.

Este arquivo vale para todo agente, em toda missão. O objetivo de cada missão vem no texto da missão, não daqui.

## Leia antes de agir

| Arquivo | Para quê |
| --- | --- |
| `docs/PRD.md` | O que construir e por quê. Requisitos com ID (E1-01, DEF-03, GIT-05...). |
| `docs/SPEC.md` | Como construir: arquitetura, dados, regras de cálculo, testes, ordem das features. |
| `docs/brief-cinema-1-mascote.md` | Pedido dos 10 mascotes. |
| `docs/brief-cinema-2-prototipos.md` | Pedido dos 5 protótipos navegáveis. |
| `docs/DESIGN.md` | Identidade visual. Só existe depois que o protótipo for escolhido. |

Se PRD e spec divergem, vale o PRD, e a divergência é avisada ao orquestrador antes de qualquer código.
Se falta informação, pare e pergunte. Não invente regra de negócio, conteúdo de lista nem texto legal.

## Ordem do projeto

1. Mascote escolhido pelo responsável (brief 1).
2. Protótipo escolhido pelo responsável (brief 2). A Cinema então escreve `docs/DESIGN.md`.
3. Prova técnica (F0 da spec, seção 14).
4. Base, etapa 1 (0.1.0), etapa 2 (0.2.0), etapa 3 (0.3.0), lançamento (1.0.0).

Nenhum código do app começa antes dos passos 1 e 2. Ao fim de cada etapa, o trabalho para e aguarda validação humana.

## Papéis e fluxo

- Orquestrador: Fable 5.2, esforço alto. Cria cada tarefa e escolhe modelo e esforço do agente.
- QA: Opus 5.5, esforço alto, sempre ativo.
- Cinema: squad de design, chamada pelo orquestrador.
- Fluxo: o orquestrador cria a tarefa, o agente faz e entrega ao QA. Reprovado volta direto ao agente. Aprovado, o QA avisa o orquestrador.
- Na terceira reprovação seguida da mesma tarefa, o QA avisa o orquestrador.
- No máximo 6 painéis além do orquestrador e do QA, contando os da Cinema. Sem vaga, espera.
- Qualidade vem antes de velocidade. Na dúvida sobre modelo ou esforço, o mais alto.

## Regras de trabalho

1. Mexa só nas pastas listadas na sua tarefa.
2. Ao terminar, apague seus arquivos temporários. O orquestrador fecha o painel e confere a limpeza.
3. Teste local tudo o que der. O GitHub não roda testes durante o desenvolvimento.
4. Git: um ramo por feature, commits locais durante o ciclo com o QA, um único commit aprovado sobe com o ID da feature. O ramo principal é protegido. A esteira do GitHub roda só em marca de versão.
5. Textos da interface em português do Brasil, em arquivo de textos, nunca soltos no código.
6. Não use marcas, personagens nem imagens de terceiros.

## Segurança (não negociável)

- Toda tabela do Postgres nasce com RLS ativo, na mesma migração que a cria.
- Dados de camping nunca vão em lote para o aparelho. O app recebe só o resultado das funções do servidor.
- Nenhuma senha ou chave secreta em arquivo versionado, conversa, registro, captura de tela ou commit.
- O banco só muda por migração versionada. Nada de alterar tabela à mão no painel.
- O app não pede CPF, telefone nem localização.
- O endereço do site vem de um único valor de configuração. `run.app` não aparece em nenhum outro lugar do código.

## Serviços externos

O agente configura sozinho pelo Chrome do responsável (Supabase, sincronização, login com Google, Google Play, GitHub, Cloud Run) e registra o que fez em `docs/infra.md`, sem segredos.

Pare e chame o responsável só para:

- login, senha ou código de verificação;
- pagamento, cartão ou plano pago;
- aceite de contrato ou termos;
- verificação de identidade;
- ação que apaga dados ou não tem volta.

## Estrutura do repositório

```
apps/mobile      app (React Native + Expo + TypeScript)
apps/web         página do convidado e site
packages/core    regras puras: lista, cotas, alertas
packages/content catálogo de itens e textos
supabase/        migrações, políticas e funções do servidor
e2e/             jornadas automatizadas
docs/            PRD, spec, briefs, DESIGN.md, infra.md
```

## Entrega ao QA

Toda entrega informa: ID da feature, IDs do PRD cobertos, o que foi alterado, resultado dos testes locais e evidências (capturas de tela das jornadas, quando houver tela).

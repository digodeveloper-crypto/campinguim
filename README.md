# Campinguim

App de checklist para camping: monta a lista da viagem, ajuda a separar e conferir tudo antes de sair e na volta, e organiza o grupo e os gastos. Funciona sem internet.

Projeto em desenvolvimento. Android durante o desenvolvimento; iPhone a partir da versão 1.0.0.

## Pastas

| Pasta | O que tem |
| --- | --- |
| `apps/mobile` | App (React Native, Expo, TypeScript) |
| `apps/web` | Página do convidado e site |
| `packages/core` | Regras puras: lista, cotas, alertas |
| `packages/content` | Catálogo de itens em arquivos de dados |
| `supabase/` | Servidor local: migrações, funções, sincronização |
| `e2e/` | Jornadas automatizadas e testes da página web |
| `docs/` | PRD, especificação, identidade visual, infraestrutura |

## Começar

```
npm install
npm run ambiente:subir
npm run testar
```

Passo a passo completo, requisitos da máquina e todos os comandos: [`docs/desenvolvimento.md`](docs/desenvolvimento.md).

## Direitos

Todos os direitos reservados. Este repositório não tem licença de uso.

# Mudanças por versão

Registro do que mudou em cada versão do Campinguim, com as features por ID (GIT-07). Cada versão aponta para os documentos que a originaram (GIT-09): PRD, SPEC e catálogo estão versionados junto com o código, então a etiqueta da versão marca também a versão deles.

A versão é criada pelo orquestrador com aprovação humana (GIT-06). Cada feature aprovada pelo QA e integrada ao `main` entra primeiro em "Ainda sem versão" e passa para a versão seguinte quando a etiqueta é criada.

## Ainda sem versão (rumo à 0.1.0)

### Prova técnica e base

| ID | Feature | Requisitos |
| --- | --- | --- |
| F0 | Prova técnica (sincronização offline, lembrete em modo avião, app aberto por link; verificação do aparelho com a parte da loja pendente) | SPEC, seção 2 |
| B1 | Repositório, scripts locais de teste e ambiente em Docker | GIT-10, GIT-11 (e GIT-05, GIT-07, GIT-08, GIT-09) |
| B1-FIX | Correção da B1: o teste da esteira falhava em todo checkout novo no Windows por causa do fim de linha CRLF; `.github/**` fixado em LF e leitura do teste tolerante a `\r?\n` | GIT-05, GIT-10 |
| B6 | Arquivo de textos por tela (app e página), formatação em reais e datas brasileiras, eventos de medição com validação e registro no aparelho | NF-09, DAT-04, DAT-05, RET-09, RET-10 (SPEC, seção 12) |

Documentos de referência: `docs/PRD.md`, `docs/SPEC.md`, `docs/DESIGN.md`, `docs/prova-tecnica/resultado.md`.

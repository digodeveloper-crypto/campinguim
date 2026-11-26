# Conteúdo (`packages/content`)

Catálogos do Campinguim em arquivos de dados, versionados junto com o código (GIT-09). Este pacote não tem regra nem tela: quem lê e valida os dados é o `packages/core` (B3).

| Pasta | O que vai nela | Quem preenche |
| --- | --- | --- |
| `catalogo/` | Catálogo de itens e regras de quantidade da SPEC, seção 5, um arquivo JSON por tabela da seção | B3 |
| `esquemas/` | Esquema JSON (draft 2020-12) de cada arquivo de `catalogo/`, para validar o formato no teste | B3 |

Formato combinado na B1:

- Um arquivo `.json` por assunto, em UTF-8, nome em minúsculas com hífen (`itens.json`, `quantidades.json`).
- Todo arquivo de `catalogo/` tem o campo `"versao"` (número inteiro, começa em 1) e o esquema correspondente em `esquemas/<nome>.schema.json`.
- Textos para a pessoa ficam em português do Brasil; chaves e identificadores em `snake_case` sem acento.
- Nenhum conteúdo é inventado: tudo vem da SPEC (seções 5 e 6) ou de decisão registrada do responsável.

Na B1 as pastas estão vazias de propósito.

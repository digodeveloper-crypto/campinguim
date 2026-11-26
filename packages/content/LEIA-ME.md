# Conteúdo (`packages/content`)

Catálogos do Campinguim em arquivos de dados, versionados junto com o código (GIT-09). Este pacote não tem regra nem tela: quem lê e valida os dados é o `packages/core` (`carregarCatalogo()` em `packages/core/src/catalogo.ts`). Como o motor usa estes arquivos está em `docs/regras.md`.

| Arquivo | O que tem | Fonte |
| --- | --- | --- |
| `catalogo/itens.json` | Variáveis da viagem, unidades, categorias, exclusões por tipo de viagem e os itens da lista com condição (`when`) e quantidade (`qty`) | SPEC, seção 5 |
| `catalogo/tarefas.json` | Tarefas de véspera (E1-08) e da volta (E1-10) | SPEC, seção 5 |
| `catalogo/alertas.json` | Textos-base dos alertas da ficha, textos das tarefas de ajuste e rótulos de horário | SPEC, seção 6 |
| `esquemas/<nome>.schema.json` | Esquema JSON (draft 2020-12) de cada arquivo acima | — |

Formato:

- Um arquivo `.json` por assunto, em UTF-8, nome em minúsculas com hífen.
- Todo arquivo de `catalogo/` tem o campo `"versao"` (número inteiro, começa em 1) e o esquema correspondente em `esquemas/<nome>.schema.json`.
- Textos para a pessoa ficam em português do Brasil; chaves e identificadores em `snake_case` sem acento.
- Cada item de `itens.json` tem `key`, `name`, `category`, `scope` (`pessoa`, `familia` ou `grupo`), `when`, `qty`, `unit`, `dependsOnCamping` e `consumivel`, como pede a SPEC (seção 5, "Formato do arquivo"). Tarefas ("Tarefa: conferir") têm `qty` nulo e o campo `tarefa`. `entraQuandoSpec` e `quantidadeSpec` guardam o texto das colunas da SPEC, para o teste conferir a transcrição.
- `when` e `qty` são expressões lidas por um interpretador pequeno (`packages/core/src/expressao.ts`), sem execução de código livre: números, variáveis do bloco `variaveis`, textos entre aspas simples, `+ - * /`, comparações, `e`, `ou`, `nao`, `sempre`, `teto(x)` e `se(condição, a, b)`.
- Nenhum conteúdo é inventado: tudo vem da SPEC (seções 5 e 6) ou de decisão registrada do responsável. O teste `packages/core/src/catalogo.test.ts` lê as tabelas da SPEC e falha se faltar, sobrar ou mudar qualquer item.

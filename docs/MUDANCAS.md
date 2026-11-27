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
| B1-FIX-2 | Três ajustes da esteira local: o teste da árvore limpa dos endereços ficou mais barato e ganhou limite próprio (não cai mais com a máquina ocupada); `ambiente:parar` funciona sem `.env.local`; o ambiente do app, quando não informado, é o fechado (`producao`), com teste de que a galeria e o gancho de verificação do banco só existem no ambiente local | GIT-10, GIT-11, DEF-11 |
| B6 | Arquivo de textos por tela (app e página), formatação em reais e datas brasileiras, eventos de medição com validação e registro no aparelho | NF-09, DAT-04, DAT-05, RET-09, RET-10 (SPEC, seção 12) |
| B3 | Motor de regras e catálogo da lista: geração e recálculo, cotas, aprendizado, alertas, frescor e duplicados como funções puras, com os casos da SPEC, seção 9 (`docs/regras.md`) | SPEC, seções 5 e 9 (E1-02, E1-03, E1-04, E1-11, E1-12, E2-09 a E2-13; regras puras de E3-05 a E3-09, E3-16, E3-17, E3-20 a E3-24) |
| B5 | Esquema do servidor e autorização: tabelas da SPEC seção 3 com RLS, aplicação das alterações vindas do aparelho, regras de sincronização, verificação do aparelho (esboço), dados de exemplo | NF-10, DEF-01, DEF-05, DEF-08, DEF-09, DEF-11, PRV-01, PRV-02, PRV-06, FRD-01 a FRD-05 (estrutura) |
| B4 | Banco local cifrado (SQLCipher, chave no cofre do sistema), esquema local da seção 3 (com os campos pedidos pela B3 e os técnicos do B5), migrações das tabelas só locais e camada de acesso | DEF-11, NF-03 (base local), DEF-09; SPEC, seções 3, 4, 11 e 12 |
| B2 | Componentes visuais a partir do protótipo Rumo (tema claro e escuro, tipografia, ícones, mascote, componentes 7.1 a 7.10, galeria; `docs/componentes.md`) | DSG-06, NF-07, NF-08 |
| BASE-VAL | Validação humana da Base (27/11/2026) e decisões V1 a V11 do responsável: regra de sobras, escolhas visuais, faixas e canais de medição, rótulo do login com Google, adiamento da conta do Google Play, pendências técnicas T0 a T13 (`docs/decisoes-da-base.md`, `docs/qa/BASE-conferencia-final.md`) | DSG-06, NF-09, PRV-04 (só registro) |
| 1.12 | Página inicial do site com lista de espera (partes A e B, locais): o que é, mascote, lista de exemplo gerada pelo motor do core, formulário só com e-mail e consentimento obrigatório (rascunho legal marcado, formulário travado fora do ambiente local enquanto for rascunho), campo armadilha, `noindex, nofollow`; no servidor, tabela `waitlist` com RLS e sem política e `waitlist_join` com limite por endereço de rede; SPEC seções 3, 8, 11 e 14 atualizadas (R3, R4) | PRD seção 18; PRV-01; DEF-02; NF-02; NF-07; NF-08; GIT-17; SPEC, seções 7 e 8 (`waitlist_join`) |

Documentos de referência: `docs/PRD.md`, `docs/SPEC.md`, `docs/DESIGN.md`, `docs/prova-tecnica/resultado.md`, `docs/decisoes-da-base.md`.

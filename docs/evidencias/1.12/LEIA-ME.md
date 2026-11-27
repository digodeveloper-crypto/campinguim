# Evidências da feature 1.12 (página inicial do site com lista de espera)

27/11/2026, worktree da 1.12, ramo `feature/1.12-site-lista-de-espera`, sobre o `main` 530e9a1.

## Suíte local (`npm run testar -- --exigir-completa`), código de saída 0

```
passou  Trava de segredos (GIT-08)
passou  Endereços só no arquivo de configuração (SPEC 14)
passou  Tipos (TypeScript estrito)                              5 de 5 projetos sem erro
passou  Lint (ESLint, sem aviso tolerado)
passou  Testes unitários: regras puras e travas do repositório   752 de 752 testes passaram
passou  Testes do servidor (ambiente local)                     137 de 137 testes passaram
passou  Página web (Chromium e WebKit)                          32 de 32 testes passaram
SUÍTE COMPLETA: todas as 7 etapas passaram.
```

Ambiente Docker no ar e APK gerado na hora (`npm run app:gerar`). Depois, `npm run ambiente:zerar` (banco recriado só pelas migrações, com a nova) e os testes do servidor de novo: 137 de 137.

Servidor da lista de espera: `supabase/testes/lista-de-espera.test.ts`, 28 testes (grava e-mail normalizado e consentimento; repetido não duplica nem revela; sem consentimento e e-mail inválido recusam; RLS ativo, sem política, fora da publicação; `anon` e `authenticated` não leem nem escrevem direto; limite por endereço, inclusive com endereço inventado no cabeçalho; evento interno uma vez por hora; só o resumo do endereço é guardado; chamada pela API com a chave pública). Os dois testes de RLS da SPEC, seção 11, estão em `rls.test.ts` (toda tabela com RLS; nenhuma protegida com política) e `sincronizacao.test.ts`.

## Capturas (geradas por `EVIDENCIAS=1 npx playwright test`)

Cada arquivo existe nos dois motores: `android-chromium-*` (Pixel 7) e `iphone-webkit-*` (iPhone 15). A resposta do servidor é simulada no teste da página; e-mails só do domínio `.test`.

| Captura | O que mostra |
| --- | --- |
| `01-topo` | Régua de seções, curvas de nível, mascote em 136 px, letreiro, a frase do que é e o que o app faz |
| `02-lista-de-exemplo` | Categorias recolhíveis com a contagem; "Comida e bebida" aberta, com a água em litros e galões |
| `03-email-vazio` | Erro com ícone e texto, campo marcado como inválido |
| `04-sem-consentimento` | Caixa desmarcada: "Marque a caixa acima para entrar na lista." (nada é enviado) |
| `05-pronto` | Envio aceito: "Pronto. Avisaremos por e-mail." |
| `06-sem-conexao` | Falha de rede: o que fazer, com o e-mail e a caixa mantidos |
| `07-tema-claro`, `07-tema-escuro` | Tema do sistema; no escuro, o mascote sobre o papel de canto cortado |
| `08-letra-130`, `08-letra-200` | Letra ampliada, sem corte e sem rolagem para o lado |

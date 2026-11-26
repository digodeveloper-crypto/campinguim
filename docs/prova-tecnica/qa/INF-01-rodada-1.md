# INF-01 · conta da Cloudflare · rodada 1 · REPROVADO (2 itens)

Data: 2026-11-24 · Conferido por: QA (pane-646)
Base: pedido do piloto (seção "Cloudflare" de `docs/infra.md` sem token, chave, e-mail ou telefone; nada comprado nem criado além do autorizado; 2FA registrada como ativa ou como pendência do responsável, com o caminho; captura sem dado pessoal); `CLAUDE.md` (serviços registrados em `docs/infra.md` sem segredos); plano, G ("Repositório público (H4): tudo o que é enviado fica aberto, inclusive `docs/infra.md`").

## O que passou

| Ponto | Resultado | Como o QA conferiu |
| --- | --- | --- |
| Página reservada | ok. `https://campinguim.pages.dev` responde HTTP 200, `text/html`, 220 bytes. A página é em branco: `<title>` vazio, `<body>` vazio, `noindex`. Sem texto, logo nem marca | `curl` com o DNS público |
| Nada comprado; sem domínio, zona, DNS, Worker ou token | ok, pelo registro. A reserva por envio direto está registrada como decisão do orquestrador, depois do pedido do responsável ("dominio gratis deles") | leitura |
| Sem token, chave, e-mail, telefone, nome real ou ID da conta | ok. 0 e-mails, 0 nome real, 0 nome de usuário do Windows, 0 sequências com cara de ID ou chave | busca |
| Fontes oficiais com data; "não confirmado" onde cabe | ok. Também está registrada a divergência com a SPEC (`run.app` → `pages.dev`), com PROPOSTA ao orquestrador | leitura |
| Sem captura | ok, com o motivo registrado | — |

## Itens que reprovam

O `docs/infra.md` vai para o **repositório público** (H4; o arquivo já está no ramo da prova, no commit `59c051c`). A nova seção expõe dados que não são do Campinguim e que ajudam um atacante.

| # | Onde | Problema | O que fazer |
| --- | --- | --- | --- |
| 1 | "Estado da conta" e "Subdomínio da conta" | Descreve **outros projetos e a cobrança do responsável**: o nome de um Worker de outro projeto; os nomes de 3 tokens de API, um deles ligado a um domínio de outro projeto; as assinaturas R2 e Zero Trust, com data de renovação; o cartão salvo; o alerta de cobrança; o número de domínios, Pages e Workers; a forma de login (Google, com Apple e GitHub não conectados); o número de membros. Nada disso é do Campinguim, e publicar dá um mapa da conta pessoal dele | Deixar só o que é do Campinguim, por exemplo: "A conta é do responsável e tem outros projetos dele; nada deles foi mexido. Nenhum token foi criado nem usado. O subdomínio `workers.dev` da conta já tem outro nome, por isso o caminho é o Pages." Tirar os nomes, as contagens, as assinaturas, o cartão, o alerta e a forma de login. O mesmo cuidado vale para o item 4 da PROPOSTA ("conta que mistura outros projetos"): pode ficar, sem detalhes |
| 2 | "Verificação em duas etapas (2FA): INATIVA" | Publicar que a conta **não tem 2FA**, que nenhum método está ligado e que o login é pelo Google é informar a qualquer pessoa onde a conta está fraca | No arquivo versionado, registrar só "2FA: pendência do responsável", com o caminho para ativar, que é genérico e pode ficar. Tirar "Inactive", a lista de métodos desligados e a ressalva sobre o login pelo Google. O estado real vai ao piloto pela entrega, não pelo repositório |

Depois da correção: rodar de novo a busca por e-mail, nome real e ID, e conferir que a seção não cita nenhum nome de outro projeto.

## Observações (não reprovam)

1. A ressalva sobre o envio direto é importante e está bem registrada: o projeto não vira Git depois, e apagar e recriar é ação sem volta, que exige o aval do responsável. A dúvida sobre o nome voltar a ficar livre depois de apagar está como "não confirmado".
2. A PROPOSTA de estender o teste de "`run.app` em lugar nenhum" a `pages.dev` e `workers.dev` é do orquestrador. Hoje `prova/config/enderecos.json` aponta para `https://campinguim.test`, então nada muda na prova.

---

# Rodada 2 · 2026-11-24 · REPROVADO (1 item, pequeno)

**O que passou:**
- **Item 1 resolvido.** Saíram a tabela "Estado da conta", os nomes de Worker e de tokens, as assinaturas, o cartão, o alerta de cobrança, as contagens, a forma de login e o número de membros. O "Registro da conta" diz só o que é do Campinguim e avisa: "este arquivo é público". A busca por nome de outro projeto, token, R2, Zero Trust, cartão, cobrança, Inactive, Global API e membros deu 0 resultados que identifiquem algo. Sobram só a palavra "cartão" (a documentação do plano Free e o painel não pediram cartão) e "Google Authenticator" como exemplo de aplicativo. E-mail, nome real e ID: 0.
- **Item 2 resolvido.** A 2FA aparece só como pendência, com o caminho. O texto não diz mais o estado atual da conta. A frase "se o acesso for pelo Google…" é condicional e genérica: pode ficar.
- O arquivo segue fora de commit. A versão anterior nunca entrou no histórico (o `59c051c` tem só a seção do GitHub).

**Item que reprova:**

| # | Onde | Problema | O que fazer |
| --- | --- | --- | --- |
| 1 | "Pendência do responsável: verificação em duas etapas", 1ª frase | "O CLAUDE.md exige a verificação em duas etapas ativa em todas as contas." O `CLAUDE.md` não traz essa regra. Ela está na **SPEC, seção 14, "Regras da configuração", item 4**: "Verificação em duas etapas ativa em todas as contas: Supabase, GitHub e Google; no lançamento, também o registrador do domínio". Como o arquivo é a referência dos serviços, uma regra atribuída ao documento errado engana as próximas tarefas | Trocar a fonte para a SPEC, seção 14, item 4, citando a frase. A SPEC não cita a Cloudflare: ela entra como "todas as contas", e como registrador do domínio se for usada assim na 1.0.0. Se quiser, acrescente que o item 7 da mesma lista pede a evidência da 2FA ativa ao QA antes de liberar a feature que usar a conta |

---

# Rodada 3 · 2026-11-24 · APROVADO

- **Item 1 da rodada 2 resolvido.** A 2FA agora cita a SPEC, seção 14, bloco "Configuração dos serviços externos", regra 4. O QA conferiu o nome do bloco e a regra na própria SPEC. O texto registra que a regra nomeia Supabase, GitHub, Google e o registrador do domínio, e não a Cloudflare, e que o orquestrador confirma se vale para ela. Não sobrou nenhuma citação errada ao `CLAUDE.md`. A outra citação, a do valor único de configuração do endereço, está certa: vem da seção "Segurança" do `CLAUDE.md`.
- E-mail e nome real: 0. A seção continua sem nada de outros projetos nem de cobrança, e o arquivo segue fora de commit.
- **Para o orquestrador:** confirmar se a regra 4 da SPEC vale para a Cloudflare. Ela deve valer, porque o site provisório fica nela. Enquanto isso, a 2FA continua como pendência do responsável. Pela regra 7, a evidência da 2FA ativa é cobrada pelo QA antes de liberar a feature que publicar o site na Cloudflare.

---

# Rodada 4 · 2026-11-24 · APROVADO (2FA ativa)

- **O registro bate com a leitura informada ao QA fora do arquivo.** O painel mostra a etiqueta "Active", e o método ativo é o código por e-mail; aplicativo e chave física não estão configurados. O arquivo diz só "ativa", sem dizer qual método está ligado ou desligado. Cita a regra 4 da SPEC §14, com a decisão do orquestrador de que vale para a Cloudflare, e a regra 7, pela qual o QA cobra a evidência antes da feature que publicar o site. A linha "Situação" diz "concluída, sem pendência".
- Nada vazou: 0 e-mails pessoais, 0 nome real, 0 ID. As palavras sobre e-mail no arquivo são só da seção do GitHub (noreply). Arquivo sem commit.
- **Evidência:** a leitura do painel pelo agente, sem captura, porque a tela mostra o e-mail. O QA aceita para esta tarefa. Na feature que publicar o site na Cloudflare (regra 7), o QA vai pedir uma evidência que possa repetir. Por exemplo, a leitura do texto da página de autenticação com o e-mail mascarado.

**Observação (não reprova):** a frase "a conta passa a pedir um código do celular" descreve o aplicativo, não o método ligado hoje, que é o código por e-mail. Não vaza nada, mas fica mais exata como "a conta passa a pedir um código além da senha". O reforço com aplicativo, recomendado pelo piloto, fica com o responsável. Vale lembrar que o código por e-mail só protege tanto quanto a própria caixa de e-mail.

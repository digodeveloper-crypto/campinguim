# Redes sociais do Campinguim · SOC-01

Configuração dos perfis do Instagram e do TikTok, feita pelo Chrome do responsável, que já estava logado nas duas redes.

- **Data:** 24/11/2026.
- **Pedido do responsável:** "estou logado no tiktok e instagram abre ajudante para configurar tudo bonitinho sobre o app e colocar logo etc".
- **Logo:** a opção 01, o pinguim sozinho (`design/marca/LEIA-ME.md`). Arquivos em `design/marca/perfil/`.
- **Bio:** só o que o PRD diz (seção 1: o app monta a lista do que levar para acampar; persona Carla: "não esquecer nada na saída"), no tom do DESIGN.md, seção 10: verbo no presente, sem adjetivo, sem exclamação, sem emoji, sem hashtag, sem data, preço ou loja.
- **Link, e-mail e telefone:** nenhum. O site ainda não existe e o endereço provisório não é divulgado (SPEC, seção 14).

## Instagram

| Campo | Valor |
| --- | --- |
| Nome de usuário | `@campinguim` (já era este; não foi mudado) |
| Nome de exibição | Campinguim (já estava assim) |
| Foto de perfil | `design/marca/perfil/instagram-perfil.png`. Na página do perfil, o pinguim aparece inteiro no círculo, com respiro |
| Bio | "App de checklist para camping. A lista do que levar, parada por parada, de casa ao camping e de volta. O pinguim de gorro ajuda a não esquecer nada." |
| Tamanho da bio | 148 de 150 caracteres (contador da própria tela) |
| Tipo de conta | Perfil profissional, opção "Comercial" |
| Categoria | Software, mostrada no perfil. A busca de categorias não oferece "Aplicativo" nem "Página de app"; "Software" foi a mais próxima |
| Contato no perfil | nenhum ("Não usar minhas informações de contato") |
| Site | nenhum |

- **Privacidade:** o perfil já era público antes da conversão ("Perfil privado" desligado). A troca para perfil profissional não mudou a privacidade.
- **Termos e dados pessoais:** a conversão não pediu aceite de termos, CPF nem telefone.
- **Evidência:** `docs/evidencias/SOC-01/instagram-perfil-final.png`. O balão "Nota", que só o dono da conta vê sobre a foto, foi escondido na tela antes da captura.

## TikTok

| Campo | Valor |
| --- | --- |
| Nome de usuário | `@campinguim` (já era este; não foi mudado) |
| Nome de exibição | Campinguim (já estava assim) |
| Foto de perfil | `design/marca/perfil/tiktok-perfil.png`, recorte no zoom mínimo (a imagem inteira). Na página do perfil, o pinguim aparece inteiro no círculo, com respiro |
| Descrição | "Checklist de camping. O pinguim ajuda a não esquecer nada." |
| Tamanho da descrição | 58 de 80 caracteres (contador da própria tela) |
| Categoria / tipo de conta | **pendente**, ver abaixo |
| Site, e-mail, telefone | nenhum |

- **Verificação:** ao abrir o perfil, o TikTok pediu um quebra-cabeça anti-robô. O agente não resolve esse tipo de verificação; o responsável resolveu no Chrome dele e o trabalho seguiu.
- **Categoria pendente:** o TikTok na web não oferece categoria nem a troca para conta empresarial. As configurações da web só mostram "Verificação da empresa", que é verificação de empresa com documentos e não foi aberta. A troca para conta empresarial, com categoria, fica no app do TikTok no celular. Se o responsável quiser, ele faz pelo celular. A conta empresarial pode pedir aceite de termos comerciais, e esse aceite é dele.
- **Evidência:** `docs/evidencias/SOC-01/tiktok-perfil-final.png`.

## Pendências

| Rede | O que ficou | Por quê |
| --- | --- | --- |
| TikTok | categoria e conta empresarial | a web não oferece; só pelo app no celular, e pode haver aceite de termos |
| Instagram e TikTok | link do site | o site ainda não existe (SPEC, seção 14) |

## O que não foi feito

- Nenhum post, story, vídeo ou comentário. Ninguém foi seguido.
- Senha, e-mail, telefone, privacidade e autenticação não foram mexidos.
- Nenhum termo novo aceito, nenhum anúncio ligado, nenhuma permissão dada a app de terceiros.

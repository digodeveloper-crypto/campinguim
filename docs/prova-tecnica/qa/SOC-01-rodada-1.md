# SOC-01 · perfis do Instagram e do TikTok · rodada 1 · APROVADO

Data: 2026-11-24 · Entregue por: pane-655 · Conferido por: QA (pane-646)
Base: pedido do piloto (bio só com o que o PRD diz, no tom do DESIGN.md, seção 10; sem link, e-mail ou telefone; foto = logo 01 com o pinguim inteiro no círculo; nenhum post; registro e evidências sem dado pessoal nem segredo); `docs/PRD.md`, seções 1 e 3; `docs/DESIGN.md`, seções 3, 10 e 13; `design/marca/LEIA-ME.md`.

| Critério | Resultado | Como o QA conferiu |
| --- | --- | --- |
| Bio só com o que o PRD diz | ok. "App de checklist para camping" vem do PRD §1 ("monta a lista do que levar para acampar"). "A lista do que levar, parada por parada" é o texto de abertura do app (DESIGN.md §10). "De casa ao camping e de volta" são as paradas da rota (DESIGN.md §2, que repete as etapas do PRD §1). "Não esquecer nada" vem da persona Carla (PRD §3). Nada inventado: sem promessa de função, loja, data ou preço | leitura contra PRD e DESIGN |
| Tom de voz (§10) | ok. Verbo no presente, sem exclamação, sem emoji, sem hashtag e sem adjetivo de propaganda | leitura |
| Sem link, e-mail ou telefone | ok nas capturas e no perfil público. O Instagram mostra só a categoria "Software" e a bio; o TikTok, só a descrição | captura; **perfis públicos abertos pelo QA sem login**: TikTok mostra "Checklist de camping. O pinguim ajuda a não esquecer nada."; Instagram mostra a bio, "0 posts" e "0 seguidores" |
| Foto = logo 01, pinguim inteiro no círculo | ok. Nas duas capturas aparece a 01 clara, com o pinguim inteiro e folga até a borda, sem corte | capturas; os arquivos de `design/marca/perfil/` são cópias exatas da 01 clara (`dsg07-rodada-2.md`) |
| Nenhum post publicado | ok. Instagram: "0 posts" na captura e na página pública. TikTok: nenhum vídeo na captura | captura; página pública |
| Registro e evidências sem dado pessoal nem segredo | ok. `docs/redes-sociais.md`: 0 e-mails, 0 telefones, 0 nome real, 0 usuário do Windows, 0 caminho de máquina, 0 `run.app`. As 2 capturas mostram só o cabeçalho público do perfil da marca, sem bloco de metadado. O nome `@campinguim` é a conta pública da marca. Os contadores aparecem zerados, sem nome de nenhum seguidor | busca; leitura dos blocos dos PNG; leitura das imagens |

## Observações (o piloto leva ao responsável; não reprovam)

1. **O Instagram virou perfil profissional "Comercial", com a categoria "Software" à mostra.** Isso vai além da lista do pedido (bio, foto, sem contato). Segundo a entrega, não houve aceite de termos nem pedido de CPF ou telefone. O perfil já era público. Dá para voltar a conta pessoal nas configurações. O responsável confirma se quer manter.
2. **TikTok sem categoria e sem conta empresarial:** só dá para mudar pelo app do celular, talvez com aceite de termos comerciais, que é decisão do responsável. Está registrado como pendência.
3. **Os contadores de seguidores aparecem nas capturas, todos em 0.** Não são dado pessoal. Se o pedido "sem seguidores" quis dizer também os números, basta recortar acima deles numa próxima captura.
4. Os arquivos ainda não estão no repositório. Quando forem, passam pela checagem de G antes do envio.

# Jornadas automatizadas (Maestro, emulador Android)

Roteiros de tela das jornadas da SPEC, seção 13 (GIT-14). Cada jornada tem a própria pasta; os roteiros são arquivos `.yaml` do Maestro e rodam com `npm run testar:jornadas`, que exige um emulador do projeto ligado e o app instalado (passo a passo em `docs/desenvolvimento.md`).

| Pasta | Jornada | Etapa |
| --- | --- | --- |
| `fumaca/` | Abre o app e confere a tela provisória (B1) | base |
| `fumaca-banco/` | Banco local cifrado: abre a frio, verifica a camada de acesso num banco descartável, reabre (B4) | base |
| `J1-familia/` | Família: criar viagem, quantidades, marcações, aviso de saída, "faltou", volta, "sobrou", repetir | 1 |
| `J2-aviao/` | J1 inteira em modo avião, fechando e reabrindo o app | 1 |
| `J3-lembretes/` | Lembretes de 3 dias, véspera e volta sem internet, com o relógio adiantado | 1 |
| `J4-grupo/` | Grupo em dois emuladores: assumidos, sem dono, duplicados | 2 |
| `J5-convidado/` | Convidado pelo navegador, visto no app do organizador | 2 |
| `J6-gastos/` | Gasto de R$ 420, cotas do caso C1, Pix, "paguei" | 2 |
| `J7-camping-com-dados/` | Camping de referência, alertas e ajustes do caso A1 | 3 |
| `J8-camping-sem-dados/` | Camping novo, lista "na dúvida", perguntas e respostas | 3 |
| `J9-volta-com-perguntas/` | Viagem encerrada, 4 perguntas, sugestão, nome na confirmação | 3 |

Regras dos roteiros:

- Nenhum texto da interface é copiado para o roteiro: use `{{textos.<caminho>}}` (do arquivo de textos do app) e `id:` (o `testID` da tela). O executor troca os marcadores antes de rodar.
- Cada jornada guarda capturas dos pontos principais com `takeScreenshot` (evidência para o QA). As capturas vão para `test-results/jornadas/` (fora do git); o QA copia as que entram como evidência.
- Capturas só da tela do app: nunca a tela inicial do Android com ícones de outros apps.
- Jornada com dois emuladores (J4 em diante) usa `campinguim-a` (porta 5554) e `campinguim-b` (porta 5556).

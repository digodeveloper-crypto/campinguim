# Prova técnica (F0)

Código da prova técnica da SPEC (seções 2 e 14), separado da estrutura final do app (decisão H5). Plano: `docs/prova-tecnica/plano.md`. Ambiente e versões: `docs/prova-tecnica/ambiente.md`.

| Pasta | O que tem |
| --- | --- |
| `app/` | App Expo em TypeScript, build próprio (não Expo Go). Pacote **provisório** `com.campinguim.prova` (H6). |
| `servidor/` | Supabase local (CLI como dependência do projeto), migração base com RLS, usuários de teste e testes automáticos. F0-5: função de teste `prova-chamada-protegida` (verificação do aparelho; regra em `supabase/functions/_verificacao/`) e `scripts/pilha-paralela.mjs`, que sobe uma segunda pilha com outras portas. |
| `sincronizacao/` | Serviço PowerSync auto-hospedado em Docker e as regras de sincronização. |
| `config/enderecos.json` | Único lugar com o endereço do servidor e o do site. |
| `e2e/` | Roteiros do Maestro. |
| `lembretes/` | Roteiros e resumo da prova do lembrete local em modo avião (F0-3). Ver `lembretes/LEIA-ME.md`. |
| `links/` | Roteiros e resumo da prova de abrir o app na viagem por link (F0-4). Ver `links/LEIA-ME.md`. |
| `prova.mjs` | Script único que sobe e derruba tudo. |

Credenciais locais (senhas dos usuários de teste, chaves do Supabase local) ficam só em `prova/.env.local`, criado pelo script e fora do git.

## Uso

Sempre com o Node do sistema, `"C:\Program Files\nodejs\node.exe"` (abaixo, `node`):

```
node prova/prova.mjs subir        # Supabase, PowerSync, usuários de teste e os dois emuladores
node prova/prova.mjs estado       # o que está rodando
node prova/prova.mjs derrubar     # desliga tudo e confere que nada ficou rodando

cd prova/servidor && npm run testar          # RLS, acesso entre viagens, configuração, verificação do aparelho
node prova/servidor/scripts/pilha-paralela.mjs subir|derrubar   # pilha paralela (F0-5: campinguim-f0-5, portas +1000)
cd prova/app && npm run nativo               # gera a pasta android (não versionada)
cd prova/app/android && gradlew assembleRelease -PreactNativeArchitectures=x86_64
```

O build `release` leva o JavaScript dentro do app e é assinado com a chave de depuração do modelo do Expo: não depende do Metro e serve para os testes com modo avião. Para desenvolver com recarga, `npm run android` (variante de depuração, com o Metro).

# Abrir o app na viagem por link (F0-4)

Prova do item 3 da SPEC (seções 2 e 14): um link abre o app direto na tela da viagem. Resultado e evidências em `docs/prova-tecnica/evidencias/F0-4/LEIA-ME.md`.

## O que existe no app da prova

| Arquivo | O que faz |
| --- | --- |
| `prova/app/app/viagem/[id].tsx` | Tela da viagem: lê o identificador da rota, mostra o nome (ou a mensagem de "não encontrada" / "link inválido") e escreve `VIAGEM_TELA …` no registro do aparelho, que o roteiro usa para medir o tempo. |
| `prova/app/app/links.tsx` | Tela de teste: lista as viagens de teste com os dois links de cada. `campinguim://links?semear=1` cria as 3 viagens no banco do aparelho. |
| `prova/app/src/links/viagensDeTeste.ts` | Identificadores fixos das 3 viagens de teste. |
| `prova/app/app.config.ts` | (da F0-1, sem mudança) esquema `campinguim` e filtro `https` com `autoVerify` para o host de `prova/config/enderecos.json` (`site`), caminho `/viagem`. É o único lugar do endereço. |
| `prova/links/roteiro.mjs` | Roteiro dos casos `semear`, `a`, `b`, `b-fundo`, `c`, `d`, `e`. |
| `prova/links/resumo.mjs` | Tabela por caso a partir dos `resultados.json`. |

O Expo Router abre `/viagem/<id>` sozinho para o esquema próprio e para o https (ele usa só o caminho da URL).

## Como repetir

Pré-requisitos: `docs/prova-tecnica/ambiente.md`. **Emulador próprio** (não use `campinguim-a`, `-b` nem o `-c` do F0-3), por exemplo:

```
avdmanager create avd -n campinguim-d -k "system-images;android-36;google_apis;x86_64" -d pixel_4a
emulator -avd campinguim-d -port 5560 -no-snapshot -no-audio
```

Build e instalação (Node do sistema; `prova/.env.local` com a chave pública do Supabase local, fora do git, como na F0-3):

```
cd prova/app && npm ci && npx expo prebuild --platform android --clean
cd android && gradlew assembleRelease -PreactNativeArchitectures=x86_64
adb -s emulator-5560 install -r app/build/outputs/apk/release/app-release.apk
```

Roteiros (sempre `CAMPINGUIM_SERIAL=emulator-5560`; o script nunca usa `kill-server`, `start-server` nem `reconnect`):

```
node prova/links/roteiro.mjs semear
node prova/links/roteiro.mjs a 10          # esquema próprio, app fechado; mede o tempo
node prova/links/roteiro.mjs b 10          # app aberto em outra tela
node prova/links/roteiro.mjs b-fundo 10    # app em segundo plano
node prova/links/roteiro.mjs d 10          # https com o vínculo forçado (pm set-app-links … 2)
node prova/links/roteiro.mjs c 10          # viagem que não existe (4 combinações) + id inválido
node prova/links/roteiro.mjs e 5           # https sem vínculo: o que o Android faz (sem imagem)
node prova/links/resumo.mjs
```

O caso `d` força o vínculo; o `c` também (para as execuções https); o `e` zera o vínculo antes de testar. Para limpar: fechar o emulador e apagar o AVD (`avdmanager delete avd -n campinguim-d`).

A fumaça do lembrete usa o roteiro do F0-3 (`prova/lembretes/roteiro.mjs`) com `CAMPINGUIM_SERIAL` (o `aparelho.mjs` passou a ler essa variável; sem ela, segue em `emulator-5558`).

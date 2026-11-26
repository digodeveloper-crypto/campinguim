# Lembrete local em modo avião (F0-3)

Prova do item 2 da SPEC (seções 2 e 14): o lembrete agendado no aparelho chega com o app fechado, sem internet e com o relógio adiantado. Resultado e evidências em `docs/prova-tecnica/evidencias/F0-3/LEIA-ME.md`.

## O que existe no app da prova

| Arquivo | O que faz |
| --- | --- |
| `prova/app/src/lembretes/lembretes.ts` | Agenda o lembrete (gatilho de data, canal `lembretes`), lê e pede as permissões de aviso e de alarme exato. |
| `prova/app/app/lembretes.tsx` | Tela de teste: estado das permissões, quantos lembretes há, botões. O link `campinguim://lembretes?agendar=1&minutos=N` agenda sozinho (é o que o roteiro usa). |
| `prova/app/app/_layout.tsx` | Tocar no aviso com o app aberto ou em segundo plano abre a tela da viagem. |
| `prova/app/app/+native-intent.ts` | Tocar no aviso com o app fechado abre a tela da viagem já na partida. |
| `prova/app/src/textos.ts` | Textos da tela e do aviso (o aviso usa o texto-base da véspera, SPEC seção 10, como texto de teste). |

O app declara `SCHEDULE_EXACT_ALARM` e bloqueia `USE_EXACT_ALARM` (política do Google Play) e as de localização.

## Como repetir

Pré-requisitos: ambiente de `docs/prova-tecnica/ambiente.md`; o AVD temporário `campinguim-c` (mesma imagem dos outros dois: API 36, "Google APIs", x86_64, Pixel 4a) ligado na porta 5558:

```
avdmanager create avd -n campinguim-c -k "system-images;android-36;google_apis;x86_64" -d pixel_4a
emulator -avd campinguim-c -port 5558 -no-snapshot -no-audio
```

Build e instalação (um build por vez; Node do sistema):

```
cd prova/app && npm ci && npx expo prebuild --platform android --clean
cd android && gradlew assembleRelease -PreactNativeArchitectures=x86_64
adb -s emulator-5558 install -r app/build/outputs/apk/release/app-release.apk
```

Permissões, uma vez, **pelas telas do sistema**: abrir `campinguim://lembretes`, tocar em "Pedir permissão de aviso" e em "Permitir"; tocar em "Pedir alarme exato" e ligar a chave em "Alarms & reminders".

Roteiros (sempre `adb -s emulator-5558`; o script nunca usa `kill-server`, `start-server` nem `reconnect`):

```
node prova/lembretes/roteiro.mjs a 10 --video     # app fechado pela lista de recentes
node prova/lembretes/roteiro.mjs b 10             # app em segundo plano
node prova/lembretes/roteiro.mjs c 10             # aparelho reiniciado entre o agendamento e o horário
node prova/lembretes/roteiro.mjs d 5              # permissão de aviso negada
node prova/lembretes/roteiro.mjs e 5              # sem alarme exato (atraso medido)
node prova/lembretes/roteiro.mjs f 3              # "forçar parada"
```

Cada execução: limpa os lembretes velhos, volta rede e relógio ao normal, agenda para daqui a 30 min (relógio do aparelho), fecha o app como o caso pede, liga o modo avião, adianta o relógio para 60 s depois do horário (`adb root` + `date -u @<epoch>`), espera o aviso aparecer no sistema (`dumpsys notification`, campo `when`), abre a barra de avisos, toca no aviso e confere que a tela da viagem abriu. O atraso é o `when` do aviso menos o instante para o qual o relógio foi adiantado.

Resultados em `docs/prova-tecnica/evidencias/F0-3/caso-<x>/resultados.json`.

Para limpar: fechar o emulador `campinguim-c` e apagar o AVD (`avdmanager delete avd -n campinguim-c`).

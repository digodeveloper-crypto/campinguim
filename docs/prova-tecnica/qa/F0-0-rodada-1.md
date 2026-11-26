# F0-0 · preparar a máquina · rodada 1 · APROVADO

Data: 2026-11-24 · Entregue por: pane-645 · Conferido por: QA (pane-646)
Base: `docs/prova-tecnica/plano.md`, seção D, F0-0 (aceite e evidência); `CLAUDE.md` (segurança, pastas da tarefa, limpeza).
Alvo: `docs/prova-tecnica/ambiente.md` e `docs/prova-tecnica/evidencias/F0-0/` (11 arquivos de texto e 1 PNG).

O QA rodou de novo, ele mesmo, cada comando de leitura do aceite, com os dois emuladores e o Docker ainda ligados.

## Aceite

| Critério do plano | Resultado | Como o QA conferiu |
| --- | --- | --- |
| Virtualização habilitada no firmware | ok. `VirtualizationFirmwareEnabled: True`; `HypervisorPresent: True` | `Get-CimInstance Win32_Processor` e `Win32_ComputerSystem`. O `systeminfo` agora diz "Hipervisor detectado. Recursos necessários para o Hyper-V não serão exibidos" e omite a linha do firmware: é o comportamento do Windows com hipervisor ativo. A leitura pelo CIM é equivalente e foi aceita (ver observação 1). |
| `emulator -accel-check` com WHPX | ok. "WHPX(10.0.26300) is installed and usable." | `emulator.exe -accel-check` pelo `ANDROID_HOME` do usuário |
| Dois emuladores juntos em `adb devices` | ok. `emulator-5554 device` e `emulator-5556 device`; os dois com `sys.boot_completed=1`, API 36; AVD `campinguim-a` 1080x2340 e `campinguim-b` 1344x2992 | `adb devices -l`; `getprop`; `adb emu avd name`; `wm size` |
| Imagem "Google APIs", API 36, x86_64 (PROPOSTA de B4) | ok. `image.sysdir.1=system-images\android-36\google_apis\x86_64\`, `PlayStore.enabled=no`, `hw.ramSize=2G`; build `userdebug/dev-keys` | `config.ini` dos dois AVDs; `ro.build.fingerprint` |
| `docker info` responde | ok. Servidor 29.8.2, Docker Desktop 4.94.0, kernel `6.18.58.1-microsoft-standard-WSL2`, 15,58 GiB, 0 contêineres | `docker info --format …` |
| `java -version` na versão de B (JDK 17) | ok. `openjdk 17.0.21.1` Temurin-17.0.21.1+2; `JAVA_HOME` do usuário aponta para ele | `java.exe -version`; variável do usuário |
| `maestro --version` | ok. `2.12.1`; `MAESTRO_CLI_NO_ANALYTICS=1` no usuário | `maestro.bat --version` |
| Memória livre acima de 6 GB com tudo ligado | ok. Entrega: 10.339 MB. QA agora: **11.349 MB** livres de 32.682 MB | `Win32_OperatingSystem.FreePhysicalMemory` |
| Registro em `ambiente.md` sem segredo e sem nome de usuário do Windows em caminhos | ok. Caminhos com `%LOCALAPPDATA%`, `%USERPROFILE%`, `C:\Ferramentas` e `C:\Program Files`. Zero ocorrências do nome de usuário, de `Users\`, de e-mail, de token ou de senha em `ambiente.md` e nos `.txt` | busca por padrões (nome de usuário, `users[\/]`, e-mail, `gmail`, nome da conta, `token`, `senha`, `secret`, `api_key`, `ghp_`, `sk-`) |
| Captura dos dois emuladores | ok. Só a tela inicial dos dois aparelhos virtuais, sem conta logada nem dado pessoal. O PNG não tem blocos de texto nem metadados (`tEXt`, `iTXt`, `zTXt`, `eXIf`, `tIME`: nenhum) | leitura da imagem; busca de blocos no arquivo |

## Regras do `CLAUDE.md`

- **Pastas:** `git status` mostra só `docs/prova-tecnica/` como novo. Os arquivos ignorados que aparecem (`.codex/`, `.overclock-app/`, relatórios antigos do mascote) já existiam antes desta tarefa. Ferramentas fora do repositório, como o plano manda.
- **Limpeza:** nenhum instalador `.zip` em `C:\Ferramentas`; a pasta `_download` está vazia e é de 22/10/2026, anterior à tarefa. Emuladores e Docker ficaram ligados de propósito, para esta conferência.
- **Termos:** as licenças do SDK e o contrato do Docker estão registrados como aceites autorizados pelo responsável (H3). Nenhuma conta criada e nenhum login.
- **Integridade dos downloads:** a entrega registra o SHA-256 conferido do JDK, das ferramentas do SDK e do Maestro, com a origem oficial de cada um.

## Observações (não reprovam)

1. **Texto do aceite de F0-0:** o plano pede "`systeminfo` mostra virtualização habilitada". Com o hipervisor ligado, o Windows esconde essa linha. O orquestrador pode trocar o critério no plano para `Win32_Processor.VirtualizationFirmwareEnabled = True`, para a próxima conferência não depender de interpretação.
2. **O pacote `com.android.vending` existe nas duas imagens "Google APIs"**, mesmo com `PlayStore.enabled=no`. Isso não muda o motivo da escolha em B4: o build é `userdebug`, que é o que permite `adb root` para mexer no relógio em F0-3. O `adb root` em si não foi testado aqui, porque reinicia o serviço do aparelho. F0-3 confirma.
3. **`docker-info.txt` traz o identificador da instalação do Docker** (linha `ID:`) e os caminhos dos plugins. Não é segredo, mas o repositório vai ser público (H4): vale mascarar a linha `ID:` antes do primeiro commit que leve esta pasta.
4. **A captura mostra ícones de apps do Google** da tela inicial padrão do emulador. É evidência de ambiente, não interface do app, então a regra 6 não se aplica. Registro para a F0-P decidir se a captura vai para o repositório público.
5. **Recursos opcionais do Windows não foram listados** (exigem administrador). O resultado prático está provado: WHPX usável e Docker em WSL 2. Isso não é critério de aceite.
6. **A margem de memória vale para o Docker parado.** A entrega já avisa: F0-1 e F0-2 precisam medir de novo com Supabase, PowerSync e o app no ar, e reduzir `hw.ramSize` ou limitar o WSL se ficar abaixo de 6 GB.

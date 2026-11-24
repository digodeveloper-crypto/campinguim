# Origem das artes do mascote nos protótipos

DSG-01 · etapa 0 (base) · 24/11/2026.

As artes de `mascote.js` são cópias, byte a byte, do **pacote final do mascote (MSC-08, aprovado pelo QA em 24/11/2026)**, versão para fundo claro. Nenhuma arte foi redesenhada, recortada, recolorida ou otimizada.

- **Origem:** `design/mascote/final/vetor/claro/` (D-06 de `telas.md`; padrão de produção, seção 6).
- **Idêntica à opção 03 aprovada:** cada arte do pacote final tem o mesmo SHA-256 do arquivo de mesmo nome em `design/mascote/apresentacao/opcoes/03/arte/` (opção 03, Filhote de gorro, escolhida em `design/mascote/ESCOLHA.md`). Conferido arte por arte em 24/11/2026: as 8 iguais. Por isso as telas e o contrato das direções não mudam.
- **Não entra agora:** a versão para fundo escuro do pacote final (`design/mascote/final/vetor/escuro/`, com contorno), as expressões (`vetor/claro/expressoes/`) e as vistas (`vista-frente`, `vista-lado`, `vista-tres-quartos`). No tema escuro, a versão colorida continua sobre o apoio claro de cada direção, como em `direcoes.md`.
- **Como estão guardadas:** em `mascote.js`, cada arte é o conteúdo exato do arquivo `.svg` codificado em base64 (campo `base64`), com o tamanho em bytes (`bytes`) e o SHA-256 (`sha256`) dos bytes de origem. A base64 só evita que o endereço do espaço de nomes do SVG apareça escrito no código (regra "tudo local", seção 3 do padrão); decodificada, devolve o arquivo idêntico. Onde a base64 forma por acaso uma palavra da busca do QA (na arte `principal`, a sequência de um nome do cenário), a cadeia é cortada em duas partes (`"..." + "..."`), sem mudar o conteúdo decodificado.
- **Como conferir:** decodificar `base64` de cada arte e calcular o SHA-256; deve ser igual ao da tabela e ao dos dois arquivos de origem. Na página, `CAMPINGUIM_MASCOTE.svg("<nome>")` devolve o mesmo texto, que `base.js` injeta sem alteração dentro de um invólucro `<span class="cg-mascote">`.

| Arte | Origem (pacote final) | Igual a (opção 03) | Bytes | SHA-256 |
| --- | --- | --- | --- | --- |
| `principal` | `design/mascote/final/vetor/claro/principal.svg` | `design/mascote/apresentacao/opcoes/03/arte/principal.svg` | 25075 | `247c31dae26f55df9fd41e3c05f66fde27203db11abf8a884ac3c883e9009773` |
| `pose-neutro` | `design/mascote/final/vetor/claro/pose-neutro.svg` | `design/mascote/apresentacao/opcoes/03/arte/pose-neutro.svg` | 25047 | `37161c1ac39aeffe8c7282a3a503dd27a95052df4947f8b1bcbe3ea3dfb33c4f` |
| `pose-comemorando` | `design/mascote/final/vetor/claro/pose-comemorando.svg` | `design/mascote/apresentacao/opcoes/03/arte/pose-comemorando.svg` | 25098 | `78e430659c160db2a8269bd56a447d9ea1c19d55425f90d5e40e88fe08e4e054` |
| `pose-alerta` | `design/mascote/final/vetor/claro/pose-alerta.svg` | `design/mascote/apresentacao/opcoes/03/arte/pose-alerta.svg` | 25611 | `b9fb6e070fb2690a9f6f0dfae1813c328adec145e46144b684d76a1fc9b09232` |
| `pose-camping` | `design/mascote/final/vetor/claro/pose-camping.svg` | `design/mascote/apresentacao/opcoes/03/arte/pose-camping.svg` | 26165 | `d1da492fbc9b828a5563cdfb78e3e42a930457a0142f7347152dbd2e766216d9` |
| `icone` | `design/mascote/final/vetor/claro/icone.svg` | `design/mascote/apresentacao/opcoes/03/arte/icone.svg` | 2986 | `744a11d799cef8cf76d4d3d1449906a1e310b6533df40d73a155edbdba3936ac` |
| `uma-cor` | `design/mascote/final/vetor/claro/uma-cor.svg` | `design/mascote/apresentacao/opcoes/03/arte/uma-cor.svg` | 18618 | `67b17141525a10ac28512eeeb20e9f4bd9b72653f41017f7441b945dcd5249d1` |
| `sem-acessorio` | `design/mascote/final/vetor/claro/sem-acessorio.svg` | `design/mascote/apresentacao/opcoes/03/arte/sem-acessorio.svg` | 23196 | `0eb9fad1a29bb026fbbbce72032ca77897ced4ffd69ef90c87216461f5ce5eb8` |

# Archivo (fonte do site)

- Família da identidade: Archivo (`docs/DESIGN.md`, seção 4.1), licença SIL Open Font License 1.1 (`OFL.txt`, cópia idêntica à de `design/prototipos/_compartilhado/fontes/archivo/`). A licença não reserva nome de fonte.
- `Archivo-variavel.ttf`: cópia byte a byte de `design/prototipos/_compartilhado/fontes/archivo/Archivo-variavel.ttf` (repositório oficial `github.com/google/fonts`, pasta `ofl/archivo/`), SHA-256 começando por `0e094a7d3c7c4c25`, a mesma origem dos cortes fixos do app (`apps/mobile/assets/fontes/archivo/LEIA-ME.md`).
- No navegador a fonte variável funciona inteira: a largura (`font-stretch`, 62 a 125) e o peso (`font-weight`, 100 a 900) da escala do DESIGN.md 4.2 saem do mesmo arquivo, sem cortes.
- Um teste da página (`apps/web/src/site/arquivos.test.ts`) confere que este arquivo e a licença são iguais aos da pasta de origem.

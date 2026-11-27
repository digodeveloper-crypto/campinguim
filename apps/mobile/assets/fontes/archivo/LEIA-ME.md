# Archivo (fonte do app)

- Família da identidade: Archivo (`docs/DESIGN.md`, seção 4.1), licença SIL Open Font License 1.1 (`OFL.txt`, cópia idêntica à de `design/prototipos/_compartilhado/fontes/archivo/`). A licença não reserva nome de fonte.
- Origem: `design/prototipos/_compartilhado/fontes/archivo/Archivo-variavel.ttf` (repositório oficial `github.com/google/fonts`, pasta `ofl/archivo/`), SHA-256 começando por `0e094a7d3c7c4c25`.
- O Android não aplica os eixos de uma fonte variável pelo React Native. Por isso cada combinação de largura e peso que a escala usa virou um arquivo fixo, cortado da fonte variável sem nenhuma outra mudança (os números tabulares, recurso `tnum`, continuam no arquivo):

```
python -m fontTools.varLib.instancer -q Archivo-variavel.ttf wdth=<largura> wght=<peso> -o Archivo-L<largura>-P<peso>.ttf
```

Ferramenta: fontTools 4.68.0. `L112` é a largura 112,5.

| Arquivo | Largura | Peso | Uso (DESIGN.md 4.2) |
| --- | --- | --- | --- |
| `Archivo-L125-P800.ttf` | 125 | 800 | letreiro da marca |
| `Archivo-L125-P700.ttf` | 125 | 700 | título de tela, número do progresso, título de painel, texto grande do selo, nome da legenda |
| `Archivo-L125-P600.ttf` | 125 | 600 | rótulo de carta |
| `Archivo-L112-P700.ttf` | 112,5 | 700 | texto do botão, nome na legenda |
| `Archivo-L112-P600.ttf` | 112,5 | 600 | subtítulo, nome de categoria |
| `Archivo-L100-P400.ttf` a `P800` | 100 | 400 a 800 | corpo, item, linha, texto secundário; o 800 é o letreiro em letra grande |
| `Archivo-L85-P500.ttf`, `P700` | 85 | 500, 700 | nome da parada na rota |

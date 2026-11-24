# Teste de técnica · 24/11/2026

Objetivo: decidir por teste, não por opinião, como as 10 opções são produzidas (vetor SVG à mão contra imagem gerada). Personagem de teste descartável, que não é nenhuma das dez: pinguim pera, azul-escuro, com tapete enrolado nas costas e lanterna na asa.

## Caminho (a): vetor SVG escrito à mão

- Arquivos: `teste-a-vetor.svg` (colorido, contorno de 12) e `teste-a-vetor-uma-cor.svg` (uma tinta, recortes).
- Renderizado com `design/mascote/ferramentas/render.py` (Chrome 158 headless + Pillow), fundo claro.
- Resultado em `resultado-vetor/`: `*-grande.png` (1024), `*-48.png` (48 px reais), `*-48x8.png` (ampliado 8× sem suavizar), `*-cinza.png`, `prancha.png`.
- Saída do comando:

```
> python -I design/mascote/ferramentas/render.py design/mascote/direcao/testes --fundo claro
teste-a-vetor-uma-cor.svg: teste-a-vetor-uma-cor-grande.png (1024), teste-a-vetor-uma-cor-48.png (48 reais), teste-a-vetor-uma-cor-48x8.png, teste-a-vetor-uma-cor-cinza.png
teste-a-vetor.svg: teste-a-vetor-grande.png (1024), teste-a-vetor-48.png (48 reais), teste-a-vetor-48x8.png, teste-a-vetor-cinza.png
prancha.png com 2 arquivo(s)
saida: C:\campinguim\design\mascote\direcao\testes\_render  exit=0
```

(`_render/` renomeada para `resultado-vetor/` como evidência.)

- O que se viu (ver `padrao-producao.md`, seção 2): grande limpo; em 48 px o contorno de 12 vira 1 px e some em partes, a alça da lanterna (traço de 6) desaparece, o tapete atrás do corpo vira mancha; a versão em uma cor vazada lê melhor que a colorida em 48 px.

## Caminho (b): geração de imagem pela ferramenta de mídia do Overclock

- Ferramenta: `overclock_media_generate`, `kind: image`, provedor `codex-cli` (o único configurado nesta máquina, conforme o pedido).
- Pedido: pinguim pera com tapete enrolado e lanterna, estilo vetor chapado, fundo branco, sem texto (mesmo personagem do caminho a).
- Chamada 1 (com `aspect: 1:1`, saída `design/mascote/direcao/testes/teste-b-gerado-codex.png`): **falhou**. Erro exato: `error in overclock_media_generate: spawn EINVAL — call describe:true for this op.`
- Chamada 2 (sem `aspect`, mesmo provedor): **falhou** com o mesmo erro: `spawn EINVAL`.
- Nenhum outro provedor foi tentado, como pede o pedido. Nenhuma imagem gerada existe neste projeto.
- `spawn EINVAL` é erro do próprio Overclock ao iniciar o processo do Codex CLI nesta máquina (parâmetro inválido ao abrir o processo), não erro de pedido. Fica para quem cuida da instalação.

## Decisão

Vetor SVG escrito à mão para as dez opções. Motivos em `padrao-producao.md`, seção 1.

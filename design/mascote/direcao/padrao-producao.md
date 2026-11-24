# Padrão de produção das 10 opções

Como as dez opções são produzidas para que a comparação seja justa e o QA consiga testar. Vale para todo designer. O contrato de arquivos é o de `design/mascote/apresentacao/LEIA-ME.md`; o roteiro do QA é `design/mascote/qa/roteiro.md`.

## 1. Técnica: vetor SVG escrito à mão (decidido por teste)

**Decisão.** Cada opção é desenhada em **SVG escrito à mão**, um arquivo por entrega, sem ferramenta externa. Geração de imagem não entra na produção das dez opções.

**Por quê.**
- O pacote final exige vetor, versão em uma cor e ícone nítido em 48 px (MSC-05, MSC-08): o desenho-mestre precisa existir em vetor de qualquer forma. Vetor à mão produz direto os três.
- O teste (seção 2) mostrou que o vetor escrito à mão rende limpo em 1024 px e em 48 px reais, com transparência, usando só o Chrome desta máquina. As falhas que apareceram (linha de 12 que some em 48 px, alça de lanterna que vira nada) são de **regra de desenho**, não de técnica, e viraram as regras da seção 3.
- A geração de imagem pela ferramenta de mídia do Overclock (provedor Codex CLI, o único configurado) **falhou nas duas chamadas** com o erro `spawn EINVAL` (registro completo em `direcao/testes/LEIA-ME.md`). Não houve imagem gerada para comparar. Mesmo que funcionasse, a saída é raster (PNG): não serve de desenho-mestre e só entraria como complemento se fosse fiel ao vetor. Seguindo o pedido, não se tentou outro provedor.
- Vetor à mão é o que mantém as dez opções no mesmo acabamento, comparáveis entre si, sem "visual de modelo pronto" de gerador.

**Consequência para o designer.** Ele escreve o SVG, roda o renderizador (seção 4), olha o PNG, corrige, repete. Nunca julga pelo código. Uma pose é uma cópia do arquivo `principal` com as partes movidas: o personagem não muda de proporção entre arquivos.

## 2. O que o teste mostrou

Personagem de teste descartável (pinguim pera com tapete enrolado e lanterna; não é nenhuma das dez), em `direcao/testes/teste-a-vetor.svg` e `teste-a-vetor-uma-cor.svg`. Renderizado com `ferramentas/render.py`; resultado em `direcao/testes/resultado-vetor/`.

| O que se viu | Regra que saiu |
| --- | --- |
| Em 1024 px, formas e contorno de 12 limpos, cores chapadas sem serrilhado. | Vetor serve para o mascote grande e para os usos reais. |
| Em 48 px reais, o contorno de 12 (na prancha de 512) virou 1 px cinza e desapareceu em partes. | Contorno no ícone ≥ 24 na prancha de 512, ou sem contorno (contraste de cor faz o trabalho). |
| A alça da lanterna (traço de 6) sumiu; a lanterna virou um quadrado amarelo sem leitura. | Nada menor que 43 (4 px em 48) no ícone; acessório com alça precisa de alça ≥ 24 e vão ≥ 40. |
| Os olhos (raio 16 com pupila 7) viraram dois pontos; leem como olhos, mas sem expressão. | No ícone, olhos ≥ 40 de diâmetro; expressão não é pedida ao ícone, só identidade. |
| O tapete enrolado atrás do corpo virou uma mancha laranja colada na silhueta. | Acessório atrás do corpo não lê em 48 px; no ícone o acessório fica ao lado ou na frente, ou some. |
| A versão em uma cor com barriga, olhos e bico vazados leu bem em 48 px, melhor que a colorida. | A versão em uma cor é a prova de identidade: se ela funciona, a opção funciona. |
| Fundo transparente sobre a página clara: fundo escuro não foi testado aqui. | O teste de fundo escuro é do QA (`captura.py`), e o designer roda `render.py --fundo escuro` antes de entregar. |

## 3. Regras de prancha e de desenho

**Prancha.** Todo arquivo SVG tem `viewBox="0 0 512 512"` e `width="512" height="512"`. Quadrado. Fundo transparente (nenhum `rect` de fundo). Sem `<text>`, sem fonte, sem imagem embutida, sem `<filter>`, sem referência externa. Degradê só nas opções de acabamento "volume", nunca no `icone` nem no `uma-cor`. PNG, se usado em vez de SVG para algum arquivo, é 1024 × 1024 com transparência (e 512 × 512 para `icone`), mas o desenho-mestre continua SVG.

**Margem de segurança.** A figura inteira, pés e acessório inclusos, cabe em 448 × 448 centrado (32 de margem em cada lado). Nas poses, partes que saem (asa erguida, pulo) podem chegar a 16 da borda, nunca cortar.

**Escala comum.** A altura da figura em pé é a mesma em `principal`, nas três vistas e nas poses (a altura declarada na ficha). O chão é a linha y = 480 em todos os arquivos. Assim a página mostra as dez no mesmo tamanho e o QA compara vistas sem reescalar.

**Espessura mínima e detalhe mínimo (na prancha de 512).**

| Arquivo | Linha mínima | Menor elemento com significado | Vão mínimo (buraco, espaço entre partes) |
| --- | --- | --- | --- |
| `principal`, vistas, poses, `sem-acessorio` | 8 | 16 | 12 |
| `uma-cor` | sem linha (só preenchimento) | 24 | 24 |
| `icone` | 24, ou sem linha | 43 (4 px em 48) | 43 |

O `icone` é uma **arte própria**: a mesma figura, simplificada e reenquadrada (muitas fichas pedem do peito para cima ou pés exagerados). Nunca é o `principal` reduzido. O que diz "camping" tem de estar dentro do menor elemento permitido. Os elementos que identificam o personagem ficam dentro de um círculo central de diâmetro 440 (a máscara redonda do Android corta os cantos).

**Versão em uma cor (`uma-cor`).** Uma única tinta (`#111111`), sem contorno, sem sombra, sem segundo tom, sem opacidade. Barriga, olhos, bico e vãos são **recortes transparentes**, nunca brancos: o arquivo precisa ler tanto sobre fundo claro quanto sobre fundo escuro invertido (a página pode exibir sobre os dois). A versão em uma cor é a silhueta com os recortes que identificam o personagem; se ela não é reconhecível, a opção volta. Mesmo enquadramento do `principal`.

**Três vistas (`vista-frente`, `vista-lado`, `vista-tres-quartos`).** Mesma altura, mesmo chão, linha dos olhos na mesma altura nas três. Lado: perfil puro, o personagem olha para a esquerda da prancha, bico projetado, barriga em perfil, uma asa visível, os dois pés sobrepostos ou um à frente. Três quartos: 45° para a esquerda, os dois olhos visíveis (o de trás menor), asa de cá por inteiro. Pose neutra em pé nas três. Acessório aparece nas três, consistente (o nó do lenço atrás, a mochila nas costas). A `vista-frente` pode ser o mesmo desenho do `pose-neutro`.

**Poses.** As quatro obrigatórias (`pose-neutro`, `pose-comemorando`, `pose-alerta`, `pose-camping`) mais, quando a ficha pedir, a pose extra de desconforto (`pose-extra-frio`, `pose-extra-calor` ou `pose-extra-chuva`, declarada em `poses_extras` no `dados.js`). Regra do piloto: **toda opção mostra pelo menos uma situação de desconforto** (frio, calor ou chuva). Nas dez fichas a `pose-camping` já é a de desconforto; a pose extra é opcional. Elementos de situação (gotas, traços de tremor, sol, traços de chuva) são poucos, grandes (≥ 16) e da cor da tinta escura ou de um tom da paleta; nenhum fundo, nenhum cenário, nenhum texto.

**Acessório.** Opção com acessório entrega `arte/sem-acessorio` (regra do piloto): o `principal` sem o acessório, mesmo enquadramento. O acessório aparece no `uma-cor`, porque a versão em uma cor é a do `principal`; o QA também olha a silhueta do `sem-acessorio`, que precisa continuar única sem ele. Acessórios de alça fina, estampa, texto ou marca são proibidos.

**Cores.** As da paleta da ficha (3 a 5), em hex, sem transparência. O corpo escuro nunca é laranja-avermelhado (letreiro da marca Pinguin) e a dupla azul-royal vivo com laranja é evitada (`originalidade.md`). Contraste: a barriga clara e o corpo escuro precisam diferir em luminosidade o bastante para a versão em cinza separar os dois (o QA testa).

**Nomes.** Exatamente os do contrato: `principal`, `vista-frente`, `vista-lado`, `vista-tres-quartos`, `pose-neutro`, `pose-comemorando`, `pose-alerta`, `pose-camping`, `icone`, `uma-cor`, mais `sem-acessorio` e `pose-extra-<frio|calor|chuva>` quando houver. Extensão `.svg` (ou `.png` com transparência). Pasta `design/mascote/apresentacao/opcoes/NN/arte/`. Nenhum outro arquivo na pasta `arte/`; a pasta `_render/` do ciclo de trabalho fica fora de `arte/` e é apagada antes da entrega.

**SVG limpo.** Formas fechadas (`path` com `Z`, `circle`, `ellipse`, `rect`), `stroke-linejoin="round"`, sem grupos vazios, sem `transform` aninhado difícil de ler, sem ids inúteis, com um comentário de uma linha no topo dizendo a opção e o arquivo. Pose é edição do `principal`, não redesenho.

## 4. O ciclo: desenhar, renderizar, olhar, corrigir

Ferramenta pronta e testada: `design/mascote/ferramentas/render.py` (Python 3.12 + Pillow, usa o Google Chrome ou o Edge instalado; nada a instalar).

Uso, em uma linha, de qualquer pasta:

```
python -I design\mascote\ferramentas\render.py design\mascote\apresentacao\opcoes\NN\arte
```

Gera em `opcoes\NN\arte\_render\`, para cada arquivo: `<nome>-grande.png` (1024), `<nome>-48.png` (48 px **reais**, desenhados pelo navegador nesse tamanho), `<nome>-48x8.png` (os 48 px ampliados 8× sem suavizar, para ver cada pixel) e `<nome>-cinza.png`; e `prancha.png` com todos lado a lado. Um arquivo só: passar o caminho do arquivo. Fundo: `--fundo claro` ou `--fundo escuro` para ver contraste (padrão transparente). Saída em outra pasta: `--saida PASTA`.

O designer abre os PNG (o `Read` do Claude Code mostra a imagem) e corrige o SVG. Julga **pela imagem**, nunca pelo código. Antes de entregar, roda com `--fundo escuro` e confere o `48x8` de `icone` e de `uma-cor`.

Saída do teste feito em 24/11/2026 nesta máquina (Windows 11, Chrome 158):

```
> python -I design/mascote/ferramentas/render.py design/mascote/direcao/testes --fundo claro
teste-a-vetor-uma-cor.svg: teste-a-vetor-uma-cor-grande.png (1024), teste-a-vetor-uma-cor-48.png (48 reais), teste-a-vetor-uma-cor-48x8.png, teste-a-vetor-uma-cor-cinza.png
teste-a-vetor.svg: teste-a-vetor-grande.png (1024), teste-a-vetor-48.png (48 reais), teste-a-vetor-48x8.png, teste-a-vetor-cinza.png
prancha.png com 2 arquivo(s)
saida: design\mascote\direcao\testes\_render  exit=0
```

(A pasta de saída do teste foi renomeada para `resultado-vetor/` para ficar como evidência.)

**Bateria completa do QA.** O QA tem a própria ferramenta, `design/mascote/qa/captura.py` (Playwright + Pillow, também sem instalar nada), que gera o que `render.py` não gera: sol forte, silhueta, máscara redonda do Android, grade entre 47 ícones, fundo claro e escuro. O designer **pode e deve** rodá-la antes de entregar, nos mesmos termos do QA (`qa/roteiro.md`, seção 1), sem editar nada em `qa/`:

```
cd design\mascote\qa
python -I captura.py arte ..\apresentacao\opcoes\NN\arte\icone.svg <pasta temporária sua> --rotulo icone
```

A pasta temporária do designer fica fora de `qa/relatorios/` (que é do QA) e é apagada depois.

## 5. Critério de pronto de uma opção

Uma opção está pronta para o QA quando tudo abaixo é verdade. Espelha a tabela do pedido e o roteiro do QA.

| ID | Requisito | Pronto quando |
| --- | --- | --- |
| MSC-01 | Original e distinta das outras nove | O desenho cumpre a ficha de `conceitos.md` (eixos, idade, ideia, construção). A silhueta em uma cor não se confunde com a de outra opção. |
| MSC-02 | Apresentação navegável | `dados.js` preenchido no formato de `apresentacao/LEIA-ME.md`, `pronta: true`, a página da opção abre por duplo clique sem o aviso amarelo de pendências. |
| MSC-03 | Usos reais | A página monta os cinco usos a partir de `principal`, `pose-alerta`, `pose-neutro`, `icone` e `uma-cor`; o designer conferiu no celular (largura 390) e no computador que nada corta ou estica, em fundo claro e escuro (botão da página). |
| MSC-04 | 4 poses, com desconforto | Os quatro arquivos de pose existem, a emoção se lê sem o rótulo, o personagem não muda de proporção entre poses, e pelo menos uma pose mostra frio, calor ou chuva (a ficha diz qual). |
| MSC-05 | Reconhecível em 48 px | `icone-48.png` real diz "pinguim" e "campista" sem a versão grande ao lado; nenhum elemento necessário é menor que 4 px; funciona dentro da máscara redonda. |
| MSC-06 | Originalidade | Procedimento de `originalidade.md` seção 3 feito e declarado no `dados.js`; sem busca reversa de imagem; nenhum traço marcante da lista. |
| MSC-09 | Funciona em 3D | As três vistas existem, mesma altura, mesma linha dos olhos, descrevem o mesmo volume; nenhuma forma descartada em `conceitos.md` foi usada. |
| Sol e tela pequena | Contraste alto | Em `--fundo claro` e `--fundo escuro` a figura não some; corpo e barriga separam em cinza. |
| Não depender de cor | Uma cor | `uma-cor` em uma tinta com recortes transparentes, reconhecível em 48 px. |
| Fora do Brasil | Sem referência local | Nenhum texto, bandeira, objeto típico de um país ou gesto de mão na arte. |
| Acessório não essencial | `sem-acessorio` | Opção com acessório tem `arte/sem-acessorio` e a figura sem ele continua sendo o personagem. Opção sem acessório não tem acessório em nenhum arquivo. |
| Detalhe fino | Regras da seção 3 | Nenhum elemento abaixo dos mínimos; `icone` é arte própria, não redução. |
| Modelo pronto | Acabamento | Curvas limpas, espessuras intencionais, sem brilho de olho padrão de clipart, sem degradê pronto; "simpático sem ser infantil". |
| Limpeza | Pasta | `arte/` só com os arquivos do contrato; `_render/` e qualquer temporário apagados; nada de imagem de terceiros em lugar nenhum. |

A entrega ao QA diz: número da opção, IDs cobertos (MSC-01, 03, 04, 05, 06, 09), o que foi feito, o resultado do `render.py` (saída do comando) e, numa reentrega, o que mudou desde a rodada anterior.

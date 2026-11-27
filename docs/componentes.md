# Componentes visuais do Campinguim

Catálogo dos componentes do app, feito na feature **B2** (componentes visuais a partir do protótipo escolhido; DSG-06, NF-07, NF-08) em 26/11/2026.

- Especificação: `docs/DESIGN.md` inteiro. Este arquivo não repete o DESIGN.md: diz onde cada peça está no código, como se usa, que estados tem e o que foi decidido onde o protótipo não diz.
- Referência visual: o protótipo Rumo, paleta Eucalipto (`design/prototipos/rumo/`).
- Para ver tudo funcionando: a **galeria** do app (seção 8).

## 1. Onde fica

| Pasta | O que tem |
| --- | --- |
| `apps/mobile/src/tema/` | `tokens.json` (a única fonte das cores, medidas e escala de letra), o provedor do tema, o contraste, as famílias da fonte e o gerador dos derivados |
| `apps/mobile/src/componentes/` | os componentes 7.1 a 7.10, o mascote, as curvas de nível e as regras puras (`estados.ts`, `formatar.ts`, `geradorCurvas.ts`) |
| `apps/mobile/src/icones/` | os 30 ícones do Rumo (`desenhos.ts`, cópia de `rumo/icones.js`) e o componente `Icone` |
| `apps/mobile/assets/fontes/archivo/` | a Archivo em 12 arquivos fixos, com a licença OFL e o `LEIA-ME.md` de como foram cortados |
| `apps/mobile/assets/mascote/` | as 5 artes do mascote que o Rumo usa, cópias do pacote final, com `LEIA-ME.md` |
| `apps/mobile/app/galeria/` | a galeria de conferência (só no ambiente local) |
| `apps/web/src/estilos.css` | recebe as mesmas cores, num bloco gerado de `tokens.json` |

Uma fonte de verdade: `tokens.json`. Depois de mudar um valor nele ou uma arte do mascote, rode `node apps/mobile/src/tema/gerar.mjs` (regrava o bloco de cores da página web e `src/componentes/mascote/artes.ts`). Um teste da suíte falha se algum derivado estiver velho.

## 2. Tema

```tsx
import { useTema } from '../src/tema';
const { cores, escuro, faixa } = useTema();   // cores: os 10 papéis do tema atual
```

- `TemaProvedor` fica em `app/_layout.tsx`. Ele segue o tema do aparelho (claro ou escuro, NF-07) e a letra do sistema (NF-08).
- Os 10 papéis têm os nomes do protótipo em camelCase: `fundo`, `superficie`, `texto`, `textoSuave`, `linha`, `acento`, `sobreAcento`, `atencao`, `separei`, `carro`. **Não existe cor fora deles** (a arte do mascote é a exceção, e não muda).
- Transparência só sobre um papel (`comOpacidade(cores.fundo, 0.88)` no fundo do painel; `linha` a 35 % nas curvas).
- `faixa` vale 100, 130 ou 200: é a letra total do sistema, e decide as adaptações de letra grande (DESIGN.md 4.4).
- `src/cores.ts` ficou só para a tela provisória da B1 (marcado como obsoleto). Telas novas usam `useTema().cores`.

## 3. Texto e tipografia

```tsx
<Texto uso="tituloTela" titulo>{textos.algo.titulo}</Texto>
<Texto uso="secundario" cor="textoSuave">{…}</Texto>
```

- `uso` é uma linha da escala de DESIGN.md 4.2 (`letreiro`, `tituloTela`, `numeroProgresso`, `tituloPainel`, `subtitulo`, `contadorValor`, `fraseAbertura`, `botao`, `legendaArea`, `corpo`, `itemNome`, `linhaNome`, `rotulo`, `legendaNome`, `rotaNome`, `rotaNomeAtual`, `rotaNumero`, `secundario`, `estado`, `filtro`, `filtroLigado`).
- Números sempre tabulares. Nenhum texto abaixo de 15 e nenhum peso abaixo de 400 (teste).
- A caixa alta é só de estilo: o arquivo de textos fica em caixa normal, e o `Texto` passa a frase normal ao leitor de tela.
- A letra do sistema é respeitada até 200 %: o React Native amplia o tamanho e a entrelinha; o `Texto` troca a largura do letreiro (a partir de 130 %), do título e dos rótulos (em 200 %), como o protótipo.
- O texto sempre vem do arquivo de textos da B6 (`apps/mobile/src/textos/pt-BR.json`, por tela; `docs/textos-e-eventos.md`), pelo acesso tipado `textos.tela.chave` ou `t('tela.chave', valores)`. Os componentes usam as chaves comuns que a B6 já tinha (`rota`, `legenda`, `areas`, `acoes`, `estados`, `niveis`, `lista`, `volta`, `criarViagem`, `alertas`) e a B2 acrescentou só `legenda.etapa`, `legenda.alertas`, `campos.opcional`, `mensagens.erroAria` e o grupo `galeria` (tela de desenvolvimento). O lint barra frase escrita no JSX.

## 4. Ícones

```tsx
<Icone nome="carro" ativo cor="carro" recorte="superficie" tamanho={18} />
```

- Os 30 ícones são os do protótipo, copiados sem mudança (um teste compara com `rumo/icones.js`). Nenhum vem de biblioteca.
- `ativo` troca para o símbolo cheio (só os 7 de estado têm). `recorte` é o papel do fundo onde o ícone está (o `--ico-recorte` do protótipo).
- O ícone fica fora da leitura de tela: o nome vem do controle ou do texto ao lado.

## 5. Mascote

```tsx
<Mascote arte="pose-alerta" largura={96} />
```

- Artes: `principal` (176 na abertura, 136 no site), `icone` (24 na rota, 32 na página do convidado), `pose-alerta`, `pose-camping`, `pose-comemorando` (96 no cabeçalho).
- Desenha os bytes exatos do pacote final; só a largura muda. Abaixo de 24, não entra.
- No escuro, a arte colorida fica sobre o papel na cor `texto`, de canto cortado (4, 10 ou 14, conforme o tamanho), como no protótipo.
- **Regra da tela: no máximo um mascote**, e nunca em linha de lista, tabela de gastos ou campo. O componente não tem como conferir isso sozinho: quem monta a tela confere, e o QA olha nas capturas.

## 6. Componentes

Todos têm: propriedades tipadas (TypeScript estrito), variação escura (leem `useTema()`), texto só do arquivo de textos, alvo mínimo de 44 dp e nome falado (`accessibilityLabel`, `accessibilityRole`, `accessibilityState`).

| DESIGN.md | Componente | Propriedades principais | Estados | Leitor de tela | Alvo |
| --- | --- | --- | --- | --- | --- |
| 7.1 | `Rota` | `atual`, `comMascote`, `aoEscolher` | parada comum, atual com mascote, atual com ponto cheio, sem parada atual; 130 % e 200 %: número no lugar do nome; pressão | lista de abas "Rota da viagem"; cada parada "Parada 2 de 5: Carregar. Você está aqui", com `selected` na atual | 64 × 48 |
| 7.2 | `CabecalhoEtapa` | `marca` (use `marcaDaEtapa`), `titulo`, `subtitulo`, `aoVoltar`, `mascote` | com e sem "Voltar", com e sem mascote | título como `header`; "Voltar" como botão | voltar 48 |
| 7.3 | `Botao` | `texto`, `tipo` (`principal` ou `secundario`), `icone`, `desativado` | normal, pressão, desativado | botão, `disabled` | 56 de altura |
| 7.3 | `BotaoMarca` | `texto`, `ligado`, `carro`, `icone`, `alvo` | desligado, ligado, "está no carro" ligado, pressão, desativado | `togglebutton` com `checked` | 44 (48 em "eu levo") |
| 7.3 | `Alternancia` | `icone` (`separei`, `carro`, `conferido`, `secar`, `ciente`), `ligado`, `falado` (obrigatório) | repouso em traço, ligado em símbolo cheio e borda na cor do estado, pressão, desativado | `togglebutton` com `checked`; nome como "Lanterna: está no carro" | 44 × 44 |
| 7.3 | `Filtro` | `texto`, `ligado` | desligado, ligado (`acento`), pressão, desativado | `togglebutton` | 44 |
| 7.3 | `Discreto` | `texto` | normal, pressão | ligação | 44 |
| 7.3 | `BotaoFechar`, `BotaoVoltar` | `aoTocar` | normal, pressão | botão "Fechar" / "Voltar" | 48 × 48 |
| 7.4 | `ItemLista` | `nome`, `quantidade`, `estado` (`aSeparar`, `separei`, `carro`), `aoMudar`, `aoAbrir` | a separar e separei com a faixa `separei`; no carro sem faixa; ícone + texto do estado | a área do nome: "{nome}, {quantidade}, {estado}. Abrir o item"; as duas alternâncias com nome próprio | linha 64; área do nome 52; botões 44 |
| 7.4 | `LinhaEstado` | `estado` (os 8 de DESIGN.md 3.3) | cada estado com ícone, texto e cor | lê o estado por extenso ("separei, fora do carro") | — |
| 7.4 | `Regua` | `feitos`, `total`, `volta`, `curta` | ida (cheio `carro`, vazio com borda `separei`); volta (cheio `texto`, vazio com borda `linha`) | escondida (o número vem no texto ao lado) | — |
| 7.4 | `Categoria` | `nome`, `feitos`, `total`, `volta` | aberta, fechada, pressão | botão com `expanded` e "Cozinha: 1 de 3 no carro" | 56 |
| 7.4 | `FaixaTarefa` | `tarefa`, `feito` | feito ligado e desligado | "{tarefa}: feito" | 44 |
| 7.4 | `Folha`, `Divisoria`, `Faixa` | — | — | — | — |
| 7.5 | `GrupoDeAlertas`, `LinhaAlerta` | `nivel`; `tipo` (`atencao`, `informacao`, `entrou`, `saiu`, `regra`), `texto`, `ciente` | atenção, informação, ajuste da lista, regra; "Ciente" e, depois, "Desfazer" | título do grupo como `header`; botão "{alerta}: Ciente" | linha 56; botão 44 |
| 7.6 | `Selo` | `grande`, `linha`, `naFolha`, `largo` | sobre o fundo, dentro de folha, largo (tela do fato) | um só nome: "6 confirmações. Última: …" | — |
| 7.7 | `Legenda` (ou `BotaoLegenda` + `PainelLegenda`) | `fato`, `atual`, `aoEscolher` | fechada, aberta, entrada atual sublinhada; 200 %: só "LEGENDA" | botão "Legenda: camping, grupo, gastos" com `expanded`; painel modal, fecha com o "voltar" do Android, anuncia "Legenda aberta. Camping, grupo e gastos." | botão 48; fechar 48; ligações 48 |
| 7.8 | `Rodape` | `acoes`, `discreto`, `legenda` | — | — | — |
| 7.9 | `CampoTexto` | `rotulo`, `valor`, `opcional`, `longo`, `erro`, `desativado`, `tipo` | normal, com foco (borda `texto`), erro (borda `atencao`, ícone e texto), desativado | rótulo, "opcional" e o erro no nome do campo | 48 (96 longo) |
| 7.9 | `Opcoes`, `Opcao` | `rotulo`; `texto`, `escolhida` | escolhida (borda `texto`, peso 700, bolinha cheia), pressão, desativada | grupo de rádio; `radio` com `checked` | 48 |
| 7.9 | `Contador` | `campo`, `valor`, `minimo`, `maximo` | normal, no limite (passo desativado) | "Adultos, menos um" / "mais um"; valor anunciado | linha 56; passos 44 |
| 7.9 | `CaixaMarcar` | `texto`, `marcada`, `desativado` | marcada (fundo `texto`, visto `fundo`), desmarcada, desativada | `checkbox` com `checked` | 44 |
| 7.9 | `Resultado` | `nome`, `detalhe`, `escolhido` | escolhido (faixa `texto` e a palavra "escolhido") | `radio` com `checked` | 56 |
| 7.10 | `Vazio` | `texto` | — | lido normalmente | — |
| 7.10 | `Mensagem` | `texto` | some quando está vazia | região anunciada (`polite`) | — |
| 7.10 | `MensagemErro` | `mensagem`, `acao`, `aoAgir` | erro com ação | região anunciada; "Erro: {mensagem}" | ação 56 |
| — | `Tela` | `rodape`, `curvas` | — | — | — |
| — | `Curvas` | `forte` | — | escondidas | — |

## 7. Decisões

### 7.1 Decisões provisórias do orquestrador (valem até a validação humana ao fim da Base)

| # | Decisão | Como está no código |
| --- | --- | --- |
| D-2 | Piso de contraste 4,5 para todo par texto/fundo, botões inclusive; os valores da Eucalipto não mudam | `contraste.ts` (`PISO_TEXTO`); o teste confere os 11 pares de texto de DESIGN.md 3.2, nos dois temas, e cada estado dos controles. Os 3 pares de forma (`linha`, `acento` sobre fundo) seguem 3:1 (DESIGN.md 9) |
| D-5 | Forma visual do erro definida aqui, dentro de 7.10, com ícone próprio + texto + ação, nunca só por cor | ver 7.2 abaixo |
| D-7 | Alvos de 44 na unidade da plataforma | dp no Android; tokens `alvo` (44, 48, 56, 64) e um teste |
| P-1 | Gorro fixo em `#3EA8AE` | as artes são as do pacote, sem troca de cor; o teste confere |
| P-2 | Só as expressões que o Rumo usa | 5 artes: `principal`, `icone`, `pose-alerta`, `pose-camping`, `pose-comemorando` |
| P-4 | O 3D não entra no app nesta fase | nenhum modelo 3D no app |

### 7.2 Decisões desta feature (provisórias, para o QA e o responsável conferirem)

| Ponto | O protótipo diz | Escolha | Por quê |
| --- | --- | --- | --- |
| **Erro (D-5)** | `.mensagem`: frase em peso 600, sem cor nem ícone | `MensagemErro`: folha (`superficie`, borda 1 `linha`), **faixa de 4 `atencao`** à esquerda, **ícone `atencao` cheio**, a frase em `texto` peso 600 e um **botão secundário com a ação** ("Tentar de novo"). Região anunciada, nome falado "Erro: {mensagem}". Erro de campo: borda de 2 `atencao`, e embaixo o ícone e a frase em `atencao` (5,88 a 8,35 de contraste) | Ícone + texto + ação, como pede D-5 e a SPEC §7; reaproveita o ícone e a faixa que o Rumo já tem, sem cor nova |
| **Pressão** | não desenha | superfícies (`superficie`) passam para `fundo`; o principal passa de `acento` para `texto` com letra `fundo` (13,40 / 15,47); o que está ligado em `texto` passa para `acento` com letra `sobreAcento` | Sem opacidade, sem sombra, sem cor nova, sem animação; o retorno é imediato e continua legível ao sol |
| **Desativado** | não desenha | fundo `fundo`, borda `linha`, letra e ícone `textoSuave` (6,74 / 9,10); o leitor de tela diz "desativado" | Sem opacidade: a letra continua com contraste ≥ 4,5 (D-2), ao contrário do cinza claro comum |
| **Foco** | contorno de 3 `texto`, afastado 2 | o app não desenha contorno próprio; o TalkBack desenha o dele | No celular, o foco é o do leitor de tela; contorno de teclado fica para quando houver teclado (não pedido) |
| **Fonte** | Archivo variável, eixos de largura e peso | 12 arquivos fixos, cortados da mesma fonte variável com a ferramenta oficial `fontTools` | O React Native no Android não aplica eixos de fonte variável. A licença OFL permite e não reserva nome (`assets/fontes/archivo/LEIA-ME.md`) |
| **Palavra que não cabe** | DESIGN 4.4: nenhuma palavra partida (o navegador encolhe o texto até a palavra mais longa) | o `Texto` mede a largura que tem e, se a palavra mais longa não cabe, diminui só o necessário, pela largura de cada letra lida da própria fonte (`tema/metricas.json`, gerado das fontes); em 200 % a categoria põe o nome numa linha e a régua embaixo, e o título de painel e o selo passam à largura 100 com espaço 0,01 em | O Android quebra a palavra letra a letra quando ela não cabe ("Co/zin/ha", "CONFIRMAÇ/ÕES"; QA B2, rodada 1) |
| **Carregamento da fonte** | — | a navegação fica montada desde o início (o link de abertura acha a tela) e o fundo cobre a tela até a Archivo carregar; até lá, o `Texto` usa a fonte do sistema e troca de família quando a fonte chega | Achado na B2: esperar a fonte antes de montar a navegação perdia o link `campinguim://galeria` em app recém-instalado ("rota não encontrada"); e texto medido com a fonte do sistema ficava cortado depois que a Archivo chegava ("Clar" no lugar de "Claro"). A troca de família força a nova medida |
| **Barra de status** | — | a `Tela` começa abaixo da barra de status pela maior altura entre a área segura e a altura que o Android informa (`StatusBar.currentHeight`) | Na abertura a frio a área segura pode chegar zerada, e o conteúdo rolado aparecia sob o relógio (QA B2, rodada 1) |
| **Mascote no escuro** | arte clara sobre o papel `texto` | igual: só a versão clara entra; a versão de contorno creme do pacote não é usada | É o que o protótipo faz (`_compartilhado/mascote.js` usa `vetor/claro`) |
| **Rota** | `nav` com `ol` de ligações e `aria-current="step"` | lista de abas, com `selected` na parada atual | O Android não tem "passo atual"; "selecionado" é o que o TalkBack lê com o mesmo sentido |
| **Legenda** | painel que desliza, foco preso, Esc fecha | painel modal sem animação; o foco fica no painel (modal do Android); o "voltar" do Android fecha; toque fora fecha | Movimento até 200 ms (DESIGN.md 5) e respeito a quem desliga animações, sem depender disso |
| **Linha "Ciente"** | `.alt-ciente` e `.marca` | `LinhaAlerta` usa o alternado de texto: "Ciente" e, depois de marcado, "Desfazer" (DESIGN.md 7.10) | Igual ao protótipo da tela 3 |
| **Alternância `ciente`** | só troca a cor (o ícone `ciente` não tem versão cheia) | igual ao protótipo; o estado ligado chega ao leitor por `checked` | Ícone desenhado no protótipo; mudar seria redesenho |
| **Galeria** | — | rota `campinguim://galeria`, só quando a configuração é do ambiente `local` | Ferramenta do QA; nunca aparece num app de loja |
| **Testes do tema no Vitest** | — | os testes de `apps/mobile/src/**/*.test.ts` rodam no projeto `core` do Vitest, que já inclui `apps/*/src/**/*.test.ts` desde o main (a B2 não muda `vitest.config.ts`) | O `npm run testar` já roda `core`: o teste do contraste entra na suíte sem mexer em `scripts/` nem na configuração |

## 8. Como conferir

1. Gere e instale o app (`npm run app:gerar` e `npm run app:instalar`, com o `campinguim-a` ligado).
2. Abra a galeria com o app fechado: `adb -s emulator-5554 shell am start -S -a android.intent.action.VIEW -d campinguim://galeria` (o `-S` fecha o app antes). Observado na B2: com o app já aberto, o link chega ao app mas não troca de tela; isso vem da navegação da base e fica registrado para a feature que tratar links (SPEC §7).
3. Na galeria: escolha a seção, force o tema (do aparelho, claro, escuro) e simule a letra (100, 130, 200 %). A simulação soma à letra do sistema.
4. Condições reais do sistema (e devolva ao padrão no fim):

```
adb -s emulator-5554 shell cmd uimode night yes        # tema escuro (no fim: night no)
adb -s emulator-5554 shell settings put system font_scale 1.3   # letra 130 % (2.0 para 200 %; no fim: 1.0)
adb -s emulator-5554 shell wm size 1080x1920 && adb -s emulator-5554 shell wm density 440   # tela de 5 polegadas (no fim: wm size reset e wm density reset)
```

5. Roteiro automático: `npm run testar:jornadas -- fumaca` abre a galeria e captura cada seção (`e2e/jornadas/fumaca/galeria.yaml`). As capturas vão para `test-results/jornadas/`.
6. Evidências da entrega: `docs/evidencias/B2/`.

## 9. Fora desta feature

- As telas do app (etapa 1 em diante) montam estes componentes; a B2 não faz tela de produto.
- O gesto de deslizar entre paradas está como regra pura (`direcaoDoGesto`); quem liga o gesto é a tela.
- O site e a página do convidado (`apps/web`) só receberam as cores; os componentes web ficam para a etapa 2.
- A conferência de "um mascote por tela" é de quem monta a tela (seção 5).

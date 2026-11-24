# Protótipos do Campinguim · como abrir e como construir

DSG-01 · etapa 0 (base) · 24/11/2026. Contrato: `direcao/padrao-producao.md`, `direcao/telas.md`, `direcao/direcoes.md`, `direcao/concorrentes.md`.

## Como abrir

- Duplo clique em `index.html` (abre por `file://`), ou qualquer servidor estático apontado para esta pasta. Nada a instalar, nada vai para a rede.
- `index.html`: as cinco direções lado a lado, com a lista como amostra. `comparacao.html`: a lista nas cinco, claro e escuro. `avaliacao.html`: a folha de avaliação (as notas ficam só neste navegador; "Copiar como texto" leva tudo para onde quiser). `recomendacao.html`: a recomendação da Cinema, no fim.
- Enquanto uma direção não está aprovada pelo QA, ela aparece como "Em produção". Enquanto a pasta de uma direção não existe, o console do navegador mostra o aviso de arquivo não encontrado para `<pasta>/ficha.js`: é esperado e some quando a pasta é criada.
- Parâmetros de endereço (em qualquer tela): `tema=claro|escuro`, `fonte=100|130|200`, `moldura=0`, `avaliador=0`, `novo=1`. Sem `tema`, vale o tema do aparelho. `novo=1` apaga tudo o que o protótipo guardou no navegador e volta ao estado de `dados.js`.
- Como levar ao celular (P-22): decisão do orquestrador. Os protótipos funcionam por arquivo e por servidor estático.

## O que há na base

| Arquivo | O que é |
| --- | --- |
| `_compartilhado/dados.js` | Único arquivo de dados, escrito de `telas.md`. Valores em centavos. Cada proposta provisória com `provisorio: "P-nn"`; índice em `provisorias`. |
| `_compartilhado/textos.js` | Textos comuns, pt-BR: estados, categorias, campos, opções, áreas, nomes das telas, ações, mensagens, barra do avaliador, páginas de apresentação, texto alternativo do mascote. P-18 e P-19 marcados com `/* P-nn */`. |
| `_compartilhado/mascote.js` | As 8 artes do mascote, byte a byte (base64). Origem e SHA-256: `_compartilhado/mascote-origem.md`. |
| `_compartilhado/base.js` | Textos, dados, mascote, tema, fonte, moldura, barra do avaliador e utilidades. |
| `_compartilhado/base.css` | Fontes (`@font-face`), moldura, barra, foco, movimento reduzido, estilo neutro das páginas de apresentação. |
| `_compartilhado/fontes/<familia>/` | Os `.ttf` e o `OFL.txt` de cada família (tabela abaixo). |
| `index.html`, `comparacao.html`, `avaliacao.html`, `recomendacao.html` | Páginas de apresentação. Leem `<pasta>/ficha.js` e `<pasta>/textos.js` de cada direção. |
| `recomendacao-dados.js` | Conteúdo da recomendação; vazio (`pronta: false`) até a etapa 3. |

## Como o construtor de uma direção usa a base

Cada direção escreve só na própria pasta (`brasa/`, `clareira/`, `oficina/`, `rumo/`, `roda/`), com os arquivos da seção 2 do padrão. Nada de cópia local de dado, texto comum, fonte ou mascote.

### Esqueleto de uma tela

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title data-texto="titulo.lista"></title>
<link rel="stylesheet" href="../_compartilhado/base.css">
<link rel="stylesheet" href="estilo.css">
</head>
<body data-tela="4">
  <main> ... a tela, com um único <h1> ... </main>
  <script src="../_compartilhado/dados.js"></script>
  <script src="../_compartilhado/textos.js"></script>
  <script src="../_compartilhado/mascote.js"></script>
  <script src="textos.js"></script>
  <script src="icones.js"></script>
  <script src="ficha.js"></script>
  <script src="../_compartilhado/base.js"></script>
  <script> /* código da tela, se houver: só monta elementos e lê window.CAMPINGUIM */ </script>
</body>
</html>
```

- `data-tela`: `"1"` a `"15"` nas telas, `"identidade"` na página de identidade. É o que liga a moldura, a barra do avaliador e a posição "Tela 4 de 15".
- Todo o conteúdo do app fica antes dos scripts. `base.js` move esse conteúdo para dentro da tela do celular (`.cg-tela` > `.cg-rolagem`).
- A ordem dos scripts é essa: `base.js` depois dos dados, textos, mascote, ícones e ficha; o código da tela por último.

### Globais em `window`

| Global | De onde | O que tem |
| --- | --- | --- |
| `CAMPINGUIM_DADOS` | `_compartilhado/dados.js` | O cenário inteiro (família, viagem, alertas, ajustes, regras, lista, item, aviso de saída, estadia, volta, em casa, fato, grupo, gastos, camping sem dados, convidado, site). |
| `CAMPINGUIM_TEXTOS` | `_compartilhado/textos.js` | Textos comuns. |
| `CAMPINGUIM_TEXTOS_DIRECAO` | `<direcao>/textos.js` | Textos com o tom da direção. |
| `CAMPINGUIM_MASCOTE` | `_compartilhado/mascote.js` | `nomes`, `artes`, `svg(nome)`. |
| `CAMPINGUIM_DIRECOES` | `<direcao>/ficha.js` | A ficha de cada direção (seção 10 do padrão). |
| `CAMPINGUIM` | `_compartilhado/base.js` | As funções abaixo. |

`window.CAMPINGUIM`:
- `texto(chave, valores)`: o texto pronto (ou `null`); `{n}` no texto é trocado por `valores.n`.
- `dado("lista.total")`, `dados`: leitura de `dados.js`.
- `dinheiro(centavos)`: `12345` vira `"R$ 123,45"`. Nunca recalcule a divisão: os valores estão em `gastos`.
- `itens()`, `item(id)`, `categoria(id)`: a lista, já com a categoria de cada item.
- `progresso(estados, idCategoria)`: conta total, no carro, separei e a separar; `estados` é `{ idDoItem: "carro" | "separei" | "a_separar" }` com o que mudou no protótipo.
- `nomeFalado(item, estado)`: "<nome>, <quantidade>, separei, fora do carro" (para `aria-label` da linha).
- `mascote(nome, { texto: "" })`: cria o elemento do mascote (ver abaixo).
- `aplicar(elemento)`: preenche textos, dados e mascote dentro do elemento (raramente necessário: a base observa a página e preenche sozinha o que for criado ou trocado).
- `tema()`, `definirTema("claro"|"escuro")`, `fonte()`, `definirFonte("100"|"130"|"200")`.
- `anunciar(texto)`: fala ao leitor de tela (abertura de folha, cópia feita).
- `prenderFoco(painel, aoFechar)`: prende o foco numa folha ou painel aberto, deixa o resto da tela inerte, fecha com Esc; devolve a função que solta (chame ao fechar). Use `role="dialog"` e `aria-labelledby` no painel.
- `copiar(texto)`: copia para a área de transferência; devolve `Promise<boolean>`.
- `guardado.ler(chave, padrao)`, `guardado.gravar(chave, valor)`, `guardado.remover(chave)`: estados marcados durante o teste, lado das abas da Oficina. Sempre com tentativa protegida; a tela tem de funcionar igual sem eles, e `?novo=1` apaga tudo.
- `telas` (as 15, com `arquivo`), `tela` (a atual), `pasta`, `parametros`, `elementoTela`, `elementoRolagem`.

### Como marcar texto

- `data-texto="chave"`: o texto do elemento. `data-texto-aria="chave"`: o `aria-label`. `data-texto-placeholder="chave"`: o `placeholder`.
- `data-valores='{"feitos":1,"total":2}'`: valores para as marcas `{...}` do texto. Os números vêm de `dados.js` pelo código da tela (por exemplo, `CAMPINGUIM.progresso()`), nunca escritos à mão.
- `data-dado="camping.nome"`: o valor de `dados.js` (texto ou número). `data-dinheiro="gastos.totalCentavos"`: o valor em reais.
- Ordem de busca: primeiro `<direcao>/textos.js`, depois `_compartilhado/textos.js`. A direção pode reescrever no seu tom as chaves `acao.`, `mensagem.`, `bloco.`, `pergunta.` e criar as suas (títulos, frases, rótulos, `direcao.nome`...). **Não pode** redefinir `estado.`, `categoria.`, `filtro.`, `nivel.`, `ajuste.`, `campo.`, `opcao.`, `area.`, `tela.`, `mascote.`, `gastos.situacao.` nem os textos da barra e das páginas de apresentação: a base ignora e mostra erro no console.
- Chave sem texto aparece como `[chave]` em vermelho e dá erro no console. A base também avisa no console se a página não tiver `lang="pt-BR"`, `<title data-texto>` ou exatamente um `<h1>`.
- Texto do cenário (nomes, números, camping, itens) só de `dados.js`. Texto provisório da direção, se houver, marcado com `/* P-nn */`.

### Como pedir o mascote

- No HTML: `<span data-mascote="pose-alerta" data-mascote-texto=""></span>`. Com `data-mascote-texto` (vazio = o texto alternativo padrão da arte, ou uma chave), ele informa: `role="img"` e `aria-label`. Sem o atributo, é enfeite: `aria-hidden="true"`.
- Artes: `principal`, `pose-neutro`, `pose-comemorando`, `pose-alerta`, `pose-camping`, `icone`, `uma-cor`, `sem-acessorio`.
- Trocar a pose (por exemplo, de `pose-alerta` para `pose-comemorando` no aviso de saída): mude o atributo `data-mascote`; a base troca o desenho.
- A base põe o SVG original, sem alteração, dentro do `<span class="cg-mascote" data-arte="...">`. No CSS da direção só é permitido: `width` no `.cg-mascote` (a altura acompanha) e, **só** em `.cg-mascote[data-arte="uma-cor"] path`, `fill` com uma cor da paleta. Nada de `transform`, recorte, filtro, opacidade ou animação no mascote. No máximo um por tela (a base avisa no console se houver mais). O apoio do tema escuro (halo, clareira, etiqueta, papel, emblema) é um elemento da direção atrás do `span`.

### Como a moldura entra

- A base cria `.cg-palco` > (`.cg-avaliador` +) `.cg-moldura` > `.cg-tela` > `.cg-rolagem` > o conteúdo da página. A direção não mexe em nenhum deles.
- No computador (janela de pelo menos 700 × 760 px), `.cg-tela` tem exatamente 390 × 844 px, dentro da borda de 12 px; no celular, ocupa o espaço abaixo da faixa do avaliador. `moldura=0` e `avaliador=0` desligam cada um.
- `.cg-tela` é o contêiner da tela: `position: fixed` dentro do app fica preso a ela (barras de abas, botão flutuante, folhas), e `@container cg-tela (...)` mede a largura da tela. Use isso, não `@media` de largura, nem `100vh`/`100dvh`: a altura da tela é a de `.cg-rolagem` (`min-height: 100%` no seu contêiner raiz).
- Áreas seguras do celular: `var(--cg-seguro-topo)`, `var(--cg-seguro-baixo)`, `var(--cg-seguro-esquerda)`, `var(--cg-seguro-direita)` (zero dentro da moldura).
- Tema: a base põe `data-tema="claro"` ou `"escuro"` no `<html>`. Os 10 papéis de cor vão em `estilo.css`, em `:root` (claro) e em `[data-tema="escuro"]`, com os nomes `--fundo`, `--superficie`, `--texto`, `--texto-suave`, `--linha`, `--acento`, `--sobre-acento`, `--atencao`, `--separei`, `--carro`.
- Fonte ampliada: a base muda o tamanho da raiz para 100, 130 ou 200 %; escreva tamanhos em `rem`. A barra do avaliador não cresce.
- Foco visível de 3 px em `--texto` e movimento desligado com `prefers-reduced-motion` já vêm da base.
- Fontes: `font-family` pelo nome da família (tabela abaixo) ou pelas pilhas prontas `--cg-fonte-fraunces`, `--cg-fonte-atkinson`, `--cg-fonte-figtree`, `--cg-fonte-plex-condensada`, `--cg-fonte-plex-mono`, `--cg-fonte-archivo`, `--cg-fonte-bricolage`, `--cg-fonte-lexend`. Eixos variáveis: `font-weight`, `font-stretch` (Archivo 62 a 125 %, Bricolage 75 a 100 %) e `font-variation-settings` (Fraunces `SOFT`, `WONK`, `opsz`).

### Ficha da direção (`<direcao>/ficha.js`)

```js
window.CAMPINGUIM_DIRECOES = window.CAMPINGUIM_DIRECOES || {};
window.CAMPINGUIM_DIRECOES["brasa"] = {
  pronta: false,                 /* true só depois da aprovação do QA */
  numero: 1,                     /* ordem de direcoes.md */
  nome: "direcao.nome",          /* chaves de <direcao>/textos.js */
  territorio: "direcao.territorio",
  frase: "direcao.frase",
  navegacao: "direcao.navegacao",
  inicio: "01-abertura.html",
  amostra: "04-lista.html",
  identidade: "identidade.html",
  cores: { claro: { fundo: "#F6EFE6", acento: "#9A4A12" }, escuro: { fundo: "#15110E", acento: "#F3A847" } }
};
```

A barra do avaliador mostra o nome da direção a partir de `nome`. As páginas de apresentação carregam a ficha e os textos de cada pasta, um de cada vez; por isso `<direcao>/textos.js` só deve atribuir `window.CAMPINGUIM_TEXTOS_DIRECAO = { ... }`, sem depender de outro arquivo.

## Fontes

Baixadas uma única vez em 24/11/2026, às 08:57 (horário de Brasília), do repositório oficial `github.com/google/fonts`, ramo `main`, pasta `ofl/` (P-21), exatamente os arquivos da seção 5 do padrão, cada família com o seu `OFL.txt`. Licença: SIL Open Font License 1.1. Os arquivos variáveis foram renomeados sem os colchetes (`-variavel`); o conteúdo não mudou.

| Família | Arquivo no repositório | Arquivo no projeto | SHA-256 |
| --- | --- | --- | --- |
| Fraunces | `ofl/fraunces/Fraunces[SOFT,WONK,opsz,wght].ttf` | `fontes/fraunces/Fraunces-variavel.ttf` | `177ff6c0f14e5550a3c624247cd1189611d4eb65d000b14944c63d967958abbb` |
| Fraunces | `ofl/fraunces/OFL.txt` | `fontes/fraunces/OFL.txt` | `bdf4c22802eaf804f998195871c6b8938aac2ac14b2d78a8bd66a6f1eced833b` |
| Atkinson Hyperlegible | `ofl/atkinsonhyperlegible/AtkinsonHyperlegible-Regular.ttf` | `fontes/atkinsonhyperlegible/AtkinsonHyperlegible-Regular.ttf` | `7fb917c89019896d0b52ee84b7cbb3304c18cb90b19a62f5e32712bd23e97669` |
| Atkinson Hyperlegible | `ofl/atkinsonhyperlegible/AtkinsonHyperlegible-Bold.ttf` | `fontes/atkinsonhyperlegible/AtkinsonHyperlegible-Bold.ttf` | `5a3b0c8cc8ca545155150b4512a1fa248298df121c50d6557e651e61fbdab92f` |
| Atkinson Hyperlegible | `ofl/atkinsonhyperlegible/OFL.txt` | `fontes/atkinsonhyperlegible/OFL.txt` | `f32d22b3908fcad2c86a74000614ec22e6a7f66ea7e867e616026a27aebdc143` |
| Figtree | `ofl/figtree/Figtree[wght].ttf` | `fontes/figtree/Figtree-variavel.ttf` | `26ad3db9b31ff7dde67a91ff515d022d2f495cd506590699cf264f0bfe6fb714` |
| Figtree | `ofl/figtree/Figtree-Italic[wght].ttf` | `fontes/figtree/Figtree-Italic-variavel.ttf` | `94dec1f18b9275d69e8b4a91b6514bdc18199048347e1c36e1285b11b0b87653` |
| Figtree | `ofl/figtree/OFL.txt` | `fontes/figtree/OFL.txt` | `140d37233e7f3ce7313798befa9600893bcceaf41a55fa0fa5ad52f7f657a268` |
| IBM Plex Sans Condensed | `ofl/ibmplexsanscondensed/IBMPlexSansCondensed-Regular.ttf` | `fontes/ibmplexsanscondensed/IBMPlexSansCondensed-Regular.ttf` | `e7437c072eef2ef592ae6f2beb0000446287385907abb57ac1cf07bcbaa2aa33` |
| IBM Plex Sans Condensed | `ofl/ibmplexsanscondensed/IBMPlexSansCondensed-Medium.ttf` | `fontes/ibmplexsanscondensed/IBMPlexSansCondensed-Medium.ttf` | `426350c298277f7f9d1a93956572799ca3d16e2d43e7f60eec8382bcd795ec30` |
| IBM Plex Sans Condensed | `ofl/ibmplexsanscondensed/IBMPlexSansCondensed-SemiBold.ttf` | `fontes/ibmplexsanscondensed/IBMPlexSansCondensed-SemiBold.ttf` | `a081ca60548aea14100757a2d6fe71ca60fd90ebce779c9a8ae5a0c8fb4526d4` |
| IBM Plex Sans Condensed | `ofl/ibmplexsanscondensed/OFL.txt` | `fontes/ibmplexsanscondensed/OFL.txt` | `7e6b2818edbd8f6a01ae80641cc8f16a51080d08fb4e532be3a0b6f74adb07da` |
| IBM Plex Mono | `ofl/ibmplexmono/IBMPlexMono-Regular.ttf` | `fontes/ibmplexmono/IBMPlexMono-Regular.ttf` | `6a3412f058c7d8dfd9170c41e85ade48e5156ecb89356110ca57a0a27734af46` |
| IBM Plex Mono | `ofl/ibmplexmono/IBMPlexMono-Medium.ttf` | `fontes/ibmplexmono/IBMPlexMono-Medium.ttf` | `a9b4c49bb299e05b5f6c481e7fb5e78943d2793249a0c8874ab574a2d1ea6755` |
| IBM Plex Mono | `ofl/ibmplexmono/OFL.txt` | `fontes/ibmplexmono/OFL.txt` | `7e6b2818edbd8f6a01ae80641cc8f16a51080d08fb4e532be3a0b6f74adb07da` |
| Archivo | `ofl/archivo/Archivo[wdth,wght].ttf` | `fontes/archivo/Archivo-variavel.ttf` | `0e094a7d3c7c4c25cf1310c4b30014f1dae9332220b1c2c88f4fa996f0b05053` |
| Archivo | `ofl/archivo/OFL.txt` | `fontes/archivo/OFL.txt` | `108b4e57c9c796d3d38d0428ca7ee39de47ad93187302718d9b2d8864b9b716b` |
| Bricolage Grotesque | `ofl/bricolagegrotesque/BricolageGrotesque[opsz,wdth,wght].ttf` | `fontes/bricolagegrotesque/BricolageGrotesque-variavel.ttf` | `413e7357809ddd12fd80a96a8a396de0e401638d4acd3cb3e37532f0472ac682` |
| Bricolage Grotesque | `ofl/bricolagegrotesque/OFL.txt` | `fontes/bricolagegrotesque/OFL.txt` | `4b5a7d8f37f5602621c8a8d7358a6a2e71317e6c231c661e15aef0275d3e07ba` |
| Lexend | `ofl/lexend/Lexend[wght].ttf` | `fontes/lexend/Lexend-variavel.ttf` | `3add53e641fbc81da64da4bb254285e2831b52b029527bc0714e2b9610832ee6` |
| Lexend | `ofl/lexend/OFL.txt` | `fontes/lexend/OFL.txt` | `5da8505887d0fa7fe963445fd58852707fda34adfeb65af25c99d152bab285bd` |

## Mascote

Origem: pacote final do mascote (MSC-08, aprovado), `design/mascote/final/vetor/claro/`, idêntico byte a byte à opção 03 aprovada (`design/mascote/apresentacao/opcoes/03/arte/`). Tabela com o SHA-256 de cada arte em `_compartilhado/mascote-origem.md`. A versão escura com contorno do pacote final não entra agora: no tema escuro, a versão colorida continua sobre o apoio claro de cada direção (`direcoes.md`).

## Opções de cor do Rumo

**Escolha do responsável (DSG-05, 24/11/2026): protótipo Rumo, paleta Eucalipto, mascote 03.** A identidade visual que vale para o app está em `docs/DESIGN.md`. O Rumo é a referência visual do desenvolvimento e do QA (DSG-06).

A pedido do responsável, o Rumo tem cinco paletas, com a mesma estrutura: só os valores dos 10 papéis de cor mudam. São elas `eucalipto` (a escolhida e a padrão), `original` (a primeira, aprovada pelo QA no commit `1c074c4`), `geleira`, `pitanga` e `jabuticaba`.

- `rumo/estilo.css`, seção 1b: os valores de cada paleta, em `:root[data-paleta="<nome>"]` e `[data-tema="escuro"]`.
- `rumo/paleta.js`:
  - lê `?paleta=<nome>` e põe `data-paleta` no `<html>`;
  - **sem parâmetro, ou com um nome desconhecido, vale a Eucalipto.** Abrir `rumo/04-lista.html` direto já mostra a cor certa;
  - `?paleta=original` mostra a Original, idêntica à aprovada, e passa de tela em tela como as outras;
  - a paleta passa de tela em tela pelo endereço: o script acrescenta `paleta=` às ligações da pasta `rumo/` (na Eucalipto não precisa, porque ela é a padrão), e nada fica guardado no navegador.
- `rumo/paletas.html` (ligada na identidade do Rumo): as cinco paletas lado a lado, com a Eucalipto marcada como "Escolhida". Cada uma traz as cores, as miniaturas das telas e o botão "Abrir o protótipo com esta paleta".
- `rumo/identidade.html` mostra a paleta que está aberta e diz se é a oficial. Sem parâmetro, mostra a Eucalipto.
- `rumo/ficha.js` dá ao cartão do Rumo na página inicial as cores da Eucalipto. Por isso, a página inicial e a comparação, que abrem o Rumo sem parâmetro, mostram o Rumo na Eucalipto.

**Miniaturas.** `rumo/paletas/` tem 30 PNG: 5 paletas × telas 1, 4 e 3 (abertura, lista, alertas) × claro e escuro.
- Nome de cada arquivo: `<paleta>-<arquivo da tela sem .html>-<tema>.png`, por exemplo `geleira-04-lista-escuro.png`.
- Como foram feitas: capturas das telas reais tiradas com Playwright no Google Chrome instalado.
  - Janela de 390 × 844 px, densidade 1, só a área visível.
  - Endereço `<tela>.html?novo=1&moldura=0&avaliador=0&fonte=100&tema=<claro|escuro>&paleta=<nome>`. Na primeira geração, a Original saiu sem `paleta`, que na época era o padrão; hoje ela pede `paleta=original`, e a imagem é a mesma.
  - Cada captura esperou o fim da carga (`networkidle`) mais 400 ms.
- São imagens, e não iframes, porque com 30 iframes `file://` o Chrome não termina a carga para as ferramentas de medição e deixa em branco, nas capturas de página inteira, as miniaturas fora da área visível.
- O script que gerou as miniaturas era temporário e foi apagado. Para refazer, rode com `python -I`, de qualquer pasta, as linhas abaixo:

```python
import pathlib
from playwright.sync_api import sync_playwright
rumo = pathlib.Path(r"design\prototipos\rumo")
with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome")
    for pal in ["original", "geleira", "pitanga", "eucalipto", "jabuticaba"]:
        for tela in ["01-abertura", "04-lista", "03-alertas"]:
            for tema in ["claro", "escuro"]:
                pg = b.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=1)
                q = f"?novo=1&moldura=0&avaliador=0&fonte=100&tema={tema}&paleta={pal}"
                pg.goto((rumo / f"{tela}.html").as_uri() + q, wait_until="networkidle"); pg.wait_for_timeout(400)
                pg.screenshot(path=str(rumo / "paletas" / f"{pal}-{tela}-{tema}.png")); pg.close()
    b.close()
```

**Condição do QA.** As 30 miniaturas são refeitas sempre que mudar qualquer uma destas coisas:
- a tela 1, 3 ou 4 do Rumo;
- os valores de uma paleta;
- o que essas telas leem da base: dados, textos ou mascote.

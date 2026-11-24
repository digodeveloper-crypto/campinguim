# Etapa 3 · páginas de apresentação (sem a recomendação) · rodada 1 · APROVADA, com 1 ajuste para uso por servidor

Data: 2026-11-24 · Base: `qa/roteiro.md`, seção 4; `padrao-producao.md`, seção 10 · Estado: as cinco fichas com `pronta: true`. A recomendação da Cinema (pane-613) fica para o relatório próprio, quando for entregue.

**Resumo:**
- A página inicial mostra as cinco direções lado a lado, com nome, território, frase, amostra da lista, "Abrir o protótipo" e "Identidade", e a recomendação só no fim.
- A comparação mostra a tela 4 das cinco em claro e escuro, na mesma escala.
- A folha de avaliação tem os 8 critérios para cada uma das cinco, guarda as notas e copia tudo como texto.
- Por arquivo: **0 erro de console**, 0 pedido externo, 0 alvo pequeno, 0 texto abaixo do AA e sem rolagem lateral, nas quatro páginas, em 390 e 1440, claro e escuro.
- Servida por endereço local: as quatro páginas e as telas de amostra das cinco direções abrem sem erro, menos **1 aviso de arquivo não encontrado (`/favicon.ico`)** na primeira página aberta (ver "Ajuste").

**Evidências** em `qa/relatorios/apresentacao-r1/`: 16 capturas (`index`, `comparacao`, `avaliacao`, `recomendacao` × celular e computador × claro e escuro) e `saida.txt`.

| Item (roteiro, seção 4) | Resultado | Como conferi |
| --- | --- | --- |
| Página inicial | ok: as 5 em ordem (Brasa, Clareira, Oficina, Rumo, Roda), cada uma com direção, nome, território, frase, a tela 4 como amostra e os links "Abrir o protótipo" (`<pasta>/01-abertura.html`) e "Identidade". "Comparar a lista nas cinco" e "Folha de avaliação" ficam no topo. "Recomendação da Cinema" fica no fim, discreta, depois de um fio | `index-*.png`; lista de links |
| Comparação | ok: a tela 4 das cinco em claro e em escuro, lado a lado e na mesma escala (10 molduras), com o nome e o tema de cada uma. Carrega em 0,7 s; 138 pedidos, todos locais; nada depois do carregamento | `comparacao-*.png` |
| Folha de avaliação | ok: os 8 critérios (Primeira impressão, Clareza, Lista, Alertas, Sol, Uma mão, Premium, Mascote) para cada uma das 5 direções. A nota marcada fica guardada depois de recarregar. "Copiar como texto" gera "Avaliação dos protótipos do Campinguim", com as 5 direções e os 8 critérios, e "sem nota" onde não há nota | teste no navegador |
| Console | ok por arquivo: 0 erro nas 4 páginas. Os 10 avisos de `ficha.js` não encontrado da etapa 0 sumiram, porque as cinco pastas existem | `saida.txt` |
| Distinção (3.16), as cinco lado a lado | ok: cinco linguagens que não se confundem. Brasa: escuro quente, folhas que sobem, serifa macia. Clareira: verde de mata, 4 abas, marca de trilha. Oficina: lona e aço, divisórias na borda, mono nas quantidades, costura. Rumo: papel e tinta, rota de 5 paradas, letreiro largo, legenda. Roda: sol e ameixa, mural, emblemas. Sem os traços proibidos de `concorrentes.md`: sem chama, bússola, rosa dos ventos, pino de mapa, flor-de-lis, corda, faixa zebrada, verde lima nem envelope (os ícones só citam esses nomes em comentários que os proíbem) | `comparacao-*.png`, `index-*.png`, busca nos `icones.js` |

## Ajuste (não reprova o uso por arquivo; necessário para o uso por servidor)

- **`/favicon.ico` não encontrado por servidor.** Servidas por endereço (`http://`), as páginas de apresentação não declaram ícone. Por isso o navegador pede `/favicon.ico` uma vez e mostra "Failed to load resource: 404" no console da primeira página aberta. As telas das direções não têm o problema: todas declaram `<link rel="icon" href="data:,">`.
- **Correção:** a mesma linha nas 4 páginas de apresentação (`index.html`, `comparacao.html`, `avaliacao.html`, `recomendacao.html`). As páginas são da base, cujo construtor (pane-587) foi fechado, e o QA não as edita. Quem o piloto designar faz; o QA reconfere em minutos.

## Como o responsável abre (pedido do piloto)

- **No computador:** duplo clique em `design\prototipos\index.html`. Abre por arquivo (`file://`), sem instalar nada e sem internet. Dali chega a tudo: protótipos, identidades, comparação, avaliação e, no fim, a recomendação. Na tela de cada protótipo, a barra do avaliador troca tema e fonte.
- **No celular (P-22), o que foi testado:** simulação de celular de 390 × 844 com toque no Chrome, por arquivo e servida por endereço local. Tudo funciona nos dois modos: as quatro páginas e as telas de amostra das cinco direções, sem pedido externo. No tamanho de celular, a moldura dá lugar à tela cheia, com a faixa "Tela 4 de 15" no topo.
- **O que não foi testado:** um aparelho de verdade. Não há celular ligado a esta máquina.
- **Caminhos possíveis para o piloto decidir:**
  1. Servir a pasta pelo computador na rede de casa (por exemplo, `python -m http.server` dentro de `design\prototipos`) e abrir no celular pelo endereço do computador. É o caminho mais simples e não depende de internet, mas pede o ajuste do favicon acima para ficar sem erro.
  2. Copiar a pasta `design\prototipos` inteira para o celular e abrir `index.html` pelo navegador. No Android, o Chrome costuma bloquear `file://` vindo de pastas comuns, então esse caminho não é garantido.
  3. Publicar num endereço privado. Isso é serviço externo e fica a critério do piloto e do responsável.
- **Nos três caminhos:** as notas da folha de avaliação ficam no navegador onde foram dadas. Por isso, "Copiar como texto" é o modo de levá-las adiante.

## Reconferência do ajuste (favicon) · 2026-11-24 · pane-617 · ok

- As 4 páginas da raiz (`index.html`, `comparacao.html`, `avaliacao.html`, `recomendacao.html`) declaram `<link rel="icon" href="data:,">`, 1 linha a mais em cada uma (`git diff --stat`: 4 inserções, nenhuma outra mudança).
- Servidas por endereço local (`http://127.0.0.1`) e por arquivo, em tamanho de celular, abertas em sequência: 0 erro de console e 0 resposta 4xx nas duas formas.
- Com isso, o caminho 1 para o celular (servir a pasta pela rede de casa) fica sem erro.

## Reconferência do título em 200 % · 2026-11-24 · pane-619 · ok

O pane-613 achou, e o QA tinha deixado passar, que em 390 px com letra em 200 % o `h1` do cabeçalho das 4 páginas não cabia: as páginas ficavam com 410 a 479 px de largura. **A partir de agora, a medição destas páginas inclui a fonte em 100, 130 e 200 %.**

- **`git diff` de `_compartilhado/base.css`:** só uma regra nova, `.cg-ap-cabeca h1 { font-size: min(2rem, 11vw); overflow-wrap: anywhere; }`. A classe `.cg-ap-cabeca` só existe nas 4 páginas de apresentação e em `rumo/paletas.html`.
- **As 4 páginas** × 390 e 1440 × fonte 100, 130 e 200 × claro e escuro (48 combinações): 0 rolagem lateral, 0 palavra partida, 0 erro de console.
- **Amostra de não regressão nas cinco direções:** telas 1, 4 e 12, em 100 e 200 %, tema claro (30 combinações). Saíram limpas, menos o e-mail do Pix quebrando em 200 %, que já era aceito.
- **Observação:** `overflow-wrap: anywhere` no título só age se o título não couber nem com `11vw`. Hoje não acontece em nenhuma combinação. Se um título novo e longo entrar nessas páginas, conferir de novo com a checagem de palavra partida.

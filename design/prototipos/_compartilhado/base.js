/* Campinguim · protótipos · script comum às cinco direções e às páginas de apresentação.
   Padrão de produção, seções 3, 4, 6 e 7. Script clássico, sem rede, sem módulo: abre por file://.

   O que faz, nesta ordem:
   1. lê os parâmetros de endereço: tema=claro|escuro, fonte=100|130|200, moldura=0, avaliador=0, novo=1;
   2. aplica tema (sem parâmetro, segue o aparelho) e tamanho da fonte (raiz em 100, 130 ou 200 %);
   3. nas telas do app (<body data-tela="1".."15"|"identidade">), põe o app na moldura de celular
      e monta a barra do avaliador; nas páginas de apresentação (<body data-pagina="...">), só aplica;
   4. preenche os textos (data-texto, data-texto-aria, data-texto-placeholder, data-valores),
      os dados (data-dado, data-dinheiro) e o mascote (data-mascote), agora e sempre que a página mudar;
   5. publica window.CAMPINGUIM, com as funções que as direções usam (ver LEIA-ME.md).

   Nenhum texto visível neste arquivo: tudo vem de textos.js e de <direcao>/textos.js. */
(function () {
  "use strict";

  var doc = document;
  var raiz = doc.documentElement;
  var corpo = doc.body;

  var DIRECOES = ["brasa", "clareira", "oficina", "rumo", "roda"];

  var TELAS = [
    { n: 1, arquivo: "01-abertura.html" },
    { n: 2, arquivo: "02-criar-viagem.html" },
    { n: 3, arquivo: "03-alertas.html" },
    { n: 4, arquivo: "04-lista.html" },
    { n: 5, arquivo: "05-item.html" },
    { n: 6, arquivo: "06-aviso-de-saida.html" },
    { n: 7, arquivo: "07-estadia.html" },
    { n: 8, arquivo: "08-volta.html" },
    { n: 9, arquivo: "09-em-casa.html" },
    { n: 10, arquivo: "10-fato.html" },
    { n: 11, arquivo: "11-grupo.html" },
    { n: 12, arquivo: "12-gastos.html" },
    { n: 13, arquivo: "13-camping-sem-dados.html" },
    { n: 14, arquivo: "14-convidado.html" },
    { n: 15, arquivo: "15-site.html" }
  ];

  /* Grupos de textos que a direção não pode redefinir. */
  var PROTEGIDOS = ["estado.", "categoria.", "filtro.", "nivel.", "ajuste.", "campo.", "opcao.", "area.", "tela.",
    "avaliador.", "apresentacao.", "comparacao.", "avaliacao.", "recomendacao.", "mascote.", "gastos.situacao.", "erro."];

  var PREFIXO = "campinguim:";
  var ATRIBUTOS = ["data-texto", "data-texto-aria", "data-texto-placeholder", "data-valores", "data-dado", "data-dinheiro", "data-mascote", "data-mascote-texto"];

  function temChave(objeto, chave) {
    return !!objeto && Object.prototype.hasOwnProperty.call(objeto, chave);
  }

  function erro() {
    if (window.console && console.error) console.error.apply(console, arguments);
  }

  /* ---------- Guardado no navegador (sempre com try/catch; a tela funciona igual sem ele) ---------- */

  function armazem(tipo) {
    try {
      var a = window[tipo];
      var teste = PREFIXO + "teste";
      a.setItem(teste, "1");
      a.removeItem(teste);
      return a;
    } catch (e) {
      return null;
    }
  }

  var local = armazem("localStorage");
  var sessao = armazem("sessionStorage");

  function ler(a, chave, padrao) {
    if (!a) return padrao;
    try {
      var v = a.getItem(PREFIXO + chave);
      return v === null ? padrao : JSON.parse(v);
    } catch (e) {
      return padrao;
    }
  }

  function gravar(a, chave, valor) {
    if (!a) return false;
    try {
      a.setItem(PREFIXO + chave, JSON.stringify(valor));
      return true;
    } catch (e) {
      return false;
    }
  }

  function remover(a, chave) {
    if (!a) return;
    try {
      a.removeItem(PREFIXO + chave);
    } catch (e) { /* sem armazenamento */ }
  }

  function limpar(a) {
    if (!a) return;
    try {
      var chaves = [];
      for (var i = 0; i < a.length; i++) {
        var k = a.key(i);
        if (k && k.indexOf(PREFIXO) === 0) chaves.push(k);
      }
      chaves.forEach(function (k) { a.removeItem(k); });
    } catch (e) { /* sem armazenamento */ }
  }

  /* ---------- Parâmetros de endereço ---------- */

  var busca;
  try {
    busca = new URLSearchParams(window.location.search);
  } catch (e) {
    busca = { get: function () { return null; }, has: function () { return false; } };
  }

  var parametros = {
    tema: busca.get("tema"),
    fonte: busca.get("fonte"),
    moldura: busca.get("moldura") !== "0",
    avaliador: busca.get("avaliador") !== "0",
    novo: busca.get("novo") === "1"
  };
  if (parametros.tema !== "claro" && parametros.tema !== "escuro") parametros.tema = null;
  if (["100", "130", "200"].indexOf(parametros.fonte) < 0) parametros.fonte = null;

  /* ?novo=1: apaga tudo o que o protótipo guardou; o estado inicial volta a ser o de dados.js. */
  if (parametros.novo) {
    limpar(local);
    limpar(sessao);
    /* Tira o novo=1 do endereço: recarregar depois não apaga de novo o que foi marcado. */
    try {
      busca.delete("novo");
      var resto = busca.toString();
      window.history.replaceState(null, "", window.location.pathname + (resto ? "?" + resto : "") + window.location.hash);
    } catch (e) { /* sem history: segue com o endereço como está */ }
  }

  /* ---------- Tipo de página e direção ---------- */

  var atributoTela = corpo ? corpo.getAttribute("data-tela") : null;
  var ehApp = atributoTela !== null;
  var telaAtual = null;
  if (ehApp) {
    telaAtual = atributoTela === "identidade" ? "identidade" : parseInt(atributoTela, 10);
    if (telaAtual !== "identidade" && !(telaAtual >= 1 && telaAtual <= 15)) {
      erro("[base] data-tela inválido:", atributoTela);
      telaAtual = null;
    }
  }

  var pasta = (function () {
    try {
      var partes = decodeURIComponent(window.location.pathname).split(/[\\/]/);
      return partes.length >= 2 ? partes[partes.length - 2] : "";
    } catch (e) {
      return "";
    }
  })();

  raiz.setAttribute("data-cg-pagina", ehApp ? "app" : "apresentacao");
  raiz.setAttribute("data-moldura", parametros.moldura ? "1" : "0");
  raiz.setAttribute("data-avaliador", ehApp && parametros.avaliador ? "1" : "0");

  /* A escolha do avaliador só é lembrada (na aba) quando a barra está ligada:
     amostras em iframe (moldura=0&avaliador=0) não mexem na escolha de quem avalia. */
  var lembrar = ehApp ? parametros.avaliador : parametros.moldura;

  /* ---------- Textos ---------- */

  function ehProtegido(chave) {
    for (var i = 0; i < PROTEGIDOS.length; i++) {
      if (chave.indexOf(PROTEGIDOS[i]) === 0) return true;
    }
    return false;
  }

  (function conferirTextosDaDirecao() {
    var dir = window.CAMPINGUIM_TEXTOS_DIRECAO;
    if (!dir) return;
    Object.keys(dir).forEach(function (chave) {
      if (ehProtegido(chave)) erro("[base] texto comum não pode ser redefinido pela direção:", chave);
    });
  })();

  function buscarTexto(chave, textosDirecao) {
    var dir = textosDirecao === undefined ? window.CAMPINGUIM_TEXTOS_DIRECAO : textosDirecao;
    var comum = window.CAMPINGUIM_TEXTOS;
    if (!ehProtegido(chave) && temChave(dir, chave)) return dir[chave];
    if (temChave(comum, chave)) return comum[chave];
    return null;
  }

  function preencherValores(modelo, valores) {
    if (!valores) return modelo;
    return String(modelo).replace(/\{([A-Za-z0-9_]+)\}/g, function (inteiro, nome) {
      return temChave(valores, nome) ? String(valores[nome]) : inteiro;
    });
  }

  /* CAMPINGUIM.texto(chave, valores): o texto pronto, ou null se a chave não existir. */
  function texto(chave, valores, textosDirecao) {
    var t = buscarTexto(chave, textosDirecao);
    return t === null ? null : preencherValores(t, valores);
  }

  /* Igual a texto(), mas marca a falta: "[chave]" e erro no console. */
  function textoOuFalta(chave, valores, textosDirecao) {
    var t = texto(chave, valores, textosDirecao);
    if (t === null) {
      erro("[base] chave sem texto:", chave);
      return null;
    }
    return t;
  }

  /* ---------- Dados ---------- */

  function caminho(objeto, rota) {
    var partes = String(rota).split(".");
    var atual = objeto;
    for (var i = 0; i < partes.length; i++) {
      if (atual === null || atual === undefined) return undefined;
      atual = atual[partes[i]];
    }
    return atual;
  }

  function dado(rota) {
    return caminho(window.CAMPINGUIM_DADOS, rota);
  }

  /* Centavos para reais, no formato brasileiro: 12345 → "R$ 123,45". */
  function dinheiro(centavos) {
    var valor = Math.round(Number(centavos));
    if (!isFinite(valor)) return "";
    var negativo = valor < 0;
    valor = Math.abs(valor);
    var reais = String(Math.floor(valor / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    var resto = valor % 100;
    return (negativo ? "-" : "") + "R$ " + reais + "," + (resto < 10 ? "0" : "") + resto;
  }

  var todosOsItens = null;
  function itens() {
    if (todosOsItens) return todosOsItens;
    todosOsItens = [];
    var cats = dado("lista.categorias") || [];
    cats.forEach(function (c) {
      c.itens.forEach(function (i) { todosOsItens.push(Object.assign({ categoria: c.id }, i)); });
    });
    return todosOsItens;
  }

  function item(id) {
    var lista = itens();
    for (var i = 0; i < lista.length; i++) if (lista[i].id === id) return lista[i];
    return null;
  }

  function categoria(id) {
    var cats = dado("lista.categorias") || [];
    for (var i = 0; i < cats.length; i++) if (cats[i].id === id) return cats[i];
    return null;
  }

  /* Progresso a partir dos estados: estados é { idDoItem: "carro" | "separei" | "a_separar" }
     com o que mudou no protótipo; o que não estiver ali vem de dados.js. */
  function progresso(estados, idCategoria) {
    var r = { total: 0, noCarro: 0, separei: 0, aSeparar: 0 };
    itens().forEach(function (i) {
      if (idCategoria && i.categoria !== idCategoria) return;
      var e = estados && temChave(estados, i.id) ? estados[i.id] : i.estado;
      r.total++;
      if (e === "carro") r.noCarro++;
      else if (e === "separei") r.separei++;
      else r.aSeparar++;
    });
    return r;
  }

  /* Nome falado de um item da lista: "<nome>, <quantidade>, separei, fora do carro". */
  function nomeFalado(itemDaLista, estado) {
    var e = estado || itemDaLista.estado;
    var chaveEstado = e === "separei" ? "estado.separei_falado" : e === "carro" ? "estado.carro" : "estado.a_separar";
    return texto("estado.falado", {
      nome: itemDaLista.nome,
      quantidade: itemDaLista.quantidadeTexto,
      estado: texto(chaveEstado)
    });
  }

  /* ---------- Mascote ---------- */

  function injetarMascote(el) {
    var nome = el.getAttribute("data-mascote");
    if (el.getAttribute("data-mascote-feito") === nome) return;
    var m = window.CAMPINGUIM_MASCOTE;
    var svg = m && m.svg(nome);
    if (!svg) {
      erro("[base] arte do mascote inexistente:", nome);
      return;
    }
    el.classList.add("cg-mascote");
    el.setAttribute("data-arte", nome);
    if (el.hasAttribute("data-mascote-texto")) {
      var chave = el.getAttribute("data-mascote-texto") || ("mascote.alt." + nome);
      var alt = textoOuFalta(chave);
      el.setAttribute("role", "img");
      el.setAttribute("aria-label", alt === null ? "[" + chave + "]" : alt);
      el.removeAttribute("aria-hidden");
    } else {
      el.setAttribute("aria-hidden", "true");
      el.removeAttribute("role");
      el.removeAttribute("aria-label");
    }
    el.innerHTML = svg;
    el.setAttribute("data-mascote-feito", nome);
  }

  /* Cria o elemento do mascote para a direção pôr onde quiser.
     opcoes.texto: chave do texto alternativo ("" = o padrão da arte); sem opcoes.texto, é enfeite. */
  function mascote(nome, opcoes) {
    var el = doc.createElement("span");
    el.setAttribute("data-mascote", nome);
    if (opcoes && opcoes.texto !== undefined) el.setAttribute("data-mascote-texto", opcoes.texto);
    injetarMascote(el);
    return el;
  }

  /* ---------- Aplicar textos, dados e mascote ---------- */

  function lerValores(el) {
    var bruto = el.getAttribute("data-valores");
    if (!bruto) return null;
    try {
      return JSON.parse(bruto);
    } catch (e) {
      erro("[base] data-valores inválido:", bruto);
      return null;
    }
  }

  function marcarFalta(el, chave) {
    el.textContent = "[" + chave + "]";
    el.classList.add("cg-sem-texto");
  }

  function aplicarEm(el) {
    var valores;
    if (el.hasAttribute("data-texto")) {
      var chave = el.getAttribute("data-texto");
      valores = lerValores(el);
      var t = textoOuFalta(chave, valores);
      if (t === null) {
        marcarFalta(el, chave);
      } else {
        el.classList.remove("cg-sem-texto");
        if (el.textContent !== t) el.textContent = t;
      }
    }
    if (el.hasAttribute("data-texto-aria")) {
      var chaveAria = el.getAttribute("data-texto-aria");
      var a = textoOuFalta(chaveAria, valores === undefined ? lerValores(el) : valores);
      el.setAttribute("aria-label", a === null ? "[" + chaveAria + "]" : a);
    }
    if (el.hasAttribute("data-texto-placeholder")) {
      var chaveP = el.getAttribute("data-texto-placeholder");
      var p = textoOuFalta(chaveP);
      el.setAttribute("placeholder", p === null ? "[" + chaveP + "]" : p);
    }
    if (el.hasAttribute("data-dado")) {
      var rota = el.getAttribute("data-dado");
      var v = dado(rota);
      if (v === undefined || v === null || typeof v === "object") {
        erro("[base] dado inexistente em dados.js:", rota);
        marcarFalta(el, rota);
      } else if (el.textContent !== String(v)) {
        el.textContent = String(v);
      }
    }
    if (el.hasAttribute("data-dinheiro")) {
      var rotaD = el.getAttribute("data-dinheiro");
      var c = dado(rotaD);
      if (typeof c !== "number") {
        erro("[base] valor em centavos inexistente em dados.js:", rotaD);
        marcarFalta(el, rotaD);
      } else {
        var r = dinheiro(c);
        el.classList.add("cg-dinheiro");
        if (el.textContent !== r) el.textContent = r;
      }
    }
    if (el.hasAttribute("data-mascote")) injetarMascote(el);
  }

  var SELETOR = "[" + ["data-texto", "data-texto-aria", "data-texto-placeholder", "data-dado", "data-dinheiro", "data-mascote"].join("],[") + "]";

  /* CAMPINGUIM.aplicar(elemento): preenche o elemento e tudo dentro dele. */
  function aplicar(el) {
    el = el || doc;
    if (el.nodeType === 1 && el.matches(SELETOR)) aplicarEm(el);
    var lista = el.querySelectorAll ? el.querySelectorAll(SELETOR) : [];
    for (var i = 0; i < lista.length; i++) aplicarEm(lista[i]);
  }

  /* ---------- Tema e fonte ---------- */

  var consultaEscuro = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  var temaEscolhido = parametros.tema || (lembrar ? ler(sessao, "tema", null) : null);
  if (temaEscolhido !== "claro" && temaEscolhido !== "escuro") temaEscolhido = null;
  if (parametros.tema && lembrar) gravar(sessao, "tema", parametros.tema);

  var fonteEscolhida = parametros.fonte || (lembrar ? ler(sessao, "fonte", null) : null);
  if (["100", "130", "200"].indexOf(String(fonteEscolhida)) < 0) fonteEscolhida = "100";
  fonteEscolhida = String(fonteEscolhida);
  if (parametros.fonte && lembrar) gravar(sessao, "fonte", parametros.fonte);

  function temaDoAparelho() {
    return consultaEscuro && consultaEscuro.matches ? "escuro" : "claro";
  }

  function temaAtual() {
    return raiz.getAttribute("data-tema");
  }

  function mostrarTema(t) {
    raiz.setAttribute("data-tema", t);
    atualizarBarra();
  }

  function trocarParametro(nome, valor) {
    if (!busca.has || !busca.has(nome)) return;
    try {
      busca.set(nome, valor);
      window.history.replaceState(null, "", "?" + busca.toString() + window.location.hash);
    } catch (e) { /* file:// sem history: segue sem trocar o endereço */ }
  }

  /* CAMPINGUIM.definirTema("claro" | "escuro"): escolha explícita, lembrada nesta aba. */
  function definirTema(t) {
    if (t !== "claro" && t !== "escuro") return;
    temaEscolhido = t;
    if (lembrar) gravar(sessao, "tema", t);
    trocarParametro("tema", t);
    mostrarTema(t);
  }

  function definirFonte(f) {
    f = String(f);
    if (["100", "130", "200"].indexOf(f) < 0) return;
    fonteEscolhida = f;
    if (lembrar) gravar(sessao, "fonte", f);
    trocarParametro("fonte", f);
    raiz.style.fontSize = f + "%";
    raiz.setAttribute("data-fonte", f);
    atualizarBarra();
  }

  if (consultaEscuro) {
    var aoMudarAparelho = function () {
      if (!temaEscolhido) mostrarTema(temaDoAparelho());
    };
    if (consultaEscuro.addEventListener) consultaEscuro.addEventListener("change", aoMudarAparelho);
    else if (consultaEscuro.addListener) consultaEscuro.addListener(aoMudarAparelho);
  }

  raiz.setAttribute("data-tema", temaEscolhido || temaDoAparelho());
  raiz.style.fontSize = fonteEscolhida + "%";
  raiz.setAttribute("data-fonte", fonteEscolhida);

  /* ---------- Moldura e barra do avaliador (só nas telas do app) ---------- */

  var tela = null;
  var rolagem = null;
  var barra = null;
  var regiaoAnuncio = null;

  function criar(tag, classe, atributos) {
    var el = doc.createElement(tag);
    if (classe) el.className = classe;
    if (atributos) Object.keys(atributos).forEach(function (k) { el.setAttribute(k, atributos[k]); });
    return el;
  }

  /* Seta desenhada (o analisador de HTML põe o SVG no espaço de nomes certo, sem escrever o endereço). */
  function seta(direcao) {
    var d = direcao === "esquerda" ? "M15 5l-7 7 7 7" : direcao === "direita" ? "M9 5l7 7-7 7" : "M6 9l6 6 6-6";
    var caixa = doc.createElement("span");
    caixa.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="' + d + '"/></svg>';
    return caixa.firstChild;
  }

  function nomeDaDirecao() {
    var fichas = window.CAMPINGUIM_DIRECOES || {};
    var ficha = fichas[pasta];
    var nome = ficha && ficha.nome ? texto(ficha.nome) : null;
    return nome || texto("avaliador.direcao");
  }

  function ligacaoDeTela(alvo, classe, rotuloChave, desligadoChave, desenho) {
    var el;
    if (alvo) {
      el = criar("a", classe, { href: alvo.arquivo, "data-texto-aria": rotuloChave });
    } else {
      el = criar("span", classe, { "aria-disabled": "true", role: "link", "data-texto-aria": desligadoChave });
    }
    el.appendChild(seta(desenho));
    return el;
  }

  function montarBarra() {
    var n = telaAtual;
    var anterior = typeof n === "number" && n > 1 ? TELAS[n - 2] : null;
    var proxima = typeof n === "number" ? (n < 15 ? TELAS[n] : null) : TELAS[0];

    var nav = criar("nav", "cg-avaliador", { "data-texto-aria": "avaliador.rotulo" });

    function local() {
      var bloco = criar("span", "cg-av-local");
      if (typeof n === "number") {
        bloco.appendChild(criar("span", "cg-av-posicao", { "data-texto": "avaliador.posicao", "data-valores": JSON.stringify({ n: n, total: 15 }) }));
        bloco.appendChild(criar("span", "cg-av-nome-tela", { "data-texto": "tela." + n }));
      } else {
        bloco.appendChild(criar("span", "cg-av-nome-tela", { "data-texto": "tela.identidade" }));
      }
      return bloco;
    }

    var cabeca = criar("div", "cg-av-cabeca");
    var nomeCabeca = criar("p", "cg-av-direcao cg-av-nome-direcao");
    cabeca.appendChild(nomeCabeca);
    cabeca.appendChild(local());
    nav.appendChild(cabeca);

    var faixa = criar("div", "cg-av-faixa");
    faixa.appendChild(ligacaoDeTela(anterior, "cg-av-seta", "avaliador.anterior", "avaliador.sem_anterior", "esquerda"));
    var alternar = criar("button", "cg-av-alternar", { type: "button", "aria-expanded": "false", "aria-controls": "cg-av-painel" });
    alternar.appendChild(local());
    alternar.appendChild(seta("baixo"));
    faixa.appendChild(alternar);
    faixa.appendChild(ligacaoDeTela(proxima, "cg-av-seta", "avaliador.proxima", "avaliador.sem_proxima", "direita"));
    nav.appendChild(faixa);

    var painel = criar("div", "cg-av-painel", { id: "cg-av-painel" });
    var nomePainel = criar("p", "cg-av-direcao cg-av-nome-direcao");
    painel.appendChild(nomePainel);

    function grupo(rotuloChave, opcoes, aoEscolher, tipo) {
      var g = criar("div", "cg-av-grupo", { role: "group" });
      var id = "cg-av-" + tipo;
      var rotulo = criar("span", "cg-av-grupo-rotulo", { id: id, "data-texto": rotuloChave });
      g.setAttribute("aria-labelledby", id);
      g.appendChild(rotulo);
      var caixa = criar("div", "cg-av-grupo-opcoes");
      opcoes.forEach(function (o) {
        var b = criar("button", "cg-av-opcao", { type: "button", "aria-pressed": "false", "data-texto": o.chave });
        b.setAttribute("data-cg-" + tipo, o.valor);
        b.addEventListener("click", function () { aoEscolher(o.valor); });
        caixa.appendChild(b);
      });
      g.appendChild(caixa);
      return g;
    }

    painel.appendChild(grupo("avaliador.tema", [
      { chave: "avaliador.tema_claro", valor: "claro" },
      { chave: "avaliador.tema_escuro", valor: "escuro" }
    ], definirTema, "tema"));
    painel.appendChild(grupo("avaliador.fonte", [
      { chave: "avaliador.fonte_100", valor: "100" },
      { chave: "avaliador.fonte_130", valor: "130" },
      { chave: "avaliador.fonte_200", valor: "200" }
    ], definirFonte, "fonte"));

    var ligacoes = criar("div", "cg-av-ligacoes");
    var identidade = criar("a", "cg-av-ligacao", { href: "identidade.html", "data-texto": "avaliador.identidade" });
    if (n === "identidade") identidade.setAttribute("aria-current", "page");
    ligacoes.appendChild(identidade);
    ligacoes.appendChild(criar("a", "cg-av-ligacao", { href: "../index.html", "data-texto": "avaliador.todas" }));
    painel.appendChild(ligacoes);
    nav.appendChild(painel);

    alternar.addEventListener("click", function () {
      var aberta = nav.classList.toggle("cg-aberta");
      alternar.setAttribute("aria-expanded", aberta ? "true" : "false");
      alternar.setAttribute("data-texto-aria", aberta ? "avaliador.recolher" : "avaliador.abrir");
    });
    alternar.setAttribute("data-texto-aria", "avaliador.abrir");

    var nomeDir = nomeDaDirecao();
    nomeCabeca.textContent = nomeDir;
    nomePainel.textContent = nomeDir;
    return nav;
  }

  function atualizarBarra() {
    if (!barra) return;
    var t = temaAtual();
    var botoes = barra.querySelectorAll("[data-cg-tema]");
    for (var i = 0; i < botoes.length; i++) botoes[i].setAttribute("aria-pressed", botoes[i].getAttribute("data-cg-tema") === t ? "true" : "false");
    botoes = barra.querySelectorAll("[data-cg-fonte]");
    for (var j = 0; j < botoes.length; j++) botoes[j].setAttribute("aria-pressed", botoes[j].getAttribute("data-cg-fonte") === fonteEscolhida ? "true" : "false");
  }

  function montarMoldura() {
    var palco = criar("div", "cg-palco");
    var moldura = criar("div", "cg-moldura");
    tela = criar("div", "cg-tela");
    rolagem = criar("div", "cg-rolagem");
    var filhos = Array.prototype.slice.call(corpo.childNodes);
    filhos.forEach(function (no) {
      if (no.nodeType === 1 && no.tagName === "SCRIPT") return;
      rolagem.appendChild(no);
    });
    regiaoAnuncio = criar("div", "cg-oculto", { "aria-live": "polite", role: "status" });
    tela.appendChild(rolagem);
    tela.appendChild(regiaoAnuncio);
    moldura.appendChild(tela);
    if (parametros.avaliador) {
      barra = montarBarra();
      palco.appendChild(barra);
    }
    palco.appendChild(moldura);
    corpo.insertBefore(palco, corpo.firstChild);
    atualizarBarra();
  }

  if (ehApp) {
    montarMoldura();
  } else {
    regiaoAnuncio = criar("div", "cg-oculto", { "aria-live": "polite", role: "status" });
    corpo.appendChild(regiaoAnuncio);
  }

  /* ---------- Utilidades para as direções ---------- */

  /* Anuncia um texto ao leitor de tela (abertura de folha ou painel, cópia feita...). */
  function anunciar(t) {
    if (!regiaoAnuncio) return;
    regiaoAnuncio.textContent = "";
    window.setTimeout(function () { regiaoAnuncio.textContent = t; }, 50);
  }

  var FOCAVEIS = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex='-1'])";

  /* Prende o foco dentro de uma folha ou painel aberto (NF-08). Devolve a função que solta.
     aoFechar é chamada com a tecla Esc. Os vizinhos ficam inertes enquanto o painel está aberto. */
  function prenderFoco(painel, aoFechar) {
    var anterior = doc.activeElement;
    var limite = tela || corpo;
    var inertes = [];
    var no = painel;
    while (no && no !== limite && no.parentNode) {
      var pai = no.parentNode;
      for (var i = 0; i < pai.children.length; i++) {
        var irmao = pai.children[i];
        if (irmao !== no && !irmao.hasAttribute("inert") && irmao !== regiaoAnuncio && irmao.tagName !== "SCRIPT") {
          irmao.setAttribute("inert", "");
          inertes.push(irmao);
        }
      }
      no = pai;
    }
    function aoTeclar(ev) {
      if (ev.key === "Escape" && aoFechar) {
        ev.preventDefault();
        aoFechar();
        return;
      }
      if (ev.key !== "Tab") return;
      var lista = Array.prototype.filter.call(painel.querySelectorAll(FOCAVEIS), function (el) {
        return el.offsetParent !== null || el === doc.activeElement;
      });
      if (!lista.length) {
        ev.preventDefault();
        return;
      }
      var primeiro = lista[0];
      var ultimo = lista[lista.length - 1];
      if (ev.shiftKey && doc.activeElement === primeiro) {
        ev.preventDefault();
        ultimo.focus();
      } else if (!ev.shiftKey && doc.activeElement === ultimo) {
        ev.preventDefault();
        primeiro.focus();
      }
    }
    painel.addEventListener("keydown", aoTeclar);
    if (painel.getAttribute("role") === "dialog") painel.setAttribute("aria-modal", "true");
    var alvo = painel.querySelector(FOCAVEIS);
    if (!alvo) {
      if (!painel.hasAttribute("tabindex")) painel.setAttribute("tabindex", "-1");
      alvo = painel;
    }
    alvo.focus();
    return function soltar() {
      painel.removeEventListener("keydown", aoTeclar);
      inertes.forEach(function (el) { el.removeAttribute("inert"); });
      if (anterior && anterior.focus && doc.contains(anterior)) anterior.focus();
    };
  }

  /* Copia um texto (chave Pix, valor, perguntas). Devolve uma Promise<boolean>. */
  function copiar(t) {
    function plano() {
      var area = criar("textarea", "cg-oculto", { readonly: "", "aria-hidden": "true" });
      area.value = t;
      corpo.appendChild(area);
      area.select();
      var ok = false;
      try {
        ok = doc.execCommand("copy");
      } catch (e) {
        ok = false;
      }
      corpo.removeChild(area);
      return ok;
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(t).then(function () { return true; }, function () { return plano(); });
      }
    } catch (e) { /* segue para o plano B */ }
    return Promise.resolve(plano());
  }

  /* ---------- Páginas de apresentação: carregar fichas e textos das direções ---------- */

  function carregarScript(src, pronto) {
    var s = doc.createElement("script");
    s.src = src;
    s.onload = function () { pronto(true); };
    s.onerror = function () { pronto(false); };
    doc.head.appendChild(s);
  }

  /* Lê <pasta>/ficha.js e <pasta>/textos.js de cada direção, uma por vez (cada textos.js publica
     window.CAMPINGUIM_TEXTOS_DIRECAO, que é guardado e limpo antes da próxima).
     Devolve, para cada pasta: { pasta, posicao, ficha (ou null), textos (ou null), pronta }. */
  function carregarDirecoes(pronto) {
    var resultado = [];
    var i = 0;
    window.CAMPINGUIM_DIRECOES = window.CAMPINGUIM_DIRECOES || {};
    function proxima() {
      if (i >= DIRECOES.length) {
        resultado.sort(function (a, b) {
          var na = a.ficha && a.ficha.numero ? a.ficha.numero : a.posicao;
          var nb = b.ficha && b.ficha.numero ? b.ficha.numero : b.posicao;
          return na - nb;
        });
        pronto(resultado);
        return;
      }
      var p = DIRECOES[i];
      var info = { pasta: p, posicao: i + 1, ficha: null, textos: null, pronta: false };
      i++;
      carregarScript(p + "/ficha.js", function (ok) {
        info.ficha = ok ? window.CAMPINGUIM_DIRECOES[p] || null : null;
        if (!info.ficha) {
          resultado.push(info);
          proxima();
          return;
        }
        window.CAMPINGUIM_TEXTOS_DIRECAO = undefined;
        carregarScript(p + "/textos.js", function (ok2) {
          info.textos = ok2 && window.CAMPINGUIM_TEXTOS_DIRECAO ? window.CAMPINGUIM_TEXTOS_DIRECAO : null;
          window.CAMPINGUIM_TEXTOS_DIRECAO = undefined;
          info.pronta = info.ficha.pronta === true && !!info.textos;
          resultado.push(info);
          proxima();
        });
      });
    }
    proxima();
  }

  /* Texto de uma direção carregada por carregarDirecoes (campo da ficha que guarda a chave). */
  function textoDaDirecao(info, campo) {
    if (!info || !info.ficha || !info.textos) return null;
    var chave = info.ficha[campo];
    if (!chave) return null;
    return temChave(info.textos, chave) ? info.textos[chave] : null;
  }

  /* ---------- Publicação ---------- */

  window.CAMPINGUIM = {
    dados: window.CAMPINGUIM_DADOS,
    parametros: parametros,
    pasta: pasta,
    tela: telaAtual,
    telas: TELAS,
    direcoes: DIRECOES,
    elementoTela: tela,
    elementoRolagem: rolagem,
    texto: texto,
    dado: dado,
    dinheiro: dinheiro,
    itens: itens,
    item: item,
    categoria: categoria,
    progresso: progresso,
    nomeFalado: nomeFalado,
    mascote: mascote,
    aplicar: aplicar,
    tema: temaAtual,
    definirTema: definirTema,
    definirFonte: definirFonte,
    fonte: function () { return fonteEscolhida; },
    anunciar: anunciar,
    prenderFoco: prenderFoco,
    copiar: copiar,
    guardado: {
      ler: function (chave, padrao) { return ler(local, chave, padrao); },
      gravar: function (chave, valor) { return gravar(local, chave, valor); },
      remover: function (chave) { remover(local, chave); }
    },
    carregarDirecoes: carregarDirecoes,
    textoDaDirecao: textoDaDirecao
  };

  /* ---------- Primeira aplicação e observação ---------- */

  aplicar(doc);

  if (window.MutationObserver) {
    var observador = new MutationObserver(function (mudancas) {
      for (var i = 0; i < mudancas.length; i++) {
        var m = mudancas[i];
        if (m.type === "attributes") {
          if (m.attributeName === "data-mascote") m.target.removeAttribute("data-mascote-feito");
          if (m.target.nodeType === 1) aplicarEm(m.target);
        } else {
          for (var j = 0; j < m.addedNodes.length; j++) {
            if (m.addedNodes[j].nodeType === 1) aplicar(m.addedNodes[j]);
          }
        }
      }
    });
    observador.observe(doc.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ATRIBUTOS });
  }

  /* Conferências que ajudam o construtor (o QA confere de novo). */
  function conferir() {
    aplicar(doc);
    if (doc.documentElement.getAttribute("lang") !== "pt-BR") erro("[base] a página precisa de lang=\"pt-BR\"");
    var titulo = doc.querySelector("title");
    if (!titulo || !titulo.hasAttribute("data-texto")) erro("[base] o <title> precisa vir do arquivo de textos (data-texto)");
    var h1 = doc.querySelectorAll("h1").length;
    if (h1 !== 1) erro("[base] a página precisa de um único <h1>; tem", h1);
    if (ehApp && typeof telaAtual === "number") {
      var figuras = (tela || doc).querySelectorAll("[data-mascote]").length;
      if (figuras > 1) erro("[base] o mascote aparece no máximo uma vez por tela; tem", figuras);
    }
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", conferir);
  else window.setTimeout(conferir, 0);
})();

/* Campinguim · protótipo 4 · Rumo · ícones e ornamentos desenhados para a direção.
   Simbologia de carta: grade de 24, traço de 1,5 px, pontas retas, formas inscritas em quadrado;
   o estado ativo vira símbolo cheio (como ponto cotado). Ornamentos: curvas de nível (SVG gerado aqui)
   e a rota tracejada. Como a pasta da direção só pode ter estes arquivos (padrão de produção, seção 2),
   este arquivo também desenha as peças da navegação que se repetem em todas as telas: a rota de cinco
   paradas, a legenda, o rodapé com a ação principal e as linhas da lista.
   Publica window.RUMO. Nenhum texto visível aqui: todo texto entra por data-texto (base.js preenche).
   Nenhum dado do cenário aqui: tudo vem de window.CAMPINGUIM (dados.js). Sem bússola, sem pino, sem moeda. */
(function () {
  "use strict";

  /* ---------- Ícones ---------- */
  /* Classes dentro do SVG (estilo.css): sem classe = traço; .f = cheio; .r = recorte (traço na cor do fundo
     do símbolo); .roda = roda vazada; .roda-cheia = roda cheia com anel de recorte. */
  var ICONES = {
    separei: {
      base: '<rect x="4.75" y="4.75" width="14.5" height="14.5"/>',
      ativo: '<rect class="f" x="4" y="4" width="16" height="16"/><path class="r" d="M7.75 12.25l3 3 5.5-6"/>'
    },
    carro: {
      base: '<path d="M2.75 16.75V12.25l3.1-5h8.4l3.75 4.25 3.25.75v4.5z"/><path d="M6.5 11.5h10.75"/>' +
        '<circle class="roda" cx="7.25" cy="16.75" r="2.25"/><circle class="roda" cx="16.75" cy="16.75" r="2.25"/>',
      ativo: '<path class="f" d="M2 17.5V12l3.45-5.5h9.1l3.9 4.4L22 11.7v5.8z"/><path class="r" d="M6.5 11.25h10.75"/>' +
        '<circle class="roda-cheia" cx="7.25" cy="17" r="2.5"/><circle class="roda-cheia" cx="16.75" cy="17" r="2.5"/>'
    },
    comprar: {
      base: '<path d="M5.75 8.75h12.5l-1 11.5H6.75z"/><path d="M9.25 8.75V7.5a2.75 2.75 0 0 1 5.5 0v1.25"/>',
      ativo: '<path class="f" d="M5 8h14l-1.1 13H6.1z"/><path d="M9.25 8V7.5a2.75 2.75 0 0 1 5.5 0V8"/><path class="r" d="M9 12.5h6"/>'
    },
    atencao: {
      base: '<path d="M12 3.75l9 15.5H3z"/><path d="M12 9.25v5"/><path d="M12 15.75v1.75"/>',
      ativo: '<path class="f" d="M12 2.75l10 17.25H2z"/><path class="r" d="M12 9.25v5"/><path class="r" d="M12 15.75v1.75"/>'
    },
    faltou: {
      base: '<rect x="4.75" y="4.75" width="14.5" height="14.5"/><path d="M8.5 12h7"/>',
      ativo: '<rect class="f" x="4" y="4" width="16" height="16"/><path class="r" d="M8.5 12h7"/>'
    },
    conferido: {
      base: '<path d="M12 3.25L20.75 12 12 20.75 3.25 12z"/>',
      ativo: '<path class="f" d="M12 2.25L21.75 12 12 21.75 2.25 12z"/><path class="r" d="M8.4 12.1l2.5 2.5 4.7-4.9"/>'
    },
    secar: {
      base: '<path d="M4.75 20.25V10.5L12 4.25l7.25 6.25v9.75z"/><path d="M12 10.75c-1.7 2.3-2.5 3.6-2.5 4.6a2.5 2.5 0 0 0 5 0c0-1-.8-2.3-2.5-4.6z"/>',
      ativo: '<path class="f" d="M4 21V10.2L12 3.25l8 6.95V21z"/><path class="rf" d="M12 10.75c-1.7 2.3-2.5 3.6-2.5 4.6a2.5 2.5 0 0 0 5 0c0-1-.8-2.3-2.5-4.6z"/>'
    },
    ciente: { base: '<path d="M4.25 12.75l4.75 4.75L19.75 6.5"/>' },
    info: { base: '<rect x="4.75" y="4.75" width="14.5" height="14.5"/><path d="M12 10.75v5.5"/><path d="M12 7.5v1.75"/>' },
    entrou: { base: '<path d="M12 3.75v10.5"/><path d="M8 10.25l4 4 4-4"/><path d="M4.75 14.25v6h14.5v-6"/>' },
    saiu: { base: '<path d="M12 14.25V4"/><path d="M8 8l4-4 4 4"/><path d="M4.75 14.25v6h14.5v-6"/>' },
    tarefa: { base: '<path d="M8.75 4.75h6.5v2.5h-6.5z"/><path d="M8.75 6H5.75v14.25h12.5V6h-3"/><path d="M8.75 12h6.5"/><path d="M8.75 15.75h6.5"/>' },
    regra: { base: '<path d="M4.75 4.75h14.5v8.5H4.75z"/><path d="M12 13.25v7"/><path d="M8.5 20.25h7"/><path d="M8 9h8"/>' },
    preparar: { base: '<path d="M9.25 6.75h10"/><path d="M9.25 12h10"/><path d="M9.25 17.25h10"/><path d="M4.75 6h1.5v1.5h-1.5z"/><path d="M4.75 11.25h1.5v1.5h-1.5z"/><path d="M4.75 16.5h1.5V18h-1.5z"/>' },
    barraca: { base: '<path d="M9.75 2.75L12 6l2.25-3.25"/><path d="M12 6L3.5 19.25"/><path d="M12 6l8.5 13.25"/><path d="M1.75 19.25h20.5"/><path d="M12 12.25l-2.5 7"/><path d="M12 12.25l2.5 7"/>' },
    volta: { base: '<path d="M19.25 8.25H9.5a5 5 0 0 0 0 10h3.25"/><path d="M15.5 4.5l3.75 3.75-3.75 3.75"/>' },
    casa: { base: '<path d="M4.75 20.25V10.5L12 4.25l7.25 6.25v9.75z"/><path d="M10 20.25v-5.5h4v5.5"/>' },
    grupo: { base: '<circle cx="9" cy="8" r="2.75"/><path d="M3.75 19.25V18a5.25 5.25 0 0 1 10.5 0v1.25"/><circle cx="16.75" cy="9.25" r="2.25"/><path d="M16 13.6a4.5 4.5 0 0 1 4.25 4.4v1.25"/>' },
    gastos: { base: '<path d="M5.75 3.75h12.5v16.5l-2.1-1.4-2.1 1.4-2.05-1.4-2.05 1.4-2.1-1.4-2.1 1.4z"/><path d="M8.75 8.25h6.5"/><path d="M8.75 11.75h6.5"/><path d="M8.75 15.25h3.5"/>' },
    legenda: { base: '<path d="M3.75 4.75h16.5v14.5H3.75z"/><path d="M6.75 8.25h2v2h-2z"/><path d="M11 9.25h6.25"/><path d="M6.75 14.25h2.25"/><path d="M11 14.25h6.25"/>' },
    pessoa: { base: '<circle cx="12" cy="8" r="3.25"/><path d="M5.75 19.75v-1.5a6.25 6.25 0 0 1 12.5 0v1.5"/>' },
    sem_dono: { base: '<circle class="tracejado" cx="12" cy="8" r="3.25"/><path class="tracejado" d="M5.75 19.75v-1.5a6.25 6.25 0 0 1 12.5 0v1.5"/>' },
    voltar: { base: '<path d="M19.25 12H5.5"/><path d="M11 6.25L5.25 12 11 17.75"/>' },
    direita: { base: '<path d="M9.25 6.5L14.75 12l-5.5 5.5"/>' },
    baixo: { base: '<path d="M6.5 9.25L12 14.75l5.5-5.5"/>' },
    mais: { base: '<path d="M12 5.5v13"/><path d="M5.5 12h13"/>' },
    menos: { base: '<path d="M5.5 12h13"/>' },
    copiar: { base: '<path d="M8.75 8.75h10.5v10.5H8.75z"/><path d="M15.25 8.75v-4H4.75v10.5h4"/>' },
    compartilhar: { base: '<path d="M12 14.5V3.75"/><path d="M8 7.75l4-4 4 4"/><path d="M5.75 11v9.25h12.5V11"/>' },
    fechar: { base: '<path d="M6.25 6.25l11.5 11.5"/><path d="M17.75 6.25l-11.5 11.5"/>' }
  };

  /* Ordem mostrada na página de identidade (os de estado primeiro, com repouso e ativo). */
  var ORDEM = ["separei", "carro", "comprar", "atencao", "faltou", "conferido", "secar", "ciente", "info", "entrou", "saiu",
    "tarefa", "regra", "preparar", "barraca", "volta", "casa", "grupo", "gastos", "legenda", "pessoa", "sem_dono",
    "voltar", "direita", "baixo", "mais", "menos", "copiar", "compartilhar", "fechar"];

  function icone(nome, ativo) {
    var i = ICONES[nome];
    if (!i) return "";
    var corpo = ativo && i.ativo ? i.ativo : i.base;
    return '<svg class="ico ico-' + nome + (ativo && i.ativo ? " ico-ativo" : "") + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + corpo + "</svg>";
  }

  /* ---------- Curvas de nível (ornamento de fundo do topo) ---------- */

  function n1(v) {
    return (Math.round(v * 10) / 10).toString();
  }

  /* Curva fechada suave por Catmull-Rom convertida em Bézier cúbica. */
  function caminhoFechado(p) {
    var n = p.length;
    var d = "M" + n1(p[0][0]) + " " + n1(p[0][1]);
    for (var i = 0; i < n; i++) {
      var p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
      d += "C" + n1(p1[0] + (p2[0] - p0[0]) / 6) + " " + n1(p1[1] + (p2[1] - p0[1]) / 6) + " " +
        n1(p2[0] - (p3[0] - p1[0]) / 6) + " " + n1(p2[1] - (p3[1] - p1[1]) / 6) + " " + n1(p2[0]) + " " + n1(p2[1]);
    }
    return d + "Z";
  }

  /* o: { w, h, cx, cy, aneis, r0, passo, sx, sy, fase } → SVG com anéis irregulares e concêntricos. */
  function curvas(o) {
    var c = Object.assign({ w: 360, h: 260, cx: 260, cy: 70, aneis: 8, r0: 14, passo: 19, sx: 1.55, sy: 1, fase: 0 }, o || {});
    var caminhos = [];
    for (var k = 0; k < c.aneis; k++) {
      var r = c.r0 + k * c.passo;
      var pts = [];
      for (var i = 0; i < 40; i++) {
        var t = (i / 40) * Math.PI * 2;
        var a = 1 + 0.11 * Math.sin(2 * t + 0.7 + k * 0.22 + c.fase) +
          0.06 * Math.sin(3 * t + 1.9 - k * 0.17 + c.fase * 2) +
          0.035 * Math.sin(5 * t + 0.3 + k * 0.41);
        pts.push([c.cx + Math.cos(t) * r * a * c.sx, c.cy + Math.sin(t) * r * a * c.sy]);
      }
      caminhos.push('<path d="' + caminhoFechado(pts) + '"/>');
    }
    return '<svg class="curvas" viewBox="0 0 ' + c.w + " " + c.h + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' +
      caminhos.join("") + "</svg>";
  }

  /* ---------- Utilidades ---------- */

  function C() {
    return window.CAMPINGUIM;
  }

  function el(tag, classe, atributos, html) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (atributos) Object.keys(atributos).forEach(function (k) {
      if (atributos[k] !== null && atributos[k] !== undefined) e.setAttribute(k, atributos[k]);
    });
    if (html) e.innerHTML = html;
    return e;
  }

  /* Elemento com texto do arquivo de textos (data-texto, e data-valores quando há). */
  function tx(tag, classe, chave, valores, atributos) {
    var a = Object.assign({ "data-texto": chave }, atributos || {});
    if (valores) a["data-valores"] = JSON.stringify(valores);
    return el(tag, classe, a);
  }

  /* Nome da página aberta, sem ".html" (ex.: "04-lista"). */
  function paginaAtual() {
    return decodeURIComponent(window.location.pathname.split("/").pop()).replace(/\.html$/, "");
  }

  /* Tela de origem passada em ?de= (só nomes de página do protótipo); sem ela, a tela padrão. */
  function origem(padrao) {
    var de = new URLSearchParams(window.location.search).get("de");
    return de && /^(0[1-9]|1[0-5])-[a-z-]+$/.test(de) ? de : padrao;
  }

  /* Chave de contagem: a forma "_um" para 1 ("1 item"), a chave base para os outros números. */
  function contagem(chave, n) {
    return n === 1 ? chave + "_um" : chave;
  }

  function texto(chave, valores) {
    var t = C().texto(chave, valores);
    if (t === null) console.error("[rumo] chave sem texto:", chave);
    return t === null ? "[" + chave + "]" : t;
  }

  /* Alternância (aria-pressed) com o ícone trocando entre repouso e ativo. */
  function alternar(botao, ligado) {
    botao.setAttribute("aria-pressed", ligado ? "true" : "false");
    var nome = botao.getAttribute("data-icone");
    var caixa = botao.querySelector(".ico-caixa");
    if (nome && caixa) caixa.innerHTML = icone(nome, ligado);
  }

  /* Mascote com apoio (o apoio de papel só aparece no tema escuro, desenhado por estilo.css). */
  function mascote(nome, classe, informa) {
    var apoio = el("span", "apoio " + (classe || ""));
    var m = el("span", null, { "data-mascote": nome });
    if (informa) m.setAttribute("data-mascote-texto", "");
    apoio.appendChild(m);
    return apoio;
  }

  /* ---------- A rota de cinco paradas ---------- */

  var PARADAS = [
    { id: "preparar", n: 1, arquivo: "02-criar-viagem.html", chave: "rumo.parada.preparar" },
    { id: "carregar", n: 2, arquivo: "04-lista.html", chave: "rumo.parada.carregar" },
    { id: "camping", n: 3, arquivo: "07-estadia.html", chave: "rumo.parada.camping" },
    { id: "volta", n: 4, arquivo: "08-volta.html", chave: "rumo.parada.volta" },
    { id: "casa", n: 5, arquivo: "09-em-casa.html", chave: "rumo.parada.casa" }
  ];

  function parada(id) {
    for (var i = 0; i < PARADAS.length; i++) if (PARADAS[i].id === id) return PARADAS[i];
    return null;
  }

  function montarRota(atual, comIcone) {
    var nav = el("nav", "rota", { "data-texto-aria": "rumo.rota.rotulo" });
    var ol = el("ol", "rota-paradas");
    PARADAS.forEach(function (p) {
      var li = el("li", "rota-parada" + (p.id === atual ? " rota-parada--atual" : ""));
      var valores = { n: p.n, total: PARADAS.length, nome: texto(p.chave) };
      var a = el("a", "rota-alvo", {
        href: p.arquivo,
        "data-texto-aria": p.id === atual ? "rumo.rota.atual_aria" : "rumo.rota.parada_aria",
        "data-valores": JSON.stringify(valores),
        "aria-current": p.id === atual ? "step" : null
      });
      var marca = el("span", "rota-marca");
      if (p.id === atual && comIcone) {
        marca.appendChild(mascote("icone", "apoio--rota"));
      } else {
        marca.appendChild(el("span", "rota-ponto"));
      }
      a.appendChild(marca);
      a.appendChild(tx("span", "rota-rotulo", p.chave));
      a.appendChild(tx("span", "rota-num", "rumo.rota.num", { n: p.n }));
      li.appendChild(a);
      ol.appendChild(li);
    });
    nav.appendChild(ol);
    return nav;
  }

  /* ---------- A legenda (camping, grupo, gastos) ---------- */

  var legendaAberta = null;

  function montarLegenda(tela) {
    var dados = C().dados;
    var raiz = el("div", "painel", { hidden: "" });
    raiz.appendChild(el("div", "painel-fundo"));
    var caixa = el("section", "painel-caixa painel-caixa--legenda", { role: "dialog", "aria-labelledby": "legenda-titulo" });
    var cabeca = el("div", "painel-cabeca");
    var titulo = tx("h2", "painel-titulo", "rumo.legenda.titulo", null, { id: "legenda-titulo" });
    var fechar = el("button", "painel-fechar", { type: "button", "data-texto-aria": "acao.fechar" }, icone("fechar"));
    cabeca.appendChild(titulo);
    cabeca.appendChild(fechar);
    caixa.appendChild(cabeca);
    caixa.appendChild(tx("p", "painel-intro", "rumo.legenda.intro"));

    var lista = el("ul", "legenda-lista");
    function atual(n) {
      return tela === n ? "page" : null;
    }
    /* Camping: alertas (3) e o fato (10). */
    var liC = el("li", "legenda-item legenda-item--grupo");
    var simboloC = el("span", "legenda-simbolo", null, icone("barraca"));
    var corpoC = el("div", "legenda-corpo");
    corpoC.appendChild(tx("span", "legenda-nome", "area.camping"));
    var ligC = el("div", "legenda-sub");
    ligC.appendChild(el("a", "legenda-ligacao", { href: "03-alertas.html", "aria-current": atual(3) }, null));
    ligC.lastChild.appendChild(tx("span", null, "tela.3"));
    ligC.lastChild.insertAdjacentHTML("beforeend", icone("direita"));
    /* O fato guarda de onde se veio, para o "Voltar" levar de volta à mesma tela. */
    var fato = el("a", "legenda-ligacao", { href: "10-fato.html?de=" + (tela === 10 ? origem("07-estadia") : paginaAtual()), "aria-current": atual(10) });
    fato.appendChild(tx("span", null, "rumo.legenda.fato", { fato: dados.fato.nome }));
    fato.insertAdjacentHTML("beforeend", icone("direita"));
    ligC.appendChild(fato);
    corpoC.appendChild(ligC);
    liC.appendChild(simboloC);
    liC.appendChild(corpoC);
    lista.appendChild(liC);

    [{ n: 11, arquivo: "11-grupo.html", ico: "grupo", nome: "area.grupo", sub: "rumo.legenda.grupo_sub" },
      { n: 12, arquivo: "12-gastos.html", ico: "gastos", nome: "area.gastos", sub: "rumo.legenda.gastos_sub" }].forEach(function (e) {
      var li = el("li", "legenda-item");
      var a = el("a", "legenda-ligacao legenda-ligacao--area", { href: e.arquivo, "aria-current": atual(e.n) });
      a.appendChild(el("span", "legenda-simbolo", null, icone(e.ico)));
      var corpo = el("span", "legenda-corpo");
      corpo.appendChild(tx("span", "legenda-nome", e.nome));
      corpo.appendChild(tx("span", "legenda-detalhe", e.sub));
      a.appendChild(corpo);
      a.insertAdjacentHTML("beforeend", icone("direita"));
      li.appendChild(a);
      lista.appendChild(li);
    });
    caixa.appendChild(lista);
    raiz.appendChild(caixa);
    return { raiz: raiz, caixa: caixa, fechar: fechar };
  }

  /* Painel genérico (folha de baixo) com foco preso e anúncio de abertura. */
  function painel(opcoes) {
    var raiz = el("div", "painel", { hidden: "" });
    raiz.appendChild(el("div", "painel-fundo"));
    var caixa = el("section", "painel-caixa", { role: "dialog", "aria-labelledby": opcoes.id + "-titulo" });
    var cabeca = el("div", "painel-cabeca");
    cabeca.appendChild(tx("h2", "painel-titulo", opcoes.titulo, opcoes.valores, { id: opcoes.id + "-titulo" }));
    var fechar = el("button", "painel-fechar", { type: "button", "data-texto-aria": "acao.fechar" }, icone("fechar"));
    cabeca.appendChild(fechar);
    caixa.appendChild(cabeca);
    var corpo = el("div", "painel-corpo");
    caixa.appendChild(corpo);
    raiz.appendChild(caixa);
    (C().elementoTela || document.body).appendChild(raiz);
    var soltar = null;
    var api = {
      corpo: corpo,
      abrir: function () {
        raiz.hidden = false;
        soltar = C().prenderFoco(caixa, api.fechar);
        C().anunciar(texto(opcoes.titulo, opcoes.valores));
      },
      fechar: function () {
        if (raiz.hidden) return;
        raiz.hidden = true;
        if (soltar) soltar();
        soltar = null;
        if (opcoes.aoFechar) opcoes.aoFechar();
      },
      aberto: function () { return !raiz.hidden; }
    };
    fechar.addEventListener("click", api.fechar);
    return api;
  }

  /* ---------- Montagem de uma tela do app ---------- */
  /* cfg: { parada: id | null, icone: bool, voltar: "arquivo.html" | null, legenda: bool (padrão true),
            acoes: [{ id, chave, tipo: "principal" | "secundaria", href, icone }], discreto: { href, chave },
            deslizar: bool (padrão: true quando há parada), curvas: objeto de curvas() ou false } */
  function montar(cfg) {
    cfg = cfg || {};
    var cg = C();
    var principal = document.querySelector("main");
    var tela = cg.elementoTela || document.body;
    var refs = { acoes: {} };

    /* Curvas de nível no fundo do topo. */
    if (cfg.curvas !== false) {
      var fundo = el("div", "topo-curvas", { "aria-hidden": "true" }, curvas(cfg.curvas));
      principal.insertBefore(fundo, principal.firstChild);
    }

    /* Rota (em toda tela da viagem). */
    if (cfg.rota !== false) {
      var rota = montarRota(cfg.parada, cfg.icone);
      var depoisDoFundo = principal.querySelector(".topo-curvas");
      principal.insertBefore(rota, depoisDoFundo ? depoisDoFundo.nextSibling : principal.firstChild);
      refs.rota = rota;
    }

    /* "Voltar" de texto, no topo, nas telas internas. */
    if (cfg.voltar) {
      var voltar = el("a", "voltar", { href: cfg.voltar });
      voltar.insertAdjacentHTML("beforeend", icone("voltar"));
      voltar.appendChild(tx("span", null, "acao.voltar"));
      var cabecalho = principal.querySelector(".etapa");
      principal.insertBefore(voltar, cabecalho);
    }

    /* Linha da etapa: "Parada 2 de 5 · Carregar" ou "Legenda · Grupo". */
    var marca = principal.querySelector(".etapa-marca");
    if (marca) {
      var p = parada(cfg.parada);
      if (p) {
        marca.setAttribute("data-texto", "rumo.etapa");
        marca.setAttribute("data-valores", JSON.stringify({ n: p.n, total: PARADAS.length, nome: texto(p.chave) }));
      } else if (cfg.area) {
        marca.setAttribute("data-texto", "rumo.etapa.legenda");
        marca.setAttribute("data-valores", JSON.stringify({ nome: texto(cfg.area) }));
      }
    }

    /* Rodapé fixo: ação principal (e secundária) acima da legenda. */
    var rodape = el("div", "rodape");
    if (cfg.acoes && cfg.acoes.length) {
      var linha = el("div", "rodape-acoes");
      cfg.acoes.forEach(function (a) {
        var b = a.href ? el("a", "botao botao--" + (a.tipo || "principal"), { href: a.href })
          : el("button", "botao botao--" + (a.tipo || "principal"), { type: "button" });
        if (a.id) b.id = a.id;
        if (a.icone) b.insertAdjacentHTML("beforeend", icone(a.icone));
        b.appendChild(tx("span", "botao-texto", a.chave, a.valores));
        linha.appendChild(b);
        refs.acoes[a.id || a.chave] = b;
      });
      rodape.appendChild(linha);
    }
    if (cfg.discreto) {
      var d = el("a", "discreto", { href: cfg.discreto.href });
      d.appendChild(tx("span", null, cfg.discreto.chave));
      rodape.appendChild(d);
    }
    if (cfg.legenda !== false) {
      var botaoLegenda = el("button", "legenda-botao", { type: "button", "aria-haspopup": "dialog", "aria-expanded": "false", "data-texto-aria": "rumo.legenda.aria" });
      botaoLegenda.insertAdjacentHTML("beforeend", icone("legenda"));
      var rot = el("span", "legenda-botao-texto");
      rot.appendChild(tx("span", "legenda-botao-nome", "rumo.legenda.botao"));
      rot.appendChild(tx("span", "legenda-botao-itens", "rumo.legenda.itens"));
      botaoLegenda.appendChild(rot);
      rodape.appendChild(botaoLegenda);

      var leg = montarLegenda(cg.tela);
      tela.appendChild(leg.raiz);
      var soltar = null;
      var fecharLegenda = function () {
        if (leg.raiz.hidden) return;
        leg.raiz.hidden = true;
        botaoLegenda.setAttribute("aria-expanded", "false");
        if (soltar) soltar();
        soltar = null;
      };
      botaoLegenda.addEventListener("click", function () {
        leg.raiz.hidden = false;
        botaoLegenda.setAttribute("aria-expanded", "true");
        soltar = cg.prenderFoco(leg.caixa, fecharLegenda);
        cg.anunciar(texto("rumo.legenda.aberta"));
      });
      leg.fechar.addEventListener("click", fecharLegenda);
      legendaAberta = fecharLegenda;
      refs.legenda = botaoLegenda;
    }
    if (rodape.children.length) {
      tela.appendChild(rodape);
      refs.rodape = rodape;
      /* O conteúdo termina acima do rodapé, em qualquer tamanho de fonte. */
      var ajustar = function () {
        principal.style.paddingBottom = (rodape.offsetHeight + 24) + "px";
      };
      ajustar();
      if (window.ResizeObserver) new ResizeObserver(ajustar).observe(rodape);
      else window.addEventListener("resize", ajustar);
    }

    /* Deslizar para os lados troca de parada (gesto extra; as paradas são botões). */
    var p2 = parada(cfg.parada);
    if (p2 && cfg.deslizar !== false) {
      var rolagem = cg.elementoRolagem || document.body;
      var inicio = null;
      rolagem.addEventListener("pointerdown", function (ev) {
        if (ev.pointerType !== "touch") return;
        inicio = { x: ev.clientX, y: ev.clientY, t: Date.now() };
      }, { passive: true });
      rolagem.addEventListener("pointerup", function (ev) {
        if (!inicio || ev.pointerType !== "touch") return;
        var dx = ev.clientX - inicio.x, dy = ev.clientY - inicio.y, dt = Date.now() - inicio.t;
        inicio = null;
        if (Math.abs(dx) < 70 || Math.abs(dy) > 45 || dt > 700) return;
        var alvo = PARADAS[p2.n - 1 + (dx < 0 ? 1 : -1)];
        if (alvo) window.location.href = window.RUMO_PALETA ? window.RUMO_PALETA.endereco(alvo.arquivo) : alvo.arquivo;
      });
      rolagem.addEventListener("pointercancel", function () { inicio = null; });
    }

    return refs;
  }

  /* ---------- Linha de item da lista (telas 4 e 6) ---------- */
  /* estado: "carro" | "separei" | "a_separar". aoMudar(novoEstado). */
  function linhaEstado(estado) {
    var span = el("span", "estado estado--" + estado);
    if (estado === "carro") {
      span.insertAdjacentHTML("beforeend", icone("carro", true));
      span.appendChild(tx("span", null, "estado.carro"));
    } else if (estado === "separei") {
      span.insertAdjacentHTML("beforeend", icone("separei", true));
      span.appendChild(tx("span", null, "rumo.estado.separei_fora", { separei: texto("estado.separei"), fora: texto("estado.fora_do_carro") }));
    } else {
      span.insertAdjacentHTML("beforeend", icone("separei"));
      span.appendChild(tx("span", null, "estado.a_separar"));
    }
    return span;
  }

  function botaoAlternar(nomeIcone, chaveAria, valores, ligado) {
    var b = el("button", "alt alt-" + nomeIcone, {
      type: "button", "data-icone": nomeIcone, "data-texto-aria": chaveAria, "data-valores": JSON.stringify(valores)
    });
    b.appendChild(el("span", "ico-caixa"));
    alternar(b, ligado);
    return b;
  }

  function linhaItem(item, estado, aoMudar, opcoes) {
    opcoes = opcoes || {};
    var li = el("li", "item item--" + estado, { "data-id": item.id });
    var abrir = opcoes.semLigacao ? el("span", "item-abrir") : el("a", "item-abrir", {
      href: opcoes.href || "05-item.html",
      "data-texto-aria": "rumo.item.abrir", "data-valores": JSON.stringify({ falado: C().nomeFalado(item, estado) })
    });
    abrir.appendChild(el("span", "item-nome", null)).textContent = item.nome;
    var meta = el("span", "item-meta");
    meta.appendChild(el("span", "item-qtd")).textContent = item.quantidadeTexto;
    meta.appendChild(linhaEstado(estado));
    abrir.appendChild(meta);
    li.appendChild(abrir);
    var botoes = el("div", "item-botoes", { role: "group", "aria-label": item.nome });
    var bS = botaoAlternar("separei", "rumo.alternar.separei", { nome: item.nome }, estado === "separei" || estado === "carro");
    var bC = botaoAlternar("carro", "rumo.alternar.carro", { nome: item.nome }, estado === "carro");
    bS.addEventListener("click", function () {
      aoMudar(estado === "a_separar" ? "separei" : "a_separar");
    });
    bC.addEventListener("click", function () {
      aoMudar(estado === "carro" ? "separei" : "carro");
    });
    botoes.appendChild(bS);
    botoes.appendChild(bC);
    li.appendChild(botoes);
    return li;
  }

  /* Régua de progresso: um traço por item, cheio quando está no carro (escala de mapa). */
  function regua(feitos, total, classe) {
    var r = el("span", "regua " + (classe || ""), { "aria-hidden": "true" });
    for (var i = 0; i < total; i++) r.appendChild(el("span", i < feitos ? "regua-cheia" : "regua-vazia"));
    return r;
  }

  /* Bloco recolhível (categoria): botão com aria-expanded que abre e fecha a folha. */
  function recolhivel(id, aberto, cabecaConteudo, conteudo) {
    var sec = el("section", "cat" + (aberto ? " cat--aberta" : ""), { "data-cat": id });
    var h = el("h2", "cat-titulo");
    var b = el("button", "cat-botao", { type: "button", "aria-expanded": aberto ? "true" : "false", "aria-controls": "cat-" + id });
    var cab = el("span", "cat-cabeca");
    cabecaConteudo.forEach(function (c) { cab.appendChild(c); });
    b.appendChild(cab);
    b.insertAdjacentHTML("beforeend", icone("baixo"));
    h.appendChild(b);
    sec.appendChild(h);
    conteudo.id = "cat-" + id;
    conteudo.hidden = !aberto;
    sec.appendChild(conteudo);
    b.addEventListener("click", function () {
      var abrir = b.getAttribute("aria-expanded") !== "true";
      b.setAttribute("aria-expanded", abrir ? "true" : "false");
      conteudo.hidden = !abrir;
      sec.classList.toggle("cat--aberta", abrir);
    });
    return { secao: sec, botao: b };
  }

  window.RUMO = {
    icones: ICONES,
    ordem: ORDEM,
    icone: icone,
    curvas: curvas,
    paradas: PARADAS,
    el: el,
    tx: tx,
    texto: texto,
    contagem: contagem,
    origem: origem,
    alternar: alternar,
    botaoAlternar: botaoAlternar,
    mascote: mascote,
    montar: montar,
    painel: painel,
    linhaItem: linhaItem,
    linhaEstado: linhaEstado,
    regua: regua,
    recolhivel: recolhivel,
    fecharLegenda: function () { if (legendaAberta) legendaAberta(); }
  };
})();

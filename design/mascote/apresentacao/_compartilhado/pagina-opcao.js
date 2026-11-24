/* Página de uma opção. O MESMO código monta as 10 opções (e o exemplo 00).
   O número vem de <body data-opcao="NN">; os dados vêm de dados.js da pasta da opção. */
(function () {
  var CAMP = window.CAMP, T = CAMP.T, O = T.opcao, U = T.usos, el = CAMP.el;
  var numero = document.body.getAttribute("data-opcao") || "";
  var ehExemplo = numero === "00";
  var reg = window.CAMPINGUIM_OPCOES || {};
  var d = reg[numero];
  var pronta = !!(d && d.pronta !== false);
  var BASE = ""; /* a arte é relativa à pasta da opção, onde esta página está */

  function arte(k) { var r = CAMP.artePath(d, k); return r ? CAMP.caminho(BASE, r) : ""; }
  function img(k, alt, classe) {
    var src = arte(k);
    if (!src) return el("div", { class: "arte-ausente", role: "img", "aria-label": O.arteAusente + ": " + k }, [el("span", { text: O.arteAusente }), el("small", { text: k })]);
    return CAMP.imgArte(src, alt, classe, CAMP.fmt(O.arteAusenteDetalhe, { arquivo: CAMP.artePath(d, k) }));
  }
  function secao(id, titulo, nota) {
    return el("section", { class: "secao", "aria-labelledby": id }, [
      el("h2", { id: id, text: titulo }),
      nota ? el("p", { class: "nota", text: nota }) : null
    ]);
  }

  /* Lista de pendências viva: arquivos de arte que falham ao carregar entram nela depois. */
  var faltas = [], vistos = {};
  var listaFaltas = el("ul");
  var painel = el("details", { class: "pendencias", style: "margin-top:32px", open: true }, [
    el("summary"), el("p", { text: O.pendenciasNota }), listaFaltas
  ]);
  painel.hidden = true;
  function pintarFaltas() {
    painel.hidden = faltas.length === 0;
    painel.firstChild.textContent = O.pendenciasTitulo + " (" + faltas.length + ")";
    listaFaltas.textContent = "";
    faltas.forEach(function (f) { listaFaltas.appendChild(el("li", { text: f })); });
  }
  CAMP.aoFaltarArquivo = function (src) {
    if (vistos[src]) return;
    vistos[src] = true;
    faltas.push(CAMP.fmt(T.pendencias.arteNaoCarregou, { arquivo: src }));
    pintarFaltas();
  };
  var chavesErradas = Object.keys(reg).filter(function (k) { return k !== numero; });

  CAMP.titulo(pronta && d.nome ? CAMP.fmt(O.tituloPagina, { n: numero, nome: d.nome }) : CAMP.fmt(d && d.estado === "nao-validada" ? O.tituloPaginaNaoValidada : O.tituloPaginaVazia, { n: numero }));
  CAMP.topo("../../", null);

  CAMP.iniciar(function (main) {
    /* navegação anterior/próxima e volta à inicial */
    var esq = null, dir = null;
    if (!ehExemplo) {
      var i = CAMP.NUMEROS.indexOf(numero), N = CAMP.NUMEROS.length;
      var ant = CAMP.NUMEROS[(i + N - 1) % N], prox = CAMP.NUMEROS[(i + 1) % N];
      esq = el("a", { class: "btn", href: "../" + ant + "/index.html", rel: "prev", text: "← " + O.anterior + " (" + ant + ")" });
      dir = el("a", { class: "btn", href: "../" + prox + "/index.html", rel: "next", text: O.proxima + " (" + prox + ") →" });
    }
    var meio = el("div", { class: "meio" }, [el("a", { class: "btn", href: "../../index.html", text: O.voltarInicio })]);
    if (!ehExemplo) meio.appendChild(el("a", { class: "btn", href: "../../avaliacao.html#op-" + numero, text: O.avaliarEsta }));
    main.appendChild(el("nav", { class: "nav-opcao", "aria-label": O.opcaoRotulo }, [esq, meio, dir]));

    if (ehExemplo) main.appendChild(el("div", { class: "aviso-exemplo", role: "note", text: O.exemploAviso }));

    if (!d && chavesErradas.length) {
      /* o dados.js existe mas registrou outra chave: não é "em produção", é erro de preenchimento */
      main.appendChild(el("div", { class: "opcao-titulo" }, [el("span", { class: "num", text: numero }), el("h1", { text: O.pendenciasTitulo })]));
      faltas = chavesErradas.map(function (k) { return CAMP.fmt(T.pendencias.chaveDiferente, { chave: k, pasta: numero }); });
      main.appendChild(painel);
      pintarFaltas();
      return;
    }

    if (!pronta) {
      var nv = d && d.estado === "nao-validada";
      main.appendChild(el("div", { class: "opcao-titulo" }, [el("span", { class: "num", text: numero }), el("h1", { text: nv ? O.naoValidadaTitulo : O.emProducaoTitulo })]));
      main.appendChild(el("p", { class: "opcao-frase", text: nv ? O.naoValidadaTexto : O.emProducaoTexto }));
      return;
    }

    var acento = CAMP.acento(d);

    /* título */
    main.appendChild(el("div", { class: "opcao-titulo" }, [el("span", { class: "num", text: numero }), el("h1", { text: d.nome || "" })]));
    if (d.frase) main.appendChild(el("p", { class: "opcao-frase", text: d.frase }));

    /* 1. mascote grande */
    var s = secao("s-principal", O.secPrincipal);
    if (CAMP.artePath(d, "sem-acessorio")) {
      s.appendChild(el("div", { class: "par-principal" }, [
        el("figure", {}, [el("div", { class: "palco palco-quadrado" }, [img("principal", d.nome || "")]), el("figcaption", { text: O.comAcessorio })]),
        el("figure", {}, [el("div", { class: "palco palco-quadrado" }, [img("sem-acessorio", O.semAcessorio)]), el("figcaption", { text: O.semAcessorio })])
      ]));
    } else {
      s.appendChild(el("div", { class: "palco palco-grande" }, [img("principal", d.nome || "")]));
    }
    main.appendChild(s);

    /* 2. três vistas */
    s = secao("s-vistas", O.secVistas, O.secVistasNota);
    var gv = el("div", { class: "grade-vistas" });
    [["vista-frente", O.vistaFrente], ["vista-lado", O.vistaLado], ["vista-tres-quartos", O.vistaTresQuartos]].forEach(function (v) {
      gv.appendChild(el("figure", {}, [el("div", { class: "palco palco-quadrado" }, [img(v[0], v[1])]), el("figcaption", { text: v[1] })]));
    });
    s.appendChild(gv);
    main.appendChild(s);

    /* 3. quatro poses (+ extras opcionais) */
    s = secao("s-poses", O.secPoses);
    var gp = el("div", { class: "grade-poses" });
    [["pose-neutro", O.poseNeutro], ["pose-comemorando", O.poseComemorando], ["pose-alerta", O.poseAlerta], ["pose-camping", O.poseCamping]].forEach(function (p) {
      gp.appendChild(el("figure", {}, [el("div", { class: "palco palco-quadrado" }, [img(p[0], p[1])]), el("figcaption", { text: p[1] })]));
    });
    (Array.isArray(d.poses_extras) ? d.poses_extras : []).forEach(function (p) {
      if (!p || !p.arte) return;
      var titulo = p.titulo || O.poseExtra;
      gp.appendChild(el("figure", {}, [
        el("div", { class: "palco palco-quadrado" }, [CAMP.imgArte(CAMP.caminho(BASE, p.arte), titulo, "", CAMP.fmt(O.arteAusenteDetalhe, { arquivo: p.arte }))]),
        el("figcaption", { text: titulo })
      ]));
    });
    s.appendChild(gp);
    main.appendChild(s);

    /* 4. os cinco usos reais */
    s = secao("s-usos", O.secUsos, O.secUsosNota);
    var usos = el("div", { class: "usos" });
    function uso(titulo, conteudo, largo) {
      return el("div", { class: "uso" + (largo ? " largo" : "") }, [el("h3", { text: titulo }), conteudo]);
    }

    /* 4.1 ícone na tela inicial, entre ícones neutros (formas genéricas) */
    var formas = [
      '<svg viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="9" fill="none" stroke="#fff" stroke-width="3"/></svg>',
      '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M14 4 25 23H3z" fill="#fff"/></svg>',
      '<svg viewBox="0 0 28 28" aria-hidden="true"><rect x="5" y="5" width="18" height="18" rx="3" fill="#fff"/></svg>',
      '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M5 22V9l9 8 9-8v13" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>',
      '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M14 4v20M4 14h20" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/></svg>',
      '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M4 14a10 10 0 0 1 20 0z" fill="#fff"/></svg>',
      '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M6 20 14 6l8 14z" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>'
    ];
    var fundos = ["#6f6f78", "#5d6b66", "#7a6e66", "#62687a", "#707070", "#66736a", "#7b6a72"];
    var fileira = el("div", { class: "fileira-icones" });
    [0, 1, 2, "nosso", 3, 4, 5, 6].forEach(function (k) {
      if (k === "nosso") {
        fileira.appendChild(el("div", { class: "app-ic" }, [
          el("div", { class: "fig nosso" }, [img("icone", T.produto)]),
          el("span", { text: U.telaInicialRotulo })
        ]));
      } else {
        var f = el("div", { class: "fig neutro" });
        f.style.background = fundos[k];
        f.innerHTML = formas[k];
        fileira.appendChild(el("div", { class: "app-ic" }, [f, el("span", { text: U.iconesVizinhos[k] })]));
      }
    });
    usos.appendChild(uso(O.usoIcone, fileira));

    /* 4.2 tela de abertura */
    var botaoAbertura = el("span", { class: "botao-abertura", text: U.aberturaBotao });
    usos.appendChild(uso(O.usoAbertura, el("div", { class: "celular" }, [
      el("div", { class: "tela tela-abertura" }, [
        el("div", { class: "grande" }, [img("principal", d.nome || "")]),
        el("div", { class: "marca", text: T.produto }),
        botaoAbertura
      ])
    ])));

    /* 4.3 uma tela do app */
    var par = CAMP.parLegivel(acento);
    function aviso(titulo, texto) {
      var a = el("div", { class: "aviso-app" }, [el("b", { text: titulo }), el("span", { text: texto }), el("small", { text: U.telaFonte })]);
      a.style.background = par.fundo; a.style.color = par.texto;
      return a;
    }
    function linha(tipo, texto, cor) {
      var bolinha = el("i"); bolinha.style.background = cor;
      return el("div", { class: "linha-app" }, [el("span", { class: "tipo" }, [bolinha, tipo]), el("span", { text: texto })]);
    }
    var telaApp = el("div", { class: "tela tela-app" }, [
      el("div", { class: "barra-topo" }, [
        el("div", { class: "av" }, [img("pose-alerta", T.produto)]),
        el("div", {}, [el("b", { text: U.telaTitulo }), el("small", { text: U.telaSub })])
      ]),
      el("div", { class: "corpo" }, [
        aviso(U.telaAlertaTitulo, U.telaAlerta1),
        aviso(U.telaAlertaTitulo, U.telaAlerta2),
        linha(U.telaRegrasTipo, U.telaRegrasFato, acento),
        linha(U.telaEntrou, U.telaEntrouItem, acento),
        linha(U.telaSaiu, U.telaSaiuItem, "#8d8d86"),
        linha(U.telaTarefa, U.telaTarefaItem, acento)
      ])
    ]);
    usos.appendChild(uso(O.usoTela, el("div", { class: "celular" }, [telaApp])));

    botaoAbertura.style.background = "#2b2b2f"; botaoAbertura.style.color = "#ffffff";

    /* 4.4 cabeçalho do site (largura de computador, reduzida para caber) */
    function acaoSite() {
      var x = el("span", { class: "acao", text: U.siteBotao });
      x.style.background = par.fundo; x.style.color = par.texto;
      return x;
    }
    var mock = el("div", { class: "site-mock" }, [
      el("div", { class: "barra-nav" }, [
        el("div", { class: "logo" }, [img("icone", T.produto), el("span", { text: T.produto })]),
        acaoSite()
      ]),
      el("div", { class: "heroi" }, [
        el("div", {}, [el("h4", { text: U.siteChamada }), el("p", { text: U.siteSub })]),
        el("div", { class: "fig" }, [img("pose-neutro", T.produto)])
      ])
    ]);
    var escala = el("div", { class: "site-escala" }, [mock]);
    function ajustar() {
      var w = escala.clientWidth;
      if (!w) return;
      var k = Math.min(1, w / 1100);
      mock.style.transform = "scale(" + k + ")";
      escala.style.height = Math.ceil(mock.offsetHeight * k) + "px";
    }
    window.addEventListener("resize", ajustar);
    window.addEventListener("load", ajustar);
    if (window.ResizeObserver) new ResizeObserver(ajustar).observe(escala);

    /* versão de celular do mesmo cabeçalho (abaixo de 900 px a de computador ficaria ilegível) */
    var celularSite = el("div", { class: "site-celular" }, [
      el("div", { class: "barra-nav" }, [
        el("div", { class: "logo" }, [img("icone", T.produto), el("span", { text: T.produto })]),
        acaoSite()
      ]),
      el("div", { class: "heroi" }, [
        el("h4", { text: U.siteChamada }),
        el("p", { text: U.siteSub }),
        el("div", { class: "fig" }, [img("pose-neutro", T.produto)])
      ])
    ]);
    var blocoSite = el("div", { class: "site-par" }, [escala, celularSite]);
    usos.appendChild(uso(O.usoSite, blocoSite, true));

    /* 4.5 versão em uma cor só */
    usos.appendChild(uso(O.usoUmaCor, el("div", { class: "palco", style: "width:180px;height:180px;padding:12px" }, [img("uma-cor", O.usoUmaCor, "uma-cor")])));

    s.appendChild(usos);
    main.appendChild(s);

    /* 5. versão em uma cor */
    s = secao("s-uma-cor", O.secUmaCor, O.secUmaCorNota);
    s.appendChild(el("div", { class: "palco palco-grande" }, [img("uma-cor", O.secUmaCor, "uma-cor")]));
    main.appendChild(s);

    /* 6. ícone em 48 px ao lado da versão grande */
    s = secao("s-icone", O.secIcone, O.secIconeNota);
    s.appendChild(el("div", { class: "icone-lado" }, [
      el("figure", {}, [el("div", { class: "palco palco-quadrado" }, [img("principal", O.iconeGrande)]), el("figcaption", { text: O.iconeGrande })]),
      el("div", { class: "icone-par" }, [
        el("figure", {}, [el("div", { class: "caixa-48 claro" }, [img("icone", O.icone48Claro, "icone-48")]), el("figcaption", { text: O.icone48Claro })]),
        el("figure", {}, [el("div", { class: "caixa-48 escuro" }, [img("icone", O.icone48Escuro, "icone-48")]), el("figcaption", { text: O.icone48Escuro })])
      ])
    ]));
    main.appendChild(s);

    /* 7. paleta e raciocínio */
    s = secao("s-paleta", O.secPaleta);
    var paleta = el("ul", { class: "paleta", "aria-label": O.paletaTitulo });
    (Array.isArray(d.paleta) ? d.paleta : []).forEach(function (c) {
      if (!c) return;
      var am = el("span", { class: "amostra", "aria-hidden": "true" });
      if (CAMP.hexOk(c.hex)) am.style.background = c.hex;
      paleta.appendChild(el("li", {}, [am, el("div", {}, [
        el("div", {}, [el("span", { class: "nome", text: c.nome || "" }), " ", el("span", { class: "hex", text: c.hex || "" })]),
        el("div", { class: "papel", text: c.papel || "" })
      ])]));
    });
    var rac = el("ul", { class: "raciocinio", "aria-label": O.raciocinioTitulo });
    (Array.isArray(d.raciocinio) ? d.raciocinio : []).forEach(function (l) { rac.appendChild(el("li", { text: l })); });
    s.appendChild(el("h3", { text: O.paletaTitulo }));
    s.appendChild(paleta);
    s.appendChild(el("h3", { text: O.raciocinioTitulo }));
    s.appendChild(rac);
    main.appendChild(s);

    /* 8. originalidade (MSC-06) */
    s = secao("s-orig", O.secOriginalidade);
    s.appendChild(el("div", { class: "bloco-texto" }, [
      el("span", { class: "selo-original", text: "✓ " + O.originalidadeSelo }),
      el("p", { text: d.originalidade || "" })
    ]));
    main.appendChild(s);

    /* 9. estudo ilustrado (opcional): só para as opções listadas em estudos.js (aprovadas pelo QA); fora da lista, nada é pedido */
    var E = O.estudo;
    function mostrarEstudo() {
      if ((window.CAMPINGUIM_ESTUDOS || []).indexOf(numero) < 0) return;
      var estudo = new Image();
      estudo.addEventListener("load", function () {
        var fig = el("figure", { class: "estudo-fig" }, [
          el("div", { class: "palco palco-grande estudo-palco" }, []),
          el("figcaption", { text: E.legenda })
        ]);
        estudo.alt = E.alt;
        fig.firstChild.appendChild(estudo);
        var se = secao("s-estudo", E.titulo);
        se.appendChild(el("p", { class: "selo-estudo", role: "note", text: E.rotulo }));
        se.appendChild(fig);
        main.insertBefore(se, painel);
      });
      estudo.src = "estudo/estudo-ilustrado.png";
    }
    var lista = document.createElement("script");
    lista.src = "../../_compartilhado/estudos.js";
    lista.addEventListener("load", mostrarEstudo);
    document.head.appendChild(lista);

    /* pendências no arquivo de dados (para quem preenche a opção) */
    faltas = faltas.concat(CAMP.validar(d, numero));
    main.appendChild(painel);
    pintarFaltas();

    ajustar();
  });
})();

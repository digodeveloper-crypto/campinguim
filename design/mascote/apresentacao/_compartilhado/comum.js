/* Código comum a todas as páginas da apresentação. Sem dependências, abre por file://. */
(function () {
  var T = window.TEXTOS;
  var CAMP = (window.CAMP = {});
  CAMP.T = T;

  /* ---------- utilidades ---------- */
  CAMP.el = function (tag, attrs, filhos) {
    var n = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === "text") n.textContent = v;
      else if (k === "class") n.className = v;
      else if (k.indexOf("on") === 0 && typeof v === "function") n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? "" : v);
    });
    (filhos || []).forEach(function (f) {
      if (f === null || f === undefined || f === false) return;
      n.appendChild(typeof f === "string" ? document.createTextNode(f) : f);
    });
    return n;
  };
  var el = CAMP.el;

  CAMP.fmt = function (modelo, valores) {
    return String(modelo).replace(/\{(\w+)\}/g, function (_, k) {
      return valores && valores[k] !== undefined ? valores[k] : "";
    });
  };

  /* Guarda no navegador com leitura e escrita protegidas contra falha. */
  CAMP.armazem = {
    ok: true,
    ler: function (chave, padrao) {
      try {
        var bruto = window.localStorage.getItem(chave);
        return bruto === null ? padrao : JSON.parse(bruto);
      } catch (e) {
        CAMP.armazem.ok = false;
        return padrao;
      }
    },
    gravar: function (chave, valor) {
      try {
        window.localStorage.setItem(chave, JSON.stringify(valor));
        return true;
      } catch (e) {
        CAMP.armazem.ok = false;
        return false;
      }
    }
  };

  /* ---------- registro das opções ---------- */
  var NUMEROS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];
  CAMP.NUMEROS = NUMEROS;

  CAMP.opcao = function (numero) {
    var reg = window.CAMPINGUIM_OPCOES || {};
    var d = reg[numero];
    if (d && d.pronta !== false) return d;
    return d && d.estado === "nao-validada" ? { numero: numero, pronta: false, estado: "nao-validada" } : { numero: numero, pronta: false };
  };
  /* Rótulo do lugar vazio de uma opção sem arte na apresentação: "em produção" (não entregue) ou "não validada" (entregue, sem validação) */
  CAMP.rotuloVazio = function (d, secao) {
    var S = T[secao];
    return d && d.estado === "nao-validada" ? S.naoValidada : S.emProducao;
  };
  CAMP.opcoes = function () {
    return NUMEROS.map(CAMP.opcao);
  };

  CAMP.ARTES = [
    "principal", "vista-frente", "vista-lado", "vista-tres-quartos",
    "pose-neutro", "pose-comemorando", "pose-alerta", "pose-camping",
    "icone", "uma-cor"
  ];

  /* Caminho da arte, a partir da pasta onde a página está.
     'base' é o prefixo da pasta da opção vista da página atual. */
  CAMP.caminho = function (base, rel) {
    return base + String(rel || "").replace(/^\.?\//, "");
  };

  CAMP.artePath = function (dados, chave) {
    var a = dados && dados.arte;
    return a && a[chave] ? a[chave] : "";
  };

  /* Imagem de arte com aviso visível se faltar o arquivo. */
  CAMP.imgArte = function (src, alt, classe, rotuloFalta) {
    var img = el("img", { src: src, alt: alt || "", class: classe || "", decoding: "async" });
    img.addEventListener("error", function () {
      if (CAMP.aoFaltarArquivo) CAMP.aoFaltarArquivo(img.getAttribute("src"));
      var falta = el("div", { class: "arte-ausente", role: "img", "aria-label": T.opcao.arteAusente + ": " + (alt || "") }, [
        el("span", { text: T.opcao.arteAusente }),
        el("small", { text: rotuloFalta || "" })
      ]);
      if (img.parentNode) img.parentNode.replaceChild(falta, img);
    });
    return img;
  };

  /* ---------- cor ---------- */
  CAMP.hexOk = function (h) {
    return typeof h === "string" && /^#[0-9a-fA-F]{6}$/.test(h);
  };
  CAMP.acento = function (dados) {
    var p = dados && dados.paleta && dados.paleta[0];
    return p && CAMP.hexOk(p.hex) ? p.hex : "#6b6b70";
  };
  function lin(c) { return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function rgb(hex) { return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]; }
  function lum(c) { return 0.2126 * lin(c[0] / 255) + 0.7152 * lin(c[1] / 255) + 0.0722 * lin(c[2] / 255); }
  function contraste(c1, c2) {
    var a = lum(c1), b = lum(c2), hi = Math.max(a, b), lo = Math.min(a, b);
    return (hi + 0.05) / (lo + 0.05);
  }
  function misturar(c, alvo, t) { return c.map(function (v, i) { return Math.round(v + (alvo[i] - v) * t); }); }
  function hexDe(c) { return "#" + c.map(function (v) { var h = v.toString(16); return h.length < 2 ? "0" + h : h; }).join(""); }
  var BRANCO = [255, 255, 255], ESCURO = [28, 28, 30];

  /* Texto sobre um fundo de acento, com contraste AA (4,5:1): escolhe branco ou escuro pelo maior
     contraste; se nenhum chegar, ajusta o fundo (o mínimo possível) até chegar. */
  CAMP.parLegivel = function (hex) {
    var base = rgb(hex);
    var cb = contraste(base, BRANCO), ce = contraste(base, ESCURO);
    if (Math.max(cb, ce) >= 4.5) return { fundo: hex, texto: cb >= ce ? "#ffffff" : "#1c1c1e" };
    var passoB = 0, passoE = 0, t;
    for (t = 1; t <= 50; t++) { if (contraste(misturar(base, [0, 0, 0], t / 50), BRANCO) >= 4.5) { passoB = t; break; } }
    for (t = 1; t <= 50; t++) { if (contraste(misturar(base, [255, 255, 255], t / 50), ESCURO) >= 4.5) { passoE = t; break; } }
    if (passoB && (!passoE || passoB <= passoE)) return { fundo: hexDe(misturar(base, [0, 0, 0], passoB / 50)), texto: "#ffffff" };
    return { fundo: hexDe(misturar(base, [255, 255, 255], passoE / 50)), texto: "#1c1c1e" };
  };

  /* ---------- fundo da arte (claro/escuro) ---------- */
  var CHAVE_FUNDO = "campinguim-mascote-fundo-v1";
  function aplicarFundo(f) {
    document.documentElement.setAttribute("data-fundo", f);
  }
  aplicarFundo(CAMP.armazem.ler(CHAVE_FUNDO, "claro") === "escuro" ? "escuro" : "claro");

  /* ---------- topo e rodapé ---------- */
  CAMP.topo = function (raiz, ativo) {
    var f = document.documentElement.getAttribute("data-fundo");
    var botao = el("button", { type: "button", class: "btn btn-fundo", "aria-pressed": f === "escuro" ? "true" : "false", title: T.topo.fundoDica });
    function rotulo() {
      var esc = document.documentElement.getAttribute("data-fundo") === "escuro";
      botao.textContent = T.topo.fundoRotulo + ": " + (esc ? T.topo.fundoEscuro : T.topo.fundoClaro);
      botao.setAttribute("aria-pressed", esc ? "true" : "false");
    }
    botao.addEventListener("click", function () {
      var novo = document.documentElement.getAttribute("data-fundo") === "escuro" ? "claro" : "escuro";
      aplicarFundo(novo);
      CAMP.armazem.gravar(CHAVE_FUNDO, novo);
      rotulo();
    });
    rotulo();

    function link(href, texto, chave) {
      return el("a", { href: raiz + href, class: "topo-link", "aria-current": ativo === chave ? "page" : null, text: texto });
    }
    var cab = el("header", { class: "topo" }, [
      el("div", { class: "topo-in" }, [
        el("a", { href: raiz + "index.html", class: "topo-marca", text: T.produto }),
        el("nav", { class: "topo-nav", "aria-label": T.topo.navRotulo }, [
          link("index.html", T.topo.inicio, "inicio"),
          link("comparacao.html", T.topo.comparacao, "comparacao"),
          link("avaliacao.html", T.topo.avaliacao, "avaliacao")
        ]),
        botao
      ])
    ]);
    document.body.insertBefore(cab, document.body.firstChild);
  };

  CAMP.rodape = function () {
    document.body.appendChild(el("footer", { class: "rodape" }, [
      el("div", { class: "contem", text: T.rodape.nota })
    ]));
  };

  CAMP.titulo = function (texto) {
    document.title = texto + " · " + T.produto;
  };

  CAMP.iniciar = function (fn) {
    function go() {
      var main = el("main", { id: "conteudo", class: "contem" });
      document.body.appendChild(main);
      fn(main);
      CAMP.rodape();
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
    else go();
  };

  /* ---------- avaliação: dados e contas ---------- */
  CAMP.CHAVE_NOTAS = "campinguim-mascote-notas-v1";
  CAMP.lerNotas = function () {
    var n = CAMP.armazem.ler(CAMP.CHAVE_NOTAS, {});
    return n && typeof n === "object" ? n : {};
  };
  CAMP.gravarNotas = function (notas) {
    return CAMP.armazem.gravar(CAMP.CHAVE_NOTAS, notas);
  };
  CAMP.totalNotas = function (notas, numero) {
    var o = notas[numero] || {}, t = 0;
    T.avaliacao.criterios.forEach(function (c) {
      var v = Number(o[c.id]);
      if (v >= 1 && v <= 5) t += v;
    });
    return t;
  };
  CAMP.temNota = function (notas, numero) {
    var o = notas[numero] || {};
    return T.avaliacao.criterios.some(function (c) { return Number(o[c.id]) >= 1; });
  };

  /* ---------- molduras reutilizáveis ---------- */
  CAMP.palco = function (filho, classe) {
    return el("div", { class: "palco " + (classe || "") }, [filho]);
  };

  /* ---------- conferência do dados.js (aviso para quem preenche a opção) ---------- */
  CAMP.validar = function (d, pasta) {
    var P = T.pendencias, falta = [];
    if (pasta && String(d.numero) !== pasta) falta.push(CAMP.fmt(P.numeroDiferente, { numero: d.numero, pasta: pasta }));
    ["numero", "nome", "frase", "originalidade"].forEach(function (k) { if (!d[k]) falta.push(CAMP.fmt(P.campoAusente, { campo: k })); });
    if (!Array.isArray(d.raciocinio) || d.raciocinio.length !== 3 || !d.raciocinio.every(Boolean)) falta.push(P.raciocinio);
    if (!Array.isArray(d.paleta) || !d.paleta.length) falta.push(P.paletaVazia);
    else d.paleta.forEach(function (c, i) {
      if (!c || !c.nome || !CAMP.hexOk(c.hex) || !c.papel) falta.push(CAMP.fmt(P.paletaItem, { i: i }));
    });
    CAMP.ARTES.forEach(function (k) { if (!CAMP.artePath(d, k)) falta.push(CAMP.fmt(P.arteSemCaminho, { chave: k })); });
    if (Array.isArray(d.poses_extras) && d.poses_extras.length > 3) falta.push(CAMP.fmt(P.posesExtras, { n: d.poses_extras.length }));
    return falta;
  };
})();

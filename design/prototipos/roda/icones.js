/* Campinguim · protótipo 5 · Roda · ícones e peças comuns da direção.
   Ícones desenhados para a Roda (direcoes.md, seção 5): grade de 24, traço de 2,25 px, pontas e cantos
   arredondados, formas cheias e amigáveis; pessoas como cabeça e ombro, sem rosto. Nenhum ícone de biblioteca.
   Os de base, comuns às cinco, com o traço da Roda: separei = caixa marcada; está no carro = carro de perfil;
   preciso comprar = sacola; atenção = triângulo com exclamação; faltou = caixa vazia com menos; ciente = visto.
   Estado ativo: o ícone ganha um círculo a 18 % da cor do estado, com o ícone na cor cheia (estilo.css).

   O padrão de produção permite só cinco arquivos de apoio por direção; por isso as peças que as telas da
   Roda repetem (emblema de família, rodapé com "Mural", o mural e as folhas) moram aqui, em window.RODA,
   logo depois dos ícones. Nenhum texto visível neste arquivo: tudo vem de textos.js e de dados.js. */
(function () {
  "use strict";

  var T = {
    /* Estados (DSG-10). */
    "separei": '<rect x="3.75" y="3.75" width="16.5" height="16.5" rx="4.5"/><path d="M8 12.4l2.8 2.8L16.2 9.6"/>',
    "caixa": '<rect x="3.75" y="3.75" width="16.5" height="16.5" rx="4.5"/>',
    "carro": '<path d="M2.9 16.2v-3.6a1.7 1.7 0 0 1 1.2-1.6l2.7-.9 2.3-3.1a2.2 2.2 0 0 1 1.8-.9h3.9c.7 0 1.3.3 1.7.8l2.6 3.2 1.4.4a1.7 1.7 0 0 1 1.2 1.6v4.1"/><path d="M4.9 16.6h.4M10.2 16.6h3.6M18.7 16.6h.4"/><circle cx="7.7" cy="16.6" r="2.3"/><circle cx="16.3" cy="16.6" r="2.3"/><path d="M8.4 10.6h7.4"/>',
    "comprar": '<path d="M5.2 8.6h13.6l-1 10.4a2.1 2.1 0 0 1-2.1 1.9H8.3a2.1 2.1 0 0 1-2.1-1.9z"/><path d="M9 11V7.3a3 3 0 0 1 6 0V11"/>',
    "atencao": '<path d="M10.3 4.6a2 2 0 0 1 3.4 0l7.3 12.7a2 2 0 0 1-1.7 3H4.7a2 2 0 0 1-1.7-3z"/><path d="M12 9.6v3.8"/><path d="M12 16.6v.1"/>',
    "faltou": '<rect x="3.75" y="3.75" width="16.5" height="16.5" rx="4.5"/><path d="M8.5 12h7"/>',
    "sobrou": '<rect x="3.75" y="3.75" width="16.5" height="16.5" rx="4.5"/><path d="M8.5 12h7M12 8.5v7"/>',
    "ciente": '<path d="M5 12.6l4.4 4.4L19 7.4"/>',
    "conferido": '<circle cx="12" cy="12" r="8.6"/><path d="M8.3 12.3l2.6 2.6 4.9-5"/>',
    "secar": '<path d="M12 7.6a2.1 2.1 0 1 1 2.1-2.1"/><path d="M12 7.6v1.3l-8.4 5.6c-.7.5-.4 1.6.5 1.6h15.8c.9 0 1.2-1.1.5-1.6L12 8.9"/><path d="M7 19.5h10"/>',
    "informacao": '<circle cx="12" cy="12" r="8.6"/><path d="M12 11v5.2"/><path d="M12 7.9v.1"/>',
    "feito": '<rect x="3.75" y="3.75" width="16.5" height="16.5" rx="4.5"/><path d="M8 12.4l2.8 2.8L16.2 9.6"/>',

    /* Navegação e áreas. */
    "mural": '<rect x="3.75" y="3.75" width="7" height="7.8" rx="2.2"/><rect x="13.25" y="3.75" width="7" height="5.2" rx="2.2"/><rect x="3.75" y="14.05" width="7" height="6.2" rx="2.2"/><rect x="13.25" y="11.45" width="7" height="8.8" rx="2.2"/>',
    "lista": '<path d="M9.5 7h10M9.5 12h10M9.5 17h10"/><path d="M4.6 7h.2M4.6 12h.2M4.6 17h.2"/>',
    "grupo": '<circle cx="8.6" cy="8.4" r="3"/><path d="M3.4 19.4a5.2 5.2 0 0 1 10.4 0"/><circle cx="16.4" cy="9.6" r="2.5"/><path d="M15.4 14.4a4.4 4.4 0 0 1 5.2 4.9"/>',
    "gastos": '<path d="M6.2 3.9h11.6v16.4l-2.3-1.4-2.3 1.4-2.4-1.4-2.3 1.4-2.3-1.4z"/><path d="M9.2 8.6h5.6M9.2 12.1h5.6M9.2 15.4h3"/>',
    "barraca": '<path d="M2.8 19.6h18.4"/><path d="M4.6 19.6L12 6.2l7.4 13.4"/><path d="M12 6.2l-1.3-2.1M12 6.2l1.3-2.1"/><path d="M9.6 19.6L12 15l2.4 4.6"/>',
    "volta": '<path d="M8.6 6.4L4.6 10.4l4 4"/><path d="M4.6 10.4h10a4.8 4.8 0 0 1 0 9.6h-3.4"/>',
    "casa": '<path d="M3.9 11.2L12 4.6l8.1 6.6"/><path d="M6.2 9.4v10.2h11.6V9.4"/><path d="M10 19.6v-4.8h4v4.8"/>',
    "fechar": '<path d="M6.4 6.4l11.2 11.2M17.6 6.4L6.4 17.6"/>',
    "seta": '<path d="M9.4 5.8l6.2 6.2-6.2 6.2"/>',
    "seta-esquerda": '<path d="M14.6 5.8L8.4 12l6.2 6.2"/>',

    /* Ações. */
    "mais": '<path d="M12 5.8v12.4M5.8 12h12.4"/>',
    "menos": '<path d="M5.8 12h12.4"/>',
    "copiar": '<rect x="8.4" y="8.4" width="11.8" height="11.8" rx="2.8"/><path d="M15.6 8.4V6.6a2.8 2.8 0 0 0-2.8-2.8H6.6a2.8 2.8 0 0 0-2.8 2.8v6.2a2.8 2.8 0 0 0 2.8 2.8h1.8"/>',
    "compartilhar": '<path d="M12 3.9v11"/><path d="M8.1 7.8L12 3.9l3.9 3.9"/><path d="M5.2 12.6v5.6a2 2 0 0 0 2 2h9.6a2 2 0 0 0 2-2v-5.6"/>',
    "remover": '<path d="M4.6 7h14.8"/><path d="M9.6 7V5.2c0-.6.5-1.1 1.1-1.1h2.6c.6 0 1.1.5 1.1 1.1V7"/><path d="M6.8 7l.9 12a1.9 1.9 0 0 0 1.9 1.7h4.8a1.9 1.9 0 0 0 1.9-1.7l.9-12"/>',
    "desfazer": '<path d="M8.8 14.2L4.4 9.8l4.4-4.4"/><path d="M4.4 9.8h9.8a5.4 5.4 0 0 1 0 10.8h-2.4"/>',
    "lembrete": '<path d="M6.4 16.4V11a5.6 5.6 0 0 1 11.2 0v5.4l1.6 1.8H4.8z"/><path d="M10 20.4a2.2 2.2 0 0 0 4 0"/>',
    "eu-levo": '<circle cx="10" cy="8.2" r="3.2"/><path d="M4 19.6a6 6 0 0 1 9.4-4.9"/><path d="M18 13.6v6.4M14.8 16.8h6.4"/>',
    "pessoa": '<circle cx="12" cy="8.1" r="3.6"/><path d="M5.2 20a6.8 6.8 0 0 1 13.6 0"/>',
    "baixar": '<path d="M12 4v11"/><path d="M7.9 11.1L12 15.2l4.1-4.1"/><path d="M4.8 19.6h14.4"/>',
    "site": '<rect x="3.6" y="4.8" width="16.8" height="14.4" rx="3"/><path d="M3.6 9.2h16.8"/><path d="M6.6 7h.1M9 7h.1"/>',

    /* Viagem (tela 2). */
    "frio": '<path d="M12 3.6v16.8M4.7 7.8l14.6 8.4M4.7 16.2l14.6-8.4"/><path d="M9.8 4.9L12 6.9l2.2-2M9.8 19.1l2.2-2 2.2 2"/>',
    "ameno": '<circle cx="9.6" cy="9.4" r="3.2"/><path d="M9.6 3.6v.8M3.8 9.4h.8M5.5 5.3l.6.6M13.7 5.3l-.6.6"/><path d="M8.6 19.6h8.6a3.2 3.2 0 0 0 .3-6.4 4.4 4.4 0 0 0-8.3 1.5 2.5 2.5 0 0 0-.6 4.9z"/>',
    "calor": '<circle cx="12" cy="12" r="4"/><path d="M12 3.6v1.6M12 18.8v1.6M3.6 12h1.6M18.8 12h1.6M6.1 6.1l1.1 1.1M16.8 16.8l1.1 1.1M6.1 17.9l1.1-1.1M16.8 7.2l1.1-1.1"/>',
    "mochila": '<path d="M7.2 8.6a4.8 4.8 0 0 1 9.6 0v10.2a1.8 1.8 0 0 1-1.8 1.8H9a1.8 1.8 0 0 1-1.8-1.8z"/><path d="M10 3.8h4"/><path d="M9.6 13.4h4.8v3.2H9.6z"/>',
    "motorhome": '<path d="M3.2 16.4V7.6a1.8 1.8 0 0 1 1.8-1.8h10.6l3.4 4.6 1.8.6v5.4"/><path d="M5.6 16.6h.3M10.8 16.6h2.6M18.2 16.6h.6"/><circle cx="8.2" cy="16.6" r="2.3"/><circle cx="15.8" cy="16.6" r="2.3"/><path d="M6.4 9.4h3.4v3H6.4z"/><path d="M12.8 9.4h2.6"/>'
  };

  function svg(nome) {
    if (!Object.prototype.hasOwnProperty.call(T, nome)) return null;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" ' +
      'stroke-linejoin="round" aria-hidden="true" focusable="false">' + T[nome] + '</svg>';
  }

  window.CAMPINGUIM_ICONES = { nomes: Object.keys(T), svg: svg };
})();

/* ---------- Peças comuns das telas da Roda ---------- */
window.RODA = (function () {
  "use strict";

  var doc = document;
  function C() { return window.CAMPINGUIM; }

  /* Cria um elemento. Opções: classe, texto (chave), valores, aria (chave do aria-label), dado (valor de
     dados.js, posto como texto), e qualquer outro atributo. */
  function el(tag, opcoes, filhos) {
    var e = doc.createElement(tag);
    opcoes = opcoes || {};
    Object.keys(opcoes).forEach(function (k) {
      var v = opcoes[k];
      if (v === null || v === undefined || v === false) return;
      if (k === "classe") e.className = v;
      else if (k === "texto") e.setAttribute("data-texto", v);
      else if (k === "valores") e.setAttribute("data-valores", JSON.stringify(v));
      else if (k === "aria") e.setAttribute("data-texto-aria", v);
      else if (k === "dado") e.textContent = String(v);
      else e.setAttribute(k, v === true ? "" : String(v));
    });
    (filhos || []).forEach(function (f) { if (f) e.appendChild(f); });
    return e;
  }

  function icone(nome, classe) {
    var s = el("span", { classe: "r-icone" + (classe ? " " + classe : ""), "aria-hidden": "true", "data-icone": nome });
    s.innerHTML = window.CAMPINGUIM_ICONES.svg(nome) || "";
    s.setAttribute("data-icone-feito", nome);
    return s;
  }

  function trocarIcone(span, nome) {
    if (!span) return;
    span.setAttribute("data-icone", nome);
    span.innerHTML = window.CAMPINGUIM_ICONES.svg(nome) || "";
    span.setAttribute("data-icone-feito", nome);
  }

  function preencherIcones(raiz) {
    var lista = (raiz || doc).querySelectorAll("[data-icone]");
    for (var i = 0; i < lista.length; i++) {
      var s = lista[i];
      var nome = s.getAttribute("data-icone");
      if (s.getAttribute("data-icone-feito") === nome) continue;
      if (!s.classList.contains("r-icone")) s.classList.add("r-icone");
      s.setAttribute("aria-hidden", "true");
      trocarIcone(s, nome);
    }
  }

  /* Ícone num círculo (estado ativo: círculo a 18 % da cor do estado). tipo: separei | carro | atencao | neutro | "". */
  function circulo(nome, tipo) {
    return el("span", { classe: "r-circulo" + (tipo ? " r-circulo--" + tipo : ""), "aria-hidden": "true" }, [icone(nome)]);
  }

  /* ---------- Emblema de família ---------- */

  function familia(id) {
    var fs = C().dado("grupo.familias") || [];
    for (var i = 0; i < fs.length; i++) if (fs[i].id === id) return fs[i];
    return null;
  }

  /* opcoes: aceso, contorno, tamanho ("pequeno" | "grande"), informa (lê o nome da família). */
  function emblema(id, opcoes) {
    opcoes = opcoes || {};
    var f = familia(id);
    var ordem = (C().dado("grupo.familias") || []).indexOf(f) + 1;
    var classes = "r-emblema r-emblema--cor" + ordem + (opcoes.contorno ? " r-emblema--contorno" : "") +
      (opcoes.tamanho ? " r-emblema--" + opcoes.tamanho : "");
    var e = el("span", { classe: classes, "data-aceso": opcoes.aceso ? "1" : "0", "data-familia": id });
    e.appendChild(el("span", { classe: "r-emblema-mono", "aria-hidden": "true", dado: f ? f.iniciais : "" }));
    if (opcoes.informa && f) {
      e.setAttribute("role", "img");
      e.setAttribute("aria-label", f.nome);
    } else {
      e.setAttribute("aria-hidden", "true");
    }
    return e;
  }

  function acender(e, aceso) {
    if (e) e.setAttribute("data-aceso", aceso ? "1" : "0");
  }

  /* ---------- Mural: a navegação da Roda ---------- */

  var BLOCOS = [
    { id: "lista", arquivo: "04-lista.html", telas: [4, 5, 6], titulo: "mural.lista", icone: "lista" },
    { id: "grupo", arquivo: "11-grupo.html", telas: [11], titulo: "mural.grupo", icone: "grupo" },
    { id: "gastos", arquivo: "12-gastos.html", telas: [12], titulo: "mural.gastos", icone: "gastos" },
    { id: "camping", arquivo: "03-alertas.html", telas: [3, 7, 10, 13], titulo: "mural.camping", icone: "barraca" },
    { id: "volta", arquivo: "08-volta.html", telas: [8], titulo: "mural.volta", icone: "volta" },
    { id: "casa", arquivo: "09-em-casa.html", telas: [9], titulo: "mural.casa", icone: "casa" }
  ];

  function resumoDoBloco(id) {
    var c = C();
    if (id === "lista") {
      var p = c.progresso(estadosDaLista);
      return { texto: "mensagem.progresso_carro", valores: { feitos: p.noCarro, total: p.total } };
    }
    if (id === "grupo") return { texto: "mural.grupo_resumo", valores: { n: (c.dado("grupo.semDono") || []).length } };
    if (id === "gastos") return { texto: "mural.gastos_resumo", valores: { valor: c.dinheiro(c.dado("gastos.usuaria.deveCentavos")) } };
    if (id === "camping") {
      var n = (c.dado("alertas") || []).filter(function (a) { return a.nivel === "atencao"; }).length;
      return { texto: "mural.camping_resumo", valores: { n: n } };
    }
    if (id === "volta") return { texto: "mensagem.progresso_conferidos", valores: { feitos: c.dado("volta.conferidos"), total: c.dado("volta.total") } };
    return { texto: "mural.casa_resumo" };
  }

  var estadosDaLista = {};
  var mural = null;
  var app = null;
  var soltar = null;
  var botoesMural = [];

  function montarMural() {
    var c = C();
    var tela = c.tela;
    var corpoMural = el("div", { classe: "r-camada-rolagem" });

    var cabeca = el("div", { classe: "r-mural-cabeca" }, [
      el("p", { classe: "r-topo-viagem r-suave r-pequeno", dado: c.dado("grupo.nomeViagem.texto") }),
      el("h2", { id: "r-mural-titulo", classe: "r-mural-titulo", texto: "mural.titulo" }),
      el("p", { classe: "r-suave", texto: "mural.intro" })
    ]);
    var familias = el("div", { classe: "r-mural-familias" });
    (c.dado("grupo.familias") || []).forEach(function (f) {
      familias.appendChild(el("span", { classe: "r-mural-familia" }, [
        emblema(f.id, { tamanho: "pequeno" }),
        el("span", { dado: f.nome })
      ]));
    });
    cabeca.appendChild(familias);
    corpoMural.appendChild(cabeca);

    var grade = el("nav", { classe: "r-blocos", aria: "mural.rotulo" });
    BLOCOS.forEach(function (b) {
      var r = resumoDoBloco(b.id);
      var aqui = b.telas.indexOf(tela) >= 0;
      var a = el("a", { classe: "r-bloco r-bloco--" + b.id, href: b.arquivo, "aria-current": aqui ? "page" : null, "data-bloco": b.id }, [
        circulo(b.icone),
        el("span", { classe: "r-bloco-texto" }, [
          el("span", { classe: "r-bloco-titulo", texto: b.titulo }),
          el("span", { classe: "r-bloco-resumo", texto: r.texto, valores: r.valores || null })
        ]),
        el("span", { classe: "r-bloco-pe" }, [
          aqui ? el("span", { classe: "r-bloco-aqui", texto: "mural.voce_esta_aqui" }) : el("span"),
          icone("seta", "r-seta")
        ])
      ]);
      grade.appendChild(a);
    });
    corpoMural.appendChild(grade);

    var rodape = el("div", { classe: "r-rodape" }, [
      el("button", { type: "button", classe: "r-mural-botao", "data-fechar-mural": "", "aria-expanded": "true", "aria-controls": "r-mural" }, [
        icone("fechar"),
        el("span", { texto: "mural.fechar" })
      ])
    ]);

    mural = el("div", { classe: "r-camada r-mural", id: "r-mural", role: "dialog", "aria-modal": "true", "aria-labelledby": "r-mural-titulo", hidden: true }, [
      corpoMural, rodape
    ]);
    rodape.querySelector("button").addEventListener("click", fecharMural);
    (c.elementoRolagem || doc.body).appendChild(mural);
  }

  function atualizarResumoLista() {
    if (!mural) return;
    var a = mural.querySelector('[data-bloco="lista"] .r-bloco-resumo');
    var r = resumoDoBloco("lista");
    if (a) a.setAttribute("data-valores", JSON.stringify(r.valores));
  }

  function abrirMural() {
    if (!mural) montarMural();
    atualizarResumoLista();
    mural.hidden = false;
    if (app) app.hidden = true;
    botoesMural.forEach(function (b) { b.setAttribute("aria-expanded", "true"); });
    var rol = mural.querySelector(".r-camada-rolagem");
    if (rol) rol.scrollTop = 0;
    soltar = C().prenderFoco(mural, fecharMural);
    C().anunciar(C().texto("mural.aberto"));
  }

  function fecharMural() {
    if (!mural || mural.hidden) return;
    mural.hidden = true;
    if (app) app.hidden = false;
    botoesMural.forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
    if (soltar) { soltar(); soltar = null; }
    if (botoesMural[0]) botoesMural[0].focus();
  }

  /* ---------- Folha (painel que sobe do rodapé, com foco preso) ---------- */

  function folha(veu, aoFechar) {
    var soltarFolha = null;
    var aberta = false;
    function fechar() {
      if (!aberta) return;
      aberta = false;
      veu.hidden = true;
      if (soltarFolha) { soltarFolha(); soltarFolha = null; }
      if (aoFechar) aoFechar();
    }
    function abrir(anuncio) {
      if (aberta) return;
      aberta = true;
      veu.hidden = false;
      soltarFolha = C().prenderFoco(veu.querySelector("[role=dialog]") || veu, fechar);
      if (anuncio) C().anunciar(C().texto(anuncio));
    }
    veu.addEventListener("click", function (ev) { if (ev.target === veu) fechar(); });
    return { abrir: abrir, fechar: fechar };
  }

  /* ---------- Tema e fonte seguem pelas ligações do app ---------- */

  function levarParametros(ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null;
    if (!a || !a.closest(".cg-tela")) return;
    var h = a.getAttribute("href");
    if (!/^[0-9a-z\-]+\.html(#[\w\-]*)?$/.test(h)) return;
    var atual;
    try { atual = new URLSearchParams(window.location.search); } catch (e) { return; }
    var q = [];
    ["tema", "fonte", "moldura", "avaliador"].forEach(function (k) {
      if (atual.has(k)) q.push(k + "=" + encodeURIComponent(atual.get(k)));
    });
    if (!q.length) return;
    var partes = h.split("#");
    a.setAttribute("href", partes[0] + "?" + q.join("&") + (partes[1] ? "#" + partes[1] : ""));
  }

  /* ---------- Valor em reais nunca quebra entre "R$" e o número ---------- */
  /* O texto vem pronto de base.js; aqui só se embrulha cada valor num <span class="cg-dinheiro"> (sem quebra),
     sem mudar o texto. Quando a base troca o texto, o embrulho é refeito. */
  var RX_REAL = /R\$\s[\d.]+,\d{2}/g;
  function escapar(t) { return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function protegerDinheiro() {
    var lista = doc.querySelectorAll("[data-texto]");
    for (var i = 0; i < lista.length; i++) {
      var e = lista[i];
      if (e.children.length) continue;
      var t = e.textContent;
      RX_REAL.lastIndex = 0;
      if (!RX_REAL.test(t)) continue;
      RX_REAL.lastIndex = 0;
      e.innerHTML = escapar(t).replace(RX_REAL, function (m) { return '<span class="cg-dinheiro">' + m + "</span>"; });
    }
  }
  var protecaoMarcada = false;
  function agendarProtecao() {
    if (protecaoMarcada) return;
    protecaoMarcada = true;
    window.setTimeout(function () { protecaoMarcada = false; protegerDinheiro(); }, 0);
  }

  /* ---------- Início comum: ícones, rodapé, mural ---------- */

  function iniciar(opcoes) {
    opcoes = opcoes || {};
    app = doc.querySelector(".r-app");
    preencherIcones(doc);
    var lista = doc.querySelectorAll("[data-mural]");
    for (var i = 0; i < lista.length; i++) {
      var b = lista[i];
      b.setAttribute("aria-expanded", "false");
      b.setAttribute("aria-controls", "r-mural");
      b.setAttribute("aria-haspopup", "dialog");
      b.addEventListener("click", abrirMural);
      botoesMural.push(b);
    }
    doc.addEventListener("click", levarParametros, true);
    agendarProtecao();
    if (window.MutationObserver) {
      new MutationObserver(agendarProtecao).observe(doc.body, { childList: true, subtree: true, characterData: true });
    }
    if (botoesMural.length && window.location.hash === "#mural") abrirMural();
  }

  return {
    el: el,
    icone: icone,
    trocarIcone: trocarIcone,
    preencherIcones: preencherIcones,
    circulo: circulo,
    familia: familia,
    emblema: emblema,
    acender: acender,
    abrirMural: abrirMural,
    fecharMural: fecharMural,
    folha: folha,
    iniciar: iniciar,
    /* A tela da lista avisa o mural do progresso marcado agora (só em memória). */
    estadosDaLista: function (estados) { estadosDaLista = estados || {}; atualizarResumoLista(); }
  };
})();

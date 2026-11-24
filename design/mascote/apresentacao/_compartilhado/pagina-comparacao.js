/* Comparação: 10 ícones em 48 px e 10 versões em uma cor. */
(function () {
  var CAMP = window.CAMP, T = CAMP.T, el = CAMP.el;
  CAMP.titulo(T.comparacao.titulo);
  CAMP.topo("", "comparacao");
  CAMP.iniciar(function (main) {
    main.appendChild(el("div", { class: "pagina-cab" }, [
      el("h1", { text: T.comparacao.titulo }),
      el("p", { text: T.comparacao.intro })
    ]));
    var ops = CAMP.opcoes();

    var s1 = el("section", { class: "secao", "aria-labelledby": "h-ic" }, [el("h2", { id: "h-ic", text: T.comparacao.secIcones })]);
    var fil = el("ul", { class: "fileira-48" });
    ops.forEach(function (d) {
      var pasta = "opcoes/" + d.numero + "/", rel = CAMP.artePath(d, "icone");
      var chip = el("span", { class: "chip-48" }, [
        d.pronta !== false && rel
          ? CAMP.imgArte(CAMP.caminho(pasta, rel), d.nome || d.numero, "icone-48", rel)
          : el("span", { class: "vazio-48", role: "img", "aria-label": CAMP.rotuloVazio(d, "comparacao") })
      ]);
      fil.appendChild(el("li", {}, [
        el("a", { href: pasta + "index.html", "aria-label": CAMP.fmt(T.comparacao.verOpcao, { n: d.numero }) }, [chip, el("span", { class: "n", text: d.numero })])
      ]));
    });
    s1.appendChild(fil);
    main.appendChild(s1);

    var s2 = el("section", { class: "secao", "aria-labelledby": "h-uc" }, [el("h2", { id: "h-uc", text: T.comparacao.secUmaCor })]);
    var gr = el("ul", { class: "grade-uma-cor" });
    ops.forEach(function (d) {
      var pasta = "opcoes/" + d.numero + "/", rel = CAMP.artePath(d, "uma-cor");
      var palco = el("div", { class: "palco palco-quadrado" }, [
        d.pronta !== false && rel
          ? CAMP.imgArte(CAMP.caminho(pasta, rel), d.nome || d.numero, "uma-cor", rel)
          : el("span", { class: "vazio-producao", text: CAMP.rotuloVazio(d, "comparacao") })
      ]);
      gr.appendChild(el("li", {}, [
        el("a", { href: pasta + "index.html", style: "text-decoration:none;display:grid;gap:6px", "aria-label": CAMP.fmt(T.comparacao.verOpcao, { n: d.numero }) }, [
          palco, el("span", { class: "rotulo", text: d.numero + (d.nome ? " · " + d.nome : "") })
        ])
      ]));
    });
    s2.appendChild(gr);
    main.appendChild(s2);

    /* link discreto para a recomendação, com aviso antes de abrir */
    var dlg = el("dialog", { "aria-labelledby": "dlg-t" }, [
      el("h2", { id: "dlg-t", text: T.comparacao.recomendacaoAvisoTitulo }),
      el("p", { text: T.comparacao.recomendacaoAviso }),
      el("div", { class: "acoes" }, [
        el("button", { type: "button", class: "btn", text: T.comparacao.recomendacaoVoltar, onclick: function () { dlg.close(); } }),
        el("a", { class: "btn btn-forte", href: "recomendacao.html", text: T.comparacao.recomendacaoAbrir })
      ])
    ]);
    var abrir = el("button", { type: "button", class: "link-discreto", text: T.comparacao.recomendacaoLink, onclick: function () {
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    } });
    main.appendChild(el("div", { class: "rodape-discreto" }, [abrir, dlg]));
  });
})();

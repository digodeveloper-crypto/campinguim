/* Recomendação da Cinema: conteúdo vem de recomendacao-dados.js. */
(function () {
  var CAMP = window.CAMP, T = CAMP.T, el = CAMP.el;
  CAMP.titulo(T.recomendacao.titulo);
  CAMP.topo("", null);
  CAMP.iniciar(function (main) {
    main.appendChild(el("div", { class: "pagina-cab" }, [
      el("h1", { text: T.recomendacao.titulo }),
      el("p", { text: T.recomendacao.intro })
    ]));
    var dados = window.CAMPINGUIM_RECOMENDACAO;
    var vistas = {};
    var itens = dados && Array.isArray(dados.preferidas) ? dados.preferidas.filter(function (p) {
      if (!p || !p.numero) return false;
      var n = String(p.numero).length === 1 ? "0" + p.numero : String(p.numero);
      if (vistas[n]) return false; /* opção repetida: vale só a primeira vez */
      vistas[n] = true;
      return true;
    }) : [];
    if (!itens.length) {
      main.appendChild(el("div", { class: "rec-vazia", role: "status", text: T.recomendacao.vazia }));
    } else {
      var ul = el("ul", { class: "rec-lista" });
      itens.slice(0, 3).forEach(function (p, i) {
        var num = String(p.numero).length === 1 ? "0" + p.numero : String(p.numero);
        var d = CAMP.opcao(num), pasta = "opcoes/" + num + "/", rel = CAMP.artePath(d, "principal");
        var palco = el("div", { class: "palco" }, [
          d.pronta !== false && rel ? CAMP.imgArte(CAMP.caminho(pasta, rel), d.nome || num, "", rel) : el("span", { class: "vazio-producao", text: num })
        ]);
        ul.appendChild(el("li", { class: "rec-item" }, [
          palco,
          el("div", { style: "display:grid;gap:8px;align-content:start" }, [
            el("span", { class: "rotulo", text: CAMP.fmt(T.recomendacao.posicao, { p: i + 1 }) }),
            el("h2", {}, [el("a", { href: pasta + "index.html", text: num + (d.nome ? " · " + d.nome : "") })]),
            el("p", { text: p.motivo || "" })
          ])
        ]));
      });
      main.appendChild(ul);
    }
    main.appendChild(el("p", { style: "margin-top:24px" }, [el("a", { class: "btn", href: "comparacao.html", text: T.recomendacao.voltar })]));
  });
})();

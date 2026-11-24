/* Página inicial: as 10 opções lado a lado. */
(function () {
  var CAMP = window.CAMP, T = CAMP.T, el = CAMP.el;
  CAMP.titulo(T.inicial.titulo);
  CAMP.topo("", "inicio");
  CAMP.iniciar(function (main) {
    main.appendChild(el("div", { class: "pagina-cab" }, [
      el("h1", { text: T.inicial.titulo }),
      el("p", { text: T.inicial.intro })
    ]));
    var lista = el("ul", { class: "grade-opcoes" });
    CAMP.opcoes().forEach(function (d) {
      var n = d.numero, pronta = d.pronta !== false && d.nome;
      var pasta = "opcoes/" + n + "/";
      var palco;
      if (pronta && CAMP.artePath(d, "principal")) {
        palco = el("div", { class: "palco palco-quadrado" }, [
          CAMP.imgArte(CAMP.caminho(pasta, CAMP.artePath(d, "principal")), d.nome, "", CAMP.artePath(d, "principal"))
        ]);
      } else {
        palco = el("div", { class: "palco palco-quadrado" }, [el("span", { class: "vazio-producao", text: CAMP.rotuloVazio(d, "inicial") })]);
      }
      var cab = el("div", { class: "cartao-cab" }, [
        el("span", { class: "num", text: n }),
        pronta ? null : el("span", { class: "selo-producao", text: CAMP.rotuloVazio(d, "inicial") })
      ]);
      var a = el("a", {
        class: "cartao-opcao" + (pronta ? "" : " pendente"),
        href: pasta + "index.html",
        "aria-label": CAMP.fmt(T.inicial.ariaOpcao, { n: n, nome: pronta ? d.nome : CAMP.rotuloVazio(d, "inicial") })
      }, [
        cab, palco,
        el("span", { class: "nome", text: pronta ? d.nome : CAMP.rotuloVazio(d, "inicial") }),
        el("span", { class: "frase", text: pronta ? (d.frase || "") : (d.estado === "nao-validada" ? T.inicial.naoValidadaFrase : T.inicial.emProducaoFrase) })
      ]);
      lista.appendChild(el("li", {}, [a]));
    });
    main.appendChild(lista);
  });
})();

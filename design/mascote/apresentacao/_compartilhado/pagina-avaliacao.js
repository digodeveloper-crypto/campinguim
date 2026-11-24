/* Folha de avaliação: notas de 1 a 5 em 7 critérios, guardadas no navegador. */
(function () {
  var CAMP = window.CAMP, T = CAMP.T, A = T.avaliacao, el = CAMP.el;
  CAMP.titulo(A.titulo);
  CAMP.topo("", "avaliacao");
  CAMP.iniciar(function (main) {
    var notas = CAMP.lerNotas();
    var ops = CAMP.opcoes();
    var refs = { resumo: {}, tot: {}, botoes: {} };

    main.appendChild(el("div", { class: "pagina-cab" }, [
      el("h1", { text: A.titulo }),
      el("p", { text: A.intro }),
      el("p", { class: "rotulo", text: A.escala })
    ]));

    var aviso = el("div", { class: "aviso-armazem", role: "status", text: A.armazenamentoFalhou });
    aviso.hidden = true;
    main.appendChild(aviso);
    function checarArmazem() { aviso.hidden = CAMP.armazem.ok; }

    /* resumo */
    var thead = el("tr", {}, [el("th", { scope: "col", text: A.colOpcao })]);
    A.criterios.forEach(function (c) { thead.appendChild(el("th", { scope: "col" }, [el("abbr", { title: c.nome, text: c.curto })])); });
    thead.appendChild(el("th", { scope: "col", text: A.colTotal }));
    var tbody = el("tbody");
    ops.forEach(function (d) {
      var n = d.numero, pronta = d.pronta !== false && d.nome;
      var linha = el("tr", {}, [
        el("td", {}, [el("a", { href: "#op-" + n, text: n }), el("small", { text: pronta ? d.nome : CAMP.rotuloVazio(d, "avaliacao") })])
      ]);
      refs.resumo[n] = {};
      A.criterios.forEach(function (c) {
        var td = el("td"); refs.resumo[n][c.id] = td; linha.appendChild(td);
      });
      var tt = el("td"); refs.tot[n] = tt; linha.appendChild(tt);
      tbody.appendChild(linha);
    });
    main.appendChild(el("section", { class: "secao", "aria-labelledby": "h-res" }, [
      el("h2", { id: "h-res", text: A.resumoTitulo }),
      el("table", { class: "tabela-resumo" }, [el("thead", {}, [thead]), tbody]),
      el("p", { class: "legenda", text: A.legendaCriterios })
    ]));

    /* ações */
    var estado = el("p", { class: "estado", role: "status", "aria-live": "polite" });
    var caixa = el("textarea", { class: "texto-envio", readonly: true, "aria-label": A.textoCaixa });
    caixa.hidden = true;

    function textoEnvio() {
      var linhas = [A.textoCabecalho, ""];
      ops.forEach(function (d) {
        var n = d.numero, o = notas[n] || {};
        var pontos = A.criterios.map(function (c) {
          var v = Number(o[c.id]);
          return c.nome + " " + (v >= 1 && v <= 5 ? v : A.semNota);
        }).join(", ");
        linhas.push(CAMP.fmt(A.textoLinha, {
          n: n, nome: d.pronta !== false && d.nome ? d.nome : CAMP.rotuloVazio(d, "avaliacao"), notas: pontos,
          total: CAMP.temNota(notas, n) ? CAMP.totalNotas(notas, n) + "/35" : A.semNota
        }));
      });
      return linhas.join("\n");
    }

    var dlg = el("dialog", { "aria-labelledby": "dlg-l" }, [
      el("h2", { id: "dlg-l", text: A.limparConfirmaTitulo }),
      el("p", { text: A.limparConfirmaTexto }),
      el("div", { class: "acoes" }, [
        el("button", { type: "button", class: "btn", text: A.limparNao, onclick: function () { dlg.close(); } }),
        el("button", { type: "button", class: "btn btn-forte", text: A.limparSim, onclick: function () {
          notas = {}; CAMP.gravarNotas(notas); checarArmazem(); dlg.close(); pintarTudo(); estado.textContent = "";
        } })
      ])
    ]);

    var btnCopiar = el("button", { type: "button", class: "btn btn-forte", text: A.copiar, onclick: function () {
      var t = textoEnvio();
      caixa.value = t; caixa.hidden = false;
      function falhou() { estado.textContent = A.copiarFalhou; caixa.focus(); caixa.select(); }
      function copiouLegado() {
        try { caixa.focus(); caixa.select(); return document.execCommand("copy"); } catch (e) { return false; }
      }
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(t).then(function () { estado.textContent = A.copiado; }, function () {
            if (copiouLegado()) estado.textContent = A.copiado; else falhou();
          });
        } else if (copiouLegado()) estado.textContent = A.copiado; else falhou();
      } catch (e) { falhou(); }
    } });
    var btnLimpar = el("button", { type: "button", class: "btn", text: A.limpar, onclick: function () {
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    } });
    main.appendChild(el("div", { class: "barra-acoes" }, [btnCopiar, btnLimpar, estado]));
    main.appendChild(caixa);
    main.appendChild(dlg);

    /* cartões por opção */
    var cartoes = el("div", { class: "cartoes-av" });
    ops.forEach(function (d) {
      var n = d.numero, pronta = d.pronta !== false && d.nome, pasta = "opcoes/" + n + "/", rel = CAMP.artePath(d, "principal");
      refs.botoes[n] = {};
      var tot = el("span", { class: "tot" });
      refs.tot[n].dataset.n = n; refs.tot["_c" + n] = tot;
      var miniatura = el("div", { class: "palco" }, [
        pronta && rel ? CAMP.imgArte(CAMP.caminho(pasta, rel), d.nome, "", rel) : el("span", { class: "vazio-producao", text: "·" })
      ]);
      var corpo = el("div", { class: "cartao-av", id: "op-" + n }, [
        el("header", {}, [
          miniatura,
          el("div", {}, [
            el("div", { class: "num", style: "font-weight:700", text: n }),
            el("a", { href: pasta + "index.html", text: pronta ? d.nome : CAMP.rotuloVazio(d, "avaliacao") })
          ]),
          tot
        ])
      ]);
      A.criterios.forEach(function (c) {
        var grupo = el("div", { class: "notas", role: "group", "aria-label": n + " · " + c.nome });
        for (var v = 1; v <= 5; v++) {
          (function (v) {
            var b = el("button", {
              type: "button", "aria-pressed": "false", text: String(v),
              "aria-label": CAMP.fmt(A.notaRotulo, { c: c.nome, v: v }),
              onclick: function () {
                var o = notas[n] || (notas[n] = {});
                if (Number(o[c.id]) === v) delete o[c.id]; else o[c.id] = v;
                CAMP.gravarNotas(notas); checarArmazem(); pintarOpcao(n);
              }
            });
            refs.botoes[n][c.id + "-" + v] = b;
            grupo.appendChild(b);
          })(v);
        }
        corpo.appendChild(el("div", { class: "criterio" }, [
          el("div", {}, [el("strong", { text: c.nome }), el("div", { class: "pergunta", text: c.pergunta })]),
          grupo
        ]));
      });
      cartoes.appendChild(corpo);
    });
    main.appendChild(cartoes);

    function pintarOpcao(n) {
      var o = notas[n] || {};
      A.criterios.forEach(function (c) {
        var v = Number(o[c.id]);
        for (var k = 1; k <= 5; k++) refs.botoes[n][c.id + "-" + k].setAttribute("aria-pressed", v === k ? "true" : "false");
        refs.resumo[n][c.id].textContent = v >= 1 && v <= 5 ? String(v) : A.semNota;
      });
      var tem = CAMP.temNota(notas, n), t = CAMP.totalNotas(notas, n);
      refs.tot[n].textContent = tem ? String(t) : A.semNota;
      refs.tot["_c" + n].textContent = tem ? CAMP.fmt(A.totalDe, { t: t }) : "";
    }
    function pintarTudo() { ops.forEach(function (d) { pintarOpcao(d.numero); }); }
    pintarTudo();
    checarArmazem();

    /* ao chegar por atalho (#op-NN), garante a rolagem até o cartão */
    if (location.hash) {
      var alvo = document.getElementById(location.hash.slice(1));
      if (alvo) alvo.scrollIntoView();
    }
  });
})();

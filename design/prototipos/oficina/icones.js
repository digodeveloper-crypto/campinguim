/* Campinguim · protótipo 3 · Oficina · ícones desenhados para a direção (direcoes.md, seção 3).
   Geométricos, como pictograma de manual de equipamento: grade de 24, traço de 2 px, pontas e cantos retos.
   Estado ativo: o ícone ganha um fundo de etiqueta (retângulo de 6 px de canto) em --separei ou --carro,
   com o ícone em --superficie (isso é CSS, em estilo.css: .of-marca[aria-pressed="true"]).
   Ícones de base comuns às cinco, redesenhados no traço da Oficina: "separei" = caixa marcada;
   "está no carro" = carro de perfil; "preciso comprar" = sacola; "atenção" = triângulo com exclamação;
   "faltou" = caixa vazia com sinal de menos; "ciente" = marca de visto.
   Publica window.CAMPINGUIM_ICONES: nomes, svg(nome) e aplicar(elemento). Preenche sozinho todo
   elemento com data-icone="nome" (agora e quando a tela muda). Nenhum texto aqui: os nomes
   falados dos ícones estão em textos.js ("oficina.icone.<nome>"). */
(function () {
  "use strict";

  var desenhos = {
    /* Estados */
    "a_separar": '<rect x="4" y="4" width="16" height="16"/>',
    "separei": '<rect x="4" y="4" width="16" height="16"/><path d="M7.5 12.5l3 3 6-7"/>',
    "carro": '<path d="M5 17H2v-5l3.5-1L9 6.5h7l3.5 4.5H22v6h-3"/><path d="M9.5 17h5"/><path d="M8.5 11h11"/><path d="M13 6.5V11"/><rect x="5" y="15" width="4.5" height="4.5"/><rect x="14.5" y="15" width="4.5" height="4.5"/>',
    "comprar": '<path d="M4 8h16l-1.5 13h-13z"/><path d="M8.5 11V3.5h7V11"/>',
    "atencao": '<path d="M12 3L22 20.5H2z"/><path d="M12 9.5v5.5"/><path d="M12 17v1.5"/>',
    "faltou": '<rect x="4" y="4" width="16" height="16"/><path d="M8 12h8"/>',
    "sobrou": '<rect x="4" y="4" width="16" height="16"/><path d="M12 8v8"/><path d="M8 12h8"/>',
    "ciente": '<path d="M3.5 12.5l5.5 5.5 11.5-12"/>',
    "conferido": '<path d="M2.5 5.5h12l7 6.5-7 6.5h-12z"/><path d="M6 12l2.5 2.5 4.5-5"/>',
    "secar": '<path d="M2 5h20"/><path d="M5 5v9h5V5"/><path d="M14 5v12h5V5"/>',
    "informacao": '<rect x="3.5" y="3.5" width="17" height="17"/><path d="M12 10.5v6.5"/><path d="M12 7v1.5"/>',
    "depende": '<rect x="3.5" y="3.5" width="17" height="17"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6"/><path d="M12 16.5V18"/>',
    "pago": '<rect x="3.5" y="3.5" width="17" height="17"/><path d="M7.5 12.5l3 3 6-7"/>',
    "a_pagar": '<rect x="3.5" y="3.5" width="17" height="17"/><path d="M8 12h8"/>',

    /* Áreas (divisórias) */
    "lista": '<rect x="4.5" y="4" width="15" height="17"/><path d="M9 4V2h6v2"/><path d="M8 10H16"/><path d="M8 14H16"/><path d="M8 18H13"/>',
    "camping": '<path d="M2 20.5h20"/><path d="M12 3.5L3.5 20.5"/><path d="M12 3.5l8.5 17"/><path d="M12 13.5l-3 7"/><path d="M12 13.5l3 7"/>',
    "grupo": '<rect x="5" y="4" width="6" height="6"/><path d="M2 20v-5l2-2h8l2 2v5"/><path d="M15 4h4v6h-4"/><path d="M16 13h4l2 2v5h-5"/>',
    "gastos": '<path d="M5 2.5h14V21l-2.5-1.5L14 21l-2-1.5-2 1.5-2.5-1.5L5 21z"/><path d="M8.5 7.5h7"/><path d="M8.5 11.5h7"/><path d="M8.5 15.5h4"/>',
    "volta": '<path d="M2.5 11L12 3.5l9.5 7.5"/><path d="M5 9v11.5h14V9"/><path d="M10 20.5v-6h4v6"/>',

    /* Ações */
    "voltar": '<path d="M20 12H5"/><path d="M11 5.5L4.5 12l6.5 6.5"/>',
    "seguir": '<path d="M9 5l7 7-7 7"/>',
    "trocar_lado": '<path d="M3 8h16"/><path d="M15 4l4 4-4 4"/><path d="M21 16H5"/><path d="M9 12l-4 4 4 4"/>',
    "mais": '<path d="M12 5v14"/><path d="M5 12h14"/>',
    "menos": '<path d="M5 12h14"/>',
    "copiar": '<rect x="8.5" y="8.5" width="12" height="12"/><path d="M15.5 8.5v-5h-12v12h5"/>',
    "compartilhar": '<path d="M12 3v12"/><path d="M7 8l5-5 5 5"/><path d="M5 12v9h14v-9"/>',
    "fechar": '<path d="M6 6l12 12"/><path d="M18 6L6 18"/>',
    "entrou": '<path d="M2.5 12h11"/><path d="M10 8l4 4-4 4"/><path d="M14 3.5h6.5v17H14"/>',
    "saiu": '<path d="M10 12h11.5"/><path d="M18 8l4 4-4 4"/><path d="M10 3.5H3.5v17H10"/>',
    "tarefa": '<rect x="3.5" y="4.5" width="17" height="15"/><path d="M7 10l2 2 3.5-3.5"/><path d="M14.5 10.5h3"/><path d="M7 15.5h10.5"/>',
    "lembrar": '<path d="M6 17v-6a6 6 0 0 1 12 0v6l2 2H4z"/><path d="M10 21.5h4"/>',
    "nota": '<path d="M4 20l1-5L16 4l4 4L9 19z"/><path d="M13.5 6.5l4 4"/>',
    "remover": '<path d="M3.5 6.5h17"/><path d="M9 6.5V3.5h6v3"/><path d="M6 6.5l1 14.5h10l1-14.5"/><path d="M10 11v6"/><path d="M14 11v6"/>',
    "pessoa": '<rect x="9" y="3" width="6" height="6"/><path d="M4.5 21v-6l2.5-2.5h10l2.5 2.5v6"/>',
    "confirmacoes": '<path d="M4 3.5h16v13H13l-4 4v-4H4z"/><path d="M8 10l2.5 2.5L16 7"/>'
  };

  var ABRE = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" stroke-miterlimit="10">';

  function svg(nome) {
    return desenhos[nome] ? ABRE + desenhos[nome] + "</svg>" : null;
  }

  function preencher(el) {
    var nome = el.getAttribute("data-icone");
    if (el.getAttribute("data-icone-feito") === nome) return;
    var s = svg(nome);
    if (!s) {
      if (window.console && console.error) console.error("[oficina] ícone inexistente:", nome);
      return;
    }
    el.innerHTML = s;
    el.setAttribute("data-icone-feito", nome);
    if (!el.hasAttribute("aria-hidden")) el.setAttribute("aria-hidden", "true");
  }

  function aplicar(raiz) {
    raiz = raiz || document;
    if (raiz.nodeType === 1 && raiz.hasAttribute("data-icone")) preencher(raiz);
    var lista = raiz.querySelectorAll ? raiz.querySelectorAll("[data-icone]") : [];
    for (var i = 0; i < lista.length; i++) preencher(lista[i]);
  }

  window.CAMPINGUIM_ICONES = {
    nomes: Object.keys(desenhos),
    svg: svg,
    aplicar: aplicar
  };

  aplicar(document);

  if (window.MutationObserver) {
    new MutationObserver(function (mudancas) {
      for (var i = 0; i < mudancas.length; i++) {
        var m = mudancas[i];
        if (m.type === "attributes") {
          m.target.removeAttribute("data-icone-feito");
          preencher(m.target);
        } else {
          for (var j = 0; j < m.addedNodes.length; j++) {
            if (m.addedNodes[j].nodeType === 1) aplicar(m.addedNodes[j]);
          }
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-icone"] });
  }
})();

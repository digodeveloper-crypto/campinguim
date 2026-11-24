/* Campinguim · protótipo 2 · Clareira · ícones e ornamentos desenhados para a direção.
   Grade de 24, traço de 1,75 px, pontas retas, cantos levemente arredondados (direcoes.md, seção 2).
   Os ícones de estado se apoiam numa linha de chão curta (y = 21). Ativos: as partes "p" ganham
   preenchimento na cor do estado e os detalhes "c" passam para a cor da superfície (estilo.css).
   Nenhum texto aqui. O SVG entra pelo analisador de HTML, sem escrever o endereço do espaço de nomes.
   Uso: <span data-icone="carro"></span> no HTML; CAMPINGUIM_ICONES.criar("carro") no código da tela. */
(function () {
  "use strict";

  var CHAO = '<path class="chao" d="M3 21h18"/>';

  var DESENHOS = {
    /* Estados (DSG-10): ícone de base comum às cinco, no traço da Clareira. */
    separei: '<rect class="p" x="5" y="3.5" width="14" height="14" rx="2"/><path class="c" d="M8.5 10.6l2.4 2.4 4.6-4.9"/>' + CHAO,
    carro: '<path class="p" d="M2.5 16v-3.4c0-.6.4-1.1 1-1.3l2.7-.8L8.4 7c.3-.4.8-.7 1.3-.7h5c.5 0 .9.2 1.2.6l2.9 3.6 1.8.5c.6.2 1 .7 1 1.3V16h-2.1a2.3 2.3 0 0 0-4.6 0H9.5a2.3 2.3 0 0 0-4.6 0z"/>' +
      '<circle cx="7.2" cy="16.4" r="1.6"/><circle cx="17.2" cy="16.4" r="1.6"/><path class="c" d="M9.8 10.4l1.1-2.2h3.4l1.8 2.2z"/>' + CHAO,
    comprar: '<path class="p" d="M5.5 8h13l-1.1 10.5H6.6z"/><path d="M9 11V6.8a3 3 0 0 1 6 0V11"/>' + CHAO,
    atencao: '<path class="p" d="M12 3.5l8.6 15H3.4z"/><path class="c" d="M12 8.8v4.6M12 15.2v1.4"/>' + CHAO,
    faltou: '<rect class="p" x="5" y="3.5" width="14" height="14" rx="2"/><path class="c" d="M8.5 10.5h7"/>' + CHAO,
    sobrou: '<rect class="p" x="5" y="3.5" width="14" height="14" rx="2"/><path class="c" d="M8.5 10.5h7M12 7v7"/>' + CHAO,
    ciente: '<path d="M4.5 12.2l4.6 4.6L19.5 6.2"/>' + CHAO,
    conferido: '<circle class="p" cx="12" cy="10.8" r="7.3"/><path class="c" d="M8.8 11l2.2 2.2 4.3-4.6"/>' + CHAO,
    nao_conferido: '<circle cx="12" cy="10.8" r="7.3" stroke-dasharray="2.6 2.4"/>' + CHAO,
    secar: '<path d="M4.5 21V5.5M19.5 21V5.5M4.5 7.5h15"/><path class="p" d="M7.2 7.5v6.3h3.6V7.5M13.2 7.5l-.6 7.8h4l-.6-7.8"/>' + '<path class="chao" d="M2.5 21h19"/>',
    depende: '<circle cx="12" cy="12" r="8.5"/><path d="M9.5 9.7a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7M12 16.1v1.5"/>',
    informacao: '<circle cx="12" cy="12" r="8.5"/><path d="M12 10.8v6M12 7.3v1.5"/>',

    /* Áreas (abas). */
    lista: '<path d="M9.5 6.5H20M9.5 12H20M9.5 17.5H20"/><path d="M4 5.2h2.6v2.6H4zM4 10.7h2.6v2.6H4zM4 16.2h2.6v2.6H4z"/>',
    camping: '<path d="M3.5 20L12 5.5 20.5 20M12 5.5L10.4 3M12 5.5L13.6 3M9.3 20l2.7-5.2 2.7 5.2"/><path d="M2 20h20"/>',
    grupo: '<circle cx="8.8" cy="8.2" r="3"/><path d="M3 19.5c0-3.4 2.6-6 5.8-6s5.8 2.6 5.8 6"/><circle cx="16.6" cy="9.2" r="2.5"/><path d="M15.3 14c.4-.1.9-.2 1.3-.2 2.6 0 4.6 2.2 4.6 5.7"/>',
    gastos: '<path d="M6 3.5h12v17l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/>',

    /* Apoio. */
    casa: '<path d="M3.5 11.2L12 4l8.5 7.2M6 9.3V20h12V9.3M10 20v-5.3h4V20"/>',
    volta: '<path d="M9 9.5h6.5a4.5 4.5 0 0 1 0 9H8"/><path d="M12 6.2L8.7 9.5l3.3 3.3"/>',
    voltar: '<path d="M14.5 5.5L8 12l6.5 6.5"/>',
    avancar: '<path d="M9.5 5.5L16 12l-6.5 6.5"/>',
    abrir: '<path d="M5.5 9.5L12 16l6.5-6.5"/>',
    menos: '<path d="M5 12h14"/>',
    mais: '<path d="M5 12h14M12 5v14"/>',
    fechar: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    copiar: '<rect x="8.5" y="8.5" width="11" height="12" rx="1.5"/><path d="M15.5 8.5V5A1.5 1.5 0 0 0 14 3.5H6A1.5 1.5 0 0 0 4.5 5v9A1.5 1.5 0 0 0 6 15.5h2.5"/>',
    compartilhar: '<circle cx="17.5" cy="5.5" r="2.4"/><circle cx="6.5" cy="12" r="2.4"/><circle cx="17.5" cy="18.5" r="2.4"/><path d="M8.6 10.8l6.8-4M8.6 13.2l6.8 4"/>',
    lembrar: '<path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 1.5H5z"/><path d="M10 20.5h4"/>',
    olho: '<path d="M2.5 12s3.5-6.3 9.5-6.3 9.5 6.3 9.5 6.3-3.5 6.3-9.5 6.3S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
    nota: '<path d="M14.5 5.5l4 4L9 19H5v-4z"/><path d="M12.5 7.5l4 4"/>',
    remover: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5"/>',
    pessoa: '<circle cx="12" cy="8" r="3.4"/><path d="M5.5 20c0-3.9 2.9-6.8 6.5-6.8s6.5 2.9 6.5 6.8"/>'
  };

  /* Ornamento: linha de copas, desenhada à mão, uma só cor (superficie sobre fundo).
     O trecho plano do meio (x de 120 a 280, y = 32) é a clareira onde o mascote fica em pé. */
  var COPAS = '<svg class="cl-copas-svg" viewBox="0 0 400 80" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
    '<path d="M0 80V34c4-9 11-14 18-10 3-10 13-16 22-10 5-11 17-13 24-4 6-8 16-8 21 1 6-6 15-4 18 4 5-4 12-1 14 6l3 11h160l3-10c3-8 10-10 15-6 4-9 13-11 19-4 6-10 17-11 23-2 8-9 20-7 24 3 7-6 16-3 18 5 7-4 14 1 18 9V80z"/></svg>';

  var ORDEM_ESTADOS = ["separei", "carro", "comprar", "atencao", "faltou", "sobrou", "ciente", "conferido", "nao_conferido", "secar", "depende", "informacao"];
  var ORDEM_APOIO = ["lista", "camping", "grupo", "gastos", "casa", "volta", "voltar", "avancar", "abrir", "menos", "mais", "fechar", "copiar", "compartilhar", "lembrar", "olho", "nota", "remover", "pessoa"];

  function svg(nome) {
    var d = DESENHOS[nome];
    if (!d) {
      if (window.console) console.error("[clareira] ícone inexistente:", nome);
      return "";
    }
    return '<svg class="cl-icone-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" ' +
      'stroke-width="1.75" stroke-linecap="butt" stroke-linejoin="round">' + d + "</svg>";
  }

  function preencher(el) {
    var nome = el.getAttribute("data-icone");
    if (el.getAttribute("data-icone-feito") === nome) return;
    el.classList.add("cl-icone");
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = svg(nome);
    el.setAttribute("data-icone-feito", nome);
  }

  function criar(nome, classe) {
    var el = document.createElement("span");
    el.setAttribute("data-icone", nome);
    if (classe) el.className = classe;
    preencher(el);
    return el;
  }

  function aplicar(raiz) {
    raiz = raiz || document;
    if (raiz.nodeType === 1 && raiz.hasAttribute("data-icone")) preencher(raiz);
    var lista = raiz.querySelectorAll ? raiz.querySelectorAll("[data-icone]") : [];
    for (var i = 0; i < lista.length; i++) preencher(lista[i]);
    var copas = raiz.querySelectorAll ? raiz.querySelectorAll("[data-copas]") : [];
    for (var j = 0; j < copas.length; j++) {
      if (!copas[j].firstChild) copas[j].innerHTML = COPAS;
      copas[j].setAttribute("aria-hidden", "true");
    }
  }

  window.CAMPINGUIM_ICONES = {
    nomes: Object.keys(DESENHOS),
    estados: ORDEM_ESTADOS,
    apoio: ORDEM_APOIO,
    svg: svg,
    criar: criar,
    aplicar: aplicar
  };

  aplicar(document);

  if (window.MutationObserver) {
    new MutationObserver(function (mudancas) {
      for (var i = 0; i < mudancas.length; i++) {
        var m = mudancas[i];
        if (m.type === "attributes") {
          if (m.target.nodeType === 1) preencher(m.target);
        } else {
          for (var j = 0; j < m.addedNodes.length; j++) if (m.addedNodes[j].nodeType === 1) aplicar(m.addedNodes[j]);
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-icone"] });
  }
})();

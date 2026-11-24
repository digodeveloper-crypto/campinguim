/* Campinguim · protótipo 4 · Rumo · opções de cor.
   Lê ?paleta=<nome> e põe data-paleta na raiz; as cores de cada paleta ficam em estilo.css (seção 1b).
   Sem parâmetro (ou com um nome desconhecido), vale a Eucalipto, a paleta escolhida pelo responsável
   em 24/11/2026 (DSG-05). A paleta anterior continua em ?paleta=original, só para comparar.
   A paleta passa de tela em tela pelo próprio endereço: antes de seguir uma ligação para outra tela
   desta pasta, o parâmetro é acrescentado a ela. Nada é guardado no navegador.
   Carregado no <head>, antes de estilo.css aplicar, para a página já nascer com a paleta. */
(function () {
  "use strict";

  var NOMES = ["original", "geleira", "pitanga", "eucalipto", "jabuticaba"];
  var PADRAO = "eucalipto";

  var pedida = null;
  try {
    pedida = new URLSearchParams(window.location.search).get("paleta");
  } catch (e) { /* sem URLSearchParams: segue o padrão */ }
  var atual = NOMES.indexOf(pedida) >= 0 ? pedida : PADRAO;
  if (atual !== "original") document.documentElement.setAttribute("data-paleta", atual);

  /* Endereço de uma tela desta pasta com a paleta atual (só "arquivo.html", com ou sem ?/#).
     Na paleta padrão o endereço não muda: sem parâmetro, a próxima tela já abre nela. */
  var MESMA_PASTA = /^[\w.\-]+\.html(?:[?#].*)?$/;

  function endereco(href) {
    if (atual === PADRAO || !href || !MESMA_PASTA.test(href)) return href;
    try {
      var cerca = href.indexOf("#");
      var marca = cerca >= 0 ? href.slice(cerca) : "";
      var semMarca = cerca >= 0 ? href.slice(0, cerca) : href;
      var interroga = semMarca.indexOf("?");
      var arquivo = interroga >= 0 ? semMarca.slice(0, interroga) : semMarca;
      var busca = new URLSearchParams(interroga >= 0 ? semMarca.slice(interroga + 1) : "");
      busca.set("paleta", atual);
      return arquivo + "?" + busca.toString() + marca;
    } catch (e) {
      return href;
    }
  }

  /* Na hora do toque, do clique (inclusive o do meio), do menu ou do foco pelo teclado. */
  function levar(ev) {
    if (atual === PADRAO) return;
    var a = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null;
    if (!a) return;
    var href = a.getAttribute("href");
    var novo = endereco(href);
    if (novo !== href) a.setAttribute("href", novo);
  }
  ["pointerdown", "click", "auxclick", "contextmenu", "focusin"].forEach(function (tipo) {
    document.addEventListener(tipo, levar, true);
  });

  window.RUMO_PALETA = {
    nomes: NOMES.slice(),
    padrao: PADRAO,
    atual: atual,
    endereco: endereco
  };
})();

/* Campinguim · protótipo Brasa (fogueira e noite) · ícones e comportamento comum das folhas.
   Ícones desenhados para esta direção (direcoes.md, Brasa): traço de 2 px, pontas e cantos arredondados,
   grade de 24. Preenchidos só quando o estado está ativo: as partes .br-i-cheio ganham a cor do estado
   e as partes .br-i-vazado passam a ser desenhadas na cor da superfície, por cima do preenchimento.
   Nenhum ícone de chama: o fogo está no halo, não no desenho. Nenhuma biblioteca, nenhum ícone de terceiros.
   Os SVG entram na página pelo analisador de HTML (sem escrever o endereço do espaço de nomes).

   Este arquivo também publica window.BRASA, o comportamento comum das telas da direção (o modelo
   "folhas que sobem"): ícones nos elementos com data-icone, seletor das 4 áreas, folha empilhada
   (foco preso, anúncio, fechar e arrastar para baixo), estados guardados durante o teste.
   Nenhum texto visível aqui: tudo vem de textos.js e de ../_compartilhado/textos.js. */
(function () {
  "use strict";

  /* Cada ícone: o miolo do SVG em grade de 24 (traço em currentColor). */
  var D = {
    /* Estados (DSG-10): ideia comum às cinco, traço da Brasa. */
    separei: '<rect class="br-i-cheio" x="3.5" y="3.5" width="17" height="17" rx="4.5"/><path class="br-i-vazado" d="M8 12.4l2.9 2.9 5.4-5.8"/>',
    carro: '<path class="br-i-cheio" d="M3 16.5h1.2a2.3 2.3 0 0 1 4.6 0h6.4a2.3 2.3 0 0 1 4.6 0H21a.5.5 0 0 0 .5-.5v-3.2a1.6 1.6 0 0 0-1.1-1.5l-2-.7-2.1-3.1a2 2 0 0 0-1.7-.9H9.7a2 2 0 0 0-1.6.8L5.7 10.6l-2 .8a1.6 1.6 0 0 0-1.2 1.5V16a.5.5 0 0 0 .5.5Z"/><path class="br-i-vazado" d="M6.2 10.6h12"/><circle cx="6.5" cy="16.6" r="1.8"/><circle cx="17.5" cy="16.6" r="1.8"/>',
    comprar: '<path class="br-i-cheio" d="M5 8.5h14l-1 11.3a1.6 1.6 0 0 1-1.6 1.4H7.6A1.6 1.6 0 0 1 6 19.8Z"/><path d="M9 10.5V7.2a3 3 0 0 1 6 0v3.3"/>',
    atencao: '<path class="br-i-cheio" d="M10.7 4.3a1.5 1.5 0 0 1 2.6 0l8 14a1.5 1.5 0 0 1-1.3 2.2H4a1.5 1.5 0 0 1-1.3-2.2Z"/><path class="br-i-vazado" d="M12 9.5v4.2M12 17v.1"/>',
    faltou: '<rect class="br-i-cheio" x="3.5" y="3.5" width="17" height="17" rx="4.5"/><path class="br-i-vazado" d="M8 12h8"/>',
    sobrou: '<rect class="br-i-cheio" x="3.5" y="3.5" width="17" height="17" rx="4.5"/><path class="br-i-vazado" d="M8 12h8M12 8v8"/>',
    ciente: '<path d="M4.5 12.8l4.6 4.6L19.5 7"/>',
    conferido: '<circle class="br-i-cheio" cx="12" cy="12" r="8.5"/><path class="br-i-vazado" d="M8.2 12.3l2.6 2.6 5-5.2"/>',
    secar: '<path class="br-i-cheio" d="M12 3.5c3.3 4 5.6 7.3 5.6 10.2a5.6 5.6 0 0 1-11.2 0C6.4 10.8 8.7 7.5 12 3.5Z"/>',
    duvida: '<circle class="br-i-cheio" cx="12" cy="12" r="8.5"/><path class="br-i-vazado" d="M9.6 9.6a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.4M12 16.6v.1"/>',
    informacao: '<circle class="br-i-cheio" cx="12" cy="12" r="8.5"/><path class="br-i-vazado" d="M12 11v5M12 7.9v.1"/>',
    entrou: '<circle class="br-i-cheio" cx="12" cy="12" r="8.5"/><path class="br-i-vazado" d="M12 8v8M8 12h8"/>',
    saiu: '<circle class="br-i-cheio" cx="12" cy="12" r="8.5"/><path class="br-i-vazado" d="M8 12h8"/>',
    tarefa: '<rect class="br-i-cheio" x="5" y="4.5" width="14" height="16.5" rx="3"/><path class="br-i-vazado" d="M9 3.5h6v3H9zM8.8 12.3l2.2 2.2 4.2-4.4"/>',
    /* Áreas (seletor dentro da folha). Gastos é um recibo: nenhuma moeda desenhada (DSG-11). */
    lista: '<path d="M9.5 6.5h10M9.5 12h10M9.5 17.5h10"/><path class="br-i-cheio" d="M4.5 5.2h1.6v1.6H4.5zM4.5 10.7h1.6v1.6H4.5zM4.5 16.2h1.6v1.6H4.5z"/>',
    camping: '<path class="br-i-cheio" d="M12 4.5 3.6 19.5h16.8Z"/><path class="br-i-vazado" d="M9.7 19.5 12 14.8l2.3 4.7"/><path d="M2.5 19.5h19"/>',
    grupo: '<circle class="br-i-cheio" cx="9" cy="8" r="3.2"/><path class="br-i-cheio" d="M3.5 19.5c0-3.4 2.5-6 5.5-6s5.5 2.6 5.5 6Z"/><circle cx="16.8" cy="9.2" r="2.5"/><path d="M15.6 13.7c2.8.3 4.9 2.6 4.9 5.8"/>',
    gastos: '<path class="br-i-cheio" d="M6 3.5h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3Z"/><path class="br-i-vazado" d="M9 8.5h6M9 12h6M9 15.5h3.5"/>',
    casa: '<path class="br-i-cheio" d="M4 10.8 12 4l8 6.8V20H4Z"/><path class="br-i-vazado" d="M10 20v-5.2h4V20"/>',
    /* Ações. */
    fechar: '<path d="M6 9.5l6 6 6-6"/>',
    abrir: '<path d="M9 5.5l6.5 6.5L9 18.5"/>',
    recolher: '<path d="M6 9.5l6 6 6-6"/>',
    mais: '<path d="M12 5.5v13M5.5 12h13"/>',
    menos: '<path d="M5.5 12h13"/>',
    copiar: '<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2.5"/><path d="M15.5 5.5V5a1.5 1.5 0 0 0-1.5-1.5H5A1.5 1.5 0 0 0 3.5 5v9A1.5 1.5 0 0 0 5 15.5h.5"/>',
    compartilhar: '<path d="M12 14.5V3.5M8 7.5l4-4 4 4M5.5 11.5v7.5a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5v-7.5"/>',
    remover: '<path d="M4.5 7h15M10 3.5h4M6.5 7l.9 12.2a1.5 1.5 0 0 0 1.5 1.3h6.2a1.5 1.5 0 0 0 1.5-1.3L17.5 7M10 11v6M14 11v6"/>',
    lembrar: '<path class="br-i-cheio" d="M6.5 16.5v-5.2a5.5 5.5 0 0 1 11 0v5.2l1.5 2h-14Z"/><path d="M10 20.8a2.1 2.1 0 0 0 4 0"/>',
    ver: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle class="br-i-cheio" cx="12" cy="12" r="2.8"/>',
    pessoa: '<circle class="br-i-cheio" cx="12" cy="8" r="3.5"/><path class="br-i-cheio" d="M5 20.5c0-3.9 3.1-7 7-7s7 3.1 7 7Z"/>',
    chave: '<circle class="br-i-cheio" cx="8" cy="12" r="4"/><path d="M12 12h8.5M17.5 12v3M20.5 12v2.5"/>',
    relogio: '<circle class="br-i-cheio" cx="12" cy="12" r="8.5"/><path class="br-i-vazado" d="M12 7.5V12l3 2"/>',
    escrever: '<path class="br-i-cheio" d="M4.5 19.5l.7-3.6L15.6 5.5a2 2 0 0 1 2.9 2.9L8.1 18.8Z"/><path d="M13.8 7.3l2.9 2.9"/>',
    enviar: '<path class="br-i-cheio" d="M4 11.5 20 4l-5.5 16-3-6.5Z"/><path class="br-i-vazado" d="M11.5 13.5 20 4"/>',
    tomada: '<rect class="br-i-cheio" x="4.5" y="4.5" width="15" height="15" rx="4"/><path class="br-i-vazado" d="M9.5 9v2.5M14.5 9v2.5M9.5 15h5"/>',
    estrada: '<path d="M3.5 20.5 9.5 3.5M20.5 20.5 14.5 3.5M12 5v2.5M12 10.5v3M12 16.5v4"/>'
  };

  var ESTADOS = ["separei", "carro", "comprar", "atencao", "faltou", "sobrou", "ciente", "conferido", "secar", "duvida"];
  var AREAS = ["lista", "camping", "grupo", "gastos"];

  function svg(nome, classe) {
    var miolo = D[nome];
    if (!miolo) {
      if (window.console) console.error("[brasa] ícone inexistente:", nome);
      return "";
    }
    return '<svg class="br-i' + (classe ? " " + classe : "") + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false" ' +
      'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-icone-nome="' + nome + '">' +
      miolo + "</svg>";
  }

  window.BRASA_ICONES = { nomes: Object.keys(D), estados: ESTADOS, areas: AREAS, svg: svg };

  /* ---------- Comportamento comum (chamado pelo código de cada tela, depois de base.js) ---------- */

  var doc = document;

  function C() { return window.CAMPINGUIM; }

  /* Põe o desenho em todo elemento com data-icone (agora e sempre que a página mudar). */
  function aplicarIcones(raiz) {
    raiz = raiz || doc;
    var lista = [];
    if (raiz.nodeType === 1 && raiz.hasAttribute("data-icone")) lista.push(raiz);
    if (raiz.querySelectorAll) lista = lista.concat(Array.prototype.slice.call(raiz.querySelectorAll("[data-icone]")));
    lista.forEach(function (el) {
      var nome = el.getAttribute("data-icone");
      if (el.getAttribute("data-icone-feito") === nome) return;
      el.innerHTML = svg(nome);
      el.setAttribute("data-icone-feito", nome);
      el.setAttribute("aria-hidden", "true");
      el.classList.add("br-icone");
    });
  }

  /* Cria um elemento com atributos (o texto entra sempre por data-texto, preenchido por base.js). */
  function el(tag, classe, atributos, filhos) {
    var e = doc.createElement(tag);
    if (classe) e.className = classe;
    if (atributos) Object.keys(atributos).forEach(function (k) {
      if (atributos[k] === null || atributos[k] === undefined || atributos[k] === false) return;
      if (k === "texto") e.textContent = atributos[k];
      else if (k === "valores") e.setAttribute("data-valores", JSON.stringify(atributos[k]));
      else e.setAttribute(k, atributos[k] === true ? "" : atributos[k]);
    });
    (filhos || []).forEach(function (f) { if (f) e.appendChild(f); });
    return e;
  }

  function icone(nome, classe) {
    return el("span", "br-icone" + (classe ? " " + classe : ""), { "data-icone": nome, "aria-hidden": "true" });
  }

  /* Endereço da tela com os parâmetros do avaliador que estão no endereço atual (tema, fonte, moldura, avaliador). */
  var LEVAR = ["tema", "fonte", "moldura", "avaliador"];
  function comParametros(href) {
    if (!href || /^[a-z]+:/i.test(href) || href.charAt(0) === "#") return href;
    var partes = href.split("#");
    var base = partes[0];
    var ancora = partes.length > 1 ? "#" + partes.slice(1).join("#") : "";
    var atual, destino;
    try {
      atual = new URLSearchParams(window.location.search);
      var q = base.indexOf("?");
      destino = new URLSearchParams(q >= 0 ? base.slice(q + 1) : "");
      base = q >= 0 ? base.slice(0, q) : base;
    } catch (e) {
      return href;
    }
    LEVAR.forEach(function (k) {
      if (atual.has(k) && !destino.has(k)) destino.set(k, atual.get(k));
    });
    var s = destino.toString();
    return base + (s ? "?" + s : "") + ancora;
  }

  function levarParametros() {
    doc.addEventListener("click", function (ev) {
      var a = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null;
      if (!a || a.closest(".cg-avaliador")) return;
      var href = a.getAttribute("href");
      if (!/\.html(\?|#|$)/.test(href) || /^[a-z]+:/i.test(href) || href.indexOf("../") === 0) return;
      a.setAttribute("href", comParametros(href));
    }, true);
  }

  /* Seletor das 4 áreas, em linha, dentro da folha (não é barra de abas fixa). */
  var DESTINO_AREA = { lista: "04-lista.html", camping: "03-alertas.html", grupo: "11-grupo.html", gastos: "12-gastos.html" };

  function montarSeletor(nav) {
    var atual = nav.getAttribute("data-seletor");
    var destinos = {};
    Object.keys(DESTINO_AREA).forEach(function (k) { destinos[k] = DESTINO_AREA[k]; });
    var camping = nav.getAttribute("data-seletor-camping");
    if (camping) destinos.camping = camping;
    nav.classList.add("br-seletor");
    nav.setAttribute("data-texto-aria", "brasa.seletor_rotulo");
    var lista = el("ul", "br-seletor-lista");
    AREAS.forEach(function (area) {
      var a = el("a", "br-seletor-area", { href: destinos[area] });
      if (area === atual) {
        a.setAttribute("aria-current", "page");
        a.classList.add("br-ativo");
      }
      a.appendChild(icone(area));
      a.appendChild(el("span", "br-seletor-nome", { "data-texto": "area." + area }));
      lista.appendChild(el("li", null, null, [a]));
    });
    nav.innerHTML = "";
    nav.appendChild(lista);
  }

  /* Folha empilhada (a de cima): foco preso, anúncio ao abrir, fechar volta à anterior,
     arrastar para baixo pela alça também fecha (nunca é o único caminho: há o botão "fechar"). */
  function prepararFolha(folha) {
    var fechar = folha.querySelector("[data-fechar]");
    var destino = fechar ? fechar.getAttribute("href") : null;
    var titulo = folha.querySelector("h1, h2");
    if (titulo) {
      if (!titulo.id) titulo.id = "br-titulo-folha";
      titulo.setAttribute("tabindex", "-1");
      folha.setAttribute("aria-labelledby", titulo.id);
    }
    folha.setAttribute("role", "dialog");
    function sair() {
      if (destino) window.location.href = comParametros(destino);
    }
    var rolagem = C().elementoRolagem;
    var antes = rolagem ? rolagem.scrollTop : 0;
    var soltar = C().prenderFoco(folha, sair);
    if (rolagem) rolagem.scrollTop = antes;
    /* O foco entra na folha pelo título: o leitor de tela anuncia o diálogo e o nome dele ao abrir. */
    if (titulo) titulo.focus({ preventScroll: true });
    arrastar(folha, sair);
    return soltar;
  }

  function arrastar(folha, aoFechar) {
    var alca = folha.querySelector(".br-alca");
    if (!alca) return;
    var inicio = null;
    var desloc = 0;
    alca.addEventListener("pointerdown", function (ev) {
      if (ev.target.closest("a, button")) return;
      inicio = ev.clientY;
      desloc = 0;
      folha.classList.add("br-arrastando");
      try { alca.setPointerCapture(ev.pointerId); } catch (e) { /* sem captura */ }
    });
    alca.addEventListener("pointermove", function (ev) {
      if (inicio === null) return;
      desloc = Math.max(0, ev.clientY - inicio);
      folha.style.transform = desloc ? "translateY(" + desloc + "px)" : "";
    });
    function fim() {
      if (inicio === null) return;
      inicio = null;
      folha.classList.remove("br-arrastando");
      if (desloc > 96) {
        aoFechar();
      } else {
        folha.style.transform = "";
      }
      desloc = 0;
    }
    alca.addEventListener("pointerup", fim);
    alca.addEventListener("pointercancel", fim);
  }

  /* Folha dentro da mesma tela (por cima da folha da tela): abre, prende o foco, fecha. */
  function abrirFolhaInterna(painel, aoFechar) {
    var fundo = painel.parentNode && painel.parentNode.classList.contains("br-veu") ? painel.parentNode : null;
    if (fundo) fundo.hidden = false;
    painel.hidden = false;
    var soltar;
    function fechar() {
      if (soltar) soltar();
      soltar = null;
      painel.hidden = true;
      if (fundo) fundo.hidden = true;
      if (aoFechar) aoFechar();
    }
    soltar = C().prenderFoco(painel, fechar);
    var titulo = painel.querySelector("h2");
    if (titulo) C().anunciar(C().texto("brasa.folha_aberta", { titulo: titulo.textContent }) || titulo.textContent);
    arrastar(painel, fechar);
    return fechar;
  }

  /* Estados marcados durante o teste (lista, aviso de saída, item). O estado inicial vem sempre de dados.js;
     ?novo=1 apaga o guardado. Sem armazenamento, a tela funciona igual, só não lembra entre telas. */
  var CHAVE_ESTADOS = "brasa.estados";
  var CHAVE_COMPRAR = "brasa.comprar";
  var memoria = { estados: null, comprar: null };

  function estados() {
    if (!memoria.estados) memoria.estados = C().guardado.ler(CHAVE_ESTADOS, {}) || {};
    return memoria.estados;
  }

  function estadoDe(item) {
    var e = estados();
    return Object.prototype.hasOwnProperty.call(e, item.id) ? e[item.id] : item.estado;
  }

  function definirEstado(id, valor) {
    var e = estados();
    var original = C().item(id);
    if (original && original.estado === valor) delete e[id];
    else e[id] = valor;
    C().guardado.gravar(CHAVE_ESTADOS, e);
  }

  function comprar() {
    if (!memoria.comprar) memoria.comprar = C().guardado.ler(CHAVE_COMPRAR, {}) || {};
    return memoria.comprar;
  }

  function definirComprar(id, valor) {
    var c = comprar();
    if (valor) c[id] = true;
    else delete c[id];
    C().guardado.gravar(CHAVE_COMPRAR, c);
  }

  /* O rodapé da folha (ação principal e seletor) fica preso ao pé da tela; a folha reserva a altura dele
     para que o fim do conteúdo nunca fique escondido. */
  function reservarRodape() {
    var rodape = doc.querySelector(".br-folha > .br-rodape");
    if (!rodape) return;
    var folha = rodape.parentNode;
    function medir() { folha.style.setProperty("--br-rodape-altura", (rodape.hidden ? 0 : rodape.offsetHeight) + "px"); }
    medir();
    if (window.ResizeObserver) new ResizeObserver(medir).observe(rodape);
    if (window.MutationObserver) new MutationObserver(medir).observe(rodape, { attributes: true, attributeFilter: ["hidden"] });
  }

  function iniciar() {
    aplicarIcones(doc);
    if (window.MutationObserver) {
      new MutationObserver(function (m) {
        for (var i = 0; i < m.length; i++) {
          if (m[i].type === "attributes") {
            if (m[i].target.nodeType === 1) {
              m[i].target.removeAttribute("data-icone-feito");
              aplicarIcones(m[i].target);
            }
            continue;
          }
          for (var j = 0; j < m[i].addedNodes.length; j++) {
            if (m[i].addedNodes[j].nodeType === 1) aplicarIcones(m[i].addedNodes[j]);
          }
        }
      }).observe(doc.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-icone"] });
    }
    Array.prototype.forEach.call(doc.querySelectorAll("[data-seletor]"), montarSeletor);
    reservarRodape();
    var folha = doc.querySelector(".br-folha--empilhada");
    if (folha) prepararFolha(folha);
    levarParametros();
  }

  /* Botões repetidos numa lista ("eu levo", "ciente", "desfazer"): o leitor de tela ouve a ação e o
     item ("eu levo: Isqueiro"), pela chave brasa.acao_item. Acompanha a troca de texto do botão. */
  function nomearPor(botao, item) {
    function chaveVisivel() {
      if (botao.hasAttribute("data-texto")) return botao.getAttribute("data-texto");
      var filho = botao.querySelector("[data-texto]");
      return filho ? filho.getAttribute("data-texto") : null;
    }
    function nomear() {
      var chave = chaveVisivel();
      if (!chave || !window.CAMPINGUIM) return;
      botao.setAttribute("data-valores", JSON.stringify({ acao: window.CAMPINGUIM.texto(chave), item: item }));
      botao.setAttribute("data-texto-aria", "brasa.acao_item");
    }
    nomear();
    if (window.MutationObserver) {
      new MutationObserver(nomear).observe(botao, { subtree: true, attributes: true, attributeFilter: ["data-texto"] });
    }
    return botao;
  }

  window.BRASA = {
    svg: svg,
    nomearPor: nomearPor,
    icone: icone,
    el: el,
    aplicarIcones: aplicarIcones,
    iniciar: iniciar,
    abrirFolhaInterna: abrirFolhaInterna,
    estados: estados,
    estadoDe: estadoDe,
    definirEstado: definirEstado,
    comprar: comprar,
    definirComprar: definirComprar,
    comParametros: comParametros
  };
})();

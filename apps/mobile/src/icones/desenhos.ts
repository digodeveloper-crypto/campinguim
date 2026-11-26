// Os 30 ícones do Rumo, desenhados para o protótipo (DESIGN.md, seção 6). Copiados sem mudança de
// design/prototipos/rumo/icones.js (objetos ICONES e ORDEM); um teste confere a cópia. Nenhum ícone de terceiros.
// Classes dentro do desenho: sem classe = traço; f = cheio; r = recorte (traço na cor do fundo do símbolo);
// rf = recorte cheio; roda = roda vazada; roda-cheia = roda cheia com anel de recorte; tracejado.
export type Desenho = { base: string; ativo?: string };

export const ICONES = {
  separei: {
    base: '<rect x="4.75" y="4.75" width="14.5" height="14.5"/>',
    ativo: '<rect class="f" x="4" y="4" width="16" height="16"/><path class="r" d="M7.75 12.25l3 3 5.5-6"/>'
  },
  carro: {
    base: '<path d="M2.75 16.75V12.25l3.1-5h8.4l3.75 4.25 3.25.75v4.5z"/><path d="M6.5 11.5h10.75"/>' +
      '<circle class="roda" cx="7.25" cy="16.75" r="2.25"/><circle class="roda" cx="16.75" cy="16.75" r="2.25"/>',
    ativo: '<path class="f" d="M2 17.5V12l3.45-5.5h9.1l3.9 4.4L22 11.7v5.8z"/><path class="r" d="M6.5 11.25h10.75"/>' +
      '<circle class="roda-cheia" cx="7.25" cy="17" r="2.5"/><circle class="roda-cheia" cx="16.75" cy="17" r="2.5"/>'
  },
  comprar: {
    base: '<path d="M5.75 8.75h12.5l-1 11.5H6.75z"/><path d="M9.25 8.75V7.5a2.75 2.75 0 0 1 5.5 0v1.25"/>',
    ativo: '<path class="f" d="M5 8h14l-1.1 13H6.1z"/><path d="M9.25 8V7.5a2.75 2.75 0 0 1 5.5 0V8"/><path class="r" d="M9 12.5h6"/>'
  },
  atencao: {
    base: '<path d="M12 3.75l9 15.5H3z"/><path d="M12 9.25v5"/><path d="M12 15.75v1.75"/>',
    ativo: '<path class="f" d="M12 2.75l10 17.25H2z"/><path class="r" d="M12 9.25v5"/><path class="r" d="M12 15.75v1.75"/>'
  },
  faltou: {
    base: '<rect x="4.75" y="4.75" width="14.5" height="14.5"/><path d="M8.5 12h7"/>',
    ativo: '<rect class="f" x="4" y="4" width="16" height="16"/><path class="r" d="M8.5 12h7"/>'
  },
  conferido: {
    base: '<path d="M12 3.25L20.75 12 12 20.75 3.25 12z"/>',
    ativo: '<path class="f" d="M12 2.25L21.75 12 12 21.75 2.25 12z"/><path class="r" d="M8.4 12.1l2.5 2.5 4.7-4.9"/>'
  },
  secar: {
    base: '<path d="M4.75 20.25V10.5L12 4.25l7.25 6.25v9.75z"/><path d="M12 10.75c-1.7 2.3-2.5 3.6-2.5 4.6a2.5 2.5 0 0 0 5 0c0-1-.8-2.3-2.5-4.6z"/>',
    ativo: '<path class="f" d="M4 21V10.2L12 3.25l8 6.95V21z"/><path class="rf" d="M12 10.75c-1.7 2.3-2.5 3.6-2.5 4.6a2.5 2.5 0 0 0 5 0c0-1-.8-2.3-2.5-4.6z"/>'
  },
  ciente: { base: '<path d="M4.25 12.75l4.75 4.75L19.75 6.5"/>' },
  info: { base: '<rect x="4.75" y="4.75" width="14.5" height="14.5"/><path d="M12 10.75v5.5"/><path d="M12 7.5v1.75"/>' },
  entrou: { base: '<path d="M12 3.75v10.5"/><path d="M8 10.25l4 4 4-4"/><path d="M4.75 14.25v6h14.5v-6"/>' },
  saiu: { base: '<path d="M12 14.25V4"/><path d="M8 8l4-4 4 4"/><path d="M4.75 14.25v6h14.5v-6"/>' },
  tarefa: { base: '<path d="M8.75 4.75h6.5v2.5h-6.5z"/><path d="M8.75 6H5.75v14.25h12.5V6h-3"/><path d="M8.75 12h6.5"/><path d="M8.75 15.75h6.5"/>' },
  regra: { base: '<path d="M4.75 4.75h14.5v8.5H4.75z"/><path d="M12 13.25v7"/><path d="M8.5 20.25h7"/><path d="M8 9h8"/>' },
  preparar: { base: '<path d="M9.25 6.75h10"/><path d="M9.25 12h10"/><path d="M9.25 17.25h10"/><path d="M4.75 6h1.5v1.5h-1.5z"/><path d="M4.75 11.25h1.5v1.5h-1.5z"/><path d="M4.75 16.5h1.5V18h-1.5z"/>' },
  barraca: { base: '<path d="M9.75 2.75L12 6l2.25-3.25"/><path d="M12 6L3.5 19.25"/><path d="M12 6l8.5 13.25"/><path d="M1.75 19.25h20.5"/><path d="M12 12.25l-2.5 7"/><path d="M12 12.25l2.5 7"/>' },
  volta: { base: '<path d="M19.25 8.25H9.5a5 5 0 0 0 0 10h3.25"/><path d="M15.5 4.5l3.75 3.75-3.75 3.75"/>' },
  casa: { base: '<path d="M4.75 20.25V10.5L12 4.25l7.25 6.25v9.75z"/><path d="M10 20.25v-5.5h4v5.5"/>' },
  grupo: { base: '<circle cx="9" cy="8" r="2.75"/><path d="M3.75 19.25V18a5.25 5.25 0 0 1 10.5 0v1.25"/><circle cx="16.75" cy="9.25" r="2.25"/><path d="M16 13.6a4.5 4.5 0 0 1 4.25 4.4v1.25"/>' },
  gastos: { base: '<path d="M5.75 3.75h12.5v16.5l-2.1-1.4-2.1 1.4-2.05-1.4-2.05 1.4-2.1-1.4-2.1 1.4z"/><path d="M8.75 8.25h6.5"/><path d="M8.75 11.75h6.5"/><path d="M8.75 15.25h3.5"/>' },
  legenda: { base: '<path d="M3.75 4.75h16.5v14.5H3.75z"/><path d="M6.75 8.25h2v2h-2z"/><path d="M11 9.25h6.25"/><path d="M6.75 14.25h2.25"/><path d="M11 14.25h6.25"/>' },
  pessoa: { base: '<circle cx="12" cy="8" r="3.25"/><path d="M5.75 19.75v-1.5a6.25 6.25 0 0 1 12.5 0v1.5"/>' },
  sem_dono: { base: '<circle class="tracejado" cx="12" cy="8" r="3.25"/><path class="tracejado" d="M5.75 19.75v-1.5a6.25 6.25 0 0 1 12.5 0v1.5"/>' },
  voltar: { base: '<path d="M19.25 12H5.5"/><path d="M11 6.25L5.25 12 11 17.75"/>' },
  direita: { base: '<path d="M9.25 6.5L14.75 12l-5.5 5.5"/>' },
  baixo: { base: '<path d="M6.5 9.25L12 14.75l5.5-5.5"/>' },
  mais: { base: '<path d="M12 5.5v13"/><path d="M5.5 12h13"/>' },
  menos: { base: '<path d="M5.5 12h13"/>' },
  copiar: { base: '<path d="M8.75 8.75h10.5v10.5H8.75z"/><path d="M15.25 8.75v-4H4.75v10.5h4"/>' },
  compartilhar: { base: '<path d="M12 14.5V3.75"/><path d="M8 7.75l4-4 4 4"/><path d="M5.75 11v9.25h12.5V11"/>' },
  fechar: { base: '<path d="M6.25 6.25l11.5 11.5"/><path d="M17.75 6.25l-11.5 11.5"/>' }
} satisfies Record<string, Desenho>;

/* Ordem mostrada na página de identidade (os de estado primeiro, com repouso e ativo). */
export const ORDEM = ["separei", "carro", "comprar", "atencao", "faltou", "conferido", "secar", "ciente", "info", "entrou", "saiu",
  "tarefa", "regra", "preparar", "barraca", "volta", "casa", "grupo", "gastos", "legenda", "pessoa", "sem_dono",
  "voltar", "direita", "baixo", "mais", "menos", "copiar", "compartilhar", "fechar"] as const;

export type NomeIcone = keyof typeof ICONES;

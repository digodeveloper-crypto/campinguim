// Lê de um arquivo TrueType a largura de avanço de cada caractere (tabelas head, hhea, cmap formato 4 e
// hmtx). Arquivo puro, sem importação: `gerar.mjs` (Node, com remoção de tipos) grava `metricas.json` com
// isto, e o teste do tema confere que o JSON está em dia com as fontes embutidas.

export type MetricasDaFonte = {
  unidadesPorEm: number;
  /** Avanço de cada caractere, em unidades da fonte. */
  larguras: Record<string, number>;
  /** Avanço usado para caractere que não está na lista. */
  padrao: number;
};

/** Caracteres medidos: ASCII visível, Latin-1 e a pontuação dos textos (·, —, –, …, aspas curvas). */
export const CARACTERES = (() => {
  let s = '';
  for (let c = 0x20; c <= 0x7e; c++) s += String.fromCharCode(c);
  for (let c = 0xa0; c <= 0xff; c++) s += String.fromCharCode(c);
  return s + '·—–…‘’“”•';
})();

export function lerMetricas(bytes: Uint8Array, caracteres: string = CARACTERES): MetricasDaFonte {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tabelas = new Map<string, number>();
  const n = dv.getUint16(4);
  for (let i = 0; i < n; i++) {
    const r = 12 + i * 16;
    const tag = String.fromCharCode(dv.getUint8(r), dv.getUint8(r + 1), dv.getUint8(r + 2), dv.getUint8(r + 3));
    tabelas.set(tag, dv.getUint32(r + 8));
  }
  const tabela = (tag: string): number => {
    const t = tabelas.get(tag);
    if (t === undefined) throw new Error(`fonte sem a tabela ${tag}`);
    return t;
  };
  const unidadesPorEm = dv.getUint16(tabela('head') + 18);
  const metricasH = dv.getUint16(tabela('hhea') + 34);
  const hmtx = tabela('hmtx');
  const avanco = (glifo: number) => dv.getUint16(hmtx + 4 * Math.min(glifo, metricasH - 1));

  // cmap: a subtabela Windows Unicode BMP (plataforma 3, codificação 1), formato 4.
  const cmap = tabela('cmap');
  let sub = -1;
  for (let i = 0; i < dv.getUint16(cmap + 2); i++) {
    const r = cmap + 4 + i * 8;
    if (dv.getUint16(r) === 3 && dv.getUint16(r + 2) === 1) sub = cmap + dv.getUint32(r + 4);
  }
  if (sub < 0 || dv.getUint16(sub) !== 4) throw new Error('fonte sem cmap 3/1 formato 4');
  const segmentos = dv.getUint16(sub + 6) / 2;
  const fins = sub + 14;
  const inicios = fins + segmentos * 2 + 2;
  const deltas = inicios + segmentos * 2;
  const deslocamentos = deltas + segmentos * 2;
  const glifoDe = (codigo: number): number => {
    for (let s = 0; s < segmentos; s++) {
      const fim = dv.getUint16(fins + s * 2);
      if (codigo > fim) continue;
      const inicio = dv.getUint16(inicios + s * 2);
      if (codigo < inicio) return 0;
      const delta = dv.getInt16(deltas + s * 2);
      const desl = dv.getUint16(deslocamentos + s * 2);
      if (desl === 0) return (codigo + delta) & 0xffff;
      const g = dv.getUint16(deslocamentos + s * 2 + desl + (codigo - inicio) * 2);
      return g === 0 ? 0 : (g + delta) & 0xffff;
    }
    return 0;
  };

  const larguras: Record<string, number> = {};
  for (const c of caracteres) {
    const g = glifoDe(c.codePointAt(0) ?? 0);
    if (g !== 0) larguras[c] = avanco(g);
  }
  const m = larguras.M ?? unidadesPorEm;
  return { unidadesPorEm, larguras, padrao: m };
}

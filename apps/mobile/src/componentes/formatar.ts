// Preenche os marcadores {nome} de um texto do arquivo de textos. Arquivo puro.
export function formatar(modelo: string, valores: Record<string, string | number>): string {
  return modelo.replace(/\{(\w+)\}/g, (marca, chave: string) => {
    const v = valores[chave];
    if (v === undefined) throw new Error(`texto sem o valor {${chave}}: ${modelo}`);
    return String(v);
  });
}

/** Gesto de deslizar entre paradas (DESIGN.md 7.1): ≥ 70 na horizontal, < 45 na vertical, em até 700 ms. */
export function direcaoDoGesto(dx: number, dy: number, ms: number): -1 | 0 | 1 {
  if (Math.abs(dx) < 70 || Math.abs(dy) >= 45 || ms > 700) return 0;
  return dx < 0 ? 1 : -1;
}

/** Pontos do octógono de canto cortado (selo e apoio do mascote; DESIGN.md 5). */
export function cantoCortado(largura: number, altura: number, chanfro: number, recuo = 0): string {
  const c = Math.max(0, Math.min(chanfro, largura / 2, altura / 2));
  const x0 = recuo;
  const y0 = recuo;
  const x1 = largura - recuo;
  const y1 = altura - recuo;
  const pontos = [
    [x0 + c, y0], [x1 - c, y0], [x1, y0 + c], [x1, y1 - c],
    [x1 - c, y1], [x0 + c, y1], [x0, y1 - c], [x0, y0 + c],
  ];
  return pontos.map(([x, y]) => `${String(x)},${String(y)}`).join(' ');
}

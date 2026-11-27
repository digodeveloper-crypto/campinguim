// Gerador das curvas de nível, igual à função `curvas` de design/prototipos/rumo/icones.js:
// anéis irregulares e concêntricos, curva fechada por Catmull-Rom convertida em Bézier cúbica. Arquivo puro.

export type OpcoesCurvas = {
  w: number;
  h: number;
  cx: number;
  cy: number;
  aneis: number;
  r0: number;
  passo: number;
  sx: number;
  sy: number;
  fase: number;
};

const PADRAO: OpcoesCurvas = { w: 360, h: 260, cx: 260, cy: 70, aneis: 8, r0: 14, passo: 19, sx: 1.55, sy: 1, fase: 0 };

function n1(v: number): string {
  return (Math.round(v * 10) / 10).toString();
}

function caminhoFechado(p: [number, number][]): string {
  const n = p.length;
  const ponto = (i: number): [number, number] => p[((i % n) + n) % n] ?? [0, 0];
  const [x0, y0] = ponto(0);
  let d = `M${n1(x0)} ${n1(y0)}`;
  for (let i = 0; i < n; i++) {
    const p0 = ponto(i - 1);
    const p1 = ponto(i);
    const p2 = ponto(i + 1);
    const p3 = ponto(i + 2);
    d +=
      `C${n1(p1[0] + (p2[0] - p0[0]) / 6)} ${n1(p1[1] + (p2[1] - p0[1]) / 6)} ` +
      `${n1(p2[0] - (p3[0] - p1[0]) / 6)} ${n1(p2[1] - (p3[1] - p1[1]) / 6)} ${n1(p2[0])} ${n1(p2[1])}`;
  }
  return `${d}Z`;
}

export function caminhosDasCurvas(o?: Partial<OpcoesCurvas>): { largura: number; altura: number; caminhos: string[] } {
  const c = { ...PADRAO, ...o };
  const caminhos: string[] = [];
  for (let k = 0; k < c.aneis; k++) {
    const r = c.r0 + k * c.passo;
    const pts: [number, number][] = [];
    for (let i = 0; i < 40; i++) {
      const t = (i / 40) * Math.PI * 2;
      const a =
        1 +
        0.11 * Math.sin(2 * t + 0.7 + k * 0.22 + c.fase) +
        0.06 * Math.sin(3 * t + 1.9 - k * 0.17 + c.fase * 2) +
        0.035 * Math.sin(5 * t + 0.3 + k * 0.41);
      pts.push([c.cx + Math.cos(t) * r * a * c.sx, c.cy + Math.sin(t) * r * a * c.sy]);
    }
    caminhos.push(caminhoFechado(pts));
  }
  return { largura: c.w, altura: c.h, caminhos };
}

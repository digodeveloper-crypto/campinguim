// Resumo irreversível do código do convite (`invite_token_hash`, SPEC, seção 12).
//
// SHA-256 do código, em texto UTF-8, escrito em 64 letras hexadecimais minúsculas. Sem sal, de
// propósito: o servidor (B5) calcula o mesmo resumo do código que ele guarda, e é essa igualdade que
// diz de qual convite veio a instalação (DAT-04). O código do convite é sorteado e longo, então o
// resumo não se desfaz por tentativa. Implementação própria, sem dependência: o Hermes (motor do
// app) não traz o `crypto` do Node e a regra precisa rodar igual no app, no servidor e nos testes.

const PRIMOS = (() => {
  const lista: number[] = [];
  for (let n = 2; lista.length < 64; n += 1) {
    if (lista.every((p) => n % p !== 0)) lista.push(n);
  }
  return lista;
})();

/** Os 32 primeiros bits da parte fracionária de `x`. */
function fracao32(x: number): number {
  return Math.floor((x - Math.floor(x)) * 2 ** 32) >>> 0;
}

// Constantes da especificação (FIPS 180-4): raízes quadradas e cúbicas dos primeiros primos.
const H_INICIAL = PRIMOS.slice(0, 8).map((p) => fracao32(Math.sqrt(p)));
const K = PRIMOS.map((p) => fracao32(Math.cbrt(p)));

/** Bytes do texto em UTF-8, com pares substitutos tratados como um único caractere. */
function paraUtf8(texto: string): number[] {
  const bytes: number[] = [];
  for (const caractere of texto) {
    let ponto = caractere.codePointAt(0) ?? 0;
    // Metade de par substituto sozinha não é texto válido: vira U+FFFD, como no TextEncoder.
    if (ponto >= 0xd800 && ponto <= 0xdfff) ponto = 0xfffd;
    if (ponto < 0x80) bytes.push(ponto);
    else if (ponto < 0x800) bytes.push(0xc0 | (ponto >> 6), 0x80 | (ponto & 0x3f));
    else if (ponto < 0x10000) bytes.push(0xe0 | (ponto >> 12), 0x80 | ((ponto >> 6) & 0x3f), 0x80 | (ponto & 0x3f));
    else bytes.push(0xf0 | (ponto >> 18), 0x80 | ((ponto >> 12) & 0x3f), 0x80 | ((ponto >> 6) & 0x3f), 0x80 | (ponto & 0x3f));
  }
  return bytes;
}

const girar = (x: number, n: number): number => (x >>> n) | (x << (32 - n));

/** SHA-256 do texto (UTF-8), em hexadecimal minúsculo. */
export function sha256Hex(texto: string): string {
  const bytes = paraUtf8(texto);
  const bits = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  // Tamanho da mensagem em bits, 64 bits big-endian (o limite prático aqui é bem menor que 2^53).
  const alto = Math.floor(bits / 2 ** 32);
  const baixo = bits >>> 0;
  for (const palavra of [alto, baixo]) {
    bytes.push((palavra >>> 24) & 0xff, (palavra >>> 16) & 0xff, (palavra >>> 8) & 0xff, palavra & 0xff);
  }

  const h = [...H_INICIAL];
  const w = new Array<number>(64).fill(0);
  for (let bloco = 0; bloco < bytes.length; bloco += 64) {
    for (let i = 0; i < 16; i += 1) {
      const p = bloco + i * 4;
      w[i] = (((bytes[p] ?? 0) << 24) | ((bytes[p + 1] ?? 0) << 16) | ((bytes[p + 2] ?? 0) << 8) | (bytes[p + 3] ?? 0)) >>> 0;
    }
    for (let i = 16; i < 64; i += 1) {
      const w15 = w[i - 15] ?? 0;
      const w2 = w[i - 2] ?? 0;
      const s0 = girar(w15, 7) ^ girar(w15, 18) ^ (w15 >>> 3);
      const s1 = girar(w2, 17) ^ girar(w2, 19) ^ (w2 >>> 10);
      w[i] = ((w[i - 16] ?? 0) + s0 + (w[i - 7] ?? 0) + s1) >>> 0;
    }
    let [a = 0, b = 0, c = 0, d = 0, e = 0, f = 0, g = 0, hh = 0] = h;
    for (let i = 0; i < 64; i += 1) {
      const S1 = girar(e, 6) ^ girar(e, 11) ^ girar(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + S1 + ch + (K[i] ?? 0) + (w[i] ?? 0)) >>> 0;
      const S0 = girar(a, 2) ^ girar(a, 13) ^ girar(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      hh = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }
    [a, b, c, d, e, f, g, hh].forEach((v, i) => {
      h[i] = ((h[i] ?? 0) + v) >>> 0;
    });
  }
  return h.map((v) => v.toString(16).padStart(8, '0')).join('');
}

/**
 * Resumo do código do convite para o evento `install_attributed`. O código vazio é erro: sem
 * convite, o evento simplesmente não leva `invite_token_hash`.
 */
export function resumoDoConvite(codigoDoConvite: string): string {
  if (codigoDoConvite.length === 0) throw new RangeError('o código do convite não pode ser vazio');
  return sha256Hex(codigoDoConvite);
}

import { randomBytes } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { BYTES_DA_CHAVE, bytesParaHex, chaveParaSqlcipher, NOME_DA_CHAVE_NO_COFRE, obterChaveDoBanco } from '../chaveDoBanco';
import type { Cofre } from '../cofre';

function cofreEmMemoria(inicial: Record<string, string> = {}): Cofre & { valores: Map<string, string>; gravacoes: number } {
  const valores = new Map(Object.entries(inicial));
  const cofre = {
    valores,
    gravacoes: 0,
    ler: async (nome: string) => valores.get(nome) ?? null,
    guardar: async (nome: string, valor: string) => {
      cofre.gravacoes += 1;
      valores.set(nome, valor);
    },
    apagar: async (nome: string) => {
      valores.delete(nome);
    },
  };
  return cofre;
}

const gerador = (n: number) => new Uint8Array(randomBytes(n));

describe('chave do banco local (DEF-11)', () => {
  it('cria 32 bytes aleatórios no primeiro uso e guarda só no cofre', async () => {
    const cofre = cofreEmMemoria();
    const chave = await obterChaveDoBanco(cofre, gerador);
    expect(chave.nova).toBe(true);
    expect(chave.hex).toMatch(new RegExp(`^[0-9a-f]{${BYTES_DA_CHAVE * 2}}$`));
    expect(cofre.valores.get(NOME_DA_CHAVE_NO_COFRE)).toBe(chave.hex);
  });

  it('usa a mesma chave nas aberturas seguintes, sem gravar de novo', async () => {
    const cofre = cofreEmMemoria();
    const primeira = await obterChaveDoBanco(cofre, gerador);
    const segunda = await obterChaveDoBanco(cofre, () => {
      throw new Error('não devia gerar outra');
    });
    expect(segunda).toEqual({ hex: primeira.hex, nova: false });
    expect(cofre.gravacoes).toBe(1);
  });

  it('chaves de duas instalações são diferentes', async () => {
    const a = await obterChaveDoBanco(cofreEmMemoria(), gerador);
    const b = await obterChaveDoBanco(cofreEmMemoria(), gerador);
    expect(a.hex).not.toBe(b.hex);
  });

  it('valor ilegível ou fora do formato no cofre conta como ausente', async () => {
    for (const ruim of ['', 'abc', 'G'.repeat(64), 'A'.repeat(64), 'a'.repeat(63)]) {
      const cofre = cofreEmMemoria({ [NOME_DA_CHAVE_NO_COFRE]: ruim });
      const chave = await obterChaveDoBanco(cofre, gerador);
      expect(chave.nova).toBe(true);
      expect(cofre.valores.get(NOME_DA_CHAVE_NO_COFRE)).toBe(chave.hex);
    }
  });

  it('erro do cofre é repassado e nenhuma chave nova é criada', async () => {
    let gerou = false;
    const cofre: Cofre = {
      ler: async () => {
        throw new Error('Keystore indisponível');
      },
      guardar: async () => undefined,
      apagar: async () => undefined,
    };
    await expect(
      obterChaveDoBanco(cofre, (n) => {
        gerou = true;
        return gerador(n);
      }),
    ).rejects.toThrow('Keystore indisponível');
    expect(gerou).toBe(false);
  });

  it('recusa gerador com tamanho errado ou chave nula', async () => {
    await expect(obterChaveDoBanco(cofreEmMemoria(), () => new Uint8Array(16))).rejects.toThrow('tamanho errado');
    await expect(obterChaveDoBanco(cofreEmMemoria(), (n) => new Uint8Array(n))).rejects.toThrow('chave nula');
  });

  it('falha se o cofre não guardar a chave (o banco ficaria ilegível no próximo início)', async () => {
    const cofre: Cofre = { ler: async () => null, guardar: async () => undefined, apagar: async () => undefined };
    await expect(obterChaveDoBanco(cofre, gerador)).rejects.toThrow('não guardou');
  });

  it('entrega ao SQLCipher como chave bruta e nunca põe a chave em mensagem de erro', () => {
    const hex = bytesParaHex(Uint8Array.from({ length: 32 }, (_, i) => i));
    expect(hex).toBe('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');
    expect(chaveParaSqlcipher(hex)).toBe(`x'${hex}'`);
    const quase = `${hex.slice(0, 63)}z`;
    expect(() => chaveParaSqlcipher(quase)).toThrow('formato inválido');
    try {
      chaveParaSqlcipher(quase);
    } catch (e) {
      expect(String(e)).not.toContain(quase);
    }
  });
});

// F0-5 · Lado do app, conferido sem emulador:
// 1. só a interface de verificação importa a biblioteca do Expo (SPEC, seção 2);
// 2. o resumo do pedido calculado no app é igual ao do servidor (senão nenhuma prova bate).
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

import * as servidor from '../supabase/functions/_verificacao/resumo.ts';
import * as app from '../../app/src/verificacao/resumo.ts';
import { RAIZ_PROVA } from '../scripts/comum.mjs';

const APP = path.join(RAIZ_PROVA, 'app');
const IGNORAR = new Set(['node_modules', 'android', 'ios', '.expo', 'dist', 'build']);
const BIBLIOTECA = '@expo/app-integrity';

function codigoDoApp(dir = APP, saida = []) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORAR.has(item.name)) continue;
    const caminho = path.join(dir, item.name);
    if (item.isDirectory()) codigoDoApp(caminho, saida);
    else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(item.name)) saida.push(caminho);
  }
  return saida;
}

const relativo = (f) => path.relative(APP, f).replaceAll('\\', '/');

test(`só src/verificacao/expo.ts importa ${BIBLIOTECA}`, () => {
  const achados = codigoDoApp()
    .filter((f) => fs.readFileSync(f, 'utf8').includes(BIBLIOTECA))
    .map(relativo);
  assert.deepEqual(achados, ['src/verificacao/expo.ts']);
});

test('fora da pasta da interface, ninguém carrega a implementação da biblioteca', () => {
  const achados = codigoDoApp()
    .filter((f) => !relativo(f).startsWith('src/verificacao/'))
    .filter((f) => /verificacao\/(expo|desenvolvimento)['"]/.test(fs.readFileSync(f, 'utf8')))
    .map(relativo);
  assert.deepEqual(achados, []);
});

test('o resumo do pedido do app é igual ao do servidor e ao SHA-256 do Node', async () => {
  const casos = [
    ['', ''],
    ['abc', 'abc'],
    ['acentos e símbolos', 'Campinguim: barraca, lanterna, isqueiro — ção 🐧'],
    ['bloco de 55 bytes', 'x'.repeat(55)],
    ['bloco de 56 bytes', 'x'.repeat(56)],
    ['bloco de 64 bytes', 'x'.repeat(64)],
    ['texto longo', 'lista '.repeat(500)],
  ];
  for (const [nome, texto] of casos) {
    const esperado = createHash('sha256').update(texto, 'utf8').digest('hex');
    assert.equal(app.sha256Hex(texto), esperado, `app: ${nome}`);
    assert.equal(await servidor.sha256Hex(texto), esperado, `servidor: ${nome}`);
  }
  const dados = { z: 1, a: [3, { y: 'ç', b: null }], m: { k: true } };
  const id = '0f5e0000-0000-4000-8000-000000000001';
  assert.equal(app.canonico(dados), servidor.canonico(dados));
  assert.equal(app.resumoDoPedido('f', id, id, dados), await servidor.resumoDoPedido('f', id, id, dados));
});

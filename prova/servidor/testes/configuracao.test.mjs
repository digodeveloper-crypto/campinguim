// Regras de configuração da prova (CLAUDE.md, seção Segurança; plano, seção G):
// - o domínio do Cloud Run não aparece em lugar nenhum da prova;
// - o endereço do servidor e o do site só aparecem no único arquivo de configuração;
// - o manifesto Android gerado não pede localização nem USE_EXACT_ALARM;
// - nenhum arquivo de credencial local está rastreado pelo git.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

import { RAIZ_PROVA } from '../scripts/comum.mjs';

const CONFIG = path.join(RAIZ_PROVA, 'config', 'enderecos.json');
const IGNORAR = new Set(['node_modules', 'android', 'ios', '.expo', '.temp', '.branches', 'dist', 'build']);
const enderecos = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));

function arquivosDaProva(dir = RAIZ_PROVA, saida = []) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORAR.has(item.name)) continue;
    const caminho = path.join(dir, item.name);
    if (item.isDirectory()) arquivosDaProva(caminho, saida);
    else if (!/\.(png|jpe?g|webp|ttf|otf)$/i.test(item.name) && item.name !== '.env.local') saida.push(caminho);
  }
  return saida;
}

function ondeAparece(trecho) {
  return arquivosDaProva()
    .filter((arquivo) => fs.readFileSync(arquivo, 'utf8').includes(trecho))
    .map((arquivo) => path.relative(RAIZ_PROVA, arquivo).replaceAll('\\', '/'));
}

test('o domínio do Cloud Run não aparece em nenhum arquivo da prova', () => {
  // O trecho é montado aqui para este próprio arquivo não ser achado.
  assert.deepEqual(ondeAparece(['run', 'app'].join('.')), []);
});

test('o endereço do servidor só aparece no arquivo de configuração', () => {
  assert.deepEqual(ondeAparece(enderecos.servidor), ['config/enderecos.json']);
});

test('o endereço do site só aparece no arquivo de configuração', () => {
  assert.deepEqual(ondeAparece(new URL(enderecos.site).host), ['config/enderecos.json']);
});

test('manifesto Android gerado: sem localização e sem USE_EXACT_ALARM; com o link do site', (t) => {
  const manifesto = path.join(RAIZ_PROVA, 'app', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
  if (!fs.existsSync(manifesto)) {
    t.skip('pasta android ainda não gerada (npm run nativo em prova/app)');
    return;
  }
  const xml = fs.readFileSync(manifesto, 'utf8');
  const permissoes = [...xml.matchAll(/<uses-permission[^>]*android:name="([^"]+)"[^>]*\/>/g)]
    .filter((m) => !m[0].includes('tools:node="remove"'))
    .map((m) => m[1]);
  for (const proibida of [
    'android.permission.ACCESS_FINE_LOCATION',
    'android.permission.ACCESS_COARSE_LOCATION',
    'android.permission.ACCESS_BACKGROUND_LOCATION',
    'android.permission.USE_EXACT_ALARM',
  ]) {
    assert.ok(!permissoes.includes(proibida), `manifesto pede ${proibida}`);
  }
  assert.ok(permissoes.includes('android.permission.SCHEDULE_EXACT_ALARM'));
  assert.ok(xml.includes(`android:host="${new URL(enderecos.site).host}"`), 'falta o link do site');
  assert.ok(xml.includes('android:autoVerify="true"'));
  assert.ok(xml.includes('android:scheme="campinguim"'), 'falta o esquema próprio');
});

test('nenhum arquivo de credencial local está rastreado pelo git', () => {
  const rastreados = execFileSync('git', ['ls-files', '--', '.'], { cwd: RAIZ_PROVA, encoding: 'utf8' })
    .split(/\r?\n/)
    .filter(Boolean);
  const suspeitos = rastreados.filter((f) => /(^|\/)\.env(?!\.example$)|\.(jks|keystore|pem|key|p12)$|signing_keys/i.test(f));
  assert.deepEqual(suspeitos, []);
  const ignorado = execFileSync('git', ['check-ignore', '-q', '--no-index', '.env.local'], { cwd: RAIZ_PROVA, encoding: 'utf8', stdio: 'pipe' });
  assert.equal(ignorado, '');
});

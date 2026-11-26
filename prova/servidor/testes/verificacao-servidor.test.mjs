// F0-5 · Verificação do aparelho pelo servidor de verdade: a função `prova-chamada-protegida`
// rodando no Supabase local, chamada por HTTP com a chave pública (o mesmo caminho do app), e o
// banco conferido direto. Os casos com token usam o DUBLÊ DE TESTE local (só existe quando a
// pilha foi subida com ele: scripts/pilha-paralela.mjs). Sem o dublê, esses casos são pulados e
// só ficam os que não precisam de token.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { after, before, describe, test } from 'node:test';

import pg from 'pg';

import { resumoDoPedido, sha256Hex } from '../supabase/functions/_verificacao/resumo.ts';
import { FUNCAO } from '../supabase/functions/_verificacao/servico.ts';
import { lerEnvLocal } from '../scripts/comum.mjs';
import { alterado, tokenDuble, vereditoBom } from './apoio/vereditos.mjs';

const env = lerEnvLocal();
const URL_FUNCAO = `${env.SUPABASE_URL_LOCAL}/functions/v1/prova-chamada-protegida`;
const SEGREDO = env.VERIFICACAO_DUBLE_SEGREDO;
const PACOTE = env.VERIFICACAO_PACOTE;
const CERTIFICADO = (env.VERIFICACAO_CERTIFICADOS_SHA256 ?? '').split(',')[0];
const semDuble = SEGREDO ? false : 'pilha sem o dublê de teste (suba com scripts/pilha-paralela.mjs)';
const PREFIXO = 'f05teste-';

let banco;
const tokensUsados = [];

before(async () => {
  banco = new pg.Client({ connectionString: env.SUPABASE_DB_URL_LOCAL });
  await banco.connect();
});

after(async () => {
  // Limpa só o que estes testes criaram.
  await banco.query(`delete from public.integrity_attempt where install_id like $1`, [`${PREFIXO}%`]);
  await banco.query(`delete from public.device where install_id like $1`, [`${PREFIXO}%`]);
  await banco.query(`delete from public.integrity_token_used where token_sha256 = any($1)`, [tokensUsados]);
  await banco.end();
});

function novoPedido(extra = {}) {
  return { install_id: `${PREFIXO}${randomUUID()}`.slice(0, 64), request_id: randomUUID(), dados: { teste: 'F0-5' }, ...extra };
}

async function chamar(corpo, chave = env.SUPABASE_CHAVE_PUBLICA) {
  if (corpo.prova) tokensUsados.push(await sha256Hex(corpo.prova.token));
  const r = await fetch(URL_FUNCAO, {
    method: 'POST',
    headers: { apikey: chave, 'content-type': 'application/json' },
    body: JSON.stringify(corpo),
  });
  return { status: r.status, corpo: await r.json() };
}

async function ultimoMotivo(installId) {
  const { rows } = await banco.query(
    `select result, reason from public.integrity_attempt where install_id = $1 order by created_at desc limit 1`,
    [installId],
  );
  return rows[0] ? `${rows[0].result}:${rows[0].reason}` : null;
}

async function comToken(corpo, estragar = (v) => v, segredo = SEGREDO) {
  const resumo = await resumoDoPedido(FUNCAO, corpo.install_id, corpo.request_id, corpo.dados);
  const veredito = estragar(vereditoBom({ pacote: PACOTE, resumo, certificado: CERTIFICADO, agoraMs: Date.now() }));
  return { ...corpo, prova: { tipo: 'play_integrity', token: tokenDuble(veredito, segredo) } };
}

function recusado(r) {
  assert.equal(r.status, 403);
  assert.deepEqual(r.corpo, { code: 'integrity_required', message: 'Verificação do aparelho necessária.' });
}

describe('servidor local: chamada sem verificação válida recebe integrity_required', () => {
  test('sem prova', async () => {
    const corpo = novoPedido();
    recusado(await chamar(corpo));
    assert.equal(await ultimoMotivo(corpo.install_id), 'refused:sem_prova');
  });

  test('prova de desenvolvimento com a aceitação desligada (configuração padrão)', async () => {
    const corpo = novoPedido();
    const resumo = await resumoDoPedido(FUNCAO, corpo.install_id, corpo.request_id, corpo.dados);
    recusado(await chamar({ ...corpo, prova: { tipo: 'desenvolvimento', token: `dev-falsa:${resumo}` } }));
    assert.equal(await ultimoMotivo(corpo.install_id), 'refused:prova_desenvolvimento_desligada');
  });

  test('pedido malformado: validation', async () => {
    const r = await chamar({ install_id: 'x' });
    assert.equal(r.status, 400);
    assert.equal(r.corpo.code, 'validation');
  });

  const casos = [
    ['token inválido', async (c) => ({ ...c, prova: { tipo: 'play_integrity', token: 'isto-nao-e-um-token' } }), 'token_invalido'],
    ['assinatura do token errada', (c) => comToken(c, undefined, 'outro-segredo-qualquer-com-mais-de-32-caracteres'), 'assinatura_invalida'],
    ['token vencido', (c) => comToken(c, (v) => alterado(v, 'requestDetails.timestampMillis', String(Date.now() - 3600_000))), 'token_vencido'],
    ['pacote errado', (c) => comToken(c, (v) => alterado(v, 'requestDetails.requestPackageName', 'com.outro.app')), 'pacote_do_pedido_diferente'],
    ['assinatura do app errada (outro certificado)', (c) => comToken(c, (v) => alterado(v, 'appIntegrity.certificateSha256Digest', ['b3V0cm8'])), 'certificado_diferente'],
    ['app UNRECOGNIZED_VERSION', (c) => comToken(c, (v) => alterado(v, 'appIntegrity.appRecognitionVerdict', 'UNRECOGNIZED_VERSION')), 'app_versao_nao_reconhecida'],
    ['licença UNLICENSED', (c) => comToken(c, (v) => alterado(v, 'accountDetails.appLicensingVerdict', 'UNLICENSED')), 'licenca_ausente'],
    ['veredito do aparelho vazio', (c) => comToken(c, (v) => alterado(v, 'deviceIntegrity', {})), 'aparelho_sem_integridade'],
  ];
  for (const [nome, montar, motivo] of casos) {
    test(nome, { skip: semDuble }, async () => {
      const corpo = await montar(novoPedido());
      recusado(await chamar(corpo));
      assert.equal(await ultimoMotivo(corpo.install_id), `refused:${motivo}`);
    });
  }

  test('prova de outro pedido (token de um pedido usado em outro)', { skip: semDuble }, async () => {
    const corpo = await comToken(novoPedido());
    recusado(await chamar({ ...corpo, dados: { teste: 'F0-5', trocado: true } }));
    assert.equal(await ultimoMotivo(corpo.install_id), 'refused:resumo_do_pedido_diferente');
  });

  test('repetição (replay): o mesmo token duas vezes', { skip: semDuble }, async () => {
    const corpo = await comToken(novoPedido());
    const primeira = await chamar(corpo);
    assert.equal(primeira.status, 200, 'a primeira vez passa (DUBLÊ, veredito bom de exemplo)');
    recusado(await chamar(corpo));
    assert.equal(await ultimoMotivo(corpo.install_id), 'refused:token_repetido');
    const { rows } = await banco.query(
      `select count(*)::int as n from public.integrity_token_used where token_sha256 = $1`,
      [await sha256Hex(corpo.prova.token)],
    );
    assert.equal(rows[0].n, 1, 'o banco guarda só o resumo do token');
  });

  test('aparelho verificado com o prazo vencido', { skip: semDuble }, async () => {
    const corpo = await comToken(novoPedido());
    assert.equal((await chamar(corpo)).status, 200);
    // Dentro do prazo, a chamada sem prova passa pela marca do aparelho.
    const dentro = await chamar({ ...novoPedido(), install_id: corpo.install_id });
    assert.equal(dentro.status, 200);
    assert.equal(dentro.corpo.verificado_por, 'marca_do_aparelho');
    // A marca envelhece 25 horas (validade da prova: 24 h).
    await banco.query(`update public.device set integrity_ok_at = now() - interval '25 hours' where install_id = $1`, [corpo.install_id]);
    recusado(await chamar({ ...novoPedido(), install_id: corpo.install_id }));
    assert.equal(await ultimoMotivo(corpo.install_id), 'refused:marca_do_aparelho_vencida');
  });
});

describe('servidor local: o app não chega às tabelas da verificação', () => {
  const TABELAS = ['device', 'integrity_token_used', 'integrity_attempt'];
  // Uma linha válida para cada tabela: a recusa tem de vir da permissão, não do formato.
  const LINHA = {
    device: { install_id: `${PREFIXO}intruso-000000000`, platform: 'android', integrity_ok_at: new Date().toISOString() },
    integrity_token_used: { token_sha256: '0'.repeat(64) },
    integrity_attempt: { install_id: `${PREFIXO}intruso-000000000`, result: 'accepted', reason: 'intruso' },
  };

  test('com a chave pública, a API não lê nem grava nessas tabelas', async () => {
    for (const tabela of TABELAS) {
      const leitura = await fetch(`${env.SUPABASE_URL_LOCAL}/rest/v1/${tabela}?select=*`, {
        headers: { apikey: env.SUPABASE_CHAVE_PUBLICA },
      });
      assert.ok(leitura.status === 401 || leitura.status === 403, `${tabela}: leitura devolveu ${leitura.status}`);
      const escrita = await fetch(`${env.SUPABASE_URL_LOCAL}/rest/v1/${tabela}`, {
        method: 'POST',
        headers: { apikey: env.SUPABASE_CHAVE_PUBLICA, 'content-type': 'application/json' },
        body: JSON.stringify(LINHA[tabela]),
      });
      assert.ok(escrita.status === 401 || escrita.status === 403, `${tabela}: escrita devolveu ${escrita.status}`);
    }
  });

  test('RLS ativo, nenhuma política e nenhuma permissão para anon e authenticated', async () => {
    const { rows } = await banco.query(
      `select c.relname as tabela, c.relrowsecurity as rls,
              (select count(*)::int from pg_policies p where p.schemaname = 'public' and p.tablename = c.relname) as politicas,
              has_table_privilege('anon', c.oid, 'select, insert, update, delete') as anon,
              has_table_privilege('authenticated', c.oid, 'select, insert, update, delete') as autenticado
       from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relname = any($1) order by 1`,
      [TABELAS],
    );
    assert.equal(rows.length, TABELAS.length);
    for (const r of rows) {
      assert.deepEqual(r, { tabela: r.tabela, rls: true, politicas: 0, anon: false, autenticado: false });
    }
  });
});

// F0-5 · Verificação do aparelho: regra da chamada protegida, sem rede e sem banco.
// Roda sem a pilha local (node --test testes/verificacao.test.mjs). O caminho pelo servidor de
// verdade (HTTP, banco, repetição) está em verificacao-servidor.test.mjs.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';

import { lerConfiguracao } from '../supabase/functions/_verificacao/configuracao.ts';
import { DecodificadorGooglePendente, DubleLocalDeTeste } from '../supabase/functions/_verificacao/decodificador.ts';
import { resumoDoPedido, sha256Hex } from '../supabase/functions/_verificacao/resumo.ts';
import { chamadaProtegida, FUNCAO, RESPOSTA_RECUSA } from '../supabase/functions/_verificacao/servico.ts';
import { avaliarVeredito, certificadoParaBase64Url } from '../supabase/functions/_verificacao/veredito.ts';
import { RAIZ_PROVA } from '../scripts/comum.mjs';
import { alterado, casosRuins, tokenDuble, vereditoBom } from './apoio/vereditos.mjs';

const AGORA = Date.UTC(2026, 10, 24, 15, 0, 0);
const PACOTE = 'com.campinguim.prova';
const CERTIFICADO = 'dHN0LWNlcnRpZmljYWRvLWRvLWR1YmxlLWxvY2Fs';
const SEGREDO = 'segredo-de-teste-unitario-com-mais-de-32-caracteres';
const INSTALACAO = '0f5e0000-0000-4000-8000-000000000001';

function ambienteLocal(extra = {}) {
  const env = {
    AMBIENTE: 'local',
    VERIFICACAO_DUBLE_LOCAL: 'sim',
    VERIFICACAO_DUBLE_SEGREDO: SEGREDO,
    VERIFICACAO_PACOTE: PACOTE,
    VERIFICACAO_CERTIFICADOS_SHA256: CERTIFICADO,
    ...extra,
  };
  return lerConfiguracao((k) => env[k]);
}

class RepositorioEmMemoria {
  constructor() {
    this.aparelhos = new Map();
    this.tokens = new Set();
    this.tentativas = [];
  }
  async verificadoEm(id) {
    return this.aparelhos.get(id) ?? null;
  }
  async marcarVerificado(id, quando) {
    this.aparelhos.set(id, quando);
  }
  async registrarTokenUsado(resumo) {
    if (this.tokens.has(resumo)) return false;
    this.tokens.add(resumo);
    return true;
  }
  async registrarTentativa(t) {
    this.tentativas.push(t);
  }
  get ultimoMotivo() {
    return this.tentativas.at(-1)?.motivo;
  }
}

function montar({ config = ambienteLocal(), agora = AGORA } = {}) {
  const repositorio = new RepositorioEmMemoria();
  const decodificador = config.usarDubleLocal ? new DubleLocalDeTeste(config.segredoDuble) : new DecodificadorGooglePendente();
  const chamar = (corpo) => chamadaProtegida(corpo, { config, decodificador, repositorio, agora: () => agora });
  return { repositorio, chamar };
}

let contador = 0;
function pedido(extra = {}) {
  contador += 1;
  return {
    install_id: INSTALACAO,
    request_id: `0f5e0000-0000-4000-9000-${String(contador).padStart(12, '0')}`,
    dados: { teste: 'F0-5', n: contador },
    ...extra,
  };
}

async function comProvaDuble(corpo, montarVeredito = (v) => v, segredo = SEGREDO) {
  const resumo = await resumoDoPedido(FUNCAO, corpo.install_id, corpo.request_id, corpo.dados);
  const veredito = montarVeredito(vereditoBom({ pacote: PACOTE, resumo, certificado: CERTIFICADO, agoraMs: AGORA }));
  return { ...corpo, prova: { tipo: 'play_integrity', token: tokenDuble(veredito, segredo) } };
}

describe('configuração: aceitação de desenvolvimento e dublê só no local', () => {
  test('sem nenhuma variável: produção, tudo desligado (falha fechado)', () => {
    const c = lerConfiguracao(() => undefined);
    assert.equal(c.ambiente, 'producao');
    assert.equal(c.aceitarProvaDesenvolvimento, false);
    assert.equal(c.usarDubleLocal, false);
    assert.equal(c.pacote, null);
    assert.deepEqual(c.certificados, []);
  });

  test('local sem ligar a chave: prova de desenvolvimento recusada (padrão desligado)', () => {
    assert.equal(ambienteLocal().aceitarProvaDesenvolvimento, false);
  });

  test('local com a chave ligada: aceita a prova de desenvolvimento', () => {
    assert.equal(ambienteLocal({ VERIFICACAO_ACEITAR_DESENVOLVIMENTO: 'sim' }).aceitarProvaDesenvolvimento, true);
  });

  test('produção com as chaves ligadas por engano: continua tudo desligado', () => {
    const c = ambienteLocal({ AMBIENTE: 'producao', VERIFICACAO_ACEITAR_DESENVOLVIMENTO: 'sim' });
    assert.equal(c.aceitarProvaDesenvolvimento, false);
    assert.equal(c.usarDubleLocal, false);
    assert.equal(c.segredoDuble, null);
  });

  test('o modelo de configuração de PRODUÇÃO deixa a prova de desenvolvimento e o dublê desligados', () => {
    const arquivo = path.join(RAIZ_PROVA, 'servidor', 'config', 'verificacao-producao.env.example');
    const env = {};
    for (const linha of fs.readFileSync(arquivo, 'utf8').split(/\r?\n/)) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(linha);
      if (m) env[m[1]] = m[2];
    }
    assert.equal(env.AMBIENTE, 'producao');
    assert.ok(!('VERIFICACAO_ACEITAR_DESENVOLVIMENTO' in env), 'produção não declara a chave de desenvolvimento');
    assert.ok(!('VERIFICACAO_DUBLE_LOCAL' in env), 'produção não declara o dublê');
    const c = lerConfiguracao((k) => env[k]);
    assert.equal(c.ambiente, 'producao');
    assert.equal(c.aceitarProvaDesenvolvimento, false);
    assert.equal(c.usarDubleLocal, false);
  });

  test('dublê exige segredo local com pelo menos 32 caracteres', () => {
    assert.equal(ambienteLocal({ VERIFICACAO_DUBLE_SEGREDO: 'curto' }).usarDubleLocal, false);
  });

  test('certificado aceito no formato da Play Console (hexadecimal com dois-pontos)', () => {
    const hex = Array.from({ length: 32 }, (_, i) => i.toString(16).padStart(2, '0').toUpperCase()).join(':');
    const esperado = Buffer.from(hex.replaceAll(':', ''), 'hex').toString('base64url');
    assert.equal(certificadoParaBase64Url(hex), esperado);
  });
});

describe('veredito da Play Integrity (formato oficial)', () => {
  const resumo = 'a'.repeat(64);
  const base = vereditoBom({ pacote: PACOTE, resumo, certificado: CERTIFICADO, agoraMs: AGORA });
  const esperado = {
    pacote: PACOTE,
    resumoDoPedido: resumo,
    certificados: [CERTIFICADO],
    agoraMs: AGORA,
    idadeMaximaMs: 300_000,
    toleranciaFuturoMs: 60_000,
  };

  test('veredito bom de EXEMPLO: aceito (o servidor não recusa tudo)', () => {
    assert.deepEqual(avaliarVeredito(base, esperado), { aceito: true });
  });

  test('MEETS_STRONG_INTEGRITY junto de MEETS_DEVICE_INTEGRITY: aceito', () => {
    const forte = alterado(base, 'deviceIntegrity.deviceRecognitionVerdict', ['MEETS_DEVICE_INTEGRITY', 'MEETS_STRONG_INTEGRITY']);
    assert.deepEqual(avaliarVeredito(forte, esperado), { aceito: true });
  });

  for (const [nome, veredito, motivo] of casosRuins(base, { agoraMs: AGORA })) {
    test(`recusa: ${nome}`, () => {
      assert.deepEqual(avaliarVeredito(veredito, esperado), { aceito: false, motivo });
    });
  }

  test('recusa: nenhum certificado configurado no servidor', () => {
    assert.deepEqual(avaliarVeredito(base, { ...esperado, certificados: [] }), { aceito: false, motivo: 'certificado_diferente' });
  });
});

describe('chamada protegida: casos negativos devolvem integrity_required', () => {
  test('sem prova e aparelho nunca verificado', async () => {
    const { chamar, repositorio } = montar();
    assert.deepEqual(await chamar(pedido()), RESPOSTA_RECUSA);
    assert.equal(repositorio.ultimoMotivo, 'sem_prova');
  });

  test('a recusa não revela o motivo a quem chamou', async () => {
    const { chamar } = montar();
    const r = await chamar(pedido());
    assert.equal(r.status, 403);
    assert.deepEqual(Object.keys(r.corpo).sort(), ['code', 'message']);
    assert.equal(r.corpo.code, 'integrity_required');
  });

  test('pedido malformado: validation (não chega à verificação)', async () => {
    const { chamar, repositorio } = montar();
    for (const ruim of [null, [], {}, pedido({ install_id: 'curto' }), pedido({ prova: { tipo: 'outro', token: 'x' } }), pedido({ prova: { tipo: 'play_integrity', token: '' } })]) {
      const r = await chamar(ruim);
      assert.equal(r.status, 400);
      assert.equal(r.corpo.code, 'validation');
    }
    assert.equal(repositorio.tentativas.length, 0);
  });

  test('token inválido (não é um token)', async () => {
    const { chamar, repositorio } = montar();
    assert.deepEqual(await chamar(pedido({ prova: { tipo: 'play_integrity', token: 'isto-nao-e-um-token' } })), RESPOSTA_RECUSA);
    assert.equal(repositorio.ultimoMotivo, 'token_invalido');
  });

  test('token com assinatura errada (montado com outro segredo)', async () => {
    const { chamar, repositorio } = montar();
    const corpo = await comProvaDuble(pedido(), undefined, 'outro-segredo-qualquer-com-mais-de-32-caracteres');
    assert.deepEqual(await chamar(corpo), RESPOSTA_RECUSA);
    assert.equal(repositorio.ultimoMotivo, 'assinatura_invalida');
  });

  test('token adulterado depois de assinado', async () => {
    const { chamar, repositorio } = montar();
    const corpo = await comProvaDuble(pedido());
    const [prefixo, conteudo, assinatura] = corpo.prova.token.split('.');
    const trocado = Buffer.from(
      Buffer.from(conteudo, 'base64url').toString().replace('MEETS_DEVICE_INTEGRITY', 'MEETS_STRONG_INTEGRITY'),
    ).toString('base64url');
    corpo.prova.token = [prefixo, trocado, assinatura].join('.');
    assert.deepEqual(await chamar(corpo), RESPOSTA_RECUSA);
    assert.equal(repositorio.ultimoMotivo, 'assinatura_invalida');
  });

  test('token vencido', async () => {
    const { chamar, repositorio } = montar();
    const corpo = await comProvaDuble(pedido(), (v) => alterado(v, 'requestDetails.timestampMillis', String(AGORA - 3600_000)));
    assert.deepEqual(await chamar(corpo), RESPOSTA_RECUSA);
    assert.equal(repositorio.ultimoMotivo, 'token_vencido');
  });

  test('pacote errado (pedido e app de outro pacote)', async () => {
    const { chamar, repositorio } = montar();
    const corpo = await comProvaDuble(pedido(), (v) =>
      alterado(alterado(v, 'requestDetails.requestPackageName', 'com.outro.app'), 'appIntegrity.packageName', 'com.outro.app'),
    );
    assert.deepEqual(await chamar(corpo), RESPOSTA_RECUSA);
    assert.equal(repositorio.ultimoMotivo, 'pacote_do_pedido_diferente');
  });

  test('assinatura do app errada (certificado diferente do nosso)', async () => {
    const { chamar, repositorio } = montar();
    const corpo = await comProvaDuble(pedido(), (v) => alterado(v, 'appIntegrity.certificateSha256Digest', ['b3V0cm8']));
    assert.deepEqual(await chamar(corpo), RESPOSTA_RECUSA);
    assert.equal(repositorio.ultimoMotivo, 'certificado_diferente');
  });

  test('prova de outro pedido (mesmo token com outros dados)', async () => {
    const { chamar, repositorio } = montar();
    const corpo = await comProvaDuble(pedido());
    assert.deepEqual(await chamar({ ...corpo, dados: { teste: 'F0-5', trocado: true } }), RESPOSTA_RECUSA);
    assert.equal(repositorio.ultimoMotivo, 'resumo_do_pedido_diferente');
  });

  test('repetição (replay): o mesmo token na segunda vez é recusado', async () => {
    const { chamar, repositorio } = montar();
    const corpo = await comProvaDuble(pedido());
    assert.equal((await chamar(corpo)).status, 200);
    assert.deepEqual(await chamar(corpo), RESPOSTA_RECUSA);
    assert.equal(repositorio.ultimoMotivo, 'token_repetido');
    assert.ok(repositorio.tokens.has(await sha256Hex(corpo.prova.token)), 'guarda o resumo do token, não o token');
  });

  test('cada veredito ruim, pelo caminho inteiro da chamada', async () => {
    for (const [nome, , motivo] of casosRuins(vereditoBom({ pacote: PACOTE, resumo: 'x', certificado: CERTIFICADO, agoraMs: AGORA }), { agoraMs: AGORA })) {
      const { chamar, repositorio } = montar();
      const corpo = pedido();
      const resumo = await resumoDoPedido(FUNCAO, corpo.install_id, corpo.request_id, corpo.dados);
      // Remonta o caso com o resumo certo, para o motivo ser o do caso e não o do resumo.
      const [, veredito] = casosRuins(vereditoBom({ pacote: PACOTE, resumo, certificado: CERTIFICADO, agoraMs: AGORA }), { agoraMs: AGORA }).find(
        ([n]) => n === nome,
      );
      const r = await chamar({ ...corpo, prova: { tipo: 'play_integrity', token: tokenDuble(veredito, SEGREDO) } });
      assert.deepEqual(r, RESPOSTA_RECUSA, nome);
      assert.equal(repositorio.ultimoMotivo, motivo, nome);
    }
  });

  test('prova de desenvolvimento com a aceitação desligada (padrão)', async () => {
    const { chamar, repositorio } = montar();
    const corpo = pedido();
    const resumo = await resumoDoPedido(FUNCAO, corpo.install_id, corpo.request_id, corpo.dados);
    assert.deepEqual(await chamar({ ...corpo, prova: { tipo: 'desenvolvimento', token: `dev-falsa:${resumo}` } }), RESPOSTA_RECUSA);
    assert.equal(repositorio.ultimoMotivo, 'prova_desenvolvimento_desligada');
  });

  test('prova de desenvolvimento ligada, mas de outro pedido', async () => {
    const { chamar, repositorio } = montar({ config: ambienteLocal({ VERIFICACAO_ACEITAR_DESENVOLVIMENTO: 'sim' }) });
    assert.deepEqual(await chamar(pedido({ prova: { tipo: 'desenvolvimento', token: 'dev-falsa:outro' } })), RESPOSTA_RECUSA);
    assert.equal(repositorio.ultimoMotivo, 'prova_desenvolvimento_invalida');
  });

  test('prova de desenvolvimento em produção, mesmo com a chave ligada por engano', async () => {
    const config = ambienteLocal({ AMBIENTE: 'producao', VERIFICACAO_ACEITAR_DESENVOLVIMENTO: 'sim' });
    const { chamar, repositorio } = montar({ config });
    const corpo = pedido();
    const resumo = await resumoDoPedido(FUNCAO, corpo.install_id, corpo.request_id, corpo.dados);
    assert.deepEqual(await chamar({ ...corpo, prova: { tipo: 'desenvolvimento', token: `dev-falsa:${resumo}` } }), RESPOSTA_RECUSA);
    assert.equal(repositorio.ultimoMotivo, 'prova_desenvolvimento_desligada');
  });

  test('produção hoje (sem a conta do Google Play): todo token da Play é recusado', async () => {
    const config = lerConfiguracao((k) => ({ AMBIENTE: 'producao', VERIFICACAO_PACOTE: PACOTE, VERIFICACAO_CERTIFICADOS_SHA256: CERTIFICADO })[k]);
    const { chamar, repositorio } = montar({ config });
    const corpo = await comProvaDuble(pedido());
    assert.deepEqual(await chamar(corpo), RESPOSTA_RECUSA);
    assert.equal(repositorio.ultimoMotivo, 'decodificador_indisponivel');
  });

  test('servidor sem pacote ou certificado configurado: recusa', async () => {
    for (const falta of ['VERIFICACAO_PACOTE', 'VERIFICACAO_CERTIFICADOS_SHA256']) {
      const { chamar, repositorio } = montar({ config: ambienteLocal({ [falta]: '' }) });
      assert.deepEqual(await chamar(await comProvaDuble(pedido())), RESPOSTA_RECUSA);
      assert.equal(repositorio.ultimoMotivo, 'verificacao_nao_configurada');
    }
  });

  test('aparelho verificado, mas com o prazo vencido', async () => {
    const { chamar, repositorio } = montar();
    repositorio.aparelhos.set(INSTALACAO, AGORA - 25 * 3600_000);
    assert.deepEqual(await chamar(pedido()), RESPOSTA_RECUSA);
    assert.equal(repositorio.ultimoMotivo, 'marca_do_aparelho_vencida');
  });
});

describe('chamada protegida: o que é aceito (para mostrar que nem tudo é recusado)', () => {
  test('DUBLÊ: veredito bom de exemplo aceito e o aparelho fica marcado', async () => {
    const { chamar, repositorio } = montar();
    const r = await chamar(await comProvaDuble(pedido()));
    assert.equal(r.status, 200);
    assert.equal(r.corpo.verificado_por, 'play_integrity');
    assert.equal(repositorio.aparelhos.get(INSTALACAO), AGORA);
  });

  test('aparelho verificado dentro do prazo: chamada sem prova aceita pela marca', async () => {
    const { chamar, repositorio } = montar();
    repositorio.aparelhos.set(INSTALACAO, AGORA - 23 * 3600_000);
    const r = await chamar(pedido());
    assert.equal(r.status, 200);
    assert.equal(r.corpo.verificado_por, 'marca_do_aparelho');
  });

  test('prova de desenvolvimento com a aceitação ligada, só no local', async () => {
    const { chamar } = montar({ config: ambienteLocal({ VERIFICACAO_ACEITAR_DESENVOLVIMENTO: 'sim' }) });
    const corpo = pedido();
    const resumo = await resumoDoPedido(FUNCAO, corpo.install_id, corpo.request_id, corpo.dados);
    const r = await chamar({ ...corpo, prova: { tipo: 'desenvolvimento', token: `dev-falsa:${resumo}` } });
    assert.equal(r.status, 200);
    assert.equal(r.corpo.verificado_por, 'desenvolvimento');
  });
});

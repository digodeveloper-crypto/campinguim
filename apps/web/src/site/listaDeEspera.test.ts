// Regras do formulário da lista de espera (feature 1.12): validação do e-mail e do consentimento,
// trava do rascunho legal e envio ao servidor (endereço da configuração, resposta traduzida).
import { describe, expect, it, vi } from 'vitest';

import enderecos from '../../../../config/enderecos.json';
import { config } from '../config';
import textos from '../textos/pt-BR.json';
import {
  emailValido,
  enderecoDaFuncao,
  entrarNaListaDeEspera,
  formularioLiberado,
  normalizarEmail,
  validarFormulario,
} from './listaDeEspera';

describe('e-mail', () => {
  it.each([
    'pessoa@pessoas-de-teste.test',
    'Pessoa.Nome+lista@sub.pessoas-de-teste.test',
    '  pessoa@pessoas-de-teste.test  ',
    `${'a'.repeat(64)}@pessoas-de-teste.test`,
  ])('aceita %s', (email) => {
    expect(emailValido(email)).toBe(true);
  });

  it.each([
    ['vazio', ''],
    ['sem arroba', 'pessoa.pessoas-de-teste.test'],
    ['sem domínio com ponto', 'pessoa@localhost'],
    ['com espaço no meio', 'pes soa@pessoas-de-teste.test'],
    ['duas arrobas', 'pessoa@@pessoas-de-teste.test'],
    ['ponto duplo no domínio', 'pessoa@pessoas..test'],
    ['domínio começa com ponto', 'pessoa@.pessoas-de-teste.test'],
    ['termina em ponto', 'pessoa@pessoas-de-teste.'],
    ['mais de 64 antes da arroba', `${'a'.repeat(65)}@pessoas-de-teste.test`],
    ['mais de 254 no total', `pessoa@${'a'.repeat(250)}.test`],
  ])('recusa %s (a mesma lista do teste do servidor)', (_nome, email) => {
    expect(emailValido(email)).toBe(false);
  });

  it('normaliza como o servidor guarda: sem espaço nas pontas e em minúsculas', () => {
    expect(normalizarEmail('  Pessoa@Pessoas-De-Teste.TEST ')).toBe('pessoa@pessoas-de-teste.test');
  });
});

describe('formulário', () => {
  it('pede, nesta ordem, o e-mail, um e-mail válido e a caixa marcada', () => {
    expect(validarFormulario('', false)).toBe('emailVazio');
    expect(validarFormulario('   ', true)).toBe('emailVazio');
    expect(validarFormulario('pessoa', true)).toBe('emailInvalido');
    expect(validarFormulario('pessoa@pessoas-de-teste.test', false)).toBe('semAceite');
    expect(validarFormulario('pessoa@pessoas-de-teste.test', true)).toBeNull();
  });

  it('com o consentimento em rascunho, o formulário só funciona no ambiente local (V6, R3)', () => {
    expect(textos.site.consentimento.startsWith('[PENDENTE] Rascunho')).toBe(true);
    expect(formularioLiberado(textos.site.consentimento, true)).toBe(true);
    expect(formularioLiberado(textos.site.consentimento, false)).toBe(false);
    expect(formularioLiberado('Texto aprovado pelo responsável.', false)).toBe(true);
  });

  it('o ambiente local é o de hoje: sem servidor de produção na configuração', () => {
    expect(config.ambienteLocal).toBe(enderecos.producao.servidor === null);
  });
});

describe('envio a waitlist_join', () => {
  const resposta = (status: number, corpo: unknown) => new Response(JSON.stringify(corpo), { status, headers: { 'content-type': 'application/json' } });

  it('vai ao endereço da API lido da configuração, com a chave pública, o e-mail normalizado e o consentimento', async () => {
    const buscar = vi.fn<typeof fetch>().mockResolvedValue(resposta(200, { ok: true }));
    const r = await entrarNaListaDeEspera({ servidor: config.servidor, chavePublica: 'chave-publica-de-teste', email: ' Pessoa@Pessoas-De-Teste.test ', buscar });
    expect(r).toBe('ok');
    const local = enderecos.local;
    expect(config.servidor).toBe(enderecos.producao.servidor ?? `http://${local.servidorNoComputador}:${String(local.portaApi)}`);
    const [url, opcoes] = buscar.mock.calls[0] ?? [];
    expect(url).toBe(`${config.servidor}/rest/v1/rpc/waitlist_join`);
    expect(opcoes?.method).toBe('POST');
    expect(opcoes?.headers).toEqual({ apikey: 'chave-publica-de-teste', 'content-type': 'application/json' });
    expect(JSON.parse(String(opcoes?.body))).toEqual({ p_email: 'pessoa@pessoas-de-teste.test', p_consent: true });
  });

  it('o endereço da função não dobra a barra', () => {
    expect(enderecoDaFuncao('http://servidor.test/')).toBe('http://servidor.test/rest/v1/rpc/waitlist_join');
  });

  it.each([
    ['ok', 200, { ok: true }, 'ok'],
    ['e-mail recusado', 200, { ok: false, code: 'validation' }, 'invalido'],
    ['acima do limite', 200, { ok: false, code: 'rate_limited' }, 'muitasTentativas'],
    ['código desconhecido', 200, { ok: false, code: 'outro' }, 'falhou'],
    ['erro do servidor', 500, { message: 'erro' }, 'falhou'],
  ])('resposta %s vira %s', async (_nome, status, corpo, esperado) => {
    const buscar = vi.fn<typeof fetch>().mockResolvedValue(resposta(status, corpo));
    expect(await entrarNaListaDeEspera({ servidor: 'http://servidor.test', chavePublica: '', email: 'a@b.test', buscar })).toBe(esperado);
  });

  it('falha de rede não lança erro: vira "falhou", para a pessoa tentar de novo', async () => {
    const buscar = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'));
    expect(await entrarNaListaDeEspera({ servidor: 'http://servidor.test', chavePublica: '', email: 'a@b.test', buscar })).toBe('falhou');
  });
});

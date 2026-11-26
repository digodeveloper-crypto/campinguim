// F0-5 · Função de servidor de TESTE, protegida como serão `trip_set_camping` e
// `submit_fact_reports` (SPEC, seções 8 e 11). Sem verificação válida do aparelho, devolve
// `integrity_required`. A regra está em `../_verificacao/servico.ts`; aqui só a ligação com o
// ambiente (variáveis, banco e decodificador).

import { lerConfiguracao } from '../_verificacao/configuracao.ts';
import { DecodificadorGooglePendente, DubleLocalDeTeste } from '../_verificacao/decodificador.ts';
import type { DecodificadorDeToken } from '../_verificacao/decodificador.ts';
import { RepositorioRest } from '../_verificacao/repositorio-rest.ts';
import { chamadaProtegida, RESPOSTA_VALIDACAO } from '../_verificacao/servico.ts';

const ler = (nome: string) => Deno.env.get(nome);
const config = lerConfiguracao(ler);

// O dublê só existe no ambiente local com a chave ligada (configuracao.ts). Em produção, sempre
// o decodificador do Google, que até F0-6 recusa todo token.
const decodificador: DecodificadorDeToken =
  config.usarDubleLocal && config.segredoDuble
    ? new DubleLocalDeTeste(config.segredoDuble)
    : new DecodificadorGooglePendente();

const repositorio = new RepositorioRest(
  ler('SUPABASE_URL') ?? '',
  ler('SUPABASE_SERVICE_ROLE_KEY') ?? ler('SUPABASE_SECRET_KEY') ?? '',
);

function json(status: number, corpo: unknown): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

console.log(
  `prova-chamada-protegida: ambiente=${config.ambiente} desenvolvimento=${config.aceitarProvaDesenvolvimento ? 'aceita' : 'recusada'} decodificador=${decodificador.nome}`,
);

Deno.serve(async (pedido) => {
  if (pedido.method !== 'POST') return json(405, { code: 'validation', message: 'Use POST.' });
  let corpo: unknown;
  try {
    corpo = await pedido.json();
  } catch {
    return json(RESPOSTA_VALIDACAO.status, RESPOSTA_VALIDACAO.corpo);
  }
  try {
    const resposta = await chamadaProtegida(corpo, { config, decodificador, repositorio, agora: () => Date.now() });
    return json(resposta.status, resposta.corpo);
  } catch (erro) {
    console.error('prova-chamada-protegida: falha interna', erro instanceof Error ? erro.message : 'desconhecida');
    return json(500, { code: 'internal', message: 'Erro interno. Tente de novo.' });
  }
});

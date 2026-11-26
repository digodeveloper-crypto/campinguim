import { alterarItem, inserirItens, listarItens, marcarSeparacao, removerItem, restaurarItem } from './acesso/itens';
import type { ContextoDeAcesso } from './acesso/contexto';
import { apagarEventos, contarEventos, guardarEvento, lerLoteDeEventos, listarTabelas, obterIdDaInstalacao, type TabelaDoBanco } from './acesso/local';
import { alterarViagem, apagarViagem, contarPorFaixa, criarViagem, listarViagens, obterViagem } from './acesso/viagens';
import { esquema, TABELAS_PROIBIDAS_NO_APARELHO } from './esquema';
import { versaoLocal } from './migracoes';

// Roteiro que exercita a camada de acesso de ponta a ponta. O mesmo código roda:
//   - nos testes do computador (Vitest, SQLite do Node), em `__testes__/verificacao.test.ts`;
//   - no emulador, num banco cifrado SEPARADO e descartável (`banco.ts`, `verificarNoAparelho`),
//     pedido pelo roteiro de fumaça `e2e/jornadas/fumaca-banco`. Nunca no banco da pessoa.
// O relatório não leva chave, nome digitado nem conteúdo: só nomes de passos, contagens e as
// tabelas do banco.

export const TABELAS_SO_LOCAIS = ['estado_local', 'evento_local', 'migracao_local'] as const;

export type PassoDaVerificacao = { passo: string; ok: boolean; detalhe?: string };
export type RelatorioDaVerificacao = { ok: boolean; versaoLocal: number; tabelas: TabelaDoBanco[]; passos: PassoDaVerificacao[] };

class Falha extends Error {}

function exigir(condicao: boolean, detalhe: string): void {
  if (!condicao) throw new Falha(detalhe);
}

export async function verificarCamada(ctx: ContextoDeAcesso): Promise<RelatorioDaVerificacao> {
  const passos: PassoDaVerificacao[] = [];
  const passo = async (nome: string, fn: () => Promise<string | undefined>) => {
    try {
      const detalhe = await fn();
      passos.push(detalhe ? { passo: nome, ok: true, detalhe } : { passo: nome, ok: true });
    } catch (e) {
      passos.push({ passo: nome, ok: false, detalhe: e instanceof Error ? `${e.name}: ${e.message}` : String(e) });
    }
  };

  const tabelas = await listarTabelas(ctx.db);
  const nomes = new Set(tabelas.map((t) => t.name));
  let tripId = '';
  let familyId = '';
  let itens: string[] = [];

  await passo('tabelas da seção 3 e só locais presentes', async () => {
    const esperadas = [...esquema.tables.map((t) => t.name), ...TABELAS_SO_LOCAIS];
    const faltam = esperadas.filter((n) => !nomes.has(n));
    exigir(faltam.length === 0, `faltam: ${faltam.join(', ')}`);
    return `${esperadas.length} tabelas`;
  });

  await passo('nenhuma tabela de camping, relato ou resumo (DEF-11)', async () => {
    const proibidas = TABELAS_PROIBIDAS_NO_APARELHO.filter((n) => nomes.has(n));
    exigir(proibidas.length === 0, `presentes: ${proibidas.join(', ')}`);
  });

  await passo('criar viagem sem data, com família e pessoas', async () => {
    const criada = await criarViagem(ctx, {
      name: 'Verificação',
      kind: 'tent_car',
      nights: 2,
      climate: 'mild',
      rain: false,
      familia: { name: 'Família', pets: 1 },
      pessoas: [{ age_band: 'adult' }, { age_band: 'child', label: null }],
    });
    tripId = criada.tripId;
    familyId = criada.familyId;
    const viagem = await obterViagem(ctx, tripId);
    exigir(viagem?.status === 'planning' && viagem.start_date === null && viagem.owner_profile_id === ctx.perfilId, 'viagem gravada diferente');
    exigir((await listarViagens(ctx)).some((v) => v.id === tripId), 'viagem fora da lista');
    const faixas = await contarPorFaixa(ctx, tripId);
    exigir(faixas.adult === 1 && faixas.child === 1 && faixas.teen === 0, 'contagem por faixa errada');
  });

  await passo('valor fora da lista é recusado e nada é gravado', async () => {
    const antes = (await listarViagens(ctx)).length;
    let recusou = false;
    try {
      await criarViagem(ctx, { name: 'x', kind: 'camping' as never, nights: 1, familia: { name: 'f', pets: 0 }, pessoas: [] });
    } catch (e) {
      recusou = e instanceof Error && e.name === 'ValorInvalido';
    }
    exigir(recusou, 'não recusou kind inválido');
    exigir((await listarViagens(ctx)).length === antes, 'gravou viagem inválida');
  });

  await passo('gravar itens da lista (grupo e família)', async () => {
    itens = await inserirItens(ctx, tripId, [
      { family_id: null, catalog_key: 'martelo', name: 'Martelo', category: 'abrigo', qty: 1, origin: 'generated' },
      { family_id: familyId, catalog_key: 'barraca', name: 'Barraca', category: 'abrigo', qty: 1, origin: 'generated' },
      { family_id: familyId, name: 'Isqueiro', qty: 2, origin: 'manual' },
    ]);
    exigir((await listarItens(ctx, tripId)).length === 3, 'itens gravados diferentes de 3');
    exigir((await listarItens(ctx, tripId, { familyId: null })).length === 1, 'filtro do grupo errado');
  });

  await passo('marcar "está no carro" e ignorar marcação repetida', async () => {
    const id = itens[1] ?? '';
    exigir(await marcarSeparacao(ctx, id, 'in_car'), 'não marcou');
    exigir(!(await marcarSeparacao(ctx, id, 'in_car')), 'marcação repetida gravou de novo');
    const item = (await listarItens(ctx, tripId)).find((i) => i.id === id);
    exigir(item?.pack_state === 'in_car', 'estado não ficou in_car');
  });

  await passo('remover item da lista e restaurar (E1-04)', async () => {
    const id = itens[2] ?? '';
    exigir(await removerItem(ctx, id), 'não removeu');
    exigir((await listarItens(ctx, tripId)).length === 2, 'removido ainda aparece');
    exigir((await listarItens(ctx, tripId, { incluirRemovidos: true })).length === 3, 'removido sumiu do banco');
    exigir(await restaurarItem(ctx, id), 'não restaurou');
    exigir(await alterarItem(ctx, id, { qty: 3, missing: true }), 'não alterou quantidade');
  });

  await passo('pôr datas na viagem depois', async () => {
    exigir(await alterarViagem(ctx, tripId, { start_date: '2026-12-18', end_date: '2026-12-20' }), 'não alterou');
    exigir((await obterViagem(ctx, tripId))?.end_date === '2026-12-20', 'data não gravada');
  });

  await passo('identificador da instalação estável', async () => {
    const a = await obterIdDaInstalacao(ctx);
    exigir(a === (await obterIdDaInstalacao(ctx)), 'mudou entre leituras');
  });

  await passo('eventos guardados, lidos em lote e apagados', async () => {
    const antes = await contarEventos(ctx);
    await guardarEvento(ctx, { name: 'trip_created', props: { kind: 'tent_car', nights: 2, has_dates: false } });
    const lote = await lerLoteDeEventos(ctx, 50);
    exigir(lote.length === antes + 1, 'lote com tamanho errado');
    await apagarEventos(
      ctx,
      lote.map((e) => e.id),
    );
    exigir((await contarEventos(ctx)) === 0, 'eventos não apagados');
  });

  await passo('apagar a viagem (sem apagar de verdade)', async () => {
    exigir(await apagarViagem(ctx, tripId), 'não apagou');
    exigir(!(await listarViagens(ctx)).some((v) => v.id === tripId), 'viagem apagada ainda aparece');
  });

  return { ok: passos.every((p) => p.ok), versaoLocal: await versaoLocal(ctx.db), tabelas, passos };
}

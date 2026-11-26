import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { alterarItem, inserirItens, listarItens, marcarSeparacao, obterItem, referenciaDoItem, removerItem, restaurarItem } from '../acesso/itens';
import { apagarEventos, contarEventos, gravarEstado, guardarEvento, lerEstado, lerLoteDeEventos, obterIdDaInstalacao } from '../acesso/local';
import { lerChavesPixDoComprador } from '../acesso/pix';
import {
  adicionarPessoa,
  alterarViagem,
  apagarViagem,
  contarPorFaixa,
  criarViagem,
  listarFamilias,
  listarPessoas,
  listarViagens,
  obterViagem,
  removerPessoa,
  type NovaViagem,
} from '../acesso/viagens';
import { novoBancoDeTeste } from './bancoDeTeste';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const viagemDeReferencia: NovaViagem = {
  name: '  Feriado na serra  ',
  kind: 'tent_car',
  start_date: '2026-12-18',
  end_date: '2026-12-20',
  nights: 2,
  climate: 'cold',
  rain: true,
  familia: { name: 'Família da Carla', pets: 1 },
  pessoas: [{ age_band: 'adult' }, { age_band: 'adult' }, { age_band: 'child', label: 'Bia' }, { age_band: 'toddler' }],
};

describe('viagens (feature 1.1 usa)', () => {
  it('cria viagem, família organizadora e pessoas numa transação, sem conta', async () => {
    const { ctx, sqlite } = await novoBancoDeTeste();
    const { tripId, familyId, personIds } = await criarViagem(ctx, viagemDeReferencia);
    for (const id of [tripId, familyId, ...personIds]) expect(id).toMatch(UUID_V4);

    const viagem = await obterViagem(ctx, tripId);
    expect(viagem).toMatchObject({
      name: 'Feriado na serra',
      kind: 'tent_car',
      start_date: '2026-12-18',
      end_date: '2026-12-20',
      nights: 2,
      climate: 'cold',
      rain: 1,
      is_group: 0,
      status: 'planning',
      camping_id: null,
      owner_profile_id: null, // sem conta, fica só no aparelho (E1-14)
      updated_by: null,
      deleted_at: null,
    });
    expect(viagem?.created_at).toMatch(/Z$/);
    expect(await listarFamilias(ctx, tripId)).toMatchObject([{ id: familyId, name: 'Família da Carla', pets: 1, is_organizer: 1 }]);
    expect(await contarPorFaixa(ctx, tripId)).toEqual({ adult: 2, teen: 0, child: 1, toddler: 1 });

    // Cada escrita leva o identificador da alteração gerado no aparelho (seção 4, princípio 2).
    const metadados = sqlite.prepare('select _metadata as m from trip union all select _metadata from trip_person').all();
    const ids = metadados.map((l) => JSON.parse(String(l.m)).c as string);
    for (const c of ids) expect(c).toMatch(UUID_V4);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('com conta, o dono e quem alterou são o perfil logado', async () => {
    const perfil = randomUUID();
    const { ctx } = await novoBancoDeTeste(perfil);
    const { tripId } = await criarViagem(ctx, viagemDeReferencia);
    expect(await obterViagem(ctx, tripId)).toMatchObject({ owner_profile_id: perfil, updated_by: perfil });
  });

  it('viagem sem data (RET-02)', async () => {
    const { ctx } = await novoBancoDeTeste();
    const { end_date: _semFim, ...semFim } = viagemDeReferencia;
    const { tripId } = await criarViagem(ctx, { ...semFim, start_date: null, climate: null, rain: null });
    expect(await obterViagem(ctx, tripId)).toMatchObject({ start_date: null, end_date: null, climate: null, rain: null });
  });

  it.each([
    ['kind fora da lista', { kind: 'camping' }],
    ['clima fora da lista', { climate: 'frio' }],
    ['data em outro formato', { start_date: '18/12/2026' }],
    ['data inexistente', { start_date: '2026-02-30' }],
    ['volta antes da ida', { start_date: '2026-12-20', end_date: '2026-12-18' }],
    ['noites negativas', { nights: -1 }],
    ['noites quebradas', { nights: 1.5 }],
    ['nome vazio', { name: '   ' }],
    ['faixa de idade fora da lista', { pessoas: [{ age_band: 'baby' }] }],
    ['pets negativos', { familia: { name: 'F', pets: -1 } }],
    ['viagem de origem que não é UUID', { source_trip_id: 'abc' }],
  ])('recusa %s antes de gravar qualquer coisa (ponto J1: dado inválido travaria a fila)', async (_nome, troca) => {
    const { ctx } = await novoBancoDeTeste();
    await expect(criarViagem(ctx, { ...viagemDeReferencia, ...(troca as object) } as NovaViagem)).rejects.toMatchObject({ name: 'ValorInvalido' });
    expect(await listarViagens(ctx)).toEqual([]);
  });

  it('alteração sem mudança não grava nem entra na fila', async () => {
    const { ctx, sqlite } = await novoBancoDeTeste();
    const { tripId } = await criarViagem(ctx, viagemDeReferencia);
    const antes = { ...sqlite.prepare('select updated_at, _metadata from trip').get() };
    expect(await alterarViagem(ctx, tripId, { name: 'Feriado na serra', nights: 2 })).toBe(false);
    expect({ ...sqlite.prepare('select updated_at, _metadata from trip').get() }).toEqual(antes);
    expect(await alterarViagem(ctx, tripId, { status: 'packing' })).toBe(true);
    expect((await obterViagem(ctx, tripId))?.status).toBe('packing');
    expect({ ...sqlite.prepare('select _metadata from trip').get() }).not.toEqual({ _metadata: antes._metadata });
  });

  it('confere a ordem das datas também ao alterar uma só', async () => {
    const { ctx } = await novoBancoDeTeste();
    const { tripId } = await criarViagem(ctx, viagemDeReferencia);
    await expect(alterarViagem(ctx, tripId, { end_date: '2026-12-01' })).rejects.toMatchObject({ name: 'ValorInvalido' });
    expect(await alterarViagem(ctx, tripId, { start_date: null, end_date: null })).toBe(true);
  });

  it('apagar marca deleted_at: a viagem some das leituras, mas a linha fica', async () => {
    const { ctx, sqlite } = await novoBancoDeTeste();
    const a = await criarViagem(ctx, viagemDeReferencia);
    const b = await criarViagem(ctx, { ...viagemDeReferencia, name: 'Outra' });
    expect((await listarViagens(ctx)).map((v) => v.id)).toEqual([b.tripId, a.tripId]);
    expect(await apagarViagem(ctx, a.tripId)).toBe(true);
    expect(await apagarViagem(ctx, a.tripId)).toBe(false);
    expect((await listarViagens(ctx)).map((v) => v.id)).toEqual([b.tripId]);
    expect(await obterViagem(ctx, a.tripId)).toBeNull();
    expect(await alterarViagem(ctx, a.tripId, { name: 'x' })).toBe(false);
    expect({ ...sqlite.prepare('select count(*) as n from trip').get() }).toEqual({ n: 2 });
  });

  it('pessoas: acrescentar, remover e contar', async () => {
    const { ctx } = await novoBancoDeTeste();
    const { tripId, familyId, personIds } = await criarViagem(ctx, viagemDeReferencia);
    await adicionarPessoa(ctx, familyId, { age_band: 'teen' });
    expect(await removerPessoa(ctx, personIds[0] ?? '')).toBe(true);
    expect(await contarPorFaixa(ctx, tripId)).toEqual({ adult: 1, teen: 1, child: 1, toddler: 1 });
    expect(await listarPessoas(ctx, tripId)).toHaveLength(4);
    await expect(adicionarPessoa(ctx, randomUUID(), { age_band: 'adult' })).rejects.toMatchObject({ name: 'ValorInvalido' });
  });
});

describe('itens da lista (features 1.2 a 1.10 usam)', () => {
  async function comItens() {
    const banco = await novoBancoDeTeste();
    const { tripId, familyId } = await criarViagem(banco.ctx, viagemDeReferencia);
    const ids = await inserirItens(banco.ctx, tripId, [
      { family_id: null, catalog_key: 'martelo', name: 'Martelo de borracha', category: 'abrigo', qty: 1, origin: 'generated' },
      { family_id: familyId, catalog_key: 'barraca', name: 'Barraca com sobreteto', category: 'abrigo', qty: 1, origin: 'generated' },
      { family_id: familyId, catalog_key: 'agua', name: 'Água', category: 'cozinha', qty: 13.5, unit: 'L', origin: 'generated', depends_on_camping: true },
    ]);
    return { ...banco, tripId, familyId, ids };
  }

  it('grava a lista com os estados iniciais da seção 3', async () => {
    const { ctx, ids } = await comItens();
    expect(await obterItem(ctx, ids[2] ?? '')).toMatchObject({
      qty: 13.5,
      unit: 'L',
      origin: 'generated',
      removed: 0,
      pack_state: 'todo',
      need_buy: 0,
      depends_on_camping: 1,
      return_state: 'unchecked',
      missing: 0,
      leftover: 0,
    });
  });

  it('filtra por família e item do grupo', async () => {
    const { ctx, tripId, familyId } = await comItens();
    expect(await listarItens(ctx, tripId)).toHaveLength(3);
    expect((await listarItens(ctx, tripId, { familyId: null })).map((i) => i.catalog_key)).toEqual(['martelo']);
    expect(await listarItens(ctx, tripId, { familyId })).toHaveLength(2);
  });

  it('recusa item de família de outra viagem e não grava nenhum item do lote', async () => {
    const { ctx, tripId } = await comItens();
    const outra = await criarViagem(ctx, { ...viagemDeReferencia, name: 'Outra' });
    await expect(
      inserirItens(ctx, tripId, [
        { family_id: null, name: 'Lanterna', qty: 1, origin: 'manual' },
        { family_id: outra.familyId, name: 'Isqueiro', qty: 1, origin: 'manual' },
      ]),
    ).rejects.toMatchObject({ name: 'ValorInvalido' });
    expect(await listarItens(ctx, tripId)).toHaveLength(3);
    await expect(inserirItens(ctx, randomUUID(), [{ family_id: null, name: 'x', qty: 1, origin: 'manual' }])).rejects.toMatchObject({
      name: 'ValorInvalido',
    });
  });

  it('marca "separei" e "está no carro"; marcação repetida não entra na fila', async () => {
    const { ctx, ids } = await comItens();
    const id = ids[1] ?? '';
    expect(await marcarSeparacao(ctx, id, 'set_aside')).toBe(true);
    expect(await marcarSeparacao(ctx, id, 'in_car')).toBe(true);
    expect(await marcarSeparacao(ctx, id, 'in_car')).toBe(false);
    expect((await obterItem(ctx, id))?.pack_state).toBe('in_car');
    await expect(marcarSeparacao(ctx, id, 'no_carro' as never)).rejects.toMatchObject({ name: 'ValorInvalido' });
  });

  it('remover tira da lista sem apagar, e restaurar devolve (E1-04)', async () => {
    const { ctx, tripId, ids } = await comItens();
    const id = ids[0] ?? '';
    expect(await removerItem(ctx, id)).toBe(true);
    expect((await listarItens(ctx, tripId)).map((i) => i.id)).not.toContain(id);
    expect((await listarItens(ctx, tripId, { incluirRemovidos: true })).map((i) => i.id)).toContain(id);
    expect(await restaurarItem(ctx, id)).toBe(true);
    expect((await listarItens(ctx, tripId)).map((i) => i.id)).toContain(id);
  });

  it('marcações da volta, "faltou" e "sobrou"', async () => {
    const { ctx, ids } = await comItens();
    const id = ids[1] ?? '';
    expect(await alterarItem(ctx, id, { return_state: 'dry_at_home', missing: true, leftover: false, need_buy: true, note: ' lona rasgada ' })).toBe(true);
    expect(await obterItem(ctx, id)).toMatchObject({ return_state: 'dry_at_home', missing: 1, leftover: 0, need_buy: 1, note: 'lona rasgada' });
    await expect(alterarItem(ctx, id, { qty: -1 })).rejects.toMatchObject({ name: 'ValorInvalido' });
    await expect(alterarItem(ctx, id, { return_state: 'lavar' as never })).rejects.toMatchObject({ name: 'ValorInvalido' });
  });
});

describe('campos pedidos pela B3 (docs/regras.md da B3, seção 6)', () => {
  it('destino sem camping na viagem (E1-13)', async () => {
    const { ctx } = await novoBancoDeTeste();
    const { tripId } = await criarViagem(ctx, { ...viagemDeReferencia, destination_name: '  Serra do Cipó ' });
    expect((await obterViagem(ctx, tripId))?.destination_name).toBe('Serra do Cipó');
    expect(await alterarViagem(ctx, tripId, { destination_name: null })).toBe(true);
    expect((await obterViagem(ctx, tripId))?.destination_name).toBeNull();
  });

  it('referência estável do item segue a regra da B3', async () => {
    const { ctx } = await novoBancoDeTeste();
    const { tripId, familyId } = await criarViagem(ctx, viagemDeReferencia);
    const [gerado, grupo, ajuste, manual] = await inserirItens(ctx, tripId, [
      { family_id: familyId, catalog_key: 'barraca', name: 'Barraca', qty: 1, origin: 'generated' },
      { family_id: null, catalog_key: 'martelo', name: 'Martelo', qty: 1, origin: 'generated' },
      { family_id: null, catalog_key: 'extensao', name: 'Extensão', qty: 1, origin: 'camping_adjust' },
      { family_id: familyId, name: 'Violão', qty: 1, origin: 'manual' },
    ]);
    const ref = async (id: string | undefined) => (await obterItem(ctx, id ?? ''))?.item_ref;
    expect(await ref(gerado)).toBe(`barraca@${familyId}`);
    expect(await ref(grupo)).toBe('martelo@grupo');
    expect(await ref(ajuste)).toBe('ajuste:extensao@grupo');
    expect(await ref(manual)).toBe(manual);
    expect(() => referenciaDoItem('generated', null, null, 'x')).toThrow('chave do catálogo');
  });

  it('referência repetida na mesma viagem é recusada, inclusive dentro do lote; item removido ainda conta', async () => {
    const { ctx } = await novoBancoDeTeste();
    const { tripId, familyId } = await criarViagem(ctx, viagemDeReferencia);
    const [barraca] = await inserirItens(ctx, tripId, [{ family_id: familyId, catalog_key: 'barraca', name: 'Barraca', qty: 1, origin: 'generated' }]);
    await removerItem(ctx, barraca ?? '');
    await expect(
      inserirItens(ctx, tripId, [{ family_id: familyId, catalog_key: 'barraca', name: 'Barraca', qty: 1, origin: 'generated' }]),
    ).rejects.toMatchObject({ name: 'ValorInvalido' });
    await expect(
      inserirItens(ctx, tripId, [
        { family_id: null, catalog_key: 'lanterna', name: 'Lanterna', qty: 1, origin: 'generated' },
        { family_id: null, catalog_key: 'lanterna', name: 'Lanterna', qty: 2, origin: 'generated' },
      ]),
    ).rejects.toMatchObject({ name: 'ValorInvalido' });
    expect(await listarItens(ctx, tripId, { incluirRemovidos: true })).toHaveLength(1);
    // Em outra viagem, a mesma referência é aceita.
    const outra = await criarViagem(ctx, { ...viagemDeReferencia, name: 'Outra' });
    await inserirItens(ctx, outra.tripId, [{ family_id: null, catalog_key: 'martelo', name: 'Martelo', qty: 1, origin: 'generated' }]);
    await inserirItens(ctx, tripId, [{ family_id: null, catalog_key: 'martelo', name: 'Martelo', qty: 1, origin: 'generated' }]);
  });

  it('tarefa sem quantidade, quantidade por pessoa, detalhe e edição à mão', async () => {
    const { ctx } = await novoBancoDeTeste();
    const { tripId, familyId } = await criarViagem(ctx, viagemDeReferencia);
    const [tarefa, mudas, agua] = await inserirItens(ctx, tripId, [
      { family_id: familyId, catalog_key: 'documentos', name: 'Documentos', qty: null, origin: 'generated' },
      { family_id: familyId, catalog_key: 'mudas', name: 'Mudas de roupa', qty: 12, qty_per_person: 3, origin: 'generated' },
      { family_id: null, catalog_key: 'agua', name: 'Água', qty: 8, unit: 'galao_5l', detalhe: { qty: 36, unit: 'litro' }, origin: 'generated' },
    ]);
    expect(await obterItem(ctx, tarefa ?? '')).toMatchObject({ qty: null, qty_edited: 0, qty_per_person: null, detail_qty: null, detail_unit: null });
    expect(await obterItem(ctx, mudas ?? '')).toMatchObject({ qty: 12, qty_per_person: 3 });
    expect(await obterItem(ctx, agua ?? '')).toMatchObject({ unit: 'galao_5l', detail_qty: 36, detail_unit: 'litro' });
    expect(await alterarItem(ctx, agua ?? '', { qty: 10, qty_edited: true })).toBe(true);
    expect(await obterItem(ctx, agua ?? '')).toMatchObject({ qty: 10, qty_edited: 1 });
    expect(await alterarItem(ctx, agua ?? '', { detalhe: null })).toBe(true);
    expect(await obterItem(ctx, agua ?? '')).toMatchObject({ detail_qty: null, detail_unit: null });
    await expect(alterarItem(ctx, agua ?? '', { detalhe: { qty: 20, unit: 'pe' as never } })).rejects.toMatchObject({ name: 'ValorInvalido' });
    await expect(alterarItem(ctx, agua ?? '', { qty_per_person: 1.5 })).rejects.toMatchObject({ name: 'ValorInvalido' });
  });

  it('marca do aprendizado: faltou, sinalizado e reduzido (com o que desfaz)', async () => {
    const { ctx } = await novoBancoDeTeste();
    const { tripId, familyId } = await criarViagem(ctx, viagemDeReferencia);
    const [faltou, reduzido] = await inserirItens(ctx, tripId, [
      { family_id: familyId, catalog_key: 'lanterna', name: 'Lanterna', qty: 1, origin: 'generated', aprendizado: { kind: 'missing' } },
      { family_id: familyId, catalog_key: 'carvao', name: 'Carvão', qty: 3, origin: 'generated', aprendizado: { kind: 'reduced', qty_before: 4, percent: 25 } },
    ]);
    expect(await obterItem(ctx, faltou ?? '')).toMatchObject({ learning_kind: 'missing', learning_qty_before: null, learning_percent: null });
    expect(await obterItem(ctx, reduzido ?? '')).toMatchObject({ learning_kind: 'reduced', learning_qty_before: 4, learning_percent: 25 });
    expect(await alterarItem(ctx, reduzido ?? '', { aprendizado: { kind: 'flagged' } })).toBe(true);
    expect(await obterItem(ctx, reduzido ?? '')).toMatchObject({ learning_kind: 'flagged', learning_qty_before: null, learning_percent: null });
    for (const ruim of [{ kind: 'reduced', qty_before: 4, percent: 0 }, { kind: 'reduced', qty_before: 4, percent: 100 }, { kind: 'faltou' }]) {
      await expect(alterarItem(ctx, faltou ?? '', { aprendizado: ruim as never })).rejects.toMatchObject({ name: 'ValorInvalido' });
    }
  });
});

describe('tabelas só locais', () => {
  it('estado do app: gravar, trocar e ler', async () => {
    const { ctx } = await novoBancoDeTeste();
    expect(await lerEstado(ctx, 'primeiro_uso')).toBeNull();
    await gravarEstado(ctx, 'primeiro_uso', 'feito');
    await gravarEstado(ctx, 'primeiro_uso', 'feito-2');
    expect(await lerEstado(ctx, 'primeiro_uso')).toBe('feito-2');
  });

  it('identificador da instalação: UUID criado uma vez', async () => {
    const { ctx } = await novoBancoDeTeste();
    const id = await obterIdDaInstalacao(ctx);
    expect(id).toMatch(UUID_V4);
    expect(await obterIdDaInstalacao(ctx)).toBe(id);
  });

  it('eventos: guardados com o perfil, lidos do mais antigo e apagados depois do envio', async () => {
    const perfil = randomUUID();
    const instalacao = randomUUID();
    const { ctx } = await novoBancoDeTeste(perfil);
    const a = await guardarEvento(ctx, { name: 'app_opened', props: { origin: 'icon' }, installId: instalacao });
    const b = await guardarEvento(ctx, { name: 'trip_created', props: { kind: 'tent_car', nights: 2, has_dates: true, from_previous: false } });
    const lote = await lerLoteDeEventos(ctx, 1);
    expect(lote).toMatchObject([{ id: a, name: 'app_opened', install_id: instalacao, profile_id: perfil }]);
    expect(JSON.parse(lote[0]?.props ?? '')).toEqual({ origin: 'icon' });
    await apagarEventos(ctx, [a]);
    expect((await lerLoteDeEventos(ctx, 10)).map((e) => e.id)).toEqual([b]);
    expect(await contarEventos(ctx)).toBe(1);
  });

  it('eventos: só propriedades simples, sem objeto nem lista', async () => {
    const { ctx } = await novoBancoDeTeste();
    await expect(guardarEvento(ctx, { name: 'App Opened' })).rejects.toMatchObject({ name: 'ValorInvalido' });
    await expect(guardarEvento(ctx, { name: 'x', props: { lista: ['a'] as never } })).rejects.toMatchObject({ name: 'ValorInvalido' });
    await expect(guardarEvento(ctx, { name: 'x', props: { n: Number.NaN } })).rejects.toMatchObject({ name: 'ValorInvalido' });
    await expect(lerLoteDeEventos(ctx, 0)).rejects.toMatchObject({ name: 'ValorInvalido' });
    expect(await contarEventos(ctx)).toBe(0);
  });
});

describe('chave Pix: só para membro logado de viagem em que o dono é comprador (PRV-06)', () => {
  // As linhas de membros, gastos e chaves chegam do servidor; aqui são postas direto no banco.
  async function cenario() {
    const eu = randomUUID();
    const comprador = randomUUID();
    const banco = await novoBancoDeTeste(eu);
    const { tripId, familyId: minhaFamilia } = await criarViagem(banco.ctx, viagemDeReferencia);
    const familiaCompradora = randomUUID();
    const ins = (sql: string, ...p: (string | number | null)[]) => banco.sqlite.prepare(sql).run(...p);
    ins('insert into trip_family (id, trip_id, name, pets, is_organizer) values (?, ?, ?, 0, 0)', familiaCompradora, tripId, 'Compradora');
    ins("insert into trip_member (id, trip_id, family_id, profile_id, role) values (?, ?, ?, ?, 'organizer')", randomUUID(), tripId, minhaFamilia, eu);
    ins("insert into trip_member (id, trip_id, family_id, profile_id, role) values (?, ?, ?, ?, 'member')", randomUUID(), tripId, familiaCompradora, comprador);
    ins("insert into pix_key (id, profile_id, key, key_type) values (?, ?, 'chave-de-exemplo', 'random')", randomUUID(), comprador);
    const gasto = randomUUID();
    ins("insert into expense (id, trip_id, buyer_family_id, amount_cents, split_rule) values (?, ?, ?, 42000, 'shares')", gasto, tripId, familiaCompradora);
    return { ...banco, eu, comprador, tripId, familiaCompradora, gasto, ins };
  }

  it('membro logado vê a chave do comprador', async () => {
    const { ctx, tripId, familiaCompradora, comprador } = await cenario();
    expect(await lerChavesPixDoComprador(ctx, tripId, familiaCompradora)).toEqual([
      { profile_id: comprador, key: 'chave-de-exemplo', key_type: 'random' },
    ]);
  });

  it('sem conta, não vê', async () => {
    const { ctx, tripId, familiaCompradora } = await cenario();
    expect(await lerChavesPixDoComprador({ ...ctx, perfilId: null }, tripId, familiaCompradora)).toEqual([]);
  });

  it('quem não é membro da viagem não vê', async () => {
    const { ctx, tripId, familiaCompradora } = await cenario();
    expect(await lerChavesPixDoComprador({ ...ctx, perfilId: randomUUID() }, tripId, familiaCompradora)).toEqual([]);
  });

  it('família que não é compradora de nenhum gasto não expõe a chave', async () => {
    const { ctx, tripId, familiaCompradora, gasto, sqlite } = await cenario();
    sqlite.prepare("update expense set deleted_at = '2026-11-26T00:00:00.000Z' where id = ?").run(gasto);
    expect(await lerChavesPixDoComprador(ctx, tripId, familiaCompradora)).toEqual([]);
  });

  it('comprador em outra viagem não vale para esta', async () => {
    const { ctx, familiaCompradora } = await cenario();
    const outra = await criarViagem(ctx, { ...viagemDeReferencia, name: 'Outra' });
    expect(await lerChavesPixDoComprador(ctx, outra.tripId, familiaCompradora)).toEqual([]);
  });

  it('membro removido da viagem deixa de ver', async () => {
    const { ctx, tripId, familiaCompradora, eu, sqlite } = await cenario();
    sqlite.prepare("update trip_member set deleted_at = '2026-11-26T00:00:00.000Z' where profile_id = ?").run(eu);
    expect(await lerChavesPixDoComprador(ctx, tripId, familiaCompradora)).toEqual([]);
  });
});

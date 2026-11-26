import { describe, expect, it } from 'vitest';

import { esquema, TABELAS_PROIBIDAS_NO_APARELHO, TABELAS_SO_DO_SERVIDOR } from '../esquema';
import { MIGRACOES } from '../migracoes';
import { TABELAS_SO_LOCAIS } from '../verificacao';

// O esquema local é contrato com o B5 (esquema do Postgres) e com a SPEC, seção 3: os campos
// abaixo são os da SPEC, copiados um a um. Mudar um campo aqui exige mudar a SPEC antes.
const CONTROLE = ['updated_at', 'updated_by', 'deleted_at'];
const CAMPOS_DA_SPEC: Record<string, string[]> = {
  profile: ['display_name', 'nickname', 'anonymous_by_default', 'origin_channel', 'last_active_at'],
  trip: [
    'owner_profile_id',
    'name',
    'kind',
    'start_date',
    'end_date',
    'nights',
    'climate',
    'rain',
    'camping_id',
    'is_group',
    'status',
    'source_trip_id',
    'created_at', // seção 11, FRD-02
  ],
  trip_family: ['trip_id', 'name', 'pets', 'is_organizer'],
  trip_person: ['family_id', 'age_band', 'label'],
  trip_member: ['trip_id', 'family_id', 'profile_id', 'display_name', 'role'],
  trip_item: [
    'trip_id',
    'family_id',
    'catalog_key',
    'name',
    'category',
    'qty',
    'unit',
    'note',
    'origin',
    'removed',
    'pack_state',
    'need_buy',
    'depends_on_camping',
    'return_state',
    'missing',
    'leftover',
  ],
  item_claim: ['item_id', 'family_id'],
  trip_camping_snapshot: ['trip_id', 'camping_id', 'facts', 'alerts', 'adjustments', 'rules_ack_at', 'fetched_at'],
  invite: ['token', 'trip_id', 'family_id', 'created_by', 'expires_at', 'revoked'],
  expense: ['trip_id', 'item_id', 'buyer_family_id', 'estimate_cents', 'amount_cents', 'split_rule', 'receipt_path'],
  expense_exclusion: ['expense_id', 'person_id'],
  expense_payment: ['expense_id', 'family_id', 'paid_marked_at'],
  expense_audit: ['expense_id', 'actor_member_id', 'field', 'old_value', 'new_value', 'at'],
  pix_key: ['profile_id', 'key', 'key_type'],
};

const tabela = (nome: string) => {
  const t = esquema.tables.find((x) => x.name === nome);
  if (!t) throw new Error(`tabela ${nome} ausente`);
  return t;
};
const tipoDe = (nome: string, coluna: string) => tabela(nome).columns.find((c) => c.name === coluna)?.type;

describe('esquema local = SPEC, seção 3 (viagem e lista, gastos)', () => {
  it('tem exatamente as tabelas que sincronizam com o aparelho', () => {
    expect(esquema.tables.map((t) => t.name).sort()).toEqual(Object.keys(CAMPOS_DA_SPEC).sort());
  });

  it.each(Object.entries(CAMPOS_DA_SPEC))('%s tem os campos da SPEC e os de controle, nada a mais', (nome, campos) => {
    expect(
      tabela(nome)
        .columns.map((c) => c.name)
        .sort(),
    ).toEqual([...campos, ...CONTROLE].sort());
  });

  it('nenhuma tabela de camping, relato, resumo, sugestão, evento ou configuração (DEF-11)', () => {
    const nomes = esquema.tables.map((t) => t.name);
    for (const proibida of TABELAS_PROIBIDAS_NO_APARELHO) expect(nomes).not.toContain(proibida);
    expect(TABELAS_PROIBIDAS_NO_APARELHO).toEqual(
      expect.arrayContaining(['camping', 'fact_report', 'fact_summary', 'suggestion', 'city', 'camping_alias', 'merge_candidate']),
    );
  });

  it('dinheiro em centavos inteiros; verdadeiro/falso e contagens como inteiros', () => {
    expect(tipoDe('expense', 'estimate_cents')).toBe('INTEGER');
    expect(tipoDe('expense', 'amount_cents')).toBe('INTEGER');
    for (const [t, c] of [
      ['trip', 'rain'],
      ['trip', 'is_group'],
      ['trip', 'nights'],
      ['trip_family', 'pets'],
      ['trip_family', 'is_organizer'],
      ['trip_item', 'removed'],
      ['trip_item', 'need_buy'],
      ['trip_item', 'depends_on_camping'],
      ['trip_item', 'missing'],
      ['trip_item', 'leftover'],
      ['invite', 'revoked'],
      ['profile', 'anonymous_by_default'],
    ] as const) {
      expect(tipoDe(t, c), `${t}.${c}`).toBe('INTEGER');
    }
    expect(tipoDe('trip_item', 'qty')).toBe('REAL');
  });

  it('o app escreve (com identificador da alteração) só nas tabelas que não vêm das funções do servidor', () => {
    for (const t of esquema.tables) {
      const doServidor = (TABELAS_SO_DO_SERVIDOR as readonly string[]).includes(t.name);
      expect(t.trackMetadata, t.name).toBe(!doServidor);
      expect(t.localOnly, t.name).toBe(false);
    }
  });

  it('nenhum nome reservado do PowerSync, e as tabelas só locais não colidem com o esquema', () => {
    const nomes = esquema.tables.map((t) => t.name);
    expect(nomes.filter((n) => n.startsWith('ps_'))).toEqual([]);
    for (const local of TABELAS_SO_LOCAIS) expect(nomes).not.toContain(local);
    const criadasPelasMigracoes = MIGRACOES.flatMap((m) => m.comandos)
      .map((c) => /create table (\w+)/i.exec(c)?.[1])
      .filter((n): n is string => Boolean(n));
    expect(criadasPelasMigracoes.sort()).toEqual(TABELAS_SO_LOCAIS.filter((n) => n !== 'migracao_local').sort());
  });
});

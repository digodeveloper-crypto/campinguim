import type { ContextoDeAcesso } from './contexto';

// Chave Pix (SPEC, seção 3: "Lida só por membros de uma viagem em que o dono é comprador";
// seção 11; PRV-06). O servidor é a barreira de verdade (regras de sincronização e
// `pix_key_get`, feature B5/2.9). No aparelho, esta é a única leitura de `pix_key`, e ela repete a
// regra: mesmo que uma chave chegue ao banco local, só aparece quando a regra vale.

export type ChavePix = { profile_id: string; key: string; key_type: string | null };

/**
 * Chaves Pix de quem é da família compradora, numa viagem em que:
 *   - a pessoa está logada (sem conta, nunca: E2-14 é de membro logado);
 *   - a pessoa é membro (não apagado) da viagem;
 *   - a família indicada é compradora de algum gasto (não apagado) da mesma viagem;
 *   - o dono da chave é membro (não apagado) dessa família, nessa viagem.
 * Fora disso, lista vazia.
 */
export async function lerChavesPixDoComprador(ctx: ContextoDeAcesso, tripId: string, buyerFamilyId: string): Promise<ChavePix[]> {
  if (!ctx.perfilId) return [];
  return ctx.db.getAll<ChavePix>(
    `select k.profile_id, k.key, k.key_type
       from pix_key k
       join trip_member dono on dono.profile_id = k.profile_id
                            and dono.trip_id = ?
                            and dono.family_id = ?
                            and dono.deleted_at is null
      where k.deleted_at is null
        and exists (select 1 from trip t where t.id = ? and t.deleted_at is null)
        and exists (select 1 from trip_member eu
                     where eu.trip_id = ? and eu.profile_id = ? and eu.deleted_at is null)
        and exists (select 1 from expense e
                     where e.trip_id = ? and e.buyer_family_id = ? and e.deleted_at is null)
      order by dono.id`,
    [tripId, buyerFamilyId, tripId, tripId, ctx.perfilId, tripId, buyerFamilyId],
  );
}

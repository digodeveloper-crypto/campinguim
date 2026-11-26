// Exclusão de conta (SPEC, seção 3; E2-17, RET-11): apaga perfil, chave Pix e vínculos de login;
// em trip_member o nome vira "participante"; em fact_report o relato fica anônimo. Os valores do
// grupo ficam.
import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { criarViagem, linha, naTransacao } from './apoio-banco';

describe('exclusão de conta', () => {
  it('apagar o usuário do login apaga perfil e Pix, anonimiza membro e relato, e mantém o gasto', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      const camping = randomUUID();
      await c.query(`insert into public.city values ('3550308', 'Cidade de teste', 'SP')`);
      await c.query(`insert into public.camping (id, name, name_normalized, city_ibge_code) values ($1, 'C', 'c', '3550308')`, [camping]);
      await c.query(`insert into public.fact_report (camping_id, trip_id, profile_id, fact_key, value, visited_month) values ($1, $2, $3, 'pet', 'aceita', '2026-11-01')`, [camping, v.trip, v.b]);
      await c.query(`insert into public.pix_key (profile_id, key, key_type) values ($1, 'b@example.com', 'e-mail')`, [v.b]);

      await c.query('delete from auth.users where id = $1', [v.b]);

      expect(await linha(c, 'profile', v.b)).toBeUndefined();
      expect(await linha(c, 'pix_key', v.b, 'profile_id')).toBeUndefined();
      expect(await linha(c, 'trip_member', v.membroB)).toMatchObject({ profile_id: null, display_name: 'participante', family_id: v.familiaB });
      const relato = await c.query('select profile_id, anonymous from public.fact_report where camping_id = $1', [camping]);
      expect(relato.rows).toEqual([{ profile_id: null, anonymous: true }]);
      expect(await linha(c, 'expense', v.gasto)).toMatchObject({ amount_cents: 10000 });
      expect(await linha(c, 'item_claim', v.claimB)).toMatchObject({ family_id: v.familiaB });
    });
  });

  it('o dono da viagem apagado: a viagem fica para os outros membros', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      await c.query('delete from auth.users where id = $1', [v.org]);
      expect(await linha(c, 'trip', v.trip)).toMatchObject({ owner_profile_id: null });
      expect(await linha(c, 'trip_member', v.membroOrg)).toMatchObject({ profile_id: null, display_name: 'participante', role: 'organizer' });
    });
  });
});

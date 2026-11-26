// Lista dos cenários de sincronização da SPEC, seção 4 (S1 a S10). Cada cenário implementado ganha
// um arquivo em cenarios/<id>.mjs que exporta `executar(contexto)`; até lá ele aparece como
// pendente. A SPEC, seção 14, põe os cenários S1 a S10 na feature 2.12 (a 2.2 liga a sincronização).
export const CENARIOS = [
  { id: 'S1', titulo: 'A marca 10 itens em modo avião, fecha o app, reabre e reconecta', feature: '2.12' },
  { id: 'S2', titulo: 'A e B, offline, assumem o mesmo item do grupo; reconectam', feature: '2.12' },
  { id: 'S3', titulo: 'A marca in_car offline; B, online, marca set_aside depois', feature: '2.12' },
  { id: 'S4', titulo: 'A remove um item offline; B edita a quantidade do mesmo item', feature: '2.12' },
  { id: 'S5', titulo: 'A e B criam offline um item chamado "isqueiro"', feature: '2.12' },
  { id: 'S6', titulo: 'A altera o valor de um gasto; B altera a regra de divisão, quase juntos', feature: '2.12' },
  { id: 'S7', titulo: 'A fica 7 dias offline com 200 alterações e reconecta', feature: '2.12' },
  { id: 'S8', titulo: 'O envio é interrompido no meio e repetido', feature: '2.12' },
  { id: 'S9', titulo: 'Uma pessoa sem conta cria 2 viagens e depois faz login', feature: '2.12' },
  { id: 'S10', titulo: 'B é removido do grupo enquanto está offline com alterações pendentes', feature: '2.12' },
];

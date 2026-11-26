// Datas no formato brasileiro. A data da viagem é um dia, sem hora e sem fuso: o app guarda e
// recebe "AAAA-MM-DD" e nunca converte pelo fuso do aparelho (o dia 12 é o dia 12 em qualquer lugar).

const SEMANA = ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'] as const;
const MESES = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'] as const;

export interface DiaCivil {
  ano: number;
  mes: number; // 1 a 12
  dia: number; // 1 a 31
}

/** Quantos dias tem o mês (conta o 29 de fevereiro dos anos bissextos). */
export function diasNoMes(ano: number, mes: number): number {
  return new Date(Date.UTC(ano, mes, 0)).getUTCDate();
}

/** Lê "AAAA-MM-DD". Dia que não existe no calendário (31/02) é erro, nunca é corrigido sozinho. */
export function lerDataIso(texto: string): DiaCivil {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto);
  if (!m) throw new RangeError(`data fora do formato AAAA-MM-DD: ${texto}`);
  const ano = Number(m[1]);
  const mes = Number(m[2]);
  const dia = Number(m[3]);
  if (mes < 1 || mes > 12 || dia < 1 || dia > diasNoMes(ano, mes)) {
    throw new RangeError(`data que não existe no calendário: ${texto}`);
  }
  return { ano, mes, dia };
}

function doisDigitos(n: number): string {
  return String(n).padStart(2, '0');
}

/** "2027-01-12" vira "12/01/2027". */
export function formatarData(iso: string): string {
  const { ano, mes, dia } = lerDataIso(iso);
  return `${doisDigitos(dia)}/${doisDigitos(mes)}/${ano}`;
}

/** Dia da semana, 0 (domingo) a 6 (sábado). */
export function diaDaSemana(iso: string): number {
  const { ano, mes, dia } = lerDataIso(iso);
  return new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay();
}

/** "2027-01-15" vira "sex., 15 de jan.": a data curta das telas de viagem. */
export function formatarDataCurta(iso: string): string {
  const { mes, dia } = lerDataIso(iso);
  return `${SEMANA[diaDaSemana(iso)]}, ${dia} de ${MESES[mes - 1]}`;
}

/** "2026-11" vira "nov/2026": mês e ano do histórico de um fato, sem o dia (E3-19). */
export function formatarMesAno(anoMes: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(anoMes);
  const mes = m ? Number(m[2]) : 0;
  if (!m || mes < 1 || mes > 12) throw new RangeError(`mês fora do formato AAAA-MM: ${anoMes}`);
  return `${(MESES[mes - 1] ?? '').replace('.', '')}/${m[1]}`;
}

/** "12/01/2027 a 15/01/2027", ou só uma data quando a ida e a volta caem no mesmo dia. */
export function formatarPeriodo(inicioIso: string, fimIso: string): string {
  const inicio = formatarData(inicioIso);
  const fim = formatarData(fimIso);
  return inicio === fim ? inicio : `${inicio} a ${fim}`;
}

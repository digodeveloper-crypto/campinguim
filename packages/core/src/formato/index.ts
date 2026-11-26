// Formatação em português do Brasil (NF-09): reais, datas, números e o mecanismo dos textos.
export { agruparMilhares, formatarReais, formatarReaisSemSimbolo } from './reais';
export { formatarNumero, formatarPorcentagem } from './numeros';
export {
  diaDaSemana,
  diasNoMes,
  formatarData,
  formatarDataCurta,
  formatarMesAno,
  formatarPeriodo,
  lerDataIso,
  type DiaCivil,
} from './datas';
export {
  buscarTexto,
  chaveDoPlural,
  ehTextoPendente,
  interpolar,
  listarChavesDeTexto,
  MARCA_PENDENTE,
  marcasDoTexto,
  SUFIXO_SINGULAR,
  textoDaChave,
  type ChavesDeTexto,
  type ValoresDeTexto,
} from './texto';

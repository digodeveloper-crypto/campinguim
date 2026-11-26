// Medição no app: registro de eventos (SPEC, seção 12) por uma porta de armazenamento.
export type { ArmazenamentoDeEventos } from './porta';
export { criarArmazenamentoEmMemoria } from './memoria';
export {
  criarMedicao,
  type DependenciasDaMedicao,
  type Medicao,
  type ResultadoDoRegistro,
} from './registrador';

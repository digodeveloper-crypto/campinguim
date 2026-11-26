// Eventos de medição (SPEC, seção 12; DAT-04, DAT-05, RET-09, RET-10): catálogo tipado, validação,
// faixa de valor, resumo irreversível do convite e regra de usuário ativo. Regras puras: o
// armazenamento e o envio ficam no app (apps/mobile/src/medicao) e na feature 2.2.
export {
  CANAIS_PADRAO_PENDENTE,
  CATALOGO,
  ESTADOS_DE_SEPARACAO,
  FUNCOES_EM_BREVE,
  NIVEIS_DE_ALERTA,
  NOMES_DE_EVENTO,
  ORIGENS_DE_ABERTURA,
  REGRAS_DE_DIVISAO,
  TIPOS_DE_AVISO,
  TIPOS_DE_VIAGEM,
  type DefinicaoDeEvento,
  type EventoDeMedicao,
  type EventoQualquer,
  type NomeDoEvento,
  type PropriedadesDe,
} from './catalogo';
export { validarEvento, type OpcoesDeValidacao, type ResultadoDaValidacao } from './validacao';
export {
  conferirFaixas,
  faixaDeValor,
  FAIXAS_PADRAO_PENDENTE,
  rotulosDeFaixa,
  type ConfigDeFaixas,
} from './faixas';
export { resumoDoConvite, sha256Hex } from './resumo';
export {
  EVENTOS_DE_USUARIO_ATIVO,
  ehUsuarioAtivo,
  inicioDaJanelaDeAtividade,
  MESES_DE_USUARIO_ATIVO,
  type EventoParaAtividade,
} from './ativo';

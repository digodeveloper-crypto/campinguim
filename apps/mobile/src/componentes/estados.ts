// Regras puras dos componentes (sem React Native), testadas em estados.test.ts: paradas da rota, estados
// da lista (ícone + texto + cor, nunca só cor), nomes falados e as cores de cada estado dos controles.
// As cores são papéis do tema (DESIGN.md 3.1); o teste confere o contraste de cada combinação.
import type { NomeIcone } from '../icones/desenhos';
import { t, textos } from '../textos';
import type { PapelCor } from '../tema/contraste';


// ---------------------------------------------------------------------------------------------
// Rota e cabeçalho

export const PARADAS = ['preparar', 'carregar', 'camping', 'volta', 'casa'] as const;
export type Parada = (typeof PARADAS)[number];

/** Nome de cada parada no arquivo de textos (B6). */
export const NOMES_PARADAS: Record<Parada, string> = {
  preparar: textos.rota.preparar,
  carregar: textos.rota.carregar,
  camping: textos.rota.noCamping,
  volta: textos.rota.volta,
  casa: textos.rota.emCasa,
};

/** "Parada 2 de 5: Carregar" e, na atual, "… Você está aqui" (DESIGN.md 7.1). */
export function nomeFaladoDaParada(parada: Parada, atual: boolean): string {
  const n = PARADAS.indexOf(parada) + 1;
  const valores = { n, total: PARADAS.length, nome: NOMES_PARADAS[parada] };
  return atual ? t('rota.paradaAtualAria', valores) : t('rota.paradaAria', valores);
}

/** "Parada 2 de 5 · Carregar" ou "Legenda · Grupo" (DESIGN.md 7.2). */
export function marcaDaEtapa(origem: { parada: Parada } | { area: string }): string {
  if ('parada' in origem) {
    return t('rota.etapa', { n: PARADAS.indexOf(origem.parada) + 1, total: PARADAS.length, nome: NOMES_PARADAS[origem.parada] });
  }
  return t('legenda.etapa', { nome: origem.area });
}

// ---------------------------------------------------------------------------------------------
// Estados (DESIGN.md 3.3)

export type Estado = 'aSeparar' | 'separei' | 'carro' | 'comprar' | 'faltou' | 'conferido' | 'naoConferido' | 'secar';

export type DefEstado = { cor: PapelCor; icone: NomeIcone; ativo: boolean; texto: string; falado: string };

const e = textos.estados;
const SEPAREI_FORA = t('estados.separeiEForaDoCarro', { separei: e.separei, fora: e.foraDoCarro });

export const ESTADOS: Record<Estado, DefEstado> = {
  aSeparar: { cor: 'textoSuave', icone: 'separei', ativo: false, texto: e.aSeparar, falado: e.aSeparar },
  separei: { cor: 'separei', icone: 'separei', ativo: true, texto: SEPAREI_FORA, falado: e.separeiForaDoCarro },
  carro: { cor: 'carro', icone: 'carro', ativo: true, texto: e.carro, falado: e.carro },
  comprar: { cor: 'texto', icone: 'comprar', ativo: false, texto: e.comprar, falado: e.comprar },
  faltou: { cor: 'atencao', icone: 'faltou', ativo: false, texto: e.faltou, falado: e.faltou },
  conferido: { cor: 'texto', icone: 'conferido', ativo: true, texto: e.conferido, falado: e.conferido },
  naoConferido: { cor: 'textoSuave', icone: 'conferido', ativo: false, texto: e.naoConferido, falado: e.naoConferido },
  secar: { cor: 'carro', icone: 'secar', ativo: false, texto: e.secar, falado: e.secar },
};

export type EstadoItem = 'aSeparar' | 'separei' | 'carro';

/** "{nome}, {quantidade}, {estado}. Abrir o item" (DESIGN.md 7.4). */
export function nomeFaladoDoItem(nome: string, quantidade: string, estado: EstadoItem): string {
  return t('lista.abrirItemAria', { falado: t('estados.falado', { nome, quantidade, estado: ESTADOS[estado].falado }) });
}

/** Faixa de 4 `separei` à esquerda: só fora do carro (a separar e separei). */
export function temFaixa(estado: EstadoItem): boolean {
  return estado !== 'carro';
}

// ---------------------------------------------------------------------------------------------
// Cores por estado dos controles. O protótipo não desenha pressão nem desativado: a forma escolhida é
// provisória (docs/componentes.md, "Decisões"), sempre nos 10 papéis, sem opacidade e com contraste.

export type Papeis = { fundo: PapelCor; letra: PapelCor; borda: PapelCor };
export type EstadoToque = 'normal' | 'pressao' | 'desativado';

const DESATIVADO: Papeis = { fundo: 'fundo', letra: 'textoSuave', borda: 'linha' };

export function papeisDoBotao(tipo: 'principal' | 'secundario', estado: EstadoToque): Papeis {
  if (estado === 'desativado') return DESATIVADO;
  if (tipo === 'principal') {
    return estado === 'pressao' ? { fundo: 'texto', letra: 'fundo', borda: 'texto' } : { fundo: 'acento', letra: 'sobreAcento', borda: 'acento' };
  }
  return estado === 'pressao' ? { fundo: 'fundo', letra: 'texto', borda: 'texto' } : { fundo: 'superficie', letra: 'texto', borda: 'texto' };
}

/** Botão alternado de texto (.marca). `carro`: "Está no carro" ligado, borda e letra `carro`. */
export function papeisDaMarca(ligado: boolean, carro: boolean, estado: EstadoToque): Papeis {
  if (estado === 'desativado') return DESATIVADO;
  const pressao = estado === 'pressao';
  if (ligado && carro) return { fundo: pressao ? 'fundo' : 'superficie', letra: 'carro', borda: 'carro' };
  if (ligado) return pressao ? { fundo: 'acento', letra: 'sobreAcento', borda: 'acento' } : { fundo: 'texto', letra: 'fundo', borda: 'texto' };
  return { fundo: pressao ? 'fundo' : 'superficie', letra: 'texto', borda: 'linha' };
}

export function papeisDoFiltro(ligado: boolean, estado: EstadoToque): Papeis {
  if (estado === 'desativado') return DESATIVADO;
  if (ligado) return estado === 'pressao' ? { fundo: 'texto', letra: 'fundo', borda: 'texto' } : { fundo: 'acento', letra: 'sobreAcento', borda: 'acento' };
  return { fundo: estado === 'pressao' ? 'fundo' : 'superficie', letra: 'texto', borda: 'linha' };
}

export type IconeAlternancia = 'separei' | 'carro' | 'conferido' | 'secar' | 'ciente';

/** Cor do estado ligado de cada alternância de símbolo (estilo.css, seção 9). */
export const COR_LIGADA: Record<IconeAlternancia, PapelCor> = {
  separei: 'separei',
  carro: 'carro',
  conferido: 'texto',
  ciente: 'texto',
  secar: 'carro',
};

/** Alternância de símbolo: a letra aqui é a cor do ícone. */
export function papeisDaAlternancia(icone: IconeAlternancia, ligado: boolean, estado: EstadoToque): Papeis {
  if (estado === 'desativado') return { fundo: 'fundo', letra: 'textoSuave', borda: 'linha' };
  const fundo: PapelCor = estado === 'pressao' ? 'fundo' : 'superficie';
  return ligado ? { fundo, letra: COR_LIGADA[icone], borda: COR_LIGADA[icone] } : { fundo, letra: 'textoSuave', borda: 'linha' };
}

export function estadoDoToque(pressionado: boolean, desativado: boolean): EstadoToque {
  return desativado ? 'desativado' : pressionado ? 'pressao' : 'normal';
}

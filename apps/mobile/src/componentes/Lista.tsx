// 7.4 Item da lista e seus estados (DESIGN.md; estilo.css §8 a §10): linha de estado (ícone e texto,
// nunca só cor), item com as duas alternâncias, régua de progresso, categoria que recolhe, faixa de
// tarefa, folha e linha. O estado vem sempre com ícone, texto e, fora do carro, a faixa de 4 à esquerda.
// Larguras de base em rem no protótipo (9rem, 10rem) crescem com a letra (× fator): com letra grande, a
// quantidade e os botões descem de linha em vez de a palavra quebrar no meio (DESIGN.md 4.4).
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icone } from '../icones/Icone';
import { t, textos } from '../textos';
import { tokens, useTema, type PapelCor } from '../tema';
import { Alternancia, BotaoMarca } from './Botoes';
import { ESTADOS, nomeFaladoDoItem, temFaixa, type Estado, type EstadoItem } from './estados';
import { Texto } from './Texto';


export function LinhaEstado({ estado, fundo = 'superficie' }: { estado: Estado; fundo?: PapelCor }) {
  const e = ESTADOS[estado];
  return (
    <View style={estilos.estado}>
      <Icone nome={e.icone} ativo={e.ativo} cor={e.cor} recorte={fundo} tamanho={tokens.icone.estado} />
      <Texto uso="estado" cor={e.cor} falado={e.falado} style={estilos.encolhe}>
        {e.texto}
      </Texto>
    </View>
  );
}

// ---------------------------------------------------------------------------------------------
// Folha (folhas, cartões, linhas de lista) e linha simples

export function Folha({ children, style, testID }: { children: ReactNode; style?: StyleProp<ViewStyle>; testID?: string | undefined }) {
  const { cores } = useTema();
  return (
    <View testID={testID} style={[estilos.folha, { backgroundColor: cores.superficie, borderColor: cores.linha }, style]}>
      {children}
    </View>
  );
}

/** Divisória de 1 entre linhas de uma folha. */
export function Divisoria() {
  const { cores } = useTema();
  return <View style={{ height: tokens.borda.folha, backgroundColor: cores.linha }} />;
}

/** Faixa lateral de 4 (DESIGN.md 5): `separei` fora do carro; `texto` na tarefa e no escolhido. */
export function Faixa({ cor }: { cor: PapelCor }) {
  const { cores } = useTema();
  return <View pointerEvents="none" style={[estilos.faixa, { backgroundColor: cores[cor] }]} />;
}

// ---------------------------------------------------------------------------------------------
// Item da lista (64 de altura; nome, quantidade e estado; "separei" e "está no carro")

type PropsItem = {
  nome: string;
  quantidade: string;
  estado: EstadoItem;
  aoMudar?: (novo: EstadoItem) => void;
  aoAbrir?: () => void;
  testID?: string | undefined;
};

export function ItemLista({ nome, quantidade, estado, aoMudar, aoAbrir, testID }: PropsItem) {
  const { cores, fator } = useTema();
  const separado = estado !== 'aSeparar';
  return (
    <View testID={testID} style={[estilos.item, { backgroundColor: cores.superficie }]}>
      {temFaixa(estado) ? <Faixa cor="separei" /> : null}
      <Pressable
        onPress={aoAbrir}
        accessibilityRole="button"
        accessibilityLabel={nomeFaladoDoItem(nome, quantidade, estado)}
        style={({ pressed }) => [estilos.itemAbrir, { minWidth: 120 * fator }, pressed ? { backgroundColor: cores.fundo } : null]}
      >
        <Texto uso="itemNome" semLeitura>
          {nome}
        </Texto>
        <View style={estilos.meta}>
          <Texto uso="secundario" cor="textoSuave" semLeitura>
            {quantidade}
          </Texto>
          <LinhaEstado estado={estado} />
        </View>
      </Pressable>
      <View style={estilos.botoes} accessibilityLabel={nome}>
        <Alternancia
          icone="separei"
          ligado={separado}
          falado={t('lista.alternarSeparei', { nome })}
          aoTocar={aoMudar ? () => aoMudar(estado === 'aSeparar' ? 'separei' : 'aSeparar') : undefined}
          testID={testID ? `${testID}-separei` : undefined}
        />
        <Alternancia
          icone="carro"
          ligado={estado === 'carro'}
          falado={t('lista.alternarNoCarro', { nome })}
          aoTocar={aoMudar ? () => aoMudar(estado === 'carro' ? 'separei' : 'carro') : undefined}
          testID={testID ? `${testID}-carro` : undefined}
        />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------------------------
// Régua de progresso: um traço por item (12 de altura; 8 na curta)

type PropsRegua = { feitos: number; total: number; volta?: boolean; curta?: boolean; largura?: number };

export function Regua({ feitos, total, volta = false, curta = false, largura }: PropsRegua) {
  const { cores } = useTema();
  const altura = curta ? 8 : 12;
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[estilos.regua, { height: altura, marginTop: curta ? 0 : 10 }, largura ? { width: largura } : null]}
    >
      {Array.from({ length: total }, (_, i) =>
        i < feitos ? (
          <View key={i} style={[estilos.traco, { height: altura, backgroundColor: volta ? cores.texto : cores.carro }]} />
        ) : (
          <View
            key={i}
            style={[
              estilos.traco,
              {
                height: altura,
                backgroundColor: cores.superficie,
                borderWidth: curta ? 1 : tokens.borda.controle,
                borderColor: volta ? cores.linha : cores.separei,
              },
            ]}
          />
        ),
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------------------------
// Categoria: cabeçalho que recolhe e abre (56), nome em 19/24, régua curta e "x de y"

type PropsCategoria = {
  nome: string;
  feitos: number;
  total: number;
  volta?: boolean;
  abertaNoInicio?: boolean;
  children: ReactNode;
  testID?: string | undefined;
};

export function Categoria({ nome, feitos, total, volta = false, abertaNoInicio = true, children, testID }: PropsCategoria) {
  const { cores, fator, faixa } = useTema();
  const [aberta, setAberta] = useState(abertaNoInicio);
  const progresso = volta ? t('volta.progressoConferidos', { feitos, total }) : t('lista.progressoNoCarro', { feitos, total });
  const falado = volta ? t('volta.categoriaAria', { categoria: nome, feitos, total }) : t('lista.categoriaAria', { categoria: nome, feitos, total });
  return (
    <View style={estilos.cat} testID={testID}>
      <Pressable
        onPress={() => setAberta((a) => !a)}
        accessibilityRole="button"
        accessibilityLabel={falado}
        accessibilityState={{ expanded: aberta }}
        style={({ pressed }) => [estilos.catBotao, pressed ? { backgroundColor: cores.superficie } : null]}
      >
        {/* Em 200 %, o nome ocupa a linha inteira e a régua com o "x de y" desce (QA B2, rodada 1). */}
        <View style={[estilos.catCabeca, faixa === 200 ? estilos.catCabecaColuna : null]}>
          <Texto uso="subtitulo" semLeitura style={faixa === 200 ? estilos.catNomeColuna : [estilos.catNome, { flexBasis: 144 * fator }]}>
            {nome}
          </Texto>
          <View style={estilos.catProg}>
            <Regua feitos={feitos} total={total} volta={volta} curta largura={56} />
            <Texto uso="secundario" cor="textoSuave" semLeitura>
              {progresso}
            </Texto>
          </View>
        </View>
        <View style={aberta ? estilos.girado : null}>
          <Icone nome="baixo" recorte="fundo" />
        </View>
      </Pressable>
      {aberta ? <View style={estilos.catConteudo}>{children}</View> : null}
    </View>
  );
}

// ---------------------------------------------------------------------------------------------
// Faixa de tarefa: borda esquerda de 4 `texto` e botão "feito"

type PropsTarefa = { tarefa: string; feito: boolean; aoMudar?: (feito: boolean) => void; testID?: string | undefined };

export function FaixaTarefa({ tarefa, feito, aoMudar, testID }: PropsTarefa) {
  const { cores, fator } = useTema();
  return (
    <View testID={testID} style={[estilos.tarefa, { backgroundColor: cores.superficie, borderColor: cores.linha }]}>
      <Faixa cor="texto" />
      <View style={[estilos.tarefaTexto, { flexBasis: 160 * fator }]}>
        <Icone nome="tarefa" />
        <Texto style={estilos.encolhe}>{tarefa}</Texto>
      </View>
      <BotaoMarca
        texto={textos.estados.feito}
        icone="ciente"
        ligado={feito}
        falado={t('lista.tarefaFeitaAria', { tarefa })}
        aoTocar={aoMudar ? () => aoMudar(!feito) : undefined}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  encolhe: { flexShrink: 1 },
  estado: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  folha: { borderWidth: tokens.borda.folha, borderRadius: tokens.raio, overflow: 'hidden' },
  faixa: { position: 'absolute', left: 0, top: 0, bottom: 0, width: tokens.borda.faixa },
  item: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    minHeight: tokens.alvo.item,
  },
  itemAbrir: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 120, minHeight: 52, justifyContent: 'center', gap: 2 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 10, rowGap: 2 },
  botoes: { flexDirection: 'row', gap: 8, marginLeft: 'auto' },
  regua: { flexDirection: 'row', alignItems: 'flex-end', gap: 1 },
  traco: { flex: 1, minWidth: 0 },
  cat: { marginTop: 12 },
  catBotao: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: tokens.alvo.linha, paddingVertical: 6, paddingHorizontal: 4 },
  catCabeca: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 12, rowGap: 4 },
  catCabecaColuna: { flexDirection: 'column', alignItems: 'flex-start' },
  catNomeColuna: { alignSelf: 'stretch' },
  catNome: { flexGrow: 1, flexShrink: 1, flexBasis: 144 },
  catProg: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  catConteudo: { marginTop: 4 },
  girado: { transform: [{ rotate: '180deg' }] },
  tarefa: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 12,
    rowGap: 8,
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 12,
    borderWidth: tokens.borda.folha,
    borderRadius: tokens.raio,
    overflow: 'hidden',
  },
  tarefaTexto: { flexGrow: 1, flexShrink: 1, flexBasis: 160, flexDirection: 'row', alignItems: 'center', gap: 10 },
});

export { ESTADOS, nomeFaladoDoItem, type Estado, type EstadoItem };

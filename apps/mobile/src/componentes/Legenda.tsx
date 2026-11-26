// 7.7 Legenda que abre de baixo (DESIGN.md; estilo.css §13 e §14). O botão fica no rodapé, à direita;
// o painel abre sobre o `fundo` a 88 %, com borda `texto`, cabeça de 56 e "Fechar" de 48. Cada entrada
// tem um símbolo numa caixa de 40 e ligações de 48; a da tela atual fica sublinhada com 2.
// Acessibilidade: o botão diz que abre um diálogo e se está aberto; o painel é modal (o foco fica nele),
// fecha pelo "voltar" do Android (o Esc do protótipo) e anuncia "Legenda aberta. Camping, grupo e gastos.".
// Sem animação longa: o painel aparece sem deslizar (movimento até 200 ms, DESIGN.md 5).
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icone, type NomeIcone } from '../icones/Icone';
import { textos } from '../textos';
import { comOpacidade, tokens, useTema } from '../tema';
import { BotaoFechar } from './Botoes';
import { formatar } from './formatar';
import { Texto } from './Texto';

const t = textos.legenda;
const areas = textos.areas;

export type DestinoLegenda = 'alertas' | 'fato' | 'grupo' | 'gastos';

type PropsBotao = { aberta: boolean; aoTocar: () => void; testID?: string | undefined };

export function BotaoLegenda({ aberta, aoTocar, testID = 'legenda-botao' }: PropsBotao) {
  const { cores, faixa } = useTema();
  return (
    <Pressable
      testID={testID}
      onPress={aoTocar}
      accessibilityRole="button"
      accessibilityLabel={t.aria}
      accessibilityState={{ expanded: aberta }}
      style={({ pressed }) => [
        estilos.botao,
        { borderColor: cores.texto, backgroundColor: pressed ? cores.fundo : cores.superficie },
      ]}
    >
      {({ pressed }) => (
        <>
          <Icone nome="legenda" recorte={pressed ? 'fundo' : 'superficie'} />
          <View style={estilos.botaoTexto}>
            <Texto uso="legendaNome" semLeitura>
              {t.botao}
            </Texto>
            {faixa === 200 ? null : (
              <Texto uso="secundario" cor="textoSuave" semLeitura>
                {t.itens}
              </Texto>
            )}
          </View>
        </>
      )}
    </Pressable>
  );
}

type PropsPainel = {
  aberta: boolean;
  aoFechar: () => void;
  aoEscolher: (destino: DestinoLegenda) => void;
  /** Entrada da tela atual (sublinhada). */
  atual?: DestinoLegenda | null;
  /** Nome do fato mostrado na ligação "Fato: {fato}". */
  fato: string;
};

function Ligacao({ texto, atual, aoTocar, testID }: { texto: string; atual: boolean; aoTocar: () => void; testID: string }) {
  const { cores } = useTema();
  return (
    <Pressable
      testID={testID}
      onPress={aoTocar}
      accessibilityRole="link"
      accessibilityLabel={texto}
      accessibilityState={{ selected: atual }}
      style={({ pressed }) => [estilos.ligacao, pressed ? { backgroundColor: cores.fundo } : null]}
    >
      <View style={estilos.encolhe}>
        <Texto semLeitura>{texto}</Texto>
        {atual ? <View style={[estilos.sublinhado, { backgroundColor: cores.texto }]} /> : null}
      </View>
      <Icone nome="direita" />
    </Pressable>
  );
}

function Area({ icone, nome, sub, atual, aoTocar, testID }: { icone: NomeIcone; nome: string; sub: string; atual: boolean; aoTocar: () => void; testID: string }) {
  const { cores } = useTema();
  return (
    <Pressable
      testID={testID}
      onPress={aoTocar}
      accessibilityRole="link"
      accessibilityLabel={`${nome}. ${sub}`}
      accessibilityState={{ selected: atual }}
      style={({ pressed }) => [estilos.item, estilos.ligacao, { borderColor: cores.linha }, pressed ? { backgroundColor: cores.fundo } : null]}
    >
      <View style={[estilos.simbolo, { borderColor: cores.texto }]}>
        <Icone nome={icone} />
      </View>
      <View style={estilos.encolhe}>
        <Texto uso="legendaArea" semLeitura>
          {nome}
        </Texto>
        {atual ? <View style={[estilos.sublinhado, { backgroundColor: cores.texto }]} /> : null}
        <Texto uso="secundario" cor="textoSuave" semLeitura>
          {sub}
        </Texto>
      </View>
      <Icone nome="direita" />
    </Pressable>
  );
}

export function PainelLegenda({ aberta, aoFechar, aoEscolher, atual = null, fato }: PropsPainel) {
  const { cores } = useTema();
  const margens = useSafeAreaInsets();
  useEffect(() => {
    if (aberta) AccessibilityInfo.announceForAccessibility(t.aberta);
  }, [aberta]);
  return (
    <Modal visible={aberta} transparent animationType="none" onRequestClose={aoFechar} statusBarTranslucent>
      <View style={estilos.painel}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: comOpacidade(cores.fundo, tokens.transparencia.painelFundo) }]}
          onPress={aoFechar}
          accessible={false}
          importantForAccessibility="no"
        />
        <View
          accessibilityViewIsModal
          testID="legenda-painel"
          style={[estilos.caixa, { borderColor: cores.texto, backgroundColor: cores.superficie, marginBottom: 12 + margens.bottom, marginTop: 12 + margens.top }]}
        >
          <ScrollView>
            <View style={estilos.cabeca}>
              <Texto uso="tituloPainel" titulo style={estilos.encolhe}>
                {t.titulo}
              </Texto>
              <BotaoFechar aoTocar={aoFechar} testID="legenda-fechar" />
            </View>
            <Texto cor="textoSuave" style={estilos.intro}>
              {t.intro}
            </Texto>
            <View style={[estilos.lista, { borderColor: cores.linha }]}>
              <View style={[estilos.item, estilos.itemGrupo, { borderColor: cores.linha }]}>
                <View style={[estilos.simbolo, estilos.simboloGrupo, { borderColor: cores.texto }]}>
                  <Icone nome="barraca" />
                </View>
                <View style={estilos.encolhe}>
                  <Texto uso="legendaArea" titulo style={estilos.nomeGrupo}>
                    {areas.camping}
                  </Texto>
                  <View style={estilos.sub}>
                    <Ligacao texto={t.alertas} atual={atual === 'alertas'} aoTocar={() => aoEscolher('alertas')} testID="legenda-alertas" />
                    <Ligacao texto={formatar(t.fato, { fato })} atual={atual === 'fato'} aoTocar={() => aoEscolher('fato')} testID="legenda-fato" />
                  </View>
                </View>
              </View>
              <Area icone="grupo" nome={areas.grupo} sub={t.grupoSub} atual={atual === 'grupo'} aoTocar={() => aoEscolher('grupo')} testID="legenda-grupo" />
              <Area icone="gastos" nome={areas.gastos} sub={t.gastosSub} atual={atual === 'gastos'} aoTocar={() => aoEscolher('gastos')} testID="legenda-gastos" />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/** Botão e painel juntos, com o estado de aberto. */
export function Legenda(props: Omit<PropsPainel, 'aberta' | 'aoFechar'>) {
  const [aberta, setAberta] = useState(false);
  return (
    <>
      <BotaoLegenda aberta={aberta} aoTocar={() => setAberta(true)} />
      <PainelLegenda
        {...props}
        aberta={aberta}
        aoFechar={() => setAberta(false)}
        aoEscolher={(d) => {
          setAberta(false);
          props.aoEscolher(d);
        }}
      />
    </>
  );
}

const estilos = StyleSheet.create({
  encolhe: { flex: 1, minWidth: 0 },
  botao: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: tokens.alvo.medio,
    minWidth: tokens.alvo.medio,
    maxWidth: '100%',
    paddingVertical: 6,
    paddingLeft: 10,
    paddingRight: 12,
    borderWidth: tokens.borda.destaque,
    borderRadius: tokens.raio,
  },
  botaoTexto: { flexShrink: 1 },
  painel: { flex: 1, justifyContent: 'flex-end' },
  caixa: {
    maxHeight: '100%',
    flexShrink: 1,
    marginHorizontal: 12,
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderWidth: tokens.borda.destaque,
    borderRadius: tokens.raio,
  },
  cabeca: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: tokens.alvo.linha },
  intro: { marginBottom: 8 },
  lista: { borderTopWidth: tokens.borda.folha },
  item: { flexDirection: 'row', gap: 12, paddingVertical: 8, borderBottomWidth: tokens.borda.folha },
  itemGrupo: { alignItems: 'flex-start' },
  simbolo: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderWidth: tokens.borda.destaque },
  simboloGrupo: { marginTop: 4 },
  nomeGrupo: { paddingTop: 12 },
  sub: { gap: 8, marginTop: 4 },
  ligacao: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: tokens.alvo.medio },
  sublinhado: { height: 2, marginTop: 2, alignSelf: 'stretch' },
});

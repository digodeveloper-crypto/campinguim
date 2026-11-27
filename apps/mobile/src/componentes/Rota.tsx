// 7.1 Rota de cinco paradas (DESIGN.md; estilo.css §5). Cada parada é um botão de 64 × 48 no mínimo.
// A parada atual leva o mascote `icone` de 24 ("você está aqui") ou, nas telas que já mostram outra
// pose, o ponto cheio de 18. Em 130 % e 200 % de letra, o nome some e fica o número.
// Deslizar entre paradas é só atalho (direcaoDoGesto, em formatar.ts); as paradas são botões.
// PARADAS e o nome falado ficam em estados.ts (puro, testado).
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { textos } from '../textos';
import { tokens, useTema } from '../tema';
import { NOMES_PARADAS, nomeFaladoDaParada, PARADAS, type Parada } from './estados';
import { Mascote } from './mascote/Mascote';
import { Texto } from './Texto';


type Props = {
  /** Parada atual; sem ela (telas da legenda), nenhuma fica marcada. */
  atual?: Parada | null;
  /** Mascote na parada atual (telas 2, 4, 5, 8, 9 e 10); sem ele, o ponto cheio de 18. */
  comMascote?: boolean;
  aoEscolher?: (parada: Parada) => void;
};

const LARGURA_ALVO = 64;
const ALTURA_MARCA = 46;

export function Rota({ atual = null, comMascote = true, aoEscolher }: Props) {
  const { cores, faixa } = useTema();
  const numeros = faixa >= 130;
  return (
    <View accessibilityRole="tablist" accessibilityLabel={textos.rota.rotulo} style={estilos.rota} testID="rota">
      <View style={estilos.paradas}>
        {/* A rota: traço 2, espaço 6, ligando os centros das paradas (fica atrás dos pontos). */}
        <View style={estilos.tracado} pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants">
          <Svg width="100%" height={2}>
            <Line x1="0" y1="1" x2="100%" y2="1" stroke={cores.texto} strokeWidth={1.5} strokeDasharray="2 6" />
          </Svg>
        </View>
        {PARADAS.map((p, i) => {
          const eAtual = p === atual;
          return (
            <Pressable
              key={p}
              testID={`rota-${p}`}
              onPress={aoEscolher ? () => aoEscolher(p) : undefined}
              accessibilityRole="tab"
              accessibilityLabel={nomeFaladoDaParada(p, eAtual)}
              accessibilityState={{ selected: eAtual }}
              style={({ pressed }) => [estilos.alvo, pressed ? { backgroundColor: cores.superficie } : null]}
            >
              <View style={estilos.marca}>
                {eAtual && comMascote ? (
                  <Mascote arte="icone" largura={24} />
                ) : (
                  <View
                    style={[
                      estilos.ponto,
                      { borderColor: cores.texto, backgroundColor: eAtual ? cores.texto : cores.fundo },
                      eAtual ? estilos.pontoAtual : null,
                    ]}
                  />
                )}
              </View>
              {numeros ? (
                <Texto uso="rotaNumero" cor={eAtual ? 'texto' : 'textoSuave'} semLeitura>
                  {String(i + 1)}
                </Texto>
              ) : (
                <Texto uso={eAtual ? 'rotaNomeAtual' : 'rotaNome'} cor={eAtual ? 'texto' : 'textoSuave'} semLeitura style={estilos.nome}>
                  {NOMES_PARADAS[p]}
                </Texto>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  rota: { paddingTop: 12 },
  paradas: { flexDirection: 'row', justifyContent: 'space-between' },
  tracado: { position: 'absolute', left: LARGURA_ALVO / 2, right: LARGURA_ALVO / 2, top: ALTURA_MARCA / 2 - 1, height: 2 },
  alvo: {
    width: LARGURA_ALVO,
    minHeight: tokens.alvo.medio,
    alignItems: 'center',
    gap: 4,
    paddingBottom: 4,
    borderRadius: tokens.raio,
  },
  marca: { width: 32, height: ALTURA_MARCA, alignItems: 'center', justifyContent: 'center' },
  ponto: { width: 12, height: 12, borderRadius: 6, borderWidth: tokens.borda.controle },
  pontoAtual: { width: 18, height: 18, borderRadius: 9 },
  nome: { textAlign: 'center' },
});

export { PARADAS, nomeFaladoDaParada, type Parada };

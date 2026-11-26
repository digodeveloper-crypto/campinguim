// 7.5 Alerta do camping (DESIGN.md): alertas agrupados por nível. Título do grupo em rótulo de carta com
// ícone ("Atenção" em `atencao`, "Informação" em `texto-suave`); cada alerta é uma linha de folha com o
// ícone, o texto em `texto` e, quando há, o botão "Ciente" (que vira "Desfazer" depois de marcado).
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icone } from '../icones/Icone';
import { textos } from '../textos';
import { tokens } from '../tema';
import { BotaoMarca } from './Botoes';
import { Divisoria, Folha } from './Lista';
import { Texto } from './Texto';

const t = { nivel: textos.niveis, acao: textos.acoes };

export type Nivel = 'atencao' | 'informacao';
/** Ícone da linha: o do nível, ou o de ajuste na lista (entrou, saiu) e o de regra. */
export type TipoAlerta = Nivel | 'entrou' | 'saiu' | 'regra';

export function GrupoDeAlertas({ nivel, children, testID }: { nivel: Nivel; children: ReactNode; testID?: string | undefined }) {
  const atencao = nivel === 'atencao';
  const filhos = Array.isArray(children) ? children : [children];
  return (
    <View style={estilos.bloco} testID={testID}>
      <View style={estilos.titulo}>
        <Icone nome={atencao ? 'atencao' : 'info'} cor={atencao ? 'atencao' : 'textoSuave'} recorte="fundo" tamanho={tokens.icone.bloco} />
        <Texto uso="rotulo" cor={atencao ? 'atencao' : 'textoSuave'} titulo>
          {atencao ? t.nivel.atencao : t.nivel.informacao}
        </Texto>
      </View>
      <Folha>
        {filhos.map((f, i) => (
          <View key={i}>
            {i > 0 ? <Divisoria /> : null}
            {f}
          </View>
        ))}
      </Folha>
    </View>
  );
}

type PropsAlerta = {
  tipo: TipoAlerta;
  texto: string;
  /** Com `ciente` definido, a linha mostra o botão "Ciente" / "Desfazer". */
  ciente?: boolean | undefined;
  aoMudarCiente?: ((ciente: boolean) => void) | undefined;
  testID?: string | undefined;
};

const ICONE: Record<TipoAlerta, 'atencao' | 'info' | 'entrou' | 'saiu' | 'regra'> = {
  atencao: 'atencao',
  informacao: 'info',
  entrou: 'entrou',
  saiu: 'saiu',
  regra: 'regra',
};

export function LinhaAlerta({ tipo, texto, ciente, aoMudarCiente, testID }: PropsAlerta) {
  return (
    <View style={estilos.linha} testID={testID}>
      <Icone nome={ICONE[tipo]} cor={tipo === 'atencao' ? 'atencao' : 'textoSuave'} />
      <Texto style={estilos.texto}>{texto}</Texto>
      {ciente === undefined ? null : (
        <BotaoMarca
          texto={ciente ? t.acao.desfazer : t.acao.ciente}
          icone={ciente ? undefined : 'ciente'}
          ligado={false}
          falado={`${texto}: ${ciente ? t.acao.desfazer : t.acao.ciente}`}
          aoTocar={aoMudarCiente ? () => aoMudarCiente(!ciente) : undefined}
          testID={testID ? `${testID}-ciente` : undefined}
          style={estilos.botao}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  bloco: { marginTop: tokens.espaco.entreBlocos },
  titulo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  linha: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    minHeight: tokens.alvo.linha,
    paddingVertical: tokens.espaco.linhaVertical,
    paddingHorizontal: tokens.espaco.linhaLateral,
  },
  texto: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 120 },
  botao: { marginLeft: 'auto' },
});

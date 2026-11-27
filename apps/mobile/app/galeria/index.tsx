// Galeria dos componentes (B2, DSG-06): cada componente em todos os estados, para o QA comparar com o
// protótipo Rumo. Uma seção por vez (assim cada tela tem no máximo um mascote, DESIGN.md 8). Botões para
// forçar o tema e simular a letra; as condições reais (fonte do sistema, tema escuro) vêm do aparelho.
import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Alternancia,
  Botao,
  BotaoMarca,
  CabecalhoEtapa,
  CaixaMarcar,
  CampoTexto,
  Categoria,
  Contador,
  Discreto,
  Divisoria,
  FaixaTarefa,
  Filtro,
  Folha,
  GrupoDeAlertas,
  ItemLista,
  Legenda,
  LinhaAlerta,
  LinhaEstado,
  Mascote,
  Mensagem,
  MensagemErro,
  Opcao,
  Opcoes,
  Regua,
  Resultado,
  Rodape,
  Rota,
  Selo,
  Tela,
  Texto,
  Vazio,
  BotaoFechar,
  ESTADOS,
  marcaDaEtapa,
  formatar,
  type Estado,
  type EstadoItem,
} from '../../src/componentes';
import type { NomeArte } from '../../src/componentes/mascote/artes';
import { Icone, ORDEM_ICONES } from '../../src/icones/Icone';
import { temAtivo } from '../../src/icones/svg';
import { t, textos } from '../../src/textos';
import { contraste, tokens, TemaProvedor, useTema, type NomeTema, type PapelCor, type UsoTexto } from '../../src/tema';

const g = textos.galeria;
const ex = g.exemplo;

const SECOES = ['cores', 'tipografia', 'icones', 'rota', 'cabecalho', 'botoes', 'item', 'alerta', 'selo', 'legenda', 'rodape', 'campos', 'vazios', 'mascote'] as const;
type Secao = (typeof SECOES)[number];

const decimal = (n: number) => n.toFixed(2).replace('.', ',');

const FALADO_ALTERNANCIA = {
  separei: (nome: string) => t('lista.alternarSeparei', { nome }),
  carro: (nome: string) => t('lista.alternarNoCarro', { nome }),
  conferido: (nome: string) => t('volta.alternarConferido', { nome }),
  secar: (nome: string) => t('volta.alternarSecar', { nome }),
  ciente: (regra: string) => t('alertas.cienteAria', { regra }),
};

function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View style={estilos.bloco}>
      <Texto uso="rotulo" cor="textoSuave" titulo style={estilos.blocoTitulo}>
        {titulo}
      </Texto>
      {children}
    </View>
  );
}

// ---------------------------------------------------------------------------------------------

function Cores() {
  const { cores } = useTema();
  const papeis = Object.keys(cores) as PapelCor[];
  return (
    <Bloco titulo={g.secoes.cores}>
      <Folha>
        {papeis.map((p, i) => (
          <View key={p}>
            {i > 0 ? <Divisoria /> : null}
            <View style={estilos.linhaCor}>
              <View style={[estilos.amostraCor, { backgroundColor: cores[p], borderColor: cores.texto }]} />
              <View style={estilos.encolhe}>
                <Texto uso="linhaNome">{p}</Texto>
                <Texto uso="secundario" cor="textoSuave">
                  {cores[p]}
                </Texto>
                <Texto uso="secundario" cor="textoSuave">
                  {formatar(g.contraste, { frente: p, fundo: 'fundo', valor: decimal(contraste(cores[p], cores.fundo)) })}
                </Texto>
              </View>
            </View>
          </View>
        ))}
      </Folha>
    </Bloco>
  );
}

function Tipografia() {
  const usos = Object.keys(tokens.tipografia.escala) as UsoTexto[];
  return (
    <Bloco titulo={g.secoes.tipografia}>
      {usos.map((u) => (
        <View key={u} style={estilos.amostraTexto}>
          <Texto uso="secundario" cor="textoSuave">
            {u}
          </Texto>
          <Texto uso={u}>{g.amostra}</Texto>
        </View>
      ))}
    </Bloco>
  );
}

function Icones() {
  const { fator } = useTema();
  return (
    <Bloco titulo={g.secoes.icones}>
      <Folha style={estilos.grade}>
        {ORDEM_ICONES.map((nome) => (
          <View key={nome} style={[estilos.celula, { width: 104 * fator }]} accessible accessibilityLabel={nome}>
            <View style={estilos.icones}>
              <Icone nome={nome} />
              {temAtivo(nome) ? <Icone nome={nome} ativo /> : null}
            </View>
            <Texto uso="secundario" cor="textoSuave" semLeitura>
              {nome}
            </Texto>
          </View>
        ))}
      </Folha>
    </Bloco>
  );
}

function SecaoRota() {
  const [atual, setAtual] = useState<'preparar' | 'carregar' | 'camping' | 'volta' | 'casa'>('carregar');
  return (
    <Bloco titulo={g.secoes.rota}>
      <Rota atual={atual} aoEscolher={setAtual} />
      <Texto uso="secundario" cor="textoSuave" style={estilos.legendaExemplo}>
        {g.semMascote}
      </Texto>
      <Rota atual="volta" comMascote={false} />
      <Texto uso="secundario" cor="textoSuave" style={estilos.legendaExemplo}>
        {g.semParada}
      </Texto>
      <Rota atual={null} />
    </Bloco>
  );
}

function SecaoCabecalho() {
  return (
    <Bloco titulo={g.secoes.cabecalho}>
      <CabecalhoEtapa marca={marcaDaEtapa({ parada: 'carregar' })} titulo={ex.titulo} subtitulo={ex.subtitulo} aoVoltar={() => undefined} />
      <CabecalhoEtapa
        marca={marcaDaEtapa({ area: textos.areas.camping })}
        titulo={textos.legenda.alertas}
        subtitulo={ex.alertaAtencao}
        mascote="pose-alerta"
      />
    </Bloco>
  );
}

function SecaoBotoes() {
  const [ciente, setCiente] = useState(false);
  const [levo, setLevo] = useState(true);
  const [carro, setCarro] = useState(true);
  const [filtro, setFiltro] = useState(0);
  const [alt, setAlt] = useState<Record<string, boolean>>({ separei: true, carro: false, conferido: true, secar: false, ciente: false });
  return (
    <Bloco titulo={g.secoes.botoes}>
      <View style={estilos.linhaBotoes}>
        <Botao tipo="secundario" texto={ex.secundario} testID="g-secundario" />
        <Botao texto={ex.principal} testID="g-principal" />
      </View>
      <Texto uso="secundario" cor="textoSuave" style={estilos.legendaExemplo}>
        {g.estados.desativado}
      </Texto>
      <View style={estilos.linhaBotoes}>
        <Botao tipo="secundario" texto={ex.secundario} desativado />
        <Botao texto={ex.principal} desativado />
      </View>
      <Texto uso="secundario" cor="textoSuave" style={estilos.legendaExemplo}>
        {g.estados.pressao}
      </Texto>
      <View style={estilos.linhaQuebra}>
        <BotaoMarca texto={ex.marcaCiente} icone="ciente" ligado={ciente} aoTocar={() => setCiente(!ciente)} />
        <BotaoMarca texto={ex.marcaEuLevo} ligado={levo} alvo={tokens.alvo.medio} aoTocar={() => setLevo(!levo)} />
        <BotaoMarca texto={ex.marcaCarro} icone="carro" carro ligado={carro} aoTocar={() => setCarro(!carro)} />
        <BotaoMarca texto={ex.marcaCiente} ligado={false} desativado />
      </View>
      <View style={estilos.linhaQuebra}>
        {(['separei', 'carro', 'conferido', 'secar', 'ciente'] as const).map((i) => (
          <Alternancia key={i} icone={i} ligado={alt[i] ?? false} falado={FALADO_ALTERNANCIA[i](ex.item1)} aoTocar={() => setAlt({ ...alt, [i]: !alt[i] })} />
        ))}
        <Alternancia icone="carro" ligado={false} desativado falado={ex.marcaCarro} />
      </View>
      <View style={estilos.linhaQuebra}>
        {[ex.filtroTodos, ex.filtroFora, ex.filtroComprar].map((f, i) => (
          <Filtro key={f} texto={f} ligado={filtro === i} aoTocar={() => setFiltro(i)} />
        ))}
      </View>
      <View style={estilos.linhaQuebra}>
        <Discreto texto={ex.discreto} />
        <BotaoFechar />
      </View>
    </Bloco>
  );
}

function SecaoItem() {
  const [estados, setEstados] = useState<EstadoItem[]>(['aSeparar', 'separei', 'carro']);
  const [feito, setFeito] = useState(false);
  const nomes = [ex.item1, ex.item2, ex.item3];
  const qtds = [ex.item1Qtd, ex.item2Qtd, ex.item3Qtd];
  const noCarro = estados.filter((e) => e === 'carro').length;
  const todos = Object.keys(ESTADOS) as Estado[];
  return (
    <Bloco titulo={g.secoes.item}>
      <Regua feitos={noCarro} total={estados.length} />
      <Categoria nome={ex.categoria} feitos={noCarro} total={estados.length} testID="g-categoria">
        <Folha>
          {estados.map((e, i) => (
            <View key={i}>
              {i > 0 ? <Divisoria /> : null}
              <ItemLista
                testID={`g-item-${String(i)}`}
                nome={nomes[i] ?? ''}
                quantidade={qtds[i] ?? ''}
                estado={e}
                aoMudar={(novo) => setEstados(estados.map((x, j) => (j === i ? novo : x)))}
              />
            </View>
          ))}
        </Folha>
      </Categoria>
      <View style={estilos.espaco}>
        <FaixaTarefa tarefa={ex.tarefa} feito={feito} aoMudar={setFeito} />
      </View>
      <Regua feitos={2} total={5} volta />
      <Folha style={estilos.espaco}>
        {todos.map((e, i) => (
          <View key={e}>
            {i > 0 ? <Divisoria /> : null}
            <View style={estilos.linhaSimples}>
              <LinhaEstado estado={e} />
            </View>
          </View>
        ))}
      </Folha>
    </Bloco>
  );
}

function SecaoAlerta() {
  const [ciente, setCiente] = useState([false, true]);
  return (
    <Bloco titulo={g.secoes.alerta}>
      <GrupoDeAlertas nivel="atencao">
        <LinhaAlerta tipo="atencao" texto={ex.alertaAtencao} ciente={ciente[0]} aoMudarCiente={(c) => setCiente([c, ciente[1] ?? false])} testID="g-alerta-1" />
        <LinhaAlerta tipo="atencao" texto={ex.alertaAtencao2} ciente={ciente[1]} aoMudarCiente={(c) => setCiente([ciente[0] ?? false, c])} />
        <LinhaAlerta tipo="entrou" texto={ex.alertaEntrou} />
        <LinhaAlerta tipo="saiu" texto={ex.alertaSaiu} />
      </GrupoDeAlertas>
      <GrupoDeAlertas nivel="informacao">
        <LinhaAlerta tipo="regra" texto={ex.alertaRegra} ciente={false} />
        <LinhaAlerta tipo="informacao" texto={ex.alertaInfo} />
      </GrupoDeAlertas>
    </Bloco>
  );
}

function SecaoSelo() {
  return (
    <Bloco titulo={g.secoes.selo}>
      <Selo grande={ex.seloGrande} linha={ex.seloLinha} testID="g-selo" />
      <Folha style={estilos.espacoFolha}>
        <View style={estilos.linhaSimples}>
          <Selo grande={ex.seloGrande} linha={ex.seloLinha} naFolha />
        </View>
      </Folha>
      <View style={estilos.espaco}>
        <Selo grande={ex.seloGrande} linha={ex.seloLinha} largo />
      </View>
    </Bloco>
  );
}

function SecaoLegenda() {
  const [destino, setDestino] = useState<'alertas' | 'fato' | 'grupo' | 'gastos' | null>('grupo');
  return (
    <Bloco titulo={g.secoes.legenda}>
      <Texto uso="secundario" cor="textoSuave">
        {g.abrirLegenda}
      </Texto>
      <View style={estilos.espaco}>
        <Legenda fato={ex.fato} atual={destino} aoEscolher={setDestino} />
      </View>
    </Bloco>
  );
}

function SecaoRodape() {
  return (
    <Bloco titulo={g.secoes.rodape}>
      <View style={estilos.rodapeExemplo}>
        <Rodape
          testID="g-rodape"
          acoes={
            <>
              <Botao tipo="secundario" texto={ex.secundario} />
              <Botao texto={ex.principal} />
            </>
          }
          discreto={<Discreto texto={ex.discreto} />}
          legenda={<Legenda fato={ex.fato} aoEscolher={() => undefined} />}
        />
      </View>
    </Bloco>
  );
}

function SecaoCampos() {
  const [nome, setNome] = useState(ex.campoNomeValor);
  const [nota, setNota] = useState('');
  const [email, setEmail] = useState('');
  const [tipo, setTipo] = useState(0);
  const [adultos, setAdultos] = useState(2);
  const [pets, setPets] = useState(0);
  const [marcada, setMarcada] = useState(true);
  const [escolhido, setEscolhido] = useState(0);
  return (
    <Bloco titulo={g.secoes.campos}>
      <CampoTexto rotulo={ex.campoNome} valor={nome} aoMudar={setNome} testID="g-campo" />
      <CampoTexto rotulo={ex.campoNota} valor={nota} aoMudar={setNota} opcional longo />
      <CampoTexto rotulo={ex.campoEmail} valor={email} aoMudar={setEmail} tipo="email" erro={email ? null : ex.campoEmailErro} />
      <CampoTexto rotulo={ex.campoNome} valor={ex.campoNomeValor} desativado />
      <Opcoes rotulo={ex.opcaoBarraca}>
        {[ex.opcaoBarraca, ex.opcaoChale, ex.opcaoMotorhome].map((o, i) => (
          <Opcao key={o} texto={o} escolhida={tipo === i} aoTocar={() => setTipo(i)} />
        ))}
        <Opcao texto={ex.opcaoChale} escolhida={false} desativado />
      </Opcoes>
      <Folha style={estilos.espaco}>
        <Contador campo={ex.contadorAdultos} valor={adultos} minimo={1} aoMudar={setAdultos} testID="g-contador" />
        <Divisoria />
        <Contador campo={ex.contadorPets} valor={pets} aoMudar={setPets} />
      </Folha>
      <View style={estilos.espaco}>
        <CaixaMarcar texto={ex.caixaMarcar} marcada={marcada} aoMudar={setMarcada} />
        <CaixaMarcar texto={ex.caixaMarcar} marcada={false} desativado />
      </View>
      <Folha style={estilos.espaco}>
        <Resultado nome={ex.resultado1} detalhe={ex.resultado1Cidade} escolhido={escolhido === 0} aoTocar={() => setEscolhido(0)} />
        <Divisoria />
        <Resultado nome={ex.resultado2} detalhe={ex.resultado2Cidade} escolhido={escolhido === 1} aoTocar={() => setEscolhido(1)} />
      </Folha>
    </Bloco>
  );
}

function SecaoVazios() {
  const [erro, setErro] = useState(true);
  return (
    <Bloco titulo={g.secoes.vazios}>
      <Folha>
        <Vazio texto={ex.vazio} />
      </Folha>
      <Folha style={estilos.espaco}>
        <Vazio texto={ex.vazioFiltro} />
      </Folha>
      <Mensagem texto={ex.mensagem} />
      <View style={estilos.espaco}>
        {erro ? <MensagemErro mensagem={ex.erroCarregar} acao={ex.erroAcao} aoAgir={() => setErro(false)} testID="g-erro" /> : null}
      </View>
    </Bloco>
  );
}

function SecaoMascote() {
  const artes: NomeArte[] = ['principal', 'pose-alerta', 'pose-camping', 'pose-comemorando', 'icone'];
  const larguras: Record<NomeArte, number> = { principal: 176, 'pose-alerta': 96, 'pose-camping': 96, 'pose-comemorando': 96, icone: 32 };
  const [arte, setArte] = useState<NomeArte>('principal');
  return (
    <Bloco titulo={g.secoes.mascote}>
      <View style={estilos.linhaQuebra}>
        {artes.map((a) => (
          <Filtro key={a} texto={a} ligado={arte === a} aoTocar={() => setArte(a)} />
        ))}
      </View>
      <View style={estilos.espaco}>
        <Mascote arte={arte} largura={larguras[arte]} testID="g-mascote" />
      </View>
    </Bloco>
  );
}

const CONTEUDO: Record<Secao, () => ReactNode> = {
  cores: Cores,
  tipografia: Tipografia,
  icones: Icones,
  rota: SecaoRota,
  cabecalho: SecaoCabecalho,
  botoes: SecaoBotoes,
  item: SecaoItem,
  alerta: SecaoAlerta,
  selo: SecaoSelo,
  legenda: SecaoLegenda,
  rodape: SecaoRodape,
  campos: SecaoCampos,
  vazios: SecaoVazios,
  mascote: SecaoMascote,
};

// ---------------------------------------------------------------------------------------------

function Controles(props: {
  tema: NomeTema | null;
  setTema: (t: NomeTema | null) => void;
  letra: number;
  setLetra: (n: number) => void;
  secao: Secao;
  setSecao: (s: Secao) => void;
}) {
  return (
    <View>
      <CabecalhoEtapa marca={marcaDaEtapa({ parada: 'preparar' })} titulo={g.titulo} subtitulo={g.subtitulo} />
      <Texto uso="rotulo" cor="textoSuave" titulo style={estilos.blocoTitulo}>
        {g.tema}
      </Texto>
      <View style={estilos.linhaQuebra}>
        <Filtro texto={g.temaSistema} ligado={props.tema === null} aoTocar={() => props.setTema(null)} testID="g-tema-sistema" />
        <Filtro texto={g.temaClaro} ligado={props.tema === 'claro'} aoTocar={() => props.setTema('claro')} testID="g-tema-claro" />
        <Filtro texto={g.temaEscuro} ligado={props.tema === 'escuro'} aoTocar={() => props.setTema('escuro')} testID="g-tema-escuro" />
      </View>
      <Texto uso="rotulo" cor="textoSuave" titulo style={estilos.blocoTitulo}>
        {g.letra}
      </Texto>
      <View style={estilos.linhaQuebra}>
        <Filtro texto={g.letra100} ligado={props.letra === 1} aoTocar={() => props.setLetra(1)} testID="g-letra-100" />
        <Filtro texto={g.letra130} ligado={props.letra === 1.3} aoTocar={() => props.setLetra(1.3)} testID="g-letra-130" />
        <Filtro texto={g.letra200} ligado={props.letra === 2} aoTocar={() => props.setLetra(2)} testID="g-letra-200" />
      </View>
      <Texto uso="secundario" cor="textoSuave" style={estilos.legendaExemplo}>
        {g.letraAviso}
      </Texto>
      <Texto uso="rotulo" cor="textoSuave" titulo style={estilos.blocoTitulo}>
        {g.secao}
      </Texto>
      <View style={estilos.linhaQuebra}>
        {SECOES.map((s) => (
          <Filtro key={s} texto={g.secoes[s]} ligado={props.secao === s} aoTocar={() => props.setSecao(s)} testID={`g-secao-${s}`} />
        ))}
      </View>
    </View>
  );
}

export default function Galeria() {
  const [tema, setTema] = useState<NomeTema | null>(null);
  const [letra, setLetra] = useState(1);
  const [secao, setSecao] = useState<Secao>('botoes');
  const Conteudo = CONTEUDO[secao];
  return (
    <TemaProvedor forcar={tema} simulacao={letra}>
      <Tela testID="galeria">
        <Rota atual="preparar" comMascote={secao !== 'mascote' && secao !== 'cabecalho' && secao !== 'rota'} />
        <Controles tema={tema} setTema={setTema} letra={letra} setLetra={setLetra} secao={secao} setSecao={setSecao} />
        <View testID={`galeria-${secao}`}>
          <Conteudo />
        </View>
      </Tela>
    </TemaProvedor>
  );
}

const estilos = StyleSheet.create({
  encolhe: { flex: 1, minWidth: 0 },
  bloco: { marginTop: tokens.espaco.entreSecoes },
  blocoTitulo: { marginTop: 16, marginBottom: 8 },
  legendaExemplo: { marginTop: 12, marginBottom: 4 },
  linhaBotoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  linhaQuebra: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  linhaCor: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  amostraCor: { width: 44, height: 44, borderWidth: 1, borderRadius: tokens.raio },
  amostraTexto: { marginBottom: 12 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', padding: 8 },
  celula: { width: 104, alignItems: 'center', gap: 4, paddingVertical: 8 },
  icones: { flexDirection: 'row', gap: 8 },
  espaco: { marginTop: 16 },
  espacoFolha: { marginTop: 16 },
  linhaSimples: { minHeight: tokens.alvo.linha, justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 6 },
  rodapeExemplo: { marginHorizontal: -tokens.espaco.margemTela },
});

# Técnica 3D · Campinguim Por dentro

Como produzir os vídeos "por dentro" com ferramentas gratuitas, usando Remotion e three.js. Este arquivo detalha a seção 7 do `CLAUDE.md` da fábrica. As regras de fato, segurança e aprovação continuam valendo de lá.

**Objetivo desta rodada:** produzir o episódio 01 ("Barraca molhada sem chuva") com esta técnica e comparar, lado a lado, com o padrão do vídeo do Sol 4x4. Só adotamos se ficar melhor.

**Aviso ao agente:** este documento foi escrito a partir da documentação pública, sem rodar o projeto. Antes de usar qualquer API citada aqui, confira na documentação atual. Se algo divergir, vale a documentação, e a divergência é anotada no relatório.

## 1. Onde trabalhar

- Pasta nova e ramo novo. Nada do projeto do Sol 4x4 é alterado.
- Se existir `COMO-FOI-FEITO.md` do processo antigo, leia antes: o que já funciona lá (ritmo, enquadramento, textos de tela) é reaproveitado como referência de estilo, não como código.
- Mascote: ainda não foi escolhido. Use um boneco neutro provisório ou nenhum personagem. Nunca um pinguim improvisado.

## 2. A pilha, toda gratuita

| Camada | Ferramenta | Licença e custo | Para quê |
| --- | --- | --- | --- |
| Composição e render | Remotion 4 | Gratuito para pessoa física e para equipes de até 3 pessoas; acima disso, licença paga | Vídeo em React, renderizado quadro a quadro |
| 3D | three.js + React Three Fiber, via `@remotion/three` | MIT | Cena 3D sincronizada com o quadro do Remotion |
| Ajudantes 3D | `@react-three/drei` | MIT | Ambiente de luz, sombras de contato, carga de GLB, contornos |
| Efeitos de imagem | `@react-three/postprocessing` | MIT | Brilho seletivo, profundidade de campo, vinheta |
| Modelagem | Blender, também em modo sem tela por script Python | GPL; o que você cria é seu | Objetos com partes nomeadas, exportados em GLB |
| Limpeza de modelo | `gltf-transform` e `gltfjsx` | MIT | Reduzir peso e gerar componente React com cada parte acessível |
| Luz ambiente | HDRIs do Poly Haven | CC0 | Iluminação realista sem montar luzes à mão |
| Modelos prontos | Poly Haven, Kenney, Quaternius | CC0 | Cenário e objetos de apoio |
| Narração | Kokoro-82M, pacote Python `kokoro` | Apache 2.0 | Voz em português do Brasil, local, sem serviço pago |
| Tempos por palavra | Whisper.cpp, via `@remotion/install-whisper-cpp` | MIT | Transcreve o áudio e devolve o tempo de cada palavra |
| Legendas | `@remotion/captions` | Licença do Remotion | Legenda palavra por palavra |
| Fontes | Google Fonts, via `@remotion/google-fonts` | OFL | Tipografia carregada antes do render |
| Áudio final | ffmpeg (vem com o Remotion) | LGPL/GPL | Normalizar volume e exportar |
| Música e efeitos | Pixabay, Freesound com filtro CC0 | Conferir por arquivo | Trilha e efeitos curtos |

Regras de licença:

- Modelo do Sketchfab ou de outra biblioteca só entra com a licença do arquivo conferida. CC-BY exige crédito.
- Gerador de 3D por IA só entra com a licença de uso comercial conferida.
- Tudo o que entrar é anotado em `assets/LICENCAS.md`: arquivo, origem, licença, data.
- Remotion: conferir se quem publica é pessoa física ou equipe de até 3 pessoas.

## 3. Montagem do projeto

1. Criar o projeto a partir do modelo oficial com React Three Fiber (`npx create-video@latest`, opção de three.js; repositório `remotion-dev/template-three`).
2. Instalar as instruções oficiais do Remotion para agentes: `npx remotion skills add`. Ler as partes de 3D, legendas, áudio e fontes antes de escrever código.
3. Pacotes do Remotion sempre na mesma versão, sem `^` na frente do número.
4. Conferir que o arquivo de configuração define o renderizador gráfico como `angle`. Sem isso, a cena 3D pode sair vazia no render.
5. Composição: 1080 × 1920, 30 quadros por segundo. A duração vem do áudio da narração, nunca de um número fixo.

## 4. Regras do 3D dentro do Remotion

Estas regras evitam os defeitos mais comuns: imagem piscando, quadro em branco e animação que não se repete igual.

1. A cena fica dentro de `<ThreeCanvas>`, sempre com `width` e `height`.
2. Toda animação é função de `useCurrentFrame()`. É proibido `useFrame()`, relógio, `Date.now()`, `Math.random()` e qualquer coisa que ande sozinha.
3. Aleatoriedade só com semente: use `random('semente')` do Remotion.
4. `<Sequence>` dentro do canvas leva `layout="none"`.
5. Ajudantes do drei que animam sozinhos (flutuação, rotação automática, brilhos animados) não entram. Refaça o movimento com o número do quadro.
6. Efeitos que dependem do quadro anterior (suavização temporal, reflexos acumulados, rastro) não entram: no render os quadros saem fora de ordem e em paralelo.
7. Arquivos (GLB, HDRI, áudio, fontes) ficam em `public/` e são lidos com `staticFile()`. O render precisa esperar a carga terminar; siga o que a instrução oficial do Remotion diz sobre isso.
8. Texto de tela não é 3D. Selo, etiqueta, painel, rótulo e legenda são HTML em uma camada por cima do canvas: ficam nítidos e fáceis de ajustar.

Esqueleto de uma cena:

```tsx
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

export const Cena: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();

  // 0 = objeto opaco, 1 = raio-x completo
  const raioX = interpolate(frame, [8 * fps, 9.5 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height}>
        <Camera frame={frame} />
        <Luz />
        <Barraca raioX={raioX} destaque="sobreteto" />
      </ThreeCanvas>
      <AbsoluteFill>{/* selo, etiqueta, rótulo, legenda */}</AbsoluteFill>
    </AbsoluteFill>
  );
};
```

## 5. A câmera

- Uma função pura `camera(frame)` devolve posição, alvo e abertura. O componente `<Camera>` aplica esse resultado na câmera da cena a cada quadro.
- A mesma função é usada pela camada de HTML para projetar um ponto 3D na tela. É assim que o rótulo com linha aponta a peça certa sem ajuste manual.
- Movimento sempre contínuo e com aceleração suave (`Easing` ou `spring`). Nada de corte seco dentro de um capítulo; o corte acontece na troca de capítulo.
- Lente fechada (abertura entre 25 e 40 graus) dá aparência de produto. Lente muito aberta distorce e parece jogo.
- Um foco de atenção por plano. Se dois elementos disputam o olhar, o plano é dividido em dois.

## 6. O efeito "por dentro"

É o que define a série. Fica em um único componente reutilizável, com cinco recursos que se combinam.

| Recurso | Como fazer | Quando usar |
| --- | --- | --- |
| Casca translúcida | Material da casca externa com opacidade baixa, sem gravar profundidade, e contornos desenhados nas arestas | Mostrar o que há dentro sem perder a forma do objeto |
| Corte | Planos de corte do three.js (`clippingPlanes`, com corte local ligado no renderizador), movidos pelo quadro | Abrir o objeto ao meio, como uma maquete |
| Vista explodida | Cada parte se afasta do centro ao longo de um eixo, com `interpolate` | Mostrar camadas: sobreteto, quarto, piso |
| Destaque | A peça que importa recebe cor emissiva e brilho; o resto perde saturação e escurece um pouco | Sempre, uma peça por plano |
| Fluxo | Pequenas esferas ou setas em malha instanciada, percorrendo uma curva; posição calculada pelo quadro | Ar, água, calor, corrente elétrica |

Regras:

- O parâmetro `raioX` vai de 0 a 1 e controla tudo junto, para a transição ser uma só.
- A cor de destaque é uma por episódio, a mesma do selo.
- O fluxo tem que ser fisicamente coerente com o roteiro: ar quente sobe, água escorre para baixo. Se o roteiro não diz o sentido, perguntar.

## 7. O que faz a imagem parecer profissional

Em ordem de retorno pelo esforço:

1. **Luz ambiente por HDRI.** Um HDRI de estúdio ou de fim de tarde, mais uma luz direcional para a sombra. Resolve a maior parte da aparência "de computador".
2. **Sombra de contato suave** sob os objetos. Objeto sem sombra parece flutuar.
3. **Mapeamento de tons ACES e saída em sRGB**, definidos uma vez no canvas.
4. **Materiais físicos coerentes:** tecido fosco, metal com reflexo, plástico meio brilhante. Rugosidade e metal definidos por material, não tudo igual.
5. **Fundo com profundidade:** degradê escuro com leve vinheta, nunca cor chapada pura.
6. **Brilho seletivo** só na peça em destaque, com limiar alto para não lavar a cena.
7. **Profundidade de campo leve**, só em planos fechados.
8. **Bordas arredondadas** nos objetos feitos em código. Aresta viva perfeita denuncia o 3D amador.
9. **Suavização de serrilhado:** renderizar com mais amostras ou em escala maior e reduzir.

Teste cada efeito de imagem em quadro parado antes de confiar nele no vídeo: se o quadro parado sair diferente a cada render, o efeito sai.

## 8. Modelos 3D

- Objeto simples (barraca, cooler, lanterna, botijão) pode ser construído em código com formas básicas. É rápido de ajustar e cada parte já nasce nomeada.
- Objeto complexo é feito no Blender. O agente pode rodar o Blender sem tela, por script Python, e exportar o GLB.
- Toda parte que um rótulo aponta tem nome estável, no padrão `objeto.parte` (`barraca.sobreteto`, `barraca.ventilacao`). A lista fica em `assets/objetos/PARTES.md`.
- Antes de usar, passar o GLB pelo `gltf-transform` (reduzir malha e texturas) e pelo `gltfjsx` (gerar o componente React).
- Meta de peso: cada quadro renderiza em poucos segundos no computador local. Se demorar, simplifique o modelo antes de mexer na qualidade.
- Escala real em metros. Uma barraca de 2 metros mede 2 unidades. Isso mantém luz, sombra e câmera coerentes entre episódios.

## 9. Voz, tempos e legenda

A voz é gerada primeiro e manda no tempo de tudo.

1. **Narração.** Duas opções gratuitas:
   - Voz própria gravada no celular, em ambiente silencioso. É a opção com mais personalidade e sem custo.
   - Kokoro local, em português do Brasil. Vozes: `pf_dora` (feminina), `pm_alex` e `pm_santa` (masculinas). Roda pelo pacote Python `kokoro`; confira no repositório oficial os requisitos de instalação no Windows.
2. **Tempos por palavra.** Passar o áudio final pelo Whisper.cpp com tempos por palavra e converter para o formato do `@remotion/captions`. Serve igual para voz gravada e voz sintética.
3. **Correção.** O Whisper erra palavras como "Campinguim". O texto da legenda vem de `narracao.txt`; do Whisper se aproveitam só os tempos. Um script alinha os dois e acusa diferença.
4. **Linha do tempo.** Um único arquivo `tempos.json` por episódio guarda início e fim de cada palavra e de cada capítulo. Câmera, rótulos, painel, legenda e efeitos sonoros leem esse arquivo. Nenhum tempo é escrito à mão em outro lugar.
5. **Legenda.** Duas a quatro palavras por vez, com a palavra falada em destaque, na faixa central inferior, fora da área coberta pela interface do Instagram.

Pronúncia: se a voz sintética errar um termo, corrija com grafia fonética só no texto enviado à voz, nunca no texto da legenda.

## 10. Som

- Narração em primeiro plano. Música bem abaixo, baixando mais durante a fala.
- Um efeito curto na entrada de cada etiqueta e de cada rótulo, e um mais marcado na virada para o raio-x.
- Volume final normalizado com ffmpeg, com o mesmo alvo em todos os episódios.
- Silêncio de meio segundo no fim, para o vídeo não cortar a última sílaba.

## 11. Render

Sequência obrigatória, do barato para o caro:

1. **Quadros parados:** um por capítulo, mais o gancho e a chamada final. Comando `npx remotion still`, com o renderizador `angle`.
2. **Folha de conferência:** todos os quadros lado a lado em uma imagem. O QA aprova a folha antes de qualquer vídeo.
3. **Vídeo em baixa:** metade da resolução, para conferir ritmo e sincronia.
4. **Vídeo final:** 1080 × 1920, 30 quadros por segundo, H.264, qualidade alta, áudio AAC.

Se um quadro sair em branco ou diferente entre dois renders iguais, o defeito é de regra da seção 4. Corrija a causa; não aumente tempo de espera para esconder o problema.

## 12. Comparação com o padrão do Sol 4x4

O teste só vale se for justo.

- Mesmo roteiro (episódio 01), mesma duração, mesma voz se possível.
- Os dois vídeos são mostrados ao responsável sem dizer qual é qual.
- Critérios, com nota de 1 a 5 para cada vídeo:

| Critério | O que observar |
| --- | --- |
| Gancho | Os 2 primeiros segundos prendem? O título lê de relance? |
| Clareza | Dá para entender o conceito sem som? |
| Acabamento 3D | Luz, sombra, materiais, bordas, serrilhado |
| Movimento | Câmera suave, sem tremor nem salto |
| Texto de tela | Nitidez, tamanho no celular, nada cortado |
| Sincronia | Legenda e rótulos na palavra certa |
| Som | Voz clara, música no lugar, efeitos discretos |
| Custo de produção | Tempo de agente e de máquina por episódio |
| Repetição | Trocar o roteiro gera outro episódio sem refazer a base? |

O relatório final traz as notas, o tempo gasto em cada etapa, o tempo de render e três quadros de cada vídeo lado a lado. A decisão é do responsável.

## 13. Prova de um dia, antes do episódio inteiro

Antes de investir no episódio 01 completo, provar cinco coisas em uma cena de 5 segundos:

1. Um objeto em código, com luz por HDRI e sombra de contato, renderiza igual duas vezes seguidas.
2. A transição de raio-x funciona, com destaque e brilho só na peça certa.
3. Um rótulo em HTML acompanha a peça enquanto a câmera se move.
4. Uma frase narrada gera tempos por palavra, e a legenda acompanha.
5. O render final sai em 1080 × 1920 com áudio, sem quadro em branco.

Falhou algum item, pare e relate antes de continuar.

## 14. Entrega ao QA

- Folha de quadros e vídeo final.
- `tempos.json`, `narracao.txt` e `fontes.md` do episódio.
- `assets/LICENCAS.md` atualizado.
- Relatório curto: o que seguiu este documento, o que precisou mudar por causa da documentação atual, tempo por etapa e problemas encontrados.

## 15. O que este documento não decide

| Ponto | Quem decide |
| --- | --- |
| Voz gravada ou sintética, e qual voz | Responsável, ouvindo amostras |
| Música | Responsável |
| Cor de destaque e tipografia definitivas | Saem da identidade escolhida; até lá, valores provisórios de `marca/tokens.json` |
| Mascote nos vídeos | Depende do pacote 3D do mascote escolhido |
| Adotar ou não esta técnica | Responsável, depois da comparação da seção 12 |

import React, {useEffect, useMemo, useState} from 'react';
import {useThree} from '@react-three/fiber';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';
import * as THREE from 'three';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

// Mascote 03 (Filhote de gorro), GLB aprovado: design/mascote/3d/campinguim.glb, copiado para public/modelos/.
// Nomes, clipes, alvos e âncoras: design/mascote/3d/PARTES.md. Altura 0,40 m, de frente para +Z, origem no chão.
export const ARQUIVO_GLB = 'modelos/campinguim.glb';
export const FPS_CLIPES = 30;
const SUBIDA_GORRO = 0.025; // metros que o gorro sobe no "por dentro" (vista explodida)

/** acha um nó pelo nome que está no GLB, com ponto (PARTES.md, seção 8: o GLTFLoader tira o ponto de object.name) */
export const peca = (raiz: THREE.Object3D, nome: string): THREE.Object3D | undefined => {
  let achado: THREE.Object3D | undefined;
  raiz.traverse((o) => {
    if (!achado && (o.userData.name === nome || o.name === nome)) achado = o;
  });
  return achado;
};

/** todas as malhas de uma peça (o corpo é um grupo com duas malhas) */
export const malhasDe = (raiz: THREE.Object3D, nome: string): THREE.Mesh[] => {
  const out: THREE.Mesh[] = [];
  peca(raiz, nome)?.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) out.push(o as THREE.Mesh);
  });
  return out;
};

/**
 * Carrega o GLB uma vez. A espera (delayRender) NÃO é liberada na carga: quem libera é <MascoteDesenhado/>, dentro do
 * canvas, depois que o mascote entrou na cena e o quadro foi desenhado com ele. Liberar na carga (como na rodada 1)
 * deixava o Remotion fotografar o canvas antes do próximo desenho do R3F: o @remotion/three só redesenha quando o
 * número do quadro muda, e a primeira foto de uma aba do render paralelo podia sair sem o mascote (quadro 3 do final).
 */
export const useCampinguim = () => {
  const [h] = useState(() => delayRender('campinguim.glb carregado e desenhado'));
  const [gltf, setGltf] = useState<GLTF | null>(null);
  useEffect(() => {
    new GLTFLoader()
      .loadAsync(staticFile(ARQUIVO_GLB))
      .then((g) => setGltf(g))
      .catch((e) => cancelRender(e));
  }, [h]);
  return {gltf, espera: h};
};

/**
 * Fica dentro do <ThreeCanvas>. Quando o mascote já está na cena (pronto), desenha o quadro com ele (advance, o mesmo
 * que o @remotion/three usa) e só então libera a espera. Os efeitos dos filhos rodam depois do commit: o <primitive>
 * com a pose do quadro já está na cena.
 */
export const MascoteDesenhado: React.FC<{pronto: boolean; espera: number}> = ({pronto, espera}) => {
  const {advance} = useThree();
  const [liberado, setLiberado] = useState(false);
  useEffect(() => {
    if (!pronto || liberado) return;
    advance(performance.now());
    setLiberado(true);
    continueRender(espera);
  }, [pronto, liberado, advance, espera]);
  return null;
};

export type Pose = {
  /** clipe tocando e o tempo dele em segundos (já resolvido por tempoCiclo/tempoPontual) */
  clipe: string;
  tempo: number;
  /** pesos das expressões, somando no máximo 1 (PARTES.md, seção 5) */
  expressoes: Record<string, number>;
  /** 0 = opaco, 1 = "por dentro" completo no gorro */
  raioX: number;
  /** cor do destaque do episódio */
  destaque: string;
};

/** pesa as expressões em todas as malhas que têm o alvo (neutro = todos 0) */
const aplicarExpressoes = (raiz: THREE.Object3D, pesos: Record<string, number>) => {
  raiz.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || !m.morphTargetDictionary || !m.morphTargetInfluences) return;
    for (const [n, i] of Object.entries(m.morphTargetDictionary)) m.morphTargetInfluences[i] = pesos[n] ?? 0;
  });
};

/**
 * Material do gorro no "por dentro": casca translúcida com contorno de espessura feito no próprio material
 * (borda por Fresnel: quanto mais de lado a superfície, mais opaca e mais na cor do destaque). Não usa linha de 1 px:
 * a borda tem a largura da curvatura do gorro na tela, desenhada com a mesma malha (pele e alvos de forma incluídos).
 */
const materialGorro = (base: THREE.MeshStandardMaterial) => {
  const mat = base.clone();
  const u = {uRaio: {value: 0}, uCorBorda: {value: new THREE.Color()}};
  mat.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, u);
    s.fragmentShader = s.fragmentShader
      .replace('void main() {', 'uniform float uRaio;\nuniform vec3 uCorBorda;\nvoid main() {')
      .replace(
        '#include <opaque_fragment>',
        `#include <opaque_fragment>
        float borda = pow(1.0 - clamp(abs(dot(normal, normalize(vViewPosition))), 0.0, 1.0), 2.2);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, uCorBorda, clamp(borda * 1.6, 0.0, 1.0) * uRaio);
        gl_FragColor.a = mix(gl_FragColor.a, 1.0, clamp(borda * 1.8, 0.0, 1.0) * uRaio);`,
      );
  };
  mat.customProgramCacheKey = () => 'campinguim-gorro-por-dentro';
  return {mat, u};
};

/**
 * Mascote posado como função pura do quadro: um mixer, uma ação só tocando, mixer.setTime(tempo).
 * Devolve o grupo pronto para <primitive> e a posição de mundo das âncoras (depois do setTime).
 */
export const useMascotePosado = (gltf: GLTF | null) => {
  const montagem = useMemo(() => {
    if (!gltf) return null;
    const raiz = new THREE.Group();
    raiz.name = 'mascote';
    raiz.add(gltf.scene);
    const mixer = new THREE.AnimationMixer(gltf.scene);
    const acoes = new Map<string, THREE.AnimationAction>();
    for (const clip of gltf.animations) {
      // LoopOnce + trava: o tempo é sempre dado inteiro por tempoCiclo/tempoPontual; sem isso o último quadro de um
      // ciclo (tempo = duração do clipe) voltaria para o quadro 0 pelo LoopRepeat
      const a = mixer.clipAction(clip).setLoop(THREE.LoopOnce, 1);
      a.clampWhenFinished = true;
      acoes.set(clip.name, a);
    }
    // materiais: guarda a cor original de cada um (o "por dentro" recalcula a partir dela em todo quadro)
    const materiais = new Set<THREE.MeshStandardMaterial>();
    gltf.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) materiais.add(m.material as THREE.MeshStandardMaterial);
    });
    const corOriginal = new Map([...materiais].map((m) => [m, m.color.clone()]));
    const gorros = malhasDe(gltf.scene, 'campinguim.gorro');
    const {mat: gorroMat, u: gorroU} = materialGorro(gorros[0].material as THREE.MeshStandardMaterial);
    gorros.forEach((g) => {
      g.material = gorroMat;
      g.renderOrder = 10; // ordem fixa: a casca translúcida é sempre a última a ser desenhada
    });
    // peças só escondidas nesta expressão (PARTES.md, seção 8): boca e gotas. Olhos e bico estão em uso no alegre.
    const escondidas = [...malhasDe(gltf.scene, 'campinguim.boca'), ...malhasDe(gltf.scene, 'campinguim.gotas')];
    return {
      raiz, mixer, acoes, materiais, corOriginal, gorroMat, gorroU, escondidas,
      osso: gltf.scene.getObjectByName('gorro') as THREE.Bone,
      ancora: peca(gltf.scene, 'campinguim.ancora-rotulo'),
      mao: peca(gltf.scene, 'campinguim.ancora-mao'),
    };
  }, [gltf]);

  return (pose: Pose, colocar: (g: THREE.Group) => void) => {
    if (!montagem || !gltf) return null;
    const {raiz, mixer, acoes, materiais, corOriginal, gorroMat, gorroU, escondidas, osso} = montagem;
    const clip = THREE.AnimationClip.findByName(gltf.animations, pose.clipe);
    if (!clip) throw new Error(`clipe ausente no GLB: ${pose.clipe}`);
    acoes.forEach((a, nome) => {
      if (nome === pose.clipe) a.reset().play();
      else a.stop();
    });
    mixer.setTime(pose.tempo);
    aplicarExpressoes(gltf.scene, pose.expressoes);

    // "por dentro": o gorro sobe um pouco e vira casca translúcida com borda no destaque; o resto escurece e desatura de leve.
    // Com r = 0 tudo volta ao original (cor, gorro opaco e no lugar, peças escondidas de volta)
    const r = pose.raioX;
    osso.position.y += SUBIDA_GORRO * r; // o clipe regrava a posição do osso a cada setTime
    const destaque = new THREE.Color(pose.destaque);
    const cinza = new THREE.Color();
    for (const m of materiais) {
      const c0 = corOriginal.get(m)!;
      if (m === gorroMat) continue;
      const l = c0.r * 0.2126 + c0.g * 0.7152 + c0.b * 0.0722;
      cinza.setRGB(l, l, l);
      // no máximo 25% menos saturação e 15% menos brilho (QA, rodada 1): o resto recua sem perder a cor do desenho
      m.color.copy(c0).lerp(cinza, 0.25 * r).multiplyScalar(1 - 0.15 * r);
    }
    const translucido = r > 0.001;
    const lado = translucido ? THREE.FrontSide : THREE.DoubleSide;
    // transparent e side entram na chave do programa do three: ao trocar, o material precisa recompilar
    if (gorroMat.transparent !== translucido || gorroMat.side !== lado) gorroMat.needsUpdate = true;
    gorroMat.transparent = translucido;
    gorroMat.side = lado;
    gorroMat.opacity = 1 - 0.7 * r;
    gorroMat.depthWrite = !translucido;
    gorroMat.emissive.copy(destaque);
    gorroMat.emissiveIntensity = 0.55 * r;
    gorroU.uRaio.value = r;
    gorroU.uCorBorda.value.copy(destaque);
    escondidas.forEach((m) => (m.visible = r <= 0.001));

    colocar(raiz);
    raiz.updateMatrixWorld(true);
    const p = new THREE.Vector3();
    const m = new THREE.Vector3();
    montagem.ancora?.getWorldPosition(p);
    montagem.mao?.getWorldPosition(m);
    return {raiz, ancora: p.toArray() as [number, number, number], mao: m.toArray() as [number, number, number]};
  };
};

/** tempo de um ciclo no quadro k: (k % N) / 30 (PARTES.md, seção 6) */
export const tempoCiclo = (k: number, quadrosDoClipe: number) => (((k % quadrosDoClipe) + quadrosDoClipe) % quadrosDoClipe) / FPS_CLIPES;
/** tempo de um clipe pontual que começa no quadro ini; trava no primeiro e no último quadro */
export const tempoPontual = (k: number, ini: number, quadrosDoClipe: number) =>
  Math.min(Math.max(k - ini, 0), quadrosDoClipe - 1) / FPS_CLIPES;

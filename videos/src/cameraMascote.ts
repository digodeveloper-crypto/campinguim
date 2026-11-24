import {Easing, interpolate} from 'remotion';
import * as THREE from 'three';
import {ALTURA, LARGURA, Cam, aplicar} from './camera';

// Plano com o mascote (0,40 m de altura). Mesma regra de camera.ts: tudo é função pura do quadro,
// e a câmera é a mesma para a cena 3D e para a camada HTML do rótulo.

/** linha do tempo do plano, em quadros (30 fps); a fala começa em ATRASO_VOZ = 0,2 s */
export const LINHA = {
  acenarIni: 6, // acenar (60 quadros) sai do repouso, que é o quadro 0 de parado-respirando
  acenarQuadros: 60,
  respirarQuadros: 60,
  alegre: [4, 16] as [number, number], // neutro -> alegre enquanto a nadadeira sobe
  raioX: [2.1, 3.0] as [number, number], // segundos: abre na fala "o camping por dentro"
  volta: [3.8, 4.3] as [number, number], // segundos: fecha no silêncio do fim; o vídeo termina com o mascote igual ao desenho
  rotulo: [2.7, 3.1] as [number, number], // segundos: o rótulo entra quando o gorro já está aberto
};

/** raioX (0..1) controla o "por dentro" inteiro: casca do gorro, subida, destaque e escurecimento do resto */
export const raioXMascote = (frame: number, fps: number) => {
  const opcoes = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)} as const;
  const abre = interpolate(frame, [LINHA.raioX[0] * fps, LINHA.raioX[1] * fps], [0, 1], opcoes);
  const fecha = interpolate(frame, [LINHA.volta[0] * fps, LINHA.volta[1] * fps], [0, 1], opcoes);
  return abre * (1 - fecha);
};

/** função pura da câmera: arco de três quartos pela esquerda do personagem (a nadadeira que acena) até quase de frente */
export const cameraMascote = (frame: number, fps: number): Cam => {
  const t = interpolate(frame, [0, 5 * fps], [0, 1], {easing: Easing.inOut(Easing.sin), extrapolateRight: 'clamp'});
  const az = interpolate(t, [0, 1], [0.6, 0.12]);
  const dist = interpolate(t, [0, 1], [2.0, 1.62]);
  const alt = interpolate(t, [0, 1], [0.5, 0.36]);
  return {
    pos: [Math.sin(az) * dist, alt, Math.cos(az) * dist],
    alvo: [0, 0.225, 0],
    fov: 30,
  };
};

/** projeta um ponto 3D (metros) em pixels do quadro, com a câmera do mascote */
export const projetarMascote = (p: [number, number, number], frame: number, fps: number): [number, number] => {
  const c = new THREE.PerspectiveCamera();
  aplicar(c, cameraMascote(frame, fps));
  const v = new THREE.Vector3(...p).project(c);
  return [((v.x + 1) / 2) * LARGURA, ((1 - v.y) / 2) * ALTURA];
};

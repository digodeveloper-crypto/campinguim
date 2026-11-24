import {Easing, interpolate} from 'remotion';
import * as THREE from 'three';

export const LARGURA = 1080;
export const ALTURA = 1920;

export type Cam = {pos: [number, number, number]; alvo: [number, number, number]; fov: number};

/** raioX (0..1) controla a transição inteira: opaco -> corte + casca translúcida + vista explodida */
export const raioXDe = (frame: number, fps: number) =>
  interpolate(frame, [1.1 * fps, 2.6 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

/** função pura da câmera: usada pela cena 3D e pela camada HTML do rótulo */
export const camera = (frame: number, fps: number): Cam => {
  const t = interpolate(frame, [0, 5 * fps], [0, 1], {easing: Easing.inOut(Easing.sin), extrapolateRight: 'clamp'});
  const az = interpolate(t, [0, 1], [-0.75, 0.15]);
  const dist = interpolate(t, [0, 1], [8.6, 6.0]);
  const alt = interpolate(t, [0, 1], [3.4, 2.1]);
  return {
    pos: [Math.sin(az) * dist, alt, Math.cos(az) * dist],
    alvo: [0, 1.25 + 0.1 * t, 0],
    fov: 36,
  };
};

export const aplicar = (c: THREE.PerspectiveCamera, cam: Cam) => {
  c.position.set(...cam.pos);
  c.lookAt(...cam.alvo);
  c.fov = cam.fov;
  c.aspect = LARGURA / ALTURA;
  c.updateProjectionMatrix();
  c.updateMatrixWorld(true);
};

/** projeta um ponto 3D (metros) em pixels do quadro, com a mesma câmera da cena */
export const projetar = (p: [number, number, number], frame: number, fps: number): [number, number] => {
  const c = new THREE.PerspectiveCamera();
  aplicar(c, camera(frame, fps));
  const v = new THREE.Vector3(...p).project(c);
  return [((v.x + 1) / 2) * LARGURA, ((1 - v.y) / 2) * ALTURA];
};
export const ATRASO_VOZ = 0.2; // segundos de respiro antes da fala

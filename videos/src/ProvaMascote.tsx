import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {COR} from './Barraca';
import {ALTURA, ATRASO_VOZ, LARGURA, aplicar} from './camera';
import {LINHA, cameraMascote, projetarMascote, raioXMascote} from './cameraMascote';
import {Legenda, Luz, useFonte} from './Prova';
import {MascoteDesenhado, Pose, tempoCiclo, tempoPontual, useCampinguim, useMascotePosado} from './Mascote';
import palavras from './mascote/palavras.json';
import textos from '../textos/textos_mascote.json';

const CameraM: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const {camera: c} = useThree();
  aplicar(c as THREE.PerspectiveCamera, cameraMascote(frame, fps));
  return null;
};

const SombraM: React.FC = () => {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d')!;
    const r = g.createRadialGradient(128, 128, 6, 128, 128, 128);
    r.addColorStop(0, 'rgba(0,0,0,0.8)');
    r.addColorStop(0.5, 'rgba(0,0,0,0.35)');
    r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0.01]} renderOrder={-1}>
      <planeGeometry args={[0.7, 0.6]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  );
};

/** pose do quadro: repouso -> acenar (alegre) -> parado-respirando, emendando nos quadros de repouso dos clipes */
const poseDe = (frame: number, raioX: number): Pose => {
  const {acenarIni, acenarQuadros, respirarQuadros, alegre} = LINHA;
  const fimAceno = acenarIni + acenarQuadros - 1; // último quadro do acenar = repouso = quadro 0 do respirar
  const clipe = frame <= fimAceno ? 'acenar' : 'parado-respirando';
  const tempo = clipe === 'acenar' ? tempoPontual(frame, acenarIni, acenarQuadros) : tempoCiclo(frame - fimAceno, respirarQuadros);
  const a = interpolate(frame, alegre, [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  return {clipe, tempo, expressoes: {alegre: a}, raioX, destaque: COR.destaque};
};

export const ProvaMascote: React.FC = () => {
  useFonte();
  const {gltf, espera} = useCampinguim();
  const posar = useMascotePosado(gltf);
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const raioX = raioXMascote(frame, fps);
  const posado = posar(poseDe(frame, raioX), () => {});

  // o rótulo prende na âncora campinguim.ancora-rotulo (filha do osso cabeca), lida depois do setTime do quadro,
  // e é projetado com a mesma cameraMascote(frame) da cena
  const [px, py] = posado ? projetarMascote(posado.ancora, frame, fps) : [0, 0];
  const entra = interpolate(t, LINHA.rotulo, [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const lado = 1;
  const caixaX = px + lado * 120;
  const caixaY = py - 170;

  return (
    <AbsoluteFill style={{backgroundColor: '#111827'}}>
      <ThreeCanvas
        width={LARGURA}
        height={ALTURA}
        camera={{fov: 30, near: 0.05, far: 20, position: [0, 0.5, 2]}}
        gl={{toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace, antialias: true}}
      >
        <color attach="background" args={['#111827']} />
        <CameraM frame={frame} fps={fps} />
        <Luz />
        <SombraM />
        {posado ? <primitive object={posado.raiz} /> : null}
        <MascoteDesenhado pronto={posado !== null} espera={espera} />
      </ThreeCanvas>

      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.65) 100%)'}} />

      <svg width={LARGURA} height={ALTURA} style={{position: 'absolute', inset: 0, opacity: entra}}>
        <circle cx={px} cy={py} r={14} fill="none" stroke={COR.destaque} strokeWidth={5} />
        <circle cx={px} cy={py} r={5} fill={COR.destaque} />
        <polyline
          points={`${px},${py} ${caixaX},${caixaY + 55} ${caixaX + lado * 20},${caixaY + 55}`}
          fill="none"
          stroke={COR.destaque}
          strokeWidth={4}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: caixaX,
          top: caixaY,
          opacity: entra,
          fontFamily: 'Inter',
          fontWeight: 700,
          fontSize: 44,
          color: '#06202b',
          background: COR.destaque,
          padding: '16px 28px',
          borderRadius: 18,
          whiteSpace: 'nowrap',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        }}
      >
        {textos.rotulo}
      </div>

      {/* grupos que fecham na frase: "Este é o Campinguim." / "Ele mostra o camping" / "por dentro." */}
      <Legenda t={t} ps={palavras} grupos={[4, 4, 2]} />

      <div
        style={{
          position: 'absolute',
          bottom: 120,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: 'Inter',
          fontWeight: 700,
          fontSize: 34,
          letterSpacing: 4,
          color: 'rgba(255,255,255,0.55)',
        }}
      >
        {textos.marca}
      </div>

      <Sequence from={Math.round(ATRASO_VOZ * fps)}>
        <Audio src={staticFile('audio/mascote/voz.wav')} />
      </Sequence>
    </AbsoluteFill>
  );
};

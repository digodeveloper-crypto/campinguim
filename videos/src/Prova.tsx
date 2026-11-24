import React, {useEffect, useMemo, useState} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  cancelRender,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import '@fontsource/inter/latin-800.css';
import '@fontsource/inter/latin-700.css';
import {Barraca, COR, levanteSobreteto, pontoTelhado} from './Barraca';
import {ALTURA, LARGURA, aplicar, camera, projetar, raioXDe} from './camera';
import {ATRASO_VOZ} from './camera';
import palavras from './palavras.json';
import textos from '../textos/textos.json';

const Camera: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const {camera: c} = useThree();
  aplicar(c as THREE.PerspectiveCamera, camera(frame, fps));
  return null;
};

export const Luz: React.FC = () => {
  const {gl, scene} = useThree();
  // ambiente de estúdio gerado em código (RoomEnvironment do three, PMREM): faz o papel do HDRI sem baixar arquivo
  const env = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    return tex;
  }, [gl]);
  scene.environment = env;
  scene.environmentIntensity = 0.3;
  return (
    <>
      <directionalLight position={[4, 6, 3]} intensity={2.4} color="#fff1e0" />
      <directionalLight position={[-5, 3, -4]} intensity={0.6} color="#7fb4ff" />
    </>
  );
};

const Cena: React.FC<{frame: number; fps: number; raioX: number}> = ({frame, fps, raioX}) => {
  const {gl} = useThree();
  gl.localClippingEnabled = true; // exigido pelos planos de corte locais
  // corte: remove a metade da frente (z > k) para ver dentro da barraca, como uma maquete
  const plano = useMemo(() => [new THREE.Plane(new THREE.Vector3(0, 0, -1), 5)], []);
  plano[0].constant = interpolate(raioX, [0, 1], [5, 0.05]);
  return (
    <>
      <color attach="background" args={['#111827']} />
      <Camera frame={frame} fps={fps} />
      <Luz />
      <Barraca raioX={raioX} frame={frame} fps={fps} plano={plano} />
    </>
  );
};

export const useFonte = () => {
  const [h] = useState(() => delayRender('fonte'));
  useEffect(() => {
    Promise.all([document.fonts.load('800 60px Inter'), document.fonts.load('700 60px Inter')])
      .then(() => continueRender(h))
      .catch((e) => cancelRender(e));
  }, [h]);
};

const GRUPO = 3;

export type Palavra = {w: string; s: number; e: number};

/** grupos: tamanho de cada grupo de palavras na tela (padrão: de GRUPO em GRUPO) */
export const Legenda: React.FC<{t: number; ps?: Palavra[]; grupos?: number[]}> = ({t, ps = palavras, grupos}) => {
  const ws = ps.map((p) => ({...p, s: Math.max(0, p.s) + ATRASO_VOZ, e: p.e + ATRASO_VOZ}));
  let atual = -1;
  ws.forEach((w, i) => {
    if (t >= w.s) atual = i;
  });
  if (atual < 0) return null;
  const inicios: number[] = [];
  for (let i = 0, k = 0; i < ws.length; i += grupos?.[k++] ?? GRUPO) inicios.push(i);
  const ini = Math.max(...inicios.filter((i) => i <= atual));
  const grupo = ws.slice(ini, inicios.find((i) => i > ini) ?? ws.length);
  if (t > grupo[grupo.length - 1].e + 0.35) return null;
  return (
    <div
      style={{
        position: 'absolute', left: 60, right: 60, top: 1450, textAlign: 'center',
        fontFamily: 'Inter', fontWeight: 800, fontSize: 84, lineHeight: 1.15, whiteSpace: 'pre',
        textShadow: '0 4px 18px rgba(0,0,0,0.75)',
      }}
    >
      {grupo.map((w, i) => {
        const idx = ini + i;
        const ativa = idx === atual && t <= w.e + 0.05;
        const falada = idx <= atual;
        // espaço comum (U+0020) entre palavras, a pontuação já vem colada na palavra; o destaque só muda a cor
        return (
          <React.Fragment key={i}>
            {i > 0 ? ' ' : ''}
            <span style={{color: ativa ? COR.destaque : falada ? '#FFFFFF' : 'rgba(255,255,255,0.45)'}}>{w.w}</span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const Prova: React.FC = () => {
  useFonte();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const raioX = raioXDe(frame, fps);

  // o rótulo prende na posição 3D da condensação (com o sobreteto já erguido) e a projeta com a câmera do quadro
  const [ax, ay, az] = pontoTelhado(-1, 0.55, -0.25);
  const [px, py] = projetar([ax, ay + levanteSobreteto(raioX), az], frame, fps);
  const entra = interpolate(t, [2.2, 2.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const lado = px > LARGURA / 2 ? -1 : 1;
  const caixaX = px + lado * 120;
  const caixaY = py - 150;

  return (
    <AbsoluteFill style={{backgroundColor: '#111827'}}>
      <ThreeCanvas
        width={LARGURA}
        height={ALTURA}
        camera={{fov: 36, near: 0.1, far: 60, position: [0, 3, 8]}}
        gl={{toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace, antialias: true}}
      >
        <Cena frame={frame} fps={fps} raioX={raioX} />
      </ThreeCanvas>

      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.65) 100%)'}} />

      <div style={{position: 'absolute', top: 110, left: 0, right: 0, textAlign: 'center', fontFamily: 'Inter', fontWeight: 800}}>
        <div style={{fontSize: 84, color: 'rgba(255,255,255,0.6)'}}>{textos.gancho1}</div>
        <div style={{fontSize: 98, color: '#FFFFFF'}}>{textos.gancho2}</div>
      </div>

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
          left: lado > 0 ? caixaX : undefined,
          right: lado < 0 ? LARGURA - caixaX : undefined,
          top: caixaY,
          opacity: entra,
          fontFamily: 'Inter',
          fontWeight: 700,
          fontSize: 44,
          color: '#06202b',
          background: COR.destaque,
          padding: '16px 28px',
          borderRadius: 18,
          maxWidth: 420,
          lineHeight: 1.15,
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        }}
      >
        {textos.rotulo}
      </div>

      <Legenda t={t} />

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
        <Audio src={staticFile('audio/voz.wav')} />
      </Sequence>
    </AbsoluteFill>
  );
};

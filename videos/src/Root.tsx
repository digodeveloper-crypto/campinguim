import React from 'react';
import {Composition} from 'remotion';
import {Prova} from './Prova';
import {ProvaMascote} from './ProvaMascote';
import falas from './falas.json';
import falasMascote from './mascote/falas.json';

export const FPS = 30;
import {ATRASO_VOZ} from './camera';
const PISO_S = 5; // a cena de prova tem 5 s; se a voz for maior, a duração cresce com ela

const quadrosDe = (fs: {fim: number}[]) => Math.max(PISO_S * FPS, Math.ceil((ATRASO_VOZ + fs[fs.length - 1].fim + 0.5) * FPS));

export const Root: React.FC = () => {
  const frames = quadrosDe(falas);
  return (
    <>
      <Composition id="Prova" component={Prova} width={1080} height={1920} fps={FPS} durationInFrames={frames} />
      <Composition id="ProvaMascote" component={ProvaMascote} width={1080} height={1920} fps={FPS} durationInFrames={quadrosDe(falasMascote)} />
    </>
  );
};

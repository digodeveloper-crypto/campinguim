// Archivo em arquivos fixos por largura e peso (assets/fontes/archivo/LEIA-ME.md). O React Native no
// Android não aplica os eixos da fonte variável; cada combinação da escala é uma família própria.
import l100p400 from '../../assets/fontes/archivo/Archivo-L100-P400.ttf';
import l100p500 from '../../assets/fontes/archivo/Archivo-L100-P500.ttf';
import l100p600 from '../../assets/fontes/archivo/Archivo-L100-P600.ttf';
import l100p700 from '../../assets/fontes/archivo/Archivo-L100-P700.ttf';
import l100p800 from '../../assets/fontes/archivo/Archivo-L100-P800.ttf';
import l112p600 from '../../assets/fontes/archivo/Archivo-L112-P600.ttf';
import l112p700 from '../../assets/fontes/archivo/Archivo-L112-P700.ttf';
import l125p600 from '../../assets/fontes/archivo/Archivo-L125-P600.ttf';
import l125p700 from '../../assets/fontes/archivo/Archivo-L125-P700.ttf';
import l125p800 from '../../assets/fontes/archivo/Archivo-L125-P800.ttf';
import l85p500 from '../../assets/fontes/archivo/Archivo-L85-P500.ttf';
import l85p700 from '../../assets/fontes/archivo/Archivo-L85-P700.ttf';

import { nomeDaFamilia } from './familias';

/** Mapa para o `useFonts` do expo-font: nome da família → arquivo. */
export const FONTES = {
  [nomeDaFamilia(100, 400)]: l100p400,
  [nomeDaFamilia(100, 500)]: l100p500,
  [nomeDaFamilia(100, 600)]: l100p600,
  [nomeDaFamilia(100, 700)]: l100p700,
  [nomeDaFamilia(100, 800)]: l100p800,
  [nomeDaFamilia(112.5, 600)]: l112p600,
  [nomeDaFamilia(112.5, 700)]: l112p700,
  [nomeDaFamilia(125, 600)]: l125p600,
  [nomeDaFamilia(125, 700)]: l125p700,
  [nomeDaFamilia(125, 800)]: l125p800,
  [nomeDaFamilia(85, 500)]: l85p500,
  [nomeDaFamilia(85, 700)]: l85p700,
};

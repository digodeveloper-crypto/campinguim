import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './estilos.css';
import { Site } from './site/Site';
import { textos } from './textos';

document.title = textos.site.tituloDaAba;

const raiz = document.getElementById('raiz');
if (!raiz) throw new Error('falta o elemento #raiz em index.html');

createRoot(raiz).render(
  <StrictMode>
    <Site />
  </StrictMode>,
);

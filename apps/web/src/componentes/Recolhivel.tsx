// Categoria recolhível (tela 4 e 15 do protótipo; DESIGN.md 7.3): um botão com `aria-expanded` abre
// e fecha a folha de linhas. Começa fechada, como na tela 15.
import { type ReactNode, useId, useState } from 'react';

import { Icone } from './Icone';

export function Recolhivel({ cabeca, children, aberto = false }: { cabeca: ReactNode; children: ReactNode; aberto?: boolean }) {
  const [abrir, setAbrir] = useState(aberto);
  const id = useId();
  return (
    <section className={`cat${abrir ? ' cat--aberta' : ''}`}>
      <h3 className="cat-titulo">
        <button type="button" className="cat-botao" aria-expanded={abrir} aria-controls={id} onClick={() => setAbrir(!abrir)}>
          <span className="cat-cabeca">{cabeca}</span>
          <Icone nome="baixo" />
        </button>
      </h3>
      <div id={id} hidden={!abrir}>
        {children}
      </div>
    </section>
  );
}

// Régua de seções fixa no topo (DESIGN.md 7.1 e 11.3: a rota vira uma régua de seções nas páginas
// da internet). A seção que está na tela fica sublinhada com 2 px e anunciada (`aria-current`).
import { useEffect, useState } from 'react';

export type SecaoDaRegua = { id: string; rotulo: string };

export function ReguaWeb({ rotulo, secoes }: { rotulo: string; secoes: readonly SecaoDaRegua[] }) {
  const [atual, setAtual] = useState(secoes[0]?.id ?? '');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) if (e.isIntersecting) setAtual(e.target.id);
      },
      { rootMargin: '-20% 0px -60% 0px' },
    );
    for (const s of secoes) {
      const el = document.getElementById(s.id);
      if (el) observador.observe(el);
    }
    return () => observador.disconnect();
  }, [secoes]);

  return (
    <nav className="regua-web" aria-label={rotulo}>
      <ol>
        {secoes.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} aria-current={s.id === atual ? 'true' : undefined} onClick={() => setAtual(s.id)}>
              {s.rotulo}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

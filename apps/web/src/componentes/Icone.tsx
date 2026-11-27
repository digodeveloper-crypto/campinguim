// Ícones do Rumo usados no site, com os mesmos desenhos de design/prototipos/rumo/icones.js (grade de
// 24, traço de 1,5 px, pontas retas; DESIGN.md, seção 6). Sempre decorativos: o texto ao lado diz o
// que o ícone diz (estado nunca só por cor nem só por ícone).
const DESENHOS = {
  ciente: ['M4.25 12.75l4.75 4.75L19.75 6.5'],
  atencao: ['M12 3.75l9 15.5H3z', 'M12 9.25v5', 'M12 15.75v1.75'],
  baixo: ['M6.5 9.25L12 14.75l5.5-5.5'],
} as const;

export type NomeDoIcone = keyof typeof DESENHOS;

export function Icone({ nome }: { nome: NomeDoIcone }) {
  return (
    <svg className={`ico ico-${nome}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {DESENHOS[nome].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

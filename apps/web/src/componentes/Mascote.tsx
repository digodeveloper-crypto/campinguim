// O mascote principal (DESIGN.md, seção 8): a arte do pacote final, sem redesenho
// (apps/web/public/mascote/LEIA-ME.md). No escuro fica sobre o papel de canto cortado (estilos.css,
// `.apoio`). No máximo um mascote por página. O nome falado vem do arquivo de textos.
import { textos } from '../textos';

export function Mascote({ tamanho }: { tamanho: number }) {
  return (
    <span className="apoio">
      <img className="mascote" src="/mascote/principal.svg" alt={textos.mascote.principal} width={tamanho} height={tamanho} />
    </span>
  );
}

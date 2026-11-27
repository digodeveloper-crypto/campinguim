// Curvas de nível do topo (DESIGN.md, seção 5; tela 15 do protótipo). O desenho sai do mesmo
// gerador do app (apps/mobile/src/componentes/geradorCurvas.ts, arquivo puro), com os mesmos
// parâmetros da tela 15. Decorativas: escondidas do leitor de tela.
import { caminhosDasCurvas, type OpcoesCurvas } from '../../../mobile/src/componentes/geradorCurvas';

export function Curvas({ opcoes }: { opcoes: Partial<OpcoesCurvas> }) {
  const { largura, altura, caminhos } = caminhosDasCurvas(opcoes);
  return (
    <svg
      className="curvas"
      viewBox={`0 0 ${String(largura)} ${String(altura)}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {caminhos.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

// Caixa de marcar (tela 15 do protótipo, `.check`; DESIGN.md 7.5): um campo de marcar de verdade,
// para teclado e leitor de tela, com a caixa desenhada de 44 px e o ícone "ciente" quando marcada.
// O rótulo inteiro é o alvo do toque.
import { Icone } from './Icone';

export function CaixaDeMarcar({
  rotulo,
  marcada,
  aoMudar,
  descritaPor,
}: {
  rotulo: string;
  marcada: boolean;
  aoMudar: (marcada: boolean) => void;
  descritaPor?: string;
}) {
  return (
    <label className="check">
      <input
        className="check-campo"
        type="checkbox"
        checked={marcada}
        onChange={(e) => aoMudar(e.target.checked)}
        aria-describedby={descritaPor}
      />
      <span className="check-caixa" aria-hidden="true">
        <Icone nome="ciente" />
      </span>
      <span className="check-texto">{rotulo}</span>
    </label>
  );
}

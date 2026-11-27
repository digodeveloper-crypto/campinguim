// Mensagem anunciada (DESIGN.md 7.6): ícone e texto, nunca só cor. `aria-live` faz o leitor de tela
// ler a resposta sem mudar o foco. Erro usa o papel "atenção".
import { Icone } from './Icone';

export type TipoDeMensagem = 'ok' | 'erro' | 'info';

export function Mensagem({ tipo, texto, id }: { tipo: TipoDeMensagem | null; texto: string; id?: string }) {
  return (
    <p className={`mensagem${tipo ? ` mensagem--${tipo}` : ''}`} id={id} role="status" aria-live="polite">
      {tipo && texto ? <Icone nome={tipo === 'ok' ? 'ciente' : 'atencao'} /> : null}
      {texto ? <span>{texto}</span> : null}
    </p>
  );
}

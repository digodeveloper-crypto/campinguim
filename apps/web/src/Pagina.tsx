import { textos } from './textos';

// Página provisória da B1: só prova que a página gera, abre no navegador do celular e é testada
// nos motores do Android e do iPhone. A página do convidado de verdade é da feature 2.4.
export function Pagina() {
  const t = textos.pagina;
  return (
    <main className="pagina" data-testid="pagina-provisoria">
      <section className="cartao">
        <h1>{t.titulo}</h1>
        <p className="subtitulo">{t.subtitulo}</p>
        <p className="detalhe">{t.detalhe}</p>
      </section>
    </main>
  );
}

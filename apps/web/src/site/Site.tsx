// Página inicial do site (feature 1.12; SPEC, seção 7, tela 15; DESIGN.md 11.3): o que é, o
// mascote, uma lista de exemplo para ver e a lista de espera. Sem dado de camping (DEF-02), sem
// selo nem link de loja (DESIGN.md 13), sem endereço provisório escrito (SPEC, seção 14).
import { useMemo } from 'react';

import { Curvas } from '../componentes/Curvas';
import { Mascote } from '../componentes/Mascote';
import { Recolhivel } from '../componentes/Recolhivel';
import { ReguaWeb, type SecaoDaRegua } from '../componentes/ReguaWeb';
import { t as texto, textos } from '../textos';
import { FormularioDeEspera } from './FormularioDeEspera';
import { listaDeExemplo } from './listaDeExemplo';

const t = textos.site;

const SECOES: readonly SecaoDaRegua[] = [
  { id: 'oque', rotulo: t.reguaOQueE },
  { id: 'lista', rotulo: t.reguaLista },
  { id: 'espera', rotulo: t.reguaEspera },
];

// Mesmos parâmetros da tela 15 do protótipo (design/prototipos/rumo/15-site.html).
const CURVAS_DO_TOPO = { w: 358, h: 260, cx: 179, cy: 190, aneis: 9, r0: 22, passo: 16, sx: 1.7, sy: 0.8, fase: 1.1 };

const O_QUE_FAZ = [t.oQueFaz1, t.oQueFaz2, t.oQueFaz3, t.oQueFaz4, t.oQueFaz5];

export function Site() {
  const categorias = useMemo(() => listaDeExemplo(), []);
  return (
    <main className="rumo web" data-testid="site">
      <ReguaWeb rotulo={t.reguaRotulo} secoes={SECOES} />

      <section className="secao site-heroi" id="oque" aria-labelledby="oque-titulo">
        <div className="abertura-mapa">
          <Curvas opcoes={CURVAS_DO_TOPO} />
          <Mascote tamanho={136} />
        </div>
        <h1 className="marca-nome" id="oque-titulo">
          {textos.app.nome}
        </h1>
        <p className="abertura-frase">{t.oQueE}</p>
      </section>

      <section className="secao" aria-labelledby="faz-titulo">
        <h2 className="bloco-titulo" id="faz-titulo">
          {t.oQueFazTitulo}
        </h2>
        <ul className="folha">
          {O_QUE_FAZ.map((frase) => (
            <li key={frase} className="linha">
              <span className="linha-texto">{frase}</span>
            </li>
          ))}
        </ul>
        <p className="em-breve suave">{t.emBreve}</p>
      </section>

      <section className="secao" id="lista" aria-labelledby="lista-titulo">
        <h2 className="bloco-titulo" id="lista-titulo">
          {t.listaPronta}
        </h2>
        <p className="subtitulo">{t.listaResumo}</p>
        <p className="suave">{t.listaIntro}</p>
        {categorias.map((c) => (
          <Recolhivel
            key={c.chave}
            cabeca={
              <>
                <span className="cat-nome">{c.nome}</span>
                <span className="cat-prog">{texto('site.itens', { n: c.linhas.length })}</span>
              </>
            }
          >
            <ul className="folha" data-categoria={c.chave}>
              {c.linhas.map((l) => (
                <li key={l.chave} className="linha">
                  <span className="linha-texto">{l.nome}</span>
                  {l.quantidade ? <span className="linha-qtd suave">{l.quantidade}</span> : null}
                </li>
              ))}
            </ul>
          </Recolhivel>
        ))}
      </section>

      <section className="secao" id="espera" aria-labelledby="espera-titulo">
        <h2 className="bloco-titulo" id="espera-titulo">
          {t.listaDeEspera}
        </h2>
        <p className="espera-explica">{t.esperaExplica}</p>
        <FormularioDeEspera />
      </section>
    </main>
  );
}

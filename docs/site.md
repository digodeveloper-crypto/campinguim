# Site do Campinguim: página inicial e lista de espera

Feature **1.12** (27/11/2026), partes A (página) e B (servidor), locais. A publicação (parte C) é tarefa separada: o que ela precisa está em `docs/infra.md`, seção "Site e lista de espera (feature 1.12)". O servidor está em `docs/servidor.md`, seção 14.

## O que a página mostra

Fiel à tela 15 do protótipo Rumo (`design/prototipos/rumo/15-site.html`) e ao DESIGN.md 11.3:

- **Régua de seções** fixa no topo: O que é · Lista pronta · Lista de espera; a seção na tela fica sublinhada e anunciada (`aria-current`).
- **O que é:** curvas de nível, o mascote `principal` em 136 px (a única arte da página; sobre o papel de canto cortado no escuro), o letreiro e a frase do que o Campinguim faz. Depois, o que o app faz **na 0.1.0** e uma linha "Em breve" com o que ainda não existe (lista dividida com o grupo, o que o camping tem). Nada da etapa 3 aparece como existente.
- **Lista pronta:** a lista da viagem de referência da SPEC, seção 9 (barraca com carro, 2 noites, 2 adultos, 2 crianças, 1 pet, frio, sem chuva), gerada no navegador pelo `gerarLista` do core com o catálogo de `packages/content`. Categorias recolhíveis, fechadas, com a contagem de itens; só nome e quantidade, sem marcação, sem etiqueta "depende do camping" e sem dado de camping (DEF-02).
- **Lista de espera:** explica que o Campinguim manda **um único e-mail, quando o app estiver na loja**, e nada além. Campo "Seu e-mail", caixa de consentimento **obrigatória** e o botão. Erros com ícone e texto, anunciados; falha de rede não apaga o e-mail.

## Regras

| Regra | Onde |
| --- | --- |
| Textos só no arquivo de textos (`apps/web/src/textos/pt-BR.json`, grupo `site`) | Lint `react/jsx-no-literals`; `apps/mobile/src/textos/textos.test.ts` |
| Consentimento e política: **rascunho marcado** (`[PENDENTE] Rascunho, não aprovado: ...`, V6). A página mostra o consentimento sem a marca técnica, com "Rascunho, não aprovado:" visível. A política não aparece (P-18) | `site.consentimento`, `site.politicaDePrivacidade` |
| Com o consentimento em rascunho, o formulário só funciona no ambiente local (sem `producao.servidor` em `config/enderecos.json`); fora dele, a seção diz "A lista de espera abre em breve." | `formularioLiberado`, `apps/web/src/site/listaDeEspera.ts` |
| Endereço do servidor só de `config/enderecos.json`; chave pública só na geração (`vite.config.ts`) | `apps/web/src/config.ts`; `npm run enderecos`; `arquivos.test.ts` |
| Campo armadilha: escondido da tela, do teclado e do leitor de tela; preenchido, a página mostra "Pronto" e não chama o servidor. Sem captcha | `FormularioDeEspera.tsx`; `site.spec.ts` |
| Nada guardado no navegador (sem `localStorage`, cookie, IndexedDB) | `arquivos.test.ts`; `site.spec.ts` |
| `noindex, nofollow`, sem mapa do site nem `robots.txt` enquanto o endereço for provisório | `apps/web/index.html`; `arquivos.test.ts` |
| Mascote e fonte Archivo: cópias byte a byte, com licença | `apps/web/public/`; `arquivos.test.ts` |

## Elementos web

Em `apps/web/src/componentes/`, para a página do convidado (2.4) reutilizar: `ReguaWeb`, `Recolhivel` (categoria), `CaixaDeMarcar`, `Mensagem` (anunciada, com ícone), `Icone` (ciente, atenção, baixo), `Curvas` (mesmo gerador do app, `apps/mobile/src/componentes/geradorCurvas.ts`), `Mascote`. Estilos em `apps/web/src/estilos.css`, fora do bloco de cores gerado.

## Testes

- Unitários (Vitest, projeto `core`): `apps/web/src/site/listaDeEspera.test.ts`, `listaDeExemplo.test.ts`, `arquivos.test.ts`.
- Página (Playwright, Chromium com Pixel 7 e WebKit com iPhone 15): `e2e/web/site.spec.ts`. A resposta do servidor é simulada. Com `EVIDENCIAS=1`, as capturas vão também para `docs/evidencias/1.12/`.
- Servidor: `supabase/testes/lista-de-espera.test.ts`.

## Observações para o piloto

1. **68 × 69 itens.** O cartão cita "68 itens na lista da família, como na tela 15 do protótipo". O `gerarLista` do core, com a viagem de referência e o catálogo atual (11 categorias), devolve **69** (65 itens e 4 tarefas). A página mostra o que o core gera; o teste compara com o core, não com um número escrito. A diferença vem do catálogo de 11 categorias decidido depois do protótipo (12 categorias, contagem de 68 em `design/prototipos/direcao/telas.md`).
2. **Nomes das categorias** vêm do catálogo (`packages/content`), como os nomes dos itens. As chaves `categorias.*` do arquivo de textos da página ainda são as 12 antigas: a 1.2 as corrige (P8), e esta feature não as tocou.
3. **Quantidade escrita** ("36 L em 8 galões de 5 L", "12 (3 por pessoa)") é montada na página com três textos do grupo `site`. Quando a 1.2 tiver o formatador de quantidade do app, a página pode passar a usá-lo.

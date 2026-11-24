# Protótipo 5 · Roda (DSG-01 a DSG-13) · rodada 2 · APROVADO

Data: 2026-11-24 · Entregue por: pane-604 · Base: `roda-rodada-1.md` (2 itens e 3 observações)

**Resumo:** os dois itens foram corrigidos.
- A criação da viagem tem "Voltar" para a abertura, e o camping sem dados tem "Voltar" para a criação da viagem, mantendo o "Mural".
- Em 200 %, os monogramas cabem com folga nos emblemas.

As três observações também foram atendidas. A nova medição completa das 96 combinações está limpa.

**Evidências** em `qa/relatorios/roda-r2/`: `medicao/`, com `prototipo.py` nas 16 páginas × 2 temas × 3 fontes; `01-200.png`.

| Item | Resultado | Como conferi |
| --- | --- | --- |
| 1. Voltar nas telas 2 e 13 | ok: 2 → "Voltar" → 1; 2 → Sítio Pedra Lisa → 13 → "Voltar" → 2; o "Mural" continua na 13 (13 → Mural → Nossa lista → 4) | `qa/navegar.py` |
| 2. Monograma em 200 % | ok: na abertura, o emblema tem 59 px e o monograma de 31 a 34 px em 130 e 200 %; nas outras telas, o emblema cresce com a letra (por exemplo, 112 px com monograma de 63 px em 200 %). Nenhum monograma encosta no contorno | medição no DOM, `01-200.png` |
| Observações | atendidas: os cabeçalhos leem "Abrigo, 6 de 6 no carro"; "Lembrar quem falta" sem `aria-pressed`; rodapé mais baixo em 200 % | DOM, capturas |
| Sem regressão | ok: 0 erro, 0 pedido externo, 0 alvo pequeno, 0 texto abaixo do contraste, 0 palavra partida e 0 rolagem lateral nas 96 combinações; 68 de 68 itens iguais a `dados.js`; amostra de ligações certa. O único vão acusado é de conteúdo que passa por baixo do rodapé fixo (tela 8, em 130 %) | `medicao.txt`, `qa/conferir_lista.py`, `qa/navegar.py` |

O resto continua como conferido na rodada 1 (`roda-rodada-1.md`).

Falta: `pronta: true` em `roda/ficha.js`, e a etapa 3.

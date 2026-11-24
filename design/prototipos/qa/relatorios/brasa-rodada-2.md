# Protótipo 1 · Brasa (DSG-01 a DSG-13) · rodada 2 · APROVADO

Data: 2026-11-24 · Entregue por: pane-596 · Base: `brasa-rodada-1.md` (2 itens e 2 observações)

**Resumo:** os dois itens foram corrigidos.
- Com letra ampliada, o traço da alça fica acima do "fechar" e não o cruza mais.
- O leitor de tela diz a ação junto com o item ("eu levo: Isqueiro", "ciente: Som até 22h", "desfazer: Extensão de 20 m").

As duas observações também foram atendidas: com letra ampliada, a metade de cima ficou mais baixa, o título da folha aparece sem rolar e o mascote só tem `width`. A nova medição completa das 96 combinações está limpa.

**Evidências** em `qa/relatorios/brasa-r2/`: `medicao/`, com `prototipo.py` nas 16 páginas × 2 temas × 3 fontes; `06-200-escuro.png`.

| Item | Resultado | Como conferi |
| --- | --- | --- |
| 1. Alça × "fechar" em 130 e 200 % | ok: o traço não cruza o botão em nenhuma das 6 folhas com "fechar" (telas 2, 5, 6, 8, 10 e 13), em 130 e 200 % | interseção das caixas no DOM; `06-200-escuro.png` |
| 2. Nomes repetidos | ok: 0 nome repetido nas telas 3, 4, 8, 9, 11, 12, 13 e 14 (depois de "Entrar"). Tela 3: "desfazer: Extensão de 20 m", "desfazer: Grelha portátil", "desfazer: Conferir os aparelhos", "ciente: Som até 22h", "ciente: Piscina abre às 10h". Telas 11 e 14: "eu levo: Isqueiro" e "eu levo: Saco de lixo" | nomes acessíveis no DOM |
| Observações | atendidas: em 200 %, a tela 6 mostra "Ficou fora do carro" sem rolar; o mascote só tem `width` | captura, `estilo.css` |
| Sem regressão | ok: 0 erro, 0 pedido externo, 0 alvo pequeno, 0 texto abaixo do contraste, 0 palavra partida e 0 rolagem lateral nas 96 combinações; 68 de 68 itens iguais a `dados.js`; amostra de ligações certa. Os vãos acusados são de conteúdo que passa por baixo do botão fixo da folha | `medicao.txt`, `qa/conferir_lista.py`, `qa/navegar.py` |

O resto continua como conferido na rodada 1 (`brasa-rodada-1.md`).

Falta: `pronta: true` em `brasa/ficha.js`, e, na etapa 3, a comparação lado a lado com as outras direções (3.16).

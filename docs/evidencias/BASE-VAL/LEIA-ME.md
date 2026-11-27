# Evidências da BASE-VAL

- `suite-completa.txt`: `npm run testar -- --exigir-completa` no ramo da feature (7 de 7 etapas, 713 testes unitários, 109 do servidor, 2 da página web, manifesto do APK sem pulo), código de saída 0.
- `app-gerar.txt`: fim da saída de `npm run app:gerar` (APK gerado antes da suíte, sem erro). O registro completo foi reduzido porque traz caminhos da máquina de quem gerou.

A primeira rodada da suíte falhou só na trava de segredos, porque o registro completo do build tinha caminho da máquina; foi reduzido e a suíte rodou de novo, inteira.

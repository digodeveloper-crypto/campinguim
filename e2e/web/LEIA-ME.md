# Testes da página web (navegador automático)

Rodam com Playwright, em tela de celular, nos motores do Android (Chromium, perfil Pixel 7) e do iPhone (WebKit, perfil iPhone 15) (GIT-17). Configuração: `playwright.config.ts` na raiz. Entram no `npm run testar`.

Cada arquivo `*.spec.ts` é um fluxo. Textos conferidos vêm do arquivo de textos da página (`apps/web/src/textos/pt-BR.json`), nunca copiados para o teste. Capturas e rastros de falha ficam em `test-results/web/` (fora do git).

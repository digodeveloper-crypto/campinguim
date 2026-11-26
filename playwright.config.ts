import { defineConfig, devices } from '@playwright/test';

import enderecos from './config/enderecos.json' with { type: 'json' };

// Testes da página web em navegador automático com tela de celular, nos motores do Android
// (Chromium) e do iPhone (WebKit) (GIT-17; SPEC, seção 13). Sobem a página gerada (vite preview)
// na porta do arquivo de configuração.
const local = enderecos.local;
const base = `http://${local.servidorNoComputador}:${local.portaWeb}`;

export default defineConfig({
  testDir: 'e2e/web',
  outputDir: 'test-results/web',
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  reporter: [['list']],
  use: { baseURL: base, locale: 'pt-BR', trace: 'retain-on-failure' },
  projects: [
    { name: 'android-chromium', use: { ...devices['Pixel 7'] } },
    { name: 'iphone-webkit', use: { ...devices['iPhone 15'] } },
  ],
  webServer: {
    command: 'npm run gerar --workspace apps/web && npm run previa --workspace apps/web',
    url: base,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});

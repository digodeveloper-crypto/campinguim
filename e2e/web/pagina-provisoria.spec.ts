// Fumaça da página web provisória (B1): abre no navegador do celular, mostra os textos do arquivo
// de textos, sem erro no console e sem rolagem para o lado. A página do convidado é da feature 2.4.
import { expect, test } from '@playwright/test';

import textos from '../../apps/web/src/textos/pt-BR.json' with { type: 'json' };

test('a página provisória abre com os textos do arquivo de textos', async ({ page }, info) => {
  const erros: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') erros.push(m.text());
  });
  page.on('pageerror', (e) => erros.push(e.message));

  await page.goto('/');
  await expect(page.getByTestId('pagina-provisoria')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(textos.pagina.titulo);
  await expect(page.getByText(textos.pagina.subtitulo)).toBeVisible();
  await expect(page.getByText(textos.pagina.detalhe)).toBeVisible();
  await expect(page).toHaveTitle(textos.pagina.tituloDaAba);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');

  const larguras = await page.evaluate(() => ({ conteudo: document.documentElement.scrollWidth, tela: window.innerWidth }));
  expect(larguras.conteudo).toBeLessThanOrEqual(larguras.tela);
  expect(erros).toEqual([]);

  await page.screenshot({ path: info.outputPath('pagina-provisoria.png'), fullPage: true });
});

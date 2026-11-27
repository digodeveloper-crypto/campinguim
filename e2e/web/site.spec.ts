// Página inicial do site (feature 1.12; SPEC, seção 7, tela 15; GIT-17): nos motores do Android
// (Chromium, Pixel 7) e do iPhone (WebKit, iPhone 15). A resposta do servidor da lista de espera é
// SIMULADA aqui (o servidor é testado em supabase/testes/lista-de-espera.test.ts). Textos vêm do
// arquivo de textos da página, nunca copiados para o teste.
//
// Capturas: sempre em test-results/web/. Com EVIDENCIAS=1 no ambiente, também em
// docs/evidencias/1.12/ (é como as evidências da entrega foram geradas).
import path from 'node:path';

import { expect, type Page, type Route, test, type TestInfo } from '@playwright/test';

import enderecos from '../../config/enderecos.json' with { type: 'json' };
import textos from '../../apps/web/src/textos/pt-BR.json' with { type: 'json' };

const t = textos.site;
const local = enderecos.local;
const producao = enderecos.producao as { servidor: string | null };
const FUNCAO = `${producao.servidor ?? `http://${local.servidorNoComputador}:${String(local.portaApi)}`}/rest/v1/rpc/waitlist_join`;
const EMAIL = 'pessoa-do-site@pessoas-de-teste.test';
const CONSENTIMENTO = t.consentimento.replace(/^\[PENDENTE\]\s*/, '');

async function capturar(page: Page, info: TestInfo, nome: string) {
  await page.screenshot({ path: info.outputPath(`${nome}.png`) });
  if (process.env.EVIDENCIAS === '1') {
    await page.screenshot({ path: path.join('docs', 'evidencias', '1.12', `${info.project.name}-${nome}.png`) });
  }
}

type Chamada = { url: string; corpo: unknown; apikey: string | null };

/** Simula a função do servidor. Devolve a lista de chamadas recebidas (fora o pré-voo do navegador). */
async function simularServidor(page: Page, resposta: (r: Route) => Promise<void>): Promise<Chamada[]> {
  const chamadas: Chamada[] = [];
  const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST' };
  await page.route('**/rest/v1/rpc/waitlist_join', async (route) => {
    const req = route.request();
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    chamadas.push({ url: req.url(), corpo: req.postDataJSON() as unknown, apikey: await req.headerValue('apikey') });
    return resposta(route);
  });
  return chamadas;
}

const responder = (corpo: unknown) => (route: Route) =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: { 'access-control-allow-origin': '*' },
    body: JSON.stringify(corpo),
  });

async function semRolagemParaOLado(page: Page) {
  const l = await page.evaluate(() => ({ conteudo: document.documentElement.scrollWidth, tela: window.innerWidth }));
  expect(l.conteudo).toBeLessThanOrEqual(l.tela);
}

async function preencher(page: Page, email: string, aceitar: boolean) {
  await page.getByRole('textbox', { name: t.seuEmail }).fill(email);
  if (aceitar) await page.getByRole('checkbox', { name: CONSENTIMENTO }).check();
}

const enviar = (page: Page) => page.getByRole('button', { name: t.entrarNaListaDeEspera }).click();
const resposta = (page: Page) => page.locator('#espera-resposta');

test.describe('página inicial do site', () => {
  test('abre com o que é, o mascote, a lista de exemplo e a lista de espera, sem erro e sem rolagem para o lado', async ({ page }, info) => {
    const erros: string[] = [];
    const pedidos: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error') erros.push(m.text());
    });
    page.on('pageerror', (e) => erros.push(e.message));
    page.on('request', (r) => pedidos.push(r.url()));

    await page.goto('/');
    await expect(page).toHaveTitle(t.tituloDaAba);
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(textos.app.nome);
    await expect(page.getByText(t.oQueE)).toBeVisible();
    const mascote = page.getByRole('img', { name: textos.mascote.principal });
    await expect(mascote).toHaveCount(1);
    await expect(mascote).toBeVisible();
    expect(await mascote.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    expect((await mascote.boundingBox())?.width).toBe(136);

    for (const frase of [t.oQueFaz1, t.oQueFaz2, t.oQueFaz3, t.oQueFaz4, t.oQueFaz5, t.emBreve]) await expect(page.getByText(frase)).toBeVisible();
    await expect(page.getByRole('heading', { name: t.listaPronta })).toBeVisible();
    await expect(page.getByRole('heading', { name: t.listaDeEspera })).toBeVisible();
    await expect(page.getByText(t.esperaExplica)).toBeVisible();

    await semRolagemParaOLado(page);
    await capturar(page, info, '01-topo');

    // Nada vai ao servidor só por abrir a página (nada de dado de camping, nada guardado).
    expect(pedidos.filter((u) => u.includes('/rest/v1/'))).toEqual([]);
    expect(erros).toEqual([]);
  });

  test('a lista de exemplo tem 11 categorias recolhíveis, com a contagem de itens, só para ver', async ({ page }, info) => {
    await page.goto('/#lista');
    const categorias = page.locator('#lista .cat-botao');
    await expect(categorias).toHaveCount(11);
    for (const botao of await categorias.all()) {
      await expect(botao).toHaveAttribute('aria-expanded', 'false');
      await expect(botao).toContainText(/\d+ ite(m|ns)$/);
    }
    // Abre "Comida e bebida": a água vem com litros e galões, como na tela 4.
    const comida = categorias.filter({ hasText: 'Comida e bebida' });
    await comida.click();
    await expect(comida).toHaveAttribute('aria-expanded', 'true');
    const folha = page.locator('[data-categoria="comida_bebida"]');
    await expect(folha).toBeVisible();
    await expect(folha.getByText('36 L em 8 galões de 5 L')).toBeVisible();
    const n = Number((await comida.textContent())?.match(/(\d+) ite/)?.[1]);
    await expect(folha.locator('li')).toHaveCount(n);
    // Só leitura: nenhuma caixa, botão nem estado de marcação dentro da lista.
    await expect(page.locator('#lista input, #lista li button')).toHaveCount(0);
    for (const estado of Object.values(textos.estados)) await expect(page.locator('#lista').getByText(estado, { exact: true })).toHaveCount(0);
    await comida.scrollIntoViewIfNeeded();
    await capturar(page, info, '02-lista-de-exemplo');
    await comida.click();
    await expect(folha).toBeHidden();
  });

  test('nenhum dado de camping aparece (DEF-02) e não há selo nem link de loja', async ({ page }) => {
    await page.goto('/');
    const texto = (await page.locator('body').innerText()).toLowerCase();
    for (const proibido of ['recanto', 'pedra lisa', 'chuveiro', 'google play', 'app store', 'baixar']) expect(texto).not.toContain(proibido);
    await expect(page.locator('a[href^="http"]')).toHaveCount(0);
  });

  test('a régua de seções leva a cada seção e marca a atual', async ({ page }) => {
    await page.goto('/');
    const regua = page.getByRole('navigation', { name: t.reguaRotulo });
    await expect(regua.getByRole('link')).toHaveText([t.reguaOQueE, t.reguaLista, t.reguaEspera]);
    await regua.getByRole('link', { name: t.reguaEspera }).click();
    await expect(page.getByRole('heading', { name: t.listaDeEspera })).toBeInViewport();
    await expect(regua.getByRole('link', { name: t.reguaEspera })).toHaveAttribute('aria-current', 'true');
    await regua.getByRole('link', { name: t.reguaLista }).click();
    await expect(page.getByRole('heading', { name: t.listaPronta })).toBeInViewport();
    await expect(regua.getByRole('link', { name: t.reguaLista })).toHaveAttribute('aria-current', 'true');
  });

  test('alvos de toque com pelo menos 44 px', async ({ page }) => {
    await page.goto('/');
    const alvos = [
      page.getByRole('navigation', { name: t.reguaRotulo }).getByRole('link'),
      page.locator('.cat-botao'),
      page.locator('.check-caixa'),
      page.getByRole('textbox', { name: t.seuEmail }),
      page.getByRole('button', { name: t.entrarNaListaDeEspera }),
    ];
    for (const grupo of alvos) {
      for (const alvo of await grupo.all()) {
        const caixa = await alvo.boundingBox();
        expect(caixa?.height ?? 0).toBeGreaterThanOrEqual(44);
      }
    }
  });
});

test.describe('lista de espera', () => {
  test('e-mail vazio, e-mail inválido e caixa desmarcada mostram o erro com ícone, e nada é enviado', async ({ page }, info) => {
    const chamadas = await simularServidor(page, responder({ ok: true }));
    await page.goto('/#espera');

    await enviar(page);
    await expect(resposta(page)).toHaveText(t.emailVazio);
    await expect(resposta(page).locator('svg.ico-atencao')).toHaveCount(1);
    await expect(page.getByRole('textbox', { name: t.seuEmail })).toBeFocused();
    await expect(page.getByRole('textbox', { name: t.seuEmail })).toHaveAttribute('aria-invalid', 'true');
    await capturar(page, info, '03-email-vazio');

    await preencher(page, 'pessoa sem arroba', false);
    await enviar(page);
    await expect(resposta(page)).toHaveText(t.emailInvalido);

    await preencher(page, EMAIL, false);
    await enviar(page);
    await expect(resposta(page)).toHaveText(t.marqueACaixa);
    await expect(resposta(page).locator('svg.ico-atencao')).toHaveCount(1);
    await capturar(page, info, '04-sem-consentimento');

    expect(chamadas).toEqual([]);
  });

  test('com e-mail e consentimento, envia ao endereço da configuração e mostra "Pronto"', async ({ page }, info) => {
    const chamadas = await simularServidor(page, responder({ ok: true }));
    await page.goto('/#espera');
    await expect(page.getByRole('checkbox', { name: CONSENTIMENTO })).not.toBeChecked();
    await preencher(page, `  ${EMAIL.toUpperCase()} `, true);
    await enviar(page);
    await expect(resposta(page)).toHaveText(t.listaDeEsperaOk);
    await expect(resposta(page).locator('svg.ico-ciente')).toHaveCount(1);
    await expect(resposta(page)).toHaveAttribute('aria-live', 'polite');
    expect(chamadas.map((c) => ({ url: c.url, corpo: c.corpo }))).toEqual([{ url: FUNCAO, corpo: { p_email: EMAIL, p_consent: true } }]);
    // A chave pública vai no cabeçalho (o valor vem da geração da página, nunca do código).
    expect(typeof chamadas[0]?.apikey).toBe('string');
    await capturar(page, info, '05-pronto');

    // Nada guardado no navegador.
    expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, '']);
  });

  test('falha de rede mostra o que fazer e não apaga o e-mail; tentar de novo funciona', async ({ page }, info) => {
    let falhar = true;
    const chamadas = await simularServidor(page, (route) => (falhar ? route.abort('internetdisconnected') : responder({ ok: true })(route)));
    await page.goto('/#espera');
    await preencher(page, EMAIL, true);
    await enviar(page);
    await expect(resposta(page)).toHaveText(t.semConexao);
    await expect(resposta(page).locator('svg.ico-atencao')).toHaveCount(1);
    await expect(page.getByRole('textbox', { name: t.seuEmail })).toHaveValue(EMAIL);
    await expect(page.getByRole('checkbox', { name: CONSENTIMENTO })).toBeChecked();
    await capturar(page, info, '06-sem-conexao');

    falhar = false;
    await enviar(page);
    await expect(resposta(page)).toHaveText(t.listaDeEsperaOk);
    expect(chamadas).toHaveLength(2);
  });

  test('acima do limite do servidor, avisa para tentar depois', async ({ page }) => {
    await simularServidor(page, responder({ ok: false, code: 'rate_limited' }));
    await page.goto('/#espera');
    await preencher(page, EMAIL, true);
    await enviar(page);
    await expect(resposta(page)).toHaveText(t.muitasTentativas);
  });

  test('e-mail recusado pelo servidor aparece como e-mail inválido', async ({ page }) => {
    await simularServidor(page, responder({ ok: false, code: 'validation' }));
    await page.goto('/#espera');
    await preencher(page, EMAIL, true);
    await enviar(page);
    await expect(resposta(page)).toHaveText(t.emailInvalido);
  });

  test('campo armadilha preenchido (robô): finge que enviou e não chama o servidor', async ({ page }) => {
    const chamadas = await simularServidor(page, responder({ ok: true }));
    await page.goto('/#espera');
    const armadilha = page.locator('input[name="empresa"]');
    await expect(armadilha).not.toBeInViewport();
    await expect(armadilha).toHaveAttribute('tabindex', '-1');
    await expect(page.locator('.armadilha')).toHaveAttribute('aria-hidden', 'true');
    await armadilha.fill('Empresa de robôs', { force: true });
    await preencher(page, EMAIL, true);
    await enviar(page);
    await expect(resposta(page)).toHaveText(t.listaDeEsperaOk);
    expect(chamadas).toEqual([]);
  });

  test('funciona só com o teclado: e-mail, caixa (sem passar pela armadilha) e botão', async ({ page }) => {
    const chamadas = await simularServidor(page, responder({ ok: true }));
    await page.goto('/#espera');
    await page.getByRole('textbox', { name: t.seuEmail }).focus();
    await page.keyboard.type(EMAIL);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('checkbox', { name: CONSENTIMENTO })).toBeFocused();
    await page.keyboard.press('Space');
    await expect(page.getByRole('checkbox', { name: CONSENTIMENTO })).toBeChecked();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: t.entrarNaListaDeEspera })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(resposta(page)).toHaveText(t.listaDeEsperaOk);
    expect(chamadas).toHaveLength(1);
  });
});

test.describe('tema e letra', () => {
  for (const [tema, fundo] of [
    ['light', 'rgb(220, 232, 226)'],
    ['dark', 'rgb(12, 22, 21)'],
  ] as const) {
    test(`tema ${tema === 'light' ? 'claro' : 'escuro'} do sistema`, async ({ page }, info) => {
      await page.emulateMedia({ colorScheme: tema });
      await page.goto('/');
      expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(fundo);
      await semRolagemParaOLado(page);
      await capturar(page, info, `07-tema-${tema === 'light' ? 'claro' : 'escuro'}`);
    });
  }

  for (const escala of [130, 200]) {
    test(`letra em ${String(escala)} %: nada corta nem rola para o lado`, async ({ page }, info) => {
      await page.goto('/');
      await page.addStyleTag({ content: `html { font-size: ${String(escala)}%; }` });
      await semRolagemParaOLado(page);
      await expect(page.getByText(t.oQueE)).toBeVisible();
      await page.goto('/#espera');
      await page.addStyleTag({ content: `html { font-size: ${String(escala)}%; }` });
      await page.getByRole('button', { name: t.entrarNaListaDeEspera }).scrollIntoViewIfNeeded();
      await semRolagemParaOLado(page);
      await expect(page.getByRole('checkbox', { name: CONSENTIMENTO })).toBeAttached();
      await capturar(page, info, `08-letra-${String(escala)}`);
    });
  }
});

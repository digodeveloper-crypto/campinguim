// Regras do repositório que valem para toda feature (CLAUDE.md; GIT-05, GIT-08; pontos J5, J6, J14
// e J23 da prova técnica, docs/prova-tecnica/resultado.md).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { arquivosDoRepositorio, RAIZ } from '../seguranca/verificar-enderecos.mjs';

const ler = (rel: string) => fs.readFileSync(path.join(RAIZ, rel), 'utf8');
const PASTAS_DE_CODIGO = ['apps/', 'packages/', 'supabase/', 'e2e/', 'scripts/', '.github/', '.githooks/'];
const codigo = arquivosDoRepositorio()
  .map((rel) => rel.replaceAll('\\', '/'))
  .filter((rel) => PASTAS_DE_CODIGO.some((p) => rel.startsWith(p)))
  .filter((rel) => /\.(?:m?[jt]sx?|cjs|ya?ml|json|jsonc|sh)$/.test(rel) || rel.startsWith('.githooks/'));

describe('package.json (J14)', () => {
  const pacotes = ['package.json', ...arquivosDoRepositorio().filter((r) => /^(apps|packages)\/[^/]+\/package\.json$/.test(r.replaceAll('\\', '/')))];

  it('existem os pacotes da estrutura da SPEC, seção 2', () => {
    expect(pacotes.map((p) => p.replaceAll('\\', '/')).sort()).toEqual([
      'apps/mobile/package.json',
      'apps/web/package.json',
      'package.json',
      'packages/content/package.json',
      'packages/core/package.json',
    ]);
  });

  it.each(pacotes)('%s declara "type"', (rel) => {
    expect(JSON.parse(ler(rel)).type).toMatch(/^(module|commonjs)$/);
  });
});

describe('emuladores (J23)', () => {
  // Montados por partes para este arquivo não se achar.
  const proibidos = [['kill', 'server'], ['start', 'server']].map((p) => p.join('-'));

  it('nenhum script derruba ou reinicia o servidor do adb', () => {
    const achados = codigo.filter((rel) => proibidos.some((p) => ler(rel).includes(p)));
    expect(achados).toEqual([]);
  });

  it('todo comando do adb passa pelo módulo que exige o aparelho (-s emulator-<porta>)', () => {
    const chamadasDiretas = codigo.filter(
      (rel) => rel !== 'scripts/android.mjs' && /\b(?:spawn|spawnSync|execFile|execFileSync|exec|execSync)\(\s*(?:ADB\b|['"`]adb(?:\.exe)?['"`])/.test(ler(rel)),
    );
    expect(chamadasDiretas).toEqual([]);
    expect(ler('scripts/android.mjs')).toMatch(/\['-s', serial/);
  });
});

describe('o que é só da prova técnica não vem para a base (J5, J6)', () => {
  it('o login do Supabase local não usa o prazo de 180 s da prova', () => {
    const config = ler('supabase/config.jsonc');
    const prazo = /"jwt_expiry":\s*(\d+)/.exec(config)?.[1];
    expect(Number(prazo)).toBeGreaterThanOrEqual(3600);
  });

  it('sem login por link com token, sem atraso artificial e sem botões de teste', () => {
    // Montados por partes para este arquivo não se achar.
    const trechos = [['entrar', '?t='], ['prova', '_ajuste'], ['Gerar', ' 200'], ['Medir', ' 20']].map((p) => p.join(''));
    const achados = codigo.filter((rel) => trechos.some((t) => ler(rel).includes(t)));
    expect(achados).toEqual([]);
  });
});

describe('.gitignore (GIT-08)', () => {
  it.each(['.env.local', '.env', 'apps/mobile/android/app/build.gradle', 'node_modules/x/index.js', 'chave.keystore', 'release.jks', '.segredos-locais', '.claude/settings.json', 'rascunhos/nota.md', 'supabase/.temp/x', 'test-results/x.png'])(
    'ignora %s',
    (rel) => {
      expect(() => execFileSync('git', ['check-ignore', '-q', '--no-index', rel], { cwd: RAIZ })).not.toThrow();
    },
  );

  it('não ignora o modelo de credenciais locais', () => {
    expect(() => execFileSync('git', ['check-ignore', '-q', '--no-index', '.env.local.exemplo'], { cwd: RAIZ })).toThrow();
  });
});

describe('esteira do GitHub só em marca de versão (GIT-05)', () => {
  const workflows = fs.readdirSync(path.join(RAIZ, '.github', 'workflows')).filter((f) => /\.ya?ml$/.test(f));

  it('há um único workflow', () => {
    expect(workflows).toEqual(['versao.yml']);
  });

  it('dispara só com etiqueta v*', () => {
    const texto = ler('.github/workflows/versao.yml');
    const gatilho = /^on:\n((?:[ ]{2}.*\n)+)/m.exec(texto)?.[1] ?? '';
    expect(gatilho.replace(/#.*$/gm, '').replace(/\s+/g, ' ').trim()).toBe("push: tags: - 'v*'");
    for (const outro of ['pull_request', 'branches', 'schedule', 'workflow_dispatch', 'workflow_run', 'repository_dispatch']) {
      expect(texto).not.toMatch(new RegExp(`^\\s*${outro}:`, 'm'));
    }
  });
});

describe('hook de pré-commit (GIT-08)', () => {
  it('chama a trava de segredos sobre o conteúdo preparado', () => {
    expect(ler('.githooks/pre-commit')).toContain('verificar-segredos.mjs --preparados');
  });
});

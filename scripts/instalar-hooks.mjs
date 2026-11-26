// Liga os hooks do repositório (pasta .githooks) no git deste clone. Roda sozinho no `npm install`
// (script "prepare"). O hook de pré-commit chama a trava de segredos (GIT-08).
import { spawnSync } from 'node:child_process';

const dentroDoGit = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], { encoding: 'utf8' });
if (dentroDoGit.status !== 0 || process.env.CI) {
  // Fora de um clone (pacote baixado) ou na esteira: não há hook para ligar.
  process.exit(0);
}
const r = spawnSync('git', ['config', 'core.hooksPath', '.githooks'], { encoding: 'utf8' });
if (r.status !== 0) {
  console.error('[hooks] não consegui ligar a pasta .githooks:', r.stderr.trim());
  process.exit(1);
}
console.log('[hooks] pré-commit ligado (core.hooksPath = .githooks)');

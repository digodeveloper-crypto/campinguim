// Testes da trava de segredos (GIT-08). Os segredos falsos são montados por partes em tempo de
// execução, para este próprio arquivo não ser barrado pela trava.
import { describe, expect, it } from 'vitest';

import { verificarNome, verificarTexto } from '../seguranca/verificar-segredos.mjs';

const j = (...partes: string[]) => partes.join('');

function regras(caminho: string, texto: string, termosPessoais: string[] = []) {
  return verificarTexto(caminho, texto, { termosPessoais }).map((a: { regra: string }) => a.regra);
}

describe('verificarTexto: chaves e tokens', () => {
  it.each([
    ['jwt', j('ey', 'JhbGciOiJIUzI1NiJ9', '.', 'ey', 'JzdWIiOiIxMjM0NTY3ODkwIn0', '.', 'abcdefghijklmnopqrstuv')],
    ['chave-supabase', j('sb_', 'secret_', 'AbCdEfGhIjKlMnOpQrSt')],
    ['chave-supabase', j('sb_', 'publishable_', 'AbCdEfGhIjKlMnOpQrSt')],
    ['service-role', j('SUPABASE_SERVICE_ROLE_KEY', '=', 'abcdefghijklmnopqrstuvwxyz0123')],
    ['chave-sk', j('s', 'k-', 'proj-', 'abcdefghijklmnopqrstuvwx1234')],
    ['chave-aws', j('AK', 'IA', 'ABCDEFGHIJKLMNOP')],
    ['token-github', j('gh', 'p_', 'a'.repeat(36))],
    ['chave-google', j('AI', 'za', 'B'.repeat(35))],
    ['chave-privada-pem', j('-----BEGIN ', 'RSA ', 'PRIVATE KEY-----')],
    ['chave-privada-pem', j('-----BEGIN ', 'PRIVATE KEY-----')],
    ['endereco-de-banco-com-senha', j('postgresql://', 'postgres:', 'umaSenhaQualquer', '@127.0.0.1:5432/postgres')],
  ])('barra %s', (regra, texto) => {
    expect(regras('src/qualquer.ts', `const x = "${texto}";`)).toContain(regra);
  });

  it('deixa passar endereço de banco com a senha mascarada ou em variável', () => {
    expect(regras('docs/a.md', j('postgresql://', 'postgres:', '***', '@db:5432/postgres'))).toEqual([]);
    expect(regras('a.yaml', j('uri: postgresql://', 'postgres:', '${SENHA}', '@db:5432/postgres'))).toEqual([]);
  });

  it('barra senha escrita em arquivo de configuração, mas não valor de modelo', () => {
    expect(regras('config/servico.yaml', j('pass', 'word: ', 'umaSenhaLonga123'))).toContain('senha-ou-chave-em-configuracao');
    expect(regras('config/servico.yaml', j('pass', 'word: ', '!env SENHA_DO_BANCO'))).toEqual([]);
    expect(regras('config/servico.yaml', j('secret: ', 'env(SEGREDO)'))).toEqual([]);
  });

  it('barra modelo .env.exemplo com valor preenchido e aceita o vazio', () => {
    expect(regras('.env.local.exemplo', 'SUPABASE_CHAVE_PUBLICA=valor-de-verdade-123')).toContain('modelo-env-com-valor');
    expect(regras('.env.local.exemplo', 'SUPABASE_CHAVE_PUBLICA=\n# comentário')).toEqual([]);
  });

  it('não acusa código comum', () => {
    const codigo = [
      "const token = await obterToken();",
      "export const senhaMinima = 8;",
      "// chave pública do Supabase local vem de .env.local",
      "import { createClient } from '@supabase/supabase-js';",
    ].join('\n');
    expect(regras('src/login.ts', codigo)).toEqual([]);
  });
});

describe('verificarTexto: dados pessoais', () => {
  it('barra e-mail pessoal e aceita os de exemplo, teste e noreply', () => {
    expect(regras('docs/a.md', j('fulano', '@', 'gmail.com'))).toContain('email-pessoal');
    expect(regras('docs/a.md', j('a', '@', 'usuarios-prova.test'))).toEqual([]);
    expect(regras('docs/a.md', j('pessoa', '@', 'example.com'))).toEqual([]);
    expect(regras('docs/a.md', j('123+conta', '@', 'users.noreply.github.com'))).toEqual([]);
    expect(regras('docs/a.md', j('noreply', '@', 'anthropic.com'))).toEqual([]);
  });

  it('barra caminho com nome de usuário do Windows e aceita os marcadores', () => {
    const barra = String.fromCharCode(92);
    expect(regras('docs/a.md', ['C:', 'Users', 'Fulano', 'AppData'].join(barra))).toContain('caminho-com-usuario');
    expect(regras('docs/a.md', ['C:', 'Users', 'Fulano'].join('/'))).toContain('caminho-com-usuario');
    expect(regras('docs/a.md', ` ${['/c', 'Users', 'Fulano', 'x'].join('/')}`)).toContain('caminho-com-usuario');
    expect(regras('docs/a.md', ['C:', 'Users', '<usuário>', 'AppData'].join(barra))).toEqual([]);
    expect(regras('docs/a.md', ['%USERPROFILE%', '.android'].join(barra))).toEqual([]);
  });

  it('barra termo pessoal da máquina (nome do usuário, nome real) como palavra inteira', () => {
    expect(regras('docs/a.md', 'feito na máquina do Fulano-PC', ['Fulano-PC'])).toContain('termo-pessoal');
    expect(regras('docs/a.md', 'nada pessoal aqui', ['Fulano-PC'])).toEqual([]);
  });

  it('é rápido em linha longa sem espaço (imagem em base64)', () => {
    const inicio = Date.now();
    regras('a.js', `const img = "${'A'.repeat(300_000)}";`);
    expect(Date.now() - inicio).toBeLessThan(2_000);
  });
});

describe('verificarNome', () => {
  it.each(['.env', '.env.local', 'apps/mobile/.env.producao', 'chave.jks', 'release.keystore', 'certificado.pem', 'privada.key', 'android/app/google-services.json', '.segredos-locais'])(
    'barra %s',
    (nome) => {
      expect(verificarNome(nome).length).toBeGreaterThan(0);
    },
  );

  it.each(['.env.local.exemplo', '.env.example', 'src/ambiente.ts', 'docs/infra.md'])('aceita %s', (nome) => {
    expect(verificarNome(nome)).toEqual([]);
  });
});

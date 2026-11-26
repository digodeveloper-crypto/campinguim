// Leitura das credenciais locais (prova/.env.local, fora do git) e dados fixos da prova.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const RAIZ_PROVA = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export function lerEnvLocal() {
  const arquivo = path.join(RAIZ_PROVA, '.env.local');
  if (!fs.existsSync(arquivo)) {
    throw new Error('falta prova/.env.local: rode antes "node prova/prova.mjs subir"');
  }
  const valores = {};
  for (const linha of fs.readFileSync(arquivo, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(linha);
    if (m) valores[m[1]] = m[2];
  }
  for (const k of ['SUPABASE_URL_LOCAL', 'SUPABASE_DB_URL_LOCAL', 'SUPABASE_CHAVE_PUBLICA', 'SUPABASE_CHAVE_SERVICO']) {
    if (!valores[k]) throw new Error(`falta ${k} em prova/.env.local`);
  }
  return valores;
}

// Usuários de teste. E-mails num domínio reservado para teste (.test), sem pessoa real.
// As senhas ficam só em prova/.env.local (SENHA_TESTE_A, _B, _C).
export const USUARIOS = {
  A: { email: 'a@usuarios-prova.test', nome: 'Pessoa A' },
  B: { email: 'b@usuarios-prova.test', nome: 'Pessoa B' },
  C: { email: 'c@usuarios-prova.test', nome: 'Pessoa C' },
  // D e E: só para os testes automáticos das regras de sincronização (F0-2), para não misturar
  // as viagens desses testes com as de A e B.
  D: { email: 'd@usuarios-prova.test', nome: 'Pessoa D' },
  E: { email: 'e@usuarios-prova.test', nome: 'Pessoa E' },
};

// Identificadores fixos, para os roteiros e os links das provas.
export const VIAGEM_AB = '1f0a0b00-0000-4000-8000-0000000000ab';
export const VIAGEM_C = '1f0a0c00-0000-4000-8000-00000000000c';

// Uma família por pessoa de teste (F0-2: quem assumiu um item do grupo é a família).
export const FAMILIAS = {
  A: '1f0a0b00-0000-4000-8000-0000000fa001',
  B: '1f0a0b00-0000-4000-8000-0000000fb001',
  C: '1f0a0c00-0000-4000-8000-0000000fc001',
  D: '1f0a0d00-0000-4000-8000-0000000fd001',
  E: '1f0a0e00-0000-4000-8000-0000000fe001',
};

// Portas da prova, lidas do único valor de configuração (prova/config/enderecos.json).
export const ENDERECOS_PROVA = JSON.parse(fs.readFileSync(path.join(RAIZ_PROVA, 'config', 'enderecos.json'), 'utf8'));

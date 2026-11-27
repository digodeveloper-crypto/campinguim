/// <reference types="node" />
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import enderecos from '../../config/enderecos.json' with { type: 'json' };

// Endereço e porta do servidor de desenvolvimento vêm do único valor de configuração.
const { servidorNoComputador: host, portaWeb: port } = enderecos.local;

// Chave PÚBLICA do Supabase, que a página manda ao chamar `waitlist_join` (a mesma que o app
// carrega; nunca a chave de serviço, DEF-09). Na publicação (tarefa C da 1.12) vem da variável
// CAMPINGUIM_CHAVE_PUBLICA do ambiente de publicação; na máquina, de `.env.local` na raiz (fora do
// git; criado por `npm run ambiente:subir`). Sem nenhuma das duas, fica vazia e o servidor recusa.
function chavePublica(): string {
  if (process.env.CAMPINGUIM_CHAVE_PUBLICA) return process.env.CAMPINGUIM_CHAVE_PUBLICA;
  const arquivo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '.env.local');
  if (!fs.existsSync(arquivo)) return '';
  for (const linha of fs.readFileSync(arquivo, 'utf8').split(/\r?\n/)) {
    const m = /^\s*SUPABASE_CHAVE_PUBLICA\s*=\s*(.*)\s*$/.exec(linha);
    if (m?.[1]) return m[1].replace(/^["']|["']$/g, '');
  }
  return '';
}

export default defineConfig({
  plugins: [react()],
  define: { __CHAVE_PUBLICA__: JSON.stringify(chavePublica()) },
  server: { host, port, strictPort: true },
  preview: { host, port, strictPort: true },
  build: { sourcemap: false },
});

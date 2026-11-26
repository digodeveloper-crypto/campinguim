import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import enderecos from '../../config/enderecos.json' with { type: 'json' };

// Endereço e porta do servidor de desenvolvimento vêm do único valor de configuração.
const { servidorNoComputador: host, portaWeb: port } = enderecos.local;

export default defineConfig({
  plugins: [react()],
  server: { host, port, strictPort: true },
  preview: { host, port, strictPort: true },
  build: { sourcemap: false },
});

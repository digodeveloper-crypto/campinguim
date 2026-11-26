import { defineConfig } from 'vitest/config';

// Testes em TypeScript do monorepo, separados por projeto para o `npm run testar` poder rodar ou
// pular cada camada (SPEC, seção 13):
//   core     regras puras (packages/core), sem rede nem tela
//   scripts  travas do repositório (segredos, endereços, adb) e ferramentas de teste
//   servidor contra o Supabase e o PowerSync locais em Docker (precisa de `npm run ambiente:subir`)
export default defineConfig({
  test: {
    projects: [
      { test: { name: 'core', include: ['packages/core/src/**/*.test.ts'], environment: 'node' } },
      { test: { name: 'scripts', include: ['scripts/testes/**/*.test.ts'], environment: 'node' } },
      {
        test: {
          name: 'servidor',
          include: ['supabase/testes/**/*.test.ts'],
          environment: 'node',
          testTimeout: 30_000,
          fileParallelism: false,
        },
      },
    ],
  },
});

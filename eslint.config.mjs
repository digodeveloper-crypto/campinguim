// Lint do monorepo inteiro (ESLint 9, configuração plana). Roda em `npm run lint` e dentro de
// `npm run testar`, sem aviso tolerado (--max-warnings=0).
import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // Fora do lint: dependências, saídas geradas e pastas que não são código do app
    // (a prova técnica fica como registro histórico, sem mudança).
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.expo/**',
      'apps/mobile/android/**',
      'apps/mobile/ios/**',
      'apps/mobile/expo-env.d.ts',
      'prova/**',
      'design/**',
      'videos/**',
      'roteiros/**',
      'docs/**',
      'supabase/.temp/**',
      'test-results/**',
      'playwright-report/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      eqeqeq: ['error', 'always'],
      'no-console': 'off',
    },
  },
  {
    // Scripts e testes em Node
    files: ['**/*.mjs', '**/*.cjs', 'scripts/**', 'e2e/**', 'supabase/**', '*.config.ts'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ['**/*.cjs'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    // Telas do app e da página web
    files: ['apps/**/*.tsx'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: { globals: { ...globals.browser } },
    settings: { react: { version: '19.3' } },
    rules: {
      ...react.configs.flat.recommended?.rules,
      ...react.configs.flat['jsx-runtime']?.rules,
      ...reactHooks.configs.recommended.rules,
      // Textos da interface só no arquivo de textos (CLAUDE.md, regra 5): nenhuma frase escrita
      // direto como conteúdo do JSX. Propriedades (testID, className, estilos) ficam livres; textos em
      // propriedades (accessibilityLabel, placeholder) seguem a mesma regra por revisão do QA.
      'react/jsx-no-literals': ['error', { noStrings: true, ignoreProps: true, allowedStrings: [] }],
    },
  },
);

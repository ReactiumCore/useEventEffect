import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    // No browser or Node globals: the library has to run unchanged in
    // React DOM and React Native, so it may only use language built-ins
    files: ['**/*.{js,ts,tsx}'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      parserOptions: { sourceType: 'module' },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    // TypeScript: the same unused-variable rule, from typescript-eslint
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.recommended],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { varsIgnorePattern: '^[A-Z_]' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    // Tests run in Node (with jsdom) under Vitest
    files: ['test/**', '**/*.test.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.node, ...globals.vitest },
    },
  },
  {
    // Config files run in Node
    files: ['*.config.{js,ts}'],
    languageOptions: { globals: globals.node },
  },
  // Turns off ESLint rules that conflict with Prettier
  prettier,
  // Re-enable semicolons after the Prettier config (matches "semi": true)
  {
    plugins: { '@stylistic': stylistic },
    rules: {
      '@stylistic/semi': ['error', 'always'],
    },
  },
]);

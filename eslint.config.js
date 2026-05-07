import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import { defineConfig, globalIgnores } from 'eslint/config';

const fsdLayers = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];

export default defineConfig([
  globalIgnores(['dist', 'build', 'node_modules']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      boundaries,
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
    },
    languageOptions: {
      globals: globals.browser,
    },
    settings: {
      'boundaries/elements': fsdLayers.map((layer) => ({
        type: layer,
        pattern: `src/${layer}/**`,
        mode: 'folder',
      })),
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'import/no-internal-modules': [
        'error',
        {
          allow: [
            '**/src/app',
            '**/src/pages',
            '**/src/widgets',
            '**/src/features',
            '**/src/entities',
            '**/src/shared',
            '@app',
            '@pages',
            '@widgets',
            '@features',
            '@entities',
            '@shared',
            '@app/App',
            '@app/layouts',
            '@shared/api',
            '@shared/config',
            '@shared/icons',
            '@shared/lib',
            '@shared/ui',
            '@shared/types',
            '@app/providers',
            '@app/router',
            'react-dom/client',
            '@hookform/resolvers/zod',
            '**/*.css',
            '**/*.scss',
          ],
        },
      ],
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: { type: 'app' },
              allow: { to: { type: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'] } },
            },
            {
              from: { type: 'pages' },
              allow: { to: { type: ['pages', 'widgets', 'features', 'entities', 'shared'] } },
            },
            {
              from: { type: 'widgets' },
              allow: { to: { type: ['widgets', 'features', 'entities', 'shared'] } },
            },
            {
              from: { type: 'features' },
              allow: { to: { type: ['features', 'entities', 'shared'] } },
            },
            {
              from: { type: 'entities' },
              allow: { to: { type: ['entities', 'shared'] } },
            },
            {
              from: { type: 'shared' },
              allow: { to: { type: 'shared' } },
            },
          ],
        },
      ],
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000', '^.+\\.(css|scss)$'],
            ['^react$', '^@?\\w'],
            ['^@app(?:/.*)?$', '^@pages(?:/.*)?$', '^@widgets(?:/.*)?$'],
            ['^@features(?:/.*)?$', '^@entities(?:/.*)?$', '^@shared(?:/.*)?$'],
            ['^\\.'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      'import/order': 'off',
      'sort-imports': 'off',
    },
  },
  eslintConfigPrettier,
]);

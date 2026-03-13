const eslint = require('@eslint/js');
const globals = require('globals');

module.exports = [
  {
    ignores: ['dist/', 'node_modules/'],
  },
  eslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        structuredClone: 'readonly',
      },
    },
    rules: {
      'no-await-in-loop': 'off',
      'no-param-reassign': ['error', { props: false }],
      'no-unused-vars': ['error', { caughtErrors: 'none', varsIgnorePattern: '^_' }],
      'no-use-before-define': 'off',
    },
  },
  {
    // Test file configuration.
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.mocha,
      },
    },
  },
];

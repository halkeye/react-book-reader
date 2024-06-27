module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  settings: {
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:promise/recommended',
    'plugin:unicorn/recommended',
    'plugin:eslint-comments/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:jsx-a11y/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: [
    'react-refresh',
    'promise',
    'unicorn',
    'eslint-comments',
    'import',
    'no-only-tests',
    'jsx-a11y',
  ],
  rules: {
    'no-only-tests/no-only-tests': 'error',
    'object-shorthand': ['error', 'methods'],
    '@typescript-eslint/array-type': ['error', { default: 'generic' }],
    'prefer-template': 'error',
    'no-useless-concat': 'error',
    'guard-for-in': 'error',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // turn off for now, once everything compiles do a mass rename
    'unicorn/filename-case': 'off',
    'unicorn/prevent-abbreviations': [
      'error',
      {
        allowList: {
          ev: true, // event is reserved
          func: true, // function is reserved
          Props: true,
          getInitialProps: true,
        },
      },
    ],
  },
};

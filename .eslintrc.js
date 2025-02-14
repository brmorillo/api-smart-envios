module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  env: {
    node: true,
    es6: true,
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended', // Deve ser o último
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    'prettier/prettier': [
      'error',
      {
        tabWidth: 2,
        useTabs: false,
        singleQuote: true,
        trailingComma: 'all',
        semi: true,
        printWidth: 80,
        endOfLine: 'lf',
      },
    ],
  },
};

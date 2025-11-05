module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    jest: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'script'
  },
  rules: {
    'comma-dangle': 'off',
    'space-before-function-paren': 'off',
    semi: 'off',
    quotes: 'off',
    'no-multiple-empty-lines': 'off',
    'padded-blocks': 'off',
    'arrow-parens': 'off',
    'generator-star-spacing': 'off',
    'no-mixed-spaces-and-tabs': 'off',
    'no-trailing-spaces': 'off',
    'object-curly-spacing': 'off',
    'array-bracket-spacing': 'off',
    'key-spacing': 'off',
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'n/no-process-exit': 'off'
  }
};

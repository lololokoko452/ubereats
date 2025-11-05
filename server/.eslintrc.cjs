module.exports = {
  env: {
    node: true,
    es2022: true,
    jest: true
  },
  extends: ['standard'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'script'
  },
  rules: {
    // Les scripts CLI terminent parfois le process explicitement.
    'n/no-process-exit': 'off'
  }
};

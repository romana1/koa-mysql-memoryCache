module.exports = {

  env: {
    node: true,
    es6: true,
    jasmine: true
  },

  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
  },

  // The Rules (Keep them sorted)
  extends: 'eslint:recommended',
  rules: {
    'comma-spacing': 'error',
    'eol-last': 'error',
    // 'max-len': ['error', 90],
    'no-console': 'off',
    'no-multi-spaces': 'error',
    'prefer-const': 'error',
    'semi': 'error',
    'space-before-function-paren': ['error', {
      'anonymous': 'always',
      'asyncArrow': 'always',
      'named': 'never',
    }],
  },

};

module.exports = {
  parserOptions: {
    ecmaVersion: 2017,
  },
  env: {
    node: true,
    mocha: true,
  },
  extends: 'google',
  rules: {
    'comma-dangle': [2, 'always-multiline'],
  }
}

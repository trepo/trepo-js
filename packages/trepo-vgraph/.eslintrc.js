module.exports = {
  parser: 'babel-eslint',
  env: {
    node: true,
    mocha: true,
  },
  extends: 'google',
  rules: {
    'comma-dangle': [2, 'always-multiline'],
  },
};

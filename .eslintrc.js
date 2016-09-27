module.exports = {
  parser: 'babel-eslint',
  plugins: [
    "babel",
  ],
  env: {
    node: true,
    mocha: true,
  },
  extends: 'google',
  rules: {
    'comma-dangle': [2, 'always-multiline'],
    'arrow-parens': 0, // Until eslint supports async functions
    'babel/arrow-parens': [2, 'as-needed'],
  }
}

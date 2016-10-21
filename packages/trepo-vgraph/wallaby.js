var path = require('path');
process.env.NODE_PATH = path.join(__dirname, '../../node_modules');

module.exports = wallaby => {
  return {
    files: [
      'src/**/*.js',
      {pattern: 'src/**/*.test.js', ignore: true},
    ],

    tests: [
      'src/**/*.test.js',
    ],

    compilers: {
      '**/*.js': wallaby.compilers.babel({babel: require('babel-core')}),
    },

    testFramework: 'mocha',

    env: {
      type: 'node',
    },
  };
};

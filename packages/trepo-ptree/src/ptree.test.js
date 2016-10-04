const {expect} = require('chai');
const ptree = require('./ptree.js');

describe('ptree', () => {
  it('should export an object', () => {
    expect(ptree).to.be.instanceOf(Object);
  });
});

const {expect} = require('chai');
const Prop = require('./prop.js');

describe('label', () => {
  it('should have properly formatted keys', () => {
    for (let key of Object.keys(Prop)) {
      expect(/^[A-Z_]+$/.test(key)).to.equal(true);
    }
  });
});

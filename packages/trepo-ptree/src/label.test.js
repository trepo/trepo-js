const {expect} = require('chai');
const Label = require('./label.js');

describe('label', () => {
  it('should have properly formatted keys', () => {
    for (let key of Object.keys(Label)) {
      expect(/^[A-Z]+$/.test(key)).to.equal(true);
    }
  });
});

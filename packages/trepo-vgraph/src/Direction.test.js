import Direction from './Direction.js';

let expect = require('chai').expect;

describe('Direction', () => {
  it('should work', () => {
    expect(Direction.IN).to.equal('IN');
    expect(Direction.OUT).to.equal('OUT');
    expect(Direction.BOTH).to.equal('BOTH');
    expect(Object.keys(Direction).length).to.equal(3);
  });
});

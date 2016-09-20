import Util from './Util.js';

let expect = require('chai').expect;

describe('CommitNode', () => {

  it('isValidUUIDv4 should work', () => {
    expect(Util.isValidUUIDv4('f47ac10b-58cc-4372-a567-0e02b2c3d479'))
      .to.equal(true);
    expect(Util.isValidUUIDv4('1234')).to.equal(false);
    expect(Util.isValidUUIDv4(1234)).to.equal(false);
    expect(Util.isValidUUIDv4(null)).to.equal(false);
    expect(Util.isValidUUIDv4(undefined)).to.equal(false);
  });

  it('isValidSHA1 should work', () => {
    expect(Util.isValidSHA1('bf21a9e8fbc5a3846fb05b4fa0859e0917b2202f'))
      .to.equal(true);
    expect(Util.isValidSHA1('1234')).to.equal(false);
    expect(Util.isValidSHA1(1234)).to.equal(false);
    expect(Util.isValidSHA1(null)).to.equal(false);
    expect(Util.isValidSHA1(undefined)).to.equal(false);
  });

  it('isValidLabel should work', () => {
    expect(Util.isValidLabel('label'))
      .to.equal(true);
    expect(Util.isValidLabel('label0')).to.equal(false);
    expect(Util.isValidLabel('_label')).to.equal(false);
    expect(Util.isValidLabel('@bad')).to.equal(false);
    expect(Util.isValidLabel('')).to.equal(false);

    // Get a 255 character string
    let str = '';
    for (let i = 0; i < 255; i++) {
      str += 'a';
    }
    expect(Util.isValidLabel(str)).to.equal(true);
    expect(Util.isValidLabel(str + 'a')).to.equal(false);

  });

  it('isValidPropertyKey should work', () => {
    expect(Util.isValidPropertyKey('key')).to.equal(true);
    expect(Util.isValidPropertyKey('_invalid')).to.equal(false);

    // Get a 255 character string
    let str = '';
    for (let i = 0; i < 255; i++) {
      str += 'a';
    }
    expect(Util.isValidPropertyKey(str)).to.equal(true);
    expect(Util.isValidPropertyKey(str + 'a')).to.equal(false);

  });

  it('isValidPropertyValue should work', () => {
    expect(Util.isValidPropertyValue(true)).to.equal(true);
    expect(Util.isValidPropertyValue([true, false])).to.equal(true);
    expect(Util.isValidPropertyValue(123.456)).to.equal(true);
    expect(Util.isValidPropertyValue([1, 2.5, 3e10])).to.equal(true);
    expect(Util.isValidPropertyValue('string')).to.equal(true);
    expect(Util.isValidPropertyValue(['foo'])).to.equal(true);
    expect(Util.isValidPropertyValue([])).to.equal(true);

    expect(Util.isValidPropertyValue(undefined)).to.equal(false);
    expect(Util.isValidPropertyValue(null)).to.equal(false);
    expect(Util.isValidPropertyValue(function() { })).to.equal(false);
    expect(Util.isValidPropertyValue(/regex/)).to.equal(false);
    expect(Util.isValidPropertyValue({})).to.equal(false);
    expect(Util.isValidPropertyValue({foo: 'bar'})).to.equal(false);
    expect(Util.isValidPropertyValue([true, 1, 'string'])).to.equal(false);
    expect(Util.isValidPropertyValue([{foo: 'bar'},
      {foo: 'b'}])).to.equal(false);

  });

  it('isValidRepo should work', () => {
    expect(Util.isValidRepo('http://localhost:8080/repo')).to.equal(true);
    expect(Util.isValidRepo('')).to.equal(false);

    // Get a 255 character string
    let str = '';
    for (let i = 0; i < 255; i++) {
      str += 'a';
    }
    expect(Util.isValidRepo(str)).to.equal(true);
    expect(Util.isValidRepo(str + 'a')).to.equal(false);

  });

  it('getProperties should work', () => {
    expect(Util.getProperties({
        __label: 'label',
        foo: 'bar',
        prop: true,
        arr: [1,2,3]
      })).to.deep.equal({
        foo: 'bar',
        prop: true,
        arr: [1,2,3]
      });
  });

  it('generateUUIDv4 should work', () => {
    expect(Util.isValidUUIDv4(Util.generateUUIDv4())).to.equal(true);
  });

  it('calculateHash should work', () => {
    expect(Util.calculateHash({}))
      .to.equal('bf21a9e8fbc5a3846fb05b4fa0859e0917b2202f');

    expect(Util.calculateHash({
      d: true,
      b: null,
      e: 'string',
      a: [1, 2, 3]
    })).to.equal('2cc41debd9a6019aae585eff7d2cd2f5154f4939');
  });

});

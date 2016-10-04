const {expect} = require('chai');
const func = require('./create.js');
const {VGraph, Node} = require('trepo-vgraph');

let vGraph;

describe('person - create', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo');
    await vGraph.init();
  });

  it('should create a person', async () => {
    const person = await func({vGraph});
    expect(person).to.have.all.keys('_node', 'label');
    expect(person._node).to.be.instanceOf(Node);
    expect(person.label).to.equal('Person');
  });
});

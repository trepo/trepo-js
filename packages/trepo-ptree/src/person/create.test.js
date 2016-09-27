const {expect} = require('chai');
const func = require('./create.js');
const {VGraph} = require('trepo-vgraph');

let vGraph;

describe('person - create', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo');
    await vGraph.init();
  });

  it('should create a person', async () => {
    const node = await func({vGraph});
    const label = await node.getLabel();
    expect(label).to.equal('Person');
  });
});

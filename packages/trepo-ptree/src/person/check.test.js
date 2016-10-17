const {expect} = require('chai');
const func = require('./check.js');
const {VGraph} = require('trepo-vgraph');

let vGraph;

describe('person - check', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo');
    await vGraph.init();
  });

  it('should ensure a place', async () => {
    const node = await vGraph.addNode('label');
    const id = await node.getId();
    try {
      await func({
        vGraph,
        id,
      });
    } catch (error) {
      expect(error.message).to.equal('Node Not Found');
    }
  });
});

const {expect} = require('chai');
const func = require('./delete.js');
const util = require('../util.js');
const Label = require('../label.js');
const {VGraph, Direction} = require('trepo-vgraph');

let vGraph;

describe('date - delete', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo');
    await vGraph.init();
  });

  it('should delete a date', async () => {
    const node = await vGraph.addNode('label');
    const place = await vGraph.addNode(Label.DATE);
    await vGraph.addEdge('edge', node, place);
    await func({
      vGraph,
      node,
      label: 'edge',
    });
    const dateNode = await util.getAdjacentNode({
      node,
      label: 'edge',
      direction: Direction.OUT,
    });
    expect(dateNode).to.equal(null);
  });
});

const {expect} = require('chai');
const func = require('./delete.js');
const util = require('../util.js');
const Label = require('../label.js');
const {VGraph, Direction} = require('trepo-vgraph');

let vGraph;

describe('place - delete', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo');
    await vGraph.init();
  });

  it('should delete a place', async () => {
    const node = await vGraph.addNode('label');
    const place = await vGraph.addNode(Label.PLACE);
    await vGraph.addEdge('edge', node, place);
    await func({
      vGraph,
      node,
      label: 'edge',
    });
    const placeNode = await util.getAdjacentNode({
      node,
      label: 'edge',
      direction: Direction.OUT,
    });
    expect(placeNode).to.equal(null);
  });
});

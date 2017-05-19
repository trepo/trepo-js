const {expect} = require('chai');
const func = require('./delete.js');
const util = require('../util.js');
const Label = require('../label.js');
const {VGraph, Direction} = require('@trepo/vgraph');
const db = require('memdown');

let vGraph;

describe('place - delete', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo', {db});
    await vGraph.init();
  });

  it('should delete a place', async () => {
    const node = await vGraph.addNode('label');
    const place = await vGraph.addNode(Label.PLACE);
    const id = await place.getId();
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

    try {
      await vGraph.getNode(id);
      throw new Error('should have errored');
    } catch (error) {
      expect(error.message).to.equal('Deleted');
    }
  });
});

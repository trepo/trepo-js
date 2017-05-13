const {expect} = require('chai');
const func = require('./ensure.js');
const util = require('../util.js');
const {VGraph, Direction} = require('trepo-vgraph');
const db = require('memdown');

let vGraph;

describe('place - ensure', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo', {db});
    await vGraph.init();
  });

  it('should ensure a place', async () => {
    const node = await vGraph.addNode('label');
    const place = await func({
      vGraph,
      node,
      label: 'edge',
      place: {name: 'my place'},
    });
    expect(place._node).to.not.equal(null);
    const placeNode = await util.getAdjacentNode({
      node,
      label: 'edge',
      direction: Direction.OUT,
    });
    expect(placeNode).to.not.equal(null);
    expect(placeNode._node).to.not.equal(undefined);
  });
});
